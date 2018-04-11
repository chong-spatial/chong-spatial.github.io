// ----------------------------------------------------------------------
var map;                             // Map object used to add layers
var sMapProjWGS84    = "EPSG:4326";   // WGS 1984
var sMapProjMercator = "EPSG:900913"; // Spherical Mercator
var mapProjWGS84    = new OpenLayers.Projection(sMapProjWGS84);
var mapProjMercator = new OpenLayers.Projection(sMapProjMercator);

var filterStrategy = new OpenLayers.Strategy.Filter();  // Chong
var routesVector_layer; // Chong

OpenLayers.ImgPath = "images/map/dark/";



// ----------------------------------------------------------------------------
// Adapted from:
// http://www.soyoucode.com/2010/make-linestring-resolution-depend-on-level-in-openlayers
OpenLayers.Renderer.Smart = OpenLayers.Class(OpenLayers.Renderer.SVG, {

    getComponentsString: function (components, separator) {
        // I got bored trying to figure out a smart formula to calculate the zoomFactor
        // it works as follows: if the zoom is found among the array, that zoomFactor is picked, otherwise we go down until we find one
        var zoomFactors = new Array();
        // 0 is a mandatory key
        zoomFactors[0] = 1000;
        zoomFactors[1] = 500;
        zoomFactors[2] = 400;
        zoomFactors[3] = 300;
        zoomFactors[4] = 200;
        zoomFactors[5] = 100;
        zoomFactors[6] = 50;
        zoomFactors[7] = 10;
        zoomFactors[9] = 1;

        var zoomIndex = this.map.zoom;
        var zoomFactor = zoomFactors[zoomIndex];

        // see comment above the zoomFactors array
        while (zoomFactor == undefined) {
            zoomIndex--;
            zoomFactor = zoomFactors[zoomIndex];
        }

        var renderCmp = [];
        var complete = true;
        var len = components.length;
        var strings = [];
        var str, component;

        // here is where we plug in the zoomFactor in the original code
        // so instead of rendering each and every point, we will skip n number of
        // points, based on the 'zoomFactors' array
        for (var i = 0; i < len; i += zoomFactor) {
            component = components[i];
            renderCmp.push(component);
            str = this.getShortString(component);
            if (str) {
                strings.push(str);
            } else {
                if (i > 0) {
                    if (this.getShortString(components[i - 1])) {
                        strings.push(this.clipLine(components[i],
                            components[i - 1]));
                    }
                }
                if (i < len - 1) {
                    if (this.getShortString(components[i + 1])) {
                        strings.push(this.clipLine(components[i],
                            components[i + 1]));
                    }
                }
                complete = false;
            }
        }

        return {
            path: strings.join(separator || ","),
            complete: complete
        };
    },

    CLASS_NAME: "OpenLayers.Renderer.Smart"
}); 



