module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: '\n\n',
                process: function (src, filepath) {
                    return '//#### ' + filepath + '\n' + src;
                }
            },
            dist: {
                // src: ['src/*.js'],
                src: ['<%= file_dependencies.src_target.ordered_files %>'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/*.js', 'test/**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                },
                jshintrc: true
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        },
        file_dependencies: {
            options: {
                extractDefinesRegex: /@class\s*([\w.]*)/g,
                extractRequiresRegex: /@requires\s*([\w.]*)/g
            },
            src_target: {
                src: ['src/*.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    // will use different testing tool
    // grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-file-dependencies');

    grunt.registerTask('test', ['jshint']);

    // TODO that bastard doesn't know ES6
    // grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
    grunt.registerTask('default', ['jshint', 'file_dependencies', 'concat']);

};