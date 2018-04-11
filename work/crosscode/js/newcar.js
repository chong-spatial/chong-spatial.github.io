

// cls.json: [{"it": ["D=11", "K=1", "A=2"], "id": 0, "m": [[0.0105, 515], 77.2114, 3.2268]}
/*
{  
  "name": "Census Income",
  "dimensions": 14,
  "instances": 48842, 
  "attrMap": {"occupation": "A", "age": "B", "gain": "C", "edu_num": "D", "sex": "I", "marital": "F", "loss": "G", "relationship": "H", "country": "E", "race": "J", "education": "K", "workclass": "L", "hours": "M"},
  "attributes": {
    "occupation": ["Machine-op-inspct", "Prof-specialty", "Adm-clerical", "Transport-moving", "Handlers-cleaners", "?", "Protective-serv", "Craft-repair", "Other-service", "Farming-fishing", "Sales", "Tech-support", "Exec-managerial"], 
    "age": ["middle-aged", "young", "old", "senior"], 
    },
    "source": "https://archive.ics.uci.edu/ml/datasets/Census+Income",
    "data": {
        //"len0" was dismissed
      "len1": {},
      "len2": {},
      "len3": {
            // used to calculate the postions for attributes
            // might have "stat": {"A": [289,0], "B": [34,78], "C": [0,56], "D":[987,0], "E":[63,2], "F":[23,18]},
            "A": {
                "A1":{"cls1":["a23", "a45"], "cls2": ["b12"]}, 
                "A2":{"cls1": ["a3"], "cls2": ["b25"]}, 
                "A3":{},
                            "...": {"cls1": "...", "cls2": "..."}

              },
            "B": {
                "B1": {"cls1":["a23", "a44", "a51"], "cls2": []}, 
                "B2": {"cls1": [], "cls2": [] },
                            "...": {"cls1": "...", "cls2": "..."}
              },
                    "...": {
                        "...": {"cls1": "...", "cls2": "..."}
                    }
              
          }
    }

}

*/
/*supp = P(X U Y), conf = P(Y|X), */

//ruleStats
//cls1Rule
//cls2Rule

var ruleItemsObj = {};
for (len in ruleStats.data) {
  var lenObj = ruleStats.data[len];
  for (attr in lenObj) {
    var attrObj = lenObj[attr];
    for (val in attrObj) {
      var valObj = attrObj[val];
      if (val in ruleItemsObj) {
        ruleItemsObj[val]['cls1'] = ruleItemsObj[val]['cls1'].concat(valObj['cls1'] || []);
        ruleItemsObj[val]['cls2'] = ruleItemsObj[val]['cls2'].concat(valObj['cls2'] || []);

      } else {
        ruleItemsObj[val] = {'cls1': valObj['cls1'] || [], 'cls2': valObj['cls2'] || []};

      }
    }
  }
}

var allItems = $.map(ruleItemsObj, function(clsAry, item){ var obj = {}; obj[item] = clsAry; return obj;})

$.map(cls1Rule, function(r, i){ r['cls'] = 'cls1'});
$.map(cls2Rule, function(r, i){ r['cls'] = 'cls2'});

function sortRuleConfD(a, b){
  return b.m[1] - a.m[1] ;
}
function sortRuleConfA(a, b){
  return a.m[1] - b.m[1];
}
function sortRuleLift(a, b){
  return  b.m[2] - a.m[2];
}

function sortRuleSupp(a, b){
  return  b.m[1][1] - a.m[1][1];
}

cls1Rule.sort(sortRuleConfD);
cls2Rule.sort(sortRuleConfA);

allItems.sort(function(a, b){
  // need more complex sorting alg defined by interaction
  var akey = Object.keys(a)[0],
      bkey = Object.keys(b)[0];
  var a1 = a[akey]['cls1'].length, 
      a2 = a[akey]['cls2'].length, 
      b1 = b[bkey]['cls1'].length, 
      b2 = b[bkey]['cls2'].length;
  if(b1 == 0) b2 = 100000;
  if(b2 == 0) b1 = 100000;
  if(a2 == 0) a1 = 100000;
  if(a1 == 0) a2 = 100000;
  return (b1 - b2) - (a1 - a2);
})
var allRules = cls1Rule.concat(cls2Rule);
var cls = ['cls1', 'cls2'];

var formatNumber = d3.format(",d");

var width = $("#vis-container").width();
    height = 800;


