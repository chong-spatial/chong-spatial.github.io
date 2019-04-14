/**
* Draw a "rose" plot for a categorical variable
* @author: C. Zhang
*/

var roseplot = function(catedata, svgDivId, w, h, innersize, rosesize, labelpad) {
	if (innersize > rosesize) return;
	d3.select("#" + svgDivId).select("svg").selectAll("g").remove();

	var innerR = innersize,  
		roseR = rosesize, 
        labelR = roseR + labelpad; // radius for label anchor

	var width = w,
		height = h;

	if (2 * (labelR + 20) > Math.min(width, height)) { // 20 is text height
		labelR = (Math.min(width, height) - 2 * 20) / 2.0;
		roseR = labelR - labelpad;
	}

	var rosesvg = d3.select("#" + svgDivId).select("svg").attr("width", width).attr("height", height);
 	
 	var modelVarsManager;

 	var data;
	// Process data
	dataComputing(catedata);

	function setModelVarsMgr (mgr) {
		modelVarsManager = mgr;
	}

	// Map a probability to a color  
	/*                  
	var oddsratioColorScaleF = function(min, max) {
		//return d3.scale.linear().domain([min, max]).range(["rgb(191, 233, 0)", "rgb(249, 73, 0)"]).interpolate(d3.interpolateRgb);
		return d3.scale.linear().domain([min, max]).range(["rgb(191, 233, 0)", "rgb(249, 73, 0)"]).interpolate(d3.interpolateRgb);
	}	
	var oddsratioColorScale = oddsratioColorScaleF(data.minOR, data.maxOR);	
	*/


    var greater1scale = d3.scale.linear().domain([data.minOR, data.maxOR]).interpolate(d3.interpolateRgb).range(["#F57E7E", "#d73027"]),//"#A9D4E3","#05A3DE"
    	lessthan1scale = d3.scale.linear().domain([data.minOR, data.maxOR]).interpolate(d3.interpolateRgb).range(["#1a9641", "#bae4b3"]),//"#A9D4E3","#05A3DE"
        oddsratioColorScale;
    if(data.minOR > 1){
    	oddsratioColorScale = greater1scale;
    }else { // data.minOR <= 1
    	if(data.maxOR <= 1){
      		oddsratioColorScale = lessthan1scale; //function(){return "#1a9641"};//"#A9D4E3","#05A3DE"
      	}else{ // data.maxOR > 1
      		oddsratioColorScale = function(e){ return e<=1? lessthan1scale(e): greater1scale(e)};
    	}
    }
    if(data.maxOR < 1){
      oddsratioColorScale = lessthan1scale;
    }else{
      oddsratioColorScale = function(e){ return e<=1? lessthan1scale(e): greater1scale(e)};
    }

	
	// Map the row_marginal_frequency to an outer radius of lines	
	// var toOutRadiusScale = d3.scale.linear().domain([0, 1]).range([inner_r, label_r-inner_r]).clamp(true); 	
	var outerRadiusScale = d3.scale.linear().domain([data.minRowMF, data.maxRowMF]).range([innerR + roseR/5.0, roseR]).clamp(true);

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
        	.startAngle(function(d, i) { if (i == 0){ incr += d.colMarFreq * 2 * Math.PI; return 0;} else { return incr; }})
        	.endAngle(function(d, i) { if (i == 0){return d.colMarFreq * 2 * Math.PI; } else { incr += d.colMarFreq * 2 * Math.PI; return incr;}})
        	.innerRadius(innerR) //uniform inner radius
        	.outerRadius(function(d) { return outerRadiusScale(d.rowMarFreq); });
	
	};

	var centroids = {};

	// {"minOR": 0.001, "maxOR": 3.6, "dat": [{"lv":"1", "case": 125, "ctrl": 2365, "or": 1.24, "colMarFreq": 0.24, "rowMarFreq": 0.78}, {}, ...,{"lv": 0, ...}]}
	// a is refered to as the top-left corner value in a contigency table, i.e., 
	//	the number of cases with treatment
	// b is the top-right corner value in the contigency table, i.e., 
	//	the number of controls with treatment
	// Draw a rose, for the visualization
	function drawRose() {   			
		var roseg = rosesvg
			.append("svg:g")
			.attr("transform", "translate(" + (width / 4.0 + 20)+ "," + (height / 2.0 ) + ")")
		
		var ticks = d3.range(0.2, 1.2, 0.2);       
		
		// Circles representing chart ticks
		roseg.append("svg:g")
			.attr("class", "roseticks")
			.selectAll("circle")
			.data(ticks)
			.enter().append("svg:circle")
			.attr("cx", 0).attr("cy",0)
			.attr("r", function(d) { return tickRadiusScale(d); });
			
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

	    drawArcs(roseg, garcs, arc);  			
			
		/*
		roseg.append("svg:text")
	      .text(captionText)
	      .attr("class", "caption")
	      .attr("transform", "translate(" + w/2 + "," + (h + 20) + ")");
		*/		


		$("#rosesvg path").tooltip({
			content: function() {      
              return $(this).attr("title");
          	},
          	tooltipClass: "mytooltip",
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
	    //cateLabel[d["var"] + "_" + d.lv]
	    //return d.lv != data.reflv ? oddsratioColorScale(d.or) : "#CDCDCD" })	
		d3.select("#rosesvg").selectAll(".rosearcs").each(function(d) {
		  var spanColor = d.lv != data.reflv ? oddsratioColorScale(d.or) : "#CDCDCD";
		  foodText += "<span style='background:"+spanColor+"'></span>"+d["lv"]+": " + cateLabel[d["var"] + "_" + d.lv] + "<br/>";
		  
	    });
	    d3.select("#cateLvList").html(foodText);
	 
	  /*
	  var cateLevels = d3.select("#cateLvList").append("ul").attr("class","list");
	  cateVariabels.selectAll("li")
	    .data(cateVars).enter()
	    .append("li")    
	    .attr("class",function(d){return d.chisqp >0.05?"unsig":"sig"})  
	    .attr("id",function(d){return "desc_"+d.name})
	    .classed("ui-draggable", true)
	    .text(function(d) { return d.name })
	    .on("click", function(d) { displayRose(d.name); })
	    */

	}
	
	// Draw a complete rose visualization, including axes and center text
	function drawArcs(roseg, garcs, arc)	{
    	garcs.append("svg:path")
	        .attr("d", arc)
			.attr("id", function(d) { return d.lv.trim().length === 0 ? "cate_lv_null" : "cate_lv_"+d.lv })
			.attr("title", function(d) { 
				return d.lv != data.reflv ? "Category: "+ cateLabel[d["var"] + "_" + d.lv] +
						"</br>Angle: "+ (100 * d.colMarFreq).toFixed(2) + "%" +
						"</br>Radius: "+ (100 * d.rowMarFreq).toFixed(2) + "%" +
						"</br>Odds Ratio: " + (+d.or).toFixed(2) + ", 95% C.I. [" + (+d.orlb).toFixed(2) + ", " + (+d.orub).toFixed(2) + "]" :
						"Category (Ref.): "+ cateLabel[d["var"] + "_" + d.lv] +
						"</br>Angle: "+ (100 * d.colMarFreq).toFixed(2) + "%" +
						"</br>Radius: "+ (100 * d.rowMarFreq).toFixed(2) + "%";						

			})
	        .style("fill", function(d) { return d.lv != data.reflv ? oddsratioColorScale(d.or) : "#CDCDCD" })	
			.style("fill-opacity", "0.7")
			.on("mouseover", function(d) { highlightRose(d, this.id); })
			.on("mousemove", function(d) { highlightRose(d, this.id); })
			.on("mouseout", function(d) { cancelHighlight(d, this.id); })
			.on("click", function(d) { arcClick(d); });//

	  	arc = arcF(0); //restore to initial status
		garcs.append("svg:text")
			.attr("id",function(d) { return "cate_lvtxt_" + d.lv; })
		    .attr("transform", function(d) {
				var c = arc.centroid(d),
					x = c[0],
					y = c[1],
					// pythagorean theorem for hypotenuse
					h = Math.sqrt(x * x + y * y);

					centroids[d.lv] = {"x": x, "y": y};
					
		    	return "translate(" + (x / h * (labelR)) + ',' + (y / h * (labelR)) + ")"; 
		    })
			.attr("text-anchor", "middle")
			//.attr("dy", ".35em")
		    .text(function(d, i) { return d.lv; }) //get the label;  
			.on("mouseover", function(d) { highlightRose(d, this.id); })
			.on("mousemove", function(d) { highlightRose(d, this.id); })
			.on("mouseout", function(d) { cancelHighlight(d, this.id); })
			.on("click", function(d) { arcClick(d) });
		  
		//add dashed line to direct to corresponding label
		garcs.append("svg:line")
			.attr("id", function(d) { return "cate_line_" + d.lv })
			.attr("x1", function(d) { 
				var xc = centroids[d.lv].x
					yc = centroids[d.lv].y,
					h = Math.sqrt(xc * xc + yc * yc);
					
				return xc / h * (innerR + 2 * (h - innerR));// xc / X = h / (innerR + 2 * (h - innnerR))
			})
			.attr("y1", function(d) {
				var xc = centroids[d.lv].x
					yc = centroids[d.lv].y,
					h = Math.sqrt(xc * xc + yc * yc);
				
				//return yc / h * (labelR - outerRadiusScale(d.rowMarFreq))
				return yc / h * (innerR + 2 * (h - innerR))
			})
			.attr("x2", function(d) {
				var xc = centroids[d.lv].x
					yc = centroids[d.lv].y,
					h = Math.sqrt(xc * xc + yc * yc);
					
				return xc / h * labelR;})
			.attr("y2", function(d) {
				var xc = centroids[d.lv].x
					yc = centroids[d.lv].y,
					h = Math.sqrt(xc * xc + yc * yc);
				
				return yc / h * labelR; })
			.style("stroke", "#aaa")
			.style("stroke-dasharray", "2, 2")
			
					
		

	    // Add something in the center
	    var cw = roseg.append("svg:g").attr("class", "rosecaption");
		var lefcoor = roseg.attr('transform').substr(10, 7).split(',');		
	    var tblk = cw.append("svg:text") 
					.attr("class", "textp")
	        		.attr("text-anchor", "middle") 
					.text("Reference group:");
					//tblk.append("tspan")
					//.attr('x',parseInt(lefcoor[0])+20).attr('dy','0em')
					//.text(bdname);
					//tblk.append("tspan")
					//.attr('x',parseInt(lefcoor[1])+20).attr('dy','2em')
					//.text('P:'+pval);

	    cw.append("svg:text")
	        .attr("transform", "translate(0, 20)")	        
	        .attr("text-anchor", "middle") 
	        .text(data.reflv);

	}



	function arcClick(d){       
    	d3.select("#modeleva").style("cursor","default");
    	var selectedLv = d["var"] + "_" + d.lv;
    	modelVarsManager.selected = selectedLv;
   		
   		if (modelVarsManager.selectedtoExistingTarget()) return;
   		if (d.lv == data.reflv) return; 
    
    	if(modelVarsManager.triggerSvgModel){
      		//pull up info from logistic_reg, and update table
      		var curVarNames = [], validNames= [];
      		d3.select("#modelsroot").selectAll(".factorName").each(function(d){
        		curVarNames.push(d["name"]);          
      		}); 

	      	curVarNames.push(selectedLv);      	
	      	      	

	      	//pull up logistic reg info
	      	//console.log("var to be sent to multimodel: "+curVarNames);
	      	var mainvarstr = curVarNames.join("-");
	      	var urlStr='/'+curBD.toLowerCase()+'/logisticreg0/'+ mainvarstr;
	      	$.ajax({
		        url: urlStr,
		        //data: "numbins=20",
		        type: 'GET',
		        dataType: 'json',
		        success : function(data) {
		          //console.log(data);             
		          updateModelGraph(data, "cateFactor", selectedLv, mainvarstr, 1);            
		        }
	      	});             
    	}
  	}

	
	/**
	* Aggregate the number of cases, calculate the row/column marginal frequencies, 
	* and count min/max odds ratios
	* @param {array},  [{"lv":"1", "case": 125, "ctrl": 2365, "or": 1.24, "orlb": 1.1, "orub": 1.6}, {}, ...,{"lv": 0, ...}],
	*					this is an original data read from web service/local file
	* @return {associative array}, {"minOR", 0.2, "maxOR": 3.9, "dat": [{"lv":"1", "case": 125, "ctrl": 2365, "or": 1.24, "orlb": 1.1, "orub": 1.6, "colMarFreq": 0.24, "rowMarFreq": 0.78}, {}, ...]}
	*								, and no the reference group.
	*/
	function dataComputing(dd) {
		var minRowMF, maxRowMF, minColMF, maxColMF;

		var cases_total = 0, ctrls_total = 0, marginal_total = {};
		var minor = 1, maxor = 0;
		var res = {}, reflv = dd[0].lv;
	    for (var i = 0; i < dd.length; ++i) {
	    	var oneLv = dd[i];
			//count up all 
			cases_total += oneLv["case"];
			ctrls_total += oneLv["ctrl"];
			marginal_total[oneLv.lv] = oneLv["case"] + oneLv["ctrl"];					

			if (+oneLv["or"] < minor)
				minor = +oneLv["or"];
			if (+oneLv["or"] > maxor)
				maxor = +oneLv["or"];
			if (oneLv["lv"] < reflv)
				reflv = oneLv["lv"];
	    }

	    var tmp = [];
	    for (var i = 0; i < dd.length; ++i) {
	    	var oneLv = dd[i];
	    	//if(oneLv["lv"] != reflv) {
		    	oneLv["colMarFreq"] = oneLv["case"] / cases_total;
		    	oneLv["rowMarFreq"] = oneLv["case"] / marginal_total[oneLv["lv"]];
		    	tmp.push(oneLv);
	    	//}
	    }
	    tmp.sort(compareLV);

	    minRowMF = +tmp[0].rowMarFreq;
	    maxRowMF = +tmp[0].rowMarFreq;
	    minColMF = +tmp[0].colMarFreq;
	    maxColMF = +tmp[0].maxColMF;

	    for (var i = 0; i < tmp.length; ++i){
	    	var oned = tmp[i];
	    	if(+oned.rowMarFreq < minRowMF)
	    		minRowMF = +oned.rowMarFreq;
	    	if(+oned.rowMarFreq > maxRowMF)
	    		maxRowMF = +oned.rowMarFreq;
	    	if(+oned.colMarFreq < minColMF)
	    		minColMF = +oned.colMarFreq;
	    	if(+oned.colMarFreq > minColMF)
	    		maxColMF = +oned.colMarFreq;
	    }

	    res["minOR"] = minor;
	    res["maxOR"] = maxor;
	    res["minRowMF"] = minRowMF;
	    res["maxRowMF"] = maxRowMF;
	    res["minColMF"] = minColMF;
	    res["maxColMF"] = maxColMF;
	    res["marginalTotal"] = marginal_total;
	    res["casesTotal"] = cases_total;
	    res["controlsTotal"] = ctrls_total;
	    res["dat"] = tmp;
	    res["reflv"] = reflv;	    

	    data = res;
	}

	function compareLV(a,b) {
	  if (a.lv < b.lv)
	     return -1;
	  if (a.lv > b.lv)
	    return 1;
	  return 0;
	}

	
	function highlightRose(d,id){
		if (document.getElementById(id).nodeName=='line'){
			d3.select("#"+id).style("stroke-width",2);
			d3.select("#"+id).style("stroke","yellow");
			
			//text and path are also triggered hightlight event
			d3.select("#path"+id.substr(id.indexOf('_'))).style("stroke-width",2);
			d3.select("#path"+id.substr(id.indexOf('_'))).style("stroke","yellow");
			d3.select("#text"+id.substr(id.indexOf('_'))).style("stroke-width",2);
			d3.select("#text"+id.substr(id.indexOf('_'))).style("fill","yellow");
		}else if (document.getElementById(id).nodeName=='text'){
			d3.select("#"+id).style("stroke-width",2);
			d3.select("#"+id).style("fill",'yellow');

			d3.select("#path"+id.substr(id.indexOf('_'))).style("stroke-width",2);
			d3.select("#path"+id.substr(id.indexOf('_'))).style("stroke","yellow");
			d3.select("#line"+id.substr(id.indexOf('_'))).style("stroke-width",2);
			d3.select("#line"+id.substr(id.indexOf('_'))).style("stroke","yellow");
		}else{//path
			d3.select("#"+id).style("stroke-width",2);
			d3.select("#"+id).style("stroke","yellow");
			
			d3.select("#path"+id.substr(id.indexOf('_'))).style("stroke-width",2);
			d3.select("#path"+id.substr(id.indexOf('_'))).style("stroke","yellow");
			d3.select("#text"+id.substr(id.indexOf('_'))).style("stroke-width",2);
			d3.select("#text"+id.substr(id.indexOf('_'))).style("fill","yellow");
		}

		/*if (d.lv.trim().length === 0 ) {
			$("#cate_lv_null").tooltip({
     			content: function() {      
              		return $(this).attr("title");
          		},
      			track: true 
  			}); 
  			return;
		}

		$("#cate_lv_" + d.lv ).tooltip({
     		content: function() {      
              return $(this).attr("title");
          	},
      		track: true 
  		}); 
		*/
		//tooltip.style("visibility", "visible")
		//		.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px").html("Level: "+d.d +"</br>Proportion in cases: "+ (100*d.supp).toFixed(2) + "%, </br>OddsRatio: " + (d.or).toFixed(2) +", 95% C.I. ["+(d.cil).toFixed(4)+", "+(d.ciu).toFixed(4)+"]" )
	}

	function cancelHighlight(d,id){
		if (document.getElementById(id).nodeName=='line'){
			d3.select("#"+id).style("stroke-width",1);
			d3.select("#"+id).style("stroke","#aaa");
			
			//text and path are also triggered unhightlight event
			d3.select("#path"+id.substr(id.indexOf('_'))).style("stroke-width",1);
			d3.select("#path"+id.substr(id.indexOf('_'))).style("stroke",null);
			d3.select("#text"+id.substr(id.indexOf('_'))).style("stroke-width",1);
			d3.select("#text"+id.substr(id.indexOf('_'))).style("fill",null);
		}else if (document.getElementById(id).nodeName=='text'){
			d3.select("#"+id).style("stroke-width",1);
			d3.select("#"+id).style("fill",null);		
			
		
			d3.select("#path"+id.substr(id.indexOf('_'))).style("stroke-width",1);
			d3.select("#path"+id.substr(id.indexOf('_'))).style("stroke",null);
			d3.select("#line"+id.substr(id.indexOf('_'))).style("stroke-width",1);
			d3.select("#line"+id.substr(id.indexOf('_'))).style("stroke","#aaa");
		}else{//path
			d3.select("#"+id).style("stroke-width",1);
			d3.select("#"+id).style("stroke",null);
			
			d3.select("#text"+id.substr(id.indexOf('_'))).style("stroke-width",1);
			d3.select("#text"+id.substr(id.indexOf('_'))).style("fill",null);
			d3.select("#line"+id.substr(id.indexOf('_'))).style("stroke-width",1);
			d3.select("#line"+id.substr(id.indexOf('_'))).style("stroke","#aaa");
		}	
		//tooltip.style("visibility", "hidden");
		//$("#cate_lv_" + d.lv ).tooltip({disabled: true });
	}	

	// Expose Public API
  	return {
    draw: drawRose,
    setModelLvMgr: setModelVarsMgr
  	}

}



