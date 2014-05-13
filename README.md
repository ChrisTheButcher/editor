WYSIWYG editor
======
###Introduction

A somewhat different wysiwyg editor specially designed for content-writers.
We don't want crappy HTML to be generated so we use our own HTML engine and overwrite all default actions.
We also want the content-writer (without any knowledge of HTML) to be able to see the difference between for example a bold tag and a h3 tag.

**Please note that this editor is NOT ready for production!!!**


###Demo

Go to http://dmeijboom.github.io/editor/example.html for an example of the editor.


###Editor API
####jQuery plugin
The editor is exposed as a jQuery plugin, you can use it by using the following code:

```js
$(document).ready(function() {
    $("#ed").editify({
        menu: ['bold', 'italic', 'underline', 'styles'],
        plugins: ['basic_formatting', 'widgets']
        stylesheets: []   
    });
});
```

Where `#ed` is ofcourse the selector of the textarea or input field.
Currently we support the following settings in the jQuery plugin:

Name | Type | Description
--- | --- | ---
menu | string[] | The location of each plugin
plugins | string[] | The plugin-files to load
stylesheets | string[] | The stylesheet to embed into the editor

####Editor plugins
To create a plugin you have to create a new folder in the `src/plugins` folder with your plugin name.
Then you have to create a file called `script.js` in this folder, you can use the following example for a new plugin:

```js
//Create a new example plugin
(function() {
    PluginManager.createPlugin('example', {
        init: function(editor) {
            //Create a new button which toggles the bold styling
            editor.addButton('bold', {
                icon: 'bold',
                click: function() {
                    editor.toggleStyle('bold');
                }
            });
            
            //Create a new button which alerts 'hi'
            editor.addButton('hi', {
                icon: 'underline',
                click: function() {
                    alert('hi');
                }
            });
            
            //Create a new select box which uses the value of the selected item to create a new element
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
```

After creating your plugin make sure the name of the plugin-file is used in the `plugins` array and the plugins themself (in our case bold, hi and styles) are in the `menu` array.


###How to build

I use `grunt` and `nodeJS` to build the entire project, both software runs on Windows, Mac Osx and Linux.
The first thing you should do is set-up NodeJS which can be done by going to: http://nodejs.org/ and press the 'install' button (make sure that node is in your PATH variable so it can be accessed globally).

The next step is to get the source-code from GitHub you can either use the GIT command-line tools, download the repository as a ZIP file or use the GitHub client app (which can be downloaded here: https://mac.github.com/ or here: https://windows.github.com/).

If you're done open the terminal or MS-DOS with admin priviliges, then run the following commands:

```
npm install -g grunt
```

This will install the grunt build-system.

```
npm install
```

This will install all nodeJS dependencies.

```
grunt
```

This will minify all javascript and css files to the /build directory.

```
node app
```

This will create a new static-file webserver which can be used to view the editor (a webserver is needed since I use ajax in the code). The default port is `8080` which can be changed in the `/app.js` file.

Go to http://localhost:8080 in your browser and voila!
Please note that on every change you should run `grunt` again!


###Browser support
Currently I only tested the editor in Google Chrome (on Mac Osx) and Safari (on Mac Osx). But it will support IE9+, Chrome, Firefox, Safari and other browsers based on WebKit or the Gecko Engine.
