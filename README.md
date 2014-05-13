editor
======

A different wysiwyg editor specially designed for content-writers.


How to build
============

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
