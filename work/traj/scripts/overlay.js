var nodeColor = d3.scale.linear()
		    //.domain([20, 40, 60])			
		    //.range(["#008837", "#ffffbf", "#7b3294"]);
			.domain([graphdata.pagerank[0], (graphdata.pagerank[0] + graphdata.pagerank[1])/2 , graphdata.pagerank[1]])
			//.range(["#d01c8b", "#4dac26"]);
			//.range(["#00f", "#ff0", "#f00"]);
			.range(colorSettings.nodeStrokeRange).clamp(true);

var routeNode,
	nodeid = [],
	roseCharts = [];

function getStyleMap (prop, time) {
	var isAllDay = time == 'allday';
	

	var routesStyle, ol_context;	
	if( prop == 'pagerank' || prop == 'betweenness' || prop == 'closeness')	{
		if (isAllDay) {
			nodeColor.domain([graphdata[prop][0], (graphdata[prop][0] + graphdata[prop][1])/2, graphdata[prop][1]]);
		} else {
			var minmaxSpecTime = d3.extent(graphdata.nodes, function(d) { return d.rank[prop][time/2] });
			nodeColor.domain([minmaxSpecTime[0], (minmaxSpecTime[0] + minmaxSpecTime[1])/2, minmaxSpecTime[1]]);
		}

		routesStyle = {
	      //strokeColor: colorSettings.routeStroke,      
	      strokeColor: "${getRouteColor}",      
	      storkeWidth: 1
    	}
  		ol_context = {
		    getRouteColor: function(feature) {
		      var nodeObj = $.grep(graphdata.nodes, function (el, idx) { return el.id == feature.attributes.partitionID; })[0];
		      if (!nodeObj) return colorSettings.routeStroke;
		      else return isAllDay ? nodeColor(nodeObj[prop]) : nodeColor(nodeObj.rank[prop][time/2]);        
		    }
  		};
	} else {
		if (prop == 'travelTime')
			nodeColor.domain([ trafficColor.travelTime[0], trafficColor.travelTime[1], trafficColor.travelTime[2] ]);
		else if (prop == 'flow')
			nodeColor.domain([ trafficColor.flow[0], trafficColor.flow[1], trafficColor.flow[2] ]);
		// speed
		else
			nodeColor.domain([ trafficColor.speed[0], trafficColor.speed[1], trafficColor.speed[2] ]);
		//speed [0, 80/75/70/60]
		//flow[0, 600/1000]
		//travetime[10/5, 0]

		routesStyle = {
	      //strokeColor: colorSettings.routeStroke,      
	      strokeColor: "${getRouteColor}",      
	      storkeWidth: 1
    	}
  		ol_context = {
		    getRouteColor: function(feature) {		      
		      return isAllDay ? nodeColor(d3.mean(feature.attributes[prop])) : nodeColor(feature.attributes[prop][time/2]);        
		    }
  		};

	}
	
  return new OpenLayers.StyleMap(new OpenLayers.Style(routesStyle, { context: ol_context }) );
}

