'use strict';
module.exports = function(grunt) {

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // Meta definitions
        meta: {
            header: "/*!\n" +
                " *  <%= pkg.title || pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today('yyyy-mm-dd') %>)\n" +
                " *  <%= pkg.homepage %>\n" +
                " *\n" +
                " *  <%= pkg.description %>\n" +
                " *\n" +
                " *  Copyright (c) 2010-<%= grunt.template.today('yyyy') %> <%= pkg.author.name %> <<%= pkg.author.url %>>\n" +
                " *  License: <%= pkg.author.license %>\n" +
                " */\n"
        },

        // javascript linting with jshint
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                "force": true
            },

            src: {
                // you can overrides global options for this target here
                options: {},
                files: {
                    src: ['src/**/*.js']
                }
            }
        },

        // Copy files from bower_component folder to right places
        copy: {

            jquery: {

                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        cwd: '<%= pkg.bower.components %>jquery/dist/',      // Src matches are relative to this path.
                        src: ['jquery.min.js', 'jquery.min.map', 'jquery.js'],      // Actual pattern(s) to match.
                        dest: 'bin-debug/js/'   // Destination path prefix.
                    }
                ]
            },

            toBinDebug: {
                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        cwd: 'src/merged/',      // Src matches are relative to this path.
                        src: ['script.js'],      // Actual pattern(s) to match.
                        dest: 'bin-debug/js/',   // Destination path prefix.
                        rename: function(dest, src) {
                            return dest + 'dev.js';
                        }
                    }
                ]

            },

            toDist: {
                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        cwd: 'src/merged/',      // Src matches are relative to this path.
                        src: ['script.js'],      // Actual pattern(s) to match.
                        dest: 'dist/'   // Destination path prefix.
                    }
                ]
            }

        },

        // merge js files
        concat: {

            scripts: {
                options: {
                    // separator: "\n\n/* ================== init.averta.js =================== */\n\n;",
                    banner: '<%= meta.header %>',
                    process: function(src, filepath) {
                        var separator = "\n\n/* -------------------- " + filepath + " -------------------- */\n\n\n";
                        return (separator + src).replace(/;\s*$/, "") + ";"; // make sure always a semicolon is at the end
                    },
                },
                src: ['src/*.js'],
                dest: 'src/merged/script.js'
            }

        },

        // uglify to concat, minify, and make source maps
        uglify: {

            options: {
                compress: {
                    drop_console: true
                },
                banner: ""
            },

            front_script_js: {
                options: {
                    sourceMap: true,
                    mangle: false,
                    compress: false,
                    preserveComments: 'some'
                },
                files: {
                    'dist/script.min.js': ['dist/script.js']
                }
            }

        },

        // watch for changes and trigger sass, jshint, uglify and livereload
        watch: {

            autoreload: {
                options: { livereload: true },
                files: [ 'src/**/*.js'],
                tasks: ['dev']
            }
        },

    });

    // rename tasks
    // grunt.renameTask('rsync', 'deploy');

    // register task
    grunt.registerTask( 'default', ['dev','watch']);
    grunt.registerTask( 'build', ['dev', 'copy:toDist', 'uglify']);
    grunt.registerTask( 'dev', ['jshint', 'copy:jquery', 'concat', 'copy:toBinDebug'] );

};
