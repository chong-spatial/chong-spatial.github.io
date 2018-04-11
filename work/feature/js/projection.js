// @author Chong Zhang, please contact me at chongzhang.nc@gmail.com if you have any questions.
// 
// dimension reduction is a computational shortcut to cluster data in a lower dimensional space
// and to avoid curse of dimensionality
//
// a data item (transaction) might contain positive and negative features together while presents positive/negative class label.
//
d3.projectionView = function() {

  var margin = {top: 40, right: 20, bottom: 60, left: 80},    
    outerWidth = 600,
    outerHeight = 600,
    labelHeight = 20,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

  var xFeatures = [], yFeatures = [];

  // store all rules being shown in the projection view
  var rules = [], features = [];

  var svg, pointRadius = 20;

  var data;

  var zoom;


  var clusterSizeScale = d3.scale.linear().range([pointRadius, 3 * pointRadius]);

  var xScale = d3.scale.linear().domain([0, 1]),
      xAxis = d3.svg.axis()
      .scale(xScale)     
      .outerTickSize(0)
      .orient('bottom');
  var yScale = d3.scale.linear().domain([0, 1]),
      yAxis = d3.svg.axis()
      .scale(yScale)
      .outerTickSize(0)
      .orient('left');


  

  var dispatch = d3.dispatch('nodeClick');
  dispatch.on('nodeClick.int', function(d){
    _checkChildren(d);
  });
  dispatch.on('nodeClick.ext');



  //question: 
  // 1. cluster chain
  // 2. add weight to similiarity calculation

  function exports(sel) {    
    sel.each(function(obsData) {
      
      //data = RandomSubset(obsData, 10000);
      data = obsData;

      xScale.range([0, width]).nice();
      //xAxis.scale(xScale);
      yScale.range([height - labelHeight, 0]).nice();
      //yAxis.scale(yScale)
      xAxis.innerTickSize(-height + labelHeight)
      yAxis.innerTickSize(-width)
    

      zoom = d3.behavior.zoom()
        .x(xScale)
        .y(yScale)
        .scaleExtent([1, 20])
        .on("zoom", zoomEvent);


      var rootSvg = sel.append("svg")
          .attr("width", outerWidth)
          .attr("height", outerHeight) 

      
      var titleG = rootSvg.append('g').attr("transform", "translate(" + margin.left + "," + 20 + ")");
      var titleText = titleG
        .append('text')
        .attr('class', 'title')
        .text('Projection of Clusters for Feature Extraction...')

      titleG.insert('rect', 'text')//outline rectangle
        .attr("height", 16)
        .attr("width", titleText.node().getComputedTextLength())        
        .attr('y', -14)
        .style('fill', '#686868')
      

      svg = rootSvg
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


      svg.append("rect")
          .attr("class", "background")
           .attr("id", "clip")
          .attr("width", width + labelHeight )
          .attr("height", height - labelHeight);

      svg.call(zoom);



      function zoomEvent() { 
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);

        redraw();        

      }
      

      // x-axis
      var xAxisGroup = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (height - labelHeight) + ")")
          .call(xAxis)
      
      var xAxisLabelGroup = xAxisGroup.append("g")
        .attr('transform', 'translate(' + (width + labelHeight) + ','+ (margin.bottom - labelHeight) + ')');
      var xAxisLabel = xAxisLabelGroup.append('text')
          .attr("class", "label")     
          .style("text-anchor", "end")
          .style('fill', 'white')
          .text("Survivor Features");

      xAxisLabelGroup.insert('rect', 'text')//outline rectangle
        .attr("height", 16)
        .attr("width", xAxisLabel.node().getComputedTextLength())
        .attr('x', -xAxisLabel.node().getComputedTextLength())
        .attr('y', -14)
        .style('fill', c('Yes'))

      // features selected list on X axis
      xAxisGroup.append("text")
          .attr("class", "xLabel")
          .attr("x", width + labelHeight)
          .attr("y", margin.bottom)
          //.attr("dy", "1em")
          .style("text-anchor", "end")
          .style('fill', c('Yes'))          
          .text(xFeatures.map(function(f) { return f.feature + '(' + f.weight + ')'}));

      // y-axis
      var yAxisGroup = svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)

      
      var yAxisLabelGroup = yAxisGroup.append("g")
        .attr('transform', 'translate(' + -margin.left/2 + ',0)rotate(-90)');

      var yAxisLabel = yAxisLabelGroup.append("text")
          .attr("class", "label")          
          .attr("y", -2)    
          .style("text-anchor", "end")
          .style('fill', 'white')
          .text("Death Features");
      yAxisLabelGroup.insert('rect', 'text')//outline rectangle
        .attr("height", 16)
        .attr("width", yAxisLabel.node().getComputedTextLength())
        .attr('x', -yAxisLabel.node().getComputedTextLength())
        .attr('y', -14)
        .style('fill', c('No')) 
      
      // features selected list on Y axis        
      yAxisGroup.append("text")
          .attr("class", "yLabel")
          .attr("transform", "rotate(-90)")
          //+20 is because the thickness of the text
          .attr("y", -margin.left+20)
          //.attr("dy", "-1em")
          .style("text-anchor", "end")
          .style('fill', c('No'))          
          .text(yFeatures.map(function(f) { return f.feature + '(' + f.weight + ')'}));


      // draw donuts
      redraw(); 
         
    })
  }



  function redraw() {
    var xBounds = zoom.x().domain(),
        yBounds = zoom.y().domain();

    
    var dataInBounds = data.filter(function(d){
      return xBounds[0] <= d.x && d.x <= xBounds[1] && 
            yBounds[0] <= d.y && d.y <= yBounds[1];
    })
    

    var scaledData = dataInBounds.map(function (d) {
      return {
        index: d.idx,
        x: xScale(d.x),
        y: yScale(d.y),
        radius: pointRadius,
        point: Object.assign({}, d) // copy with ES6
      };
    }) 

    var clustersInView = clustering(scaledData);
 

    var clusterSizeExt = d3.extent(clustersInView, function(d){ return d.size; })
    clusterSizeScale.domain(clusterSizeExt);

    //var zoomedRadius = pointRadius * zoom.scale();
    //clusterSizeScale.range([zoomedRadius, 2 * zoomedRadius]);


    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.number; });
  

    var clusterSvg = svg.selectAll('.cluster').data(clustersInView, function(d){ return d.index + d.size });

    // update
    clusterSvg.attr("transform", function(d){ return "translate(" + d.cx + "," + d.cy + ")"});

    // remove
    clusterSvg.exit().remove();

    // enter
    var clusterG = clusterSvg.enter().append('g')
      .attr('class', 'cluster')
      .attr("transform", function(d){ return "translate(" + d.cx + "," + d.cy + ")"});

    var arcG = clusterG.append('g')
      .each(function(d){ 

        var piedata = [{number: d.cls1Size, totalnumber: d.size, text: 'Death', color: c('No')}, {number: d.cls2Size, totalnumber: d.size, text: 'Survival', color: c('Yes')}]; 
        piedata = piedata.filter(function(p){ return p.number != 0 });
        d.piedata = piedata; 
      })

    var arcs = arcG.selectAll('.arc')
      //.data(function(d){ var piedata = [{number: d.cls1Size, totalnumber: d.size, text: 'Death', color: c('cls1')}, {number: d.cls2Size, totalnumber: d.size, text: 'Survival', color: c('cls2')}]; return pie(piedata); })
      .data(function(d){ return pie(d.piedata); })
      .enter().append('g')
      .attr('class', 'arc')

    arcs.append('path')
      .attr('d', function(d){ 
        var arcF = d3.svg.arc()
          .innerRadius(1)
          //.innerRadius(clusterSizeScale(d.data.totalnumber)/4 * 0.6)
          .outerRadius(clusterSizeScale(d.data.totalnumber) * 0.6);


        return arcF(d);
      })
      .attr("id", function(d, i) { return "arc-" + i })
      .style('fill', function(d) { return d.data.color; })

  
  
    /* ------- Labeling -------*/
    var text = arcG.selectAll(".labels")
      .data(function(d){ return pie(d.piedata); })
      .enter()
      .append("text")
      .attr('class', 'labels')
      .attr("dy", ".35em")
      .text(function(d) {
        return d.data.number;
      })
   
  
    function midAngle(d){
      return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text
      .attr("transform", function(d) {    
        var outerArcF = d3.svg.arc()
          .innerRadius(clusterSizeScale(d.data.totalnumber) * 0.6)
          .outerRadius(clusterSizeScale(d.data.totalnumber) * 1);
        
          var pos = outerArcF.centroid(d);
          pos[0] = clusterSizeScale(d.data.totalnumber) * 0.6 * (midAngle(d) < Math.PI ? 1 : -1);
          return "translate("+ pos +")";
   
      })
      .attr('text-anchor', function(d){ return midAngle(d) < Math.PI ? 'start' : 'end'})
    

    /* ------- Label polyline -------*/
    var polyline = arcG.selectAll(".lines")
      .data(function(d){ return pie(d.piedata) })
      .enter()
      .append("polyline")
      .attr('class', 'lines')
   

    polyline
      .attr("points", function(d){      
        var innerArcF = d3.svg.arc()
          .innerRadius(1)
          //.innerRadius(clusterSizeScale(d.data.totalnumber)/2 * 0.6)
          .outerRadius(clusterSizeScale(d.data.totalnumber) * 0.6);
        var outerArcF = d3.svg.arc()
          .innerRadius(clusterSizeScale(d.data.totalnumber) * 0.6)
          .outerRadius(clusterSizeScale(d.data.totalnumber) * 1);

        
        var pos = outerArcF.centroid(d);
        pos[0] = clusterSizeScale(d.data.totalnumber) * 0.6 * (midAngle(d) < Math.PI ? 1 : -1);
        return [innerArcF.centroid(d), outerArcF.centroid(d), pos];
       
      });

  }



  // update clusteredData
  function clustering(da) {
    var clusters = [];

    var inPreviousClusters = [];
    var targetPoints = da;
    for(var i = 0; i < da.length; i++) {
      var p = da[i];
      if(!~inPreviousClusters.indexOf(p.index)){
        p.overlap = [];
        clusters.push(p);
        for(var j = 0; j < targetPoints.length; j++) {
          var t = targetPoints[j];
          if (t.index !== p.index) {
              var distance = Math.sqrt((t.x - p.x) * (t.x - p.x) + (t.y - p.y) * (t.y - p.y));
              if (distance < 100) { //distance < p.radius + t.radius
                t.clustered = true;
                p.overlap.push(t);  
                inPreviousClusters.push(t.index);
              }
          }
        }
        targetPoints = targetPoints.filter(function (d) {
          return p.overlap.indexOf(d) == -1;
        })
      }
      
    }

    //find cluster chain
    //TODO
    /*
    for(var i = 0; i < clusters.length; i++) {
      var ci = clusters[i];
      var overlaps = ci.overlap.map(function(d){ return d.index })
      for(var j = i + 1; j < clusters.length; j++){
        var cj = clusters[j];
        if(!cj.clusterChained && overlaps.indexOf(cj.index) != -1) {
          cj.clusterChained = true;
          ci.overlap = ci.overlap.concat(cj.overlap);
        }

      }
    }

    return clusters.filter(function(d){ return !d.clusterChained});
    */


    var cls1sum = 0, cls2sum = 0;
    clusters.forEach(function(d){ 
      d.size = d.overlap.length + 1; 
      d.cls1Size = d.overlap.filter(function(p){ return p.point.lab == 'No' }).length;
      d.cls2Size = d.size - d.cls1Size;
      d.cx = d.overlap.map(function(c){ return c.x }).reduce(function(a, b) { return a + b; }, 0)/d.size + d.x/d.size;
      d.cy = d.overlap.map(function(c){ return c.y }).reduce(function(a, b) { return a + b; }, 0)/d.size + d.y/d.size;

    });

    return clusters;

  }



  exports.update = function() { 
    // Only Jaccard is used at this time
    // change to another, like add weight, or ?
    data.forEach(function(o){
      var jaccardSimX = jaccard(o.item, xFeatures.map(function(f){ return f.feature})),
          jaccardSimY = jaccard(o.item, yFeatures.map(function(f){ return f.feature})); 

      o.y = jaccardSimY; 
      o.x = jaccardSimX;        
      
    })  
      redraw();

      svg.select(".xLabel")            
          .text(xFeatures.map(function(f) { return f.feature + '(' + f.weight + ')'}));

      svg.select(".yLabel")            
          .text(yFeatures.map(function(f) { return f.feature + '(' + f.weight + ')'}));
  };  

 

  exports.width = function(_) {
    if(!arguments.length){
      return outerWidth;
    }
    outerWidth = _;
    width = outerWidth - margin.left - margin.right;
    
    return this;
  }

  exports.height = function(_) {
    if(!arguments.length){
      return outerHeight;
    }
    outerHeight = _;
    height = outerHeight - margin.top - margin.bottom;
    return this;

  }

  // [{feature: String, weight: Number}]
  exports.xFeatures = function() {
    if(!arguments.length){
      return xFeatures;
    }

  }

  exports.xFeatures.add = function(f){
    for(var i = 0; i < xFeatures.length; i++){
      if(f == xFeatures[i].feature){
        xFeatures[i].weight ++;
        return this;
      }
    }

    xFeatures.push({feature: f, weight: 1});
    return this;
  }

  exports.xFeatures.remove = function(f){
    for(var i = 0; i < xFeatures.length; i++){
      if(f == xFeatures[i].feature){
        xFeatures[i].weight --;
        break;
      }
    }

    var removeIdx = -1;
    for(var i = 0; i < xFeatures.length; i++){
      if(f == xFeatures[i].feature && xFeatures[i].weight == 0){
        removeIdx = i;
      }
    }
    xFeatures.splice(removeIdx, 1);

    return this;
  }


  exports.yFeatures = function() {
    if(!arguments.length){
      return yFeatures;
    }

  }

  exports.yFeatures.add = function(f){
    for(var i = 0; i < yFeatures.length; i++){
      if(f == yFeatures[i].feature){
        yFeatures[i].weight ++;
        return this;
      }
    }

    yFeatures.push({feature: f, weight: 1});
    return this;
  }

  exports.yFeatures.remove = function(f){
    for(var i = 0; i < yFeatures.length; i++){
      if(f == yFeatures[i].feature){
        yFeatures[i].weight --;
        break;
      }
    }

    var removeIdx = -1;
    for(var i = 0; i < yFeatures.length; i++){
      if(f == yFeatures[i].feature && yFeatures[i].weight == 0){
        removeIdx = i;
      }
    }
    yFeatures.splice(removeIdx, 1);

    return this;
  }

  exports.rules = function() {
    if(!arguments.length){
      return rules;
    }
  }

  exports.rules.add = function(r) {
    rules.push(r)
  }

  exports.rules.remove = function(r){
    var idx = rules.indexOf(r);
    rules.splice(idx, 1);
  }

    exports.features = function() {
    if(!arguments.length){
      return features;
    }
  }

  exports.features.add = function(r) {
    features.push(r)
  }

  exports.features.remove = function(r){
    var idx = features.indexOf(r);
    features.splice(idx, 1);
  }



  return d3.rebind(exports, dispatch, 'on');

}