var tip = d3.tip()
      .attr('class', 'd3-tip')
      .html(function (ruleCls, item, rule) { return "<span style='bg-color:#CCCCCC;font-size:12;font-color:#555;opacity:.8;'> cls" + "=" + ruleCls + ", item=" + item + ", of rule=" + rule + " </span>"; });
  
var svg = d3.select('#vis-container').append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(tip);


var vOffset = 0;
var verticalSpacing = 2,
    horizontalSpaceing = 5;
var cellSize = [4, 2],
    padding = [1, 1];
  
// combine cls1ruel and cls2rule
//

function createGrid(){
  var rectCounter = -1;
  var lengthCounter = 0;
  var rowCounter = -1;


    var hOffset = 0,
        attrCounter = 0; 


    var rectGrid = d3.layout.grid()
      .nodeSize(cellSize)
      .rows(allItems.length)
      .padding(padding);

    
    lengthCounter ++;
    var gitem = svg.append("g")
      .attr("class", "item")
      .attr("transform", "translate(" + 10 + "," + (vOffset + lengthCounter * verticalSpacing) + ")")    
    vOffset = vOffset + (cellSize[1] + padding[1]);

    for(var c = 0; c < cls.length; c++){
    

      var rects = [];
      
      for(var i = 0; i < allItems.length; i++){  
        var itemObj = allItems[i];
        var itemObjKey = Object.keys(itemObj)[0];
      
        var belongRuleIds = $.map(itemObj, function(v, k){return v[cls[c]]});

        rowCounter++ ;//problem
        var rightClsRules = allRules.filter(function(r){ return r['cls'] == cls[c] });
        for(var r = 0; r < rightClsRules.length; r++){
          var ruleObj = rightClsRules[r];
          rects.push({rectIdx: rectCounter++, item: itemObjKey, cls: ruleObj['cls'], rule: ruleObj['cls'] == cls[c] && belongRuleIds.indexOf(ruleObj['id']) != -1 ? ruleObj['id']: -1});
        }
      }

      
      var grule = gitem.append("g")
        .attr("class", "rule")
        .attr("transform", "translate(" + (hOffset + (c+1) * horizontalSpaceing) +")")
      hOffset = hOffset + rightClsRules.length * (cellSize[0] + padding[0]);

      var rect = grule.selectAll(".rect")
          .data(rectGrid(rects))

      rect.enter().append("rect")
          .attr("class", function(d) {return "i"+d.item + " r"+ d.rule})  
          .attr("width", 0)
          .attr("height", rectGrid.nodeSize()[1])
          .attr("transform", function(d) { return "translate(" + d.x+ "," + d.y + ")"; })
          .classed("cell", true)
                              
          .style("fill", function(d){   
            if(~d.rule ){
              return d.cls == 'cls1' ? "red" : "blue"
            }

          })

          .on('mouseover', function (d) {
            if(~d.rule){
              d3.select(this)
                  .style('stroke', 'rgb(0,255,0)')
                  .style('stroke-width', '2.5px')
                  .style('border', '1px solid #FFFFFF')
                  .style('padding', '2px');
              
              tip.show(d.cls, d.item, d.rule);
            }
          })
          .on('mouseout', function (d){
            if(~d.rule){
              d3.select(this)
               .style('stroke', null)
               .style('stroke-width', null)
               .style('border', null)
               .style('padding', null);

              tip.show(d.cls, d.item, d.rule);
            }
          })
          .on('click', function (d) {
            console.log(d);
          }) 

          .transition()
          .delay(function(d) { return d.rectIdx * 0.5; })
          .duration(2000)
          .attr("width", rectGrid.nodeSize()[0])
          //.attr("height", rectGrid.nodeSize()[1])
          
          
          

    }


}

createGrid();

/*
1. bound data: {attr: v, val: v, rowIdx: v, x: v, y: v}

2.
var gtRuleStats = {l1: [ruleId1, ruleId3, ...], l2: [], ...}
var ltRuleStats = {l1: [ruleId1, ruleId3, ...], l2: [], ...}

//generate like this
// e.g.
// gt: [1, 2, 5] -> [[a, b, d], [d, e, f], [a, e, f]]
// lt: [2, 6] - > [[a, g, h], [e, g, h]]

var rule = function(){
  var id, itemsets[attr, val]
  var compare = function(a, b){}
  var contain = function(a, b){}
  var sharedItems = function([ary]){}
}

3. update bound data: {attr: v, val: v, rowIdx: v, x: v, y: v, hitRules: {'gt': [ruleId1...], 'lt': [ruleId2...]} }

*/
//applyOverlay();
//overlay lessthan50k rule
//will bind i-length rules to g element

