 var lineChart;

 

 function coerceLineData(prop) {
    var color = d3.scale.category20();

    var dataSeries = nodeid.map(function(d) { return d3.select('#node_'+d).datum() }),
        //colors = nodeid.map(function(d) { return d3.select('#node_'+d).style('fill') });
        colors = nodeid.map(function(d,i) {return color(i)})
    
    // deal with value -1 particular for travelTime
    if (prop === 'travelTime') { 
        var data = dataSeries.map(function(d, i) {
            var tra = d.rank[prop],
                travelTimeMax = d3.max(tra);
            var newd = tra.map(function(d) { if (d == -1) return travelTimeMax; return d;})
            return {
              key: 'ID' + d.id
            , values: d3.zip(d3.range(d.rank[prop].length), newd )
            , color: colors[i]
            };
          });
        return data;
    } else {

        var data = dataSeries.map(function(d, i) {
            return {
              key: 'ID' + d.id
            , values: d3.zip(d3.range(d.rank[prop].length), d.rank[prop] )
            , color: colors[i]
            };
        });

        return data;
    }

 }

 function drawLine (prop) {    

    if(lineChart) {
        var _data = coerceLineData(prop);
        d3.select('#multiline')
        .datum(_data)
        .call(lineChart);

        lineChart.yAxis
        .axisLabel(prop)

        lineChart.update();

        return;
    }

    var _data = coerceLineData(prop);   

    

    var width = $(".buttomLeft").width(),
        height = $(".buttomLeft").height() -20; // minus buttonset height

    d3.select("#multiline")
        .attr("width", width)
        .attr("height", height)

    

    nv.addGraph(function() {
    lineChart = nv.models.lineChart()
                    .height(height)
                  .x(function(d) { return d[0] })
                  .y(function(d) { return d[1] }) 
                  .useInteractiveGuideline(true)
                  .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                .showYAxis(true)        //Show the y-axis
                .showXAxis(true)        //Show the x-axis
                  ;

    lineChart.xAxis
        //.tickValues([1078030800000,1122782400000,1167541200000,1251691200000])
        .axisLabel('Time (hr)')
        .tickFormat(function(d) {return 2*d + ':00'});

    lineChart.yAxis
        .axisLabel(prop)
        .tickFormat(d3.format(',.4f'));

    d3.select('#multiline')
        .datum(_data)
        .call(lineChart);

    //TODO: Figure out a good way to do this automatically
    nv.utils.windowResize(lineChart.update);

    return lineChart;
  });



 }
 


  