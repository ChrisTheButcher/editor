
//Widgets-plugin 
(function() {
    PluginManager.createPlugin('widgets', {
        init: function(editor) {
            var p = this;
            
            this.loadFile('settings.html');
            
            editor.addEvent('click', '.ed-widget', function(e) {
                editor.showScreen(p.files['settings.html']);
                editor.$overlay.find('.ed-input').val($(this).attr('data-src'));
            });
        }
    });
}());