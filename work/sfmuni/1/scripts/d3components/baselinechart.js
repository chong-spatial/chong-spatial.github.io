// @author Chong Zhang.
// Please contact me at chongzhang.nc@gmail.com if you have any questions

var baseLineChart = function() {
	var base = {};

	base.margin = function (_) {
		if(!arguments.length){
            return this.config.margin;
        }
        this.config.margin = _;
        return this;
	} 

	base.dimension = function (_) {
		if(!arguments.length){
            return this.config.dimension;
        }
        this.config.dimension = _;
        return this;

	}

	base.width = function(_) {
		if(!arguments.length){
            return this.config.width;
        }
       	this.config.width = _;
       	return this;
	}

	base.height = function(_) {
		if(!arguments.length){
            return this.config.height;
        }
       	this.config.height = _;
       	return this;

	}

	base.chartTitle = function(_) {
		if(!arguments.length){
            return this.config.chartTitle;
        }
       	this.config.chartTitle = _;
       	return this;

	}
	base.yTitle = function(_) {
		if(!arguments.length){
            return this.config.yTitle;
        }
       	this.config.yTitle = _;
       	return this;

	}
	base.xTitle = function(_) {
		if(!arguments.length){
            return this.config.xTitle;
        }
       	this.config.xTitle = _;
       	return this;

	}

	base.config = {
		width: 400,
		height: 400,
		chartTitle: "Chart Title",
		yTitle: "Y Title", 
		xTitle: "X Title",
		margin: { top: 20, bottom: 20, left: 60, right: 20 },
		dimension: { chartTitle: 20, xAxis: 20, yAxis: 20, xTitle: 20, yTitle: 20 }, 
		xValue: function(d) { return d[0]; },
		yValue: function(d) { return d[1]; },
		xScale: d3.time.scale(),
		yScale: d3.scale.linear()
	}

	return base;

}