// ----------------------------------------------------------------------
function init() {
   // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   // Create the basic map.  Everything gets added to this.
   map = new OpenLayers.Map("basicMap", {
      div: "map",
      allOverlays: true // Allow turning off the map completely.
   });


   // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   // Add map layers.

   
 
   // Open Cycle Map
   var ocm = new OpenLayers.Layer.OSM(
         "OpenCycleMap",
         "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
         {opacity:0.4,visibility:false});
   

   // Open Transport Map
   var otm = new OpenLayers.Layer.OSM(
         "Transportation",
         "http://tile2.opencyclemap.org/transport/${z}/${x}/${y}.png",
         {opacity:0.4,visibility:false});
   

   // Open Street Map
   var osm = new OpenLayers.Layer.OSM(
         "OpenStreetMap",
         "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png",
         {opacity:0.4, visibility:true});
   
   
	
	// leaflet style, by Chong
	var stamen = new OpenLayers.Layer.OSM(
         "Stamen",
         "http://tile.stamen.com/toner/${z}/${x}/${y}.png",
         {isBaseLayer: true, opacity:0.8, visibility:false});	
	
  map.addLayers([ocm, otm, osm, stamen]);
	
   // Center the map according to the Qt mapSettings object.
   if( mapSettings.getPositionMapByExtents() )
   {
      //mapPage.test( "Positioning map by extents" );
      var extents = mapSettings.getExtents();
      var topLeft  = new OpenLayers.LonLat( extents[0], extents[1] );
      var botRight = new OpenLayers.LonLat( extents[2], extents[3] );
      topLeft.transform( mapProjWGS84, mapProjMercator );
      botRight.transform( mapProjWGS84, mapProjMercator );
      var bounds = new OpenLayers.Bounds();
      bounds.extend( topLeft );
      bounds.extend( botRight );
      map.zoomToExtent( bounds );
   }
   else
   {
      //mapPage.test( "Positioning map by center and zoom" );
      var centerPos = new OpenLayers.LonLat(mapSettings.getCenterLon(),mapSettings.getCenterLat());
      centerPos.transform( mapProjWGS84, mapProjMercator );
      map.setCenter( centerPos, mapSettings.getZoomLevel() );
   }

   // Allow the user to change the visible layers.
   //map.addControl(new OpenLayers.Control.Navigation());
   map.addControl(new OpenLayers.Control.LayerSwitcher());
   //map.addControl(new OpenLayers.Control.PanZoomBar({deltaY: 100}));
   //map.addControl(new OpenLayers.Control.Attribution());

  /*
    RoutesFilter and RoseOverlay
    @author Chong
  */
  
  /*
  var routesStyle = {
      //strokeColor: colorSettings.routeStroke,      
      strokeColor: "${getRouteColor}",      
      storkeWidth: 1
    }
  var ol_context = {
    getRouteColor: function(feature) {
      var nodeObj = $.grep(graphdata.nodes, function (el, idx) { return el.id == feature.attributes.partitionID; })[0];
      if (!nodeObj) return colorSettings.routeStroke;
      else return nodeColor(nodeObj["pagerank"]);        
    }
  };
  var routeSM = new OpenLayers.StyleMap(new OpenLayers.Style(routesStyle, { context: ol_context }) ); 
  */
  //makeSepGraph("graphvisdiv");
  makeConstraintGraph("graphvisdiv");
  
  routesVector_layer = new OpenLayers.Layer.Vector("Trajectory", {
    //style: routesStyle,
    styleMap: getStyleMapFirstTime('pagerank'),
    strategies: [ filterStrategy ],
    renderers: ["Canvas"]
  });
  var geojson_format = new OpenLayers.Format.GeoJSON({
    'internalProjection': map.baseLayer.projection,
    'externalProjection': new OpenLayers.Projection("EPSG:4326")
  });  
  map.addLayer(routesVector_layer);
  routesVector_layer.addFeatures(geojson_format.read(routesdata));

  
  overlayAfteradd();  
  //$( "#ctrlPane" ).draggable();
  $( "#ctrlWin").click(function() { 
    if(d3.select("#graphvisdiv").select("svg").attr("height") > 0) {      
      d3.select("#graphvisdiv").select("svg").transition().duration(1000).attr("height", "0");
      $(this).html("&or;");
    } else {     
      d3.select("#graphvisdiv").select("svg").transition().duration(1000).attr("height", "700");
      $(this).html("&and;");
    }
  });
  $('#graphpart' ).buttonset(); 
  

  // reset map
  $( "input[type=submit]" )
      .button()
      .click(function( event ) {
      
      d3.selectAll('.rosearcs path').style("fill", function(da){ return d3.select(this).attr('fillcolor')});    //'#E5E5E5'
        d3.selectAll('.roseg').style('display', null);
        filterStrategy.setFilter();
      });
  
  /* ----------------------------------------------------*/
  
   // Setup an action handlers to provide the map center position and
   // zoom level.
   //map.events.register("moveend", map, mapDetails);

   // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   // Add other layers to help interpret the data
   //addPointsOfInterest();
   //addAdministrativeBoundaries();//David

   //addKmlFiles("file://kml/taxi_topic6_06_09_result.kml");
   //console.log("Past the KML load");

   //movingMap(mapSettings.getCenterLon(), mapSettings.getCenterLat());

}
