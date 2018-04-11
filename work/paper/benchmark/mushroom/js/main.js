var ruleGrid, scatterView;

var ruleUnrelatedCateIsShown = true;

var parsetsOnlyhighlights = false;

var labelDict = {

        "cap-shape": "cap-shape",
  "cap-surface": "cap-surface",
  "cap-color": "cap-color",  
  "bruises": "bruise", 
  "odor": "odor", 
  "gill-attachment": "gill-att",
  "gill-spacing": "gill-space",
  "gill-size": "gill-size",
  "gill-color": "gill-color",
  "stalk-shape": "stalk-shape",  
  "stalk-root": "stalk-root", 
  "stalk-surface-above-ring" : "sur-above-ring",
  "stalk-surface-below-ring" : "sur-below-ring",  
  "stalk-color-above-ring": "c-above-ring",
  "stalk-color-below-ring": "c-below-ring",
  "veil-type": "veil-type",
  "veil-color": "veil-color",
  "ring-number": "ring-num",
  "ring-type": "ring-type", 
  "spore-print-color": "spore-color",
  "population": "pop",  
  "habitat": "hab"

}

$(document).ready(function () {

  $("#toggleParsets input" ).checkboxradio({
      icon: false
    });

  $("#sortruleratio input").checkboxradio({icon: false});
  $("#sortdimratio input").checkboxradio({icon: false});

  var suppLeftHandle = $("#supp-handle-left"),
      suppRightHandle = $("#supp-handle-right");
    

  var suppMinMax = d3.extent(ruleStats.data, function(d){ return d.m[0]});

$( "#support-slider" ).slider({
  range: true,
  min: Math.floor(suppMinMax[0] * 100),
  max: Math.ceil(suppMinMax[1] * 100),
  values: [Math.floor((suppMinMax[0] + 0.25 * (suppMinMax[1] - suppMinMax[0])) * 100), Math.floor((suppMinMax[0] + 0.75 * (suppMinMax[1] - suppMinMax[0])) * 100)],
  create: function() {
    suppLeftHandle.text( $( this ).slider( "values" )[0] );
    suppRightHandle.text( $( this ).slider( "values" )[1] );
  },
  slide: function( event, ui ) {
    suppLeftHandle.text( ui.values[0] );
    suppRightHandle.text( ui.values[1] );
    ruleGrid.supports(ui.values[0], ui.values[1]);
    // reset highlighting item
    
    ruleGrid.redraw();
    d3.select('#ruleOverview').selectAll('.row').classed('clickHighLight', false).classed('highlight', false)
    d3.select('#ruleOverview').selectAll('.rect').classed('cellHighLight', false)

    var newColumns = ruleGrid.columnOrder().map(function(c){ return {name: c} });
    newColumns.forEach(function(c, i){ c.idx = i; });
    if(!newColumns.length) return;
    var dimCates = {};
    ruleGrid.dimensions().forEach(function(d){ dimCates[d.name] = d.categories.map(function(c){ return c.name })});
    parsets.orderDimension([{"name": "Edible", "idx": -1}].concat(newColumns), dimCates);

    d3.select('#clutterMetricSpan').html(parsets.clutterMeasure());
    

  }


});


$("#toggleParsetCates" ).on( "click", function() {

  var newDims = [parsets.classDimension().name];

  var curDimsInParset = parsets.dimensions().sort(function(a, b){ return a.idx - b.idx}).map(function(d){return d.name})
  
  // if (ruleUnrelatedCateIsShown) {
  //   newDims = newDims.concat(ruleGrid.columnOrder());
    
  // } else {
  //   var tmpDims = ruleGrid.columnOrder();
  //   var oriDimensionNames = parsets.getOriginalDimensionNames();
  //   for(var i = 0; i < oriDimensionNames.length; i++){
  //     if(!~tmpDims.indexOf(oriDimensionNames[i]) && oriDimensionNames[i] != parsets.classDimension().name){

  //       tmpDims.push(oriDimensionNames[i]);
  //     }
  //   }

  //   newDims = newDims.concat(tmpDims);

  // }
      
  // parsets.onlyDisplay(curDimsInParset);
  


  if(ruleUnrelatedCateIsShown){
    ruleUnrelatedCateIsShown = false;

    d3.selectAll('.ribbon, .ribbon-mouse').selectAll("path").filter(function(d){ 
      return d.dimension != parsets.classDimension().name && !d.source.node.ruleRelatedCate || !d.target.node.ruleRelatedCate
    }).each(function(d){
    
      d3.select(this).style('fill-opacity', 0.02);
    
    })

    d3.select('#pcView').selectAll('.category').filter(function(d){ return !d.ruleRelatedCate && d.dimension.name != parsets.classDimension().name })
    .each(function(d){
    
      d3.select(this).style('fill-opacity', 0.02);
    
    })

  } else {

    ruleUnrelatedCateIsShown = true;

    d3.selectAll('.ribbon, .ribbon-mouse').selectAll("path").filter(function(d){ 
      return d.dimension != parsets.classDimension().name && !d.source.node.ruleRelatedCate || !d.target.node.ruleRelatedCate
    }).each(function(d){
    
      d3.select(this).style('fill-opacity', null);;
    
    })

    d3.select('#pcView').selectAll('.category').filter(function(d){ return !d.ruleRelatedCate && d.dimension.name != parsets.classDimension().name })
    .each(function(d){
    
      d3.select(this).style('fill-opacity', null);;
    
    })

  }
  

  d3.select('#clutterMetricSpan').html(parsets.clutterMeasure());


  
  
});


$("#toggleParsetUnhighlights" ).on( "click", function() {

  if(parsetsOnlyhighlights){
    parsets.showOnlyHighlights(false);
    parsetsOnlyhighlights = false;
  } else {
    parsets.showOnlyHighlights(true);
    parsetsOnlyhighlights = true;

  }
        
   
  
  //d3.select('#clutterMetricSpan').html(parsets.clutterMeasure());


  
  
});

$('input[name=sortRule]:radio').change(function(){  
  var ordered;
  if(this.value == 'support') {
    ruleGrid.sortRows("supp");
    ordered = categoriesOdered('support');
  } else if(this.value == 'confidence') {
    ruleGrid.sortRows("conf");
    ordered = categoriesOdered('confidence');
  }else if(this.value == 'ruleAggYes') {
    ruleGrid.sortRows("ruleAggYes");
    ordered = categoriesOdered('ruleAggYes');
  }else if(this.value == 'ruleAggNo') {
    ruleGrid.sortRows("ruleAggNo");
    ordered = categoriesOdered('ruleAggNo');
  }

  d3.select('#ruleOverview').selectAll('.row').classed('highlight', false);
  d3.select('#ruleOverview').selectAll('.row').classed('clickHighLight', false);
  d3.select('#ruleOverview').selectAll('.cell').classed('cellHighlight', false);
  
  if(ordered){

    var parasetDims = parsets.getCurrentDimensions().map(function(d){ 
      var tmp = {'name': d.name, 'categories' : []}; 
      var newToPush = d.categories.map(function(dc){ return {name: dc.name, nodes: dc.nodes, count: dc.count}; });
      tmp.categories = newToPush;
      return tmp;
    })


    parasetDims.forEach(function(pd, pi){
      if(pd.name == parsets.classDimension().name) { 
        pd.idx = -1; 

        if(parsets.yesLabelGoesFirst()){     
          if(pd.categories[0].name == 'No'){
            var tmp = Object.assign({}, pd.categories[0]);
            pd.categories[0] = pd.categories[1];
            pd.categories[1] = tmp;
          }
        }
        pd.categories.forEach(function(c, i){ c.idx = i; })

        return; 
      };

      // for each dimension in parasets
      // 1. separate categories into two groups, the ordered by rule and the unordered
      // 2. 
      // find the dimension meeting the name of pd.name
      var cd = ordered.find(function(rc){ return rc.name == pd.name});
      var orderedCateNames = [];
      if(cd) orderedCateNames = cd.categories.map(function(d){ return d.name });      
      var unordered = pd.categories.filter(function(d){ return orderedCateNames.indexOf(d.name) == -1});

      unordered.forEach(function(d){
        var yesTotalCount = d.nodes.filter(function(c){ return c.label == 'Yes'}).reduce(function(t, c){ return t + c.count }, 0),
            noTotalCount = d.nodes.filter(function(c){ return c.label == 'No'}).reduce(function(t, c){ return t + c.count }, 0);
        d.group = yesTotalCount > noTotalCount ? 'Yes' : 'No';
        d.totalYesCount = yesTotalCount;
        d.totalNoCount = noTotalCount;
      })

      var yesGroupInRule = [], noGroupInRule = [];
      if(cd) yesGroupInRule = cd.categories.filter(function(d){ return d.group == 'Yes' }),
          noGroupInRule = cd.categories.filter(function(d){ return d.group == 'No' });

      var yesGroupInUnordered = unordered.filter(function(d) { return d.group == 'Yes' }),
          noGroupInUnordered = unordered.filter(function(d) { return d.group == 'No' });

      
      yesGroupInRule.sort(function(a, b){ if(a.maxMeasureingroup < b.maxMeasureingroup) return 1; if(a.maxMeasureingroup > b.maxMeasureingroup) return -1; return 0; })
      
      yesGroupInUnordered.sort(function(a, b){ if(a.totalYesCount < b.totalYesCount) return 1; if(a.totalYesCount > b.totalYesCount) return -1; return 0; })
      
      noGroupInRule.sort(function(a, b){ if(a.maxMeasureingroup < b.maxMeasureingroup) return -1; if(a.maxMeasureingroup > b.maxMeasureingroup) return 1; return 0; })
      
      noGroupInUnordered.sort(function(a, b){ if(a.totalNoCount < b.totalNoCount) return -1; if(a.totalNoCount > b.totalNoCount) return 1; return 0; })
      

      pd.categories = yesGroupInRule.concat(yesGroupInUnordered).concat(noGroupInUnordered).concat(noGroupInRule);

      pd.categories.forEach(function(c, i){
        c.idx = i;
      })
      pd.idx = pi;
    })


    parsets.orderDimension(parasetDims);
    
  } 

  d3.select('#clutterMetricSpan').html(parsets.clutterMeasure());

})

$('input[name=sortDim]:radio').change(function(){  
  d3.select('#ruleOverview').selectAll('.row').classed('highlight', false);
  d3.select('#ruleOverview').selectAll('.row').classed('clickHighLight', false);
  d3.select('#ruleOverview').selectAll('.cell').classed('cellHighlight', false);

 
  ruleGrid.sortColumns(this.value);   

  var newColumns = ruleGrid.columnOrder().map(function(c){ return {name: c} });
  newColumns.forEach(function(c, i){ c.idx = i; });
  parsets.orderDimension([{"name": "Edible", "idx": -1}].concat(newColumns));

  d3.select('#clutterMetricSpan').html(parsets.clutterMeasure());

  /*
  var curColumnNamesInRuleTable = ruleGrid.columnOrder();
  var curDimsInParset = parsets.dimensions().filter(function(d){return d.name !== parsets.classDimension().name}).map(function(d) {return d.name});
   var notInRuleDims = [];
  for(var i =0; i< curDimsInParset.length; i++){
    if(!~curColumnNamesInRuleTable.indexOf(curDimsInParset[i])){
      notInRuleDims.push(curDimsInParset[i])
    }
  }
  
  var finalDims = curColumnNamesInRuleTable.concat(notInRuleDims);
  var forParsetDims = finalDims.map(function(d){return {name: d}})
  forParsetDims.forEach(function(c, i){ c.idx = i; });
  */

})
   

var ruleMap = {'Yes': {}, 'No': {}};
ruleStats.data.forEach(function(r){
  ruleMap[r.cls][r.id] = r;
})

var ruleTabWidth = $('#ruleOverview').width() || 330, 
	ruleTabHeight = $('#ruleOverview').height()  || 560;
ruleGrid = d3.ruleGrid()
  .width(ruleTabWidth)
  .height(ruleTabHeight)
  .supports($( "#support-slider" ).slider( "option", "values" )[0], $( "#support-slider" ).slider( "option", "values" )[1]);    
d3.select('#ruleOverview').datum(ruleStats).call(ruleGrid); 

/*
var scatterViewWidth = $('#projectionView').width() || 330;
scatterView = d3.projectionView()
  .width(scatterViewWidth)
  .height(scatterViewWidth)
  //.xFeatures(testXfeatures)
  //.yFeatures(testYfeatures)
  //.xRules(testXrules)
  //.yRules(testYrules);    

d3.select('#projectionView').datum(obsCoverage).call(scatterView); 
*/


ruleGrid.on("ruleClick", ruleClick);

ruleGrid.on('dragEnd', function(){ 

  var newColumns = ruleGrid.columnOrder().map(function(c){ return {name: c} });
  newColumns.forEach(function(c, i){ c.idx = i; });
  parsets.orderDimension([{"name": "Edible", "idx": -1}].concat(newColumns));

  d3.select('#clutterMetricSpan').html(parsets.clutterMeasure());

});


function categoriesOdered (by){
  // parsets.orderDimension([{"name":"Survived","categories":[{"name":"Yes"},{"name":"No"}]},{"name":"Age","categories":[{"name":"Child"},{"name":"Adult"}]},{"name":"Sex","categories":[{"name":"Female"},{"name":"Male"}]}, {"name":"Edible","categories":[{"name":"1st"},{"name":"Crew"},{"name":"2nd"},{"name":"3rd"}]}])
  var sortedRuleIds = ruleGrid.currentSortedRuleIds();
  var sortedRules = ruleGrid.currentSortedRuleIds().map(function(d){ return ruleStats.data.find(function(r){return r.id == d })});

  // or min, average as in the linkage in the hierachical clustering?
  function maxRuleMeasure(r){
    return by == 'support'? r.m[0] : r.m[1];
  }
  var currentDim = jQuery.extend(true, [], ruleGrid.dimensions());
  var newOrder = currentDim.map(function(d){ 
    d.categories.forEach(function(c){
      c.maxMeasure = {}; 
      for(var cls in c.rules){
        c.maxMeasure[cls] = d3.max(c.rules[cls], function(r){ return maxRuleMeasure(r); });
      }
      // the algorithm may change. At this moment, consider the label with highest support
      c.group = Object.keys(c.maxMeasure).reduce(function(a, b){ return c.maxMeasure[a] > c.maxMeasure[b] ? a : b });
      c.maxMeasureingroup = Math.max.apply(null, Object.keys(c.maxMeasure).map(function(s){ return c.maxMeasure[s] }));
    })   
    
    return d;
  })

  newOrder.forEach(function(d){
    //may have a better way
    var yesGroup = d.categories.filter(function(c){ return c.group.toLowerCase() == 'y'}),
        noGroup = d.categories.filter(function(c){ return c.group.toLowerCase() == 'n'});
    yesGroup.sort(function(a, b){ 
      var x = a.maxMeasureingroup, y = b.maxMeasureingroup;
      return (x == y ? 0 : (x > y ? -1 : 1)); 
    })
    
    noGroup.sort(function(a, b){
      var x = a.maxMeasureingroup, y = b.maxMeasureingroup;
      return (x == y ? 0 : (x > y ? 1 : -1)); 
    })

    d.categories = yesGroup.concat(noGroup);
  })

  return newOrder;


}




function ruleClick(d) {
  var dd = d.find(function(i){ return i.z != 0; });

  var ruleId = dd.rule.cls + '_' + dd.rule.id;

  var items = dd.rule.it.map(function(t){ return t.aname + '_' + t.aval });

  var ruleObj = d.find(function(i){ return i.z != 0; }).rule;

  var dimCatesDict = {};
  ruleObj.it.forEach(function(d){ 
    if(d.aname in dimCatesDict){
      dimCatesDict[d.aname].push(d.aval);
    } else {
      dimCatesDict[d.aname] = [d.aval];
    }
  }); 

  if (ruleGrid.highlightedRule()!== ruleId) {  
    ruleGrid.highlightedRule(ruleId);

    ruleGrid.highlightRules(items);
    //ruleGrid.addClickHighlightClass(d);  


  } else { // unhighlight
    
    ruleGrid.highlightedRule('');
    
    ruleGrid.unhighlightRules(items);
    //ruleGrid.removeClickHighlightClass(d);
   
    
  }  

  ruleGrid.toggleClickStyle(d);

  var curColumnNamesInRuleTable = ruleGrid.columnOrder();
  var curColumnsInRuleTable = curColumnNamesInRuleTable.map(function(d,i){ return {name: d, displayIdx: i}});
  var curColumnsInRuleTableDict ={};
  for(var i = 0; i<curColumnsInRuleTable.length;i++){
    curColumnsInRuleTableDict[curColumnsInRuleTable[i].name] = curColumnsInRuleTable[i].displayIdx;
  }

  // var newColumns = ruleGrid.columnOrder().map(function(c){ return {name: c} });
  var toTopDimNames = Object.keys(dimCatesDict)
  var inClickedRuleDims = toTopDimNames.map(function(d){ return {name: d, displayIdx: curColumnsInRuleTableDict[d]}}).sort(function(a,b){ return a.displayIdx - b.displayIdx});
  var notInClickedRuleDims = [];
  for(var i =0; i< curColumnNamesInRuleTable.length; i++){
    if(!~toTopDimNames.indexOf(curColumnNamesInRuleTable[i])){
      notInClickedRuleDims.push(curColumnNamesInRuleTable[i])
    }
  }
  
  var finalSortedDims = inClickedRuleDims.map(function(d){return d.name}).concat(notInClickedRuleDims);
  var forParsetDims = finalSortedDims.map(function(d){return {name: d}})
  forParsetDims.forEach(function(c, i){ c.idx = i; });
  parsets.orderDimension([{"name": "Edible", "idx": -1}].concat(forParsetDims));

  
  
  parsets.toggleCategoriesBG(dimCatesDict);
  parsets.toggleRibbons(items);

  
}


});
