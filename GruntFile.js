/**
 * Configuration file for Ranker table application
 *
 * Primary Tasks:
 *   test  :  Execute mocha tests
 *   dev    :  Development mode, file-watcher
 */


module.exports = function( grunt ) {

  grunt.initConfig({


    // + ---------------------------------------


    'simplemocha': {
      options: {
        ui: 'bdd',
        reporter: 'spec',
        compilers: 'coffee:coffee-script',
        bail: true
      },

      all: {
        src: ['test/ranker_spec.coffee']
      }
    },


    'watch': {
      src: {
        files: [ 'src/**', 'test/**' ],
        tasks: [ 'simplemocha' ]
      }
    }

  })


  // + ---------------------------------------


  grunt.registerTask( 'dev', [
    'test',
    'watch'
  ])

  grunt.registerTask( 'test', [
    'simplemocha'
  ])


  // + ---------------------------------------


  grunt.loadNpmTasks( 'grunt-contrib-watch' )
  grunt.loadNpmTasks( 'grunt-simple-mocha' )


  // + ---------------------------------------


  grunt.option( 'force', true )


}