function makeConstraintGraph(gid)	{
	// by default
	nodeColor.domain([graphdata.pagerank[0], (graphdata.pagerank[0] + graphdata.pagerank[1])/2 , graphdata.pagerank[1]]);

	var padding = 30,
		fixedRadius = 10,
		width = $(".topLeft").width(),
		height = $(".topLeft").height() -30; // minus menu height
	

	// code from Xiaoke with my edits
    var xScale = d3.scale.linear()
		.domain(graphdata.x).range([0+padding, width-padding]);

	var yScale = d3.scale.linear()
		.domain([graphdata.y[1], graphdata.y[0]]).range([padding, height-padding]);

	var zoom = d3.behavior.zoom()
	    .scaleExtent([1, 10])
	    .on("zoom", zoomed);

	var svg = d3.select("#" + gid).append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

    var rect = svg.append("rect")
	    .attr("width", width)
	    .attr("height", height)
	    .style("fill", "none")
	    .style("pointer-events", "all");
	var container = svg.append("g");
    function zoomed() {
  		container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}


	graphdata.links.forEach(function(d) {
    	d.source = graphdata.nodes[d.source];
    	d.target = graphdata.nodes[d.target];
    })

    graphdata.nodes.forEach(function(d) {
    	d.rank = {
    		'pagerank': d.rank.pagerank,
    		'betweenness': d.rank.betweenness, 
    		'closeness': d.rank.closeness, 
    		'averageSpeed': d.trafficInformation.averageSpeed, 
    		'travelTime': d.trafficInformation.travelTime,
    		'flow': d.trafficInformation.flow
       	}
       	d.r = fixedRadius;
       	d.xx = d.x;
       	d.yy = d.y;
       	d.x = xScale(d.x);
       	d.y = yScale(d.y);
       	//take an average of 12-val array
       	d.flow = d3.mean(d.trafficInformation.flow);
       	d.travelTime = d3.mean(d.trafficInformation.travelTime);
       	d.averageSpeed = d3.mean(d.trafficInformation.averageSpeed);
       	delete d.trafficInformation;
    })

    graphdata.flow = d3.extent(graphdata.nodes, function(d){ return d.flow});
    graphdata.travelTime = d3.extent(graphdata.nodes, function(d){ return d.travelTime});
    graphdata.averageSpeed = d3.extent(graphdata.nodes, function(d){ return d.averageSpeed});

	var links = container.append("g")
        .selectAll("line")
        .data(graphdata.links)
        .enter().append("line")
        .attr('class', 'node_line')
        .attr("id", function(d) { return 'from_' + d.source.id + '_to_' + d.target.id})
        //.attr("x1", function(d) { return xScale(d.source.x); })
        //.attr("y1", function(d) { return yScale(d.source.y); })
        //.attr("x2", function(d) { return xScale(d.target.x); })
        //.attr("y2", function(d) { return yScale(d.target.y); })
     

    var force = d3.layout.force()
		.nodes(graphdata.nodes)
		.size([width, height])
    	.gravity(0)
    	.charge(0)
    	.on("tick", tick)
    	.start();

    var labelg = container.append("g").attr("class", "label");

    var outlineNode = labelg
        .selectAll("circle")
        .data(graphdata.nodes)
        .enter()
        .append("circle")
        .attr("class", "nodeoutline")
        .attr("id", function(d) { return 'nodeline_' + d.id})
        .attr("r", nodelinkgraph.nodeshadow)
        //.attr("cx", function(d) { return xScale(d.x) })
        //.attr("cy", function(d) { return yScale(d.y) })

    routeNode = labelg
	    .selectAll("rect")
	    .data(graphdata.nodes)
	    .enter().append("rect") //outline rectangle	
	    .attr("class", "node")
	    .attr("id", function(d) { return 'node_' + d.id})
	    .style("fill", function(d) { return nodeColor(d["pagerank"]) })
	    //.attr("x", function(d) { return xScale(d.x) - nodelinkgraph.outline_rect_w/2 })
        //.attr("y", function(d) { return yScale(d.y) - nodelinkgraph.outline_rect_h/2 })    
	    .attr("ry", 4)
	    .attr("rx", 4)	    
	    .attr("height", nodelinkgraph.outline_rect_w)
	    .attr("width", nodelinkgraph.outline_rect_h)
	  
       
        

    var nodeLabel = labelg
	    .selectAll("text")
	    .data(graphdata.nodes)
	    .enter()
	    .append("text")
	    .text(function(d) { return d.id }) 	   
        //.attr("x", function(d) { return xScale(d.x) - this.getComputedTextLength()/2.0 })
        //.attr("y", function(d) { return yScale(d.y) }) 
        .attr("dy", ".35em")
        .attr("dx", ".3em")
        .attr("font-size", nodelinkgraph.textfontsize)
        .attr("fill", "#fff")
        .on("click", function(d) {
        	d3.event.stopPropagation();
        	//console.log("node clicked");
        	if ($('#mulsel').is(':checked') ){
        		if (!~nodeid.indexOf(d.id)){
        			nodeid.push(d.id);
        			d3.select("#nodeline_"+d.id).style("display", 'block');	
        		} else {
        			var index = nodeid.indexOf(d.id);
        			nodeid.splice(index, 1);
        			d3.select("#nodeline_"+d.id).style("display", null);	
        		}
        	} else {
        		nodeid = [d.id];
        		d3.selectAll(".nodeoutline").style("display", null);
        		d3.select("#nodeline_"+d.id).style("display", 'block');
        	}    
        	
        	updateFilter();
        	drawLine($('#lineSelect').val());
        })
        .on("mouseover", function(d) {
        	highlightlines(d.id, d3.select('#node_' + d.id).style("fill"));
        })
        .on("mouseout", function(d) {
        	clearlinelight();
        });   

    

    function tick(e) {
    	
    	links
    		.each(collide(.01))
    		.attr("x1", function(d) { return d.source.x })
        	.attr("y1", function(d) { return d.source.y })
        	.attr("x2", function(d) { return d.target.x })
        	.attr("y2", function(d) { return d.target.y })
        

        outlineNode
        	.each(collide(.01))
        	.attr("cx", function(d) { return d.x })
        	.attr("cy", function(d) { return d.y })

        routeNode
        	.each(collide(.01))
        	.attr("x", function(d) { return d.x- nodelinkgraph.outline_rect_w/2 })
        	.attr("y", function(d) { return d.y - nodelinkgraph.outline_rect_h/2 })    

        nodeLabel
        	.each(collide(.01))
        	.attr("x", function(d) { return d.x - this.getComputedTextLength()/2.0 -4})
        	.attr("y", function(d) { return d.y }) 
    }
 
	// Resolves collisions between d and all other circles.
	function collide(alpha) {
	  var quadtree = d3.geom.quadtree(graphdata.nodes);
	  return function(d) {
	    var r = d.r + 16
	        nx1 = d.x - r,
	        nx2 = d.x + r,
	        ny1 = d.y - r,
	        ny2 = d.y + r;
	    quadtree.visit(function(quad, x1, y1, x2, y2) {
	      if (quad.point && (quad.point !== d)) {
	        var x = d.x - quad.point.x,
	            y = d.y - quad.point.y,
	            l = Math.sqrt(x * x + y * y),
	            r = d.r + quad.point.r ;
	        if (l < r) {
	          l = (l - r) / l * alpha;
	          d.x -= x *= l;
	          d.y -= y *= l;
	          quad.point.x += x;
	          quad.point.y += y;
	        }
	      }
	      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	    });
	  };
	}

    function highlightlines(srcortarid, linecolor) {
		svg.selectAll('.node_line').each(function(d) {
			if (d.source.id == srcortarid) {
				d3.select(this).style("stroke", linecolor);
				d3.select(this).style("stroke-width", 3);
			} else if (d.target.id == srcortarid) {
				d3.select(this).style("stroke", linecolor);
				d3.select(this).style("stroke-width", 3);
			}
		})
		
    }
    function clearlinelight() {
    	svg.selectAll('.node_line').style('stroke', null);
    	svg.selectAll('.node_line').style("stroke-width", null);
    }

         

}

