// SF geographical center coordinates
var sfctr = [-122.4194, 37.77449];


var vehicleURL = 'http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&t=',
	routeURL = "http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni",
	routeConfigURL = 'http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=';


var // all routes in SF
	routeMap = {},
	// hashmap for all tracted vehicles
	vehicleMap = {},
	// array for all tracked vehicles
	allTrackedVehicles = [],
	// max number of all vehicles that can record
	maxTrackedVehicles = 1000,
	// map for all inactive vehicles
	inactiveMap = {},
	// because of the timeout, mapSvg has been created early, FIXME for better solution
	// referesh vehicles every 6 seconds
	vehicleUpdateInterval = 6000,
	// use for inspection, if no activity in (vehicleUpdateInterval * longestHistoryLength) millisecond,
	// we highlight these vehicles in black
	longestHistoryLength = 30,
	// The longestLatestSameLonlatLength should be less than or equal to longestHistoryLength
	// if a bus has stopped at a location for vehicleUpdateInterval * longestHistoryLength milseconds in a row,
	// it will be warned in black box, and will be sending to the right pane to inspect.
	// right now 3 minutes, can add the inverval by making longestHistoryLength and longestLatestSameLonlatLength bigger
	longestLatestSameLonlatLength = 30,
	// The systemDelay specifies the last time that was returned by the vehicleLocations command. 
	// that is, the update time of the last vehicle location returned. 
	// This value can be used as the “t” parameter for the next call to the vehicleLocations
	// command so that only GPS reports since the last time the command was called will be returned. 
	// So basically, having a delay in the first time runing will see a few vehicles returned, otherwise, few will be returned.
	systemDelay = 1 * 60 * 1000;


var // minimum size for vehicle rect symbol
	minSymbolSize = 10,
	// route tree
	routeTree,
	// route color scale
	routeColorScale = d3.scale.ordinal().range(d3.scale.category10().range()),
	// realtime line chart
	delayChart,
	// The delayDeviationColorScale can be used as a global scale if a transportation expert have set the domain
	// Local scale is used at this time, i.e. the domain will be updated repeatly
	delayDeviationColorScale = d3.scale.linear().range(["#ccc", '#777', '#000']);
	
	
var mapg, projection, zoom, lastZoomLevel;


