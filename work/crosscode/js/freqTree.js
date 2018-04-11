// @author Chong Zhang.
// Please contact me at chongzhang.nc@gmail.com if you have any questions


var freqTree = function(root, wherein){
	var width = 230, minHeight = 210;
	var barHeight = 20, barWidth = 50;

	var margin = {
	        top: 0,
	        bottom: 10,
	        left: 0,
	        right: 10
	    }

	var i = 0, duration = 200;

	var tree = d3.layout.tree()
	    .nodeSize([0, 20]);

	var diagonal = d3.svg.diagonal()
	    .projection(function(d) { return [d.y, d.x]; });

	var svg = d3.select("#"+wherein).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .append("g")
	    .attr("class", "freqTab")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var svgbg = svg.append('rect')
		.attr("width", width + margin.left + margin.right)
		.attr('class', 'freqTabSvgBg')
		.on('click', function(){
			rootsvg.selectAll('.rulebg').remove();
			//d3.selectAll('#bsvg .rulebg').classed('highltRule', false); d3.selectAll('.highltrect').classed('highltFreqItem', false);
		})

	// set initial coordinates
	root.x0 = 0;
	root.y0 = 0;

	root.children.forEach(function(d){d.children.sort(function(a,b){ return b.rank - a.rank}); return d;})

	// collapse all nodes recusively, hence initiate the tree
	function collapse(d) {
	    d.Selected = false;
	    if (d.children) {
	        d.numOfChildren = d.children.length;
	        d._children = d.children;
	        d._children.forEach(collapse);
	        d.children = null;
	    }
	    else {
	        d.numOfChildren = 0;
	    }
	}
	root.children.forEach(collapse);

	update(root);

	function update(source) {

	    // Compute the flattened node list. TODO use d3.layout.hierarchy.
	    var nodes = tree.nodes(root);

	    height = Math.max(minHeight, nodes.length * barHeight + margin.top + margin.bottom);

	    d3.select("svg").transition()
	        .duration(duration)
	        .attr("height", height);

	    svgbg.attr("height", height);

	    // Compute the "layout".
	    nodes.forEach(function(n, i) {
	          n.x = i * barHeight;
	        });

	    // Update the nodes…
	    var node = svg.selectAll("g.node")
	        .data(nodes, function(d) {
	              return d.index || (d.index = ++i); });

	    var nodeEnter = node.enter().append("g")
	        .attr("class", function (d){ return "node " + d.type})
	        .style("opacity", 0.001)
	        .attr("transform", function(d) {
	              return "translate(" + source.y0 + "," + source.x0 + ")";
	        });

	    // Enter any new nodes at the parent's previous position.
	    nodeEnter.append("path").filter(function(d) { return d.numOfChildren > 0 && d.id != root.id })
	        .attr("width", 9)
	        .attr("height", 9)
	        .attr("d", "M -3,-4, L -3,4, L 4,0 Z")
	        .attr("class", "arrow")
	        .attr('id', function(d){ return 'arrow_' + d.name})
	        .attr("transform", "translate(-14, 0)")
	        .on("click", toggleChildren);




	    node.select("path").attr("transform", function(d) {
	            if (d.children) {
	                return "translate(-14, 0)rotate(90)";
	            }
	            else {
	                return "translate(-14, 0)rotate(0)";
	            }
	        });


	    // Enter any new nodes at the parent's previous position.
	    nodeEnter.append("rect")
	        .attr("width", 11)
	        .attr("height", 11)
	        .attr("y", -5)

	    nodeEnter.select("rect").filter(function(d) { return d.type == 'attr' })
	        .style('fill', function(d) { return attrColorScale(d.name)})



	    nodeEnter.select("rect").filter(function(d) { return d.type == 'val'})
	        .attr('class', function(d){
	        	if(d.rules.cls1.length > d.rules.cls2.length) return 'head cls1' ;
	        	else if (d.rules.cls2.length > d.rules.cls1.length) return 'head cls2';
	        	else return 'head cls1eqcls2';
	        })




	    nodeEnter.append("path").filter(function(d) { return d.parent })
	        .attr("width", 9)
	        .attr("height", 9)
	        .attr("class", function(d){ return 'check ' + d.type})
	        .attr("d", "M -5,-5, L -5,6, L 6,6, L 6,-5 Z M -5,-5, L 6,6, M -5,6 L 6,-5")
	        .attr("transform", "translate(5, 0)")

	    nodeEnter.select('.check').filter(function(d){ return d.type != 'others' && d.type != 'other' })
	     	.attr("class", 'checkable')


	   	nodeEnter.select('.checkable').filter(function(d){ return d.type != 'others' && d.type != 'other' })
	   	.on("click", highlightRules);

	    node.selectAll("path:nth-child(3)")
	      .attr("style", function(d) { return "opacity: "+boxStyle(d) });

	    nodeEnter.filter(function(d) {return d.type == 'val' || d.type == 'other'} )
	        .call(d3.helper.tooltipFreq());

	    nodeEnter.filter(function(d){ return d.type != 'root'}).append("text")
	        .attr("dy", 5)
	        .attr("dx", 14)
	        .attr("class", function(d) { return d.type+" text"; } )
	        .text(function(d) { return d.name; })
	        .each(function(d){d.displayWidth = d3.select(this).node().getComputedTextLength()});

	    nodeEnter.filter(function(d){ return  d.type == 'val' })
		    .append("rect")
		    .attr('x', 12)
		    .attr("y", -5)
		    .attr('id', function(d){ if('parent' in d) return 'highlt_rec_' + d.parent.name + '_' + d.name; else return 'highlt_rec_' + d.name})
		    //.attr('width', function(d){ return d.displayWidth })
				.attr('width', 16)
				.attr('height', 8)
				.attr('class', function(d){
					if(d.rules.cls1.length > d.rules.cls2.length) return 'highltrect htCls1' ;
					else if (d.rules.cls2.length > d.rules.cls1.length) return 'highltrect htCls2';
					else return 'highltrect htCls1eqCls2';
				})
				.style("display", "none")

	    // Transition nodes to their new position.
	    nodeEnter.transition()
	        .duration(duration)
	        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
	        .style("opacity", 1);

	    node.transition()
	        .duration(duration)
	        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
	        .style("opacity", 1)
	        .select("rect");

	    // Transition exiting nodes to the parent's new position.
	    node.exit().transition()
	        .duration(duration)
	        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
	        .style("opacity", 1e-6)
	        .remove();

	    // Stash the old positions for transition.
	    nodes.forEach(function(d) {
	          d.x0 = d.x;
	          d.y0 = d.y;
	      });
	}


	// Toggle children on click.
	function toggleChildren(d) {

	    if (d.children) {
	        d3.select('#arrow_' + d.name).attr("translate(-14, 0)rotate(90)");
	        d._children = d.children;
	        d.children = null;
	    } else if (d._children) {
	        d.children = d._children;
	        d._children = null;
	    }
	    update(d);
	}

	function collapseAllNodes(){
		root.children.forEach(collapse);
		update(root);
	}

	// Toggle check box on click.
	function highlightRules(d) {
		/*
	    d.Selected = !d.Selected;
	    //d3.select(this).style("opacity", boxStyle(d));
	    if (d.children) {
	        // mark children recursively
	        for(var n in d.children) {
	            checkBox(d.children[n], d.Selected);
	        }
	    }
	    update(d);
	    */

	    var highltrect = 'parent' in d ? 'highlt_rec_' + d.parent.name + '_' + d.name: 'highlt_rec_' + d.name;
 		d3.selectAll('.highltrect').style('display', "none");

	    d3.select('#' + highltrect).style('display', null);

	    // if there is not rule_backgroud svg, creat
	    if(rootsvg.selectAll('.rulebg').size() == 0) {
	    	addRuleBG();
	    	//$('#mousetipoverview').attr("checked","checked");
	    }
			rootsvg.selectAll('.rulebg').style("display", null);

			itemsetsvg.selectAll('.itemRect').classed("highltItem", false); //grey
            //arrowsvg.selectAll('.arrow').datum(function(d) { delete d.intersection; return d })

	    d3.selectAll('#bsvg .rulebg').classed('highltRule', false);
	    if (d.type == 'val'){
	    	//global variable
	    	selectedItems.push(d.parent.name + '=' + d.name)

	    	var cls1Rules = d.rules.cls1.map(function(rid){ return 'cls1_' + rid}),
	    		cls2Rules = d.rules.cls2.map(function(rid){ return 'cls2_' + rid});

	    	cls1Rules.forEach(function(r){ d3.select('#rulebg_' + r).classed('highltRule', true) ;})
	    	cls2Rules.forEach(function(r){ d3.select('#rulebg_' + r).classed('highltRule', true) ;})

				//highlight arrow
				cls1Rules.forEach(function(r){ d3.selectAll('.itrect_' + r).classed("highltItem", true)})
				cls2Rules.forEach(function(r){ d3.selectAll('.itrect_' + r).classed("highltItem", true)})

	    } else if (d.type == 'attr') {
	    	d3.select('#bsvg').selectAll('.' + d.name).classed('highltRule', true);
	    	d3.select('#itemSVG').selectAll('.' + d.name).classed("highltItem", true);

	    	var validChildAttr = 'children' in d ? 'children' : '_children';
	    	for(var i = 0; i < d[validChildAttr].length; i++){
	    		var val = d[validChildAttr][i];
	    		if(val.type == 'val'){
	    			selectedItems.push(d.name + '=' + val.name)
	    			/*
	    			var cls1Rules = val.rules.cls1.map(function(rid){ return 'cls1_' + rid}),
	    			cls2Rules = val.rules.cls2.map(function(rid){ return 'cls2_' + rid});

	    			cls1Rules.forEach(function(r){ d3.select('#rulebg_' + r).classed('highltRule', true) ;})
	    			cls2Rules.forEach(function(r){ d3.select('#rulebg_' + r).classed('highltRule', true) ;})

						//highlight arrow
						cls1Rules.forEach(function(r){ d3.selectAll('.itrect_' + r).style("opacity", 1)})
						cls2Rules.forEach(function(r){ d3.selectAll('.itrect_' + r).style("opacity", 1)})
					*/
	    		}
	    	}


	    }

			var tmpD = d3.selectAll('.highltRule').data();
		  selectedRules = tmpD.map(function(d){ return allRulesMap[d.cls][d.id]})
			//console.log("Selected Rules in freqTree:", selectedRules)
			creatSVGgridfromHighlt(selectedRules);
	}

	function checkBox(d, checked) {
	    d.Selected = checked;
	}

	function boxStyle(d) {
	    //console.log(d);
	    return d.Selected ? 1 : 0;
	}

	function toggleonChildren(d) {
		/*
	    if (d.children) {
	        d3.select('#arrow_' + d.name).attr("translate(-14, 0)rotate(90)");
	        d._children = d.children;
	        d.children = null;
	    } else
	    */

	     if (d._children) {
	        d.children = d._children;
	        d._children = null;
	    }
	    update(d);
	}

	function toggleoffChildren(d) {

	    if (d.children) {
	        d3.select('#arrow_' + d.name).attr("translate(-14, 0)rotate(90)");
	        d._children = d.children;
	        d.children = null;
	    } else



	    update(d);
	}

	function expendNodes(list){
		//console.log(list)
		d3.selectAll('.highltrect').style('display', "none");

		var attrs = {}
		for(var i = 0; i < list.length; i++){
			var li = list[i],
				attr = li.split('=')[0],
				val = li.split('=')[1];
			if(attr in attrs){
				var vals = attrs[attr];
				if(vals.indexOf(val) == -1){
					vals.push(val);
				}
			} else {
				attrs[attr] = [val]
			}

		}

		var allAttrs = allFreqItem.children.map(function(d){ return d.name})
		var toExpAttrs = Object.keys(attrs);
		var toCollapseAttrs = [];
		for(var i = 0; i < allAttrs.length; i++){

			if (toExpAttrs.indexOf(allAttrs[i]) == -1) {
				toCollapseAttrs.push(allAttrs[i]);
			}
		}

		for( var a in attrs){
			var attrNode = getAttrNodeFromFreqItems(a);
			if (attrNode){
				toggleonChildren(attrNode);
				// attr name
				//var highltrect = 'highlt_rec_' + tnode.parent.name + '_' + tnode.name;
				// val name
				for (var i = 0; i < attrs[a].length; i++){
					var highltrect = 'highlt_rec_' + attrNode.name + '_' + attrs[a][i];

	    			d3.select('#' + highltrect).style('display', null);
	    		}
			}

		}

		for(var i = 0; i < toCollapseAttrs.length; i++) {
			var attrNode = getAttrNodeFromFreqItems(toCollapseAttrs[i]);
			if (attrNode){
				toggleoffChildren(attrNode);
			}
		}
	}

	function getAttrNodeFromFreqItems (attrName) {
		for(var j = 0; j < allFreqItem.children.length; j++){
			var tnode = allFreqItem.children[j];
			if (tnode.name == attrName) return tnode;
		}
		return null;
	}


	return {
    	expendHighlight: expendNodes,
			collapseAll: collapseAllNodes
	}

}
