var lineHeight = 21;
(function(mds) {
    "use strict";
    // given a matrix of distances between some points, returns the
    // point coordinates that best approximate the distances using
    // classic multidimensional scaling
    var imgW=50, imgH=50;
    mds.classic = function(distances, dimensions) {        
        dimensions = dimensions || 2;

        // square distances
        var M = numeric.mul(-0.5, numeric.pow(distances, 2));

        // double centre the rows/columns
        function mean(A) { return numeric.div(numeric.add.apply(null, A), A.length); }
        var rowMeans = mean(M),
            colMeans = mean(numeric.transpose(M)),
            totalMean = mean(rowMeans);

        for (var i = 0; i < M.length; ++i) {
            for (var j =0; j < M[0].length; ++j) {
                M[i][j] += totalMean - rowMeans[i] - colMeans[j];
            }
        }

        // take the SVD of the double centred matrix, and return the
        // points from it
        var ret = numeric.svd(M),
            eigenValues = numeric.sqrt(ret.S);
        return ret.U.map(function(row) {
            return numeric.mul(row, eigenValues).splice(0, dimensions);
        });
    };


 
    /// draws a scatter plot of points, useful for displaying the output
    /// from mds.classic etc
    mds.drawD3ScatterPlot = function(elementID, xPos, yPos, labels, params) {
        
        params = params || {};
        var padding = 6,
            w = 800,
            h = 500,
            xDomain = [Math.min.apply(null, xPos),
                       Math.max.apply(null, xPos)],
            yDomain = [Math.max.apply(null, yPos),
                       Math.min.apply(null, yPos)],
            pointRadius = params.pointRadius || 5;

        if (params.reverseX) {
            xDomain.reverse();
        }
        if (params.reverseY) {
            yDomain.reverse();
        }

        
        var xScale = d3.scale.linear().
                domain(xDomain)
                .range([padding, w - padding-imgW]),

            yScale = d3.scale.linear().
                domain(yDomain)
                .range([padding+9, h-padding-imgH]), //+9 means give text(label) lineheight

        //    xAxis = d3.svg.axis()
        //        .scale(xScale)
        //        .orient("bottom")
        //        .ticks(params.xTicks || 7),

        //    yAxis = d3.svg.axis()
        //        .scale(yScale)
        //        .orient("left")
        //        .ticks(params.yTicks || 7);
            svg=d3.select("#"+elementID).select("svg")
                .attr("width", w)
                .attr("height", h);

        svg.selectAll('g').remove();
        //var oriX=0, oriY=0;
        var drag = d3.behavior.drag()
           // .on("dragstart",function(d,i){
            //    oriX=d3.select(this).attr("transX");
             //   oriY=d3.select(this).attr("transY");
            //})
            .on("drag", function(d,i) {
                var isMove=$("#mdsBarRadio input[name='radiomds']:checked").val()=="move";                
                if(!isMove) return; 
                 //console.log("mds is moving");
                 d3.selectAll("#mdsgDiv .clicked").classed("clicked", false);
                 d3.selectAll("#mdsgDiv .clicked").classed("actived", false);
                var oriX=parseFloat(d3.select(this).attr("transX")),
                    oriY=parseFloat(d3.select(this).attr("transY"));                
                oriX += d3.event.dx;
                oriY += d3.event.dy;
                d3.select(this).attr("transform", function(d,i){
                    return "translate(" + oriX+","+oriY + ")"
                })
                d3.select(this).attr("transX",oriX);
                d3.select(this).attr("transY",oriY);   
            });
           // .on("dragend",function(d,i){
            //    d3.selectAll("#mdsgDiv .clicked").classed("actived", false);
           //     console.log("dragend");
            //});
        d3.select("#mdsgDiv").select("svg").append("clip-path").attr("id","g-clip-cell_mds").append("rect").attr("width",w).attr("height",lineHeight);

        var g = svg.selectAll("g")
                    .data(labels)
                    .enter()
                    .append("g").attr("class","mdsg")
                    .attr("transX",function(d,i){return xScale(xPos[i]);})
                    .attr("transY",function(d,i){return yScale(yPos[i]);})
                    .attr("transform", function(d,i){return "translate(" + d3.select(this).attr("transX") + "," + d3.select(this).attr("transY") + ")"})
                    .call(drag);
            g.append("rect");
            g.append("image");    
            g.append("text")
               .attr("text-anchor", "start")
               .text(function(d) { return d; })
               //.attr("clip-path", function(d) { return (d.clipped = this.getComputedTextLength() > w-5) ? "url(#g-clip-cell_mds)" : null; });;
               //.attr("x", function(d, i) { return xScale(xPos[i])+imgW/2; })
               //.attr("y", function(d, i) { return yScale(yPos[i]) ; });//-imgH;    
                           
                  
        //svg.append("g")
        //    .attr("class", "axis")
        //    .attr("transform", "translate(0," + (h - padding + 2*pointRadius) + ")")
        //    .call(xAxis);

        //svg.append("g")
        //    .attr("class", "axis")
        //    .attr("transform", "translate(" + (padding - 2*pointRadius) + ",0)")
        //    .call(yAxis);
         mds.sorting(g,xPos, yPos,labels,xScale,yScale,labels[0]);       
        
        
    };

    mds.sorting=function(g,xPos, yPos,labels,xScale,yScale,orderby){
		g.select("rect")                                
		
		//.style("fill","none")
		.attr("width",imgW+1)
		.attr("height",imgH+1)                    
		//.attr("x", function(d) { return xScale(xPos[labels.indexOf(d)]); })
		//.attr("y", function(d, i) { return yScale(yPos[labels.indexOf(d)]); })
		.attr("id",function(d){return "rect_"+d})
		.attr("varname",function(d){return d});
		//.style("stroke","#F3BE16")
		//.style("stroke-width",1); 

	g.select("image")              
		//.attr("xlink:href", function(d){return "http://"+window.location.host+"/assets/glyphs/"+curBD.toLowerCase()+"/"+d+"/by_"+orderby+".png"; })
		.attr("xlink:href", function(d){return "bd100/"+d+"/by_"+orderby+".png"; })
		.attr("width", imgW)
		.attr("height", imgH)
		//.attr("x", function(d) { return xScale(xPos[labels.indexOf(d)]); })
		//.attr("y", function(d) { return yScale(yPos[labels.indexOf(d)]); }) 
		.attr("id",function(d){return d}) 
					  
		.on("mouseover",function(){                  
			d3.select("#mdsgDiv").select("#rect_"+this.id).classed("actived",true); 
			//d3.select("#mdsg").select("#rect_"+this.id).classed("clicked",true);                           
		})
		.on("mouseout",function(){
		   d3.select("#mdsgDiv").select("#rect_"+this.id).classed("actived",false); 
		})
		.on("click",function(d){  
			d3.select("#rect_"+this.id).classed("highlighted",false);                       
			var e = d3.event,                              
				isSelected = d3.select("#mdsgDiv").select("#rect_"+this.id).classed("clicked"),
				//isSort=$("#mdsBarRadio #radio_sort").is(':checked');                                 
			   isSort=$("#mdsBarRadio input[name='radiomds']:checked").val()=="sort",
			   isSel=$("#mdsBarRadio input[name='radiomds']:checked").val()=="select",
			   isMove=$("#mdsBarRadio input[name='radiomds']:checked").val()=="move";

				//console.log("mds is selecting");

			
				

			//if( !e.ctrlKey || isSort) {
			//    d3.selectAll("#mdsgDiv .clicked").classed("clicked", false);
			//}        
			d3.select("#mdsgDiv").select("#rect_"+this.id).classed("clicked", !isSelected);
			//d3.select("#mdsInfo").append("label").text(this.id);
			if(isSort) {
				mds.sorting(g,xPos, yPos,labels,xScale,yScale,this.id);
				d3.selectAll("#mdsgDiv .clicked").classed("clicked", false);
			}
			if(isMove){
			   d3.selectAll("#mdsgDiv .clicked").classed("actived", false);
			   d3.selectAll("#mdsgDiv .clicked").classed("clicked", false);
			}
		});                   

        
        }
}(window.mds = window.mds || {}));

function drawMDS(varNames){
  var dis = [
[.000,.780,.771,.445,.932,.755,.802,.9,.653,.687],
[.780,.000,.871,.557,.788,.730,.711,.611,.738,.476],
[.771,.871,.000,.764,.690,.937,.588,.705,.766,.929],
[.445,.557,.764,.000,.658,.554,.732,.423,.549,.517],
[.932,.788,.690,.658,.000,.921,.615,.876,.905,.840],
[.755,.730,.937,.554,.921,.000,.967,.762,.843,.582],
[.802,.711,.588,.732,.615,.967,.000,.722,.726,.849],
[.9,.611,.705,.423,.876,.762,.722,.000,.351,.533],
[.653,.738,.766,.549,.905,.843,.726,.351,.000,.750],
[.687,.476,.929,.517,.840,.582,.849,.533,.750,.000]
]
        
          
          var positions = mds.classic(dis,2);
          var xpos=[],ypos=[];
          for (var i = 0; i < varNames.length; ++i) {
            xpos.push(positions[i][0]);
            ypos.push(positions[i][1]);
          }
          mds.drawD3ScatterPlot("mdsgDiv", xpos,ypos,varNames);


}