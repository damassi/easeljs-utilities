/**
 * Random EaselJS utilities
 *
 * @date 11.20.13
 */

var assets = require('../config/Assets').manifest


var Easel = {


  /**
   * Set the default search key for asset queries within a manifest
   * @type {String}
   */
  DEFAULT_KEY: 'name',


  /**
   * Creates a bitmap
   * @param  {String} value the value-pair of the asset
   * @param  {Object} params to set on the bitmap after initialization
   * @return {c.Bitmap}  The bitmap
   */

  createBitmap: function (name, params) {
    var bitmap = new c.Bitmap( this.returnAssetImage( name ))

    if (typeof params !== 'undefined') {
      if (params.retina) {
        bitmap.scaleX = bitmap.scaleY = .5
      }

      for (var param in params) {
        bitmap[param] = params[param]
      }
    }

    return bitmap
  },



  /**
   * Creates a spritesheet and returns c.Sprite object
   * @param  {String} The name of the asset
   * @param  {String} Frame to go to
   * @param {Object} params to set on the sprite
   * @return {c.Sprite}  The animated spritesheet
   */

  createSprite: function (name, gotoFrameName, params) {
    var sprite = new c.Sprite( new c.SpriteSheet( this.returnAssetSpriteSheet( name )))

    if (typeof gotoFrameName !== 'undefined') {
      sprite.gotoAndStop( gotoFrameName )
    }

    if (typeof params !== 'undefined') {
      if (params.retina) {
        bitmap.scaleX = bitmap.scaleY = .5
      }

      for (var param in params) {
        sprite[param] = params[param]
      }
    }

    return sprite
  },



  /**
   * Creates a hit area for DisplayObjects
   * @param  {DisplayObject} parent
   * @param  {Number} width
   * @param  {Number} height
   */

  createHitArea: function (parent, width, height) {
    width  = width  || 0
    height = height || 0

    parent.hitArea = new c.Shape( new c.Graphics().beginFill("#f00").drawRect( 0, 0, width, height ))
  },



  /**
   * Returns a game asset
   * @param  {String} name the asset name
   * @return {Object}   the asset
   */

  returnAsset: function (value) {
    var lookupKey = this.DEFAULT_KEY
      , len = assets.length

    for (var i = 0; i < len; ++i) {
      var asset = assets[i]
      if (asset.hasOwnProperty( lookupKey )) {
        if (asset[lookupKey] === value ) {
          return asset;
        }
      }
    };

    return new Error('Asset not found')
  },



  /**
   * Returns an image url
   * // TODO: Merge image and spritesheet into one returnAsset method
   * @param  {String} value the asset value-pair
   * @return {String}   the asset url
   */

  returnAssetImage: function (value) {
    var lookupKey = this.DEFAULT_KEY
      , len = assets.length

    for( var i = 0; i < len; ++i ) {
      var asset = assets[i]
      if (asset.hasOwnProperty( lookupKey )) {
        if (asset[lookupKey] === value ) {
          return asset.src
        }
      }
    }

    return false
  },



  /**
   * Returns a spritesheet object
   * // TODO: Merge image and spritesheet into one returnAsset method
   * @param  {String} value the asset value
   * @return {Object}   the asset spritesheet
   */

  returnAssetSpriteSheet: function (value) {
    var lookupKey = this.DEFAULT_KEY
      , len = assets.length

    for( var i = 0; i < len; ++i ) {
      var asset = assets[i];
      if (asset.hasOwnProperty( lookupKey )) {
        if (asset[lookupKey] === value ) {
          return asset.spritesheet
        }
      }
    }

    return false
  },



  /**
   * Returns the gfx object under the current grid coord
   * @param  {Array} matrixCoord the current position on the grid
   * @return {Object}      an object has consisting of the name, id
   *                       and location of the object under the current grid coord
   */

  returnObjectUnderMatrixCoord: function (matrixCoord) {
    var gfxLayout = GameConfig.BOARD().gfxLayout
      , gfxId = gfxLayout[matrixCoord[1]][matrixCoord[0]]
      , asset = this.returnAsset( gfxId, 'id' )

    if (typeof asset !== 'undefined')
      return {
        asset: asset,
        gfxId: gfxId
      }

    return false
  },



  /**
   * Finds real-world coordinates from 2d array-maps
   * @param  {Array} path  The path to translate
   * @param  {Array} gridItems An array of items in the grid, with 2d and rw attributes
   * @return {Array}
   */

  matrixRouteToCoordinates: function (path, gridItems) {
    var posArray = path.map( function (node, index) {
      var foundItem = _.find( gridItems, function (item) {
        if (( node[0] === item.gridCoord[0] ) && ( node[1] === item.gridCoord[1] ))
          return item
      })

      var props = {}

      // Validate found item
      if (typeof foundItem !== 'undefined') {
        props = {
          gridCoord: foundItem.gridCoord,
          xPos: foundItem.xPos,
          yPos: foundItem.yPos,
          empty: foundItem.empty
        }
      }

      // Return new artificial position obj
      else {
        props = {
          gridCoord: [-1, -1],
          xPos: 0,
          yPos: 0,
          empty: true
        }
      }

      return props
    })

    return posArray
  },



  /**
   * Moves all frame reg-points to the center.
   * USE WITH CAUTION:  Adjusting the internals invalidates pixel-snapping
   * @param  {Sprite} bitmapAnimation
   */

  centerSpriteSheetRegPoint: function (sprite) {
    sprite.spriteSheet._frames.forEach(function (frame) {
      frame.regX = frame.rect.width * .5
      frame.regY = frame.rect.height * .5
    })
  },



  /**
   * Animates a spritesheet once and then returns to old position
   * @param  {c.Sprite} spritesheet
   * @param  {String} frameLabel the frame label
   */

  animateOnce: function (spritesheet, frameLabel) {
    spritesheet.on('animationend', function() { this.gotoAndStop( frameLabel ) })
    spritesheet.gotoAndPlay( frameLabel )
  },



  /**
   * Util for dragging display objects to aproximate positioning
   * @param  {Array} objArr An array of display objects to drag
   *
   */

  dragObject: function (objects) {
    if (! (objects instanceof Array))
      objects = [objects]

    objects.forEach(function (displayObject) {

      if (displayObject instanceof c.Sprite) {
        name = displayObject.spriteSheet._images[0].attributes[0].nodeValue
      }
      else if (displayObject instanceof c.Bitmap) {
        name = displayObject.image.attributes[0].nodeValue
      }
      else {
        name = ''
      }

      displayObject.on('mousedown', function (event) {
        var target = event.currentTarget

        var offset = {
          x: displayObject.x - event.stageX,
          y: displayObject.y - event.stageY
        }

        target.on('pressmove', function (ev) {
          var x = ev.stageX+offset.x
          var y = ev.stageY+offset.y

          displayObject.x = x
          displayObject.y = y

          console.log( x + ', ' + y, ' > ' + name )
        })
      })
    })
  },



  /**
   * Returns a random nunber within two ranges
   * @param {Number} min
   * @param {Number} max
   */

  randRange: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },



  /**
   * Returns a random hex color
   *
   */

  returnRandomHexColor: function () {
    var letters = '0123456789ABCDEF'.split('')
    var color = '#'
    for (var i = 0; i < 6; i++ ) {
      color += letters[ Math.round( Math.random() * 15 ) ]
    }

    return color
  },



  /**
   * Convert our score to a 4 digit number
   * @param  {int} $scoreInt an int holding our current score
   * @return {string} a 4 digit string
   */

  convertScore: function (scoreInt) {
    var scoreStr = scoreInt + ""
      while (scoreStr.length < 4) { scoreStr = "0" + scoreStr }
      return scoreStr
  },



  /**
   * Rotates a 2-Dimensional array to the right
   * @param  {Array} array
   */

  rotateArrayRight: function (array) {
    var transformedArray = new Array()
    var aLen = array[0].length
    for (var i = 0; i < aLen; i++ ) {
      transformedArray[i] = new Array()

      // Fill the row with everything in the appropriate column of the source array
      var transformedArrayColumn = -1
      var bLen = array.length - 1
      for (var j = bLen; j > -1; j-- ) {
        transformedArrayColumn++
        transformedArray[i][transformedArrayColumn] = array[j][i]
      }
    }

    return transformedArray
  },



  /**
   * Rotates a 2-Dimensional array to the left
   * @param  {Array} array
   */

  rotateArrayLeft: function (array)  {
    var transformedArray = new Array()

    var row = -1
    var aLen = array[0].length
    for (var i = aLen - 1; i > -1; i-- ) {
      row++
      transformedArray[row] = new Array()

      var bLen = array.length
      for (var j = 0; j < bLen; j++ ) {
        transformedArray[row][j] = array[j][i]
      }
    }

    return transformedArray
  }
}

module.exports = Easel