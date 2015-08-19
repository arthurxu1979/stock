module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        mochaTest: {
            tests: {
                options: {
                    reporter:'nyan'
                },
                src:['tests/tests.js']
            }
        },
        jshint: {
            all: {
                src: [ 'timespan.js' ]
            }
        },
        watch: {
            files:['tests/*.js','*.js'],
            tasks:['mochaTest','jshint','uglify']
        },
        uglify: {
            my_target: {
                files: {
                    'bin/timespan.min.js': 'timespan.js'
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-beautify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default',['mochaTest','jshint','uglify','watch']);
};