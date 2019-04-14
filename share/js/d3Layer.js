define([
  "require",

  "esri/layers/GraphicsLayer",


  "esri/request",


  "dojo/_base/lang"
], 
function(
  require,
  Layer,
  esriRequest,
  lang
) {

  var D3Layer = Layer.createSubclass({

    declaredClass: "D3Layer",
    
    viewModulePaths: {
      "2d": require.toAbsMid("./D3LayerView2D")
    },
    
    properties: {},


    constructor: function(jsonURL, options) { 
      this.jsonURL = jsonURL;
      // id will be the HTML Dom ID
      this.id = options.id || Date.now().toString(16);
      this.svg_type = options.svgType;
      this.area_scale = options.areaScale || 0.8;
      
      this._styles = options.style || [];
      this._attrs = options.attr || [];

      
    },

    initialize: function() { 
            
    },
    

    load: function() {
      return esriRequest(this.jsonURL).then(function(result) {
        this.data = result.data;
        //this.callback.apply(this, this.data.features);
      }.bind(this));
    },

    setPathScale: function(newScale) {
      this.area_scale = +newScale > 1 ? 1 : (+newScale < 0 ? 0.1 : +newScale);
    }

    
  
  });
  
  return D3Layer;
});
