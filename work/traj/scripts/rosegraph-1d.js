/**
* Draw a "rose" plot for a categorical variable
* @author: C. Zhang
*/

var roseplot = function(catedata, gid, innersize, rosesize, fillcolor) {
	if (innersize > rosesize) return;
	d3.select("#" + gid).selectAll("g").remove();

	var innerR = innersize,  
		roseR = rosesize;//, 
        //labelR = roseR + labelpad; // radius for label anchor

	//var width = w,
	//	height = h;

	/*
	if (2 * (labelR + 20) > Math.min(width, height)) { // 20 is text height
		labelR = (Math.min(width, height) - 2 * 20) / 2.0;
		roseR = labelR - labelpad;
	}
	*/

	var rosesvg = d3.select("#" + gid);;
 	
 	var modelVarsManager;

 	var data = dataComputing(catedata);

	function setModelVarsMgr (mgr) {
		modelVarsManager = mgr;
	}


   	
	// Map the row_marginal_frequency to an outer radius of lines	
	// var toOutRadiusScale = d3.scale.linear().domain([0, 1]).range([inner_r, label_r-inner_r]).clamp(true); 	
	var outerRadiusScale = d3.scale.linear().domain([data.minRank, data.maxRank]).range([innerR + roseSettings.minradius, roseR]).clamp(true);

	var tickRadiusScale = d3.scale.linear().domain([0, 1]).range([innerR, roseR]).clamp(true);

	/**
	* Output a function that when called, generates SVG paths.
	* 
	*/
	var arcF = function(incr) {
		//var incr = 0; // used for counting the cumulative number of rads to draw for next arc
			//i = 0;		
		//closure to keep var increased
		return d3.svg.arc()	
			// angle is from 0 ~ 2PI
			// for an arc, the angle encodes the proportion of cases in a total cases
        	.startAngle(function(d, i) { if (i == 0){ incr += 1.0 / catedata.length * 2 * Math.PI; return 0;} else { return incr; }})
        	.endAngle(function(d, i) { if (i == 0){return 1.0 / catedata.length * 2 * Math.PI; } else { incr += 1.0 / catedata.length * 2 * Math.PI; return incr;}})
        	.innerRadius(innerR) //uniform inner radius
        	.outerRadius(function(d) { return outerRadiusScale(d.rank); });
	
	};

	var centroids = {};

	// {"minOR": 0.001, "maxOR": 3.6, "dat": [{"lv":"1", "case": 125, "ctrl": 2365, "or": 1.24, "colMarFreq": 0.24, "rowMarFreq": 0.78}, {}, ...,{"lv": 0, ...}]}
	// a is refered to as the top-left corner value in a contigency table, i.e., 
	//	the number of cases with treatment
	// b is the top-right corner value in the contigency table, i.e., 
	//	the number of controls with treatment
	// Draw a rose, for the visualization
	function drawRose(attr) {   			
		var roseg = rosesvg
			.append("svg:g")
			//.attr("transform", "translate(" + (width / 4.0 + 10)+ "," + (height / 2.0 ) + ")")
			.attr("transform", "translate(0,0)")
		
		//var ticks = d3.range(0.2, 1.2, 0.2);       
		
		// Circles representing chart ticks
		/*
		roseg.append("svg:g")
			.attr("class", "roseticks")
			.selectAll("circle")
			.data(ticks)
			.enter().append("svg:circle")
			.attr("cx", 0).attr("cy",0)
			.attr("r", function(d) { return tickRadiusScale(d); });
		*/
			
		// Text representing chart tickmarks
		/*
		roseg.append("svg:g")
			.attr("class", "rosetickmarks")
			.selectAll("text")
			.data(tickmarks)
			.enter().append("svg:text")
			.text(function(d, i){ return i == 0 ? "": d.toFixed(0) })
			.attr("dy", ".35em")
			.attr("dx", function(d) { return outerRadiusScale(d); })
			//.attr("dx", function(d){return r+rosesWidths*d+"px";})
			.attr("transform", function (d, i) {
				return "rotate(" + ((i / tickmarks.length * 360) - 90) + ")";
			});
		*/           
		
			
		var arc = arcF(0);		
		
		// Draw the main rose arcs		
	    var garcs = roseg.selectAll("g.rosearcs")	
	        .data(data.dat)
			.enter()
			.append("svg:g")
			.attr("class", "rosearcs");

	    drawArcs(roseg, garcs, arc, attr);  			
			
		/*
		roseg.append("svg:text")
	      .text(captionText)
	      .attr("class", "caption")
	      .attr("transform", "translate(" + w/2 + "," + (h + 20) + ")");
		*/		

		
		$(".rosearcs").tooltip({
			content: function() {      
              return $(this).attr("title");
          	},
          	//tooltipClass: "custom_tooltip_styling",
      		track: true 
  		}); 

  		drawLabelList();
	}

	function drawLabelList(){
	  /*
	  $("#modeleva").height($(".modelSel").height() - $(".grid-header").height() - $("#catevars").height() - 4); // 4 is border width
	  d3.select("#modelsroot")
	    .attr("width", "100%")
	    .attr("height", "100%");
*/

		d3.select("#cateLvList").html("");
	    var foodText = "";	    
		d3.select("#rosesvg").selectAll(".rosearcs").each(function(d) {
		  var spanColor = "#58e";
		  foodText += "<span style='background:"+spanColor+"'></span>"+d["t"]+": " + d["var"] + "_" + d.t + "<br/>";
		  
	    });
	    //d3.select("#cateLvList").html(foodText);	 

	}
	
	// Draw a complete rose visualization, including axes and center text
	function drawArcs(roseg, garcs, arc, attr)	{
		//console.log('domain:' + outerRadiusScale.domain() + ', range: ' + outerRadiusScale.range());
    	garcs.append("svg:path")
	        .attr("d", arc)
	        .attr("class", function(d) {return 'pt_' + d.t})
			.attr("id", function(d) { return gid + "_" + d.t })			
			.attr("title", function(d) { 
				return  "Time: "+ 2*d["t"] + ":00" +											
						"</br>"+attr.charAt(0).toUpperCase() + attr.slice(1)+": "+ d.rank.toFixed(roseSettings.timefixed);
						

			})
			.attr('fillcolor', fillcolor)
	        .style("fill", fillcolor)	
			.style("fill-opacity", "0.9")
			.style("stroke", roseSettings.arcstroke) //#7fc97f #fff
			.on("mouseover", function(d) { highlightRose(d, this.id); })
			.on("mousemove", function(d) { highlightRose(d, this.id); })
			.on("mouseout", function(d) { cancelHighlight(d, this.id); })
			.on("click", function(d) { arcClick(d); });//

	  	arc = arcF(0); //restore to initial status
	  	/*
		garcs.append("svg:text")
			.attr("id",function(d) { return "cate_lvtxt_" + d.t; })
		    .attr("transform", function(d) {
				var c = arc.centroid(d),
					x = c[0],
					y = c[1],
					// pythagorean theorem for hypotenuse
					h = Math.sqrt(x * x + y * y);

					centroids[d.t] = {"x": x, "y": y};
					
		    	return "translate(" + (x / h * (labelR)) + ',' + (y / h * (labelR)) + ")"; 
		    })
			.attr("text-anchor", "middle")
			//.attr("dy", ".35em")
		    .text(function(d, i) { return d.t; }) //get the label;  
			.on("mouseover", function(d) { highlightRose(d, this.id); })
			.on("mousemove", function(d) { highlightRose(d, this.id); })
			.on("mouseout", function(d) { cancelHighlight(d, this.id); })
			.on("click", function(d) { arcClick(d) });
		*/
		  
		//add dashed line to direct to corresponding label
		/*
		garcs.append("svg:line")
			.attr("id", function(d) { return "cate_line_" + d.t })
			.attr("x1", function(d) { 
				var xc = centroids[d.t].x
					yc = centroids[d.t].y,
					h = Math.sqrt(xc * xc + yc * yc);
					
				return xc / h * (innerR + 2 * (h - innerR));// xc / X = h / (innerR + 2 * (h - innnerR))
			})
			.attr("y1", function(d) {
				var xc = centroids[d.t].x
					yc = centroids[d.t].y,
					h = Math.sqrt(xc * xc + yc * yc);
				
				//return yc / h * (labelR - outerRadiusScale(d.rowMarFreq))
				return yc / h * (innerR + 2 * (h - innerR))
			})
			.attr("x2", function(d) {
				var xc = centroids[d.t].x
					yc = centroids[d.t].y,
					h = Math.sqrt(xc * xc + yc * yc);
					
				return xc / h * labelR;})
			.attr("y2", function(d) {
				var xc = centroids[d.t].x
					yc = centroids[d.t].y,
					h = Math.sqrt(xc * xc + yc * yc);
				
				return yc / h * labelR; })
			.style("stroke", "#aaa")
			.style("stroke-dasharray", "2, 2")
			
		*/			
		

	    // Add something in the center
	    var cw = roseg.append("svg:g").attr("class", "rosecaption");
		var lefcoor = roseg.attr('transform').substr(10, 7).split(',');		
	    var tblk = cw.append("svg:text") 
					.attr("class", "textp")
					.attr("transform", "translate(0, "+ innersize/2 + ")")
	        		.attr("text-anchor", "middle") 
	        		.attr("fill", 'black')	        		
					.text(function(d) {return d.id});
					//tblk.append("tspan")
					//.attr('x',parseInt(lefcoor[0])+20).attr('dy','0em')
					//.text(bdname);
					//tblk.append("tspan")
					//.attr('x',parseInt(lefcoor[1])+20).attr('dy','2em')
					//.text('P:'+pval);
		/*
	    cw.append("svg:text")
	        .attr("transform", "translate(0, 14)")	        
	        .attr("text-anchor", "middle") 
	        .text(data.reflv);
	    */

	}



	function arcClick(d){ 
		//var cur = d3.select('.pt_' + d.t).style("opacity");
		d3.selectAll('.rosearcs path').style("fill", function(da){ return da.t == d.t ? d3.select(this).attr('fillcolor') : '#E5E5E5'});    //'#E5E5E5'
    	//d3.selectAll('.pt_' + d.t).style("opacity", 1);
    	
  	}

	
	/**
	* Aggregate the number of cases, calculate the row/column marginal frequencies, 
	* and count min/max odds ratios
	* @param {array},  [{"t":"1", "speed": 125, "flow": 2365}, {}, ...,{"t": 0, ...}],
	
	*					this is an original data read from web service/local file
	* @return {associative array}, {"minSpeedF", 53, "maxSpeedF": 250, "minFlowF": 0.2, "maxFlowF": 0.99, "dat": [{"t":"1", "speed": 125, "flow": 2365, "speedFreq": 0.24, "flowFreq": 0.78}, {}, ...]}
	*								
	*/
	function dataComputing(dd) {
		var minRankF = maxRankF = 0;
		var minRank = maxRank = dd[0].rank;
		var rank_total = 0;
		var res = {};
	    for (var i = 0; i < dd.length; ++i) {
	    	var oneTime = dd[i];
			//count up all 
			rank_total += oneTime["rank"];
			//flow_total += oneTime["flow"];			
	    }

	    var tmp = [];
	    for (var i = 0; i < dd.length; ++i) {
	    	var oneTime = dd[i];
	    	//if(oneLv["lv"] != reflv) {
		    	oneTime["rankFreq"] = oneTime["rank"] / rank_total;
		    	//oneTime["flowFreq"] = oneTime["flow"] / flow_total;
				
		    	tmp.push(oneTime);
	    	//}
	    }
	    tmp.sort(compareLV);	   

	    for (var i = 0; i < tmp.length; ++i){
	    	var oned = tmp[i];
	    	if(+oned.rankFreq < minRankF)
	    		minRankF = +oned.rankFreq;
	    	if(+oned.rankFreq > maxRankF)
	    		maxRankF = +oned.rankFreq;	

	    	if(+oned.rank < minRank)
	    		minRank = +oned.rank;
	    	if(+oned.rank > maxRank)
	    		maxRank = +oned.rank;    	
	    }
	    
	    res["minRankF"] = minRankF;
	    res["maxRankF"] = maxRankF;	    
	    res["minRank"] = minRank;
	    res["maxRank"] = maxRank;	 
	   	res["dat"] = tmp;   

	   	//console.log(res);
	    return res;
	}

	function compareLV(a,b) {
	  if (a.t < b.t)
	     return -1;
	  if (a.t > b.t)
	    return 1;
	  return 0;
	}

	
	function highlightRose(d,id){
		
			d3.select("#"+id).style("stroke-width",2);
			d3.select("#"+id).style("stroke","white");		

		
	}

	function cancelHighlight(d,id){
		
			d3.select("#"+id).style("stroke-width",1);
			d3.select("#"+id).style("stroke", 'black');
			
			
		
	}	

	function updateData(data, newfill, attr) {
		var newdata = dataComputing(data);
		// need to update the domain of the scale
		outerRadiusScale = d3.scale.linear().domain([newdata.minRank, newdata.maxRank]).range([innerR + roseSettings.minradius, roseR]).clamp(true);
		var roseArc = rosesvg.selectAll('.rosearcs').data(newdata.dat); 
		var arc = arcF(0);
		roseArc.select('path')
			.attr("d", arc)
			.attr("title", function(d) { 
				return  "Time: "+ 2*d["t"] + ":00" +						
						"</br>"+attr.charAt(0).toUpperCase() + attr.slice(1)+": "+ d.rank.toFixed(roseSettings.timefixed);
						

			})
	        .style("fill", newfill)	
			.style("fill-opacity", "0.9")
			.style("stroke", roseSettings.arcstroke) //#7fc97f #fff
				
	}

	// Expose Public API
  	return {
    draw: drawRose,
    update: updateData,
    getID: gid
  	}

};



