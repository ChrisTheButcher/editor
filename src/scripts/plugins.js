var PluginManager = {
    //The base-url
    baseUrl: '/plugins/',

    //The globally defined plugins
    plugins: {},

    //The amount if scripts loading now
    scriptsLoading: 0,

    //The scripts timer
    scriptsLoadingTimeout: null,

    //All loaded scripts
    scriptFiles: [],

    //When all plugins are loaded this method is called
    pluginLoadingDone: function() {

    },

    //When a plugin script is loaded this method is called
    scriptLoaded: function(file) {
        this.scriptsLoading -= 1;

        if (this.scriptsLoadingTimeout) {
            clearTimeout(this.scriptsLoadingTimeout);
        }

        this.scriptsLoadingTimeout = setTimeout(function() {
            PluginManager.pluginLoadingDone();
        }, 10);
    },

    //Load an additional file into the data-cache
    loadFile: function(plugin, file) {
        if (!this.plugins[plugin]) {
            throw 'Plugin ' + plugin + ' must be loaded before loading an additional file';
        }

        plugin = this.plugins[plugin];

        $.ajax({
            url: PluginManager.baseUrl + plugin.name + '/' + file,
            success: function(resp) {
                plugin.files[file] = resp;
            }
        });
    },

    //Load a certain plugin file
    loadPluginFile: function(file) {
        //Check if the plugin-file was already loaded
        for (var x in this.scriptFiles) {
            if (this.scriptFiles[x] == file) {
                return false;
            }
        }

        //Load the plugin file script
        var script = document.createElement('script');

        this.scriptsLoading += 1;

        script.async = true;
        script.src = PluginManager.baseUrl + file + '/script.js';
        script.onload = function() {
            PluginManager.scriptLoaded(file);
            PluginManager.scriptFiles.push(file);
        };

        document.body.appendChild(script);

        return true;
    },

    //Return a certain plugin
    get: function(name) {
        return PluginManager.plugins[name];
    },

    //Create a new plugin
    createPlugin: function(name, options) {
        PluginManager.plugins[name] = $.extend({
            files: {},
            name: name,

            loadFile: function(file) {
                PluginManager.loadFile(this.name, file);
            },

            init: function(editor) {

            }
        }, options);
    }
};

window.PluginManager = PluginManager;