function makeSepGraph(gid)	{
	// by default
	nodeColor.domain([graphdata.pagerank[0], (graphdata.pagerank[0] + graphdata.pagerank[1])/2 , graphdata.pagerank[1]]);

	var padding = 30,
		width = $(".topLeft").width(),
		height = $(".topLeft").height() -30; // minus menu height
	

    // code from Xiaoke with my edits
    var xScale = d3.scale.linear()
		.domain(graphdata.x).range([0+padding, width-padding]);

	var yScale = d3.scale.linear()
		.domain([graphdata.y[1], graphdata.y[0]]).range([padding, height-padding]);

	var zoom = d3.behavior.zoom()
	    .scaleExtent([1, 10])
	    .on("zoom", zoomed);

	var svg = d3.select("#" + gid).append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

    var rect = svg.append("rect")
	    .attr("width", width)
	    .attr("height", height)
	    .style("fill", "none")
	    .style("pointer-events", "all");
	var container = svg.append("g");
    function zoomed() {
  		container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}


	graphdata.links.forEach(function(d) {
    	d.source = graphdata.nodes[d.source];
    	d.target = graphdata.nodes[d.target];
    })

    graphdata.nodes.forEach(function(d) {
    	d.rank = {
    		'pagerank': d.rank.pagerank,
    		'betweenness': d.rank.betweenness, 
    		'closeness': d.rank.closeness, 
    		'averageSpeed': d.trafficInformation.averageSpeed, 
    		'travelTime': d.trafficInformation.travelTime,
    		'flow': d.trafficInformation.flow
       	}
       	//take an average of 12-val array
       	d.flow = d3.mean(d.trafficInformation.flow);
       	d.travelTime = d3.mean(d.trafficInformation.travelTime);
       	d.averageSpeed = d3.mean(d.trafficInformation.averageSpeed);
       	delete d.trafficInformation;
    })

    graphdata.flow = d3.extent(graphdata.nodes, function(d){ return d.flow});
    graphdata.travelTime = d3.extent(graphdata.nodes, function(d){ return d.travelTime});
    graphdata.averageSpeed = d3.extent(graphdata.nodes, function(d){ return d.averageSpeed});

	var links = container.append("g")
        .selectAll("line")
        .data(graphdata.links)
        .enter().append("line")
        .attr('class', 'node_line')
        .attr("id", function(d) { return 'from_' + d.source.id + '_to_' + d.target.id})
        .attr("x1", function(d) { return xScale(d.source.x); })
        .attr("y1", function(d) { return yScale(d.source.y); })
        .attr("x2", function(d) { return xScale(d.target.x); })
        .attr("y2", function(d) { return yScale(d.target.y); })
     

    /*
	routeNode = container.append("g")
        .selectAll("circle")
        .data(graphdata.nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", 10)
        .attr("cx", function(d) { return xScale(d.x) })
        .attr("cy", function(d) { return yScale(d.y) })
        .attr("fill", function(d) { return nodeColor(d["pagerank"]) })
        .attr("stroke", "#aaa")
        .attr("stroke-width", 1)
        .on("click", function(d) {
        	//console.log("node clicked");
        	updateFilter(d.id);
        })
    */
    

    var labelg = container.append("g").attr("class", "label");

    var outlineNode = labelg
        .selectAll("circle")
        .data(graphdata.nodes)
        .enter()
        .append("circle")
        .attr("class", "nodeoutline")
        .attr("id", function(d) { return 'nodeline_' + d.id})
        .attr("r", nodelinkgraph.nodeshadow)
        .attr("cx", function(d) { return xScale(d.x) })
        .attr("cy", function(d) { return yScale(d.y) })

    routeNode = labelg
	    .selectAll("rect")
	    .data(graphdata.nodes)
	    .enter().append("rect") //outline rectangle	
	    .attr("class", "node")
	    .attr("id", function(d) { return 'node_' + d.id})
	    .style("fill", function(d) { return nodeColor(d["pagerank"]) })
	    .attr("x", function(d) { return xScale(d.x) - nodelinkgraph.outline_rect_w/2 })
        .attr("y", function(d) { return yScale(d.y) - nodelinkgraph.outline_rect_h/2 })    
	    .attr("ry", 4)
	    .attr("rx", 4)	    
	    .attr("height", nodelinkgraph.outline_rect_w)
	    .attr("width", nodelinkgraph.outline_rect_h)
	  
       
        

    var nodeLabel = labelg
	    .selectAll("text")
	    .data(graphdata.nodes)
	    .enter()
	    .append("text")
	    .text(function(d) { return d.id }) 
	    //.attr('transform', function(d) { return 'translate(' + (xScale(d.x) - this.getComputedTextLength()/2.0  ) + ',' + yScale(d.y)+')' })
        .attr("x", function(d) { return xScale(d.x) - this.getComputedTextLength()/2.0 })
        .attr("y", function(d) { return yScale(d.y) }) 
        .attr("dy", ".35em")
        .attr("dx", ".3em")
        .attr("font-size", nodelinkgraph.textfontsize)
        .attr("fill", "#fff")
        .on("click", function(d) {
        	d3.event.stopPropagation();
        	//console.log("node clicked");
        	if ($('#mulsel').is(':checked') ){
        		if (!~nodeid.indexOf(d.id)){
        			nodeid.push(d.id);
        			d3.select("#nodeline_"+d.id).style("display", 'block');	
        		} else {
        			var index = nodeid.indexOf(d.id);
        			nodeid.splice(index, 1);
        			d3.select("#nodeline_"+d.id).style("display", null);	
        		}
        	} else {
        		nodeid = [d.id];
        		d3.selectAll(".nodeoutline").style("display", null);
        		d3.select("#nodeline_"+d.id).style("display", 'block');
        	}    
        	
        	updateFilter();
        	drawLine($('#lineSelect').val());
        })
        .on("mouseover", function(d) {
        	highlightlines(d.id, d3.select('#node_' + d.id).style("fill"));
        })
        .on("mouseout", function(d) {
        	clearlinelight();
        });            
 
	/*
	var label = container.append("g")
        .selectAll("text")
        .data(graphdata.nodes)
        .enter()
        .append("text")            
        .attr("x", function(d) { return xScale(d.x) })
        .attr("y", function(d) { return yScale(d.y) })             
        .attr("font-size", 20)
        .attr("fill", "#777")
        .attr("opacity", 0.5)
        .text(function(d) { return d.id })
    */

    function highlightlines(srcortarid, linecolor) {
		svg.selectAll('.node_line').each(function(d) {
			if (d.source.id == srcortarid) {
				d3.select(this).style("stroke", linecolor);
				d3.select(this).style("stroke-width", 3);
			} else if (d.target.id == srcortarid) {
				d3.select(this).style("stroke", linecolor);
				d3.select(this).style("stroke-width", 3);
			}
		})
		
    }
    function clearlinelight() {
    	svg.selectAll('.node_line').style('stroke', null);
    	svg.selectAll('.node_line').style("stroke-width", null);
    }

         

}
function overlayAfteradd() {
	// Simple style
	// we can have complex style based on rule
	/*
	var featureLinksStyle = {
    	strokeColor: colorSettings.groupLinksStroke,
    	//strokeColor: 'rgba(44, 123, 182, 0.6)',    	
      	storkeWidth: 1
    }
	var featureLinksCollection = {"type": "FeatureCollection"},
		featureLinks = [];
	graphdata.links.forEach(function(d) {
    	d.source = graphdata.nodes[d.source];
    	d.target = graphdata.nodes[d.target];

    	
    	featureLinks.push({
    		"type": "Feature", 
    		"geometry": {"type": "LineString", "coordinates": [ [d.source.x, d.source.y], [d.target.x, d.target.y] ]},
        	"properties": {"sid": d.source.id, "tid": d.target.id}
        })
	});
	featureLinksCollection["features"] = featureLinks;

	var geojson_format = new OpenLayers.Format.GeoJSON({
		'internalProjection': map.baseLayer.projection,
        'externalProjection': new OpenLayers.Projection("EPSG:4326")
	});
	var linksVector_layer = new OpenLayers.Layer.Vector("GroupLinks", {style: featureLinksStyle});
	map.addLayer(linksVector_layer);
	linksVector_layer.addFeatures(geojson_format.read(featureLinksCollection));
	*/



	var overlay = new OpenLayers.Layer.Vector("RoseChart");
	
	overlay.afterAdd = function() {
		var div = d3.selectAll("#" + overlay.div.id);
		div.selectAll("svg").remove();
		var svg = div.append("svg").attr("class", "graph");
		
		var g = svg.selectAll("g")
			//.data(collection.features)
			.data(graphdata.nodes)
			.enter()
			.append("g")
			.attr("class", "route");
		
		/*
		var bounds = d3.geo.bounds(collection),
			path = d3.geo.path().projection(project);
		*/
		var bounds = [[graphdata.x[0], graphdata.y[0]], [graphdata.x[1], graphdata.y[1]]],
			path = d3.geo.path().projection(project);
		
		//var centroids = {};	

		/*
		{ "type": "Feature",
		        "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
		        "properties": {"prop0": "value0"}
		        },
				
		{ "type": "Feature",
		        "geometry": {
		          "type": "LineString",
		          "coordinates": [
		            [113.81529, 22.649702], [113.81549, 22.649796]
		            ]
		          },
		        "properties": {
		      "name": "test2", "test": 42,
		          "speed": [180, 120,113,159,67,89,96,69,87,120,130,140,150,160,170,180,190,200,210,220,186,156,145,123],
		          "flow": [0.8,0.6,0.8,0.9,0.56,0.20,0.11,0.9,0.96,0.99,0.5,0.4,0.36,0.89,0.96,0.93,0.82,0.4,0.36,0.89,0.96,0.93,0.82,0.23]
		          }
		        },
		*/	
		/*
		{"closeness": 0.2920634920634921, "degree": 0.05434782608695652, "rank": [0.8, 0.6, 0.8, 0.9, 0.56, 0.2, 0.11, 0.9, 0.96, 0.99, 0.5, 0.4, 0.36, 0.89, 0.96, 0.93, 0.82, 0.4, 0.36, 0.89, 0.96, 0.93, 0.82, 0.23], "pagerank": 0.006814110659093795, "y": 22.730768, "x": 114.028605, "id": "53", "betweenness": 0.00012124693801712434}
		*/	
		/*
		var featureNode = g.append("path")									
			.attr("d", function(d){ 
				var dobj = {"type": "Feature", "properties": d, "geometry": {"type": "Point", "coordinates": [d.x, d.y]}}; 
				return path(dobj)
			})
			//.attr("class", "feature")
			.style("stroke", function(d){ return nodeColor(d.pagerank)})
			.style("stroke-width", "5px")			
			.on("click", function (d) {
				//console.log(d.id);				
				//updateFilter(d.id);
				// need prevent OL click propagation, is there a function to do it?

				//updateFilter(""); // result in blank layer

			})
		*/
		
		// @param {array},  [{"t":"1", "speed": 125, "flow": 2365}, {}, ...,{"t": 0, ...}],
		var rosemap = function (d3sel) {
			roseCharts = [];			
			d3sel.each(function(d) {
				var rosed = [];
				var t = d3.range(d.rank.pagerank.length),
					zd = d3.zip(t, d.rank.pagerank);
				for(var i = 0; i < zd.length; ++i){
					rosed.push({"t": zd[i][0], "rank": zd[i][1]});
				}
				
				var vis = roseplot(rosed, 'rose_'+d.id, roseSettings.innersize, roseSettings.rosesize, nodeColor(d.pagerank));				
				vis.draw('Pagerank'); 				
				roseCharts.push(vis);
				
			})
			
		}
		
		
			  
		var roseg = g.append("g")
			.attr("class", "roseg")
			//.attr("id", function(d) {return d.properties.name})
			.attr("id", function(d) {return 'rose_'+d.id})
		// uncomment it to draw rosegraph on map
			.call(rosemap)
		
		/*
		 Make a node-link graph on the map
		*/
		/*
		graphdata.links.forEach(function(d) {
    		d.source = graphdata.nodes[d.source];
    		d.target = graphdata.nodes[d.target];
		});


		var featureLinks = svg.append("g").attr("class", "featureLinks")
            .selectAll("line")
            .data(graphdata.links)
            .enter().append("line")
            //project(cent);
            .attr("x1", function(d) { return project([d.target.x, d.target.y])[0] })
            .attr("y1", function(d) { return project([d.target.x, d.target.y])[1] })
            .attr("x2", function(d) { return project([d.source.x, d.source.y])[0] })
            .attr("y2", function(d) { return project([d.source.x, d.source.y])[1] })
            .attr("stroke", "#999")
            .attr("stroke-width", 1)
            .attr("opacity", 0.5)
		*/

		map.events.register("moveend", map, reset);

		reset();

		$('#graphpart input[type=radio]').change(function() {
			//console.log(this.id);     
			var attr = this.value,
				isAllDay = $('#timeSelect').val() == 'allday';
			if (isAllDay) {
				nodeColor.domain([graphdata[attr][0], (graphdata[attr][0] + graphdata[attr][1])/2, graphdata[attr][1]]);
			} else {
				var minmaxSpecTime = d3.extent(graphdata.nodes, function(d) { return d.rank[attr][$('#timeSelect').val()/2] });
				nodeColor.domain([minmaxSpecTime[0], (minmaxSpecTime[0] + minmaxSpecTime[1])/2, minmaxSpecTime[1]]);
			}
     		
     		// change nodes of group
     		routeNode.style("fill", function(d){ return isAllDay ? nodeColor(d[attr]) : nodeColor(d.rank[attr][$('#timeSelect').val()/2]) });
     		
     		/*
     		// change RoseChart on the map
     		roseCharts.forEach(function(rose) {
     			var d = d3.select('#'+rose.getID).datum();
     			var rosed = [];
				var t = d3.range(d.rank[attr].length),
					zd = d3.zip(t, d.rank[attr]);
				for(var i = 0; i < zd.length; ++i){
					rosed.push({"t": zd[i][0], "rank": zd[i][1]});
				}
				//console.log('roseid: '+rose.getID);
     			rose.update(rosed, nodeColor(d[attr]), attr);
     		}) 
     		if (!isAllDay) {
     			d3.selectAll('.rosearcs path').style("fill", function(da){ return da.t == $('#timeSelect').val()/2 ? d3.select(this).attr('fillcolor') : '#E5E5E5'});    //'#E5E5E5'
     		}	
     		*/

  		})

  		$('#lineSelect').on('change', function() {
            //console.log(this.value);     
            var attr = this.value;
            drawLine (attr);           

        })

        $('#roseSelect').on('change', function() {
            //console.log(this.value);     
            var attr = this.value;
            nodeColor.domain([graphdata[attr][0], (graphdata[attr][0] + graphdata[attr][1])/2, graphdata[attr][1]]);
            roseCharts.forEach(function(rose) {
     			var d = d3.select('#'+rose.getID).datum();
     			var rosed = [];
				var t = d3.range(d.rank[attr].length),
					zd = d3.zip(t, d.rank[attr]);
				for(var i = 0; i < zd.length; ++i){
					rosed.push({"t": zd[i][0], "rank": zd[i][1]});
				}
     			rose.update(rosed, nodeColor(d[attr]), attr);
     		})     	         

        })

        $('#roadSelect').on('change', function() {
            //console.log(this.value);     
            var attr = this.value;
            // change detailed routes
     		routesVector_layer["styleMap"] = getStyleMap(attr, $('#timeSelect').val());
			routesVector_layer.redraw();      

        })

        $('#timeSelect').on('change', function() {
        	var time = this.value,
            	attr = $('input[name=nlradio]:checked').val(),
				isAllDay = time == 'allday';
			if (isAllDay) {
				nodeColor.domain([graphdata[attr][0], (graphdata[attr][0] + graphdata[attr][1])/2, graphdata[attr][1]]);
			} else {
				var minmaxSpecTime = d3.extent(graphdata.nodes, function(d) { return d.rank[attr][time/2] });
				nodeColor.domain([minmaxSpecTime[0], (minmaxSpecTime[0] + minmaxSpecTime[1])/2, minmaxSpecTime[1]]);
			}
     		
     		// change nodes of group
     		routeNode.style("fill", function(d){ return isAllDay ? nodeColor(d[attr]) : nodeColor(d.rank[attr][time/2]) });
     		// change RoseChart on the map
     		roseCharts.forEach(function(rose) {
     			var d = d3.select('#'+rose.getID).datum();
     			var rosed = [];
				var t = d3.range(d.rank[attr].length),
					zd = d3.zip(t, d.rank[attr]);
				for(var i = 0; i < zd.length; ++i){
					rosed.push({"t": zd[i][0], "rank": zd[i][1]});
				}
				//console.log('roseid: '+rose.getID);
     			rose.update(rosed, nodeColor(d[attr]), attr);
     		}) 
     		if (!isAllDay) {
     			d3.selectAll('.rosearcs path').style("fill", function(da){ return da.t == time/2 ? d3.select(this).attr('fillcolor') : '#E5E5E5'});    //'#E5E5E5'
     		}	

     		
     		// change detailed routes
     		routesVector_layer["styleMap"] = getStyleMap($('#roadSelect').val(), time);
			routesVector_layer.redraw();

        })


        


		function reset() {
			//Here we can check the zoom level and decide if rosegraph to be drawn, Chong
			/*
			if (map.zoom < roseSettings.displayZoom) {
				d3.selectAll('.roseg').style('display', 'none');
			} else {
				d3.selectAll('.roseg').style('display', null);
			}
			*/

			var bottomLeft = project(bounds[0]),
				topRight = project(bounds[1]) ;

			svg.attr("width", topRight[0] - bottomLeft[0] + roseSettings.graphmargin) // + rose width
				.attr("height", bottomLeft[1] - topRight[1] + roseSettings.graphmargin) // + rose height
				.style("margin-left", (bottomLeft[0] - roseSettings.graphmargin) + "px")
				.style("margin-top", (topRight[1] - roseSettings.graphmargin) + "px");

			g.attr("transform", "translate(" + -(bottomLeft[0] - roseSettings.graphmargin) + "," + -(topRight[1] - roseSettings.graphmargin) + ")");
			
			
			roseg.attr("transform", transform);
			
			/*roseg.style("display", function(d) {
				return d3.select(this).style("display");
			});
			*/
			/*
			featureNode.attr("d", function(d){ 
				var dobj = {"type": "Feature", "properties": d, "geometry": {"type": "Point", "coordinates": [d.x, d.y]}}; 
				return path(dobj)
			})
			*/			
            
		}
		
		// make it better? move to centroid of line?
		function transform(d) {
			//var cent = centroids[d.properties.name];
			var cent = [d.xx, d.yy];
			d = project(cent);
			return "translate(" + d[0] + "," + d[1] + ")";
		}

		function project(x) {
			var point = map.getViewPortPxFromLonLat(new OpenLayers.LonLat(x[0], x[1])
				.transform("EPSG:4326", "EPSG:900913"));
			return [point.x, point.y];
		}
	}
	map.addLayer(overlay);
}

/*
 Global array nodeid will be used
*/
function updateFilter() {
	//Put the logical filter there  
    var filter = new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.OR,
        filters: getAttrFilters()
    });
    filterStrategy.setFilter(filter);  

    d3.selectAll('.roseg').each(function(d) {
    	d3.select(this).style('display', nodeid.indexOf(d.id) != -1 ? 'block' : 'none');
    });
    
}

function getAttrFilters() {
	var _filters = [];
	for (var i = 0; i < nodeid.length; ++i) {
		_filters.push(
                    new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "partitionID",
                        value: nodeid[i]
                    })
                );
	}
	return _filters;	
}

	