define([
  "esri/views/2d/layers/LayerView2D",

  "esri/views/2d/engine/DisplayObject",

  "d3",
  "topojson"
],
function(
  LayerView2D,
  DisplayObject,
  d3, topojson
) {

  var D3LayerView = LayerView2D.createSubclass({

    declaredClass: "D3LayerView",

    initialize: function() {          
      var el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      el.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
      var svg = d3.select(el);
      svg.attr("class", "esri-display-object");

      var path = this._getPath();

      var g = svg.append("g");
      var data = this.layer.data;
      g.append("g")
        .attr("class", "states-bundle")
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "states");

      this.container = new DisplayObject({
        surface: el,
        render: function() {
          svg.attr("width", this.view.width)
            .attr("height", this.view.height);
        }.bind(this)
      });
    },

    _getPath: function() {
      var state = this.view.state;
      var width = state.width;
      var height = state.height;
      var resolution = state.resolution;
      
      var projection = d3.geo.mercator()
        .translate([2110, height])
        .scale(650)
        .precision(.1);

      var path = d3.geo.path()
          .projection(projection);

      return path;
    }

  });

  return D3LayerView;

});
