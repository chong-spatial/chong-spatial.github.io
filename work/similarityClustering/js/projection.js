var red = '#e67777',
    green = '#369036';
// dimension reduction is a computational shortcut to cluster data in a lower dimensional space
// and to avoid curse of dimensionality
//
// a data item (transaction) might contain positive and negative features together while presents positive/negative class label.
d3.projectionView = function() {


    var margin = {
            top: 50,
            right: 20,
            bottom: 50,
            left: 80
        },
        outerWidth = 600,
        outerHeight = 600,
        width = outerWidth - margin.left - margin.right,
        height = outerHeight - margin.top - margin.bottom;

    var xFeatures = [],
        yFeatures = [];

    // store all rules being shown in the projection view
    var rules = [],
        features = [];

    var canvas, context, svg, pointRadius = 14;

    var data;

    var zoom;

    var quadTree = d3.geom.quadtree().extent([
        [0, 0],
        [width, height]
    ]);

    var clusterSizeScale = d3.scale.linear().range([pointRadius, 3 * pointRadius]);

    var xScale = d3.scale.linear().domain([0, 1]).range([0, width]).nice(),
        xAxis = d3.svg.axis()
        .scale(xScale)
        .innerTickSize(-height)
        .outerTickSize(0)
        .orient('bottom');
    var yScale = d3.scale.linear().domain([0, 1]).range([height, 0]).nice(),
        yAxis = d3.svg.axis()
        .scale(yScale)
        .innerTickSize(-width)
        .outerTickSize(0)
        .orient('left');

    var c = function(cls) {
        return cls == "cls1" ? red : green
    };



    var dispatch = d3.dispatch('nodeClick');
    dispatch.on('nodeClick.int', function(d) {
        _checkChildren(d);
    });
    dispatch.on('nodeClick.ext');



    //question: 
    // 1. exactly same similiarity values - preprocess?
    // 2. cluster chain
    // 3. weight similiarity
    // 4. label/circle size drawing
    function exports(sel) {
        // [{"cls":"cls1","m":[[0.0519,2534],90.5323,1.19009],"id":1,"it":["workclass=?"]}, ...]
        sel.each(function(obsData) {


            data = randomSubset(obsData, 10000);


            zoom = d3.behavior.zoom()
                .x(xScale)
                .y(yScale)
                .scaleExtent([1, 20])
                .on("zoom", zoomEvent);

            svg = sel.append("svg")
                .attr("width", outerWidth)
                .attr("height", outerHeight)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

            canvas = sel.append("canvas")
                .attr("width", width - 1)
                .attr("height", height - 1)
                .style("transform", "translate(" + margin.left + "px," + margin.top + "px)")
                .call(zoom);




            canvas.on('click', onClick);

            context = canvas.node().getContext('2d');

            function zoomEvent() {


                svg.select(".x.axis").call(xAxis);
                svg.select(".y.axis").call(yAxis);

                redraw();

            }



            // x-axis
            var xAxisGroup = svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)

            var xAxisLabelGroup = xAxisGroup.append("g")
                .attr('transform', 'translate(' + width + ',' + (margin.bottom - 10) + ')');
            var xAxisLabel = xAxisLabelGroup.append('text')
                .attr("class", "label")
                .style("text-anchor", "end")
                .style('fill', 'white')
                //cls1 <50k
                .text("Low-income Features");

            xAxisLabelGroup.insert('rect', 'text') //outline rectangle
                .attr("height", 16)
                .attr("width", xAxisLabel.node().getComputedTextLength())
                .attr('x', -xAxisLabel.node().getComputedTextLength())
                .attr('y', -14)
                .style('fill', red)

            // features selected list on X axis
            xAxisGroup.append("text")
                .attr("class", "xLabel")
                .attr("x", width)
                .attr("y", margin.bottom - 10)
                .attr("dy", "1em")
                .style("text-anchor", "end")
                .style('fill', red)
                .text(xFeatures.map(function(f) {
                    return f
                }));
            // .text(xFeatures.map(function(f) { return f.feature + '(' + f.weight + ')'}));

            // y-axis
            var yAxisGroup = svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)


            var yAxisLabelGroup = yAxisGroup.append("g")
                .attr('transform', 'translate(' + -margin.left / 2 + ',0)rotate(-90)');

            var yAxisLabel = yAxisLabelGroup.append("text")
                .attr("class", "label")
                .attr("y", -2)
                .style("text-anchor", "end")
                .style('fill', 'white')
                .text("High-income Features");
            yAxisLabelGroup.insert('rect', 'text') //outline rectangle
                .attr("height", 16)
                .attr("width", yAxisLabel.node().getComputedTextLength())
                .attr('x', -yAxisLabel.node().getComputedTextLength())
                .attr('y', -14)
                .style('fill', green)

            // features selected list on Y axis        
            yAxisGroup.append("text")
                .attr("class", "yLabel")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left / 2 - 4)
                .attr("dy", "-1em")
                .style("text-anchor", "end")
                .style('fill', green)
                .text(yFeatures.map(function(f) {
                    return f
                }));
            // .text(yFeatures.map(function(f) { return f.feature + '(' + f.weight + ')'}));


            // draw dots
            redraw();




            function onClick() {
                return;


                var mouse = d3.mouse(this);

                // map the clicked point to the data space
                var xClicked = xScale.invert(mouse[0]);
                var yClicked = yScale.invert(mouse[1]);

                // find the closest point in the dataset to the clicked point
                var closest = quadTree.find([xClicked, yClicked]);

                // map the co-ordinates of the closest point to the canvas space
                var dX = xScale(closest.x);
                var dY = yScale(closest.y);

                // register the click if the clicked point is in the radius of the point
                var distance = euclideanDistance(mouse[0], mouse[1], dX, dY);

                if (distance < pointRadius) {
                    if (selectedPoint) {
                        data[selectedPoint].selected = false;
                    }
                    closest.selected = true;
                    selectedPoint = closest.i;

                    // redraw the points
                    draw();
                }
            }




        })
    }



    function redraw() {
        var xBounds = zoom.x().domain(),
            yBounds = zoom.y().domain();

        context.clearRect(0, 0, width, height);

        context.strokeWidth = 1;
        context.strokeStyle = 'white';


        var dataInBounds = data.filter(function(d) {
            return xBounds[0] <= d.x && d.x <= xBounds[1] &&
                yBounds[0] <= d.y && d.y <= yBounds[1];
        })


        var scaledData = dataInBounds.map(function(d) {
            return {
                index: d.idx,
                x: xScale(d.x),
                y: yScale(d.y),
                radius: pointRadius,
                point: Object.assign({}, d) // copy with ES6
            };
        })

        var clustersInView = clustering(scaledData);


        var clusterSizeExt = d3.extent(clustersInView, function(d) {
            return d.size;
        })
        clusterSizeScale.domain(clusterSizeExt);

        clustersInView.forEach(function(o) {
            var radius = clusterSizeScale(o.size);
            o.radius = radius;

            var angle = 2 * Math.PI * o.cls1Size / o.size;

            var arccenter1 = rotate(o.cx, o.cy, o.cx + radius / 3, o.cy, angle / 2),
                arccenter2 = rotate(o.cx, o.cy, o.cx + radius / 3, o.cy, angle + (2 * Math.PI - angle) / 2);

            context.fillStyle = c('cls1');
            context.beginPath();
            context.moveTo(o.cx, o.cy);
            context.arc(o.cx, o.cy, radius, 0, angle);
            context.lineTo(o.cx, o.cy);
            context.fill();
            context.strokeStyle = '#fff';
            context.strokeText(o.cls1Size, arccenter1[0], arccenter1[1]);

            context.fillStyle = c('cls2');
            context.beginPath();
            context.moveTo(o.cx, o.cy);
            context.arc(o.cx, o.cy, radius, angle, 2 * Math.PI);
            context.lineTo(o.cx, o.cy);
            context.fill();
            context.closePath();

            context.strokeText(o.cls2Size, arccenter2[0], arccenter2[1]);



        })


        //var ptClusterer = new clusterer();


        //dataInBounds.forEach(function(o){     
        //ptClusterer.addToClosestCluster(o);
        //drawPoint(o, pointRadius, c(o.lab));
        //})  

        //var clusters = ptClusterer.getClusters();
        // update quadtree
        //quadTree(obsData);

    }



    // update clusteredData
    function clustering(da) {
        var clusters = [];

        var inPreviousClusters = [];
        var targetPoints = da;
        for (var i = 0; i < da.length; i++) {
            var p = da[i];
            if (!~inPreviousClusters.indexOf(p.index)) {
                p.overlap = [];
                clusters.push(p);
                for (var j = 0; j < targetPoints.length; j++) {
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
                targetPoints = targetPoints.filter(function(d) {
                    return p.overlap.indexOf(d) == -1;
                })
            }

        }

        //find cluster chain
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
        var cls1sum = 0,
            cls2sum = 0;
        clusters.forEach(function(d) {
            d.size = d.overlap.length + 1;
            d.cls1Size = d.overlap.filter(function(p) {
                return p.point.lab == 'cls1'
            }).length;
            d.cls2Size = d.size - d.cls1Size;
            d.cx = d.overlap.map(function(c) {
                return c.x
            }).reduce(function(a, b) {
                return a + b;
            }, 0) / d.size + d.x / d.size;
            d.cy = d.overlap.map(function(c) {
                return c.y
            }).reduce(function(a, b) {
                return a + b;
            }, 0) / d.size + d.y / d.size;

        });

        return clusters;

    }



    exports.update = function() {
        data.forEach(function(o) {
            var jaccardSimX = jaccard(o.freqItem, xFeatures),
                jaccardSimY = jaccard(o.freqItem, yFeatures);

            o.y = jaccardSimY;
            o.x = jaccardSimX;

        })
        redraw();

        svg.select(".xLabel")
            .text(xFeatures.map(function(f) {
                return f
            }));

        svg.select(".yLabel")
            .text(yFeatures.map(function(f) {
                return f
            }));
        // .text(yFeatures.map(function(f) { return f.feature + '(' + f.weight + ')'}));
    };



    exports.width = function(_) {
        if (!arguments.length) {
            return outerWidth;
        }
        outerWidth = _;
        return this;
    }

    exports.height = function(_) {
        if (!arguments.length) {
            return outerHeight;
        }
        outerHeight = _;
        return this;

    }

    // [{feature: String, weight: Number}]
    exports.xFeatures = function(_) {
        if (!arguments.length) {
            return xFeatures;
        }
        xFeatures = _;
        return this

    }

    exports.xFeatures.add = function(f) {
        for (var i = 0; i < xFeatures.length; i++) {
            if (f == xFeatures[i].feature) {
                xFeatures[i].weight++;
                return this;
            }
        }

        xFeatures.push({
            feature: f,
            weight: 1
        });
        return this;
    }

    exports.xFeatures.remove = function(f) {
        for (var i = 0; i < xFeatures.length; i++) {
            if (f == xFeatures[i].feature) {
                xFeatures[i].weight--;
                break;
            }
        }

        var removeIdx = -1;
        for (var i = 0; i < xFeatures.length; i++) {
            if (f == xFeatures[i].feature && xFeatures[i].weight == 0) {
                removeIdx = i;
            }
        }
        xFeatures.splice(removeIdx, 1);

        return this;
    }


    exports.yFeatures = function(_) {
        if (!arguments.length) {
            return yFeatures;
        }
        yFeatures = _;
        return this;
    }

    exports.yFeatures.add = function(f) {
        for (var i = 0; i < yFeatures.length; i++) {
            if (f == yFeatures[i].feature) {
                yFeatures[i].weight++;
                return this;
            }
        }

        yFeatures.push({
            feature: f,
            weight: 1
        });
        return this;
    }

    exports.yFeatures.remove = function(f) {
        for (var i = 0; i < yFeatures.length; i++) {
            if (f == yFeatures[i].feature) {
                yFeatures[i].weight--;
                break;
            }
        }

        var removeIdx = -1;
        for (var i = 0; i < yFeatures.length; i++) {
            if (f == yFeatures[i].feature && yFeatures[i].weight == 0) {
                removeIdx = i;
            }
        }
        yFeatures.splice(removeIdx, 1);

        return this;
    }

    exports.rules = function() {
        if (!arguments.length) {
            return rules;
        }
    }

    exports.rules.add = function(r) {
        rules.push(r)
    }

    exports.rules.remove = function(r) {
        var idx = rules.indexOf(r);
        rules.splice(idx, 1);
    }

    exports.features = function() {
        if (!arguments.length) {
            return features;
        }
    }

    exports.features.add = function(r) {
        features.push(r)
    }

    exports.features.remove = function(r) {
        var idx = features.indexOf(r);
        features.splice(idx, 1);
    }



    return d3.rebind(exports, dispatch, 'on');

}