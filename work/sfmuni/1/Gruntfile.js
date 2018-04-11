module.exports = function(grunt) {

    //load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify'); 
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-ngmin');

    var userConfig = require( './build.config.js' );

    
    var taskConfig = {
    	pkg: grunt.file.readJSON('package.json'),

		copy: {
	      build_app_assets: {
	        files: [
	          { 
	            src: [ '**' ],
	            dest: '<%= build_dir %>/data/',
	            cwd: 'src/data',
	            expand: true
	          }
	       ]   
	      },
	      build_vendor_assets: {
	        files: [
	          { 
	            src: [ '<%= vendor_files.data %>' ],
	            dest: '<%= build_dir %>/data/',
	            cwd: '.',
	            expand: true,
	            flatten: true
	          }
	       ]   
	      },
	      build_appjs: {
	        files: [
	          {
	            src: [ '<%= app_files.js %>' ],
	            dest: '<%= build_dir %>/',
	            cwd: '.',
	            expand: true
	          }
	        ]
	      },
	      build_vendorjs: {
	        files: [
	          {
	            src: [ '<%= vendor_files.js %>' ],
	            dest: '<%= build_dir %>/',
	            cwd: '.',
	            expand: true
	          }
	        ]
	      },
	      compile_assets: {
	        files: [
	          {
	            src: [ '**' ],
	            dest: '<%= compile_dir %>/data',
	            cwd: '<%= build_dir %>/data',
	            expand: true
	          }
	        ]
	      }
	    },

		concat: {
	      /**
	       * The `build_css` target concatenates compiled CSS and vendor CSS
	       * together.
	       */
	      build_css: {
	        src: [
	          '<%= vendor_files.css %>',
	          '<%= recess.build.dest %>'
	        ],
	        dest: '<%= recess.build.dest %>'
	      },
	      /**
	       * The `compile_js` target is the concatenation of our application source
	       * code and all specified vendor source code into a single file.
	       */
	      compile_js: {
	       
	        src: [ 
	          '<%= vendor_files.js %>', 
	          'module.prefix', 
	          '<%= build_dir %>/src/**/*.js'
	          'module.suffix' 
	        ],
	        dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
	      }
	    },

		uglify: {
		    js: { //target
		        src: ['./public/min/app.js'],
		        dest: './public/min/app.js'
		    }
		},

		ngmin: {
	      compile: {
	        files: [
	          {
	            src: [ '<%= app_files.js %>' ],
	            cwd: '<%= build_dir %>',
	            dest: '<%= build_dir %>',
	            expand: true
	          }
	        ]
	      }
	    }

    }

    grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );


    /**
	* The default task is to build and compile.
	*/
	grunt.registerTask( 'default', [ 'build', 'compile' ] );

	/**
	* The `build` task gets your app ready to run for development and testing.
	*/
	grunt.registerTask( 'build', [
	'concat:build_css', 'copy:build_app_assets', 'copy:build_vendor_assets',
	'copy:build_appjs', 'copy:build_vendorjs'
	]);

	/**
	* The `compile` task gets your app ready for deployment by concatenating and
	* minifying your code.
	*/
	grunt.registerTask( 'compile', [
	'recess:compile', 'copy:compile_assets', 'ngmin', 'concat:compile_js', 'uglify'
	]);
    
}