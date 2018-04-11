// Parallel Sets by Jason Davies, http://www.jasondavies.com/
// Functionality based on http://eagereyes.org/parallel-sets
(function() {
  d3.parsets = function() {
    var event = d3.dispatch("sortDimensions", "sortCategories", "ribbonClick", "categoryClick"),
        dimensions_ = autoDimensions,
        dimensions = [],  
        currentDimensions = [],
        dimensionNames = [],   
        oriDimensionNames = [],  
        dimensionsEle,
        dimensionFormat = String,
        tooltip_ = defaultTooltip,
        categoryTooltip = defaultCategoryTooltip,
        value_,
        spacing = 40,
        width,
        height,
        tension = 1,
        tension0,
        duration = 500,
        classDimension = null,
        disableOrderClassDimension = false,
        yesLabelGoesFirst = true,
        dragDimensionFunc;

    var highlightedRibbons = [], highlightCates = [], highlightItem = '';

    event.on('ribbonClick.int', function(d){
      
      if (!~highlightedRibbons.indexOf(d.path)) { // new to highlight    
        highlightedRibbons.push(d.path);

        parsets.highlightRibbonClick(d, true); 

      } else { // unhighlight
        var idx = highlightedRibbons.indexOf(d.path);
        highlightedRibbons.splice(idx, 1);   
    
        parsets.unHighlightRibbonClick(d, true); 
    
      }  
              
    });


    event.on('categoryClick.int', function(d){
      //return; //evaluation

      if (dragging) return;
      

      var dimCateName = d.dimension.name + '_' + d.name;
      var dimCateDict = {};
      dimCateDict[d.dimension.name] = d.name;
      
      parsets.toggleCategoriesBG(dimCateDict); 

      parsets.toggleRibbons([dimCateName]);
              
    });

    

    var parData,
        tree = {children: {}, count: 0},
        nodes,
        ribbon,
        total,
        dragging = false,
        ordinal = d3.scale.ordinal();

    var dimensionDistance = 0;

    var g;

    var ruleRelatedDimCates;

    function parsets(selection) {
      selection.each(function(data, i) {
        parData = data;

        g = d3.select(this);

        dimensionNames = dimensions_.call(this, data, i);
        //var dimensionNames = d3.keys(data[0]);
        oriDimensionNames = dimensionNames;
        

        d3.select(window).on("mousemove.parsets." + ++parsetsId, parsets.unhighlightActive);

        if (tension0 == null) tension0 = tension;
        g.selectAll(".ribbon, .ribbon-mouse")
            .data(["ribbon", "ribbon-mouse"], String)
          .enter().append("g")
            .attr("class", String);

        updateDimensions();

        if (tension != tension0) {
          var t = d3.transition(g);
          if (t.tween) t.tween("ribbon", tensionTween);
          else tensionTween()(1);
        }

        
        function tensionTween() {
          var i = d3.interpolateNumber(tension0, tension);
          return function(t) {
            tension0 = i(t);
            ribbon.attr("d", ribbonPath);
          };
        }

        

        function updateDimensions() {
          // Cache existing bound dimensions to preserve sort order.
          var dimension = g.selectAll("g.dimension"),
              cache = {};
          dimension.each(function(d) { cache[d.name] = d; });
          dimensionNames.forEach(function(d) {
            if (!cache.hasOwnProperty(d)) {
              cache[d] = {name: d, categories: []};
            }
            dimensions.push(cache[d]);
          });
          //dimensions.sort(compareY);
          // Populate tree with existing nodes.
          g.select(".ribbon").selectAll("path")
              .each(function(d) {
                var path = d.path.split("\0"),
                    node = tree,
                    n = path.length - 1;
                for (var i = 0; i < n; i++) {
                  var p = path[i];
                  node = node.children.hasOwnProperty(p) ? node.children[p]
                      : node.children[p] = {children: {}, count: 0};
                }
                node.children[d.name] = d;
              });


          tree = buildTree(tree, data, dimensions.map(dimensionName), value_);

          cache = dimensions.map(function(d) {
            var t = {};
            d.categories.forEach(function(c) {
              t[c.name] = c;
            });
            return t;
          });
          (function categories(d, i) {
            if (!d.children) return;
            var dim = dimensions[i],
                t = cache[i];
            for (var k in d.children) {
              if (!t.hasOwnProperty(k)) {
                dim.categories.push(t[k] = {name: k});
              }
              categories(d.children[k], i + 1);
            }
          })(tree, 0);

          // 
          if(yesLabelGoesFirst) {
            var classDim = parsets.classDimension(),
                classCates= classDim.categories;
            if(classCates[0].name !== 'R'){
              var nocls = Object.assign({}, classCates[0]);
              classCates[0] = classCates[1];
              classCates[1] = nocls;
            }
          }


          var optimizedMutualInfo = {
          'Edible': {'Yes':0, 'No':1}, 
          'odor': {'a':0, 'l':1, 'p':2, 'n':3, 'f':4, 'c':5, 'm': 6, 's': 7, 'y': 8}, 
          'cap-color': {'g':0, 'w':1, 'p':2, 'y':3, 'n':4, 'b':5, 'e':6, 'c':7, 'r':8, 'u':9},
          'stalk-root': {'e':0, 'b':1, 'c':2, 'r':3},
          'cap-shape': {'s':0, 'b':1, 'x':2, 'f':3, 'k':4, 'c':5}, 
          'cap-surface': {'f':0, 's':1, 'y':2, 'g':3}, 
          'veil-color': {'n':0, 'o':1, 'w':2, 'y':3}, 
          'ring-number': {'n':0,'o':1, 't':2},
          'population': {'y':0, 'v':1, 'n':2, 's':3, 'c':4, 'a':5},
          'gill-spacing': {'c':0, 'w':1},
          'habitat': {'d':0, 'p':1, 'l':2, 'u':3, 'm':4, 'g':5, 'w': 6},
          'veil-type': {'p':0},
          'spore-print-color': {'h':0, 'w':1, 'k':2, 'n':3, 'b':4, 'o':5, 'r':6, 'u':7, 'y':8},
          'gill-color': {'b':0, 'k':1, 'w':2, 'n':3, 'u':4, 'p':5, 'g':6, 'y':7, 'h':8, 'e':9, 'o':10, 'r':11},
          'gill-size': {'n':0, 'b':1},        
          'stalk-shape': {'t':0, 'e':1}, 
          'ring-type': {'f':0, 'l':1, 'e':2, 'p':3, 'n':4}, 
          'bruises': {'t':0, 'f':1}, 
          'stalk-surface-above-ring': {'f':0, 'k':1, 's':2, 'y':3},      
          'stalk-surface-below-ring': {'f':0, 'k':1, 's':2, 'y':3}, 
          'stalk-color-above-ring': {'b':0, 'n':1,'p':2, 'w':3, 'e':4, 'g':5, 'o':6, 'c':7, 'y':8},
          'stalk-color-below-ring': {'b':0, 'n':1,'p':2, 'w':3, 'g':4, 'e':5, 'y':6, 'o':7, 'c':8},         
          'gill-attachment': {'a':0, 'f':1}              
                         
           
          
          };


          var optimizedMutualInfo_dimreduced= {
          'Edible': {'Yes':0, 'No':1}, 
          'bruises': {'t':0, 'f':1}, 
          'odor': {'a':0, 'l':1, 'p':2, 'n':3, 'f':4, 'c':5, 'm': 6, 's': 7, 'y': 8}, 
          'gill-size': {'b':0, 'n':1},    
          'stalk-surface-above-ring': {'y':0, 's':1, 'f':2, 'k':3}, 
          'stalk-surface-below-ring': {'s':0, 'y':1, 'f':2, 'k':3},
          'ring-type': {'p':0, 'n':1, 'e':2, 'f':3, 'l':4}
    
           
          
          };

          
          // sort the inital categories order           
           dimensions.filter(function(d){return d.name !== classDim.name}).forEach(function(d){
            // Yes lists first
            if(d.name == parsets.classDimension().name) {
              d.categories.sort(function(a, b){ 
                if(a.name < b.name) return 1;
                if(a.name > b.name) return -1;
                return 0;

              });
            } else {
              d.categories.sort(function(a, b){ 
                if(a.name < b.name) return -1;
                if(a.name > b.name) return 1;
                return 0;

              });   
            }     
          })
          
          
          
          /*
          // experiment use, Joint Entropy for category
          dimensions.forEach(function(d){
            d.categories.sort(function(a, b){ 
              if(optimizedMutualInfo_dimreduced[d.name][a.name] - optimizedMutualInfo_dimreduced[d.name][b.name] > 0) return 1;
              if(optimizedMutualInfo_dimreduced[d.name][a.name] - optimizedMutualInfo_dimreduced[d.name][b.name] < 0) return -1;
             
              
              return 0;

            });   
           
          })
          
          */


          
          ordinal.domain([]).range(d3.range(parsets.classDimension().categories.length));
          nodes = layout(tree, dimensions, ordinal);
          total = getTotal(dimensions);
          dimensions.forEach(function(d) {
            d.count = total;
          });
          dimension = dimension.data(dimensions, dimensionName);

          var dEnter = dimension.enter().append("g")
              .attr("class", "dimension")
              .attr("transform", function(d) { return "translate(0," + d.y + ")"; })
              .on("mousedown.parsets", cancelEvent);
          dimension.each(function(d) {
                d.y0 = d.y;
                d.categories.forEach(function(d) { d.x0 = d.x; });
              });
          dEnter.append("rect")
              .attr("width", width)
              .attr("y", -45)
              .attr("height", 45);
          var textEnter = dEnter.append("text")
              .attr("class", "dimension")
              .attr("transform", "translate(0,-20)");
          textEnter.append("tspan")
              .attr("class", "name")
              .text(dimensionFormatName);
              /*
          textEnter.append("tspan")
              .attr("class", "sort alpha")
              .attr("dx", "2em")
              .text("alpha »")
              .on("mousedown.parsets", cancelEvent);
              */
              /*
          textEnter.append("tspan")
              .attr("class", "sort size")
              .attr("dx", "2em")
              .text("← size")
              .on("mousedown.parsets", cancelEvent);
              */

          dragDimensionFunc = d3.behavior.drag()
                .origin(identity)
                .on("dragstart", function(d) {
                  dragging = true;
                  d.y0 = d.y;
                })
                .on("drag", function(d) {
                  d.y0 = d.y = d3.event.y;
                  for (var i = 1; i < dimensions.length; i++) {
                    if (height * dimensions[i].y < height * dimensions[i - 1].y) {
                      dimensions.sort(compareY);
                      dimensionNames = dimensions.map(dimensionName);
                      ordinal.domain([]).range(d3.range(parsets.classDimension().categories.length));
                      nodes = layout(tree = buildTree({children: {}, count: 0}, data, dimensionNames, value_), dimensions, ordinal);
                      total = getTotal(dimensions);
                      g.selectAll(".ribbon, .ribbon-mouse").selectAll("path").remove();
                      parsets.updateRibbons();
                      updateCategories(dimension);
                      dimension.transition().duration(duration)
                          .attr("transform", translateY)
                          .tween("ribbon", ribbonTweenY);
                      event.sortDimensions();
                      break;
                    }
                  }
                  d3.select(this)
                      .attr("transform", "translate(0," + d.y + ")")
                      .transition();
                  ribbon.filter(function(r) { return r.source.dimension === d || r.target.dimension === d; })
                      .attr("d", ribbonPath);

                  parsets.updateRuleCategoryClass();

                })
                .on("dragend", function(d) {
                  dragging = false;
                  //parsets.unhighlight();
                  var y0 = 45,
                      dy = (height - y0 - 2) / (dimensions.length - 1);

                  dimensionDistance = dy;

                  dimensions.forEach(function(d, i) {
                    d.y = y0 + i * dy;
                  });
                  transition(d3.select(this))
                      .attr("transform", "translate(0," + d.y + ")")
                      .tween("ribbon", ribbonTweenY);

                  // for quick test, may go to main.js
                  d3.select('#clutterMetricSpan').html(parsets.clutterMeasure());

                  parsets.updateRuleCategoryClass();
                });


          dimensionsEle = dimension;

          dimension.call(dragDimensionFunc);

          setDisableOrderClassDimension();

          
          dimension.transition().duration(duration)
              .attr("transform", function(d) { return "translate(0," + d.y + ")"; })
              .tween("ribbon", ribbonTweenY);
          dimension.exit().remove();

          updateCategories(dimension);
          parsets.updateRibbons();


          currentDimensions = dimensions;

          
        }

        function sortBy(type, f, dimension) {
          return function(d) {
            var direction = this.__direction = -(this.__direction || 1);
            d3.select(this).text(direction > 0 ? type + " ←" : " →" + type);
            d.categories.sort(function() { return direction * f.apply(this, arguments); });
            nodes = layout(tree, dimensions, ordinal);
            updateCategories(dimension);
            parsets.updateRibbons();
            event.sortCategories();
          };
        }            
          

      });
    }


    function setDisableOrderClassDimension (){
      if(dimensionsEle) {
        var classDimEle = dimensionsEle.filter(function(d){ return d.name == classDimension});
        if(disableOrderClassDimension) {        
          classDimEle.on('mousedown.drag', null);
          classDimEle.classed('defaultCursor', true);
          classDimEle.select('text').classed('defaultCursor', true);

        } else {
          dimensionsEle.call(dragDimensionFunc);
          classDimEle.classed('defaultCursor', false);
          classDimEle.select('text').classed('defaultCursor', false);
        }
      }
    }


    

    parsets.disableOrderClassDimension = function(_) {
      if (!arguments.length) return disableOrderClassDimension;

      disableOrderClassDimension = (_ === true);
      setDisableOrderClassDimension();
      
      return parsets;
    }

    // Highlight a node and its descendants, and optionally its ancestors.
    parsets.highlightMousemove = function(d, ancestors) {
      return; //evaluation


      if (dragging) return;
      var highlight = [];

      if(ruleUnrelatedCateIsShown){
        (function recurse(d) {
          highlight.push(d);
          for (var k in d.children) recurse(d.children[k]);
        })(d);
        highlight.shift();
        if (ancestors) while (d) highlight.push(d), d = d.parent;

      } else {

        (function recurse(d) {
          highlight.push(d);
          for (var k in d.children) { 
            if(d.dimension != parsets.classDimension().name && (!d.source.node.ruleRelatedCate || !d.target.node.ruleRelatedCate))
              break; 
            recurse(d.children[k]);}
        })(d);
        highlight.shift();
        if (ancestors) while (d && d.hasOwnProperty('source') && d.source.node.ruleRelatedCate && d.target.node.ruleRelatedCate) highlight.push(d), d = d.parent;
        if(ancestors) highlight.push(d);

      }

      ribbon.filter(function(d) {
        var active = highlight.indexOf(d.node) >= 0;
        if (active) this.parentNode.appendChild(this);
        return active;
      }).classed("active", true);



    }

    parsets.highlightMousemove_OLD = function(d, ancestors) {
      if (dragging) return;
      var highlight = [];

      if(ruleUnrelatedCateIsShown){
        (function recurse(d) {
          highlight.push(d);
          for (var k in d.children) recurse(d.children[k]);
        })(d);
        highlight.shift();
        if (ancestors) while (d) highlight.push(d), d = d.parent;

      } else {

        (function recurse(d) {
          highlight.push(d);
          for (var k in d.children) { 
            if(d.dimension != parsets.classDimension().name && (!d.source.node.ruleRelatedCate || !d.target.node.ruleRelatedCate))
              break; 
            recurse(d.children[k]);}
        })(d);
        highlight.shift();
        if (ancestors) while (d && d.hasOwnProperty('source') && d.source.node.ruleRelatedCate && d.target.node.ruleRelatedCate) highlight.push(d), d = d.parent;
        if(ancestors) highlight.push(d);

      }

      ribbon.filter(function(d) {
        var active = highlight.indexOf(d.node) >= 0;
        if (active) this.parentNode.appendChild(this);
        return active;
      }).classed("active", true);



    }


    parsets.highlightClick = function(d, ancestors) {
      if (dragging) return;
      var highlight = [];

      if(ruleUnrelatedCateIsShown){
        (function recurse(d) {
          highlight.push(d);
          for (var k in d.children) recurse(d.children[k]);
        })(d);
        highlight.shift();
        if (ancestors) while (d) highlight.push(d), d = d.parent;

      } else {

        (function recurse(d) {
          highlight.push(d);
          for (var k in d.children) { 
            if(d.dimension != parsets.classDimension().name && (!d.source.node.ruleRelatedCate || !d.target.node.ruleRelatedCate))
              break; 
            recurse(d.children[k]);}
        })(d);
        highlight.shift();
        if (ancestors) while (d && d.hasOwnProperty('source') && d.source.node.ruleRelatedCate && d.target.node.ruleRelatedCate) highlight.push(d), d = d.parent;
        if(ancestors) highlight.push(d);

      }

      ribbon.filter(function(d) {
        var active = highlight.indexOf(d.node) >= 0;
        if (active) this.parentNode.appendChild(this);
        return active;
      }).classed("highlight", true);



    }

    parsets.unHighlightClick = function(d, ancestors) {
      if (dragging) return;
      var unhighlight = [];
      (function recurse(d) {
        unhighlight.push(d);
        for (var k in d.children) recurse(d.children[k]);
      })(d);
      unhighlight.shift();
      if (ancestors) while (d) unhighlight.push(d), d = d.parent;
      ribbon.filter(function(d) {
        var active = unhighlight.indexOf(d.node) >= 0;
        if (active) this.parentNode.appendChild(this);
        return active;
      }).classed("highlight", false);
    }

    // Unhighlight all nodes.
    parsets.unHighlightMousemove = function () {
      if (dragging) return;
      ribbon.classed("active", false);
      hideTooltip();
    }

    parsets.highlightRibbonClick = function(d, ancestors) {
      if (dragging) return;
      var highlight = [];
      (function recurse(d) {
        highlight.push(d);
        for (var k in d.children) recurse(d.children[k]);
      })(d);
      highlight.shift();
      if (ancestors) while (d) highlight.push(d), d = d.parent;
      
      var toHighRibbons = ribbon.filter(function(d) {
        var active = highlight.indexOf(d.node) >= 0;
        if (active) this.parentNode.appendChild(this);
        return active;
      }).classed("highlight", true);

      var toHighDimCates = {};
      toHighRibbons.each(function(d){
        var k = d.dimension + '\0' + d.name;
        toHighDimCates[k] = 1;
        toHighDimCates[parsets.classDimension().name + '\0' + d.label] = 1;

      })

      g.selectAll("g.category").classed('relatedHighlight', false);

      g.selectAll("g.category").filter(function(d){
        var k = d.dimension.name + '\0' + d.name;
        return toHighDimCates.hasOwnProperty(k);
      }).classed('relatedHighlight', true)

    }

    parsets.unHighlightRibbonClick = function(d, ancestors) {
      if (dragging) return;
      var unhighlight = [];
      (function recurse(d) {
        unhighlight.push(d);
        for (var k in d.children) recurse(d.children[k]);
      })(d);
      unhighlight.shift();
      if (ancestors) while (d) unhighlight.push(d), d = d.parent;
      
      var toHighRibbons = ribbon.filter(function(d) {
        var active = unhighlight.indexOf(d.node) >= 0;
        if (active) this.parentNode.appendChild(this);
        return active;
      }).classed("highlight", false);

      var toHighDimCates = {};
      toHighRibbons.each(function(d){
        var k = d.dimension + '\0' + d.name;
        toHighDimCates[k] = 1;
        toHighDimCates[parsets.classDimension().name + '\0' + d.label] = 1;

      })

      

      g.selectAll("g.category").filter(function(d){
        var k = d.dimension.name + '\0' + d.name;
        return toHighDimCates.hasOwnProperty(k);
      }).classed('relatedHighlight', false)

    }

    parsets.updateRibbons = function() {

      ribbon = g.select(".ribbon").selectAll("path")
          .data(nodes, function(d) { return d.path; });
      ribbon.enter().append("path")
          .each(function(d) {
            d.source.x0 = d.source.x;
            d.target.x0 = d.target.x;
          })
          // clutter metric
          .each(function(d){
            d.distance = clutterMetric(d);
          })
          .attr("class", function(d) { return "category-" + d.label; })
          
          .attr("d", ribbonPath);
      //ribbon.sort(function(a, b) { return b.count - a.count; });
      ribbon.exit().remove();
      var mouse = g.select(".ribbon-mouse").selectAll("path")
          .data(nodes, function(d) { return d.path; });
      mouse.enter().append("path")
          .on("mousemove.parsets", function(d) {
            ribbon.classed("active", false);
            // if (dragging) return;
            parsets.highlightMousemove(d = d.node, true);
            showTooltip(tooltip_.call(this, d));
            d3.event.stopPropagation();
          })
          .on("click.parsets", event.ribbonClick);

      mouse
          //.sort(function(a, b) { return b.count - a.count; })
          .attr("d", ribbonPathStatic);
      mouse.exit().remove();
    }

    parsets.sortRibbons = function() {
      ribbon = g.select(".ribbon").selectAll("path")
          .data(nodes, function(d) { return d.path; });

       ribbon.each(function(d) {
            d.source.x0 = d.source.x;
            d.target.x0 = d.target.x;
          })
          // clutter metric
          .each(function(d){
            d.distance = clutterMetric(d);
          })
          .attr("d", ribbonPath);
     

      var mouse = g.select(".ribbon-mouse").selectAll("path")
          .data(nodes, function(d) { return d.path; });      
      mouse.attr("d", ribbonPathStatic);

    }


    // need recursive    
    parsets.toggleRibbons = function(items){
      var itemKey = items.join('\0');

      if (highlightItem !== itemKey) { // new to highlight    
        highlightItem = itemKey;        
      
      } else {
        
        highlightItem =''; 
     
      } 

      var highlightDims =  [],
          highDimCate = {};

        var dc_ = highlightItem.split('\0');

        for(var i = 0; i < dc_.length; i++){
          var dc = dc_[i].split('_');
          if(!~highlightDims.indexOf(dc[0])){
            highlightDims.push(dc[0]);
            if(highDimCate.hasOwnProperty(dc[0])){
              highDimCate[dc[0]].push(dc[1]);
            } else {
              highDimCate[dc[0]] = [dc[1]];
            }
          }
        }         
   

      var tohighPath = [];      

      var includedRibbons = ribbon.filter(function(d){ 
        if(!d.hasOwnProperty('source') || !d.source.hasOwnProperty('node')) return false;
        if(!d.hasOwnProperty('target') || !d.target.hasOwnProperty('node')) return false;
        var sdName = d.source.dimension.name,
            sdcName = d.source.node.name,
            tdName = d.target.dimension.name,
            tdcName = d.target.node.name;

        return highlightDims.indexOf(sdName) != -1 && highDimCate[sdName].indexOf(sdcName) != -1 || 
          highlightDims.indexOf(tdName) != -1 && highDimCate[tdName].indexOf(tdcName) != -1
        });
      
      ribbon.classed("highlight", false);


      var allConnectedRibbons = [];
      includedRibbons.each(function(d){
        (function recurseChild(d) {
          allConnectedRibbons.push(d);
          //highlight.push(d);
          for (var k in d.children) recurseChild.call(this, d.children[k]);
        }).call(this, d);
  
        while(d) allConnectedRibbons.push(d), d = d.parent;

      })

      var toHighRibbons = ribbon.filter(function(d) {
        var active = allConnectedRibbons.indexOf(d.node) >= 0;
        if (active) this.parentNode.appendChild(this);
        return active;
      }).classed("highlight", true);   

      //find dimension-category from toHighRibbons

      var toHighDimCates = {};
      toHighRibbons.each(function(d){
        var k = d.dimension + '\0' + d.name;
        toHighDimCates[k] = 1;
        toHighDimCates[parsets.classDimension().name + '\0' + d.label] = 1;

      })

      g.selectAll("g.category").classed('relatedHighlight', false);

      g.selectAll("g.category").filter(function(d){
        var k = d.dimension.name + '\0' + d.name;
        return toHighDimCates.hasOwnProperty(k);
      }).classed('relatedHighlight', true)
               
      
      
    }

    
    parsets.toggleCategoriesBG = function(dimCatesDict) { 
      var allin = true;
      var touseDimCates=[];
      for(var dim in dimCatesDict){
        var dimCateName = dim + '_' + dimCatesDict[dim];
        touseDimCates.push(dimCateName)
        if (!~highlightCates.indexOf(dimCateName)) { // new to highlight    
         allin = false;
        }
      }
      if(touseDimCates.length !== highlightCates.length) {
        allin = false
      }
      if(!allin){
        highlightCates =touseDimCates
      } else {
        highlightCates =[];
      }
       
      g.selectAll("g.category").each(function(c){
        var dimCateName = c.dimension.name + '_' + c.name;
        if(highlightCates.indexOf(dimCateName) != -1){
          d3.select(this).selectAll('.category-background')
            .classed('highlight', true);


        } else {
          d3.select(this).selectAll('.category-background')
            .classed('highlight', false);
        }
      })

    }


 

    function sortbyIdx (a, b)  {
      if(a.idx < b.idx) return -1; 
      if(a.idx > b.idx) return 1;
      return 0;
    }

    parsets.showOnlyHighlights = function(trueOrFalse){
      if(trueOrFalse){
        ribbon.filter(function(d){ return ! d3.select(this).classed('highlight')})
        .style('fill-opacity', 0.1)
      } else {
        ribbon.style('fill-opacity', null)
      }
    }
    //TODO
    parsets.toggleUnhighlights = function(toDisplay){
      if(toDisplay){
        if(ruleUnrelatedCateIsShown){
          ribbon.style("display", "block");  

          g.selectAll('.category').style('display', "block");      
          
        } else {
          ribbon.filter(function(d){
            var ruleExcludedHidden = d3.select(this).classed("ruleNotRelatedCateHidden");            
            return !ruleExcludedHidden;            
          })
          .style("display", "block"); 


          g.selectAll('.category').filter(function(d){
            var ruleExcludedHidden = d3.select(this).classed("ruleNotRelatedCateHidden");            
            return !ruleExcludedHidden;     
          })
          .style("display", "block");  
        }

      } else { // need to hide unhighlights
        ribbon.style("display", "none");
        g.selectAll('.category').style('display', "none"); 
        
        if(ruleUnrelatedCateIsShown){   
          ribbon.filter(function(d) {
            var highlighted = d3.select(this).classed("highlight");           
            return highlighted;
          }).style("display", "block");  


          g.selectAll('.category').filter(function(d){ return d.name != parsets.classDimension().name}).style("display", "none"); 
          g.selectAll('.category').filter(function(d){
            var ruleExcludedHidden = d3.select(this).classed("ruleNotRelatedCateHidden");  
            var clickRelatedCates = d3.select(this).classed("relatedHighlight");           
            
            return !ruleExcludedHidden && clickRelatedCates;      
          })
          .style("display", "block"); 


        } else {
          ribbon.filter(function(d){
            var ruleExcludedHidden = d3.select(this).classed("ruleNotRelatedCateHidden");            
            var highlighted = d3.select(this).classed("highlight");
            return !ruleExcludedHidden && highlighted;            
          })
          .style("display", "block"); 


          g.selectAll('.category').filter(function(d){ return d.name != parsets.classDimension().name}).style("display", "none"); 
          g.selectAll('.category').filter(function(d){
            var ruleExcludedHidden = d3.select(this).classed("ruleNotRelatedCateHidden");  
            var clickRelatedCates = d3.select(this).classed("relatedHighlight");           
            
            return !ruleExcludedHidden && clickRelatedCates;      
          })
          .style("display", "block"); 

        }


        

      }
      

    }

    
    parsets.onlyDisplay = function(onlyTheseDimensions){

      var newDimensions = [];

      for(var i = 0; i < onlyTheseDimensions.length; i++){
        var d = dimensions.find(function(d){ return d.name == onlyTheseDimensions[i]});
        newDimensions.push(d);
      }      

      

      nodes = layout(tree = buildTree({children: {}, count: 0}, parData, onlyTheseDimensions, value_), newDimensions, ordinal);
      //nodes = layout(tree, newDimensions, ordinal);


      nodes.forEach(function(d) {
            d.source.x0 = d.source.x;
            d.target.x0 = d.target.x;
          })

      nodes.forEach(function(d){
        d.distance = clutterMetric(d);
      })
          

      total = getTotal(newDimensions);
      newDimensions.forEach(function(d) {
        d.count = total;
      });
      var dimension = g.selectAll("g.dimension");
      dimension = dimension.data(newDimensions, dimensionName);


       
      var dEnter = dimension.enter().append("g")
              .attr("class", "dimension")
              .attr("transform", function(d) { return "translate(0," + d.y + ")"; })
              .on("mousedown.parsets", cancelEvent);
      dimension.each(function(d) {
            d.y0 = d.y;
            d.categories.forEach(function(d) { d.x0 = d.x; });
          });
      dEnter.append("rect")
          .attr("width", width)
          .attr("y", -45)
          .attr("height", 45);
      var textEnter = dEnter.append("text")
          .attr("class", "dimension")
          .attr("transform", "translate(0,-20)");
      textEnter.append("tspan")
          .attr("class", "name")
          .text(dimensionFormatName);

      dragDimensionFunc = d3.behavior.drag()
                .origin(identity)
                .on("dragstart", function(d) {
                  dragging = true;
                  d.y0 = d.y;
                })
                .on("drag", function(d) {
                  d.y0 = d.y = d3.event.y;
                  for (var i = 1; i < newDimensions.length; i++) {
                    if (height * newDimensions[i].y < height * newDimensions[i - 1].y) {
                      newDimensions.sort(compareY);
                      dimensionNames = newDimensions.map(dimensionName);
                      ordinal.domain([]).range(d3.range(parsets.classDimension().categories.length));
                      nodes = layout(tree = buildTree({children: {}, count: 0}, parData, dimensionNames, value_), newDimensions, ordinal);
                      total = getTotal(newDimensions);
                      g.selectAll(".ribbon, .ribbon-mouse").selectAll("path").remove();
                      parsets.updateRibbons();
                      updateCategories(dimension);
                      dimension.transition().duration(duration)
                          .attr("transform", translateY)
                          .tween("ribbon", ribbonTweenY);
                      event.sortDimensions();
                      break;
                    }
                  }
                  d3.select(this)
                      .attr("transform", "translate(0," + d.y + ")")
                      .transition();
                  ribbon.filter(function(r) { return r.source.dimension === d || r.target.dimension === d; })
                      .attr("d", ribbonPath);
                  parsets.updateRuleCategoryClass();
          
                })
                .on("dragend", function(d) {
                  dragging = false;
                  //parsets.unhighlight();
                  var y0 = 45,
                      dy = (height - y0 - 2) / (newDimensions.length - 1);

                  dimensionDistance = dy;

                  newDimensions.forEach(function(d, i) {
                    d.y = y0 + i * dy;
                  });
                  transition(d3.select(this))
                      .attr("transform", "translate(0," + d.y + ")")
                      .tween("ribbon", ribbonTweenY);
                  // for quick test, may go to main.js
                  d3.select('#clutterMetricSpan').html(parsets.clutterMeasure());
                  parsets.updateRuleCategoryClass();
           

                });

      dimensionsEle = dimension;

      dimension.call(dragDimensionFunc);

      dimension.transition().duration(duration)
              .attr("transform", function(d) { return "translate(0," + d.y + ")"; })
              .tween("ribbon", ribbonTweenY);
          
      dimension.exit().remove();

      updateCategories(dimension);
      parsets.updateRibbons();


      currentDimensions = newDimensions.slice(0);


      parsets.updateRuleCategoryClass();


    }

    // and keep highlights
    // 
    parsets.displayRawData = function(newDimensions){
      dimensionNames = newDimensions;
      var  cache = {};
          dimension.each(function(d) { cache[d.name] = d; });
          dimensionNames.forEach(function(d) {
            if (!cache.hasOwnProperty(d)) {
              cache[d] = {name: d, categories: []};
            }
            dimensions.push(cache[d]);
          });
      parsets.onlyDisplay(newDimensions);

    }
    //parsets.orderDimension
    // parsets.orderDimension([{"name":"Survived","categories":[{"name":"Yes"},{"name":"No"}]},{"name":"Age","categories":[{"name":"Child"},{"name":"Adult"}]},{"name":"Sex","categories":[{"name":"Female"},{"name":"Male"}]}, {"name":"Class","categories":[{"name":"1st"},{"name":"Crew"},{"name":"2nd"},{"name":"3rd"}]}])
    parsets.orderDimension = function(onlyThese, dimcates) {
      var idxHashDimension = {}; 
      onlyThese.forEach(function(d){        
        idxHashDimension[d.name] = {'dim': d.idx, 'categories': {}}
        if(d.hasOwnProperty('categories')){
          d.categories.forEach(function(c){            
            idxHashDimension[d.name]['categories'][c.name] = c.idx;
          })
        }

      })

      currentDimensions = [];

      for(var i = 0; i < onlyThese.length; i++){
        var d = dimensions.find(function(d){ return d.name == onlyThese[i].name});
        if(d) {
          currentDimensions.push(d);
        }
        
      } 

      currentDimensions.forEach(function(d){
        if(idxHashDimension.hasOwnProperty(d.name)){
          d.idx = idxHashDimension[d.name]['dim'];
          d.categories.forEach(function(c){
            if(idxHashDimension[d.name]['categories'].hasOwnProperty(c.name)){
              c.idx = idxHashDimension[d.name]['categories'][c.name];
            }            
          })
        } else{
          d.idx = 100;
          d.categories.forEach(function(c){
            c.idx = 100;
          })
        }
        
      })

      currentDimensions.sort(sortbyIdx);
      currentDimensions.forEach(function(d){
        d.categories.sort(sortbyIdx);        
      })

      dimensionNames = currentDimensions.map(dimensionName);

      nodes = layout(tree = buildTree({children: {}, count: 0}, parData, dimensionNames, value_), currentDimensions, ordinal);

      nodes.forEach(function(d) {
            d.source.x0 = d.source.x;
            d.target.x0 = d.target.x;
          })

      nodes.forEach(function(d){
        d.distance = clutterMetric(d);
      })
      total = getTotal(currentDimensions);
      currentDimensions.forEach(function(d) {
        d.count = total;
      });


     var dimension = g.selectAll("g.dimension");
      dimension = dimension.data(currentDimensions, dimensionName);


       
      var dEnter = dimension.enter().append("g")
              .attr("class", "dimension")
              .attr("transform", function(d) { return "translate(0," + d.y + ")"; })
              .on("mousedown.parsets", cancelEvent);
      dimension.each(function(d) {
            d.y0 = d.y;
            d.categories.forEach(function(d) { d.x0 = d.x; });
          });
      dEnter.append("rect")
          .attr("width", width)
          .attr("y", -45)
          .attr("height", 45);
      var textEnter = dEnter.append("text")
          .attr("class", "dimension")
          .attr("transform", "translate(0,-20)");
      textEnter.append("tspan")
          .attr("class", "name")
          .text(dimensionFormatName);

      dragDimensionFunc = d3.behavior.drag()
                .origin(identity)
                .on("dragstart", function(d) {
                  dragging = true;
                  d.y0 = d.y;
                })
                .on("drag", function(d) {
                  d.y0 = d.y = d3.event.y;
                  for (var i = 1; i < currentDimensions.length; i++) {
                    if (height * currentDimensions[i].y < height * currentDimensions[i - 1].y) {
                      currentDimensions.sort(compareY);
                      dimensionNames = currentDimensions.map(dimensionName);
                      ordinal.domain([]).range(d3.range(parsets.classDimension().categories.length));
                      nodes = layout(tree = buildTree({children: {}, count: 0}, parData, dimensionNames, value_), currentDimensions, ordinal);
                      total = getTotal(currentDimensions);
                      g.selectAll(".ribbon, .ribbon-mouse").selectAll("path").remove();
                      parsets.updateRibbons();
                      updateCategories(dimension);
                      dimension.transition().duration(duration)
                          .attr("transform", translateY)
                          .tween("ribbon", ribbonTweenY);
                      event.sortDimensions();
                      break;
                    }
                  }
                  d3.select(this)
                      .attr("transform", "translate(0," + d.y + ")")
                      .transition();
                  ribbon.filter(function(r) { return r.source.dimension === d || r.target.dimension === d; })
                      .attr("d", ribbonPath);
                  parsets.updateRuleCategoryClass();
                })
                .on("dragend", function(d) {
                  dragging = false;
                  //parsets.unhighlight();
                  var y0 = 45,
                      dy = (height - y0 - 2) / (currentDimensions.length - 1);

                  dimensionDistance = dy;

                  currentDimensions.forEach(function(d, i) {
                    d.y = y0 + i * dy;
                  });
                  transition(d3.select(this))
                      .attr("transform", "translate(0," + d.y + ")")
                      .tween("ribbon", ribbonTweenY);

                  // for quick test, may go to main.js
                  d3.select('#clutterMetricSpan').html(parsets.clutterMeasure());

                  parsets.updateRuleCategoryClass();           
                });

      dimensionsEle = dimension;

      dimension.call(dragDimensionFunc);

      dimension.transition().duration(duration)
              .attr("transform", function(d) { return "translate(0," + d.y + ")"; })
              .tween("ribbon", ribbonTweenY);
          
      dimension.exit().remove();


      g.selectAll(".ribbon, .ribbon-mouse").selectAll("path").remove();
      updateCategories(dimension);
      parsets.updateRibbons();
      sortCategories(g.selectAll("g.dimension"));

      parsets.updateRuleCategoryClass(dimcates);

      //updateCategories(dimension);
      //parsets.updateRibbons();

      /*
      
      // new ribbons might be generated, cant use sortRibbons
      parsets.updateRibbons();
      sortCategories(g.selectAll("g.dimension"));

      parsets.updateRuleCategoryClass(dimcates);
      
      */

      
      /*
      g.selectAll("g.dimension")
        .attr("transform", function(d) { return "translate(0," + d.y + ")"; })

      g.selectAll("g.dimension").each(function(d) {
        d.y0 = d.y;
        d.categories.forEach(function(d) { d.x0 = d.x; });
      });

 
      var category = g.selectAll("g.category")
      category.select(".category")
        .attr("transform", function(d) { return "translate(" + d.x + ")"; });
      */       
      

    }

    parsets.hideRibbons = function(dim, category) {
      g.selectAll(".ribbon, .ribbon-mouse").selectAll("path").classed('hide', false);
      g.selectAll("g.dimension").classed('hide', false);
      g.selectAll('.category').classed('hide', false);

      if(!category) {
        g.selectAll(".ribbon, .ribbon-mouse").selectAll("path").filter(function(d){ return d.source.dimension.name == dim || d.target.dimension.name == dim }).classed('hide', true);
        
      } else {
        g.selectAll(".ribbon, .ribbon-mouse").selectAll("path").filter(function(d){ return (d.source.dimension.name == dim && d.source.node.name == category) || (d.target.dimension.name == dim && d.target.node.name == category) }).classed('hide', true)
        g.selectAll('.category').filter(function(d){ return d.dimension.name == dim && d.name == category}).classed('hide', true);
      }
      
    }

    parsets.unhideRibbons = function() {
      g.selectAll(".ribbon, .ribbon-mouse").selectAll("path").classed('hide', false);
      g.selectAll("g.dimension").classed('hide', false);
      g.selectAll('.category').classed('hide', false);
      
      
    }

 
    // update class to d
    parsets.updateRuleCategoryClass = function(ruleDimCatesDict) {     

      if(ruleDimCatesDict) ruleRelatedDimCates = ruleDimCatesDict; 
      
      var ruleDimCates = ruleRelatedDimCates;

      
      g.selectAll(".ribbon, .ribbon-mouse").selectAll("path").each(function(d){
        if(d.dimension == parsets.classDimension().name) { d.ruleRelatedCate = true; return; };

        d.ruleRelatedCate = false;
        if(d.source.dimension.name in ruleDimCates){
          var ruleCates = ruleDimCates[d.source.dimension.name];
          if(ruleCates.indexOf(d.source.node.name) != -1){
            d.ruleRelatedCate = true;
          } 
        }

        if(d.target.dimension.name in ruleDimCates){
          var ruleCates_t = ruleDimCates[d.target.dimension.name];
          if(ruleCates_t.indexOf(d.target.node.name) != -1){
            d.ruleRelatedCate = true;
          } 
        }

      });
      

      g.selectAll('.category').each(function(d){
        if(d.dimension.name == parsets.classDimension().name) { d.ruleRelatedCate = true; return; }

        d.ruleRelatedCate = false;
        
        if(d.dimension.name in ruleDimCates){
          var ruleCates = ruleDimCates[d.dimension.name];
           if(ruleCates.indexOf(d.name) != -1){
            d.ruleRelatedCate = true;
          }
        } 
      }) 


      // g.selectAll('.ribbon, .ribbon-mouse').selectAll("path").classed('ruleNotRelatedCateHidden', false);
          g.selectAll('.ribbon, .ribbon-mouse').selectAll("path").style('fill-opacity', null);
      g.selectAll('.ribbon, .ribbon-mouse').selectAll("path").filter(function(d){         
        return d.dimension != parsets.classDimension().name && !d.source.node.ruleRelatedCate || !d.target.node.ruleRelatedCate
      }).each(function(d){
        if(ruleUnrelatedCateIsShown){
          // d3.select(this).classed('ruleNotRelatedCateHidden', false);
          d3.select(this).style('fill-opacity', null);

          
        } else {
          // d3.select(this).classed('ruleNotRelatedCateHidden', true);
          d3.select(this).style('fill-opacity', 0.1);
        }
      })

      // g.selectAll('.category').classed('ruleNotRelatedCateHidden', false);
        g.selectAll('.category').style('fill-opacity', null)

      g.selectAll('.category').filter(function(d){ 
        return !d.ruleRelatedCate && d.dimension.name != parsets.classDimension().name 
      }).each(function(d){
        if(ruleUnrelatedCateIsShown){
          // d3.select(this).classed('ruleNotRelatedCateHidden', false);
          d3.select(this).style('fill-opacity', null);

        } else {
          // d3.select(this).classed('ruleNotRelatedCateHidden', true);
          d3.select(this).style('fill-opacity', 0.1);
        }
      })

    }

    parsets.dimensionFormat = function(_) {
      if (!arguments.length) return dimensionFormat;
      dimensionFormat = _;
      return parsets;
    };

    parsets.dimensionNames = function(_) {
      if (!arguments.length) return dimensions_;
      dimensions_ = d3.functor(_);
      return parsets;
    };

    parsets.dimensions = function() {
      return dimensions;
    };

    parsets.getCurrentDimensions = function() {
      return currentDimensions;
    }

    parsets.classDimension = function(_) {
      if (!arguments.length) return dimensions.find(function(d){ return d.name == classDimension});
      classDimension = _;
      return parsets;
    };

    
    parsets.getNodes = function() {
      if (!arguments.length) return nodes;
    };

    parsets.yesLabelGoesFirst = function(_) {
      if (!arguments.length) return yesLabelGoesFirst;
      yesLabelGoesFirst = _;
      return parsets;
    }

    parsets.value = function(_) {
      if (!arguments.length) return value_;
      value_ = d3.functor(_);
      return parsets;
    };

    parsets.width = function(_) {
      if (!arguments.length) return width;
      width = +_;
      return parsets;
    };

    parsets.height = function(_) {
      if (!arguments.length) return height;
      height = +_;
      return parsets;
    };

    parsets.resize = function(w, h) {

      width = +w;
      height = +h;
      
      g.selectAll("g.dimension").select("rect")
        .attr("width", width);

      nodes = layout(tree, dimensions, ordinal);
      updateCategories(g.selectAll("g.dimension"));
      parsets.updateRibbons();

      d3.select('#clutterMetricSpan').html(parsets.clutterMeasure());   

      //g.selectAll(".ribbon, .ribbon-mouse").selectAll("path").remove();
 
    

    }

    parsets.clutterMeasure = function(){
      var node2Cal = [];

      if(ruleUnrelatedCateIsShown) {
         g.selectAll('.ribbon').selectAll("path")
          .each(function(d){ 
            
            node2Cal.push(d);
          })


      } else {
        g.selectAll('.ribbon').selectAll("path")
          .each(function(d){ 
            if(d.source.node.ruleRelatedCate && d.target.node.ruleRelatedCate){
              node2Cal.push(d);
            } 
      })

      }

     


     
      var minSumDimDistance = dimensionDistance * node2Cal.length,        
          maxSumDimDistance = Math.sqrt(dimensionDistance * dimensionDistance + width * width) * node2Cal.length;
      var clutterSumDistance = node2Cal.map(function(d){ return d.distance}).reduce(function(a, b){ return a + b }, 0);
      var decimal = (clutterSumDistance - minSumDimDistance) / (maxSumDimDistance - minSumDimDistance) * 100;
      return decimal.toFixed(2) + '%';

    }

    parsets.getParData = function() {
      return parData;
    }

    parsets.getOriginalDimensionNames = function(){
      return oriDimensionNames;
    }



    parsets.unhighlightActive = function(){
      if (dragging) return;
      ribbon.classed("active", false);
      hideTooltip();
    }

    parsets.highlightCates = function(){
      return highlightCates;
    }

    parsets.spacing = function(_) {
      if (!arguments.length) return spacing;
      spacing = +_;
      return parsets;
    };

    parsets.tension = function(_) {
      if (!arguments.length) return tension;
      tension = +_;
      return parsets;
    };

    parsets.duration = function(_) {
      if (!arguments.length) return duration;
      duration = +_;
      return parsets;
    };


    parsets.tooltip = function(_) {
      if (!arguments.length) return tooltip;
      tooltip_ = _ == null ? defaultTooltip : _;
      return parsets;
    };

    parsets.categoryTooltip = function(_) {
      if (!arguments.length) return categoryTooltip;
      categoryTooltip = _ == null ? defaultCategoryTooltip : _;
      return parsets;
    };

    var body = d3.select("body");
    var tooltip = body.append("div")
        .style("display", "none")
        .attr("class", "parsets tooltip");

    return d3.rebind(parsets, event, "on").value(1).width(960).height(600);

    function dimensionFormatName(d, i) {
      return dimensionFormat.call(this, d.name, i);
    }

    function showTooltip(html) {
      var m = d3.mouse(body.node());
      tooltip
          .style("display", null)
          .style("left", m[0] + 30 + "px")
          .style("top", m[1] - 20 + "px")
          .html(html);
    }

    function hideTooltip() {
      tooltip.style("display", "none");
    }

    function transition(g) {
      return duration ? g.transition().duration(duration).ease(parsetsEase) : g;
    }

    function layout(tree, dimensions, ordinal) {
      var nodes = [],
          nd = dimensions.length,
          y0 = 45,
          dy = (height - y0 - 2) / (nd - 1);

      dimensionDistance = dy;

      dimensions.forEach(function(d, i) {
        if(d){
          d.idx = i;
          d.categories.forEach(function(c, i) {
            c.idx = c.idx || i;

            c.dimension = d;
            c.count = 0;
            c.nodes = [];
          });
          d.y = y0 + i * dy;
        }
      });

      // Compute per-category counts.
      var total = (function rollup(d, i) {
        if (!d.children) return d.count;
        var dim = dimensions[i],
            total = 0;
        dim.categories.forEach(function(c) {
          var child = d.children[c.name];
          if (!child) return;
          c.nodes.push(child);
          var count = rollup(child, i + 1);
          c.count += count;
          total += count;
        });
        return total;
      })(tree, 0);

      // Stack the counts.
      dimensions.forEach(function(d) {
        d.categories = d.categories.filter(function(d) { return d.count; });
        var x = 0,
            p = spacing / (d.categories.length - 1);
  
        d.categories.forEach(function(c) {
          c.x = x;
          c.dx = c.count / total * (width - spacing);      
          
          c.in = {dx: 0};
          c.out = {dx: 0};
          x += c.dx + p;
        });
      });

      var dim = parsets.classDimension();
      dim.categories.forEach(function(c) {
        var k = c.name;      
        if (tree.children.hasOwnProperty(k)) {
          ordinal(k);
          //recurse(c, {node: tree.children[k], path: k}, 1, ordinal(k));
          recurse(c, {node: tree.children[k], path: k, fullPath: [{'k':c.dimension.name, 'v':k}]}, 1, k);
        }
      });

      function recurse(p, d, depth, label) {
        var node = d.node,
            dimension = dimensions[depth];
        
        dimension.categories.forEach(function(c) {         

          var k = c.name;
          if (!node.children.hasOwnProperty(k)) return;
          var child = node.children[k];
          child.path = d.path + "\0" + k;
          //child.path = d.path + "\0" + c.idx+'_'+k;
          
          var newFullPath = d.fullPath.slice(0);
          newFullPath.push({k:c.dimension.name, v:k});
          child.fullPath = newFullPath;
          var target = child.target || {node: c, dimension: dimension};
          target.x = c.in.dx;
          target.dx = child.count / total * (width - spacing);
 
          c.in.dx += target.dx;
          var source = child.source || {node: p, dimension: dimensions[depth - 1]};
          source.x = p.out.dx;
          source.dx = target.dx;
          p.out.dx += source.dx;

          child.node = child;
          child.source = source;
          child.target = target;
          child.label = label;
          

          nodes.push(child);
          if (depth + 1 < dimensions.length) recurse(c, child, depth + 1, label);
        });
      }
      return nodes;
    }

    function updateCategories(g) {
      var category = g.selectAll("g.category")
          .data(function(d) { return d.categories; }, function(d) { return d.name; });
      var categoryEnter = category.enter().append("g")
          .attr("class", "category")
          .attr("transform", function(d) { return "translate(" + d.x + ")"; });
      category.exit().remove();
      category
          .on("mousemove.parsets", function(d) {

            ribbon.classed("active", false);
            if (dragging) return;
            d.nodes.forEach(function(d) { parsets.highlightMousemove(d); });
            showTooltip(categoryTooltip.call(this, d));
            d3.event.stopPropagation();
          })
          .on("mouseout.parsets", parsets.unHighlightMousemove)
          .on("mousedown.parsets", cancelEvent)
          .on("click", event.categoryClick)
          .call(d3.behavior.drag()
            .origin(identity)
            .on("dragstart", function(d) {
              dragging = true;
              d.x0 = d.x;
            })
            .on("drag", function(d) {
              d.x = d3.event.x;
              var categories = d.dimension.categories;
              for (var i = 0, c = categories[0]; ++i < categories.length;) {
                if (c.x + c.dx / 2 > (c = categories[i]).x + c.dx / 2) {
                  categories.sort(function(a, b) { return a.x + a.dx / 2 - b.x - b.dx / 2; });
                  nodes = layout(tree, dimensions, ordinal);
                  parsets.updateRibbons();
                  updateCategories(g);
                  parsets.highlightMousemove(d.node);
                  event.sortCategories();
                  break;
                }
              }
              var x = 0,
                  p = spacing / (categories.length - 1);
    
              categories.forEach(function(e) {
                if (d === e) e.x0 = d3.event.x;
                e.x = x;
                x += e.count / total * (width - spacing) + p;
              });
              d3.select(this)
                  .attr("transform", function(d) { return "translate(" + d.x0 + ")"; })
                  .transition();
              ribbon.filter(function(r) { return r.source.node === d || r.target.node === d; })
                  .attr("d", ribbonPath);
              parsets.updateRuleCategoryClass();
            })
            .on("dragend", function(d) {
              dragging = false;
              parsets.unHighlightMousemove();
              parsets.updateRibbons();
              transition(d3.select(this))
                  .attr("transform", "translate(" + d.x + ")")
                  .tween("ribbon", ribbonTweenX);

              d3.select('#clutterMetricSpan').html(parsets.clutterMeasure());
              parsets.updateRuleCategoryClass();
            }));
      category.transition().duration(duration)
          .attr("transform", function(d) { return "translate(" + d.x + ")"; })
          .tween("ribbon", ribbonTweenX);

      categoryEnter.append("rect")
          .attr("width", function(d) { return d.dx; })
          .attr("y", -20)
          .attr("height", 20)
          .attr("class", function(d) {
            //return "category-" + (d.dimension === parsets.classDimension() ? ordinal(d.name) : "background");
            return "category-background";
          });
      categoryEnter.append("line")
          .style("stroke-width", 2);
      categoryEnter.append("text")
          .attr("dy", "-.3em");
      category.select("rect")
          .attr("width", function(d) { return d.dx; })
          
      category.select("line")
          .attr("x2", function(d) { return d.dx; });
      category.select("text")
          //.text(truncateText(function(d) { return d.name; }, function(d) { return d.dx; }));
          .text(function(d) { return d.name; }, function(d) { return d.dx; });
    }

    function sortCategories() {
      //var category = g.selectAll("g.category");

      var category = g.selectAll("g.category")
          //.data(function(d) { return d.categories; }, function(d) { return d.name; });

      category.transition().duration(duration)
          .attr("transform", function(d) { return "translate(" + d.x + ")"; })
          .tween("ribbon", ribbonTweenX);

      
      category.select("rect")
          .attr("width", function(d) { return d.dx; })
          .attr("class", function(d) {
            //return "category-" + (d.dimension === parsets.classDimension() ? ordinal(d.name) : "background");
            return "category-background";
          });
      category.select("line")
          .attr("x2", function(d) { return d.dx; });
      category.select("text")
          //.text(truncateText(function(d) { return d.name; }, function(d) { return d.dx; }));
          .text(function(d) { return d.name; }, function(d) { return d.dx; });
    }

    // Animates the y-coordinates only of the relevant ribbon paths.
    function ribbonTweenY(d) {
      var r = ribbon.filter(function(r) { return r.source.dimension.name == d.name || r.target.dimension.name == d.name; }),
          i = d3.interpolateNumber(d.y0, d.y);
      return function(t) {
        d.y0 = i(t);
        r.each(function(d){ d.distance = clutterMetric(d) })
        r.attr("d", ribbonPath);
      };
    }

    // Animates the x-coordinates only of the relevant ribbon paths.
    function ribbonTweenX(d) {
      var nodes = [d],
          r = ribbon.filter(function(r) {
            var s, t;
            if (r.source.node === d) nodes.push(s = r.source);
            if (r.target.node === d) nodes.push(t = r.target);
            return s || t;
          }),
          i = nodes.map(function(d) { return d3.interpolateNumber(d.x0, d.x); }),
          n = nodes.length;
      return function(t) {
        for (var j = 0; j < n; j++) nodes[j].x0 = i[j](t);
        r.each(function(d){ d.distance = clutterMetric(d) })
        r.attr("d", ribbonPath);
      };
    }

    // Dynamic path string for transitions.
    function ribbonPath(d) {
      var s = d.source,
          t = d.target;
      return ribbonPathString(s.node.x0 + s.x0, s.dimension.y0, s.dx, t.node.x0 + t.x0, t.dimension.y0, t.dx, tension0);
    }

    function clutterMetric(d){
      var s = d.source,
          t = d.target;
      var sx = s.node.x + s.x, 
          sy = s.dimension.y, 
          tx = t.node.x + t.x, 
          ty = t.dimension.y;

      var dist = Math.sqrt((tx-sx)*(tx-sx)+(ty-sy)*(ty-sy)); 
      //d.distance = dist;
      return dist;


    }
    // Static path string for mouse handlers.
    function ribbonPathStatic(d) {
      var s = d.source,
          t = d.target;
      return ribbonPathString(s.node.x + s.x, s.dimension.y, s.dx, t.node.x + t.x, t.dimension.y, t.dx, tension);
    }

    function ribbonPathString(sx, sy, sdx, tx, ty, tdx, tension) {
      var m0, m1;
      return (tension === 1 ? [
          "M", [sx, sy],
          "L", [tx, ty],
          "h", tdx,
          "L", [sx + sdx, sy],
          "Z"]
       : ["M", [sx, sy],
          "C", [sx, m0 = tension * sy + (1 - tension) * ty], " ",
               [tx, m1 = tension * ty + (1 - tension) * sy], " ", [tx, ty],
          "h", tdx,
          "C", [tx + tdx, m1], " ", [sx + sdx, m0], " ", [sx + sdx, sy],
          "Z"]).join("");
    }

    function compareY(a, b) {
      a = height * a.y, b = height * b.y;
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : a <= a ? -1 : b <= b ? 1 : NaN;
    }

  };
  d3.parsets.tree = buildTree;

  function autoDimensions(d) {
    
    return d.length ? d3.keys(d[0]).sort() : [];

  }

  function cancelEvent() {
    d3.event.stopPropagation();
    d3.event.preventDefault();
  }

  function dimensionName(d) { return d.name; }

  function getTotal(dimensions) {
    return parsets.classDimension().categories.reduce(function(a, d) {
      return a + d.count;
    }, 0);
  }



  // Given a text function and width function, truncates the text if necessary to
  // fit within the given width.
  function truncateText(text, width) {
    return function(d, i) {
      var t = this.textContent = text(d, i),
          w = width(d, i);
      if (this.getComputedTextLength() < w) return t;
      this.textContent = "…" + t;
      var lo = 0,
          hi = t.length + 1,
          x;
      while (lo < hi) {
        var mid = lo + hi >> 1;
        if ((x = this.getSubStringLength(0, mid)) < w) lo = mid + 1;
        else hi = mid;
      }
      return lo > 1 ? t.substr(0, lo - 2) + "…" : "";
    };
  }

  var percent = d3.format("%"),
      comma = d3.format(",f"),
      parsetsEase = "elastic",
      parsetsId = 0;

  // Construct tree of all category counts for a given ordered list of
  // dimensions.  Similar to d3.nest, except we also set the parent.
  function buildTree(root, data, dimensions, value) {
    zeroCounts(root);
    var n = data.length,
        nd = dimensions.length;
    for (var i = 0; i < n; i++) {
      var d = data[i],
          v = +value(d, i),
          node = root;
      for (var j = 0; j < nd; j++) {
        var dimension = dimensions[j],
            category = d[dimension],
            children = node.children;
        node.count += v;
        node = children.hasOwnProperty(category) ? children[category]
            : children[category] = {
              children: j === nd - 1 ? null : {},
              count: 0,
              parent: node,
              dimension: dimension,
              name: category
            };
      }
      node.count += v;
    }
    return root;
  }

  function zeroCounts(d) {
    d.count = 0;
    if (d.children) {
      for (var k in d.children) zeroCounts(d.children[k]);
    }
  }

  function identity(d) { return d; }

  function translateY(d) { return "translate(0," + d.y + ")"; }

  function defaultTooltip(d) {
    var lab = d.label;
    
    var count = d.count,
        path = [];

    // if(ruleUnrelatedCateIsShown){
    //   while (d.parent) {
    //     if (d.name) path.unshift(d.name);
    //     d = d.parent;
    //   }
    // } else {
    //   while (d.parent && d.hasOwnProperty('source') && d.source.node.ruleRelatedCate && d.target.node.ruleRelatedCate) {
    //     if (d.name) path.unshift(d.name);
    //     d = d.parent;
    //   }
    // }

     while (d.parent && d.hasOwnProperty('source') ) {
        if (d.name) path.unshift(d.name);
        d = d.parent;
      }

    
    return lab + ':<br>' + path.join(" → ") + "<br>" + comma(count) + " (" + percent(count / d.count) + ")";
  }

  function defaultCategoryTooltip(d) {
    return d.name + "<br>" + comma(d.count) + " (" + percent(d.count / d.dimension.count) + ")";
  }

})();
