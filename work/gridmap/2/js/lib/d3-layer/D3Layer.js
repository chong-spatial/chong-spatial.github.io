define([
  "require",

  "esri/layers/Layer",

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
    
    //--------------------------------------------------------------------------
    //
    //  Lifecycle
    //
    //--------------------------------------------------------------------------
    
    load: function() {
      return esriRequest("./us-states.json").then(function(result) {
        this.data = result.data;
      }.bind(this));
    },
    
    //--------------------------------------------------------------------------
    //
    //  Public Properties
    //
    //--------------------------------------------------------------------------

    properties: {
      data: null
    }
  
  });
  
  return D3Layer;
});
