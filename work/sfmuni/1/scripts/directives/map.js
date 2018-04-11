angular.module('SFMuniVIS').directive('vehicleMap', ['constants', function(constants) {
    return {
    	restrict: 'E',      
		scope: {
			streets: '=',			
			projection: '=',
			centerZoom: '=',
			adjustLabel: '='
			
		},
      	link: function($scope, $element, $attrs) {
      		var div = d3.select($element[0]);
      		var bbox = div.node().getBoundingClientRect();
        	var mapWidth = bbox.width || 800,
        		mapHeight = bbox.height || 600;
        	var zoom = d3.behavior.zoom()
		        .scaleExtent([1, 10])
		        .on("zoom", zoomed)
		        .on("zoomstart", zoomStart);

		    $scope.zoomFn = zoom;


			var mapSvg = div.append('svg')          

      		var mapg = mapSvg.append('g');
       
	      	$scope.projection = d3.geo.mercator()
		        .scale(300000)
		        .center([-122.4194, 37.77449])
		        .translate([mapWidth / 2, mapHeight / 2]);

			var path = d3.geo.path()
				.projection($scope.projection);
       
      		mapSvg.call(zoom).call(zoom.event);

      		
      		mapg.append('g').attr('class', 'streets');
      		mapg.append('g').attr('class', 'vehicles');
      		

      		var lastZoomLevel = 1;

      		function zoomStart() {
      			lastZoomLevel = zoom.scale();
      		}
			// control vehicle label display level when zooming
			function controlMapLabel() { 				

				if(lastZoomLevel > 1 && zoom.scale() > 1) {
          			// add this because labels are not set to be shown initially
	          		mapg.selectAll('.vehicles .label').style('display', 'block');
	          		return;
        		}     
				// no label display when zoomlevel is lt 1 due to too small size
				if(zoom.scale() > 1) {          
					mapg.selectAll('.vehicles .label').style('display', 'block');

					// change vehicle symbol size according to label width
					mapg.selectAll('.vehicles .symbol')
						.each(function(d) { 
						  d.textWidth = d3.select(this.parentNode).select('.label').node().getComputedTextLength();
						  d.rectWidth = Math.max(constants.minSymbolSize, d.textWidth); 
						  d.rectHeight = constants.minSymbolSize; 
						})
						.attr("width", function(d) { return d.rectWidth; });      

					// mapg.selectAll('.vehicles .vehicle').attr('transform', function(d) {
					// 	return 'translate(' + $scope.projection(d.lonLat)[0] + ',' + $scope.projection(d.lonLat)[1] + ')';
					// })

					mapg.selectAll('.vehicles .label')
						.attr('x', function(d) {                       
						  return (d.rectWidth - d.textWidth) / 2;
						})        
					

				} else {  // both are less than 1       
					mapg.selectAll('.vehicles .label').style('display', 'none');
					mapg.selectAll('.vehicles .symbol')
						.attr("width", constants.minSymbolSize)
				}

				lastZoomLevel = zoom.scale();

			}

			$scope.controlMapLabel = controlMapLabel;

			// zoom event handler
			function zoomed() {
				mapg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
				// control vehicle labeling display level
				controlMapLabel();        

			}
          
 			$scope.$watch('streets', function(newValue, oldValue) {
 				if (!newValue) return;
				var streetG = mapg.select('.streets');
				streetG.selectAll('path')
					.data(newValue)
					.enter().append('path')
					.attr('d', path)
					.attr('class', function(d) { return 'DISTRICT_' + d.properties.DISTRICT})  

			});  			   	  	
			
			
      	},
      	controller: function($scope, $element, $attrs) {
      		// expose using controller
      		var div = d3.select($element[0]);
      		var bbox = div.node().getBoundingClientRect();

			$scope.centerZoom = function(lonLat) {
				var mapWidth = bbox.width || 800,
        		mapHeight = bbox.height || 600;
				//center the vehicle on the map
	            var scrx = $scope.projection(lonLat)[0],
	                scry = $scope.projection(lonLat)[1];

	            var scale = 4,
	                translate = [mapWidth / 2 - scale * scrx, mapHeight / 2 - scale * scry];
	            // center and zoom
	            d3.select('.map svg g').transition()
	              .duration(750)   
	              .attr("transform", "translate(" + translate + ")scale(" + scale + ")")
	            // keep zoom consistant with the transformation
	            // so that map will not jump in next zoom
	            $scope.zoomFn.translate(translate)
	            $scope.zoomFn.scale(4);
	            // adjust route label display
	            $scope.controlMapLabel();
			}

			$scope.adjustLabel = function() { $scope.controlMapLabel() }
      	}

    };
}]);