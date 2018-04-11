// @author Chong Zhang, please contact me at chongzhang.nc@gmail.com if you have any question.

var c = function(cls){ return cls == "Yes" ? "#369036" : "#e67777"};


d3.ruleGrid = function() {

  var margin = {top: 70, right: 0, bottom: 10, left: 0},    
    outerWidth = 400,
    outerHeight = 600,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

  var svg;

  var x = d3.scale.ordinal(),
    y = d3.scale.ordinal();

  var columnNames, dimensions = [];;


  var dispatch = d3.dispatch('rowClick');
  dispatch.on('rowClick.ext');




  function exports(sel) {
    x.rangeBands([0, width]);
    y.rangeBands([0, height]);

    // [{"cls":"cls1","m":[[0.0519,2534],90.5323,1.19009],"id":1,"it":["workclass=?"]}, ...]
    sel.each(function(ruleData) {
      var rootSvg = sel.append("svg")
            .attr("width", outerWidth)
            .attr("height", outerHeight) ;
      
      var titleG = rootSvg.append('g').attr("transform", "translate(" + margin.left + "," + 20 + ")");
      var titleText = titleG
        .append('text')
        .attr('class', 'title')
        .text('Association Rule Table for Feature Selection...')

      titleG.insert('rect', 'text')//outline rectangle
        .attr("height", 16)
        .attr("width", titleText.node().getComputedTextLength())        
        .attr('y', -14)
        .style('fill', '#686868')
        

      svg = rootSvg 
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      // matrix: [[{it:[{aname,aval}, {}, ...], m, id], [], ...]
      var matrix = [];
       
      columnNames = ruleData.attributes.map(function(a, i){ return {name: a, index: i}})   

      var cache = {};

      columnNames.forEach(function(d) {
        if (!cache.hasOwnProperty(d.name)) {
          cache[d.name] = {name: d.name, index: d.index, categories: [] };
        }
        dimensions.push(cache[d.name]);
      });

      // {name: Class, categories: [{name: 2nd, rules: {yes: [], no: []}}]}
      for(var i = 0; i < ruleData.data.length; i++) {
        var ro = ruleData.data[i];
        var its = ro.it;

        for(var j = 0; j < its.length; j++){
          var it = its[j];
          var dimNameCate = it.split('='),
              dimName = dimNameCate[0],
              cateName = dimNameCate[1];
          var dimObj = null;
          for(var k = 0; k < dimensions.length; k++){
            if(dimensions[k].name == dimName)  {
              dimObj = dimensions[k];
              break;
            }
          }
          if(dimObj) {
            var cates = dimObj.categories;
            var cate = null;
            for(var k = 0; k < cates.length; k++){
              if(cates[k].name == cateName){
                cate = cates[k];
                break;
              }
            }
            if(cate){
              if(cate.rules.hasOwnProperty(ro.cls)){
                cate.rules[ro.cls].push(ro);
              } else {
                cate.rules[ro.cls] = [ro];
              }
            } else {
              var arule = {};
              arule[ro.cls] = [ro];
              cates.push({name: cateName, rules: arule});
            }
          }
        }        

      }

      dimensions.forEach(function(d){
        var ruleCount = 0;
        d.categories.forEach(function(c){
          for(var l in c.rules){
            ruleCount += c.rules[l].length;
          }
          
        })
        d.ruleCount = ruleCount;

      })
      
      var attrMap = {};
      columnNames.forEach(function(a) {
        attrMap[a.name] = a.index;
      })

            
      ruleData.data.forEach(function(r, i) {        
        // z is used to determine if the attribute hits the rule
        matrix[i] = columnNames.map(function(a) { return {x: a.index, y: r.id, z: 0}; });       
      });


      ruleData.data.forEach(function(r, i) {
        var tmpObj = {cls: r.cls, id: r.id, m: r.m, it: r.it.map(function(s) {var nv = s.split('='); return {aname: nv[0], aval: nv[1]}})}
        tmpObj.it.forEach(function(s, j) {
          matrix[i][attrMap[s.aname]].z = 1;  
          matrix[i][attrMap[s.aname]].itname = s.aname;
          matrix[i][attrMap[s.aname]].itval = s.aval;
          matrix[i][attrMap[s.aname]].rule = tmpObj;
        })
        
      })


      // Precompute the orders.
      var orders = {
        index: columnNames.sort(function(a, b) { return d3.ascending(a.index, b.index); }).map(function(d){ return d.index }),
        categoryCount: dimensions.sort(function(a, b) { return d3.ascending(a.categories.length, b.categories.length)}).map(function(d){ return d.index }),
        ruleCount: dimensions.sort(function(a, b) { return d3.ascending(a.ruleCount, b.ruleCount)}).map(function(d){ return d.index }),

        // sorting by itemName in class
        // first group rules based on rhs class
        // then sort by item name in an order that more occurance number goes first
        itemNameInCls: function(dimName){ 
          var rulesLabYesIds = [], rulesLabNoIds = [];
          var rulesLabYes = ruleData.data.filter(function(d){ return d.cls == 'Yes'}),
              rulesLabNo = ruleData.data.filter(function(d){ return d.cls == 'No'});
          var countOccuranceRulesLabYes = {};
          for(var i = 0; i < rulesLabYes.length; i++){
            var rit = rulesLabYes[i].it;
            for(var j = 0; j < rit.length; j++){
              var it = rit[j];
              var itAry = it.split('=');
              if(itAry[0] == dimName){
                if(countOccuranceRulesLabYes.hasOwnProperty(itAry[1])){
                  countOccuranceRulesLabYes[itAry[1]]++;
                } else {
                  countOccuranceRulesLabYes[itAry[1]] = 1;
                }
              }

            }
          }

          rulesLabYes.forEach(function(r){ 
            var rit = r.it;
            r.group = 0;
            for(var j = 0; j < rit.length; j++){
              var it = rit[j];
              var itAry = it.split('=');
              if(itAry[0] == dimName){
                r.group = countOccuranceRulesLabYes[itAry[1]];
                break;
              } 
            }            

          })

          var countOccuranceRulesLabNo = {};
          for(var i = 0; i < rulesLabNo.length; i++){
            var rit = rulesLabNo[i].it;
            for(var j = 0; j < rit.length; j++){
              var it = rit[j];
              var itAry = it.split('=');
              if(itAry[0] == dimName){
                if(countOccuranceRulesLabNo.hasOwnProperty(itAry[1])){
                  countOccuranceRulesLabNo[itAry[1]]++;
                } else {
                  countOccuranceRulesLabNo[itAry[1]] = 1;
                }
              }

            }
          }

          rulesLabNo.forEach(function(r){ 
            var rit = r.it;
            r.group = 0;
            for(var j = 0; j < rit.length; j++){
              var it = rit[j];
              var itAry = it.split('=');
              if(itAry[0] == dimName){
                r.group = countOccuranceRulesLabNo[itAry[1]];
                break;
              } 
            }            

          })

          return rulesLabYes.sort(function(a, b) { return d3.descending(a.group, b.group)})
            .concat(rulesLabNo.sort(function(a, b) { return d3.descending(a.group, b.group)}) )
            .map(function(d){ return d.id })
        },

        ruleSuppInCls: ruleData.data.filter(function(d){ return d.cls == 'Yes'}).sort(function(a, b) { return d3.descending(a.m[0], b.m[0])}).concat(ruleData.data.filter(function(d){ return d.cls == 'No'}).sort(function(a, b) { return d3.descending(a.m[0], b.m[0])}) ).map(function(d){ return d.id }),
        
        ruleConfInCls: ruleData.data.filter(function(d){ return d.cls == 'Yes'}).sort(function(a, b) { return d3.descending(a.m[1], b.m[1])}).concat(ruleData.data.filter(function(d){ return d.cls == 'No'}).sort(function(a, b) { return d3.descending(a.m[1], b.m[1])}) ).map(function(d){ return d.id })
      };

      // The default sort order.
      x.domain(orders.index);
      y.domain(orders.ruleConfInCls);

      svg.append("rect")
          .attr("class", "background")
          .attr("width", width)
          .attr("height", height);

      var sortingMenu = svg.append('g')
        .attr('class', 'sortmenu')
        .attr("transform", "translate(0, -24)")


      var sortingDim = sortingMenu.append("text")
        .attr("x", 2)
       

      sortingDim.append("tspan")
        .attr("class", "sort categoryNum")
        .text("←Category") //→, », ←


        .on("mousedown.parsets", cancelEvent);
      sortingDim.append("tspan")
        .attr("class", "sort rulesNum")
        .attr("dx", ".5em")   
        //.attr('x', function(d){ return -x(d.index) })
        .text("←Rules")
        .on("mousedown.parsets", cancelEvent);

      var sortingRules = sortingMenu.append("text")
        .attr("x", width)
        .style('text-anchor', 'end')
     

      sortingRules.append("tspan")
        .attr("class", "sort support")
        .text("Support↓")
   
        .on("mousedown.parsets", cancelEvent);
      sortingRules.append("tspan")
        .attr("class", "sort confidence")
        .attr("dx", ".5em")   
        //.attr('x', function(d){ return -x(d.index) })
        .text("Confidence↓")
        .on("mousedown.parsets", cancelEvent);

      function cancelEvent() {
        d3.event.stopPropagation();
        d3.event.preventDefault();
      }

    
      sortingRules.select("tspan.sort.support")
        .on("click.rules", function(d){ 
          sortRows(d.name, "supp");
        });
      sortingRules.select("tspan.sort.confidence")
        .on("click.rules", function(d){ 
          sortRows(d.name, "conf");   

        });

      sortingDim.select("tspan.sort.categoryNum")
        .on("click.dimension", function(d){ 
          x.domain(orders.categoryCount); 
          sortColumns();        
        });
      sortingDim.select("tspan.sort.rulesNum")
        .on("click.dimension", function(d){ 
          x.domain(orders.ruleCount); 
          sortColumns();           
        });


      var row = svg.selectAll(".row")
          .data(matrix)
        .enter().append("g")
          .attr("class", "row")
          .attr("transform", function(d) { return "translate(0," + y(d.filter(function(r){ return r.z != 0})[0].rule.id) + ")"; })
          .on('click', dispatch.rowClick)

      row.call(d3.helper.tooltip());
      
      row.append('rect')
        .attr('width', width)
        .attr("height", y.rangeBand())
        .attr('class', 'rowBg')
        .style('display', 'none')

      row.each(drawRow);

      row.append("line")
          .attr("x2", width);


      var column = svg.selectAll(".column")
          .data(columnNames)
        .enter().append("g")
          .attr("class", "column")
          
          //.on('click', columnClick);

      column.append("line")
          .attr("x1", -height)
          .attr("transform", function(d) { return "translate(" + x(d.index) + ")rotate(-90)"; })

      var textDim = column.append("text")
        .attr("class", "dimension")
        .attr("transform", function(d){ return "translate(" + (x(d.index) + x.rangeBand()/2) + ", -6)"})
        .text(function(d, i) { return columnNames[i].name; })
        .style('text-anchor', 'middle')

   
      


      

      var dragging = {};
      function cPosition(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
      }
      column
        .call(d3.behavior.drag()
        .origin(function(d){ return {x: x(d.index)}})
        .on("dragstart", function(d) {
          dragging[d.index] = x(d.index);
          d.x0 = x(d.index);
        })
        .on("drag", function(d) {
          d.x0 = d.x = d3.event.x;
          //dragging[d.index] = Math.min(width, Math.max(0, d3.event.x));
          dragging[d.index] = d3.event.x;
          columnNames.sort(function(a, b) { return cPosition(a.index) - cPosition(b.index); });
          x.domain(columnNames.map(function(d){ return d.index }));
          
          
          row.selectAll("rect." + d.name)          
            .attr("x", d3.event.x);


          row.selectAll("text." + d.name)          
            .attr("x", d3.event.x + x.rangeBand()/2);

      

          d3.select(this).select('line')   
            .attr("transform", function(d) { return "translate(" + d3.event.x + ")rotate(-90)"; });

          d3.select(this).select("text")       
            .attr("transform", function(d){ return "translate(" + (d3.event.x + x.rangeBand()/2)+ ", -6)"});
         
        })
        .on("dragend", function(d) {
          
          sortColumns();
          var newColumns = exports.columnOrder().map(function(c){ return {name: c} });
          parsets.orderDimension([{"name": "Survived"}].concat(newColumns));

        }));





      function drawRow(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function(d) { return d.z; }))
          .enter().append("rect")
            .attr("class", function(d){ return "cell " + d.itname})
            .attr("x", function(d) { return x(d.x); })
            .attr("width", x.rangeBand())
            .attr("height", y.rangeBand())            
            .style("fill", function(d) { return c(d.rule.cls); })
            //.on("click", cellClickCell)


        var label = d3.select(this).selectAll(".lab")
            .data(row.filter(function(d) { return d.z; }))
          .enter().append("text")
            .attr("class", function(d){ return "lab " + d.itname})
            .attr("x", function(d) { return x(d.x) + x.rangeBand()/2; })
            .attr("y", function(d) { return y.rangeBand()/2; })
            .attr('dy', '.5em')
            .attr('text-anchor', "middle")
            .text(function(d){ return d.itval })
            //.on("click", cellClickCell)


      }



      function sortRows(byDim, byVal) {
     
          if(byVal == 'supp'){
            y.domain(orders.ruleSuppInCls);
          } else if (byVal == 'conf') {
            y.domain(orders.ruleConfInCls);
          } else{
            y.domain(orders.itemNameInCls(byDim));
          }  

          var t = row.transition().duration(200);      

          t
            .delay(function(d) { return y(d[0].y) * 4; })
            .attr("transform", function(d) { return "translate(0," + y(d.filter(function(r){ return r.z != 0})[0].rule.id) + ")"; })      

        
        
       
      } 

      function sortColumns(){
        var t = row.transition().duration(500);

        t.selectAll(".cell")          
          .attr("x", function(d) { return x(d.x); });
       

        t.selectAll("text").attr("x", function(d) { return x(d.x) + x.rangeBand()/2; })  


        column.select('line').transition().duration(500)
   
          .attr("transform", function(d) { return "translate(" + x(d.index) + ")rotate(-90)"; });

        column.select("text").transition().duration(500)
       
          .attr("transform", function(d){ return "translate(" + (x(d.index) + x.rangeBand()/2) + ", -6)"});
    
      }

      

      // cell click allowed?
      function cellClickCell(d) {
        if(d.z == 0) return;
        var featureId = d.itname + '_' + d.itval + '-' + d.rule.cls + '_' + d.rule.id;
        if (!~scatterView.features().indexOf(featureId)) {
          scatterView.features.add(featureId);

          d3.select(this.parentNode).select('.' + d.itname).classed('cellHighlight', true);
          if(d.rule.cls == 'Yes') {
            
            scatterView.xFeatures.add(d.itname + '=' + d.itval);
            
            
          } else if(d.rule.cls == 'No'){
            
              scatterView.yFeatures.add(d.itname + '=' + d.itval);
          

          }
        } else {
          scatterView.features.remove(featureId);

          d3.select(this.parentNode).select('.' + d.itname).classed('cellHighlight', false);

          if(d.rule.cls == 'Yes') {   
            
            scatterView.xFeatures.remove(d.itname + '=' + d.itval);
            
            
          } else if(d.rule.cls == 'No'){
            
            scatterView.yFeatures.remove(d.itname + '=' + d.itval);
            
            
          }
          
        }
        

        scatterView.update();

      }

      function columnClick(d){
        svg.selectAll('.' + d.name).each(function(c){
          cellClickCell.call(this, c);
        })
      }     
    })
  } 


  exports.columnOrder = function() {
    return x.domain().map(function(i) { return columnNames.filter(function(c) { return c.index == i })[0].name; });
  }

  exports.width = function(_) {
    if(!arguments.length){
      return outerWidth;
    }
    outerWidth = _;
    width = outerWidth - margin.left - margin.right;
    
    return this;
  }

  exports.dimensions = function() {
    return dimensions;    
  }

  exports.height = function(_) {
    if(!arguments.length){
      return outerHeight;
    }
    outerHeight = _;
    height = outerHeight - margin.top - margin.bottom;
    return this;

  }


  return d3.rebind(exports, dispatch, 'on');

}
