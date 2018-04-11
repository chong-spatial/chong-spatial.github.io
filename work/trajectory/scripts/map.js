// ----------------------------------------------------------------------
var map;                             // Map object used to add layers
var mapLayers       = new Array();   // Array of route layers on the map
var cxxLayers       = new Array();   // Current route layer being processed
var sMapProjWGS84    = "EPSG:4326";   // WGS 1984
var sMapProjMercator = "EPSG:900913"; // Spherical Mercator
var mapProjWGS84    = new OpenLayers.Projection(sMapProjWGS84);
var mapProjMercator = new OpenLayers.Projection(sMapProjMercator);
var markerLayer = new OpenLayers.Layer.Markers( "Markers" ); //Wendy add for markLayer

var filterStrategy = new OpenLayers.Strategy.Filter(); // Chong



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
function addMarkers( layer, markers, icon )
{
   for( var i = 0; i< markers.length; i++ )
   {
      markers[i].transform( mapProjWGS84, map.getProjectionObject() );
      layer.addMarker( new OpenLayers.Marker(markers[i], icon.clone()) );
   }
}

// ----------------------------------------------------------------------
function addAdministrativeBoundaries()
{
   var format = new OpenLayers.Format.OSM();
   format.internalProjection = mapProjWGS84;
   format.externalProjection = mapProjMercator;

   // Initialize the vector layer using OpenLayers.Format.ODM
   var layer = new OpenLayers.Layer.Vector("Boundaries", {
      strategies: [new OpenLayers.Strategy.Fixed()],
      protocol: new OpenLayers.Protocol.HTTP({
         url:   "www/kml/guangdong.administrative.osm",    // <-- Relative or absolute URL to .osm file
         format: format
      }),
      projection: mapProjMercator
   });
   map.addLayer(layer);
}

// ----------------------------------------------------------------------
function addKmlFiles( urlKml )
{
   // Create a layer that contains the lines.
   var kmlLinesLayer = new OpenLayers.Layer.Vector("KML Lines", {
      strategies: [new OpenLayers.Strategy.Fixed()],
      protocol: new OpenLayers.Protocol.HTTP({
         url: "localhost/www/kml/lines.kml",
         format: new OpenLayers.Format.KML({
            extractStyles: true, 
            extractAttributes: true,
            maxDepth: 2
         })
      })
   });
   map.addLayer(kmlLinesLayer);
}

function addPointsOfData() //add by Wendy
{
   var size = new OpenLayers.Size(16,16);
   var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
   var markers = new Array();

   // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   // Transporation
   var layer = new OpenLayers.Layer.Markers( "Result" );
   map.addLayer(layer);

   // Rail
   markers.length = 0;
   markers[markers.length] = new OpenLayers.LonLat(114.116429,22.604403); // Buji Station
   markers[markers.length] = new OpenLayers.LonLat(113.882519,22.557545); // Boa'an Station
   markers[markers.length] = new OpenLayers.LonLat(114.0225  ,22.651667); // Longhua Station
   markers[markers.length] = new OpenLayers.LonLat(114.135044,22.558817); // Yijing Station
   addMarkers( layer, markers, new OpenLayers.Icon('icons/25_railtransportation.gif', size, offset) );
}


