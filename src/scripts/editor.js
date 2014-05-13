//The editor HTML template
var $htmlTemplate = function(options) {
    var html =  '<div class="ed-container">' +
                '   <div class="ed-overlay">' +
                '   </div>' +
                '   <div class="ed-header">' +
                '        <div class="ed-header-inner">' +
                '        </div>' +
                '   </div>' +
                '   <div class="ed-content">' +
                '       <iframe class="ed-content-frame"></iframe>' +
                '   </div>' +
                '</div>';

    return $(html);
};


//The console helper
var C = {
    log: function() { },
    error: function() { },
    warn: function() { }
};

if (typeof(console) != 'undefined' && console.log) {
    C = console;
}


//The editor class
var Editor = function(opts) {
    this.options = opts;

    if (!this.options.stylesheets) {
        C.warn('Please specify at least one stylesheet');
    }
};


//The editor API
Editor.prototype = {
    isBound: false,
    isRendered: false,
    boundPlugins: [],
    buttons: [],

    //The editor is never really 'destroyed' it stays in the
    //same state but it's just hidden. When the 'bind' method
    //is called some values will reset and it will be visible
    unbind: function() {

    },

    //This method re-activates the editor after a call to 'unbind'
    bind: function() {
        var ed = this;

        //Since we have our own HTML engine we have to overwrite all
        //command you would normally use
        this.$frameDoc.find('body').keydown(function(e) {
            var info = Keys.info(e);

            //With an enter we generate a 'p' tag while with the
            //combination: Shift + Enter we generate a 'br' tag
            if (info.is('Shift + Enter')) {
                e.preventDefault();
                ed.insertAtCursor(ed.engine.lineBreak());
                ed.insertAtCursor(ed.engine.lineBreak());
            } else if (info.is('Enter')) {
                e.preventDefault();

                var range = ed.getRange(0);

                //When a regular enter is hit we create a new 'p' tag after the cursor
                if (range.endContainer.nodeName.toLowerCase() == 'p' ||
                    (range.endContainer.parentNode &&
                     range.endContainer.parentNode.nodeName.toLowerCase() == 'p')) {
                    var pnode = range.endContainer.parentNode.nodeName.toLowerCase() == 'p' ? 
                                range.endContainer.parentNode : 
                                range.endContainer,
                        contentNode = ed.engine.content(),
                        newNode = $(pnode).after(contentNode);

                    range.setStart(contentNode, 0);
                    range.setEnd(contentNode, 0);
                } 
                //When the user is in a list we create a new list-item after the current item
                else if (range.endContainer.parentNode &&
                           ['ul', 'ol', 'li'].indexOf(range.endContainer.parentNode.nodeName.toLowerCase()) > -1) {
                    var list = range.endContainer.parentNode;

                    //When the previous list-item is empty we just create a new linebreak (just like
                    //in a regular editor)
                    if (list.innerHTML.length === 0 || ['ul', 'ol'].indexOf(list.nodeName.toLowerCase()) > -1) {
                        var contentNode = ed.engine.content(),
                            newNode = $(list.nodeName.toLowerCase() == 'li' ? range.endContainer.parentNode.parentNode : range.endContainer.parentNode).after(contentNode);

                        range.setStart(contentNode, 0);
                        range.setEnd(contentNode, 0);
                    } else {
                        var contentNode = ed.engine.listItem(),
                            newNode = $(range.endContainer.parentNode).after(contentNode);

                        range.setStart(contentNode, 0);
                        range.setEnd(contentNode, 0);
                    }
                } else {
                    ed.insertAtCursor(ed.engine.content());
                    return;
                }

                var sel = ed.getSelection();

                sel.removeAllRanges();
                sel.addRange(range);
            }

            if (info.is('Ctrl + B')) {
                e.preventDefault();
                ed.toggleStyle('bold');
            }

            if (info.is('Ctrl + I')) {
                e.preventDefault();
                ed.toggleStyle('italic');
            }

            if (info.is('Ctrl + U')) {
                e.preventDefault();
                ed.toggleStyle('underline');
            }
        });
    },

    //Make the current selection (or word when nothing is selected) a certain 
    //style. When the selection is already a certain style remove the style it's tag
    //[bug]: This won't work if the element is a nested element, the fix would be to
    //use a recursive 'parentNode' lookup (with a maximum of course)
    toggleStyle: function(style) {
        var range = this.getRange();

        //Perform the action
        if (range.endContainer.parentNode &&
            this.engine.isElement(range.endContainer.parentNode, style, false)) {
            range = this.unsurroundCursor();
        } else {
            range = this.surroundCursor(this.engine[style]());
        }

        if (range) {
            //Select the nodes
            var sel = this.getSelection();

            sel.removeAllRanges();
            sel.addRange(range);
        }
    },

    //Show a certain overlay
    showScreen: function(html) {
        this.$overlay.addClass('active').html(html);
    },

    //Hide the overlay
    //[bug]: The change from display block to table is necessary but
    //       I don't know why..
    hideScreen: function() {
        var ed = this;

        this.$editor.css('display', 'block');

        setTimeout(function() {
            ed.$editor.css('display', 'table');
            ed.$overlay.removeClass('active').html('');
        }, 40);
    },

    //Add a button to the editor but don't bind it (yet)
    addButton: function(name, options) {
        this.buttons.push($.extend({
            icon: false,
            name: name,

            click: function() { },

            getElement: function() {
                var $icon = $('<i/>').addClass('fa fa-' + this.icon),
                    $link = $('<a/>').attr('href', '#').attr('title', this.name).addClass('ed-icon');

                return $link.append($icon);
            }
        }, options));
    },

    //Add a select-box to the editor but don't bind it (yet)
    addSelect: function(name, options) {
        this.buttons.push($.extend({
            icon: false,
            name: name,

            click: function() { },

            getElement: function() {
                var $div = $('<div/>').addClass('ed-select'),
                    $icon = $('<i/>').addClass('fa fa-angle-down'),
                    $span = $('<span/>').html(this.text || this.options[0].key);

                //Construct the elment
                $div.append($icon).append($span);

                //Now create the inner-select and their options
                var $innerDiv = $('<div/>').addClass('ed-select-inner');

                for (var x in this.options) {
                    var opt = this.options[x];

                    $innerDiv.append($('<div/>').addClass('ed-select-option').html(opt.key).data('opt', opt));
                }

                return $div.append($innerDiv);
            }
        }, options));
    },

    //Add an event to one of the elements of the editor
    addEvent: function(name, selector, fn) {
        this.$frameBody.on(name, selector, fn);
    },

    //Bind a certain button to the editor
    bindButton: function(name) {
        var btn = null;

        for (var x in this.buttons) {
            if (this.buttons[x].name == name) {
                btn = this.buttons[x];
                break;
            }
        }

        var btnElement = btn.getElement();

        if (btn && btnElement) {
            var ed = this,
                $btn = $(btnElement);

            this.$editorHeader.append($btn);

            if ($btn.hasClass('ed-select')) {
                $btn.hover(function(e) {
                    e.preventDefault();
                    $btn.find('.ed-select-inner').slideToggle(100);
                }, function(e) {
                    e.preventDefault();
                    $btn.find('.ed-select-inner').slideToggle(100);
                });

                $btn.find('.ed-select-option').click(function(e) {
                    btn.click.apply(btn, [$(this).data('opt'), ed, e]);
                });
            } else {
                $btn.click(function(e) {
                    e.preventDefault();
                    btn.click.apply(btn, [ed, e]);
                });
            }
        }
    },

    //Get a (not-so-cross-browser) selection
    getSelection: function() {
        //All 'regular' browsers
        if (window.getSelection) {
            return this.$frameDoc[0].getSelection();
        } else {
            C.error('Shitty browsers are currently not supported, sorry');
        }
    },

    //Get a certain range
    getRange: function(nr) {
        return this.getSelection().getRangeAt(nr ? nr : 0);
    },

    //With this method you can calculate a new offset containing only
    //one word of the entire text
    calculateWordOffset: function(text, start, end) {
        var ostart = 0,
            oend = 0;

        //Calculate the start-offset
        for (var i = start - 1; i >= 0; i--) {
            if (text[i] == ' ' || !text[i]) {
                ostart = text[i] == ' ' ? (i + 1) : i;
                break;
            }
        }

        //Calculate the end-offset
        for (var i = start; i >= end; i++) {
            if (text[i] == ' ' || !text[i] || i == text.length) {
                oend = i;
                break;
            }
        }

        return { startOffset: ostart, endOffset: oend };
    },

    //Remove the first parent-node of the selected text
    unsurroundCursor: function() {
        var range = this.getRange(0),
            node = range.endContainer.parentNode,
            newNode = range.endContainer,
            oldOffset = [range.startOffset, range.endOffset];

        if (node) {
            $(node).replaceWith(this.unwrap(node));
        }

        //Reset the offset
        range.selectNode(newNode);
        range.setStart(newNode, oldOffset[0]);
        range.setEnd(newNode, oldOffset[1]);

        return range;
    },

    //Unwrap a certain element
    unwrap: function(el) {
        $(el).contents().filter(function() {
            return this.nodeType === 3
        }).unwrap();
    },

    //Surround the cursor with a certain element. When there is no active
    //selection the word within the cursor it's position is used just like
    //a browser would normally work
    surroundCursor: function(html) {
        var range = this.getRange(0),
            node = $(html)[0];

        //Check for a single selection
        if ((range.startOffset - range.endOffset) === 0) {
            var offsets = this.calculateWordOffset($(range.endContainer).text(), range.startOffset, range.endOffset);

            //Set the range to our new range
            range.setStart(range.endContainer, offsets.startOffset);
            range.setEnd(range.endContainer, offsets.endOffset);
        }

        range.surroundContents(html);

        return range;
    },

    //Insert HTML at the current position of the cursor
    insertAtCursor: function(html) {
        var sel = this.getSelection(),
            range = sel.getRangeAt(0),
            node = $(html)[0];

        range.insertNode(node);
        range.setStart(node, 0);
        range.setEnd(node, 0);

        sel.removeAllRanges();
        sel.addRange(range);

        return range;
    },

    //Insert HTML after the position of the cursor (or actually after the
    //selected element)
    insertAfterCursor: function(html) {
        var sel = this.getSelection(),
            range = sel.getRangeAt(0),
            node = $(html)[0];

        $(range.endContainer).after(node);

        this.$frameBody.focus();

        range.setStart(node, 0);
        range.setEnd(node, 0);

        sel.removeAllRanges();
        sel.addRange(range);

        return range;
    },

    //Insert HTML after the position of the cursor (or actually after the
    //selected element) but use the content-element instead of the selected element
    insertAfterCursorElement: function(html) {
        var sel = this.getSelection(),
            range = sel.getRangeAt(0),
            node = $(html)[0],
            contentElement = this.engine.getContentNode(range.endContainer);

        if (contentElement) {
            $(contentElement).after(node);

            this.$frameBody.focus();

            range.setStart(node, 0);
            range.setEnd(node, 0);

            sel.removeAllRanges();
            sel.addRange(range);
        }

        return range;
    },

    //Delete the previous text and insert new HTML into the editor
    loadHtml: function(html) {
        this.$frameBody.html(this.engine.convert.toCode(html));
    },

    //Build the enitre 'head' tag from scripts and stylesheets
    buildHead: function(opts) {
        var head = '<title>Editor</title>';

        //Add our internal styles
        opts.styles.push('styles/font-awesome.min.css');
        opts.styles.push('styles/editor-inline.min.css');

        $.each(opts.styles, function() {
            head += '<link rel="stylesheet" type="text/css" href="' + this + '" />\n';
        });

        return head;
    },

    //Make a certain element editable
    makeEditable: function($el) {
        $el.attr('contentEditable', 'true').
            attr('designMode', 'on');
    },

    //Bind a plugin to the editor
    bindPlugin: function(plugin, renderAsButton) {
        if (this.boundPlugins[plugin.name]) {
            return false;
        }

        this.boundPlugins[plugin.name] = plugin;

        plugin.init.apply(plugin, [this]);

        return true;
    },

    //Don't call this method yourself, instead use the 'render' method
    __render: function(content) {
        content = content || '';
        var ed = this;

        //Setup the HTML engine
        this.engine = new HtmlEngine();

        //Render the HTML and set all elements
        this.$editor = $htmlTemplate(this.options);
        this.$editorHeader = this.$editor.find('.ed-header-inner');

        //Show our editor
        this.$element.hide();
        this.$element.after(this.$editor);

        //Do the rest..
        this.$frame = this.$editor.find('iframe');
        this.$frameDoc = $(this.$frame[0].contentWindow.document);
        this.$frameBody = this.$frameDoc.find('body');
        this.$overlay = this.$editor.find('.ed-overlay');
        this.$frameDoc.find('head').html(this.buildHead({
            styles: this.options.stylesheets,
            scripts: []
        }));

        //Bind the editor
        this.makeEditable(this.$frameDoc.find('body'));
        this.loadHtml(content);

        //Dispatch all plugins and buttons
        for (var x in this.options.plugins) {
            this.bindPlugin(this.plugins.get(this.options.plugins[x]));
        }

        for (var x in this.options.menu) {
            this.bindButton(this.options.menu[x]);
        }

        //Bind some events
        this.$editor.on('click', '.ed-close-overlay', function(e) {
            ed.hideScreen();
        });

        //This is a fix for the :focus selector since we don't make the elements editable but
        //instead the entire iframe (actually only the body tag)
        this.$frameBody.on('mouseup mousedown', function(e) {
            ed.$frameBody.find('.ed-element-focus').removeClass('ed-element-focus');

            $(ed.engine.getContentNode(e.target)).addClass('ed-element-focus');
        });

        this.$frameBody.on('keyup keydown', function(e) {
            var range = ed.getRange(0);

            ed.$frameBody.find('.ed-element-focus').removeClass('ed-element-focus');

            $(ed.engine.getContentNode(range.endContainer)).addClass('ed-element-focus');
        });

        this.bind();
    },

    //Find out which type of element we're dealing with and render
    //the editor
    render: function(el) {
        if (this.isRendered) {
            this.bind();
        } else {
            this.$element = el;

            //First load all plugins
            this.plugins = PluginManager;

            //Render all plugin-files
            for (var x in this.options.plugins) {
                this.plugins.loadPluginFile(this.options.plugins[x]);
                this.boundPlugins.push(x);
            }

            var ed = this;

            this.plugins.pluginLoadingDone = function() {
                if (ed.$element.is('textarea') || ed.$element.is('input')) {
                    ed.__render(ed.$element.val());
                } else {
                    ed.__render(ed.$element.html());
                }
            };
        }
    }
};


//The jQuery helper
$.fn.editify = function(options) {
    var opts = $.extend({
            menu: ['bold', 'italic', 'underline', 'styles'],
            plugins: ['basic_formatting', 'widgets']
        }, options),
        editor = null;

    $(this).each(function() {
        var $this = $(this);

        if ($this.data('jq.editor')) {
            $this.data('jq.editor').unbind();
        }

        editor = new Editor(opts);

        editor.render($this);
    });

    return $(this).first().data('jq.editor', editor);
};