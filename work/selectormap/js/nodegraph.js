// @author Chong Zhang.
// Please contact me at chongzhang.nc@gmail.com if you have any questions


// nodeData is geojson array
// interestedAttractions, interestedAttrGraphDiv, attrDescDiv
function nodegraph(nodeData, containerSelector, descContainerSel){
  var distinctThemes = d3.map(nodeData, function(d){ return d.properties.THEME}).keys();
  nodeColor =  d3.scale.ordinal()
    .domain(distinctThemes)
    //.range(['#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'])
    .range(['#2ca02c', '#9467bd', '#f7b6d2', '#e377c2', '#7f7f7f', '#9edae5', '#17becf', '#e7ba52', '#6baed6', '#c49c94'])

  // desc div
  d3.select(descContainerSel).selectAll('span')
    .data(distinctThemes)
    .enter().append('span')
    .style('background-color', function(d){ return nodeColor(d); })
    .text(function(d){ return d})



  var padding = 20;
  var width = $(containerSelector).width() - 20,
      height = $(containerSelector).height() -20;

  var xbbox = d3.extent(nodeData, function(d) { return d.geometry.coordinates[0]; }),
      ybbox = d3.extent(nodeData, function(d){ return d.geometry.coordinates[1]}).reverse();

  var xScale = d3.scale.linear()
    .domain(xbbox)
    .range([padding/2, width - padding/2]);

  var yScale = d3.scale.linear()
    .domain(ybbox)
    .range([padding/2, height - padding/2]);

  // only used for the actural position in the firs run
  var xGeoScale = d3.scale.linear()
    .domain(xbbox)
    .range([padding/2, width - padding/2]);

  var yGeoScale = d3.scale.linear()
    .domain(ybbox)
    .range([padding/2, height - padding/2]);

  nodeData.forEach(function(d){
    d.x = xScale(d.geometry.coordinates[0]);
    d.y = yScale(d.geometry.coordinates[1]);
    d.r = 20;
  })

  nodeData.forEach(collide(0.5));

  // update domains so that semanticZoom works prefectly
  xScale.domain(d3.extent(nodeData, function(d){ return d.x }));
  yScale.domain(d3.extent(nodeData, function(d){ return d.y }));

  // geometric zooming, not use at this time
  var zoom = d3.behavior.zoom()
      .scaleExtent([1, 10])
      .on("zoom", zoomed);

  function zoomed() {
      container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

  var zoomLevel = 1;

  // semantic zooming
  var semanticZoom = d3.behavior.zoom()
    .x(xScale)
    .y(yScale)
    .scaleExtent([1, 10])
    .on("zoom", semanticZoomed);

  function semanticZoomed(){
    // for furture sychronize zooming of map, the commented methods could be used
    // semanticZoom.scale()
    // semanticZoom.center()
    // map.setZoom()

    nodes.attr('transform', function(d){ return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; })

    var nodeInViewport = nodeData.filter(function(d){
      if(d.x >= semanticZoom.x().domain()[0] && d.x <= semanticZoom.x().domain()[1] &&
          d.y >= semanticZoom.y().domain()[0] && d.y <= semanticZoom.y().domain()[1]) {
            return d;
      }
    })
    var xbbox = d3.extent(nodeInViewport, function(d){ return d.geometry.coordinates[0] }),
        ybbox = d3.extent(nodeInViewport, function(d){ return d.geometry.coordinates[1] });

    // only zoom map when nodegraph is zooming, not vice versus, but we can do it
    // I didn't do it now because the nodegraph only consists of node, it does not have many elements right now.

    //if(semanticZoom.scale() < zoomLevel){
      map.setExtent(new esri.geometry.Extent({xmin:xbbox[0],ymin:ybbox[0],xmax:xbbox[1],ymax:ybbox[1],spatialReference:{wkid:4326}}), true)
      //map.centerAndZoom([(xbbox[0] + xbbox[1])/2, (ybbox[0] + ybbox[1])/2], map.getZoom()-1 );
    //} else {
      //map.centerAndZoom([(xbbox[0] + xbbox[1])/2, (ybbox[0] + ybbox[1])/2], map.getZoom()+1 );
    //}

    zoomLevel = semanticZoom.scale();
  }

  function getZoomLevel(){
    return zoomLevel;
  }

  function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodeData);
    return function(d) {
      var r = d.r + 40
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = d.r + quad.point.r + 10;
          if (l < r) {
            l = (l - r) / l * alpha; //alpha
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }

  function redraw(){
    width = $(containerSelector).width() - 20;
    height = $(containerSelector).height() -20;

    svg.attr("width", width + padding)
      .attr("height", height + padding )
    bgrect.attr("width", width + padding)
        .attr("height", height + padding)

    xScale = d3.scale.linear()
      .domain(xbbox)
      .range([padding/2, width - padding/2]);

    yScale = d3.scale.linear()
      .domain(ybbox)
      .range([padding/2, height - padding/2]);

    nodeData.forEach(function(d){
      d.x = xScale(d.geometry.coordinates[0]);
      d.y = yScale(d.geometry.coordinates[1]);
      d.r = 20;
    })

    nodeData.forEach(collide(0.5));

    // update domains so that semanticZoom works prefectly
    xScale.domain(d3.extent(nodeData, function(d){ return d.x }));
    yScale.domain(d3.extent(nodeData, function(d){ return d.y }));

    nodes.transition()
        .duration(500)
        .ease('linear').attrTween('transform', function(d){
          return d3.interpolateTransform(
            "translate(" + xGeoScale(d.geometry.coordinates[0]) + "," + yGeoScale(d.geometry.coordinates[1]) + ")",
            "translate(" + d.x + "," + d.y + ")"
          )
        })

  }

  var svg = d3.select(containerSelector).append('svg')
    .attr("width", width + padding)
    .attr("height", height + padding )
    //.call(zoom)
    .call(semanticZoom)

  var bgrect = svg.append("rect")
      .attr("width", width + padding)
      .attr("height", height + padding)
      .style("fill", "none")
      .style("pointer-events", "all");

  var container = svg.append("g");

  var nodes = container.selectAll('.node')
    .data(nodeData)
    .enter().append('g')
    .attr('class', 'node')
    .attr("id", function(d) { return 'node_' + d.properties.myAttrId })
    //.on("click", nodeClick)
    .call(d3.helper.nodetip())

  // basically, the actural geo location only appear once
  nodes.transition()
      .duration(2000)
      .ease('linear').attrTween('transform', function(d){
        return d3.interpolateTransform(
          "translate(" + xGeoScale(d.geometry.coordinates[0]) + "," + yGeoScale(d.geometry.coordinates[1]) + ")",
          "translate(" + d.x + "," + d.y + ")"
        )
      })


  var outlineNode = nodes
      .append("circle")
      .attr('cx', 20) // rect'width divides 2
      .attr('cy', 15)
      .attr("class", "nodebg")
      .attr("id", function(d) { return 'nodeline_' + d.properties.myAttrId })
      .attr("r", 25) // may come from passed options

  var nodeRects = nodes.append('rect')
    .attr("class", "nodeoutline")
    .attr('x', 0)
    .attr('y', 0)
    .attr("ry", 2)
    .attr("rx", 2)
    .attr('width', 40)
    .attr('height', 30)
    .style('fill', function(d){ return nodeColor(d.properties.THEME)})


  var nodeLabel = nodes
    .append("text")
    .text(function(d) { return d.properties.myAttrId })
    .attr("dy", "1.2em")
    .attr("dx", "0.4em")
    .attr('text-anchor', 'start')
    .attr("font-size", 18) // may come from passed options
    .attr("fill", "#fff")


    d3.selectAll('.attraction').call(d3.helper.attractiontip())

    return {
      xScale: xScale,
      yScale: yScale,
      xGeoScale: xGeoScale,
      yGeoScale: yGeoScale,
      nodeGroup: nodes,
      reDraw: redraw,
      zoomLevel: getZoomLevel
    }

}