// ----------------------------------------------------------------------
function addPointsOfInterest()
{
   // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   // Generic setup
   var size = new OpenLayers.Size(16,16);
   var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
   var markers = new Array();

   // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   // Transporation
   var layer = new OpenLayers.Layer.Markers( "Transporation" );
   map.addLayer(layer);

   // Rail
   markers.length = 0;
   markers[markers.length] = new OpenLayers.LonLat(114.116429,22.604403); // Buji Station
   markers[markers.length] = new OpenLayers.LonLat(113.882519,22.557545); // Boa'an Station
   markers[markers.length] = new OpenLayers.LonLat(114.0225  ,22.651667); // Longhua Station
   markers[markers.length] = new OpenLayers.LonLat(114.135044,22.558817); // Yijing Station
   addMarkers( layer, markers, new OpenLayers.Icon('icons/25_railtransportation.gif', size, offset) );

   // Ferries
   markers.length = 0;
   markers[markers.length] = new OpenLayers.LonLat(113.909380,22.479267); // Shekou Port
   addMarkers( layer, markers, new OpenLayers.Icon('icons/26_watertransportation.gif', size, offset) );

   // Airport
   markers.length = 0;
   markers[markers.length] = new OpenLayers.LonLat(113.810833,22.639444); // Boa'an International Airport
   addMarkers( layer, markers, new OpenLayers.Icon('icons/20_airtransportation.gif', size, offset) );

   // Immigration
   markers.length = 0;
   markers[markers.length] = new OpenLayers.LonLat(114.113328,22.531082); // Hong Kong: Lo Wu Bridge
   markers[markers.length] = new OpenLayers.LonLat(114.065044,22.518164); // Hong Kong: Futian
   addMarkers( layer, markers, new OpenLayers.Icon('icons/39_immigration.gif', size, offset) );

   
   // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   // Destinations
   var layer = new OpenLayers.Layer.Markers( "Destinations" );
   map.addLayer(layer);

   // Universities
   markers.length = 0;
   markers[markers.length] = new OpenLayers.LonLat(113.933684,22.539256); // Shenzhen University
   addMarkers( layer, markers, new OpenLayers.Icon('icons/university.png', size, offset) );

   // Attractions
   markers.length = 0;
   markers[markers.length] = new OpenLayers.LonLat(113.969756,22.537514); // Window of the World
   markers[markers.length] = new OpenLayers.LonLat(114.048986,22.552672); // Lotus Flower Mountain Park
   markers[markers.length] = new OpenLayers.LonLat(114.054741,22.532655); // Shenzhen Convention Center
   addMarkers( layer, markers, new OpenLayers.Icon('icons/camera.png', size, offset) );
}

// ----------------------------------------------------------------------
function getLineFeaturesIncremental(layerName, iStart, iNum)
{
   // Sytle of the line
  // var style = cxxLayers[layerName].getSettings();//David
  var style = "";//Wendy add

   var features = new Array();
   //var routesIn = cxxLayers[layerName].getRoutes();//David
   var routesIn = cxxLayers[layerName].routes;//Wendy add
   for( var r = iStart; r < routesIn.length && r < (iStart+iNum); r++ )
   {
      var rt = routesIn[r];
      var lineStyle = { 
         //strokeColor:   rt.getColorString(), //David
         //strokeOpacity: rt.getOpacity(),
         //strokeWidth:   rt.getWeight(),
         //fillColor: "red"
         strokeColor:rt.color, //Wendy add
         strokeOpacity:rt.opacity,
         strokeWidth: 3,
         fillColor:rt.color
      };
     // var pointsIn = rt.getPoints();//David
     var pointsIn = rt.points;//Wendy add
      var points = new Array();
      for( var i = 0; i < pointsIn.length; i++ )
      {
         rtPoint = pointsIn[i];
         var p = new OpenLayers.Geometry.Point( rtPoint.lon/*getLon()*/,rtPoint.lat/*getLat()*/ );
         p.transform( mapProjWGS84, map.getProjectionObject() );
         points.push( p );
      }
      //////////add by Wendy, use to add points from dataset
     // if(points.length == 1)
      //{
       // addPointsOfData();
     // }else{

     // }
      var lineString = new OpenLayers.Geometry.LineString(points);
      //lineString = lineString.simplify(0.1);

      var lineFeature = new OpenLayers.Feature.Vector(lineString, null, lineStyle);
      features.push( lineFeature );
   }

   mapLayers[layerName].addFeatures( features );

   // Schedule the next segment if needed.
   if( (iStart+iNum) < routesIn.length )
   {
      var call = "getLineFeaturesIncremental(\""+layerName+"\","+(iStart+iNum)+","+iNum+");";
      setTimeout( call, 1 );
   }
}


// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
function movingMap(lon, lat)
{
   lon += 0.01;
   lat += 0.001;

   var centerPos = new OpenLayers.LonLat(lon, lat);
   centerPos.transform( mapProjWGS84, mapProjMercator );
   map.setCenter( centerPos, map.getZoom() );

   var call = "movingMap(\""+lon+"\","+lat+");";
   setTimeout( call, 100 );

}
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ---------------------------------------------------------------------


// ----------------------------------------------------------------------
function getLineFeatures(layerName)
{
   getLineFeaturesIncremental(layerName, 0, 100);
}

