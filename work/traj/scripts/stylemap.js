/**
* Creates a stylemap to define the map shading colors.
* for ol2
*/
function createStyles() {
	var theme = new OpenLayers.Style();
	
	range4 = new OpenLayers.Rule({
			filter:new OpenLayers.Filter.Comparison({
			type:OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
			property:"test",
			value:60
		}),
		symbolizer:{Line:{strokeColor:'#003060'}}
	});
	
	range3 = new OpenLayers.Rule({
		filter: new OpenLayers.Filter.Logical({
			type: OpenLayers.Filter.Logical.AND,
			filters:[ 
				new OpenLayers.Filter.Comparison({
				  type:OpenLayers.Filter.Comparison.LESS_THAN,
				  property:"test",
				  value:50
				}),
				new OpenLayers.Filter.Comparison({
				  type:OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
				  property:"test",
				  value:40
				})
			]
		}),
		symbolizer: {Line:{strokeColor:'#00719f'}}
	});
	
	
	range2 = new OpenLayers.Rule({
		filter: new OpenLayers.Filter.Logical({
			type: OpenLayers.Filter.Logical.AND,
			filters:[ 
				new OpenLayers.Filter.Comparison({
				  type:OpenLayers.Filter.Comparison.LESS_THAN,
				  property:"value",
				  value:40
				}),
				new OpenLayers.Filter.Comparison({
				  type:OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
				  property:"value",
				  value:20
				})
			]
		}),
		symbolizer: {Line:{strokeColor:'#68c2e7'}}
	});
	
	range1 = new OpenLayers.Rule({
		filter: new OpenLayers.Filter.Comparison({
			type:OpenLayers.Filter.Comparison.LESS_THAN,
			property:"test",
			value:20
		}),
		symbolizer:{Line:{strokeColor:'#aed0da'}}
	});
	
	range0 = new OpenLayers.Rule({
		filter: new OpenLayers.Filter.Comparison({
			type:OpenLayers.Filter.Comparison.EQUAL_TO,
			property:"test",
			value:"Null"
		}),
		symbolizer:{Line:{strokeColor:'#cccccc'}}
	});
	
	theme.addRules([range1, range2, range3, range4, range0]);

	return new OpenLayers.StyleMap({'default':theme});
}


/**
* for ol3
*
*/
var styleCache = {};
var styleFunction = function(feature, resolution) {
  var rank = +feature.get('test');    
  var style = styleCache[rank];
  if (!style) {
  	var lineColor = d3.scale.linear().domain([10, 80]).interpolate(d3.interpolateRgb).range(["#af8dc3", "#7fbf7b"]);
    style = [new ol.style.Style({
    	fill: new ol.style.Fill({
          color: 'rgba(255, 204, 0, 0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: lineColor(rank),
          width: 1
        })     
    })];
    styleCache[rank] = style;
  }
  return style;
};

