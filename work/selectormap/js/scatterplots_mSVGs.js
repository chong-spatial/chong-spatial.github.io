function hotelScatterPlots(containerSelector, clickedAttrID){

  var width = $(containerSelector).width() -30,
      height = $(containerSelector).height() -30,
      size = Math.min(width, height), //244
      padding = 20;

  var xScale = d3.scale.linear()
    .range([padding/2, size - padding/2]);

  var yScale = d3.scale.linear()
    .range([padding/2, size - padding/2]);
/*
  // a little problem, which one catch the zoom?
  var semanticZoom = d3.behavior.zoom()
    .x(xScale)
    .y(yScale)
    .scaleExtent([1, 10])
    .on("zoom", semanticZoomed);

  function semanticZoomed(){
    circles.attr("cx", function(d) { return xScale(d.geof.geometry.coordinates[0]); })
      .attr("cy", function(d) { return yScale(d.geof.geometry.coordinates[1]); })
  }
*/
  var brush = d3.svg.brush()
      .x(xScale)
      .y(yScale)
      //.on("brushstart", brushstart)
      //.on("brush", brushmove)
      //.on("brushend", brushend);




  var root = d3.select(containerSelector).append("svg")
      .attr("width", size + padding)
      .attr("height", size + padding )
//      .call(semanticZoom)


  var svg = root.append("g").attr("transform", "translate(" + padding + "," + padding + ")");

  svg.append("rect")
      .attr("class", "frame")
      .attr("x", 0) //padding / 2
      .attr("y", 0) // padding / 2
      .attr("width", size + padding) //- padding
      .attr("height", size + padding); //- padding

  svg.append('rect')
    .attr("class", "nodeoutline")
    .attr('x', size/2 -15)
    //.attr('y', -18)
    .attr("ry", 2)
    .attr("rx", 2)
    .attr('width', 30)
    .attr('height', 20)
    .style('fill', function(d){
      var clickedFeture = attraction_layer.geoFeatures.features.filter(function(d){ return d.properties.myAttrId == clickedAttrID})[0];
      return nodeColor(clickedFeture.properties.THEME)
    })

  svg.append('text')
    .attr("class", "celllb")
    .attr("x", size/2)
    .attr('y', 18)
    .attr('text-anchor', 'middle')
    .text(clickedAttrID);

  var cell = svg.selectAll('#cell_f' + clickedAttrID)
      .data([pointsInServiceAreas['hotel']['f'+clickedAttrID]])
      .enter().append('g')
      .attr('id', 'cell_f' + clickedAttrID)
      .attr('class', 'cell')

      .each(plot);

  //cell.call(brush);

  function plot(p) {
    var cell = d3.select(this);



    var hotelIDsInMaxTlv = p[d3.max(d3.keys(p))];
    // hotels in max time level should contail ones in lower time levels
    var hotelsInMaxTlv = [];
    for(var i = 0; i < hotelIDsInMaxTlv.length; i++){
      hotelsInMaxTlv.push(hotel_layer.geoFeatures.features.filter(function(d){ return d.properties.myHotelId == hotelIDsInMaxTlv[i]})[0]);
    }

    // local scacle, ie, the scale is only based on the hotels in the 3 timelevel, without considering other hotels on the map
    var xbbox = d3.extent(hotelsInMaxTlv, function(d) { return d.geometry.coordinates[0]; }),
        ybbox = d3.extent(hotelsInMaxTlv, function(d){ return d.geometry.coordinates[1]}).reverse();
    xScale.domain(xbbox);

    yScale.domain(ybbox);

    //semanticZoom.x(xScale).y(yScale);


    circles = cell.selectAll("circle")
        .data(function(){
          var res = [];
          var hotelIDAsKey = {};
          var minuteLevelsObj = p;
          for( var tlv in minuteLevelsObj){
            var tAry = minuteLevelsObj[tlv];
            for(var i = 0; i < tAry.length; i++){
              if(hotelIDAsKey.hasOwnProperty(tAry[i])){
                hotelIDAsKey[tAry[i]].push(tlv);
              } else {
                hotelIDAsKey[tAry[i]] = [tlv];
              }
            }
          }

          for(var hotelID in hotelIDAsKey){
            var geoF = hotel_layer.geoFeatures.features.filter(function(d){ return d.properties.myHotelId == hotelID })[0];
            res.push({'myHotelId': hotelID, 'geof': geoF, 'tlv': hotelIDAsKey[hotelID]})
          }

          return res;
        })
        .enter().append("circle")
        .attr("cx", function(d) { return xScale(d.geof.geometry.coordinates[0]); })
        .attr("cy", function(d) { return yScale(d.geof.geometry.coordinates[1]); })
        .attr("r", 5)
        .attr("class", function(d){
          return d3.min(d.tlv); // eg. 1:[t1, t2, t3], we will pick t1 as the class name
        });
  }


}
