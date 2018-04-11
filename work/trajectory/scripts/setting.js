if( typeof(mapSettings) == "undefined") {
   mapSettings = {};
}
mapSettings.getPositionMapByExtents = function() {
   return false;  // must also define center and zoom
}; 

mapSettings.getCenterLon = function() {
   return 114.006451;
};

mapSettings.getCenterLat = function() {
   return 22.619696;
};

mapSettings.getZoomLevel = function() {
   return 12;
};

/*
MapColor and RoseChart settings
@author Chong
*/
var colorSettings = {
	  groupLinksStroke: '#7fc97f' // kinda Green
	, nodeStrokeRange: ["#1a9641", "#2c7bb6", "#d7191c"] //["#00f", "#ff0", "#f00"]
	, routeStroke: 'rgba(238, 153, 0, 0.5)' // kinda Yellow 
	, roseArcFill: "#58e" // kinda Blue
};

var roseSettings = {
	  displayZoom: 12
	, innersize: 10
	, rosesize: 30
	, labelpad: 5
}
