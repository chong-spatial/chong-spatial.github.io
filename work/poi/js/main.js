var nodeid = {}, // include Ags graphic for each node
mapTextSymbols = {}; // save textSymbol graphic

var pointsInServiceAreas = {'hotel':{}, 'attraction':{}};

var colorbar4time = ['#bd0026', '#feb24c', '#d9ef8b', '#c7e9b4', '#7bccc4'];
//var colorbar4timeRGB = [[189,0,30,0.6], [254,178,76,0.25], [217,239,139,0.25], [199,233,180,0.25], [123,204,196,0.6]];
// var colorbar4timeRGB = [[], [71,255,4,0.25], [64, 171, 171,0.25], [140,177,241,0.25], []];
var colorbar4timeRGB = [[], [71,255,4,0.25], [255, 255, 0,0.25], [100, 149, 237,0.25], []];
// var colorStroke4timeRGB = [[], [255,255,0], [226,133,151], [219,125,226], []];
var colorStroke4timeRGB = [[], [127, 240, 127], [235, 217, 63], [205, 92, 92], []]; //230, 83, 83

/*
d3.select("#colorSpans").selectAll('span')
	.data(colorbar4timeRGB)
	.enter().append('span')
	.style('background-color', function(d){ return 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')'; });

d3.select("#timelabSpans").selectAll('span')
	.data(colorbar4timeRGB.map(function(d, i) { return (i + 1); }))
	.enter().append('span')
	.text(function(d){ return d + 'm'; });
*/
//d3.range(0, colorbar4time.length, ).map(function(d){ return })
