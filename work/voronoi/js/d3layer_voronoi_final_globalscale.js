// based on ArcGIS API for JavaScript 3.13

define([
    "dojo/_base/declare",
    "esri/geometry/Point",
    "dojo/_base/lang",
    "esri/geometry/webMercatorUtils",
    "esri/layers/GraphicsLayer",
    "js/lib/d3.js",
    "js/lib/d3.helper.js"
  ],
  function(
    declare,
    Point,
    lang,
    webMercatorUtils,
    GraphicsLayer,
    d3,
    d3helper) {

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

       // this property is only for hackathon test
       this.originalAttributes = ['Hydro', 'Landfill_G', 'Solar', 'Wind', 'Wood'];
       this.allAttributes = ['Hydro', 'Solar', 'Wind', 'Landfill_G', 
       'Hydro_Norm', 'Wind_Norm', 'Solar_Norm', 'Wood_Norm', 'Landfill_1', 'OrdinalHyd', 'OrdinalSol', 'OrdinalWin', 'OrdinalWoo', 'OrdinalGas'];

       this.ordinalAttributes = ['OrdinalHyd', 'OrdinalSol', 'OrdinalWin', 'OrdinalWoo', 'OrdinalGas'];
       this.ordinalAttrMap = {'OrdinalHyd': 'Hydro', 'OrdinalSol': 'Solar', 'OrdinalWin': 'Wind', 'OrdinalWoo': 'Wood', 'OrdinalGas': 'Landfill_G'};

       this.allOriNormOrdAttr = {'Hydro': {'norm': 'Hydro_Norm', 'ordinal': 'OrdinalHyd'}, 
       'Landfill_G': {'norm': 'Landfill_1', 'ordinal': 'OrdinalGas'}, 
       'Solar': {'norm': 'Solar_Norm', 'ordinal': 'OrdinalSol'}, 
       'Wind': {'norm': 'Wind_Norm', 'ordinal': 'OrdinalWin'}, 
       'Wood': {'norm': 'Wood_Norm', 'ordinal': 'OrdinalWoo'} };


       this._redraw = map.on("zoom-end", lang.hitch(this, function() {
         this.redraw();
       }));

       this._path_draw = d3.geo.path().projection(self._project_to_screen);
       
       d3.select(this._svg_layer_sel).selectAll('g').remove();

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

    _circleTween: function(coordinates) {  
      var circle = [],
          length = 0,
          lengths = [length],
          polygon = d3.geom.polygon(coordinates),
          p0 = coordinates[0],
          p1,
          x,
          y,
          i = 0,
          n = coordinates.length;

      // Compute the distances of each coordinate.
      while (++i < n) {
        p1 = coordinates[i];
        x = p1[0] - p0[0];
        y = p1[1] - p0[1];
        lengths.push(length += Math.sqrt(x * x + y * y));
        p0 = p1;
      }

      var area = polygon.area(),
          radius = Math.sqrt(Math.abs(area) / Math.PI),
          centroid = polygon.centroid(-1 / (6 * area)),
          angleOffset = -Math.PI / 2, // TODO compute automatically
          angle,
          i = -1,
          k = 2 * Math.PI / lengths[lengths.length - 1];

      // Compute points along the circle’s circumference at equivalent distances.
      while (++i < n) {
        angle = angleOffset + lengths[i] * k;
        circle.push([
          centroid[0] + radius * Math.cos(angle),
          centroid[1] + radius * Math.sin(angle)
        ]);
      }

      //console.log(circle)
      return circle;
    },

    // pathCoords is a lengh-7 2d coord array
    // varied pairs of coord in each el in the array, el corresponds voronoi cell
    _removeUndefCoords: function(pathCoords){
      // sometimes, there might be length-0 array with undefined element returned, could be d3.clip bug
      // have to remove these null elements
      var res = pathCoords.slice();
      var removalIdx = [];
      for(var i = 0; i < res.length; i++){
        if(typeof res[i][0] == 'undefined' || res[i][0] == null ){
          removalIdx.push(i);
        }
      }


      //need to sort in des order, so to use splice() without messing up the indexes of the yet-to-be-removed items
      removalIdx.sort(function(a,b){ return b - a; });

      for (var i = 0; i < removalIdx.length; i++){
        res.splice(removalIdx[i], 1);
      }

      return res;

    },

     // changed for voronoi map 
     _render: function() {
       var self = this;
       var g = this.getSVGFeatureGroupSelections();
       var featureg = g.data(this.geoFeatures.features)
          .enter().append('g')
          .attr('class', function(d){ return self.id + ' ' + d.properties.name })

     


       if(this.svg_type == 'path'){
        featureg.attr("transform", function(d) {

          var centroid = self._path_draw.centroid(d),
              x = centroid[0] || 0,
              y = centroid[1] || 0;
          return "translate(" + x + "," + y + ")"  + "scale(" + 0.8 + ")" + "translate(" + -x + "," + -y + ")"
        })

        featureg.each(function(d){
          
          
          var forTooltip = {};
          for(var i = 0; i < self.allAttributes.length; i++){
              forTooltip[self.allAttributes[i]] = +d.properties[self.allAttributes[i]];
          }
            



          // complex shape, skip for now
          if(d.properties.name == 'Alaska') return;

           var centroid = self._path_draw.centroid(d),
               x = centroid[0] || 0,
               y = centroid[1] || 0;

          var stateTweening = d3.select(this).append('path').attr('class', 'tweenState').style("stroke-width", 1);
          //TODO
          var coordinates0 = [];
          if(d.geometry.coordinates.length == 1){
            coordinates0 = d.geometry.coordinates[0].map(self._project_to_screen);
          } else{
            for(var i = 0; i < d.geometry.coordinates.length; i++){
              var coord = d.geometry.coordinates[i]
              coordinates0 = coordinates0.concat(coord[0].map(self._project_to_screen))
            }
          }
          
          
          //var coordinates0 = d.geometry.coordinates[0].map(self._project_to_screen),
          var coordinates1 = self._circleTween(coordinates0),
              d0 = "M" + coordinates0.join("L") + "Z",
              d1 = "M" + coordinates1.join("L") + "Z";

          stateTweening.attr('d', d0);

          // how many voronoi cells for each state
          /*
          var validDimensions = [];
          for (var i = 0; i < self.validAttributes.length; i++){
            var aval = d.properties[self.validAttributes[i]];
            if(!isNaN(aval) && +aval != 0){
              validDimensions.push(self.validAttributes[i])
            }
          }
          */

    
          var allEngergyAry = self.allAttributes.map(function(a){ return [a, +d.properties[a]] });          
          allEngergyAry.sort(
            function(a, b) {
                return a[1] - b[1]
            }
          )

          var ordinalEngergyAry = self.ordinalAttributes.map(function(a){ return [a, +d.properties[a]] });          
          ordinalEngergyAry.sort(
            function(a, b) {
                return a[1] - b[1]
            }
          )

          // problem with the vorVertics (seeds)
          var vorSeeds = d3.range(self.ordinalAttributes.length).map(function(d) {
            return [x + Math.random() , y + Math.random() ];
          });



          var ext = self._path_draw.bounds(d);
          var voronoi = d3.geom.voronoi().clipExtent(ext);
          var vorCells = generateBestVoronoiVertices();
 

          // Hawaii has a problem
          if(typeof vorCells == 'undefined') return;

          var vorPoly0 = d3.geom.polygon(coordinates0),
              vorPoly1 = d3.geom.polygon(coordinates1);

          // lengh-7 2d coord array
          // varied pairs of coord in each el in the array, el corresponds voronoi cell
          var vorPathData0 = vorCells.map(function(d){ return d3.geom.polygon(d).clip(vorPoly0.slice()) }),
              // voronoi was clipped by spatial extent
              //vorPathData1 = vorCells.map(function(d){ return d3.geom.polygon(d).clip(vorPoly1.slice()) });
              // spatial extent
              vorPathData1 = vorCells.map(function(d){ return d3.geom.polygon(d) });

          
       
          // sometimes, there might be length-0 array with undefined element returned, could be d3.clip bug
          // have to remove these null elements

          vorPathData0 = self._removeUndefCoords(vorPathData0);

          //store the path data
          d.vorPathDataState = vorPathData0;
          d.vorPathDataExt = vorPathData1;


          d.vorGeoCoordsState = vorPathData0.map(function(p){ return p.map(function(r){ var wtg = esri.geometry.webMercatorToGeographic(self.map.toMap(new esri.geometry.ScreenPoint(r[0],r[1]))); return [wtg.x, wtg.y]})  });
          d.vorGeoCoordsExt = vorPathData1.map(function(p){ return p.map(function(r){ var wtg = esri.geometry.webMercatorToGeographic(self.map.toMap(new esri.geometry.ScreenPoint(r[0],r[1]))); return [wtg.x, wtg.y]})  });
            //d.vor1GeoCoords = vorPathData1[i].map(function(r){ var wtg = esri.geometry.webMercatorToGeographic(map.toMap(new esri.geometry.ScreenPoint(r[0],r[1]))); return [wtg.x, wtg.y]}) 


          var vorPathData0Area = vorPathData0.map(function(d){ return typeof d[0] == 'undefined' ? 0 : Math.abs(Math.round(d3.geom.polygon(d).area())) }).sort(function(a, b){ return a - b }),
              vorPathData1Area = vorPathData1.map(function(d){ return typeof d[0] == 'undefined' ? 0 : Math.abs(Math.round(d3.geom.polygon(d).area())) }).sort(function(a, b){ return a - b });
          //var vorGeoCells = vorCells.map(function(c){ return c.map(function(d){ var wtg = esri.geometry.webMercatorToGeographic(map.toMap(new esri.geometry.ScreenPoint(d[0],d[1]))); return [wtg.x, wtg.y]})});
    
          //console.log(forTooltip)
  
          var vorPath = d3.select(this).append('g').selectAll('.voronoi')
            .data(vorPathData0).enter()
            .append('path')
            // the area of each cell is reflected on the class
            //.attr('area', function(d){ return typeof d[0] == 'undefined' ? 0 : d3.geom.polygon(d).area()})
            // here, can based on the energy proportion, ie, sort the proportions, smallest energy value will have smallest area of voronoi cell
            // TODO, waiting for energy data
            .attr('class', function(d){ var area = typeof d[0] == 'undefined' ? 0 : Math.abs(Math.round(d3.geom.polygon(d).area())); var curEnergyNameValue = ordinalEngergyAry[vorPathData0Area.indexOf(area)]; return curEnergyNameValue[1] == 0 ? 'voronoi hidden' : 'voronoi ' + self.ordinalAttrMap[curEnergyNameValue[0]] })
            //.attr(forTooltip)
            .attr('energyType', function(d){

              var area = typeof d[0] == 'undefined' ? 0 : Math.abs(Math.round(d3.geom.polygon(d).area())); 
              var curEnergyNameValue = ordinalEngergyAry[vorPathData0Area.indexOf(area)]; 
              return self.ordinalAttrMap[curEnergyNameValue[0]]

            })
           
           /*
            .attr('title', function(d){ 
              var area = typeof d[0] == 'undefined' ? 0 : Math.abs(Math.round(d3.geom.polygon(d).area())); 
              var curEnergyNameValue = ordinalEngergyAry[vorPathData0Area.indexOf(area)]; 
              return curEnergyNameValue[0] + ': ' + curEnergyNameValue[1] 

            })
          */
            .attr("d", function(d){ var s = "M" + d.join("L") + "Z"; return s == 'MZ'? '' : s; })
            .on('mouseover', function(d){          
              d3.select(this).classed('mouseover', true)
             

              /*
              $('<div id="vorDialog"></div>').dialog({
                modal: false,
                dialogClass: "noTitleStuff",
               
                open: function () {
                    var markup = 'Hello World';
                    $(this).html(markup);
                },
                buttons: {
                    Ok: function () {
                        $(this).dialog("close");
                    }
                }
              }); //end confirm dialog
              */

            })
            .on('mouseout', function(d){
              /* $("#vorDialog").dialog( "close" ); */
              d3.select(this).classed('mouseover', false)

            })
            .call(d3.helper.tooltipOrdinal(forTooltip, self.allOriNormOrdAttr))




          vorPath.each(function(d, i){   
          /*           
            $(this).tooltip({
              track: true
            });
          */
          })
          /*
          loop();
          function loop(){
            stateTweening.attr("d", d0)
            .transition()
            .duration(2000)
            .attr("d", d1)
            .transition()
            .delay(2000)
            .attr("d", d0)
            .each("end", loop);
          }       
         //stateTweening.attr('d', self._path_draw);
         */

         //loop();
          function loop(){
            vorPath
            .attr("d", function(d){ var s = "M" + d.join("L") + "Z"; return s == 'MZ'? '' : s; })
            //.attr('class', function(d){ var area = typeof d[0] == 'undefined' ? 0 : Math.abs(Math.round(d3.geom.polygon(d).area())); return 'voronoi ' + vorPathData0Area.indexOf(area)})

            .transition()
            .duration(4000)
            .attr("d", function(d, i){ var dd = vorPathData1[i]; var s = "M" + dd.join("L") + "Z"; return s == 'MZ'? '' : s;  })
            //.attr('class', function(d, i){ var dd = vorPathData1[i]; var area = typeof dd[0] == 'undefined' ? 0 : Math.abs(Math.round(d3.geom.polygon(dd).area())); return 'voronoi ' + vorPathData1Area.indexOf(area)})

            .transition()
            .delay(5000)
            .attr("d", function(d){ var s = "M" + d.join("L") + "Z"; return s == 'MZ'? '' : s;  })
            //.attr('class', function(d){ var area = typeof d[0] == 'undefined' ? 0 : Math.abs(Math.round(d3.geom.polygon(d).area())); return 'voronoi ' + vorPathData0Area.indexOf(area)})

            .each("end", loop);

          }

          function generateBestVoronoiVertices(){
            var iter = 0;
            while(iter<20){ // max exe count, 10, 100

              var voroCells= montecarlo();
              if(voroCells){
                return voroCells;
              }
              iter++
            }

            function montecarlo(){
              var vCells = voronoi(vorSeeds),
                 dx = 0,
                 dy = 0;


              for (var i = 0, n = vCells.length; i < n; ++i) {
                var cell = vCells[i];
                if (cell == null) continue;

                var area = d3.geom.polygon(cell).area(),
                    //centroid = cell.centroid(-0.5 / (6 * area)),
                    centroid = cell.centroid(-1 / (6 * area)),
                    vertex = vorSeeds[i],
                    tauX = centroid[0] - vertex[0],
                    tauY = centroid[1] - vertex[1];
                dx += Math.abs(tauX);
                dy += Math.abs(tauY);
                vertex[0] += tauX, vertex[1] += tauY;

              }

              return (dx * dx + dy * dy < ext[1][0] * ext[1][1]/50) ? vCells : false;
              // equal-sized
              //return (dx * dx + dy * dy < 100)? vCells : false;
            }

          }

        })
        
       } else {
        var features = featureg.append(self.svg_type);
         featureg.attr('transform', function(d){ return 'translate(' + self._project_to_screen(d.geometry.coordinates)[0] + ',' + self._project_to_screen(d.geometry.coordinates)[1] + ')'})
       

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

      }

     },

    


     redraw: function() {
       var self = this;
       if (this.svg_type != 'path') {
         this.getSVGFeatureGroupSelections()
           .attr('transform', function(d){ return 'translate(' + self._project_to_screen(d.geometry.coordinates)[0] + ',' + self._project_to_screen(d.geometry.coordinates)[1] + ')'})
       } else {
        console.log('d3layer redraw')
        




        // option 1, deal with the stored geo coords, reproject
        // option 2, deal with the stored screen coords, consider extent changed
        // 

        var g = this.getSVGFeatureGroupSelections()
        
          .attr("transform", function(d) {

            var centroid = self._path_draw.centroid(d),
                x = centroid[0] || 0,
                y = centroid[1] || 0;

             
            return "translate(" + x + "," + y + ")"  + "scale(" + 0.8 + ")" + "translate(" + -x + "," + -y + ")"
       
          })
         

        

        g.each(function(d){
           var stateTweening = d3.select(this).select('.tweenState').attr('d', self._path_draw)

           if(d.properties.name == 'Alaska' || d.properties.name == "Hawaii") return;    
      
          

          var vorPathData0 = d.vorGeoCoordsState.map(function(g){ return g.map(self._project_to_screen)}),
              vorPathData1 = d.vorGeoCoordsExt.map(function(g){ return g.map(self._project_to_screen)});

          d.vorPathDataState = vorPathData0;
          d.vorPathDataExt = vorPathData1;

          var vorPathData0Area = vorPathData0.map(function(d){ return typeof d[0] == 'undefined' ? 0 : Math.abs(Math.round(d3.geom.polygon(d).area())) }).sort(function(a, b){ return a - b }),
              vorPathData1Area = vorPathData1.map(function(d){ return typeof d[0] == 'undefined' ? 0 : Math.abs(Math.round(d3.geom.polygon(d).area())) }).sort(function(a, b){ return a - b });
        

          // TODO

          var validDimensions = [];
          for (var i = 0; i < self.validAttributes.length; i++){
            var aval = d.properties[self.validAttributes[i]];
            if(!isNaN(aval) && +aval != 0){
              validDimensions.push(self.validAttributes[i])
            }
          }

          var validEngergyAry = validDimensions.map(function(a){ return [a, +d.properties[a]] });          
          validEngergyAry.sort(
            function(a, b) {
                return a[1] - b[1]
            }
          )


          var vorPath = d3.select(this).select('g').selectAll('.voronoi').data(vorPathData0)
           // the area of each cell is reflected on the class
            //.attr('area', function(d){ return typeof d[0] == 'undefined' ? 0 : d3.geom.polygon(d).area()})
            // here, can based on the energy proportion, ie, sort the proportions, smallest energy value will have smallest area of voronoi cell
            // TODO, waiting for energy data
            .attr('class', function(d){ var area = typeof d[0] == 'undefined' ? 0 : Math.abs(Math.round(d3.geom.polygon(d).area())); var curEnergyNameValue = validEngergyAry[vorPathData0Area.indexOf(area)]; return curEnergyNameValue[1] == 0 ? 'voronoi hidden' : 'voronoi ' + curEnergyNameValue[0]})
            .attr('energyType', function(d){

              var area = typeof d[0] == 'undefined' ? 0 : Math.abs(Math.round(d3.geom.polygon(d).area())); 
              var curEnergyNameValue = ordinalEngergyAry[vorPathData0Area.indexOf(area)]; 
              return self.ordinalAttrMap[curEnergyNameValue[0]]

            })
            //.call(d3.helper.tooltipOrdinal(forTooltip, self.allOriNormOrdAttr))

            
          if(curVoronoiShape == 'extent'){

            vorPath.attr("d", function(d){ var s = "M" + d.join("L") + "Z"; return s == 'MZ'? '' : s; });

          } else if(curVoronoiShape == 'state'){

            vorPath.attr("d", function(d, i){ var dd = vorPathData1[i]; var s = "M" + dd.join("L") + "Z"; return s == 'MZ'? '' : s;  });
            
          } else{
            vorPath
            .attr("d", function(d){ var s = "M" + d.join("L") + "Z"; return s == 'MZ'? '' : s; })
            .transition()
            .duration(4000)
            .attr("d", function(d, i){ var dd = vorPathData1[i]; var s = "M" + dd.join("L") + "Z"; return s == 'MZ'? '' : s;  })
            .transition()
            .delay(5000)
            .attr("d", function(d){ var s = "M" + d.join("L") + "Z"; return s == 'MZ'? '' : s;  })

          }

 

          //loop();
          function loop(){
            vorPath
            .attr("d", function(d){ var s = "M" + d.join("L") + "Z"; return s == 'MZ'? '' : s; })
            .transition()
            .duration(4000)
            .attr("d", function(d, i){ var dd = vorPathData1[i]; var s = "M" + dd.join("L") + "Z"; return s == 'MZ'? '' : s;  })
            .transition()
            .delay(5000)
            .attr("d", function(d){ var s = "M" + d.join("L") + "Z"; return s == 'MZ'? '' : s;  })
            .each("end", loop);

          }

          function generateBestVoronoiVertices(){
            var iter = 0;
            while(iter<20){ // max exe count, 10, 100

              var voroCells= montecarlo();
              if(voroCells){
                return voroCells;
              }
              iter++
            }

            function montecarlo(){
              var vCells = voronoi(vorSeeds),
                 dx = 0,
                 dy = 0;

              for (var i = 0, n = vCells.length; i < n; ++i) {
                var cell = vCells[i];
                if (cell == null) continue;

                var area = d3.geom.polygon(cell).area(),
                    //centroid = cell.centroid(-0.5 / (6 * area)),
                    centroid = cell.centroid(-1 / (6 * area)),
                    vertex = vorSeeds[i],
                    tauX = centroid[0] - vertex[0],
                    tauY = centroid[1] - vertex[1];
                dx += Math.abs(tauX);
                dy += Math.abs(tauY);
                vertex[0] += tauX, vertex[1] += tauY;

              }

              return (dx * dx + dy * dy < ext[1][0] * ext[1][1]/20)? vCells : false;
              // equal-sized
              //return (dx * dx + dy * dy < 100)? vCells : false;
            }

          }

          

        })
                
        /*
        g.each(function(d){

          var coordinates0 = [];
          if(d.geometry.coordinates.length == 1){
            coordinates0 = d.geometry.coordinates[0].map(self._project_to_screen);
          } else{
            for(var i = 0; i < d.geometry.coordinates.length; i++){
              var coord = d.geometry.coordinates[i]
              coordinates0 = coordinates0.concat(coord[0].map(self._project_to_screen))
            }
          }
          
          var coordinates1 = self._circleTween(coordinates0);

          var vorPoly0 = d3.geom.polygon(coordinates0),
              vorPoly1 = d3.geom.polygon(coordinates1);

          var vorPathData0 = d.vorCells.map(function(d){ return d3.geom.polygon(d).clip(vorPoly0.slice()) }),
              vorPathData1 = d.vorCells.map(function(d){ return d3.geom.polygon(d).clip(vorPoly1.slice()) });

         

          var vorPath = d3.select(this).select('g').selectAll('.voronoi');

          loop();
          function loop(){
            vorPath
            .attr("d", function(d){ var s = "M" + d.join("L") + "Z"; return s == 'MZ'? '' : s; })
            .transition()
            .duration(4000)
            .attr("d", function(d, i){ var dd = vorPathData1[i]; var s = "M" + dd.join("L") + "Z"; return s == 'MZ'? '' : s;  })
            .transition()
            .delay(5000)
            .attr("d", function(d){ var s = "M" + d.join("L") + "Z"; return s == 'MZ'? '' : s;  })
            .each("end", loop);

          }

          

        })
        */
         
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
