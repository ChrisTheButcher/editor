//This page defines the plugins for base formatting
//these plugins are: bold, italic, underline
(function() {
    PluginManager.createPlugin('basic_formatting', {
        init: function(editor) {
            editor.addButton('bold', {
                icon: 'bold',
                click: function() {
                    editor.toggleStyle('bold');
                }
            });
            
            editor.addButton('italic', {
                icon: 'italic',
                click: function() {
                    editor.toggleStyle('italic');
                }
            });
            
            editor.addButton('underline', {
                icon: 'underline',
                click: function() {
                    editor.toggleStyle('underline');
                }
            });
            
            editor.addSelect('styles', {
                text: 'styles',
                options: [{
                    key: 'Title', value: 'h1'
                }, {
                    key: 'SubTitle', value: 'h3'
                }],
                click: function(option) {
                    editor.insertAfterCursorElement($('<' + option.value + '/>').html('&nbsp;'));
                }
            });
        }
    });
}());