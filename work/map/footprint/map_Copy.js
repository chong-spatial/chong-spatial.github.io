var width = 1360,
    height = 360;

var projection = d3.geo.mercator()
    .center([0, 10 ])
    .scale(200)
    .rotate([-180,0]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var path = d3.geo.path()
    .projection(projection);

var mapg = svg.append("g"),
	geog = mapg.append("g").attr("id", "geog"),
	footg = mapg.append("g").attr("id", "footg");

// load and display the World
d3.json("world-110m2.json", function(error, topology) {

	// load and display the cities
	d3.csv("footprint.csv", function(error, data) {
		var min = 32,
			max = 0;

		var lineTransition = function lineTransition(path) {
				path.transition()                
                .duration(5500)
                .attrTween("stroke-dasharray", tweenDash)
                .each("end", function(d,i) { 
                    //dostuff
                });
        };
        var tweenDash = function tweenDash() {
            //This function is used to animate the dash-array property, which is a
            //  nice hack that gives us animation along some arbitrary path (in this
            //  case, makes it look like a line is being drawn from point A to B)
            var len = this.getTotalLength(),
                interpolate = d3.interpolateString("0," + len, len + "," + len);

            return function(t) { return interpolate(t); };
        };

		var countryKey = [];
		data.forEach(function(d){
			if (!~countryKey.indexOf(d.country))
				countryKey.push(d.country);
			if(eval(d.stay) < min) min = eval(d.stay);
			if(eval(d.stay) > max) max = eval(d.stay);
		})
		
		var circleRscale = d3.scale.sqrt().domain ([min, max]).range([3, 15]);	
		
		var links = [];
		
		for (var k = 0; k < countryKey.length; ++k){
			var ck = countryKey[k];
			for(var i=0, len=data.length-1; i<len; i++){
				if (data[i].country == ck){
					links.push({
						type: "LineString",
						coordinates: [
							[ data[i].lon, data[i].lat ],
							[ data[i+1].lon, data[i+1].lat ]
						]
					})
				}
			} 
		}
	
	
	var pathArcs = footg.selectAll(".arc")
			.data(links)
			
	pathArcs.enter()
			.append("path")
			.attr("class", "arc")
			.style({
				'fill': "none",
				'stroke': "#00703C",
				'stroke-width': "1px"
			})
			.attr("d", path)
			.call(lineTransition);
			
	pathArcs.exit().remove();
        
	
    footg.selectAll("circle")
       .data(data)
       .enter()
       .append("a")
				  .attr("xlink:href", function(d) {
					  return "https://www.google.com/search?q="+d.city;}
				  )
       .append("circle")
       .attr("cx", function(d) {
               return projection([d.lon, d.lat])[0];
       })
       .attr("cy", function(d) {
               return projection([d.lon, d.lat])[1];
       })
       .attr("r", function(d) { return circleRscale(eval(d.stay))})
       .style({
			"stroke": "white",
			"fill": "#EE4500",
			"fill-opacity": 0.8
		})
		.attr("title", function(d) { return d.city})
		
	footg.selectAll("text")
       .data(data)
       .enter()
       
       .append("text")
       .attr("x", function(d) {
               return projection([d.lon, d.lat])[0];
       })
       .attr("y", function(d) {
               return projection([d.lon, d.lat])[1];
       })
	   .attr("text-anchor", "middle")	   
	   .text(function(d) { return d.seq})
	
	});


	geog.selectAll("path")
		.data(topojson.object(topology, topology.objects.countries)
        .geometries)
		.enter()
		.append("path")
		.attr("d", path)
});

// zoom and pan
var zoom = d3.behavior.zoom()
    .on("zoom",function() {
        mapg.attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        mapg.selectAll("circle")
            .attr("d", path.projection(projection));
        mapg.selectAll("path")  
            .attr("d", path.projection(projection)); 

  });

svg.call(zoom)