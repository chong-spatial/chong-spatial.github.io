/**
* Collapsed tree 
* 
*
* @ C. Zhang
* Inspiration from https://bl.ocks.org/mbostock/4339083
**/ 

d3.treeChart = function() {


	var
		width = 430,
		height = 410,	
		nodeSize = 20,
		nodeGroupHeight = 30,
		nodeRectWidth = 16,
		nodeRectHeight = 16,

		margin = {
			top: -10, // move up due to root node which is not drawn
	        bottom: 10,
	        left: 5,
	        right: 10

		},

		duration =200;


	var defaultNodeIdx = 0;

	var tree = d3.layout.tree().nodeSize([0, nodeSize]);

	var treeData;

	var rootsvg, bggroup, maingroup;

	var dispatch = d3.dispatch('nodeClick');
	dispatch.on('nodeClick.int', function(d){
		_checkChildren(d);
	});
	dispatch.on('nodeClick.ext');




	function exports(sel) {
		sel.each(function(data) {
			treeData = data;
			
			var svgWidth = width + margin.left + margin.right;

	    	rootsvg = sel.append("svg")
	      		.attr("width", svgWidth)

		    maingroup = rootsvg
			    .append("g")
			    .attr("class", "expTree")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			bggroup = maingroup.append('rect')
				.attr("width", width + margin.left + margin.right)
				.attr('class', 'background')

			treeData.x0 = 0;
			treeData.y0 = 0;

			treeData.children.forEach(function(d) { 
				d.children.sort(function(a, b) { 
					if(a.tag < b.tag) return -1;
					if(a.tag > b.tag) return 1;
					return 0;
				})
			});

			treeData.children.forEach(_collapse);

			_update(treeData);

	    }) 

	}

	// collapse all nodes recursively
	var _collapse = function(d) {

		// in the first running, show all routes, 
		// in other cases, keep the value it has
	    if(!d.hasOwnProperty('checked')) { d.checked = false; }
	    if (d.children) {
	        d.numOfChildren = d.children.length;
	        d._children = d.children;
	        d._children.forEach(_collapse);
	        d.children = null;
	    }
	    else {
	        d.numOfChildren = 0;
	    }

	};			

	// switch children nodes on
	var _toggleonChildren = function(d) {
	    if (d._children) {
	        d.children = d._children;
	        d._children = null;
	    }
	    _update(d);
	};

	// switch children nodes off
	var _toggleoffChildren = function(d) {
	    if (d.children) {
	        maingroup.select('#arrow_' + d.name).attr("translate(-12, 0)rotate(90)");
	        d._children = d.children;
	        d.children = null;
	    } else{
	    	_update(d);
	    }
	    
	};

	// toggle check box on click.
	var _checkChildren = function(d) {
	    d.checked = !d.checked;
	    if (d.children) {
	        // mark children recursively
	        for(var n in d.children) {
	        	d.children[n].checked = d.checked;
	        }
	    } else if (d._children) {

	    	for(var n in d._children) {
	        	d._children[n].checked = d.checked;
	        }	      
	    }

	    _update(d);
	};


	var _update = function(source) {	

	    // Compute the flattened node list. TODO use d3.layout.hierarchy.
	    var nodes = tree.nodes(treeData);

	    var newHeight = Math.max(height, nodes.length * nodeGroupHeight + margin.top + margin.bottom);

	    rootsvg.transition()
	        .duration(duration)
	        .attr("height", newHeight);

	    bggroup.attr("height", newHeight);

	    // Compute the "layout".
	    nodes.forEach(function(n, i) {
	        n.x = i * nodeGroupHeight;
	    });

	    
	    var node = maingroup.selectAll(".node")
	    	// not drawing root node at this moment
	        .data(nodes.filter(function(n) { return n.type != 'root'}), function(d) {
	            return d.index || ( d.index = ++defaultNodeIdx ); 
	        })
	        

	    var nodeEnter = node.enter().append("g")
	        .attr("class", function (d){ return "node " + d.type})
	        // for transition
	        .style("opacity", 0.001)
	        .attr("transform", function(d) {
	            return "translate(" + source.y0 + "," + source.x0 + ")";
	        })
	       
	    // give class name to route node
	    nodeEnter.filter(function(d){ return d.type == 'route'}) 
	    	.attr('class', function(d) { return d3.select(this).attr('class') + ' tag' + d.tag});


	    // Enter any new nodes at the parent's previous position.
	    nodeEnter.append("path").filter(function(d) { return d.numOfChildren > 0 && d.id != treeData.id })
	        .attr("d", "M-6,-8 L-6,8 L4,0 Z")
	        .attr("class", "arrow")
	        .attr('id', function(d){ return 'arrow_' + d.name})
	        .attr("transform", "translate(-12, 0)")
	        .on("click", _toggleChildren);
	 

	    // arrow directions
	    node.select("path").attr("transform", function(d) {
	        if (d.children) {
	            return "translate(-12, 0)rotate(90)";
	        }
	        else {
	            return "translate(-12, 0)rotate(0)";
	        }
	    });

	    
	    var mainNode = nodeEnter.append("g").attr("class", "mainNode").on("click", dispatch.nodeClick);
	    // Enter any new nodes at the parent's previous position.
	    mainNode.append("rect")
	    	.attr("width", nodeRectWidth)
	        .attr("height", nodeRectHeight)
	        .attr("y", -5)


	    mainNode.select("rect")
	        .style('fill', function(d) { return d.color; })

	    // unselect style
	    mainNode.append("path").filter(function(d) { return d.parent })
	        .attr("class", 'checkbox uncheck')
	        .attr("d", "M-8,-8 L-8,8 L8,8 L8,-8 Z M-8,-8 L8,8 M-8,8 L8,-8")	
	        .attr("transform", "translate(" + nodeRectWidth / 2 + ", 2)")
	        

	   
	    node.selectAll(".checkbox")
	      .classed("uncheck", function(d) { return d.checked ? false : true; });

	    // label group node
	    mainNode.filter(function(d){ return d.type == 'group'}).append("text")
	        .attr("dy", 10)
	        .attr("dx", nodeRectWidth + 2)
	        .attr("class", "tag")
	        .text(function(d) { return d.name; })
	        .each(function(d) { d.tagWidth = d3.select(this).node().getComputedTextLength()});
		
	    // now, label route node
	    mainNode.filter(function(d){ return d.type == 'route'}).append('text')
	    	.attr('dy', 10)
	        .attr('dx', nodeRectWidth + 2)
	        .attr('class', 'title')
	        .text(function(d) { return d.title; })
	        .each(function(d) { d.titleWidth = d3.select(this).node().getComputedTextLength()});
	    
	    // label outline for rout node
	    mainNode.insert("rect", "text")		
			.attr('height', nodeRectHeight)
			.attr('width', function(d) { return d.titleWidth; })
			.attr('x', nodeRectWidth + 2)
			.attr('y', -4)
	        .attr('class', 'outline')
	        .style('stroke', function(d) { return d.color });


	    // translate nodes to their new position.
	    nodeEnter.transition()
	        .duration(duration)
	        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
	        .style("opacity", 1);

	    node.transition()
	        .duration(duration)
	        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
	        .style("opacity", 1)
	        .select("rect");

	    // translate exiting nodes to the parent's new position.
	    node.exit().transition()
	        .duration(duration)
	        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
	        .style("opacity", 1e-6)
	        .remove();

	    // store the old positions for transition.
	    nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
	    });
	};	

	// toggle children on click.
	var _toggleChildren = function(d) {
	    if (d.children) {
	        d3.select('#arrow_' + d.name).attr("translate(-12, 0)rotate(90)");
	        d._children = d.children;
	        d.children = null;
	    } else if (d._children) {
	        d.children = d._children;
	        d._children = null;
	    }
	    _update(d);
	};
		
	// only toggle leaf nodes
	exports.toggleLeaf = function(tag) {		
		var groupNode = null;
		var tagFirstLetter = isNaN(tag.substr(0, 1)) ? 'A-Z' : tag.substr(0, 1)
		for(var i = 0; i < treeData.children.length; i++) {
			var d = treeData.children[i];
			if(d.name == tagFirstLetter) groupNode = d;
			
		}

		if(groupNode) {
			this.collapseAllNodes();			
			_toggleChildren(groupNode);
			//_toggleonChildren(groupNode);
		}

		return this;

	}

	// highlight leaf nodes, typically use it together with toggleLeaf()
	exports.highlightLeaf = function(tag) {
		maingroup.select('.tag' + tag).select('.outline')
			.transition()
			.duration(4000)
			.styleTween("fill", function() {
				return d3.interpolateRgb("yellow", "white");
			})
			.each('end', function() {
				d3.select(this).style('fill', null);
			})		

	}

	

	// switch all nodes off
	exports.collapseAllNodes = function() {
	
		treeData.children.forEach(_collapse);
		_update(treeData);

		return this;
	}

	// get all leaf nodes
	exports.getAllLeafNodes = function() {
		var res = [];
		findChildren(treeData, res);
		return res;
	}

	// get children nodes with specified child node
	function findChildren(child, curRes) {
		if(child.depth < 2){
			var childKey = child.hasOwnProperty('children') ? 'children' : '_children';
			var children = child[childKey];
			for (var i = 0; i < children.length; i++) {
				findChildren(children[i], curRes);
			}
		} else {
			curRes.push(child);
		}
	}
   
   	// get all selected nodes
	exports.getUncheckedNodes = function() {
		var res = [];
		var allLeafNodes = this.getAllLeafNodes();

		for(var i = 0; i < allLeafNodes.length; i++) {
			var d = allLeafNodes[i];
			 if (!d.checked) {
			 	res.push({name: d.name, tag: d.tag, title: d.title});
			 }
		}

		return res;

	}

	exports.width = function(_) {
		if(!arguments.length){
            return width;
        }
       width = _;
       return this;
	}

	exports.height = function(_) {
		if(!arguments.length){
            return height;
        }
       	height = _;
       	return this;

	}

	return d3.rebind(exports, dispatch, 'on');

}
