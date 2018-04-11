/**
* @author Chong Zhang, chongzhang.nc@gmail.com
* @date July 14, 2016
*/
var GridMap = (function(){

	function GridMap(data, options){

		var defaults = {
			lables: {'AK': {'full': 'Alaska', 'short': 'AK', 'ap': 'Alaska'}, 'AL': {'full': 'Alabama', 'short': 'AL', 'ap': 'Ala.'}, 'AR': {'full': 'Arkansas', 'short': 'AR', 'ap': 'Ark.'}, 'AZ': {'full': 'Arizona', 'short': 'AZ', 'ap': 'Ariz.'}, 'CA': {'full': 'California', 'short': 'CA', 'ap': 'Calif.'}, 'CO': {'full': 'Colorado', 'short': 'CO', 'ap': 'Colo.'}, 'CT': {'full': 'Connecticut', 'short': 'CT', 'ap': 'Conn.'}, 'DC': {'full': 'District of Columbia', 'short': 'DC', 'ap': 'D.C.'}, 'DE': {'full': 'Delaware', 'short': 'DE', 'ap': 'Del.'}, 'FL': {'full': 'Florida', 'short': 'FL', 'ap': 'Fla.'}, 'GA': {'full': 'Georgia', 'short': 'GA', 'ap': 'Ga.'}, 'HI': {'full': 'Hawaii', 'short': 'HI', 'ap': 'Hawaii'}, 'IA': {'full': 'Iowa', 'short': 'IA', 'ap': 'Iowa'}, 'ID': {'full': 'Idaho', 'short': 'ID', 'ap': 'Idaho'}, 'IL': {'full': 'Illinois', 'short': 'IL', 'ap': 'Ill.'}, 'IN': {'full': 'Indiana', 'short': 'IN', 'ap': 'Ind.'}, 'KS': {'full': 'Kansas', 'short': 'KS', 'ap': 'Kan.'}, 'KY': {'full': 'Kentucky', 'short': 'KY', 'ap': 'Ky.'}, 'LA': {'full': 'Louisiana', 'short': 'LA', 'ap': 'La.'}, 'MA': {'full': 'Massachusetts', 'short': 'MA', 'ap': 'Mass.'}, 'MD': {'full': 'Maryland', 'short': 'MD', 'ap': 'Md.'}, 'ME': {'full': 'Maine', 'short': 'ME', 'ap': 'Maine'}, 'MI': {'full': 'Michigan', 'short': 'MI', 'ap': 'Mich.'}, 'MN': {'full': 'Minnesota', 'short': 'MN', 'ap': 'Minn.'}, 'MO': {'full': 'Missouri', 'short': 'MO', 'ap': 'Mo.'}, 'MS': {'full': 'Mississippi', 'short': 'MS', 'ap': 'Miss.'}, 'MT': {'full': 'Montana', 'short': 'MT', 'ap': 'Mont.'}, 'NC': {'full': 'North Carolina', 'short': 'NC', 'ap': 'N.C.'}, 'ND': {'full': 'North Dakota', 'short': 'ND', 'ap': 'N.D.'}, 'NE': {'full': 'Nebraska', 'short': 'NE', 'ap': 'Neb.'}, 'NH': {'full': 'New Hampshire', 'short': 'NH', 'ap': 'N.H.'}, 'NJ': {'full': 'New Jersey', 'short': 'NJ', 'ap': 'N.J.'}, 'NM': {'full': 'New Mexico', 'short': 'NM', 'ap': 'N.M.'}, 'NV': {'full': 'Nevada', 'short': 'NV', 'ap': 'Nev.'}, 'NY': {'full': 'New York', 'short': 'NY', 'ap': 'N.Y.'}, 'OH': {'full': 'Ohio', 'short': 'OH', 'ap': 'Ohio'}, 'OK': {'full': 'Oklahoma', 'short': 'OK', 'ap': 'Okla.'}, 'OR': {'full': 'Oregon', 'short': 'OR', 'ap': 'Ore.'}, 'PA': {'full': 'Pennsylvania', 'short': 'PA', 'ap': 'Pa.'}, 'RI': {'full': 'Rhode Island', 'short': 'RI', 'ap': 'R.I.'}, 'SC': {'full': 'South Carolina', 'short': 'SC', 'ap': 'S.C.'}, 'SD': {'full': 'South Dakota', 'short': 'SD', 'ap': 'S.D.'}, 'TN': {'full': 'Tennessee', 'short': 'TN', 'ap': 'Tenn.'}, 'TX': {'full': 'Texas', 'short': 'TX', 'ap': 'Texas'}, 'UT': {'full': 'Utah', 'short': 'UT', 'ap': 'Utah'}, 'VA': {'full': 'Virginia', 'short': 'VA', 'ap': 'Va.'}, 'VT': {'full': 'Vermont', 'short': 'VT', 'ap': 'Vt.'}, 'WA': {'full': 'Washington', 'short': 'WA', 'ap': 'Wash.'}, 'WI': {'full': 'Wisconsin', 'short': 'WI', 'ap': 'Wis.'}, 'WV': {'full': 'West Virginia', 'short': 'WV', 'ap': 'W.Va.'}, 'WY': {'full': 'Wyoming', 'short': 'WY', 'ap': 'Wyo.'} },
			data: {"AL":{"state":"AL","row":6,"col":7},"AK":{"state":"AK","row":1,"col":0},"AZ":{"state":"AZ","row":5,"col":2},"AR":{"state":"AR","row":5,"col":5},"CA":{"state":"CA","row":4,"col":1},"CO":{"state":"CO","row":4,"col":3},"CT":{"state":"CT","row":3,"col":10},"DE":{"state":"DE","row":4,"col":10},"FL":{"state":"FL","row":7,"col":9},"GA":{"state":"GA","row":6,"col":8},"HI":{"state":"HI","row":6,"col":0},"ID":{"state":"ID","row":2,"col":2},"IL":{"state":"IL","row":3,"col":6},"IN":{"state":"IN","row":4,"col":6},"IA":{"state":"IA","row":3,"col":5},"KS":{"state":"KS","row":5,"col":4},"KY":{"state":"KY","row":5,"col":6},"LA":{"state":"LA","row":6,"col":5},"ME":{"state":"ME","row":0,"col":11},"MD":{"state":"MD","row":4,"col":9},"MA":{"state":"MA","row":2,"col":10},"MI":{"state":"MI","row":2,"col":7},"MN":{"state":"MN","row":2,"col":5},"MS":{"state":"MS","row":6,"col":6},"MO":{"state":"MO","row":4,"col":5},"MT":{"state":"MT","row":2,"col":3},"NE":{"state":"NE","row":4,"col":4},"NV":{"state":"NV","row":4,"col":2},"NH":{"state":"NH","row":1,"col":11},"NJ":{"state":"NJ","row":3,"col":9},"NM":{"state":"NM","row":5,"col":3},"NY":{"state":"NY","row":2,"col":9},"NC":{"state":"NC","row":5,"col":9},"ND":{"state":"ND","row":2,"col":4},"OH":{"state":"OH","row":3,"col":7},"OK":{"state":"OK","row":6,"col":4},"OR":{"state":"OR","row":3,"col":1},"PA":{"state":"PA","row":3,"col":8},"RI":{"state":"RI","row":2,"col":11},"SC":{"state":"SC","row":5,"col":8},"SD":{"state":"SD","row":3,"col":4},"TN":{"state":"TN","row":5,"col":7},"TX":{"state":"TX","row":7,"col":4},"UT":{"state":"UT","row":3,"col":2},"VT":{"state":"VT","row":1,"col":10},"VA":{"state":"VA","row":4,"col":8},"WA":{"state":"WA","row":2,"col":1},"WV":{"state":"WV","row":4,"col":7},"WI":{"state":"WI","row":2,"col":6},"WY":{"state":"WY","row":3,"col":3}}
		}


		this.options = options || {};

		this.data = data || defaults.data;
		this.cellSize = this.options.cellSize;
		this.gap = this.options.gap;
		this.groupTrans = this.options.groupTrans || [50, 50];
		this.cellShape = this.options.cellShape || 'rect';

		var maxCol = this.getMaxCol(),
				maxRow = this.getMaxRow();


		this.width = (this.getMaxCol() + 2) * (this.cellSize + this.gap) + this.groupTrans[0],
		this.height = (this.getMaxRow() + 2) * (this.cellSize + this.gap) + this.groupTrans[1];

		this.selectedStates = this.options.selectedStates;


		this.svg = d3.select(this.options.containerSelector).append("svg")
		.attr("height", this.height)
		.attr("width", this.width);




		this.stateXScale = d3.scale.linear().domain([0, maxCol]).range([0, (maxCol - 1) * (this.cellSize + this.gap) - this.groupTrans[0]]);
		this.stateYScale = d3.scale.linear().domain([0, maxRow]).range([0, (maxRow - 1) * (this.cellSize + this.gap) - this.groupTrans[1]]);

		this.draw();

		return this;
	}

	GridMap.prototype.getMaxRow = function () {
		var maxRow = 0;
		for(var s in this.data){
			var curRow = this.data[s]["row"];
			if(curRow > maxRow) maxRow = curRow;
		}

		return maxRow;

	};

	GridMap.prototype.getMaxCol = function () {
		var maxCol = 0;
		for(var s in this.data){
			var curCol = this.data[s]["col"];
			if(curCol > maxCol) maxCol = curCol;
		}

		return maxCol;
	};

	GridMap.prototype.zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

	function zoomed() {
	  d3.select(this).attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}

	GridMap.prototype.draw = function(){
		var self = this;

		var stateIDs = Object.keys(this.data);
		var group = this.svg.append("g")
				.attr("transform", "translate(" + self.groupTrans[0] + ", " + self.groupTrans[1] + ")")
				.call(self.zoom);

		group.append('rect').attr("class", "overlay")
    	.attr("width", self.width)
    	.attr("height", self.height);


		var stateGroups = group.selectAll("g").data(stateIDs)
		  .enter().append("g")
		  .attr("transform", function (stateID) { return "translate(" + self.stateXScale(self.data[stateID].col) + "," + self.stateYScale(self.data[stateID].row) + ")"; })
		  .attr("class", function (stateID) { return 'state' + (self.selectedStates[stateID] ? ' state_selected' : ""); } )
		  .on("click", function (stateID) {
		  	// select (or unselect) the state
		  	self.selectedStates[stateID] = ! self.selectedStates[stateID]
		  	// Update the color of the state box
		  	d3.select(this).attr("class", function (stateID) { return 'state' + (self.selectedStates[stateID] ? ' state_selected' : ""); } );

		  });

		self.stateGroups = stateGroups;

		if (self.cellShape == 'rect'){
			var stateRects = stateGroups.append("rect")
			  .attr("width", self.cellSize)
				.attr("height", self.cellSize)


			stateGroups.append("text")
			  .attr("x", self.cellSize / 2)
			  .attr("y", self.cellSize / 2)
			  .attr("dy", ".35em")
			  .text(function (d) { return d; });
		} else if (self.cellShape == 'circle'){
			var stateCircles = stateGroups.append("circle")
		  	.attr("r", self.cellSize/2)

			stateGroups.append("text")
		  	.attr("dy", ".35em")
		  	.text(function (d) { return d; });

		} else{

			var statePath = stateGroups.append('path')
				.attr('d', d3.superformula().type(self.cellShape).size(Math.PI * Math.pow(self.cellSize,2)))
				//Math.PI * Math.pow(self.cellSize,2)

			stateGroups.append("text")
				.attr("dy", ".35em")
				.text(function (d) { return d; });



			/*
			var hexbin = d3.hexbin()
		    .size([self.width, self.height])
		    .radius(self.cellSize/2);

			var statePath = stateGroups.append('path')
				.attr('d', hexbin.hexagon())
			*/

		}

	}

	GridMap.prototype.changeShape = function(shape, cellSize, gap){
		var self = this;
		self.stateGroups.selectAll('*').remove();

		self.cellShape = shape;
		self.cellSize = cellSize;
		self.gap = gap;


		this.width = (this.getMaxCol() + 2) * (this.cellSize + this.gap) + this.groupTrans[0],
		this.height = (this.getMaxRow() + 2) * (this.cellSize + this.gap) + this.groupTrans[1];

		this.svg
		.attr("height", this.height)
		.attr("width", this.width);

		d3.select(".overlay")
    	.attr("width", self.width)
    	.attr("height", self.height);

		this.stateXScale = d3.scale.linear().domain([0,self.getMaxCol()]).range([0, (self.getMaxCol() - 1) * (self.cellSize + self.gap) - self.groupTrans[0]]);
		this.stateYScale = d3.scale.linear().domain([0,self.getMaxRow()]).range([0, (self.getMaxRow() - 1) * (self.cellSize + self.gap) - self.groupTrans[1]]);


		if (self.cellShape == 'rect' || self.cellShape == 'rectangle'){
			var stateRects = self.stateGroups.append("rect")
			  .attr("width", self.cellSize)
				.attr("height", self.cellSize)

			self.stateGroups.append("text")
			  .attr("x", self.cellSize / 2)
			  .attr("y", self.cellSize / 2)
			  .attr("dy", ".35em")
			  .text(function (d) { return d; });
		} else if (self.cellShape == 'circle'){
			var stateCircles = self.stateGroups.append("circle")
		  	.attr("r", self.cellSize/2)

			self.stateGroups.append("text")
		  	.attr("dy", ".35em")
		  	.text(function (d) { return d; });

		} else{


			var statePath = self.stateGroups.append('path')
				.attr('d', d3.superformula().type(self.cellShape).size(Math.PI * Math.pow(self.cellSize,2)))
				//Math.PI * Math.pow(self.cellSize,2)

			self.stateGroups.append("text")
				.attr("dy", ".35em")
				.text(function (d) { return d; });


		}

	}

	GridMap.prototype.changeLayout = function(layoutData){
		var self = this;

		this.data = layoutData;


		this.width = (this.getMaxCol() + 2) * (this.cellSize + this.gap) + this.groupTrans[0],
		this.height = (this.getMaxRow() + 2) * (this.cellSize + this.gap) + this.groupTrans[1];

		this.svg
		.attr("height", this.height)
		.attr("width", this.width);

		this.stateXScale = d3.scale.linear().domain([0,self.getMaxCol()]).range([0, self.getMaxCol() * (self.cellSize + self.gap)]);
		this.stateYScale = d3.scale.linear().domain([0,self.getMaxRow()]).range([0, self.getMaxRow() * (self.cellSize + self.gap)]);

		var stateIDs = Object.keys(this.data);
		var group = this.svg.select("g");

		var stateGroups = group.selectAll("g").data(stateIDs)
		  .attr("transform", function (stateID) { return "translate(" + self.stateXScale(self.data[stateID].col) + "," + self.stateYScale(self.data[stateID].row) + ")"; })
			.attr("class", function (stateID) { return 'state' + (self.selectedStates[stateID] ? ' state_selected' : ""); } )


		self.stateGroups = stateGroups;

		self.stateGroups.select("text")
			//.attr("x", self.cellSize / 2)
			//.attr("y", self.cellSize / 2)
			.attr("dy", ".35em")
			.text(function (d) { return d; });


	}


	return GridMap;

}());