// ----------------------------------------------------------------------
function addLayerData( layer )
{
   // Permanently connect the individual layer so if it updates in the
   // back-end we get notified.
   //!@todo Need to work on a mechanism for updating the layers 
   //!      individually without replacing all the layers.
   //layer.RefreshLayerData.connect(addLayerData);
   //mapPage.removeLayer.connect(removeLayer);
  console.log(layer);
   //var name = layer.getName(); //Wendy
   var name = layer.name;//Wendy

   // Save the layer so it can be incrementally processed via a timer
   cxxLayers[name] = layer;

   // Create or clear out the layer.
   if( typeof mapLayers[name] === "undefined" )
   {
       mapLayers[name] = new OpenLayers.Layer.Vector(name, {
           renderers: ['Smart', 'VML', 'Canvas']
       });
	   
   }
   else
   {
      mapLayers[name].removeAllFeatures();
   }

   // Add the layer data into the map.
   getLineFeatures(name);
   map.addLayer(mapLayers[name]);
}

// ----------------------------------------------------------------------
function removeLayer( name )
{
   mapLayers[name].removeAllFeatures();

   //!@todo Is there a way to remove the features from the map entirely?
   //!      e.g.  
   //!        map.removeLayer(mapLayers[name]);
}

// ----------------------------------------------------------------------
function addLayers()
{
   //layersIn = mapPage.getLayers();
   layersIn = traj;
   for( var i = 0; i < layersIn.length; i++ )
   {

      addLayerData( layersIn[i] );
   }
}

// ----------------------------------------------------------------------
function mapDetails(e) {
   if( true || mapPage.getShowPosZoom() )
   {
      var string = "<B>Details</B>: <I>(Center Lon,Lat); Zoom = </I>";

      var center = map.getCenter();
      center.transform( mapProjMercator, mapProjWGS84 );
      string += "("
      string += center.lon.toFixed(6);
      string += ",";
      string += center.lat.toFixed(6);
      string += "); "
      string += map.getZoom();

      OpenLayers.Util.getElement("details").innerHTML = string;
   }
   else
   {
      OpenLayers.Util.getElement("details").innerHTML = "";
   }
}

// ----------------------------------------------------------------------
function init() 
{
   // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   // Create the basic map.  Everything gets added to this.
   map = new OpenLayers.Map("basicMap", {
      div: "map",
      allOverlays: true // Allow turning off the map completely.
   });

   // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   // Add map layers.

   
   // Cloud Made Map 1
   var cm = new OpenLayers.Layer.OSM(
         "Bgrd - Inverted",
         "http://b.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/999/256/${z}/${x}/${y}.png",
         {opacity:0.4,visibility:false});
   map.addLayer(cm);

   // Open Cycle Map
   var ocm = new OpenLayers.Layer.OSM(
         "Bgrd - Topography",
         "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
         {opacity:0.4,visibility:false});
   map.addLayer(ocm);

   // Open Transport Map
   var otm = new OpenLayers.Layer.OSM(
         "Bgrd - Transportation",
         "http://tile2.opencyclemap.org/transport/${z}/${x}/${y}.png",
         {opacity:0.4,visibility:false});
   map.addLayer(otm);

   // Open Street Map
   var osm = new OpenLayers.Layer.OSM(
         "Bgrd - OpenStreetMap",
         "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png",
         {opacity:0.4, visibility:false});
   map.addLayer(osm);
   
	
	// leaflet style, by Chong
	var stamen = new OpenLayers.Layer.OSM(
         "Stamen",
         "http://tile.stamen.com/toner/${z}/${x}/${y}.png",
         {isBaseLayer: true, opacity:0.8, visibility:true});	
	map.addLayer(stamen);
	
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
   map.addControl(new OpenLayers.Control.Attribution());


   // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   // Connect signals from the Qt code to script handlers.
   //mapPage.newLayer.connect(addLayerData);

   // Get all the layers that are currently setup for the page.
  //addLayers(); //commented by Chong


  /*
    RoutesFilter and RoseOverlay
    @author Chong
  */
  
  var routesStyle = {
      strokeColor: colorSettings.routeStroke,      
      storkeWidth: 1
    }
  
  var routesVector_layer = new OpenLayers.Layer.Vector("DetailedRoutes", {
    style: routesStyle,
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
  $('#graphpart' ).buttonset(); // Chong
  $( "input[type=submit]" )
      .button()
      .click(function( event ) {        
        filterStrategy.setFilter()
      });
  
  /* ----------------------------------------------------*/
  
   // Setup an action handlers to provide the map center position and
   // zoom level.
   map.events.register("moveend", map, mapDetails);

   // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   // Add other layers to help interpret the data
   addPointsOfInterest();
   //addAdministrativeBoundaries();//David

   //addKmlFiles("file://kml/taxi_topic6_06_09_result.kml");
   //console.log("Past the KML load");

   //movingMap(mapSettings.getCenterLon(), mapSettings.getCenterLat());

}
