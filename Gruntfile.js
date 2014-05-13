module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n' +
                        '(function($) { if (!$) { throw "jQuery not loaded"; } ',
                footer: '}(jQuery));'
            },
            build: {
                src: ['src/scripts/keys.js', 'src/scripts/plugins.js', 'src/scripts/htmlengine.js', 'src/scripts/editor.js'],
                dest: 'build/scripts/editor.min.js'
            }
        },
        cssmin: {
            combine: {
                files: {
                    'build/styles/editor.min.css': ['src/styles/font-awesome.css', 'src/styles/bootstrap.css', 'src/styles/bootstrap-theme.css', 'src/styles/editor.css'],
                    'build/styles/editor-inline.min.css': ['src/styles/font-awesome.css', 'src/styles/editor-inline.css']
                }
            }
        },
        
        plugins: {
            
        },
        
        watch: {
            scripts: {
                files: ['src/scripts/*.js', 'src/styles/*.css'],
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