module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n' +
                        '(function($) { if (!$) { throw new "jQuery was not loaded"; }',
                footer: '}(jQuery));'
            },
            build: {
                src: ['src/scripts/keys.js', 'src/scripts/plugins.js', 'src/scripts/htmlengine.js', 'src/scripts/editor.js'],
                dest: 'build/scripts/editor.min.js'
            }
        },
        cssmin: {
            minify: {
                expand: true,
                cwd: 'src/styles/',
                src: ['default.css', 'editor-inline.css'],
                dest: 'build/styles/',
                ext: '.min.css'
            }
        },
        
        plugins: {
            
        },
        
        watch: {
            scripts: {
                files: ['src/scripts/*.js'],
                tasks: ['default'],
                options: {
                    spawn: false,
                },
            },
        }
    });

    // Load all plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'cssmin', 'plugins']);
    
    //Copy the plugins to the build directory
    grunt.registerTask('plugins', 'Copy the plugins to the build directory', function() {
        var ncp = require('ncp').ncp,
            done = this.async();
        
        ncp.limit = 3;
        ncp('src/plugins', 'build/plugins', function(err) {
            if (err) {
                grunt.log.error(err);    
            } else {
                grunt.log.writeln('All plugins copied to destination');
            }
            
            done();
        });
    });
};