d3.realtimeLineChart = function() {
	var 
	    // go back and start to track
	    backSeconds = 1 * 60 * 1000,
	    // d3 transition in milliseconds,
	    // is also the moving interval, for every data item
	    duration = 6000, 
	    // max number of time series data items
	    longestHistoryLength = 30, 
	    // time window in the whole chart
	    timeSpan = duration * longestHistoryLength; 

  
	// scales
	var maxY = 120, minY = 0, yDomain = [minY, maxY], xAxisG, yAxisG;
	// tracking from a past time
	var now = Date.now() - backSeconds; 
	// inspected vehicle
	var inspectedVehicle = null;
	// data to bind
	var timeSeriesData, initialData;   

	var svgWidth, svgHeight; 

	var
		// root svg
		svg,
		// main container
		mainG,
		// moving path element
		pathElement;

	// line drawing function
	// format is like [{time, value}]
	// time is in milliseconds
	var line = d3.svg.line()
		.interpolate('basis')
		.x(function(d) {
		    return x(d.time)
		})
		.y(function(d) {
		    return y(d.value)
		});

	var x, y;



	function exports(sel) {
		sel.each(function(data) {
		    var parentConf = exports.base.config;

		    x = parentConf.xScale;
		    y = parentConf.yScale;

		    if(!svgWidth) svgWidth = parentConf.width;
		    if(!svgHeight) svgHeight = parentConf.height;

		    // dimension and offset
	    	var marginTop = parentConf.margin.top + parentConf.dimension.chartTitle,
	        	height = svgHeight - marginTop - parentConf.margin.bottom - parentConf.dimension.chartTitle - parentConf.dimension.xTitle - parentConf.dimension.xAxis,
	        	width = svgWidth - parentConf.margin.left - parentConf.margin.right;

	       	// append the svg
		    svg = sel.append("svg")
		      .attr("width", svgWidth)
		      .attr("height", svgHeight);    

		    // create main group and translate
		    var mainG = svg.append("g")
		      .attr("transform", "translate (" + parentConf.margin.left + "," + marginTop + ")")
		      .attr('class', 'mlineChart')

		    // clip-path
		    // use a rect to clip movingline as the line is moving 
		    mainG.append("defs").append("clipPath")
		      .attr("id", "myClip")
		      .append("rect")
		      .attr("x", 0)
		      .attr("y", 0)
		      .attr("width", width)
		      .attr("height", height);

		    // chart background
		    mainG.append("rect")
		      .attr("x", 0)
		      .attr("y", 0)
		      .attr("width", width)
		      .attr("height", height)
		      .attr("class", "background")

		    // The first group contains a clip path
		    // the second group the chart group  
		    var singlePathG = mainG.append("g")
		      .attr("class", "multiSeries")
		      .attr("transform", "translate(0, 0)")
		      .attr("clip-path", "url(#myClip)")
		      .append("g");


		    // scales
		    x = d3.time.scale().domain([now - (timeSpan - duration), now]).range([0, width]);
		    y = d3.scale.linear().domain(yDomain).range([height, 0]);

		    // group for x axis
		    xAxisG = mainG.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(x.axis = d3.svg.axis().scale(x).orient('bottom'));
	      

		    // group for y axis
		    yAxisG = mainG.append("g")
		      .attr("class", "y axis")
		      .call(y.axis = d3.svg.axis().scale(y).orient("left"))


		    // x axis title
		    xAxisG.append("text")
		      .attr("class", "axisTitle")
		      .attr("x", width / 2)
		      .attr("y", 25)
		      .attr("dy", "1em")
		      .text(function(d) { 
		        return parentConf.xTitle == undefined ? "" : parentConf.xTitle;          
		      });

		    // y axis title
		    yAxisG.append("text")
		      .attr("class", "axisTitle")
		      .attr("transform", "rotate(-90)")
		      .attr("x", - height / 2)
		      .attr("y", -parentConf.margin.left)
		      .attr("text-anchor", "middle")
		      .attr("dy", "1em")
		      .text(function(d) { 
		        return parentConf.yTitle == undefined ? "" : parentConf.yTitle;
		      });

		    // chart title
		    var chartTitle = mainG.append("text")
		      .attr("class", "chartTitle")     
		      .attr("y", -20)
		      .attr("dy", ".71em")
		      .attr("text-anchor", "start")
		      .text(function(d) { 
		        return parentConf.chartTitle == undefined ? "" : parentConf.chartTitle;
		      });

		    // center chart title
		    chartTitle.attr("x", (width - chartTitle.node().getComputedTextLength()) / 2)
	    
		    // the time series data to bind
		    timeSeriesData = data || [];

		    // the moving line element
		    pathElement = singlePathG.append('path').attr('class', 'movingline'); 

		    exports.refresh();   
		})

	}

	// triggered when svg width/height changes
  	exports.updateSize = function() {
	    // update root sve dimension
	    svg.attr("width", svgWidth)
	      .attr("height", svgHeight);

	    var parentConf = exports.base.config;

	    
	    // dimension and offset
    	var marginTop = parentConf.margin.top + parentConf.dimension.chartTitle,
        	height = svgHeight - marginTop - parentConf.margin.bottom - parentConf.dimension.chartTitle - parentConf.dimension.xTitle - parentConf.dimension.xAxis,
        	width = svgWidth - parentConf.margin.left - parentConf.margin.right;

	    var mainG = svg.select('.mlineChart');

	    // update clip rect and background rect
	    mainG.select("#myClip rect")     
	      .attr("width", width)
	      .attr("height", height);    
	    mainG.select(".background")      
	      .attr("width", width)
	      .attr("height", height)

	    // update x and y scale ranges
	    x.range([0, width]);
	    y.range([height, 0]);

	    // update x axis title position
	    xAxisG.select(".axisTitle")
	      .attr("x", width / 2)

	    // chart title
		var chartTitle = mainG.select(".chartTitle")     

	    // update chart title position
	    chartTitle.attr("x", (width - chartTitle.node().getComputedTextLength()) / 2);

	    // update x and y axis tick position
	    xAxisG.attr("transform", "translate(0," + height + ")").call(x.axis);     
	    yAxisG.select(".axisTitle").attr("x", - height / 2).call(y.axis);


  	}

	// get vehicleMap[vId] to have uptodate history data
	exports.refresh = function() {
		// tracking next time interval
		now += duration;

		// if user came back to the system from other applications or other browser tabs,
		// because the time tick stopped when the system was not active, so
		// we have to recalculate the starting_tracking_time
		var currentTrackingTime = Date.now() - backSeconds; 
		if((currentTrackingTime - now) > backSeconds) {
			now = Date.now() - backSeconds; 
			now += duration;
		}
		//console.log(Date.now() - now)
		// remove old timestamp
		// most recent time will appear on the right side of the chart, and begin moving left)
		var curMinTime = now - (timeSpan - duration), 
		    curMaxTime = now;

		// inspected vehicle	
			
		//if the vehicle moves in this time window, the chart clears
		if(inspectedVehicle) {
		// we only track secsSinceReport, how many seconds since the GPS location was actually recorded. 
		var reportDelayHistory = inspectedVehicle.history.map(function(d) { return {time: d.t, value: d.reportDelay} });
		// copty to the class data
		timeSeriesData = reportDelayHistory.slice(0);
		/*.filter(function(d) {
		  // remove too late or too early data items, it could occur if the time passed is wrong
		  if (d.time > curMinTime && d.time < curMaxTime) 
		    return true;
		})*/
		} else {
			timeSeriesData = [];
		}
	

		// debuging use only
		var outputData = timeSeriesData.map(function(d){ 
			var now = new Date(d.time); 
			var str = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds(); 
			return {time: str, value: d.value}
		});
		//console.log('timeSeriesData: ', outputData.length)

		// draw line
		pathElement.datum(timeSeriesData)
			.attr('d', line)    
			.style('stroke', inspectedVehicle? inspectedVehicle.color : null)

		// update x scale,
		// no need for y at this time
		x.domain([curMinTime, curMaxTime]);

		// update axis with modified scale
		// no need for y at this time
		xAxisG.transition()
			.duration(duration)
			.ease('linear')
			.call(x.axis);

		// shift line to left
		// when the transition ends, start the tracking again    
		pathElement.attr('transform', null)
			.transition()
			.duration(duration)
			.ease('linear')
			.attr('transform', 'translate(' + x(now - timeSpan) + ')')
			.each('end', exports.refresh)

		// remove old data 
		if (timeSeriesData.length > longestHistoryLength) timeSeriesData.shift();  

	}

	// getter/setters 
	// array of inital data
	exports.initialData = function(_) {
		if (!arguments.length) return initialData;
		initialData = _;
		return this;
	}

	// new inspect vehicle IDdata item 
	exports.inspectedVehicle = function(_) {
		if (!arguments.length) return inspectedVehicle;
		inspectedVehicle = _;   
		return this;
	}

	exports.resize = function(w, h) {
		if (!arguments.length) return this;
		svgWidth = w || svgWidth;
		svgHeight = h || svgHeight;
		this.updateSize();
		return this;
	}

	exports.width = function(_) {
        if (!arguments.length) return svgWidth;
        svgWidth = +_x;
        return this;
    }

    exports.height = function(_) {
        if (!arguments.length) return svgHeight;
        svgHeight = +_;        
        return this;
    };


	// y scale domain
	exports.yDomain = function(_) {
		if (!arguments.length) return yDomain;
		yDomain = _;
		return this;
	}

	// d3 transition in milliseconds,
	// is also the moving interval, for every data item
	exports.duration = function(_) {
		if (!arguments.length) return duration;
		duration = _;
		return this;
	}

	// max number of time series data items
	exports.longestHistoryLength = function(_) {
		if (!arguments.length) return longestHistoryLength;
		longestHistoryLength = _;
		return this;
	}

	// milliseconds, since that tracking starts
	exports.backTrack = function(_) {
		if (!arguments.length) return backSeconds;
		backSeconds = _;
		return this;

	}

	// start to track
	exports.tick = function() {
		mlChart.refresh();
		return this;

	}

	exports.base = baseLineChart();

	return d3.rebind(exports, exports.base, 'width', 'height', 'margin', 'chartTitle', 'yTitle', 'xTitle', 'dimension', 'xScale', 'yScale');

}