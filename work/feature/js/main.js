var c = function(cls){ return cls == "Yes" ? "#369036" : "#e67777"};

var ruleMap = {'Yes': {}, 'No': {}};
ruleStats.data.forEach(function(r){
  ruleMap[r.cls][r.id] = r;
})

var ruleGrid = d3.ruleGrid()
  .width(480)
  .height(600);    
d3.select('#ruleOverview').datum(ruleStats).call(ruleGrid); 



var scatterView = d3.projectionView()
  .width(590)
  .height(620)
  //.xFeatures(testXfeatures)
  //.yFeatures(testYfeatures)
  //.xRules(testXrules)
  //.yRules(testYrules);    

d3.select('#projectionView').datum(obsCoverage).call(scatterView); 

ruleGrid.on("rowClick", rowClickRule);

function rowClickRule(d) {
  var dd = d.filter(function(i){ return i.z != 0; });

  var ruleId = dd[0].rule.cls + '_' + dd[0].rule.id;

  if (!~scatterView.rules().indexOf(ruleId)) { // new to highlight
    scatterView.rules.add(ruleId);

    d3.select(this).selectAll('.cell').classed('cellHighlight', true);
    if(dd[0].rule.cls == 'Yes') {
      for(var i = 0; i < dd.length; i++){
        var it = dd[i];
        scatterView.xFeatures.add(it.itname + '=' + it.itval);
      }
      
    } else if(dd[0].rule.cls == 'No'){
      for(var i = 0; i < dd.length; i++){
        var it = dd[i];
        scatterView.yFeatures.add(it.itname + '=' + it.itval);
      }

    }
    


  } else { // unhighlight
    scatterView.rules.remove(ruleId);

    d3.select(this).selectAll('.cell').classed('cellHighlight', false);
    
    if(dd[0].rule.cls == 'Yes') {   
      for(var i = 0; i < dd.length; i++){
        var it = dd[i];
        scatterView.xFeatures.remove(it.itname + '=' + it.itval);
      }
      
    } else if(dd[0].rule.cls == 'No'){
      for(var i = 0; i < dd.length; i++){
        var it = dd[i];
        scatterView.yFeatures.remove(it.itname + '=' + it.itval);
      }
      
    }


  }
  

  scatterView.update();


  
}

