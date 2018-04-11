// based on ArcGIS API for JavaScript 3.13

define([
    "dojo/_base/declare",
    "esri/geometry/Point",
    "dojo/_base/lang",
    "esri/geometry/webMercatorUtils",
    "esri/layers/GraphicsLayer",
    "js/lib/d3.js"
  ],
  function(
    declare,
    Point,
    lang,
    webMercatorUtils,
    GraphicsLayer,
    d3) {

    return GraphicsLayer.createSubclass({

      // extend esri.layers.Layer
      constructor: function(jsonurl, options) {
        var self = this;
        // data in the url must be FeatureCollection definded in GeoJSON
        this.url = jsonurl;
        this.callback = options.callback || function(){};
        this.svg_type = options.svgType || 'path';
        // id is also the HTML Dom ID
        this.id = options.id || Date.now().toString(16);
        this.map = options.map;

        // d3 part
        this._styles = options.style || [];
        this._attrs = options.attr || [];
        this._svg_layer_sel = "#" + this.id + "_layer";

      },


     // extend
     _setMap: function(map, surface) {
       var self = this;
       d3.json(self.url, function(geojson) {
         self.geoFeatures = geojson;
         self.bbox = d3.geo.bounds(self.geojson);
         self.loaded = true;

         self._render();
         //When the layer is loaded, the value becomes "true", and layer properties can be accessed. The onLoad event is also fired.
         self.onLoad(self);
         self.callback(geojson);
       });


       this._redraw = map.on("zoom-end", lang.hitch(this, function() {
         this.redraw();
       }));

       this._path_draw = d3.geo.path().projection(self._project_to_screen);

       return this.inherited(arguments);
     },

     // extend
     _unsetMap: function() {
       this.inherited(arguments);
       this._redraw.remove();
     },

     // extend
     attr: function(a) {

       if (a != "data-suspended" || this.suspended) {
         this.getSVGFeatureSelections().attr(a.key, a.value);
       }

       return this.inherited(arguments);

     },

     _render: function() {
       var self = this;
       var g = this.getSVGFeatureGroupSelections();
       var featureg = g.data(this.geoFeatures.features)
          .enter().append('g')
          .attr('class', self.id)

       var features = featureg.append(this.svg_type);


       if(this.svg_type == 'path'){
         features.attr('d', this._path_draw);
       } else {
         featureg.attr('transform', function(d){ return 'translate(' + self._project_to_screen(d.geometry.coordinates)[0] + ',' + self._project_to_screen(d.geometry.coordinates)[1] + ')'})
       }

       // set other passed attributes
       this._attrs.forEach(function(a){
         features.attr(a.name, a.value);
       })
       // add layer's id to class
       features.attr('class', function(d, el) {
         // in case the _attrs contain class setting
         return d3.select(this).attr('class') + " " + self.id;
       });
       // set passed styles
       this._styles.forEach(function(s){
         features.style(s.name, s.value);
       })

     },


     redraw: function() {
       var self = this;
       if (this.svg_type != 'path') {
         this.getSVGFeatureGroupSelections()
           .attr('transform', function(d){ return 'translate(' + self._project_to_screen(d.geometry.coordinates)[0] + ',' + self._project_to_screen(d.geometry.coordinates)[1] + ')'})
       } else {
         this.getSVGFeatureSelections().attr('d', self._path_draw)
       }
     },

     getSVGLayerSelector: function(){ return this._svg_layer_sel; },

     getSVGFeatureSelections: function() {
       return d3.select(this._svg_layer_sel).selectAll(this.svg_type);
     },

     getSVGFeatureGroupSelections: function() {
       return d3.select(this._svg_layer_sel).selectAll('.' + this.id);
     },

     _project_to_screen: function(o) {
       var p = new Point(o[0], o[1]);
       var point = this.map.toScreen(webMercatorUtils.geographicToWebMercator(p))
       return [point.x, point.y];
     }

     // events handle
     // getSVGFeatureSelections.on(eventType, eventHandlor)
     // follow d3, eventType is like: 'click', 'mouseover', 'mouseout', ...
     // eventHandlor is like: function(d) {}

   });

  });
