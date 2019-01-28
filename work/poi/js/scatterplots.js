var brushCell;


function hotelScatterPlots(containerSelector, clickedAttrID) {

    var attFeture = attraction_layer.geoFeatures.features.filter(function(d){ return d.properties.myAttrId == clickedAttrID})[0];
    attFeture['geometry0'] = {coordinates:attraction_layer._project_to_screen(attFeture.geometry.coordinates)}

    var width = $(containerSelector).width() - 30,
        height = $(containerSelector).height() - 30,
        size = Math.min(width, height), //244
        padding = 20;

    var xScalePlot = d3.scale.linear()
        .range([0, size]);

    var yScalePlot = d3.scale.linear()
        .range([0, size]);
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
    var maxTlv = d3.max(d3.keys(pointsInServiceAreas['hotel']['f' + clickedAttrID]));
    var hotelIDsInMaxTlv = pointsInServiceAreas['hotel']['f' + clickedAttrID][maxTlv];
    // hotels in max time level should contail ones in lower time levels
    var hotelsInMaxTlv = [attFeture];
    for (var i = 0; i < hotelIDsInMaxTlv.length; i++) {
        hotelsInMaxTlv.push(hotel_layer.geoFeatures.features.filter(function(d) {
            return d.properties.myHotelId == hotelIDsInMaxTlv[i]
        })[0]);
    }

    hotelsInMaxTlv.forEach(h=>{h.geometry0 = {coordinates:hotel_layer._project_to_screen(h.geometry.coordinates)}})

    // local scacle, ie, the scale is only based on the hotels in the 3 timelevel, without considering other hotels on the map
    var xbbox = d3.extent(hotelsInMaxTlv, function(d) {
            return d.geometry0.coordinates[0];
        }),
        ybbox = d3.extent(hotelsInMaxTlv, function(d) {
            return d.geometry0.coordinates[1]
        })//.reverse();
    xScalePlot.domain(xbbox);

    yScalePlot.domain(ybbox);


    // var brush = d3.svg.brush()
    //     .x(d3.scale.linear().domain(xbbox)
    //         .range([0, size]))
    //     .y(d3.scale.linear().domain(ybbox)
    //         .range([0, size]))
    //     .on("brushstart", brushstart)
    //     .on("brush", brushmove)
    //     .on("brushend", brushend);

    var brush = d3.svg.brush()
        .x(xScalePlot)
        .y(yScalePlot)
        .on("brushstart", brushstart)
        .on("brush", brushmove)
        .on("brushend", brushend);



    function brushstart(p) {
        //stop transition
        d3.selectAll('rect.hotel')
            .transition().attr('width', 6).attr('height', 6)
        // .style("stroke-width", 1)

        if (brushCell !== this) {
            d3.select(brushCell).call(brush.clear());
            brushCell = this;
        }

        var scrXext = d3.extent(d3.select(this).selectAll('rect.hotel').data(), function(d) {
                return d.geof.geometry0.coordinates[0]
            }),
            scrYext = d3.extent(d3.select(this).selectAll('rect.hotel').data(), function(d) {
                return d.geof.geometry0.coordinates[1]
            })//.reverse();
        xScalePlot.domain(scrXext);
        yScalePlot.domain(scrYext);

    }

    // Highlight the selected circles.
    function brushmove(p) {
        // domain space
        var e = brush.extent();
        var matchedHotelIds = [];
        svg.selectAll("rect.hotel").classed("hidden", function(d) {
            var within = e[0][0] > d.geof.geometry0.coordinates[0] || d.geof.geometry0.coordinates[0] > e[1][0] ||
                e[0][1] > d.geof.geometry0.coordinates[1] || d.geof.geometry0.coordinates[1] > e[1][1];
            if (!within && !~matchedHotelIds.indexOf(d.myHotelId)) matchedHotelIds.push(d.myHotelId);
            return within;
        });

        matchedHotelIds.forEach(function(hid) {
            var fillColor = d3.select('#hotel_' + hid).style('fill'),
                strokeColor = d3.select('#hotel_' + hid).style('stroke');
            d3.select('#hotel_' + hid)
                .each(pulse)

            function pulse() {
                var rect = d3.select(this);
                (function loop() {
                    rect = rect.transition()
                        .duration(1000)
                        // .style("stroke", 'orange')
                        // .style("stroke-width", 4)
                        // .style("fill", 'white')
                        .attr('width', 20)
                        .attr('height', 20)
                        .transition()
                        .duration(1000)
                        // .style("fill", 'orange')
                        .style("stroke-width", 1)
                        .style("stroke", "#eee")
                        .attr('width', 6)
                        .attr('height', 6)
                        .ease('sine')
                        .each("end", loop);
                })();
            }

        })

        var foundHotels = [];
        for (var i = 0; i < matchedHotelIds.length; i++) {
            foundHotels.push(hotel_layer.geoFeatures.features.filter(function(d) {
                return d.properties.myHotelId == matchedHotelIds[i]
            })[0]);
        }
        var xExt = d3.extent(foundHotels, function(d) {
                return d.geometry.coordinates[0]
            }),
            yExt = d3.extent(foundHotels, function(d) {
                return d.geometry.coordinates[1]
            });

        if (xExt[0] && xExt[1] && yExt[0] && yExt[1]) {
            var hotelExt = new esri.geometry.Extent({
                xmin: xExt[0],
                ymin: yExt[0],
                xmax: xExt[1],
                ymax: yExt[1],
                spatialReference: {
                    wkid: 4326
                }
            });

            map.centerAndZoom(hotelExt.getCenter(), 14);
            // map.setExtent(, true)
        }

    }

    // If the brush is empty, select all circles.
    function brushend() {
        if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
    }

    // need a SVG under the container if singleSVG is on
    var root = d3.select(containerSelector).select("svg")
        .attr("width", (size + padding) * d3.keys(pointsInServiceAreas["hotel"]).length + padding)
        .attr("height", size + padding)
    //.call(semanticZoom)


    var svg;
    var rects;

    if (root.select('g').size() != 0) {
        svg = root.select('g')
    } else {
        svg = root.append("g")
            .attr("transform", "translate(" + padding + "," + padding + ")");
    }



    var cell = svg.selectAll('#cell_f' + clickedAttrID)
        .data([pointsInServiceAreas['hotel']['f' + clickedAttrID]])
        .enter().append('g')
        .attr('id', 'cell_f' + clickedAttrID)
        .attr('class', 'cell')
        .attr("transform", function(d) {
            return "translate(" + d3.keys(pointsInServiceAreas["hotel"]).indexOf('f' + clickedAttrID) * (size + padding) + ",0)";
        })
        .each(plot);

    cell.call(brush);

    function plot(p) {
        var cell = d3.select(this);


        //semanticZoom.x(xScale).y(yScale);

        cell.append("rect")
            .attr("class", "frame")
            .attr("x", 0) //padding / 2
            .attr("y", 0) // padding / 2
            .attr("width", size) //- padding
            .attr("height", size); //- padding

        cell.append('rect')
            .attr("class", "nodeoutline attraction")
            .attr('x', size / 2 - 22)
            .attr('y', -20)
            .attr("ry", 2)
            .attr("rx", 2)
            .attr('width', 44)
            .attr('height', 20)

        // .style('fill', function(d){
        //   var clickedFeture = attraction_layer.geoFeatures.features.filter(function(d){ return d.properties.myAttrId == clickedAttrID})[0];
        //   return nodeColor(clickedFeture.properties.THEME)
        // })

        cell.append('text')
            .attr("class", "celllb")
            .attr("x", size / 2)
            .attr("y", -2)
            .attr('text-anchor', 'middle')
            .text('#' + clickedAttrID);


        rects = cell.selectAll("rect.hotel")
            .data(function() {
                var res = [];
                var hotelIDAsKey = {};
                var minuteLevelsObj = p;
                for (var tlv in minuteLevelsObj) {
                    var tAry = minuteLevelsObj[tlv];
                    for (var i = 0; i < tAry.length; i++) {
                        if (hotelIDAsKey.hasOwnProperty(tAry[i])) {
                            hotelIDAsKey[tAry[i]].push(tlv);
                        } else {
                            hotelIDAsKey[tAry[i]] = [tlv];
                        }
                    }
                }

                for (var hotelID in hotelIDAsKey) {
                    var geoF = hotel_layer.geoFeatures.features.filter(function(d) {
                        return d.properties.myHotelId == hotelID
                    })[0];
                    geoF['geometry0'] = {coordinates:hotel_layer._project_to_screen(geoF.geometry.coordinates)}

                    res.push({
                        'myHotelId': hotelID,
                        'geof': geoF,
                        'tlv': hotelIDAsKey[hotelID]
                    })
                }

                return res;
            })
            .enter().append("rect")
            .attr("x", function(d) {
                return xScalePlot(d.geof.geometry0.coordinates[0]) <= 0 ? 0 : (xScalePlot(d.geof.geometry0.coordinates[0]) >= size - 6 ? xScalePlot(d.geof.geometry0.coordinates[0]) - 6 : xScalePlot(d.geof.geometry0.coordinates[0]));
            })
            .attr("y", function(d) {
                return yScalePlot(d.geof.geometry0.coordinates[1]) <= 0 ? 0 : (yScalePlot(d.geof.geometry0.coordinates[1]) >= size - 6 ? yScalePlot(d.geof.geometry0.coordinates[1]) - 6 : yScalePlot(d.geof.geometry0.coordinates[1]));
            })
            .attr("width", 6)
            .attr("height", 6)
            .attr("class", function(d) {
                return 'hotel ' + d3.min(d.tlv); // eg. 1:[t1, t2, t3], we will pick t1 as the class name
            });

        // insert the attraction location
        cell.append('circle')
            .attr('cx', xScalePlot(attFeture.geometry0.coordinates[0]) <= 0 ? 0 : (xScalePlot(attFeture.geometry0.coordinates[0]) >= size - 6 ? xScalePlot(attFeture.geometry0.coordinates[0]) - 6 : xScalePlot(attFeture.geometry0.coordinates[0])))
            .attr('cy', yScalePlot(attFeture.geometry0.coordinates[1]) <= 0 ? 0 : (yScalePlot(attFeture.geometry0.coordinates[1]) >= size - 6 ? yScalePlot(attFeture.geometry0.coordinates[1]) - 6 : yScalePlot(attFeture.geometry0.coordinates[1])))
            .attr('r',  4)
            .style('fill', '#53c2f5')
            .style('stroke', '#fff')

    }

    function redraw() {
        width = $(containerSelector).width() - 30;
        height = $(containerSelector).height() - 30;
        size = Math.min(width, height);

        root = d3.select(containerSelector).select("svg")
            .attr("width", (size + padding) * d3.keys(pointsInServiceAreas["hotel"]).length + padding)
            .attr("height", size + padding)


        xScalePlot.range([padding / 2, size - padding / 2]);

        yScalePlot.range([padding / 2, size - padding / 2]);


        svg.selectAll('.cell')
            .attr("transform", function(d, i) {
                return "translate(" + i * (size + padding) + ",0)";
            })
            .each(function() {

                d3.select(this).select('.celllb')
                    .attr("x", size / 2)

                d3.select(this).select(".nodeoutline")
                    .attr('x', size / 2 - 15)

                // frame rect
                d3.select(this).select('.frame')
                    .attr("width", size)
                    .attr("height", size);

                var scrXext = d3.extent(d3.select(this).selectAll('rect.hotel').data(), function(d) {
                        return d.geof.geometry0.coordinates[0]
                    }),
                    scrYext = d3.extent(d3.select(this).selectAll('rect.hotel').data(), function(d) {
                        return d.geof.geometry0.coordinates[1]
                    })//.reverse();
                xScalePlot.domain(scrXext);
                yScalePlot.domain(scrYext);



                d3.select(this).selectAll('rect.hotel')
                    .attr("x", function(d) {
                        return xScalePlot(d.geof.geometry0.coordinates[0]) <= 0 ? 0 : (xScalePlot(d.geof.geometry0.coordinates[0]) >= size - 6 ? xScalePlot(d.geof.geometry0.coordinates[0]) - 6 : xScalePlot(d.geof.geometry0.coordinates[0]));
                    })
                    .attr("y", function(d) {
                        return yScalePlot(d.geof.geometry0.coordinates[1]) <= 0 ? 0 : (yScalePlot(d.geof.geometry0.coordinates[1]) >= size - 6 ? yScalePlot(d.geof.geometry0.coordinates[1]) - 6 : yScalePlot(d.geof.geometry0.coordinates[1]));
                    })

            }).call(brush);


    }

    return {
        reDraw: redraw
    }

}