var HtmlEngine = function(options) {
    if (typeof(options) === 'string') {
        var args = [];
        
        for (var x in arguments) {
            args.push(arguments[x]);
        }
        
        return HtmlEngine.createElement.apply(HtmlEngine, args);
    } else {
        this.options = $.extend({
            mode: 'html5',
            useCss: false
        }, options);
    }
};

var AllElementsList = ['a','abbr','acronym','address','applet','area','article','aside','audio','b','base','basefont','bdi','bdo','bgsound','big','blink','blockquote','body','br','button','canvas','caption','center','cite','code','col','colgroup','content','data','datalist','dd','decorator','del','details','dfn','dir','div','dl','dt','element','em','embed','fieldset','figcaption','figure','font','footer','form','frame','frameset','h1','h2','h3','h4','h5','h6','head','header','hgroup','hr','html','i','iframe','img','input','ins','isindex','kbd','keygen','label','legend','li','link','listing','main','map','mark','marquee','menu','menuitem','meta','meter','nav','nobr','noframes','noscript','object','ol','optgroup','option','output','p','param','plaintext','pre','progress','q','rp','rt','ruby','s','samp','script','section','select','shadow','small','source','spacer','span','strike','strong','style','sub','summary','sup','table','tbody','td','template','textarea','tfoot','th','thead','time','title','tr','track','tt','u','ul','var','video','wbr','xmp'];

var ElementList = {
    'bold': ['b', 'strong', function(n) {
        return n && n.style.fontWeight == 'bold' && n.nodeName.toLowerCase() == 'span';
    }],

    'italic': ['i', 'em', function(n) {
        return n && n.style.fontStyle == 'italic' && n.nodeName.toLowerCase() == 'span';
    }],

    'underline': ['u', 'u', function(n) {
        return n && n.style.fontStyle == 'underline' && n.nodeName.toLowerCase() == 'span';
    }]
};

HtmlEngine.prototype = {
    //Get a regular line-break (br tag)
    lineBreak: function() {
        return document.createElement('br');
    },
    
    convert: {
        //Convert editor-code to HTML
        toHTML: function(code) {
            return code;
        },

        //Convert an iframe into a widget
        toWidget: function(element) {
            var widget = document.createElement('div'),
                $element = $(element);

            widget.className = 'ed-widget';
            widget.style.width = ($element.width() < 10 ? 500 : $element.width()) + 'px';
            widget.style.height = ($element.height() < 10 ? 351 : $element.height())  + 'px';

            if (element.src.indexOf('youtube') > -1 ||
                element.src.indexOf('youtu.be') > -1) {
                var vid = '';

                if (element.src.indexOf('embed') > -1) {
                    vid = element.src.split('/embed/')[1];
                } else if (element.src.indexOf('?v') > -1) {
                    vid = element.src.split('?v=')[1];
                } else {
                    vid = element.src.split('/')[element.src.split('/').length - 1];
                }

                widget.className += ' ed-widget-youtube';
                widget.style.backgroundImage = 'url(http://img.youtube.com/vi/' + vid + '/0.jpg)';
            }

            return widget;
        },

        //Convert HTML to editor-code
        toCode: function(html) {
            var $el = HtmlEngine('div').html(html),
                conv = this;

            //Replace all iFrames with widgets
            $el.find('iframe').each(function() {
                var $widget = $(conv.toWidget(this));

                $widget.attr('data-src', $(this).attr('src'));

                $(this).after($widget).remove();
            });

            return $el.html();
        }
    },

    //Get a content element
    content: function() {
        return document.createElement('p');
    },

    //Get a bold styling depending on the mode used
    bold: function() {
        if (this.options.mode == 'html5') {
            return document.createElement('strong');
        } else if (this.options.useCss) {
            var n = document.createElement('span');

            n.style.fontWeight = 'bold';

            return n;
        } else {
            return document.createElement('b');
        }
    },

    //Get a content-node (using a parent-lookup)
    getContentNode: function(node) {
        var elementList = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol'];

        return  elementList.indexOf(node.nodeName.toLowerCase()) === -1 ? 
                ( node.parentNode ? this.getContentNode(node.parentNode) : false ) : 
                node;
    },

    //Get a list-item
    listItem: function() {
        return document.createElement('li');
    },

    //Get an italic styling depending on the mode used
    italic: function() {
        if (this.options.mode == 'html5') {
            return document.createElement('em');
        } else if (this.options.useCss) {
            var n = document.createElement('span');

            n.style.fontStyle = 'italic';

            return n;
        } else {
            return document.createElement('i');
        }
    },

    //Get an underlined styling depending on the mode used
    underline: function() {
        if (this.options.mode == 'html5') {
            return document.createElement('u');
        } else if (this.options.useCss) {
            var n = document.createElement('span');

            n.style.fontStyle = 'underline';

            return n;
        } else {
            return document.createElement('u');
        }
    },
    
    //Checks if the node is a content-element
    isContentElement: function(node) {
        return this.getContentNode(node) !== false;
    },
    
    //Get a non-textnode element
    getElement: function(node) {
        return node.nodeType === 3 ? ( !node.parentNode ? false : this.getElement(node.parentNode) ) : node;
    },

    //Checks if the given node is a certain element
    isElement: function(node, name, alsoParent, cur) {
        var els = ElementList[name],
            nodeName = node.nodeName.toLowerCase(),
            cur = cur ? cur : 0;

        if (node.nodeType === 3) {
            return name === 'textNode';
        }

        if (els) {
            for (var x in els) {
                var el = els[x];

                if (nodeName == (typeof(el) === 'function' ? el(node) : el)) {
                    return true;
                }
            }
        } else if (alsoParent && node.parentNode && cur < 99999) {
            return this.isElement(node.parentNode, name, true, cur + 1);
        } else {
            return false;
        }
    }
};

//Create an element from a string, for example the following string: strong.test.tester#lol[title="hi"]
//will create: <strong class="test tester" id="lol" title="hi"></strong>
HtmlEngine.createElement = function(name) {
    if (AllElementsList.indexOf(name) > -1) {
        return $(document.createElement(name));
    }
    
    var matches = name.match(/[#\.\[]{1}([a-zA-Z= \"_\-,\?]*)/g),
        nodeName = name.match(/^[a-zA-Z]*/),
        node = document.createElement(nodeName[0].length === 0 ? 'div' : nodeName[0]),
        args = arguments,
        argIndex = 1;
    
    for (var x in matches) {
        var m = matches[x],
            val = m.substr(1);
        
        switch (m[0]) {
            case '.':
                node.className += ' ' + val;
                break;
                
            case '#':
                node.id = val;
                break;
                
            case '[':
                var attrs = val.split(', ');
                
                for (var y in attrs) {
                    var attr = attrs[y].split('='),
                        attrKey = attr[0],
                        attrValue = attr[1] == '?' ? args[argIndex].toString() : attr[1].substr(1, attr[1].length - 2);
                    
                    if (attr[1] == '?') {
                        argIndex++;
                    }
                    
                    node.setAttribute(attrKey, attrValue);
                }
                break;
        }
    }
    
    if (node.className.length > 0) {
        node.className = node.className.substr(1);
    }
    
    return $(node);
};

window.HtmlEngine = HtmlEngine;