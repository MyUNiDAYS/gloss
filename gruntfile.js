module.exports = function(grunt) {
  require('jit-grunt')(grunt);

  grunt.initConfig({
    sass: {
      dist: {
        options: {
          style: 'compressed',
          sourcemap: 'none',
          noCache:true
        },
        files: {                     
         'clientside/gloss.css':'clientside/sass/gloss.scss'
        }
      }
    },    
    watch: { 
      styles: {  
        files: ['clientside/sass/*.scss'], // which files to watch
        tasks: ['sass']
      },
      grunt: {   //restart watch when gruntfile changed
		    files: ['gruntfile.js']
      },
      backendFiles: {  //recompile if core files change
		    files: ['index.js', 'core/**/*.js', 'template.html', 'unidays.yml'],
        tasks: ['compile'],
        options: {
          spawn:false
        }
      },
      livereload: {  //automatically reload browser when js, css or html changes
      	files: ['clientside/gloss.css', 'clientside/js/*.js', 'output.html'],
      	options: {
			    livereload:true  
      	}
      }
    }
  });

  grunt.registerTask('compile', function() {
      var serverProcess = grunt.util.spawn({
          cmd: 'node',  
          args: ['index.js', 'unidays.yml'],
          opts: {
            stdio: 'inherit'
          }
      },function(error) {
        if(error) console.log(error);
      });
  });
  
  grunt.registerTask('default', ['sass', 'compile', 'watch']);
};