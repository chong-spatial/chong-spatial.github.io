

/**
 * @ngdoc function
 * @name SFMuniVIS.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the SFMuniVIS
 */
angular.module('SFMuniVIS').controller('MainCtrl', ['$scope', '$http', '$timeout', 'constants', 'sharedService', function ($scope, $http, $timeout, constants, sharedService) {
    

	
	// SF streets geospatial data
	$scope.streets = [];
	// all routes in SF
	$scope.routeMap = {};
	// hashmap for all tracted vehicles
	$scope.vehicleMap = {};
	// array for all tracked vehicles
	$scope.allTrackedVehicles = [];


	$scope.treedata = null;	


	
	var 
	// max number of all vehicles that can record
	maxTrackedVehicles = 1000,	
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
	
	$http.get('data/sfmaps/streets.json')
	.success(function(response) {
		$scope.streets = response.features;
	});

	renderRoute(); 

	setupDelayColorLegend();

	// make sure the routeColorScale is synced.
	$timeout(function() { refereshVehicles() }, 500);

	function setupDelayColorLegend() {
		d3.select('#colorLgSpStart').attr('stop-color', sharedService.delayDeviationColorScale.range()[0]);
		d3.select('#colorLgSpMiddle').attr('stop-color', sharedService.delayDeviationColorScale.range()[1]);
		d3.select('#colorLgSpEnd').attr('stop-color', sharedService.delayDeviationColorScale.range()[2]);

	}

	

	function refereshVehicles() {
		var vLocationsLastTimeUpdated = new Date().getTime() - 1 * 60 * 1000;
		d3.xml(constants.feedURL.vehicleURL + vLocationsLastTimeUpdated, function(err, res) {
			//$scope.$apply(function() {
				var vehicleElements = res.documentElement.getElementsByTagName('vehicle');
        		for (var i = 0; i < vehicleElements.length; i++) {
					var vElement = vehicleElements[i],
						vId = vElement.getAttribute('id'),
						vTag = vElement.getAttribute('routeTag'),
						vLonLat = [+vElement.getAttribute('lon'), +vElement.getAttribute('lat')],
						vReportDelay = +vElement.getAttribute('secsSinceReport'),
						vSpeed = +vElement.getAttribute('speedKmHr');				

					var v;
					if ($scope.vehicleMap[vId] == null) {
						v = {
							id: vId,
							tag: vTag,
							lonLat: vLonLat,
							reportDelay: vReportDelay,
							speed: vSpeed,
							moveAngle: null,
							history: [{t: vLocationsLastTimeUpdated, reportDelay: vReportDelay, speed: vSpeed, lonLat: vLonLat}],
							color: sharedService.routeColorScale(isNaN(vTag.charAt(0)) ? 'A-Z' : vTag.charAt(0)),
							rectWidth: constants.minSymbolSize,
							rectHeight: constants.minSymbolSize
						};

						$scope.vehicleMap[vId] = v;
						$scope.allTrackedVehicles.push(v);
						// recycling
						if($scope.allTrackedVehicles.length > maxTrackedVehicles) {
							var removed = $scope.allTrackedVehicles.shift();
							delete $scope.vehicleMap[removed.id]
						}
				
					} else {
						v = $scope.vehicleMap[vId];
						// change lonlat to cartesian coord, then calculate the angle
						// angle is calculated based on the last location and previous location
						var angleDegree = Math.atan2($scope.projection(vLonLat)[1] - $scope.projection(v.lonLat)[1], $scope.projection(vLonLat)[0] - $scope.projection(v.lonLat)[0]);								
						angleDegree = (angleDegree > 0 ? angleDegree : (2 * Math.PI + angleDegree)) * 360 / (2 * Math.PI);

						v.history.unshift({t: vLocationsLastTimeUpdated, reportDelay: vReportDelay, speed: vSpeed, lonLat: vLonLat});
						if (v.history.length > longestHistoryLength) {
							v.history.pop();
						}
						v.lonLat = vLonLat;
						v.reportDelay = vReportDelay;
						v.speed = vSpeed;
						v.moveAngle = angleDegree;
					}
	
				}

			//})
		

			redrawVehicles();

			refreshInactiveVehicles();

			setTimeout(refereshVehicles, vehicleUpdateInterval);

		});

	}

	function renderRoute() {
		d3.xml(constants.feedURL.routeURL, function(error, response){
	        if (error) throw error;
	        
	        var routeData = [].map.call(response.querySelectorAll("route"), function(route) {
	        	return {
		            tag: route.getAttribute("tag"),
		            title: route.getAttribute("title"),
		            // for labeling
		            name: route.getAttribute("tag"),
		            // for css class
		            type: 'route',
		            // for coloring
		            colorDomain: isNaN(route.getAttribute("tag").charAt(0)) ? 'A-Z' : route.getAttribute("tag").charAt(0)
		        };
	        });
	          

	        // add title, color, stop info to routeMap
	        // not use at this moment

	        routeData.forEach(function(r) { 
	        	d3.xml(constants.feedURL.routeConfigURL + r.tag + '&terse', function(e, routeConfigs){
	        		var rStops = routeConfigs.documentElement.getElementsByTagName('stop');             
					$scope.routeMap[r.tag] = {title: r.title, colorDomain: r.colorDomain}
					var stops = [];
					$scope.routeMap[r.tag]['stop'] = stops;
					for (var i = 0; i < rStops.length; i++) {
						var sElement = rStops[i],
						    sId = sElement.getAttribute('stopId'),
						    sTag = sElement.getAttribute('tag'),
						    sLonLat = [+sElement.getAttribute('lon'), +sElement.getAttribute('lat')],
						    sTitle = sElement.getAttribute('title'); 

						stops.push({
						  stopId: sId,
						  stopTag: sTag,
						  stopTitle: sTitle,
						  stopLonLat: sLonLat
						});
					      
					}
	                  
	            })          
	        })
	        


	        // create a map for quick access to route
	        // key is the first letter of tag for numerical tag, 'A-Z' for categorical tag
	        var routeGroupMap = {};
	        routeData.forEach(function(r) {
	        	var rTagFirstLetter = r.tag.charAt(0).toLowerCase();
				// if route starts with number, form separate groups because the route count is large
				// if route starts with letter, form a same group because route count is small
				rTagFirstLetter = isNaN(rTagFirstLetter) ? 'A-Z' : rTagFirstLetter;
				if (routeGroupMap.hasOwnProperty(rTagFirstLetter)) {
					routeGroupMap[rTagFirstLetter].push(r);
				} else {
					routeGroupMap[rTagFirstLetter] = [r];
				}           
	        })
	  
	        // create ExpTree data structure
	       	var treeData = {"id": "root", "type": "root", "name": "Routes", "children": []};
	        
	      	treeData.children = Object.keys(routeGroupMap).map(function(rkey) {            
	          return { 
	            // for css class
	            type: 'group', 
	            // for labeling
	            name: rkey,             
	            children: routeGroupMap[rkey]
	        }}) 



	        sharedService.routeColorScale.domain(treeData.children.map(function(d){ return d.name; }));
	        treeData.children.forEach(function(d) { 
	        	d.color = sharedService.routeColorScale(d.name); 
	        	d.children.forEach(function(cd) { 
	        		cd.color = sharedService.routeColorScale(cd.colorDomain); 
	        	})
	        });
            
            $scope.treedata = treeData;
            


		})

	}

	function redrawVehicles() {
		var mapg = d3.select('.map svg g');
		var vehicles = mapg.select('.vehicles').selectAll('.vehicle')
			.data($scope.allTrackedVehicles, function(d) { return d.id; });

		// apply D3. Data Join principle, refer to https://bost.ocks.org/mike/join/ and https://bl.ocks.org/mbostock/3808218	
		// enter selection
		var vehicleGroup = vehicles.enter().append('g')
			// tag is part of class for the purpose of tree filtering
			.attr('class', function(d) { return 'vehicle ' + 't' + d.tag})
			.attr('transform', function(d) {
				return 'translate(' + ($scope.projection(d.lonLat)[0] - d.rectWidth / 2) + ',' + ($scope.projection(d.lonLat)[1] - d.rectHeight / 2) + ')';
			})
			.on('click', function(d) {
				sharedService.treevis().toggleLeaf(d.tag);
				sharedService.treevis().highlightLeaf(d.tag);	

				if(d3.select(this).select('.symbol').classed('dead')) {					
					sharedService.timelinevis().inspectedVehicle(d);
					d3.selectAll('.inspectUl li').classed('ui-selected', function(l) { return l.id == d.id });
					
				}

				
			})


		// creat vehicle symbol for vehicles
		vehicleGroup.append('rect')
			.attr('width', function(d) { return d.rectWidth })
			.attr('height', function(d) { return d.rectHeight })
			.attr('class', 'symbol')
			.style('fill', function(d) { return d.color; })

		// vehicle route tag labeling
		vehicleGroup.append('text')
			.attr('text-anchor', 'start')
			.attr('y', function(d) { return d.rectHeight - 2 })
			.attr('class', 'label')	
			.text(function(d) { return d.tag})
			// will adjust the display according to zoom level
			.style('display', 'none');

		// vehicle direction arrows
		vehicleGroup.append('path')	 
		    .attr('d', function(d) { return 'M'+ d.rectWidth +',0 ' + 'L' + (d.rectWidth + d.rectWidth / 2) + ',' + d.rectHeight / 2 + ' L' + d.rectWidth + ',' + d.rectHeight })
		    .attr('class', 'arrow')	    	   	
		   	.style('stroke', function(d) { return d.color; })
		   	
	
		// vehicle locations
		vehicles.transition()
			.duration(vehicleUpdateInterval)
			// the symbol center is along with route
			.attr('transform', function(d) {
				return 'translate(' + ($scope.projection(d.lonLat)[0] - d.rectWidth / 2) + ',' + ($scope.projection(d.lonLat)[1] - d.rectHeight / 2) + ')';
			})
			
	

		// update direction indicator
		vehicles.select('.arrow')				
			.attr('d', function(d){ return 'M'+ d.rectWidth +',0 ' + 'L' + (d.rectWidth + d.rectWidth / 2) + ',' + d.rectHeight / 2 + ' L' + d.rectWidth + ',' + d.rectHeight })
			// we're going to rotate (d.rectWidth, d.rectHeight/2) around (d.rectWidth/2, d.rectHeight/2)
			.attr("transform", function(d) {		   		
		   		return d.moveAngle ? 'rotate('+ d.moveAngle + ' ' + d.rectWidth / 2 + ' ' + d.rectHeight / 2 + ')' : '';
		    })
		    .style('display', function(d) {	    	
		    	return d.moveAngle ? (d.moveAngle == 360 ? 'none' : null) : 'none';
		    })
		    


		// if longest sequence of same position is gte predefined length,
		// it is regarded as inactive
		vehicles.select('.symbol')
			.classed('dead', function(d) { 
				return findLatestLongestSamePosition(d.history.map(function(h) { return h.lonLat; })) >= longestLatestSameLonlatLength ? true : false;
			})
		    

		// remove exit vehicles 
		vehicles.exit().remove();

		// adjust vehicle display according to route switch
		var shownRoutes = sharedService.shownRoutes();
		if (shownRoutes) {
			d3.select('.map').selectAll('.vehicle').style('display', 'none');
	        shownRoutes.forEach(function(t) {
	        	d3.select('.map').select('.vehicles').selectAll('.t' + t).style('display', 'block');
	        })
    	}

    	// adjust labeling
    	$scope.adjustLabel();

	}

	// inspect the report delay
	// if a vehicle stops at a place for a while,
	// we can inspect if it has an irregular report delay,
	// if so, then it might be traffic jam or something
	// otherwise, something wrong happened to that vehicle
	function refreshInactiveVehicles() {

		var isCurInspectedVehAlive = true;
		var allInactiveVehicles = [];
		var curInspectV = sharedService.timelinevis().inspectedVehicle();
		d3.select('.map').select('.vehicles').selectAll('.dead').each(function(d) {
			if(curInspectV && d.id == curInspectV.id) isCurInspectedVehAlive = false;
			allInactiveVehicles.push(d);
	
		})

		if(!allInactiveVehicles.length) {
			if(isCurInspectedVehAlive) sharedService.timelinevis().inspectedVehicle(null);
			d3.select('#delaySdColorScale').style('display', 'none');
			return;
		} else {
			d3.select('#delaySdColorScale').style('display', 'block');
		}
		if(isCurInspectedVehAlive) sharedService.timelinevis().inspectedVehicle(null);

		// update delayDeviationColorScale domain
		// we may need to have a better classification for the GPS report delay 
		var devs = allInactiveVehicles.map(function(d) { return d3.deviation(d.history.map(function(h) { return h.reportDelay; }))});
		var minSDev = d3.min(devs),
			maxSDev = d3.max(devs),
			sdSDev = d3.deviation(devs),
			// not sure if the report delay follows normal distibution	
			// if so, mean + 1 sd will capture 68% points, and use the number as the center value of scale domain;
			// if not, use typical mean instead	
			middleDomain = (minSDev + maxSDev ) / 2 + 1 * sdSDev > maxSDev ? (minSDev + maxSDev ) / 2 : (minSDev + maxSDev ) / 2 + 1 * sdSDev;

		sharedService.delayDeviationColorScale.domain([minSDev, middleDomain, maxSDev]);
		var delaySdColorRectWidth = +d3.select('#delaySdColorScale svg').attr('width');
		var delayColorScale = d3.scale.linear().range([0, delaySdColorRectWidth]).domain(sharedService.delayDeviationColorScale.domain());
		var delayColorXaxis = d3.svg.axis().scale(delayColorScale).orient("bottom");
		d3.select('#delaySdColorScale .axis').call(delayColorXaxis);
	

		
		allInactiveVehicles.sort(function(a, b) { 
			if(a.tag < b.tag) return -1; 
			if(a.tag > b.tag) return 1; 
			return 0;
		});		

		
		var inactiveList = d3.select('.inspectUl ul').selectAll('.vehicle')
			.data(allInactiveVehicles, function(d) { return d.tag + '_' + d.id; })

		var removed = inactiveList.exit().remove();		

		var lis = inactiveList.enter().append('li')
			.attr('class', 'vehicle')			
			.on('click', function(d) {
				sharedService.treevis().toggleLeaf(d.tag);
				sharedService.treevis().highlightLeaf(d.tag);
				sharedService.timelinevis().inspectedVehicle(d);
				$scope.centerZoomCtrl(d.lonLat);  
				d3.selectAll('.inspectUl li').classed('ui-selected', false);
				d3.select(this).classed('ui-selected', true);     		

			})

		inactiveList.order();

		lis.append('span')
			.attr('class', 'symbol')
			.style('background', function(d) { return d.color; })
			.html(function(d) { return d.tag; });

		lis.append('span')
			.attr('class', 'label')
			.style('background', function(d) { return sharedService.delayDeviationColorScale(d3.deviation(d.history.map(function(h) { return h.reportDelay; })))})
			.html(function(d) { return 'ID:' + d.id; });
	}




	// used to decide inactivity of vehicle
	// if LongestSamePositionLength is gte a predefined length, then it is inactive
	// ideally, a statistical method can be used like:
	// calculate the distance between sfctr(SF center) and each of lonlat in the history,
	// , calculate the deviation, compare the deviation with the predefined threshold e.g. 5
	// if the difference is less than the threshold for 10 times in a row
	function findLatestLongestSamePosition(pos) {
		var dp = [], i, len;
		for(i = 0; i < pos.length; i++){
			len = dp.length;
			
	 		if(len === 0 || (dp[len - 1][0] == pos[i][0] && dp[len - 1][1] == pos[i][1] )){
	 			dp[len] = pos[i];
	        
	    	} else {
	    		return dp.length;
	    	}
	         
	    }
		return dp.length;

	}

}]);
