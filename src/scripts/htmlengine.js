var HtmlEngine = function(options) {
    this.options = $.extend({
        mode: 'html5',
        useCss: false
    }, options);
};

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
            var $el = $('<div/>').html(html),
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

    //Check if the given node is a certain element
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

window.HtmlEngine = HtmlEngine;