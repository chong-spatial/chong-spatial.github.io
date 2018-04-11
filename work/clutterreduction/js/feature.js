
var c = function(cls){ return cls == "Yes" ? "#369036" : "#e67777"};

// All rights reserved
// This is part of my PhD Dissertation
// @author Chong Zhang, please contact me at chongzhang.nc@gmail.com if you have any question.

d3.ruleGrid = function() {

  var margin = {top: 20, right: 0, bottom: 10, left: 0},    
    outerWidth = 400,
    outerHeight = 600,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

  var svg, rows, columns;

  var x = d3.scale.ordinal(),
    y = d3.scale.ordinal();

  var columnNames, dimensions = [];

  var oriData, matrix;

  var minSupport, maxSupport;

  var orderFunctions, curRuleOrderField, curDimOrderField;

  var highlightedRules = [], click2Highlight = [];


  var dispatch = d3.dispatch('ruleClick', 'dragEnd');
  dispatch.on('ruleClick.ext');
  
  dispatch.on('dragEnd.ext');
  dispatch.on('dragEnd.int', function(d){
     exports.sortColumns();
          
  });


  function dataProcess(newData){
    columnNames = [];
    dimensions = [];
    // matrix: [[{it:[{aname,aval}, {}, ...], m, id], [], ...]
    matrix = [];           


    var dupColumnNames = newData.map(function(d){ return d.it.map(function(t){ return t.split('=')[0]; })});
    
    for(var i = 0; i < dupColumnNames.length; i++){
      var tmpAry = dupColumnNames[i];
      for(var j = 0; j < tmpAry.length; j++){
        if(!~columnNames.indexOf(tmpAry[j])){
          columnNames.push(tmpAry[j]);
        }
      }
    }
    //alphabetically sort
    columnNames.sort();
    columnNames = columnNames.map(function(a, i){ return {name: a, index: i}}) 

    var cache = {};

    columnNames.forEach(function(d) {
      if (!cache.hasOwnProperty(d.name)) {
        cache[d.name] = {name: d.name, index: d.index, categories: [] };
      }
      dimensions.push(cache[d.name]);
    });

    // {name: Class, categories: [{name: 2nd, rules: {yes: [], no: []}}]}
    for(var i = 0; i < newData.length; i++) {
      var ro = newData[i];
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
      var ruleCount = 0
          ruleYesCount = 0,
          ruleNoCount = 0;
      var cateYesCount = 0,
          cateNoCount = 0;
      d.categories.forEach(function(c){
        for(var l in c.rules){
          ruleCount += c.rules[l].length;
          if(l.toLowerCase() == 'r'){
            ruleYesCount += c.rules[l].length;
          } else if (l.toLowerCase() == 'd'){
            ruleNoCount += c.rules[l].length;

          }
        }
        
      })

      d.categories.forEach(function(c){
        var tmpYesCount = 0,
            tmpNoCount = 0;
        var clsChange = false;
        for(var l in c.rules){
          if(l.toLowerCase() == 'r'){
            tmpYesCount = 1;
          } else if (l.toLowerCase() == 'd'){
            tmpNoCount = 1;
          }
        }
        cateYesCount += tmpYesCount;
        cateNoCount += tmpNoCount;
      })

      d.cateYesCount = cateYesCount;
      d.cateNoCount = cateNoCount;
      d.ruleCount = ruleCount;
      d.ruleYesCount = ruleYesCount;
      d.ruleNoCount = ruleNoCount;

    })
      
    var attrMap = {};
    columnNames.forEach(function(a) {
      attrMap[a.name] = a.index;
    })

            
    newData.forEach(function(r, i) {        
      // z is used to determine if the attribute hits the rule
      matrix[i] = columnNames.map(function(a) { return {name: a.name, x: a.index, y: r.id, z: 0}; });       
    });


    newData.forEach(function(r, i) {
      var tmpObj = {cls: r.cls, id: r.id, m: r.m, it: r.it.map(function(s) {var nv = s.split('='); return {aname: nv[0], aval: nv[1]}})}
      tmpObj.it.forEach(function(s, j) {
        matrix[i][attrMap[s.aname]].z = 1;  
        matrix[i][attrMap[s.aname]].itname = s.aname;
        matrix[i][attrMap[s.aname]].itval = s.aval;
        matrix[i][attrMap[s.aname]].rule = tmpObj;
      })
      
    })

    orderFunctions = {
        xIndex: columnNames.sort(function(a, b) { return d3.ascending(a.index, b.index); }).map(function(d){ return d.index }),
        yIndex: newData.filter(function(d){ return d.cls == 'Yes'}).sort(function(a, b) { return d3.ascending(a.id, b.id)}).concat(newData.filter(function(d){ return d.cls == 'No'}).sort(function(a, b) { return d3.ascending(a.id, b.id)}) ).map(function(d){ return d.id }),

        categoryCount: dimensions.sort(function(a, b) { return d3.ascending(a.categories.length, b.categories.length)}).map(function(d){ return d.index }),
        cateYesCount: dimensions.sort(function(a, b) { return d3.ascending(a.cateYesCount, b.cateYesCount)}).map(function(d){ return d.index }),
        cateNoCount: dimensions.sort(function(a, b) { return d3.ascending(a.cateNoCount, b.cateNoCount)}).map(function(d){ return d.index }),
        

        ruleCount: dimensions.sort(function(a, b) { return d3.descending(a.ruleCount, b.ruleCount)}).map(function(d){ return d.index }),
        ruleYesCount: dimensions.sort(function(a, b) { return d3.descending(a.ruleYesCount, b.ruleYesCount)}).map(function(d){ return d.index }),
        ruleNoCount: dimensions.sort(function(a, b) { return d3.descending(a.ruleNoCount, b.ruleNoCount)}).map(function(d){ return d.index }),

        // sorting by itemName in class
        // first group rules based on rhs class
        // then sort by item name in an order that more occurance number goes first
        itemNameInCls: function(dimName){ 
          var rulesLabYesIds = [], rulesLabNoIds = [];
          var rulesLabYes = newData.filter(function(d){ return d.cls == 'Yes'}),
              rulesLabNo = newData.filter(function(d){ return d.cls == 'No'});
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

        ruleSuppInCls: newData.filter(function(d){ return d.cls == 'Yes'}).sort(function(a, b) { return d3.descending(a.m[0], b.m[0])}).concat(newData.filter(function(d){ return d.cls == 'No'}).sort(function(a, b) { return d3.descending(a.m[0], b.m[0])}) ).map(function(d){ return d.id }),
        
        ruleConfInCls: newData.filter(function(d){ return d.cls == 'Yes'}).sort(function(a, b) { return d3.descending(a.m[1], b.m[1])}).concat(newData.filter(function(d){ return d.cls == 'No'}).sort(function(a, b) { return d3.descending(a.m[1], b.m[1])}) ).map(function(d){ return d.id }),

        similarityYes: similarityOrder('yesCloseness'),
        similarityNo: similarityOrder('noCloseness'),
        similarityMix: similarityOrder('mixCloseness')
      };


  }

  function similarityOrder(by) {
    // according to matrix, calculate the matrix in binary
    // [[name: , binary:], [] ]
    // jaccardDistanceBinary

    if(!matrix.length || !matrix[0].length) return;

    var binaryMatrixCols = matrix[0].length,
        binaryMatrixRows = matrix.length;
    var binaryMatrix = new Array(binaryMatrixCols); 
    for (var i = 0; i < binaryMatrixCols; i++) {
      binaryMatrix[i] = new Array(binaryMatrixRows);
    }

    var clusters  = [];

    if(by == 'mixCloseness') {
      for(var i = 0; i < matrix.length; i++){
        var row = matrix[i];
        for(var j = 0; j < row.length; j++){
          var cell = row[j];
          binaryMatrix[j][i] = cell.z == 0 ? 0 : 1;
        }
      }      

    } else if (by == 'yesCloseness'){
      for(var i = 0; i < matrix.length; i++){
        var row = matrix[i];
        if(row.find(function(a){ return a.z !=0 }).rule.cls == 'Yes'){
            for(var j = 0; j < row.length; j++){
            var cell = row[j];
            binaryMatrix[j][i] = cell.z == 0 ? 0 : 1;
          }
        }        
      }

    } else if (by == 'noCloseness'){
      for(var i = 0; i < matrix.length; i++){
        var row = matrix[i];
        if(row.find(function(a){ return a.z !=0 }).rule.cls == 'No'){
            for(var j = 0; j < row.length; j++){
            var cell = row[j];
            binaryMatrix[j][i] = cell.z == 0 ? 0 : 1;
          }
        }        
      }

    }

    var data2cluster = binaryMatrix.map(function(d, i){ return {name: columnNames[i].name, value: d }});

    
    // https://github.com/harthur/clusterfck
    clusters = clusterfck.hcluster(data2cluster, clusterDistFunction, 'single');
    //clusters = clusterfck.hcluster(data2cluster, clusterDistFunction, 'average');
    //clusters = clusterfck.hcluster(data2cluster, clusterDistFunction, 'complete');

    //console.log(clusters);

    // sorting based on cluster size
    function orderSize(hcluster) {
      // flatten cluster hierarchy
      if(!hcluster.left)
        return [hcluster.value.name];
      else
        if(hcluster.left.size >= hcluster.right.size)
          return orderSize(hcluster.left).concat(orderSize(hcluster.right));
        else if(hcluster.right.size > hcluster.left.size)
          return orderSize(hcluster.right).concat(orderSize(hcluster.left));

    }

    

    // columnNames
    var individualClusters = orderSize(clusters);

    
    var order = {};
    individualClusters.forEach(function(c, i){
      order[c] = i;
    })
    
    return dimensions.sort(function(a, b) { return d3.ascending(order[a.name], order[b.name])}).map(function(d){ return d.index })

    function clusterDistFunction(d1, d2){
      return jaccardDistanceBinary(d1.value, d2.value);
    }

    function leaves(hcluster) {
      // flatten cluster hierarchy
      if(!hcluster.left)
        return [hcluster.value.name];
      else
        return leaves(hcluster.left).concat(leaves(hcluster.right));
    }    

  }



  function exports(sel) {
    x.rangeBands([0, width]);
    y.rangeBands([0, height]);

    // [{"cls":"cls1","m":[[0.0519,2534],90.5323,1.19009],"id":1,"it":["workclass=?"]}, ...]
    sel.each(function(ruleData) {
      var rootSvg = sel.append("svg")
            .attr("width", outerWidth)
            .attr("height", outerHeight) ;
      /*
      var titleG = rootSvg.append('g').attr("transform", "translate(" + margin.left + "," + 20 + ")");
      var titleText = titleG
        .append('text')
        .attr('class', 'title')
        .text('Association Rule View for Feature Selection...')

      titleG.insert('rect', 'text')//outline rectangle
        .attr("height", 16)
        .attr("width", titleText.node().getComputedTextLength())        
        .attr('y', -14)
        .style('fill', '#686868')
        */

      svg = rootSvg 
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      oriData = ruleData.data;
      dataProcess(oriData);

 
      // The default sort order.
      x.domain(orderFunctions.xIndex);
      y.domain(orderFunctions.yIndex);

      svg.append("rect")
          .attr("class", "background")
          .attr("width", width)
          .attr("height", height);

      /*
      var sortingMenu = svg.append('g')
        .attr('class', 'sortmenu')
        .attr("transform", "translate(0, -24)")


      var sortingDim = sortingMenu.append("text")
        .attr("x", 2)
       

      sortingDim.append("tspan")
        .attr("class", "sort categoryNum")
        .text("←Categories") //→, », ←
        .on("mousedown.stop", cancelEvent);
      sortingDim.append("tspan")
        .attr("class", "sort rulesNum")
        .attr("dx", ".5em")   
        //.attr('x', function(d){ return -x(d.index) })
        .text("Rules→")
        .on("mousedown.stop", cancelEvent);

      var sortingRules = sortingMenu.append("text")
        .attr("x", width)
        .style('text-anchor', 'end')
     

      sortingRules.append("tspan")
        .attr("class", "sort support")
        .text("Support↓")
   
        .on("mousedown.stop", cancelEvent);
      sortingRules.append("tspan")
        .attr("class", "sort confidence")
        .attr("dx", ".5em")   
        //.attr('x', function(d){ return -x(d.index) })
        .text("Confidence↓")
        .on("mousedown.stop", cancelEvent);

      function cancelEvent() {
        d3.event.stopPropagation();
        d3.event.preventDefault();
      }
    */
    /*
      sortingRules.select("tspan.sort.support")
        .on('click', dispatch.ruleSortSupp)

      sortingRules.select("tspan.sort.confidence")
        .on('click', dispatch.ruleSortConf)

      sortingDim.select("tspan.sort.categoryNum")
        .on('click', dispatch.dimSortCate)

      sortingDim.select("tspan.sort.rulesNum")
        .on('click', dispatch.dimSortRule)

    */

    exports.redraw();

                 
    })
  }


  exports.toggleHighLightRule = function(ruleRowD){

    var dd = ruleRowD.filter(function(i){ return i.z != 0; });   
    var clickedRow = rows.filter(function(d){ 
      var ro = d.find(function(i){ return i.z != 0; }); 
      return ro.rule.id == dd[0].rule.id && ro.rule.cls == dd[0].rule.cls; 
    });
    var ruleId = dd[0].rule.cls + '_' + dd[0].rule.id;

    if (!~highlightedRules.indexOf(ruleId)) { // new to highlight
      highlightedRules.push(ruleId);

      clickedRow.classed('highlight', true);
      clickedRow.selectAll('.cell').classed('cellHighlight', true);

    } else { // unhighlight
      var idx = highlightedRules.indexOf(ruleId);
      highlightedRules.splice(idx, 1);
      clickedRow.classed('highlight', false);

      clickedRow.selectAll('.cell').classed('cellHighlight', false);        
    }
  }

  exports.toggleHighLightRuleItem = function(item){
    
    rows.each(function(d){ 
      var ro = d.find(function(i){ return i.z != 0; }),
          ruleId = ro.rule.cls + '_' + ro.rule.id;
      var ruleItems = ro.rule.it.map(function(t){ return t.aname + '_' + t.aval });
      var iscontained = ruleItems.includes(item);  
      if(iscontained) {
        if (!~highlightedRules.indexOf(ruleId)) {
          highlightedRules.push(ruleId);
        } else {
          var idx = highlightedRules.indexOf(ruleId);
          highlightedRules.splice(idx, 1);

        }       
      }

    });

    rows.selectAll('.cell').classed('cellHighlight', false);  
    rows.each(function(d){ 
      var ro = d.find(function(i){ return i.z != 0; }),
          ruleId = ro.rule.cls + '_' + ro.rule.id;
      if(highlightedRules.indexOf(ruleId) != -1){
        d3.select(this).selectAll('.cell').classed('cellHighlight', true); 
      }

    });

    
  }

  // items is an array including itemset of an association rule
  exports.highlightRules = function(items){

    var filteredRow = rows.filter(function(d){ 
      var ro = d.find(function(i){ return i.z != 0; }); 
      var pathItems = ro.rule.it.map(function(t){ return t.aname + '_' + t.aval });
      return items.every(function(i){ return pathItems.includes(i); }); 
    });

    filteredRow.classed('highlight', true);
    filteredRow.selectAll('.cell').classed('cellHighlight', true); 

  } 

  exports.addClickHighlightClass = function(d) {
    var dd = d.find(function(i){ return i.z != 0; }),
        ruleClsId = dd.rule.cls + '_' + dd.rule.id;

     var filteredRow = rows.filter(function(r){ 
      var ro = r.find(function(i){ return i.z != 0; }); 
      return ro.rule.cls+'_'+ro.rule.id == ruleClsId;
    });
    filteredRow.classed('clickHighLight', true);
  }

  exports.removeClickHighlightClass = function(d) {
    var dd = d.find(function(i){ return i.z != 0; }),
        ruleClsId = dd.rule.cls + '_' + dd.rule.id;

     var filteredRow = rows.filter(function(r){ 
      var ro = r.find(function(i){ return i.z != 0; }); 
      return ro.rule.cls+'_'+ro.rule.id == ruleClsId;
    });
    filteredRow.classed('clickHighLight', false);
  }

  exports.toggleClickStyle = function(d){
    var dd = d.find(function(i){ return i.z != 0; }),
        ruleClsId = dd.rule.cls + '_' + dd.rule.id;

    if (!~click2Highlight.indexOf(ruleClsId)) {  
      click2Highlight.push(ruleClsId);    
    
    } else {
      var idx = click2Highlight.indexOf(ruleClsId);
      click2Highlight.splice(idx, 1); 
   
    } 
    
    rows.each(function(r){ 
      var ro = r.find(function(i){ return i.z != 0; }); 
      var rid = ro.rule.cls+'_'+ro.rule.id;
      if(click2Highlight.indexOf(rid) != -1){
        d3.select(this).classed('clickHighLight', true);
      } else {
        d3.select(this).classed('clickHighLight', false);
      }
    })

  }

  exports.unhighlightRules = function(items){
    var filteredRow = rows.filter(function(d){ 
      var ro = d.find(function(i){ return i.z != 0; }); 
      var curRuleitems = ro.rule.it.map(function(t){ return t.aname + '_' + t.aval });
      return items.every(function(i){ return curRuleitems.includes(i); }); 
    });

    filteredRow.classed('highlight', false);
    filteredRow.selectAll('.cell').classed('cellHighlight', false); 

  }

  exports.toggleHighlightRulesItemSuperset = function(ruleLabel, itemSuperset){

    var filteredRow = rows.filter(function(d){ 
      var ro = d.find(function(i){ return i.z != 0; }); 
      var curRuleitems = ro.rule.it.map(function(t){ return t.aname + '_' + t.aval });
      return ro.rule.cls == ruleLabel && curRuleitems.every(function(i){ return itemSuperset.includes(i); }); 
    });


    filteredRow.each(function(d){
      var ro = d.find(function(i){ return i.z != 0; }); 
      var ruleId = ro.rule.cls + '_' + ro.rule.id;
      if (!~highlightedRules.indexOf(ruleId)){
        highlightedRules.push(ruleId);

        d3.select(this).classed('highlight', true);
        d3.select(this).selectAll('.cell').classed('cellHighlight', true); 
      } else {
        var idx = highlightedRules.indexOf(ruleId);
        highlightedRules.splice(idx, 1);
        d3.select(this).classed('highlight', false);
        d3.select(this).selectAll('.cell').classed('cellHighlight', false); 

      }

    })



  } 
  exports.unhighlightRulesItemSuperset = function(ruleLabel, itemSuperset){
    var filteredRow = rows.filter(function(d){ 
      var ro = d.find(function(i){ return i.z != 0; }); 
      var curRuleitems = ro.rule.it.map(function(t){ return t.aname + '_' + t.aval });
      return ro.rule.cls == ruleLabel && curRuleitems.every(function(i){ return itemSuperset.includes(i); }); 
    });

    filteredRow.each(function(d){
      var ro = d.find(function(i){ return i.z != 0; }); 
      var ruleId = ro.rule.cls + '_' + ro.rule.id;
      if (!~ruleGrid.highlightedRules().indexOf(ruleId)){
        ruleGrid.highlightedRules().push(ruleId);

        d3.select(this).classed('highlight', false);
        d3.select(this).selectAll('.cell').classed('cellHighlight', false); 
      }

    }) 

  }



  exports.sortRows = function(byVal) {     
    if(byVal == 'supp'){
      curRuleOrderField = 'support';
      y.domain(orderFunctions.ruleSuppInCls);
    } else if (byVal == 'conf') {
      curRuleOrderField = 'confidence';
      y.domain(orderFunctions.ruleConfInCls);   
    }

    rows.transition().duration(200)
      .delay(function(d) { return y(d[0].y) * 4; })
      .attr("transform", function(d) { return "translate(0," + y(d.filter(function(r){ return r.z != 0})[0].rule.id) + ")"; })        
  } 

  exports.sortColumns = function(byVal){
    if(byVal == 'mixCategoryCount') {
      curDimOrderField = 'mixCategoryCount';
      x.domain(orderFunctions.categoryCount);    
    } else if(byVal == 'yesCategoryCount'){
      curDimOrderField = 'yesCategoryCount';
      x.domain(orderFunctions.cateYesCount); 
    } else if(byVal == 'noCategoryCount') {
      curDimOrderField = 'noCategoryCount';
      x.domain(orderFunctions.cateNoCount); 


    } else if(byVal == 'rulesCount') {
      curDimOrderField = 'rulesCount';
      x.domain(orderFunctions.ruleCount); 
    } else if (byVal == 'yesrulesCount') {
      curDimOrderField = 'yesrulesCount';
      x.domain(orderFunctions.ruleYesCount);       
    } else if (byVal == 'norulesCount') {
      curDimOrderField = 'norulesCount';
      x.domain(orderFunctions.ruleNoCount);



    } else if (byVal == 'mixCloseness') {  
      curDimOrderField = 'mixCloseness';   
      x.domain(orderFunctions.similarityMix); 
    } else if (byVal == 'yesCloseness') {      
      curDimOrderField = 'yesCloseness';
      x.domain(orderFunctions.similarityYes); 
    } else if (byVal == 'noCloseness') {      
      curDimOrderField = 'noCloseness';
      x.domain(orderFunctions.similarityNo); 
    }

    var t = rows.transition().duration(500);
    t.selectAll(".cell")          
      .attr("x", function(d) { return x(d.x); });
    t.selectAll("text").attr("x", function(d) { return x(d.x) + x.rangeBand()/2; })  


    columns.select('line').transition().duration(500)
      .attr("transform", function(d) { return "translate(" + x(d.index) + ")rotate(-90)"; });

    columns.select("text").transition().duration(500)   
      .attr("transform", function(d){ return "translate(" + (x(d.index) + x.rangeBand()/2) + ", -6)"});
    
  }

  exports.currentSortedRuleIds = function() {
    return y.domain();
  }

  exports.columnOrder = function() {
    return x.domain().map(function(i) { return columnNames.find(function(c) { return c.index == i }).name; });
  }

  exports.width = function(_) {
    if(!arguments.length){
      return outerWidth;
    }
    outerWidth = _;
    width = outerWidth - margin.left - margin.right;
    
    return this;
  }

  exports.highlightedRules = function() {
    return highlightedRules;
  }
  

  exports.dimensions = function() {
    return x.domain().map(function(i){ return dimensions.find(function(d){ return d.index == i; })})
    
  }

  exports.height = function(_) {
    if(!arguments.length){
      return outerHeight;
    }
    outerHeight = _;
    height = outerHeight - margin.top - margin.bottom;
    return this;

  }

  

  exports.supports = function(minSupp, maxSupp) {
    if(!arguments.length){
      return [minSupport, maxSupport];
    }
    minSupport = +minSupp;
    maxSupport = +maxSupp;
    return this;

  }

  exports.redraw = function(){    
    var rData = oriData.filter(function(d){ return d.m[0]*100 >= minSupport && d.m[0]*100 <= maxSupport});
    dataProcess(rData);

    if(curRuleOrderField == 'supp'){
      y.domain(orderFunctions.ruleSuppInCls);
    } else if (curRuleOrderField == 'conf') {
      y.domain(orderFunctions.ruleConfInCls);   
    } else {
      y.domain(orderFunctions.yIndex);
    }
    

    if(curDimOrderField == 'mixCategoryCount') {
      x.domain(orderFunctions.categoryCount);    
    } else if(curDimOrderField == 'yesCategoryCount'){      
      x.domain(orderFunctions.cateYesCount); 
    } else if(curDimOrderField == 'noCategoryCount') {      
      x.domain(orderFunctions.cateNoCount); 
    } else if(curDimOrderField == 'rulesCount') {      
      x.domain(orderFunctions.ruleCount); 
    } else if (curDimOrderField == 'yesrulesCount') {      
      x.domain(orderFunctions.ruleYesCount);       
    } else if (curDimOrderField == 'norulesCount') {      
      x.domain(orderFunctions.ruleNoCount); 
    } else if (curDimOrderField == 'mixCloseness') {      
      x.domain(orderFunctions.similarityMix); 
    } else if (curDimOrderField == 'yesCloseness') {      
      x.domain(orderFunctions.similarityYes); 
    } else if (curDimOrderField == 'noCloseness') {      
      x.domain(orderFunctions.similarityNo); 
    } else {
      x.domain(orderFunctions.xIndex);
    }


    



    rows = svg.selectAll(".row")
      .data(matrix, function(d){ var ro = d.find(function(i){ return i.z != 0; }); return ro.rule.cls+'_'+ro.rule.id });

    var rowEnter = rows.enter().append("g")
        .attr("class", "row")
        .on('click', dispatch.ruleClick)

    rows.call(d3.helper.ruleTooltip(exports.columnOrder()));

    rows.attr("transform", function(d) { return "translate(0," + y(d.find(function(r){ return r.z != 0}).rule.id) + ")"; })
    rows.select('rect')
      .attr('width', width)
      .attr("height", y.rangeBand())        



    rowEnter.append('rect')
        
        .attr('class', 'rowBg')
        .style('display', 'none')


    rowEnter.append("line")
          .attr("x2", width);

    rows.exit().remove();

    
    rows.each(reDrawRow);

    function reDrawRow(row) {  
      var cell = d3.select(this).selectAll(".cell")
          .data(row.filter(function(d) { return d.z; }))
      
      cell.enter().append("rect")
          .attr("class", function(d){ return "cell " + d.itname})                   
          .style("fill", function(d) { return c(d.rule.cls); })

      cell.attr("x", function(d) { return x(d.x); })
          .attr("width", x.rangeBand())
          .attr("height", y.rangeBand())            

      cell.exit().remove();
          

      var label = d3.select(this).selectAll(".lab")
          .data(row.filter(function(d) { return d.z; }))
      
      label.enter().append("text")
          .attr("class", function(d){ return "lab " + d.itname})          
          .attr('dy', '.3em')
          .attr('text-anchor', "middle")
          

      label.attr("x", function(d) { return x(d.x) + x.rangeBand()/2; })
          .attr("y", function(d) { return y.rangeBand()/2; })
          .text(function(d){ return d.itval })

      if(y.rangeBand() < 12) label.style('display', 'none'); else label.style('display', 'block')

      label.exit().remove();         
    }


    
    columns = svg.selectAll(".column")
          .data(columnNames, function(d){ return d.name });

    var columnEnter = columns.enter().append("g")
          .attr("class", "column")
    columnEnter.append("line")

    columnEnter.append("text")
        .attr("class", "dimension")        
        .style('text-anchor', 'middle')


    columns.select("line")
      .attr("x1", -height)
      .attr("transform", function(d) { return "translate(" + x(d.index) + ")rotate(-90)"; })
    columns.select("text")      
      .attr("transform", function(d){ return "translate(" + (x(d.index) + x.rangeBand()/2) + ", -6)"})
      .text(function(d, i) { return labelDict[columnNames[i].name]; })

    columns.exit().remove();



    var dragging = {};
      function cPosition(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
      }
      columns
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
          
          
          rows.selectAll("rect." + d.name)          
            .attr("x", d3.event.x);


          rows.selectAll("text." + d.name)          
            .attr("x", d3.event.x + x.rangeBand()/2);

      

          d3.select(this).select('line')   
            .attr("transform", function(d) { return "translate(" + d3.event.x + ")rotate(-90)"; });

          d3.select(this).select("text")       
            .attr("transform", function(d){ return "translate(" + (d3.event.x + x.rangeBand()/2)+ ", -6)"});
         
        })
        .on("dragend", dispatch.dragEnd))
   


  }


  return d3.rebind(exports, dispatch, 'on');

}
