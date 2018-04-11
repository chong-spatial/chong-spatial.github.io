var parsets;

var rawdataGrid;

$(document).ready(function () {

  var dimensionNames = ruleGrid.dimensions().map(function(d){ return d.name; })
  



  // experiment use
  //dimensionNames = optimizedMutualInfo;

  // raw data dimensions
  // var rawDims = obsCoverage[0].item.map(function(d){return d.split('=')[0]})
  // dimensionNames = rawDims;

    dimensionNames.unshift("Survived");

parsets = d3.parsets()
  .dimensionNames(dimensionNames)
  .classDimension('Survived')
  .disableOrderClassDimension(true)
  .yesLabelGoesFirst(true)
  .width($("#pcView").width() - 4)
  .height($("#pcView").height());

var parsetSvg = d3.select("#pcView").append("svg")
    .attr("width", parsets.width())
    .attr("height", parsets.height());


var parData = obsCoverage.map(function(d){ 
  var items = d.item; 
  var res = {}; 
  for(var i = 0; i < items.length; i++){
    var av = items[i].split('=');
    res[av[0]] = av[1];
  }
  res['id'] = d.idx;
  res['Survived'] = d.lab;
  return res;

})

// slickgrid needs each data element to have an id
parData.forEach(function(d,i) { d.id = d.id || i; });

parsetSvg.datum(parData).call(parsets);

var ruleDimCates = {};
ruleGrid.dimensions().forEach(function(d){ 
  ruleDimCates[d.name] = [];
  for(var i = 0; i < d.categories.length; i++){
    ruleDimCates[d.name].push(d.categories[i].name);
  }
})

parsets.updateRuleCategoryClass(ruleDimCates);


d3.select('#clutterMetricSpan').html(parsets.clutterMeasure());


parsets.on('categoryClick', function(d){
  ruleGrid.toggleHighLightRuleItem(d.dimension.name + '_' + d.name);

})

parsets.on('ribbonClick', function(d){
  var ribbonLabel = d.label;

  var items = [];
  /*
  // all categories existing in the ribbon
  (function recurse(d) {
    if(ruleUnrelatedCateIsShown){
      var aitem = d.dimension + '_' + d.name;
      if(!~items.indexOf(aitem)) items.push(aitem);
    } else if(d.ruleRelatedCate){
      var aitem = d.dimension + '_' + d.name;
      if(!~items.indexOf(aitem)) items.push(aitem);
    }
    for (var k in d.children) recurse(d.children[k]);
  })(d);
  items.shift();
  if(ruleUnrelatedCateIsShown){
    while (d.dimension) { 
      var aitem = d.dimension + '_' + d.name;
      if(!~items.indexOf(aitem)) items.push(aitem); 
      d = d.parent;
    }
  } else{
    while (d.dimension && d.ruleRelatedCate) {
      var aitem = d.dimension + '_' + d.name;
      if(!~items.indexOf(aitem)) items.push(aitem);
      d = d.parent;
    }
  }
  */

  (function recurse(d) {
    if(d.ruleRelatedCate){
      if(d.source.node.ruleRelatedCate){
        var aitem = d.source.dimension.name + '_' + d.source.node.name;
        if(!~items.indexOf(aitem)) items.push(aitem);
      } else if(d.target.node.ruleRelatedCate){
        var aitem = d.target.dimension.name + '_' + d.target.node.name;
        if(!~items.indexOf(aitem)) items.push(aitem);
      }
    }
    for (var k in d.children) recurse(d.children[k]);
  })(d);
  items.shift();

  while (d.dimension && d.ruleRelatedCate) {
    if(d.source.node.ruleRelatedCate){
      var aitem = d.source.dimension.name + '_' + d.source.node.name;
      if(!~items.indexOf(aitem)) items.push(aitem);
      d = d.parent;
    } else if(d.target.node.ruleRelatedCate){
      var aitem = d.target.dimension.name + '_' + d.target.node.name;
      if(!~items.indexOf(aitem)) items.push(aitem);
      d = d.parent;
    }
    
  }
 

   //console.log(items);

    
   ruleGrid.toggleHighlightRulesItemSuperset(ribbonLabel, items);
   



})



 


});