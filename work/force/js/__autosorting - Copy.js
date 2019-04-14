
function createForce(polyD){
  var validDimensions = [];
  for (var i = 0; i < multiDimensions.length; i++){
    var aval = polyD.attributes[multiDimensions[i]];
    if(!isNaN(aval) && +aval != 0){
      validDimensions.push(multiDimensions[i])
    }
  }
  var poly = new esri.geometry.Polygon({"rings": polyD.geometry.rings, "spatialReference": polyD.spatialReference}),
      pExt = poly.getExtent(),
      screenExt = [[pExt.xmin, pExt.ymin], [pExt.xmax, pExt.ymax]].map(function(d){var so = esri.geometry.toScreenPoint(map.extent, map.width, map.height, new esri.geometry.Point(d[0], d[1])); return [so.x, so.y] });

  var svggroup = d3.select(this),
      nodecount = validDimensions.length,
      nodepadding = 4;

  var width = Math.abs(screenExt[1][0] - screenExt[0][0]),
      height = Math.abs(screenExt[1][1] - screenExt[0][1]);


  var radiusScale = d3.scale.pow().exponent(2).domain(validDimensions.map(function(d){ return +polyD.attributes[d]}).sort(function(a, b){ return a - b })).range([Math.min(width, height)/2/10, Math.min(width, height)/2/5]).clamp(true)
  // cal poly area
  // var maxRadius = Math.sqrt(polyD.attributes.CENSUSAREA/Math.PI)/15 // 20 polyD
  //console.log(polyD.attributes.NAME)
  //console.log('screenExt:', screenExt)
  //console.log('width, height: ', width, height)
  var gravity1 = 0.2, gravity2 = 0.1,
      friction1 = 0.5, friction2 = 0.01,
      charge1 = 0, charge2 = -40;


  var tick = (function() {
    var phase = -1, stage1 = true;

    function tick(e) {

      circles.circle.each(circles.collide(e.alpha * 40));
      if(e.alpha < 0.02 || !(phase = ++phase %  4)) {
          circles.circle.attr({
              cx: function(d) {
                  return d.x - circles.graphWidth / 2; // because the paratent group has already been transformed, so have to minus width/2
              },
              cy: function(d) {
                  return d.y - circles.graphHeight / 2;
              }
          });
      }
      if(stage1 && e.alpha < 0.03) {
          //console.log("stage2")
          force.friction(friction2)
              .charge(charge2)
              .gravity(gravity2)
              .start().alpha(e.alpha);
          stage1 = false;
      }
      force.alpha(e.alpha / 0.99 * 0.998)
    }

    tick.reset = function() {
        stage1 = true;
    };

    return tick;
  })()


  var force = d3.layout.force()
            .size([width, height])
            .gravity(gravity1)
            .charge(charge1)
            .friction(friction1)
            .on("tick", tick)
            .on("start", function() {
                force
                    .gravity(gravity1)
                    .charge(charge1)
                    .friction(friction1)
                //tick.reset();
            });




  // var solveCollide = procNodes(force, nodecount, nodepadding);

  function updateCicles(force, dimensions, padding, rScale, w, h){
    return {
      collide: procNodes(force, dimensions, padding, rScale, w, h),
      graphWidth: w,
      graphHeight: h,
      circle : (function() {
          var update = svggroup.selectAll("circle")
              .data(force.nodes());
          update.enter().append("circle");
          update.exit().remove();
          update.attr("r", function(d) {
              return isNaN(d.radius) ? d.radius = 1 : d.radius;
          })
          .attr('class', function(d) { return d.class})
          .style("fill", function(d) {
            return d.color
          })
          .call(force.drag)
          return update;
      })()
    }
  }

  var circles  = updateCicles(force, validDimensions, nodepadding, radiusScale, width, height);


  function procNodes(force, dimensions, padding, rScale, w, h) {

    force.stop()
        .nodes(dimensions.map(function(dim) {
            return {
                class      : dim,
                radius     : rScale(+polyD.attributes[dim]), //Math.pow(v, 0.8) * rMax,
                color      : colors(dim),
                x          : w / 2,
                y          : h / 2,
                v() {
                    var d = this;
                    return {x: d.x - d.px || d.x || 0, y: d.y - d.py || d.y || 0}
                },
                frustration: (function() {
                    //if they can't get home, they get angry, but, as soon as they're home, they're fine
                    var anger = 1;
                    return function() {
                        var d = this, anxious = (Math.abs(d.cy - d.y) > w.rangeBand() / 2);
                        return anger = anxious ? anger + windUp.value() : 1;
                    }
                })()
            }
        }))
        .start();
    return Collide(force.nodes(), nodepadding);
  }

  function Collide(nodes, padding) {
    // Resolve collisions between nodes.
    var maxRadius = d3.max(nodes, function(d) {
        return d.radius
    });
    return function collide(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        var hit = false;
        return function(d) {
          /*
          // method 1
          var r = d.radius + maxRadius + padding,
              nx1 = d.x - r,
              nx2 = d.x + r,
              ny1 = d.y - r,
              ny2 = d.y + r;
          quadtree.visit(function(quad, x1, y1, x2, y2) {

            if (quad.point && (quad.point !== d)) {
              var x = d.x - quad.point.x,
                  y = d.y - quad.point.y,
                  l = Math.sqrt(x * x + y * y),
                  r = d.radius + quad.point.radius + padding;
              if (l < r) {
                l = (r - l) / l * (1 + alpha); // (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
              }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
          });
          */

          // method 2
          var r   = d.radius + maxRadius + padding,
              nx1 = d.x - r,
              nx2 = d.x + r,
              ny1 = d.y - r,
              ny2 = d.y + r;
          quadtree.visit(function(quad, x1, y1, x2, y2) {
              var possible = !(x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1);
              if(quad.point && (quad.point !== d) && possible) {
                  var x  = d.x - quad.point.x,
                      y  = d.y - quad.point.y,
                      l  = Math.sqrt(x * x + y * y),
                      r  = d.radius + quad.point.radius + padding,
                      m  = Math.pow(quad.point.radius, 4),
                      mq = Math.pow(d.radius, 4),
                      mT = m + mq;
                  if(l < r) {
                      for(; Math.abs(l) == 0;) {
                          x = Math.round(Math.random() * r);
                          y = Math.round(Math.random() * r);
                          l = Math.sqrt(x * x + y * y);
                      }
                      //move the nodes away from each other along the radial (normal) vector
                      //taking relative mass into consideration, the sign is already established
                      //in calculating x and y and the nodes are modelled as spheres for calculating mass
                      l = (r - l) / l * (1 + alpha);
                      d.x += (x *= l) * m / mT;
                      d.y += (y *= l) * m / mT;
                      quad.point.x -= x * mq / mT;
                      quad.point.y -= y * mq / mT;
                  }
              }
              return !possible;
          });

          /*
          // method 3

          */
        };

    }
  }

  //TODO update circle radius and cx cy.
  polyD.graph ={};
  polyD.graph.poly = poly;
  polyD.graph.pExt = pExt;
  polyD.graph.screenExt = screenExt;
  polyD.graph.svggroup = svggroup;
  polyD.graph.nodepadding = nodepadding;
  polyD.graph.width = width;
  polyD.graph.height = height;
  polyD.graph.validDimensions = validDimensions;
  polyD.graph.gravity1 = gravity1;
  polyD.graph.gravity2 = gravity2;
  polyD.graph.friction1 = friction1;
  polyD.graph.friction2 = friction2;
  polyD.graph.charge1 = charge1;
  polyD.graph.charge2 = charge2;
  polyD.graph.radiusScale = radiusScale;
  polyD.graph.force = force;
  polyD.graph.updateCicles = updateCicles;
  polyD.graph.collide = Collide;
  polyD.graph.procNodes = procNodes;


  // access old circles and adjust their radius.
  polyD.graph.updateForce = function(mapExt, mapW, mapH){
    //console.log('update')

    var pExt = polyD.graph.pExt
        screenExt = [[pExt.xmin, pExt.ymin], [pExt.xmax, pExt.ymax]].map(function(d){var so = esri.geometry.toScreenPoint(mapExt, mapW, mapH, new esri.geometry.Point(d[0], d[1])); return [so.x, so.y] });

    polyD.graph.screenExt = screenExt;

    var width = Math.abs(screenExt[1][0] - screenExt[0][0]),
        height = Math.abs(screenExt[1][1] - screenExt[0][1]);




    polyD.graph.width = width;
    polyD.graph.height = height;

    polyD.graph.radiusScale.range([Math.min(width, height)/2/8, Math.min(width, height)/2/4])

    polyD.graph.force.size([width, height]);

    var circles = polyD.graph.updateCicles(polyD.graph.force, polyD.graph.validDimensions, polyD.graph.nodepadding, polyD.graph.radiusScale, polyD.graph.width, polyD.graph.height);

    var phase = -1, stage1 = true;

    function tick(e) {

      circles.circle.each(circles.collide(e.alpha * 40));
      if(e.alpha < 0.02 || !(phase = ++phase %  4)) {
          circles.circle.attr({
              cx: function(d) {
                  return d.x - circles.graphWidth / 2; // because the paratent group has already been transformed, so have to minus width/2
              },
              cy: function(d) {
                  return d.y - circles.graphHeight / 2;
              }
          });
      }
      if(stage1 && e.alpha < 0.03) {
          //console.log("stage2")
          polyD.graph.force.friction(friction2)
              .charge(charge2)
              .gravity(gravity2)
              .start().alpha(e.alpha);
          stage1 = false;
      }
      polyD.graph.force.alpha(e.alpha / 0.99 * 0.998)
    }

    polyD.graph.force.on('tick', tick);

  }


}
