var width = 1200,
cvsHeight = 400,
focusHeight = 400;

var allObsMap = {},
    allRulesMap = {};

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function (d) { var ro = allRulesMap[d.cls][d.rid];  return  "<span style='bg-color:#CCCCCC;font-size:12;font-color:#555;opacity:.8;'> Support" + " = " + (ro.m[0][0] * 100).toFixed(2) + "%, Confidence = " + ro.m[1].toFixed(2) + "%, Lift = " + +ro.m[2].toFixed(2) + " </span>"; });

var ruleTip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function (d) { var ro = allRulesMap[d.cls][d.id];  return  "<span style='bg-color:#CCCCCC;font-size:12;font-color:#555;opacity:.8;'> Support" + " = " + (ro.m[0][0] * 100).toFixed(2) + "%, Confidence = " + ro.m[1].toFixed(2) + "%, Lift = " + +ro.m[2].toFixed(2) + " </span>"; });


var itemsetLabTip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function (d) { return  "<span style='bg-color:#CCCCCC;font-size:12;font-color:#555;opacity:.8;'> " + d + " </span>"; });


var lab1Obs = allObs.filter(function(o){return o.lab == 1});
    lab2Obs = allObs.filter(function(o){return o.lab == 2});

var xScale = d3.scale.linear()
    .domain([0, width -1]) // minus 1 because canvas coordinates start from (0, 0)
    .range([0, width-1]); //- 1 - grid.colSpace

var yScale = d3.scale.linear()
    .domain([0, cvsHeight])
    .range([0, cvsHeight]);


var arrowclickColorScale = d3.scale.linear().range(["#33C78B", "#31717E"]);//lower: 34B392, 339291
arrowclickColorScale.interpolate(d3.interpolateRgb);
var selectedItems = [];



// dark to light
var redcolor = ["#a50f15", "#de2d26", "#fb6a4a", "#fcae91", "#fee5d9"], //cls2, poisonous
    bluecolor = ["#08519c", "#3182bd", "#4aa5db", "#7ac0e9", "#99cdeb"]; //cls1, edible

//override redcolor and bluecor
redcolor = ["#de2d26","#de2d26","#de2d26","#de2d26","#de2d26"];
bluecolor = ["#2ea017", "#2ea017","#2ea017","#2ea017","#2ea017"];

d3.select("#redColorSpans").selectAll('span').style('background-color', function(d, i){ return redcolor[i]})
d3.select("#blueColorSpans").selectAll('span').style('background-color', function(d, i){ return bluecolor[i]})
var sepLineColor = "#000"//"#9D1CE2"; // #9D1CE2 //#4FE21C
var maxDimLabWidth = 200;
var itemsetMap;
//2ca02c -> green
var attrColorScale = d3.scale.ordinal().domain(allFreqItem.children.map(function(d){ return d.name})).range(['#ff7f0e', '#1da07f', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#5699dc', '#63e2ef', '#efd11c', '#C3F600'])
var itemsetColorScale = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#1da07f", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"];
//createFreqItemTab();
var ftree = freqTree(allFreqItem, "freqDiv");



function createFreqItemTab(){
  var content = "<caption></caption>";
  for(i = 0; i < allFreqItem.length; i++){
    var it = allFreqItem[i].split('=');
    if(it[1] == '?') it[1] = '_';
    content += "<tr id =tr_" + it.join('_') +"><td><span style= '" + "background: " + itemsetColorScale[i%allFreqItem.length] + "'></span></td><td class='label'>"+ allFreqItem[i]+"</td></tr>";
  }
  $('#freqTab').append(content);
}
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




/*
[
"J4": {"cls1": [112,90,45], "cls2":[]},
"E3": {"cls1":[0,1,2,8,11], "cls2":[61,97]},
...
]
*/

//first sort obs, then rules
var mycomparator = function (obsSortby, obsSortDirection, ruleSortby, ruleSortDirection) {
  // obs sorting measure, asd
  // rule sorting measure, asd
  if(obsSortby == 'hitrule2mlength') {
    if(obsSortDirection == 10) { // descending
      var pureCls2inObsLab2 = lab2Obs.filter(function(d){ return d.ruleid.cls1.length == 0}),
          mixedCls2Cls1inObsLab2 = lab2Obs.filter(function(d){ return d.ruleid.cls1.length != 0}),

          pureCls1inObsLab1 = lab1Obs.filter(function(d){ return d.ruleid.cls2.length == 0}),
          mixedCls2Cls1inObsLab1 = lab1Obs.filter(function(d){ return d.ruleid.cls2.length != 0});

      pureCls2inObsLab2.sort(function(a, b){ return b.ruleid.cls2.length - a.ruleid.cls2.length });
      mixedCls2Cls1inObsLab2.sort(sortObsMixedTopCls2);
      pureCls1inObsLab1.sort(function(a, b){ return a.ruleid.cls1.length - a.ruleid.cls1.length });
      mixedCls2Cls1inObsLab1.sort(sortObsMixedTopCls2);
      lab2Obs = pureCls2inObsLab2.concat(mixedCls2Cls1inObsLab2);
      lab1Obs = mixedCls2Cls1inObsLab1.concat(pureCls1inObsLab1);
    } else {

    }
  } else if (obsSortby == 'hitrule1mlength'){
    if(obsSortDirection == 10) {
      var pureCls1inObsLab2 = lab2Obs.filter(function(d){ return d.ruleid.cls2.length == 0}),
          mixedCls2Cls1inObsLab2 = lab2Obs.filter(function(d){ return d.ruleid.cls2.length != 0}),
          pureCl11inObsLab1 = lab1Obs.filter(function(d){ return d.ruleid.cls2.length == 0}),
          mixedCls2Cls1inObsLab1 = lab1Obs.filter(function(d){ return d.ruleid.cls2.length != 0});

      pureCls1inObsLab2.sort(function(a, b){ return b.ruleid.cls1.length - a.ruleid.cls1.length });
      mixedCls2Cls1inObsLab2.sort(sortObsMixedTopCls1);
      pureCl11inObsLab1.sort(function(a, b){ return b.ruleid.cls1.length - a.ruleid.cls1.length });
      mixedCls2Cls1inObsLab1.sort(sortObsMixedTopCls1);
      lab2Obs = pureCls1inObsLab2.concat(mixedCls2Cls1inObsLab2);
      lab1Obs = pureCl11inObsLab1.concat(mixedCls2Cls1inObsLab1);
    } else {

    }
  } else if (obsSortby == 'hitrule2length'){
    if(obsSortDirection == 10) {

      lab2Obs.sort(sortObsTopCls2);
      lab1Obs.sort(sortObsTopCls2);

    } else {

    }
  } else if (obsSortby == 'hitrule1length'){
    if(obsSortDirection == 10) {
      lab2Obs.sort(sortObsTopCls1);
      lab1Obs.sort(sortObsTopCls1);
    } else {

    }
  }  else if (obsSortby == 'freqitem'){
    if(obsSortDirection == 10) {
      lab1Obs.sort(sortObsNumFreqitemD);
      lab2Obs.sort(sortObsNumFreqitemD);
    } else {
      lab1Obs.sort(sortObsNumFreqitemA);
      lab2Obs.sort(sortObsNumFreqitemA);
    }
  }



  if(ruleSortby == 'length'){
    if(ruleSortDirection == 10) {
      cls1Rule.sort(sortRuleLengthD);
      cls2Rule.sort(sortRuleLengthA);
    } else {
      cls1Rule.sort(sortRuleLengthA);
      cls2Rule.sort(sortRuleLengthD);
    }
  } else if (ruleSortby == 'support') {
    if(ruleSortDirection == 10) {
      cls1Rule.sort(sortRuleSuppA);
      cls2Rule.sort(sortRuleSuppD);
    } else {
      cls1Rule.sort(sortRuleSuppD);
      cls2Rule.sort(sortRuleSuppA);
    }
  } else if (ruleSortby == 'confidence') {
    if(ruleSortDirection == 10) {
      cls1Rule.sort(sortRuleConfA);
      cls2Rule.sort(sortRuleConfD);
    } else {
      cls1Rule.sort(sortRuleConfD);
      cls2Rule.sort(sortRuleConfA);
    }
  } else if (ruleSortby == 'lift') {
    if(ruleSortDirection == 10) {
      cls1Rule.sort(sortRuleLiftA);
      cls2Rule.sort(sortRuleLiftD);
    } else {
      cls1Rule.sort(sortRuleLiftD);
      cls2Rule.sort(sortRuleLiftA);
    }
  }

  //update rank attribute
  lab1Obs.forEach(function(o, i){
    o.rank = '1' + i;
  });
  lab2Obs.forEach(function(o, i){
    o.rank = '2' + i;
  });
  cls1Rule.forEach(function(r, i){
    r.rank = '1' + i;
  });
  cls2Rule.forEach(function(r, i){
    r.rank = '2' + i;
  })


  allObs = lab2Obs.concat(lab1Obs);
  allRules = cls2Rule.concat(cls1Rule);
  allObsMap = {};
  allRulesMap = {};

  for (var i = 0; i < allObs.length; i++){
    var o = allObs[i];
    allObsMap[o.idx] = o;
  }
  for (var i = 0; i < allRules.length; i++){
    var r = allRules[i];

    if(allRulesMap.hasOwnProperty(r.cls)){
      var oneRIdObj = allRulesMap[r.cls];
      oneRIdObj[r.id] = {it: r.it, m:r.m, cls: r.cls, id:r.id, rank: r.rank};

    } else {
      var tmp ={}
      tmp[r.id] = {it: r.it, m: r.m, cls: r.cls, id:r.id, rank: r.rank};
      allRulesMap[r.cls] = tmp;
    }
  }

  if(grid){
    grid.rules_ids = allRules.map(function(r){return r.cls + "_" + r.id});

    // get id by position
    grid.obsIdx = allObs.map(function(o) { return o.idx})

    // get position by id
    grid.ruleid_pos = {},
    grid.obsIdx_pos = {};

    grid.rules_ids.forEach(function(v, i){
      grid.ruleid_pos[v] = i;
    })
    grid.obsIdx.forEach(function(v, i){
      grid.obsIdx_pos[v] = i;
    })
  }


  function cmpA(a, b) { if(a > b) return 1; if(a < b) return -1; return 0};
  function cmpD(a, b) { if(a < b) return 1; if(a > b) return -1; return 0};

  // mixed, cls2 lists ahead des
  function sortObsMixedTopCls2(a, b){
    return cmpD(a.ruleid.cls2.length - a.ruleid.cls1.length, b.ruleid.cls2.length - b.ruleid.cls1.length);
  }

  // mixed, cls2 lists ahead asd
  function sortObsMixedTopCls1(a, b){
    return cmpD(a.ruleid.cls1.length - a.ruleid.cls2.length, b.ruleid.cls1.length - b.ruleid.cls2.length);
  }

  // cls2 lists ahead des
  function sortObsTopCls2(a, b){
    return cmpD(a.ruleid.cls2.length , b.ruleid.cls2.length);
  }

  // cls2 lists ahead asd
  function sortObsTopCls1(a, b){
    return cmpD(a.ruleid.cls1.length, b.ruleid.cls1.length);
  }

  function sortObsNumFreqitemA(a, b){
    return cmpA(a.freqItem.length, b.freqItem.length);
  }
  function sortObsNumFreqitemD(a, b){
    return cmpD(a.freqItem.length, b.freqItem.length);
  }


  function sortRuleConfD(a, b){
    return cmpD(a.m[1], b.m[1]);
  }
  function sortRuleConfA(a, b){
    return cmpA(a.m[1], b.m[1]);
  }
  function sortRuleLiftD(a, b){
    return cmpD(a.m[2], b.m[2]);
  }
  function sortRuleLiftA(a, b){
    return cmpA(a.m[2], b.m[2]);
  }
  function sortRuleSuppA(a, b){
    return cmpA(a.m[0][1], b.m[0][1]);
  }
  function sortRuleSuppD(a, b){
    return cmpD(a.m[0][1], b.m[0][1]);
  }
  function sortRuleLengthA(a, b){
    //return cmpA(a.it.length, b.it.length);

    if(a.it.length > b.it.length) return 1;
    if(a.it.length < b.it.length) return -1;
    if(a.m[1] > b.m[1]) return -1;
    if(a.m[1] < b.m[1]) return 1;
    return 0;
  }

  function sortRuleLengthD(a, b){
    //return cmpD(a.it.length, b.it.length);

    if(a.it.length > b.it.length) return -1;
    if(a.it.length < b.it.length) return 1;
    if(a.m[1] > b.m[1]) return 1;
    if(a.m[1] < b.m[1]) return -1;
    return 0;
  }

}


//count red/blue region height

var pureRedCt = 0, redblueLab2Ct = 0, redblueLab1Ct = 0, pureBlue = 0;
lab2Obs.forEach(function(d){
  if(d.ruleid.cls1.length == 0 && d.ruleid.cls2.length !=0) {
    pureRedCt ++;
  } else if(d.ruleid.cls1.length != 0 && d.ruleid.cls2.length !=0){
    redblueLab2Ct ++;
  }
})

lab1Obs.forEach(function(d){
  if(d.ruleid.cls2.length == 0 && d.ruleid.cls1.length !=0) {
    pureBlue ++;
  } else if(d.ruleid.cls1.length != 0 && d.ruleid.cls2.length !=0){
    redblueLab1Ct ++;
  }
})

var quickSelectorAry = [pureRedCt, redblueLab2Ct, redblueLab1Ct, pureBlue];

mycomparator('hitrule2mlength', 10, 'length', 10);


var cls1_conf_ext = d3.extent(cls1Rule, function(d){return d.m[1]}),
    cls2_conf_ext = d3.extent(cls2Rule, function(d){return d.m[1]});
var cls1_len_ext = d3.extent(cls1Rule, function(d){return d.it.length}),
    cls2_len_ext = d3.extent(cls2Rule, function(d){return d.it.length});
var cls1_color = d3.scale.linear().domain(cls1_len_ext).clamp(true).range([0, 4]),
  cls2_color = d3.scale.linear().domain(cls2_len_ext).clamp(true).range([0, 4]);

var color1Helper = function(rule){ return cls1_color(rule.it.length)},
    color2Helper = function(rule){ return cls2_color(rule.it.length)};

function zoomed() {
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);




var cvs = 'barcode';
var grid = new CanvasCrossTable(cvs, {
        defaultColor: '#ffffff', // must be hex and lowercase
        w: width,
        h: cvsHeight,
        colData: allRules,
        rowData: allObs
    });

//grid.drawGridLines();
grid.fill();
//horizontal
// lab2 goes first
grid.drawLine(0, lab2Obs.length, grid.colData.length, lab2Obs.length, sepLineColor);

// lab1 goes first
//grid.drawLine(0, grid.allObsLab1.length, grid.colData.length, grid.allObsLab1.length, sepLineColor);

//vertical
//cls1 goes first
//grid.drawLine(cls1Rule.length, 0, cls1Rule.length, allObs.length, sepLineColor);
//cls2 goes first
grid.drawLine(cls2Rule.length, 0, cls2Rule.length, grid.rowData.length, sepLineColor);

$('input[name=sortObs]:radio').change(function(){
  //console.log(this.value);

  mycomparator(this.value, 10, "", 10);


  d3.select('#tabs-1').selectAll('svg g').remove();
  d3.select('#tabs-1').selectAll('svg line').remove();

  //d3.select('#grid_itemset').select('svg').selectAll('g').remove();

  d3.selectAll(".brush").call(brushSelect.clear());

  //descGrid.invalidateAllRows()

  grid.updateData(allRules, allObs);
  grid.clearAll();
  grid.fill();
  grid.drawLine(0, lab2Obs.length, grid.colData.length, lab2Obs.length, sepLineColor);
  grid.drawLine(cls2Rule.length, 0, cls2Rule.length, grid.rowData.length, sepLineColor);
  addRuleBG();

  //

  if(this.value == 'hitrule2mlength'){
    var pureredup_tds = "<caption></caption> <tr> <td></td> <td class='righttd'>Poisonous Rules</td> <td>Edible Rules </td> </tr> <tr pos='up1'> <td class='bottomtd' rowspan='2'>Poisonous Mushrooms</td> <td pos='red'> <span style='background: #de2d26'></span></td> <td pos='white' class='lefttd'><span style='background: white; border: gray solid 1px;'></span></td> </tr> <tr pos='up2'> <td pos='red' class='bottomtd'> <span style='background: #de2d26'></span></td> <td pos='blue' class='lefttd'><span style='background: #2ea017'></span></td> </tr> <tr pos='down1'> <td rowspan='2'>Edible Mushrooms</td> <td pos='red' class='righttd'> <span style='background: #de2d26'></span></td> <td pos='blue' class='toptd'><span style='background: #2ea017'></span></td> </tr> <tr pos='down2'> <td pos='white' class='righttd'> <span style='background: white;border: gray solid 1px;'></span></td> <td pos='blue'><span style='background: #2ea017'></span></td> </tr>";
    d3.select('#crossTab').html(pureredup_tds)
  } else if(this.value == 'hitrule1mlength'){
    var redblueup_tds = " <caption></caption> <tr> <td></td> <td class='righttd'>Poisonous Rules</td> <td>Edible Rules </td> </tr> <tr pos='up1'> <td class='bottomtd' rowspan='2'>Poisonous Mushrooms</td> <td pos='red'> <span style='background: #de2d26'></span></td> <td pos='blue' class='lefttd'><span style='background: #2ea017'></span></td> </tr> <tr pos='up2'> <td pos='red' class='bottomtd'> <span style='background: #de2d26'></span></td> <td pos='white' class='lefttd'><span style='background: white; border: gray solid 1px;'></span></td> </tr> <tr pos='down1'> <td rowspan='2'>Edible Mushrooms</td> <td pos='white' class='righttd'> <span style='background: white;border: gray solid 1px; margin-top: 1px;'></span></td> <td pos='blue' class='toptd'><span style='background: #2ea017'></span></td> </tr> <tr pos='down2'> <td pos='red' class='righttd'> <span style='background: #de2d26'></span></td> <td pos='blue'><span style='background: #2ea017'></span></td> </tr>";
    d3.select('#crossTab').html(redblueup_tds)
  } else {
    var sintds = "<caption></caption> <tr> <td></td> <td class='righttd'>Poisonous Rules</td> <td>Edible Rules </td> </tr> <tr> <td class='bottomtd' >Poisonous Mushrooms</td> <td class='bottomtd'> <span style='background: #de2d26'></span></td> <td class='lefttd'><span style='background: #2ea017'></span></td> </tr> <tr> <td>Edible Mushrooms</td> <td class='righttd'> <span style='background: #de2d26'></span></td> <td class='toptd'><span style='background: #2ea017'></span></td> </tr> ";
    d3.select('#crossTab').html(sintds)
  }

  addTdNav(this.value);

})


d3.select('#tabs-1').select('svg')
      .attr("width", width)
      .attr("height", cvsHeight)

addTdNav('hitrule2mlength');

function addTdNav(obsSortby){
  if(obsSortby == 'hitrule2mlength'){

    d3.selectAll('td').filter(function(d){ return d3.select(this.parentNode).attr('pos') == 'up1'}).selectAll('span')
      .on('click', function(){
        d3.event.stopPropagation();
        //var clickColor = d3.select(this.parentNode).attr('pos');
        //if(clickColor == 'white') return;
        if(d3.select(this).html() != ''){ // red was already clicked
          d3.select(this).html('');
          clearCentralVis();
        } else if (d3.select(this.parentNode).attr('pos') == 'white'){ // if current click is white
          return;
        } else {
          d3.select('#crossTab').selectAll('span').html('');
          d3.select(this).html('&#x2611');
          if(d3.select(this.parentNode).attr('pos') == 'red'){
            //console.log("select up1 red")
            clickNavToBrush(obsSortby, 'up1', ['red']);
          }
        }
      })

    d3.selectAll('td').filter(function(d){ return d3.select(this.parentNode).attr('pos') == 'up2'}).selectAll('span')
      .on('click', function(){
        d3.event.stopPropagation();
        if(d3.select(this).html() != ''){
          d3.select(this).html('');
          if(d3.select(this.parentNode.parentNode).selectAll('td').filter(function(d){return d3.select(this).attr('pos') == 'blue'}).select('span').html() != ''){ // previously, the current tr was clicked
            //console.log('up2 blue')
            clickNavToBrush(obsSortby, 'up2', ['blue']);
          } else if(d3.select(this.parentNode.parentNode).selectAll('td').filter(function(d){return d3.select(this).attr('pos') == 'red'}).select('span').html() != ''){
            //console.log('up2 red')
            clickNavToBrush(obsSortby, 'up2', ['red']);
          } else {
            clearCentralVis();
          }

        } else {
          d3.select('#crossTab').selectAll('span').html('');
          d3.select(this).html('&#x2611');
          if(d3.select(this.parentNode).attr('pos') == 'red'){
            //console.log("select up2 red")
            clickNavToBrush(obsSortby, 'up2', ['red']);
          } else{
            //console.log("select up2 blue")
            clickNavToBrush(obsSortby, 'up2', ['blue']);
          }
        }
      })

    d3.selectAll('td').filter(function(d){ return d3.select(this.parentNode).attr('pos') == 'down1'}).selectAll('span')
      .on('click', function(){
        d3.event.stopPropagation();
        if(d3.select(this).html() != ''){
          d3.select(this).html('');
          if(d3.select(this.parentNode.parentNode).selectAll('td').filter(function(d){return d3.select(this).attr('pos') == 'blue'}).select('span').html() != ''){ // previously, the current tr was clicked
            //console.log('down1 blue')
            clickNavToBrush(obsSortby, 'down1', ['blue']);
          } else if(d3.select(this.parentNode.parentNode).selectAll('td').filter(function(d){return d3.select(this).attr('pos') == 'red'}).select('span').html() != ''){
            //console.log('down1 red')
            clickNavToBrush(obsSortby, 'down1', ['red']);
          } else {
            clearCentralVis();
          }
        } else {
          d3.select('#crossTab').selectAll('span').html('');
          d3.select(this).html('&#x2611');
          if(d3.select(this.parentNode).attr('pos') == 'red'){
            //console.log("select down1 red")
            clickNavToBrush(obsSortby, 'down1', ['red']);
          } else{
            //console.log("select down1 blue")
            clickNavToBrush(obsSortby, 'down1', ['blue']);
          }
        }
      })

    d3.selectAll('td').filter(function(d){ return d3.select(this.parentNode).attr('pos') == 'down2'}).selectAll('span')
      .on('click', function(){
        d3.event.stopPropagation();
        if(d3.select(this).html() != ''){ // blue was already clicked
          d3.select(this).html('');
          clearCentralVis();
        } else if (d3.select(this.parentNode).attr('pos') == 'white'){ // if current click is white
          return;
        } else {
          d3.select('#crossTab').selectAll('span').html('');
          d3.select(this).html('&#x2611');
          if(d3.select(this.parentNode).attr('pos') == 'blue'){
            //console.log("select down2 blue")
            clickNavToBrush(obsSortby, 'down2', ['blue']);
          }
        }
      })

    d3.selectAll('tr').filter(function(d){ return d3.select(this).attr('pos') != ''})
      .on('click', function(){
        var pos = (d3.select(this).attr('pos'))
        if(pos == 'up2'){
          var redspan = d3.select(this).selectAll('td').filter(function(){ return d3.select(this).attr('pos') == 'red'}).select('span'),
              bluespan = d3.select(this).selectAll('td').filter(function(){ return d3.select(this).attr('pos') == 'blue'}).select('span');


          if(redspan.html() == '' || bluespan.html() ==''){
            d3.select('#crossTab').selectAll('span').html('');
            d3.select(this).selectAll('span').html('&#x2611')
            //console.log('up2 red and blue ')
            clickNavToBrush(obsSortby, 'up2', ['red', 'blue']);

          } else{
            d3.select('#crossTab').selectAll('span').html('');

          }

        } else if(pos == 'down1'){
          var redspan = d3.select(this).selectAll('td').filter(function(){ return d3.select(this).attr('pos') == 'red'}).select('span'),
              bluespan = d3.select(this).selectAll('td').filter(function(){ return d3.select(this).attr('pos') == 'blue'}).select('span');


          if(redspan.html() == '' || bluespan.html() ==''){
            d3.select('#crossTab').selectAll('span').html('');
            d3.select(this).selectAll('span').html('&#x2611')
            //console.log('down1 red and blue ')
            clickNavToBrush(obsSortby, 'down1', ['red', 'blue']);

          } else{
            d3.select('#crossTab').selectAll('span').html('');

          }

        }

      })

  } else if (obsSortby == 'hitrule1mlength'){ // sort by Edible rules mixed

    d3.selectAll('td').filter(function(d){ return d3.select(this.parentNode).attr('pos') == 'up2'}).selectAll('span')
      .on('click', function(){
        d3.event.stopPropagation();
        //var clickColor = d3.select(this.parentNode).attr('pos');
        //if(clickColor == 'white') return;
        if(d3.select(this).html() != ''){ // red was already clicked
          d3.select(this).html('');
          clearCentralVis();
        } else if (d3.select(this.parentNode).attr('pos') == 'white'){ // if current click is white
          return;
        } else {
          d3.select('#crossTab').selectAll('span').html('');
          d3.select(this).html('&#x2611');
          if(d3.select(this.parentNode).attr('pos') == 'red'){
            //console.log("select up1 red")
            clickNavToBrush(obsSortby, 'up2', ['red']);
          }
        }
      })

    d3.selectAll('td').filter(function(d){ return d3.select(this.parentNode).attr('pos') == 'up1'}).selectAll('span')
      .on('click', function(){
        d3.event.stopPropagation();
        if(d3.select(this).html() != ''){
          d3.select(this).html('');
          if(d3.select(this.parentNode.parentNode).selectAll('td').filter(function(d){return d3.select(this).attr('pos') == 'blue'}).select('span').html() != ''){ // previously, the current tr was clicked
            //console.log('up2 blue')
            clickNavToBrush(obsSortby, 'up1', ['blue']);
          } else if(d3.select(this.parentNode.parentNode).selectAll('td').filter(function(d){return d3.select(this).attr('pos') == 'red'}).select('span').html() != ''){
            //console.log('up2 red')
            clickNavToBrush(obsSortby, 'up1', ['red']);
          } else {
            clearCentralVis();
          }

        } else {
          d3.select('#crossTab').selectAll('span').html('');
          d3.select(this).html('&#x2611');
          if(d3.select(this.parentNode).attr('pos') == 'red'){
            //console.log("select up2 red")
            clickNavToBrush(obsSortby, 'up1', ['red']);
          } else{
            //console.log("select up2 blue")
            clickNavToBrush(obsSortby, 'up1', ['blue']);
          }
        }
      })

    d3.selectAll('td').filter(function(d){ return d3.select(this.parentNode).attr('pos') == 'down2'}).selectAll('span')
      .on('click', function(){
        d3.event.stopPropagation();
        if(d3.select(this).html() != ''){
          d3.select(this).html('');
          if(d3.select(this.parentNode.parentNode).selectAll('td').filter(function(d){return d3.select(this).attr('pos') == 'blue'}).select('span').html() != ''){ // previously, the current tr was clicked
            //console.log('down1 blue')
            clickNavToBrush(obsSortby, 'down2', ['blue']);
          } else if(d3.select(this.parentNode.parentNode).selectAll('td').filter(function(d){return d3.select(this).attr('pos') == 'red'}).select('span').html() != ''){
            //console.log('down1 red')
            clickNavToBrush(obsSortby, 'down2', ['red']);
          } else {
            clearCentralVis();
          }
        } else {
          d3.select('#crossTab').selectAll('span').html('');
          d3.select(this).html('&#x2611');
          if(d3.select(this.parentNode).attr('pos') == 'red'){
            //console.log("select down1 red")
            clickNavToBrush(obsSortby, 'down2', ['red']);
          } else{
            //console.log("select down1 blue")
            clickNavToBrush(obsSortby, 'down2', ['blue']);
          }
        }
      })

    d3.selectAll('td').filter(function(d){ return d3.select(this.parentNode).attr('pos') == 'down1'}).selectAll('span')
      .on('click', function(){
        d3.event.stopPropagation();
        if(d3.select(this).html() != ''){ // blue was already clicked
          d3.select(this).html('');
          clearCentralVis();
        } else if (d3.select(this.parentNode).attr('pos') == 'white'){ // if current click is white
          return;
        } else {
          d3.select('#crossTab').selectAll('span').html('');
          d3.select(this).html('&#x2611');
          if(d3.select(this.parentNode).attr('pos') == 'blue'){
            //console.log("select down2 blue")
            clickNavToBrush(obsSortby, 'down1', ['blue']);
          }
        }
      })

    d3.selectAll('tr').filter(function(d){ return d3.select(this).attr('pos') != ''})
      .on('click', function(){
        var pos = (d3.select(this).attr('pos'))
        if(pos == 'up1'){
          var redspan = d3.select(this).selectAll('td').filter(function(){ return d3.select(this).attr('pos') == 'red'}).select('span'),
              bluespan = d3.select(this).selectAll('td').filter(function(){ return d3.select(this).attr('pos') == 'blue'}).select('span');


          if(redspan.html() == '' || bluespan.html() ==''){
            d3.select('#crossTab').selectAll('span').html('');
            d3.select(this).selectAll('span').html('&#x2611')
            //console.log('up2 red and blue ')
            clickNavToBrush(obsSortby, 'up1', ['red', 'blue']);

          } else{
            d3.select('#crossTab').selectAll('span').html('');

          }

        } else if(pos == 'down2'){
          var redspan = d3.select(this).selectAll('td').filter(function(){ return d3.select(this).attr('pos') == 'red'}).select('span'),
              bluespan = d3.select(this).selectAll('td').filter(function(){ return d3.select(this).attr('pos') == 'blue'}).select('span');


          if(redspan.html() == '' || bluespan.html() ==''){
            d3.select('#crossTab').selectAll('span').html('');
            d3.select(this).selectAll('span').html('&#x2611')
            //console.log('down1 red and blue ')
            clickNavToBrush(obsSortby, 'down2', ['red', 'blue']);

          } else{
            d3.select('#crossTab').selectAll('span').html('');

          }

        }

      })

  } else {
    return;
  }

}


function clearCentralVis(){
  creatSVGgrid([], []);
  displayRawData([]);
  //itemsetMap = createRuleMap([]);
  highlightFreqItemList([]);
  keepTab0Only();
}




function clickNavToBrush(obsSortby, trPos, tdColors){
  //console.log(obsSortby)
  var x0,
      y0,
      x1,
      y1;

  if(obsSortby == 'hitrule2mlength'){
    if(trPos == 'up1'){
      // select up1 red obs and rules
      //
      // change x0, y0, x1, y1
      console.log('select up1 red obs and rules')

      x0 = 0;
      y0 = 0;
      y1 = cvsHeight/allObs.length * lab2Obs.filter(function(d){ return d.ruleid.cls1.length == 0}).length;
      x1 = width/allRules.length * cls2Rule.length;

    } else if(trPos == "up2"){

      if(tdColors.length == 1){
        var color = tdColors[0];
        // select up2 red/blue obs and rules
        console.log('select up2 red/blue obs and rules')
        if(tdColors[0] == 'red'){
          x0 = 0;
          y0 = cvsHeight/allObs.length * lab2Obs.filter(function(d){ return d.ruleid.cls1.length == 0}).length;
          y1 = cvsHeight/allObs.length * lab2Obs.length;
          x1 = width/allRules.length * cls2Rule.length;
        } else {
          x0 = width/allRules.length * cls2Rule.length;
          y0 = cvsHeight/allObs.length * lab2Obs.filter(function(d){ return d.ruleid.cls1.length == 0}).length;
          y1 = cvsHeight/allObs.length * lab2Obs.length;
          x1 = width;
        }


      } else {
        // select up2 red and blue obs and rules
        console.log('select up2 red and blue obs and rules')
        x0 = 0;
        y0 = cvsHeight/allObs.length * lab2Obs.filter(function(d){ return d.ruleid.cls1.length == 0}).length;
        y1 = cvsHeight/allObs.length * lab2Obs.length;
        x1 = width;

      }

    } else if(trPos == 'down1') {
      if(tdColors.length == 1){
        var color = tdColors[0];
        // select down1 red/blue obs and rules
        console.log('select down1 red/blue obs and rules')
        if(tdColors[0] == 'red'){
          x0 = 0;
          y0 = cvsHeight/allObs.length * lab2Obs.length;
          y1 = cvsHeight - cvsHeight/allObs.length * lab1Obs.filter(function(d){ return d.ruleid.cls2.length == 0}).length;
          x1 = width/allRules.length * cls2Rule.length;
        } else {
          x0 = width/allRules.length * cls2Rule.length;
          y0 = cvsHeight/allObs.length * lab2Obs.length;
          y1 = cvsHeight - cvsHeight/allObs.length * lab1Obs.filter(function(d){ return d.ruleid.cls2.length == 0}).length;
          x1 = width;
        }
      } else {
        // select down1 red and blue obs and rules
        console.log('select down1 red and blue obs and rules')
        x0 = 0;
        y0 = cvsHeight/allObs.length * lab2Obs.length;
        y1 = cvsHeight - cvsHeight/allObs.length * lab1Obs.filter(function(d){ return d.ruleid.cls2.length == 0}).length;
        x1 = width;
      }
    } else {
      // select down2 blue obs and rules
      console.log('select down2 blue obs and rules')
      x0 = width/allRules.length * cls2Rule.length;
      y0 = cvsHeight - cvsHeight/allObs.length * lab1Obs.filter(function(d){ return d.ruleid.cls2.length == 0}).length;
      x1 = width;
      y1 = cvsHeight;
    }
  } else if (obsSortby == 'hitrule1mlength'){
    // TODO
    if(trPos == 'up2'){
      // select up1 red obs and rules
      //
      // change x0, y0, x1, y1
      console.log('select up2 red obs and rules')

      x0 = 0;
      y0 = cvsHeight/allObs.length * (lab2Obs.length - lab2Obs.filter(function(d){ return d.ruleid.cls1.length == 0}).length);
      y1 = cvsHeight/allObs.length * lab2Obs.length;
      x1 = width/allRules.length * cls2Rule.length;

    } else if(trPos == "up1"){

      if(tdColors.length == 1){
        var color = tdColors[0];
        // select up2 red/blue obs and rules
        console.log('select up1 red/blue obs and rules')
        if(tdColors[0] == 'red'){
          x0 = 0;
          y0 = 0;
          y1 = cvsHeight/allObs.length * (lab2Obs.length - lab2Obs.filter(function(d){ return d.ruleid.cls1.length == 0}).length);
          x1 = width/allRules.length * cls2Rule.length;
        } else {
          x0 = width/allRules.length * cls2Rule.length;
          y0 = 0;
          y1 = cvsHeight/allObs.length * (lab2Obs.length - lab2Obs.filter(function(d){ return d.ruleid.cls1.length == 0}).length);
          x1 = width;
        }


      } else {
        // select up1 red and blue obs and rules
        console.log('select up1 red and blue obs and rules')
        x0 = 0;
        y0 = 0;
        y1 = cvsHeight/allObs.length * (lab2Obs.length - lab2Obs.filter(function(d){ return d.ruleid.cls1.length == 0}).length);
        x1 = width;

      }

    } else if(trPos == 'down2') {
      if(tdColors.length == 1){
        var color = tdColors[0];
        // select down2 red/blue obs and rules
        console.log('select down2 red/blue obs and rules')
        if(tdColors[0] == 'red'){
          x0 = 0;
          y0 = cvsHeight/allObs.length * (lab2Obs.length + lab1Obs.filter(function(d){ return d.ruleid.cls2.length == 0}).length);
          y1 = cvsHeight;
          x1 = width/allRules.length * cls2Rule.length;
        } else {
          x0 = width/allRules.length * cls2Rule.length;
          y0 = cvsHeight/allObs.length * (lab2Obs.length + lab1Obs.filter(function(d){ return d.ruleid.cls2.length == 0}).length);
          y1 = cvsHeight;
          x1 = width;
        }
      } else {
        // select down2 red and blue obs and rules
        console.log('select down2 red and blue obs and rules')
        x0 = 0;
        y0 = cvsHeight/allObs.length * (lab2Obs.length + lab1Obs.filter(function(d){ return d.ruleid.cls2.length == 0}).length);
        y1 = cvsHeight;
        x1 = width;
      }
    } else {
      // select down1 blue obs and rules
      console.log('select down1 blue obs and rules')
      x0 = width/allRules.length * cls2Rule.length;
      y0 = cvsHeight/allObs.length * lab2Obs.length;
      x1 = width;
      y1 = cvsHeight/allObs.length * (lab2Obs.length + lab1Obs.filter(function(d){ return d.ruleid.cls2.length == 0}).length);

    }

  } else {
    return;
  }

  d3.select('#bsvg').select('.extent')
    .attr('x', x0)
    .attr('y', y0)
    .attr('width', x1 - x0)
    .attr('height', y1 - y0)



  var obsWithinExt = [],
      ruleWithinExt = [],
      ruleIdxWithinExt = {},
      obsIdxWithinExt = {},
      tmpRuleIdx = {},
      tmpObsIdx = {};
  for (var i = x0; i <= x1; i = i + grid.cellWidth) {
    tmpRuleIdx[Math.floor(i/grid.cellWidth)] = true;
  }
  for (var j = y0; j <= y1; j = j + grid.cellHeight) {
    tmpObsIdx[Math.floor(j/grid.cellHeight)] = true;
  }
  // using another way to check
  for (var i in tmpObsIdx){
    //var o = allObs[grid.obsIdx[Math.floor(i/grid.cellHeight)]];
    var o = allObs[i];
    for (var j in tmpRuleIdx){
      //var rclsrid = grid.rules_ids[Math.floor(j/grid.cellWidth)],
      var r = allRules[j],
          rcls = r.cls,
          rid = +r.id,
          ruleids = o.ruleid[rcls];

      if(ruleids.indexOf(rid) != -1){
        ruleIdxWithinExt[rcls + '_' + rid] = true;
        obsIdxWithinExt[o.idx] = true;

      }
    }
  }


  for(var rclsrid in ruleIdxWithinExt) {
    var rcls = rclsrid.split('_')[0],
        rid = rclsrid.split('_')[1];
    ruleWithinExt.push(allRulesMap[rcls][rid]);

  }

  for(var oidx in obsIdxWithinExt){
    obsWithinExt.push(allObsMap[oidx]);
  }

  var includedFreqItems = [];
  for(var i = 0; i < ruleWithinExt.length; i++){
    includedFreqItems = includedFreqItems.concat(ruleWithinExt[i].it)
  }
  creatSVGgrid(ruleWithinExt, obsWithinExt);
  displayRawData(Object.keys(obsIdxWithinExt));
  //itemsetMap = createRuleMap(ruleWithinExt);
  highlightFreqItemList(includedFreqItems);
  keepTab0Only();


}

$('input[name=sortRule]:radio').change(function(){

  mycomparator("", 10, this.value, 10);


  d3.select('#tabs-1').selectAll('svg g').remove();
  d3.select('#tabs-1').selectAll('svg line').remove();

  //d3.select('#grid_itemset').select('svg').selectAll('g').remove();

  d3.selectAll(".brush").call(brushSelect.clear());

  //descGrid.invalidateAllRows()

  grid.updateData(allRules, allObs);
  grid.clearAll();
  grid.fill();
  grid.drawLine(0, lab2Obs.length, grid.colData.length, lab2Obs.length, sepLineColor);
  grid.drawLine(cls2Rule.length, 0, cls2Rule.length, grid.rowData.length, sepLineColor);

  addRuleBG();

  rulebg_scale = d3.scale.ordinal().rangeBands([0, width], 0.1).domain(allRules.map(function(r){return r.cls+"_"+r.id}));
  itemsetsvg.select("g").selectAll(".itemg")
     .attr("transform", function(d){ return "translate(" + (rulebg_scale(d.cls + "_" + d.id)  ) + ", 0)" })
      //.call(d3.helper.tooltipItemRect())

})



var rulebg_scale = d3.scale.ordinal().rangeBands([0, width], 0.1).domain(allRules.map(function(r){return r.cls+"_"+r.id}));

var rulebg_scale_step = (rulebg_scale.rangeExtent()[1] - rulebg_scale.rangeExtent()[0])/rulebg_scale.domain().length - 0.1 + 2 * 0.1;
// itemsetPadding is based on rulebg_scale, can be smaller
var itemsetRectWidth = rulebg_scale.rangeBand() -2, itemsetRectHeight = itemsetRectWidth, itemsetPadding = rulebg_scale_step - rulebg_scale.rangeBand() +2;



var brushSelect = d3.svg.brush()
  .x(xScale)
  .y(yScale)
  //.clamp(true)
  .on("brushstart", function() {
    /*
      d3.selectAll('.row').each(function(d) {
          d.previouslySelected = self.shiftKey && d.selected;
      });
    */
    d3.selectAll('.arrow').style("fill", null);

  })
  .on("brushend", function() {
    var extent = d3.event.target.extent();

    var x0 = extent[0][0],
        y0 = extent[0][1],
        x1 = extent[1][0],
        y1 = extent[1][1];



    /*
    var startX = Math.floor(x0/grid.cellWidth),
        endX = Math.floor(x1/grid.cellWidth),
        startY = Math.floor(y0/grid.cellHeight),
        endY = Math.floor(y1/grid.cellHeight);
    */
    //console.log('startX: ', startX, 'endX: ', endX, 'startY: ', startY, 'endY: ', endY);
    // x  , from 0 to rules.length
    // y , from 0 to obs.length
    // pos = {x: xi * grid.cellWidth + 1, y: yj * grid.cellHeight + 0.01}
    // grid.getColorByPos(pos)
    //
    // 1. quardtree search
    // 2. maybe problem with canvas drawing, bcz color is not a match
    // 3. kineticjs/fabric/paperjs

    //console.log('startX: ', x0, 'endX: ', x1, 'startY: ', y0, 'endY: ', y1);

    var obsWithinExt = [],
        ruleWithinExt = [],
        ruleIdxWithinExt = {},
        obsIdxWithinExt = {},
        tmpRuleIdx = {},
        tmpObsIdx = {};

    //var s = Date.now();


    for (var i = x0; i <= x1; i = i + grid.cellWidth) {
      //tmpRuleIdx[i] = true;
      tmpRuleIdx[Math.abs(Math.floor(i/grid.cellWidth))] = true;
    }

    for (var j = y0; j <= y1; j = j + grid.cellHeight) {
      // tmpObsIdx[j] = true;
      tmpObsIdx[Math.abs(Math.floor(j/grid.cellHeight))] = true;
    }

    /*
    for (var i in tmpRuleIdx){
      for (var j in tmpObsIdx){
        var testPos = {x: i, y: j};
        if(grid.getColorByPos(testPos) != "#000000"){
            ruleIdxWithinExt[grid.rules_ids[Math.floor(i/grid.cellWidth)]] = true;
            obsIdxWithinExt[grid.obsIdx[Math.floor(j/grid.cellHeight)]] = true;

          }
      }
    }
    */

    //console.log("3focus rules:" + Object.keys(ruleIdxWithinExt));
    //console.log("3focus obs:" + Object.keys(obsIdxWithinExt));
    //console.log('Took: ', Date.now()-s);

    /* deprecated due to slow
    var ruleIdxWithinExt = {},
        obsIdxWithinExt = {};
    var s = Date.now();

    for (var i = x0; i <= x1; i = i + grid.cellWidth) {
      var ii = Math.floor(i),
          r = grid.rules_ids[Math.floor(ii/grid.cellWidth)];
      //if (r){
        for (var j = y0; j <= y1; j = j + grid.cellHeight) {
          var jj = Math.floor(j),
              testPos = {x: ii, y: jj},
              oId = Math.floor(jj/grid.cellHeight);
          //if(grid.obsIdx[oId]){
            if(grid.getColorByPos(testPos) != "#000000" ){
              ruleIdxWithinExt[r] = true;
          //  }

            obsIdxWithinExt[grid.obsIdx[oId]] = true;

          }
        }
      //}
    }

    console.log("2focus rules:" + Object.keys(ruleIdxWithinExt));
    console.log("2focus obs:" + Object.keys(obsIdxWithinExt));
    console.log('Took: ', Date.now()-s);

    */

    // using another way to check
    for (var i in tmpObsIdx){
      //var o = allObs[grid.obsIdx[Math.floor(i/grid.cellHeight)]];
      var o = allObs[i];
      for (var j in tmpRuleIdx){
        //var rclsrid = grid.rules_ids[Math.floor(j/grid.cellWidth)],
        var r = allRules[j],
            rcls = r.cls,
            rid = +r.id,
            ruleids = o.ruleid[rcls];

        if(ruleids.indexOf(rid) != -1){
          ruleIdxWithinExt[rcls + '_' + rid] = true;
          obsIdxWithinExt[o.idx] = true;

        }
      }
    }



    for(var rclsrid in ruleIdxWithinExt) {
      var rcls = rclsrid.split('_')[0],
          rid = rclsrid.split('_')[1];
      ruleWithinExt.push(allRulesMap[rcls][rid]);

    }

    for(var oidx in obsIdxWithinExt){
      obsWithinExt.push(allObsMap[oidx]);
    }

    var includedFreqItems = [];
    for(var i = 0; i < ruleWithinExt.length; i++){
      includedFreqItems = includedFreqItems.concat(ruleWithinExt[i].it)
    }
    /*
    var obsWithinExt = [],
        ruleWithinExt = [],
        ruleIdxWithinExt = {},
        obsIdxWithinExt = {};

    for (var i = x0; i <= x1; i ++) {
      var r = grid.rules_ids[Math.floor(i/grid.cellWidth)];
      if(r){
        var rcls = r.split('_')[0],
            rid = r.split('_')[1];
        ruleIdxWithinExt[r] = true;
        //ruleWithinExt.push(allRulesMap[rcls][rid]);
      }
    }


    for (var i = y0; i <= y1; i ++) {
      var oId = Math.floor(i/grid.cellHeight);
      if(grid.obsIdx[oId]){
        obsIdxWithinExt[grid.obsIdx[oId]] = true;
        //obsWithinExt.push(allObsMap[grid.obsIdx[oId]]);
      }
    }

    console.log("1focus rules:" + Object.keys(ruleIdxWithinExt));
    console.log("1focus obs:" + Object.keys(obsIdxWithinExt));
    */
    //console.log("focus rules:" + Object.keys(ruleIdxWithinExt));

    creatSVGgrid(ruleWithinExt, obsWithinExt);
    //displayRawData(Object.keys(obsIdxWithinExt));
    //itemsetMap = createRuleMap(ruleWithinExt);
    highlightFreqItemList(includedFreqItems);



    keepTab0Only();

    /*

    posX = Math.floor(x/grid.cellWidth), posY = Math.floor(y/grid.cellHeight) for x,y in extent
    grid.ruleid_pos[(?)=posX
    grid.obsIdx.indexOf(?)=poxY
    */



  })
  /*
  .on("brushend", function() {


  });
  */


var rootsvg = d3.select('#bsvg')
  .attr("width", width)
  .attr("height", cvsHeight)


var maxLenRule =-1;
allRules.forEach(function(r){ if(maxLenRule < r.it.length) maxLenRule = r.it.length});


var itemsetsvg = d3.select("#itemSVG")
  .attr("width", width)
  .attr("height", maxLenRule * (itemsetRectWidth +itemsetPadding)) //affect background_svg margin_top calculation


var itemsetg = itemsetsvg.append("g");
var itemsGroup = itemsetg.selectAll("g")
  .data(allRules)
  .enter().append("g")
  .attr('class', 'itemg')
  .attr("transform", function(d){ return "translate(" + (rulebg_scale(d.cls + "_" + d.id) ) + ", 0)" });

var itemGroup = itemsGroup.selectAll('.g')
  .data(function(d){
    return d.it.map(function(i){ 
      return {item: i, rcls: d.cls, rid: d.id, m: d.m}
    })}).enter()
    .append('g')
    .attr("transform", function(d, i){return "translate(0, "+ i * (itemsetRectHeight + itemsetPadding) +")"})
    .style('cursor', 'pointer')
    .style('pointer-events', 'all')
    .call(d3.helper.tooltipItemRect())
   

itemGroup.append('text')
 .attr("dy","1em")
 .attr('dx', '.4em')

 //.style('fill', '#fff')
  .text(function(d){ return d.item.split('=')[1] })
      .on("click", selectRules);

var itemRect = itemGroup.insert('rect', 'text')
    .attr("width", itemsetRectWidth)
    .attr("height", itemsetRectHeight)    
    .attr('class', function(d){ return "itemRect " + d.item.split('=')[0] + ' itrect' + "_" + d.rcls + '_' + d.rid})
    .style('fill', function(d){ return attrColorScale(d.item.toLowerCase().split('=')[0])})
    .on("click", selectRules);


function selectRules(clickedD){

  var curColor = d3.rgb("#FFC300"), // d3.select(this).style("fill"),
      crgb = d3.rgb(curColor);
   
  rootsvg.selectAll('.rulebg').style("display", null);
  //unselect
  if(d3.select('#rulebg_' + clickedD.rcls + "_" + clickedD.rid).classed('highltRule')){
    // select a different item on the selected rule
    if(d3.select(this.parentNode).select('rect').classed('highltItem') == false){ 
      selectedItems.push(clickedD.item);

      var selectedItemsAttrmap = selectedItems.map(function(i){ return i.split('=')[0]})
    
      itemsetsvg.selectAll('.itemRect').filter(function(d){ 
        return selectedItemsAttrmap.indexOf(d.item.split('=')[0]) == -1 })
      .classed("highltItem", false)

      itemsetsvg.selectAll('.itemRect').filter(function(d){ 
        return selectedItemsAttrmap.indexOf(d.item.split('=')[0]) != -1 })
      .classed("highltItem", true)
      
    } else {// unselect a different item on the selected rule
       d3.select('#bsvg').selectAll('.' + clickedD.item.split('=')[0]).classed('highltRule', false)
       
       var curSelIdx = selectedItems.indexOf(clickedD.item)
        selectedItems.splice(curSelIdx, 1);
       /*
      var allruleItems = allRulesMap[clickedD.rcls][clickedD.rid].it;
      for(var i = 0; i < allruleItems.length; i++){
        var curSelIdx = selectedItems.indexOf(allruleItems[i])
        selectedItems.splice(curSelIdx, 1);
      }
      */
      
      
      var selectedItemsAttrmap = selectedItems.map(function(i){ return i.split('=')[0]})
    
      itemsetsvg.selectAll('.itemRect').filter(function(d){ 
        return selectedItemsAttrmap.indexOf(d.item.split('=')[0]) != -1 })
      .classed("highltItem", true)
      itemsetsvg.selectAll('.itemRect').filter(function(d){ 
        return selectedItemsAttrmap.indexOf(d.item.split('=')[0]) == -1 })
      .classed("highltItem", false)
    }

  } else { //select
    
    d3.select('#bsvg').selectAll('.' + clickedD.item.split('=')[0]).classed('highltRule', true)

    selectedItems.push(clickedD.item);
    //console.log(selectedItems);

    var selectedItemsAttrmap = selectedItems.map(function(i){ return i.split('=')[0]})
    //itemsetsvg.selectAll('.itemRect').style('opacity', 0.2)
    itemsetsvg.selectAll('.itemRect').filter(function(d){ 
      return selectedItemsAttrmap.indexOf(d.item.split('=')[0]) == -1 })
    .classed("highltItem", false)

    itemsetsvg.selectAll('.itemRect').filter(function(d){ 
      return selectedItemsAttrmap.indexOf(d.item.split('=')[0]) != -1 })
    .classed("highltItem", true)


  }
  // and add it to the detail view
  var tmpD = d3.selectAll('.highltRule').data();
  selectedRules = tmpD.map(function(d){ return allRulesMap[d.cls][d.id]})

  creatSVGgridfromHighlt(selectedRules);

}

var overViewSvg = rootsvg
  .append("g").attr("transform", function(d){
    return "translate(0," + 0 + ")";
  })
  .attr("class", "brush")
  .call(brushSelect)



overViewSvg.append("g").attr("class", "inline");




function highlightFreqItemList(freqitems){
  ftree.expendHighlight(freqitems);
  /*
  //
  d3.selectAll("#freqTab tr").style("background-color", null);

  for(var i = 0; i < freqitems.length; i++){
    var it = freqitems[i].split('=');
    if(it[1] == '?') it[1] = '_';
    var trid = "tr_" + it.join('_');
    d3.select("#" + trid).style('background-color', '#ccc');
  }
  */
}

function displayRawData(obsIdxes){
  //console.log("matched rules: ", rules);
  //console.log("matched obs: ", obs.length)

  //descGrid.setColumns(newColumns);
  var data = [];
  for (var i = 0; i < obsIdxes.length; i++) {

    var raw_data = allObsMap[obsIdxes[i]].d;

    /*
    data[i] = {
      "id" : obs[i],
      "cls" : raw_data['cls'],
      "cap-shape" : ruleStats.attributes['cap-shape'].indexOf(raw_data['cap-shape']),
      "cap-surface" : ruleStats.attributes['cap-surface'].indexOf(raw_data['cap-surface']),
      "cap-color" : ruleStats.attributes['cap-color'].indexOf( raw_data['cap-color']),
      "bruises" : ruleStats.attributes['bruises'].indexOf( raw_data['bruises']),
      "odor" : ruleStats.attributes['odor'].indexOf( raw_data['odor']),
      "gill-attachment" : ruleStats.attributes['gill-attachment'].indexOf( raw_data['gill-attachment']),
      "gill-spacing" : ruleStats.attributes['gill-spacing'].indexOf( raw_data['gill-spacing']),
      "gill-size" : ruleStats.attributes['gill-size'].indexOf( raw_data['gill-size']),
      "gill-color" : ruleStats.attributes['gill-color'].indexOf( raw_data['gill-color']),
      "stalk-shape" : ruleStats.attributes['stalk-shape'].indexOf( raw_data['stalk-shape']),
      "stalk-root" : ruleStats.attributes['stalk-root'].indexOf( raw_data['stalk-root']),
      "stalk-surface-above-ring" : ruleStats.attributes['stalk-surface-above-ring'].indexOf( raw_data['stalk-surface-above-ring']),
      "stalk-surface-below-ring" : ruleStats.attributes['stalk-surface-below-ring'].indexOf( raw_data['stalk-surface-below-ring']),
      "stalk-color-above-ring" : ruleStats.attributes["stalk-color-above-ring"].indexOf( raw_data["stalk-color-above-ring"]),
      "stalk-color-below-ring" : ruleStats.attributes['stalk-color-below-ring'].indexOf( raw_data['stalk-color-below-ring']),
      "veil-type" : ruleStats.attributes['veil-type'].indexOf( raw_data['veil-type']),
      "veil-color" : ruleStats.attributes['veil-color'].indexOf( raw_data['veil-color']),

      "ring-number" : ruleStats.attributes['ring-number'].indexOf( raw_data['ring-number']),
      "ring-type" : ruleStats.attributes['ring-type'].indexOf( raw_data['ring-type']),
      "spore-print-color" : ruleStats.attributes['spore-print-color'].indexOf( raw_data['spore-print-color']),
      "population" : ruleStats.attributes['population'].indexOf( raw_data['population']),
      "habitat" : ruleStats.attributes['habitat'].indexOf( raw_data['habitat'])
    }
    */


    data[i] = {
      "id" : obsIdxes[i],// allObs[obs[i]].idx, //obs[i],
      "cls" : raw_data['cls'],
      "cap-shape" : raw_data['cap-shape'],
      "cap-surface" : raw_data['cap-surface'],
      "cap-color" : raw_data['cap-color'],
      "bruises" : raw_data['bruises'],
      "odor" : raw_data['odor'],
      "gill-attachment" : raw_data['gill-attachment'],
      "gill-spacing" : raw_data['gill-spacing'],
      "gill-size" : raw_data['gill-size'],
      "gill-color" : raw_data['gill-color'],
      "stalk-shape" : raw_data['stalk-shape'],
      "stalk-root" : raw_data['stalk-root'],
      "stalk-surface-above-ring" : raw_data['stalk-surface-above-ring'],
      "stalk-surface-below-ring" : raw_data['stalk-surface-below-ring'],
      "stalk-color-above-ring" : raw_data["stalk-color-above-ring"],
      "stalk-color-below-ring" : raw_data['stalk-color-below-ring'],
      "veil-type" : raw_data['veil-type'],
      "veil-color" : raw_data['veil-color'],

      "ring-number" : raw_data['ring-number'],
      "ring-type" : raw_data['ring-type'],
      "spore-print-color" : raw_data['spore-print-color'],
      "population" : raw_data['population'],
      "habitat" : raw_data['habitat']
    }


  }
  
  //descGrid.removeCellCssStyles('highlight');
  //descDataView.beginUpdate();
  //descDataView.setItems(data);
  //descDataView.endUpdate();

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  d3.select('#pager').html('<span>' + numberWithCommas(obsIdxes.length) + ' rows ('+ (obsIdxes.length/8124 * 100).toFixed(2) + '%' + ')</span>')

  /*
  var item=[];
  item["id"] = 'obsIdx';
  item["cls"] = 'cls';
  item["cap-shape"] = 'cap-shape';
  item["cap-surface"] = 'cap-surface';
  item["cap-color"] = 'cap-color';
  item["bruises"] = 'bruises';
  item["odor"] = 'odor';
  item["gill-attachment"] = 'gill-attachment';
  item["gill-spacing"] = 'gill-spacing';
  item["gill-size"] = 'gill-size';
  item["gill-color"] = 'gill-color';
  item["stalk-shape"] = 'stalk-shape';
  item["stalk-root"] = 'stalk-root';
  item["stalk-surface-above-ring"] = 'stalk-surface-above-ring';
  item["stalk-color-above-ring"] = "stalk-color-above-ring";
  item["stalk-color-below-ring"] = 'stalk-color-below-ring';
  item["veil-type"] = 'veil-type';
  item["veil-color"] = 'veil-color';

  item["ring-number"] = 'ring-number';
  item["ring-type"] = 'ring-type';
  item["spore-print-color"] = 'spore-print-color';
  item["population"] = 'population';
  item["habitat"] = 'habitat';
  */
}

function createRuleMap(rules) {
  // use d3 to create itemset_label as row X rules_label as column
  // cell color is based on what class of rule it belongs to

  var freqItems = {};
  for (var i = 0; i < rules.length; i++){
    var r = rules[i];
    for (var j = 0; j < r.it.length; j++){
      var key = r.it[j],
          key_name = key.split('=')[0],
          key_val = key.split('=')[1];

      if(!freqItems.hasOwnProperty(key)){
        freqItems[key] = [r.cls + "_" + r.id];
      } else {
        freqItems[key].push(r.cls + "_" + r.id);
      }
    }

  }

  var ruleMapWidth = 440,
      ruleMapHeight = 380;

  //d3.select('#grid_itemset').select('svg').selectAll('g').remove();

  var colSpace = 1,
      rowSpace = 1,
      lineWidth = (ruleMapWidth - maxDimLabWidth)/rules.length - colSpace,
      lineHeight = ruleMapHeight/Object.keys(freqItems).length - rowSpace;


/*
  var svg = d3.select('#grid_itemset').select('svg')
      .attr("width", ruleMapWidth)
      .attr("height", ruleMapHeight)
      .call(tip);

*/

  //console.log('freqItems: ',freqItems);
  //console.log('rules:',rules);

  var itemsets = Object.keys(freqItems).sort(function (a, b) {
      var A = a.toLowerCase();
      var B = b.toLowerCase();
      if (A < B){
        return -1;
      }else if (A > B){
        return  1;
      }else{
        return 0;
      }
  });

  var itemsets_ary = []
  for (var i = 0; i < itemsets.length; i++){
    var ii = itemsets[i];
    itemsets_ary.push({name: ii.split('=')[0], val: ii.split('=')[1]});
  }

  var heightScale = d3.scale.ordinal().domain(itemsets_ary.map(function(d){return d.name + '_' + d.val})).rangeRoundBands([0, ruleMapHeight, 0]),
      widthScale = d3.scale.ordinal().domain(rules.map(function(d){ return d.cls + '_' + d.id})).rangeRoundBands([maxDimLabWidth, ruleMapWidth], 0);


  var row = svg.selectAll(".i_row")
    .data(itemsets_ary)
    .enter().append("g")
    .attr("id", function(d){return d.name + '_' + d.val})
    .attr("class", "i_row")
    //.attr("transform", function(d, i) { return "translate(0," + (i * (lineHeight + rowSpace)) + ")"; });
    .attr("transform", function(d, i) { return "translate(0," + heightScale(d.name + '_' + d.val) + ")"; });

  var cell = row.selectAll(".i_cell")
      .data(function(d){
        var da = [{'type': 'dimension', 'name': d.name + '=' + d.val}];
        for (var i = 0; i < rules.length; i++){
          //if (d == 'dimension') { da.push({name: d, is:false});}
          var r = rules[i];
          if (r.it.indexOf(d.name+'='+d.val) != -1){
            da.push({type: 'val', name: d.name + '=' + d.val, cls: r.cls, rid: r.id, is:true});
          } else {
            da.push({type: 'val', name: d.name + '=' + d.val, cls: r.cls, rid: r.id, is:false});
          }
        }
        return da;

      })
      .enter()
      .append("g")
      .attr("class", function(d){ return d.type == 'dimension' ? "i_cell itemName" : "i_cell itemVal " + d.cls + '_' + d.rid})
      //.attr("transform", function(dimension, i) { return i == 0 ? null : "translate(" + (maxDimLabWidth + colSpace + (i-1) * (lineWidth + colSpace) ) + ",0)"; });
      .attr("transform", function(d, i) { return i == 0 ? null : "translate(" + (widthScale(d.cls + '_' + d.rid)) + ",0)"; });

  var itemsetLabelCell = cell.filter(function(d){ return d.type == 'dimension'})
  itemsetLabelCell.each(function(d){
    var itemsetLabel = d3.select(this).append('text')
      .attr("x", 0)
      .attr("y", heightScale.rangeBand()/2)
      .attr("dy", ".35em")
      .attr('class', 'itemsetLabel')
      .text(function (d) { return d.name[0].toUpperCase() + d.name.slice(1);});

  //itemsetLabel.data(function(d) { var labelWidth = d3.select(this).node()[0].getComputedTextLength(); d.labelWidth = labelWidth; return d; });

  d3.select(this).insert('rect', 'text')
    .attr("ry", 2)
    .attr("rx", 2)
    .attr("class", 'itemLabRect')
    .attr("width", function(d){ return itemsetLabel.node().getComputedTextLength() })
    .attr("height", 16)
    .attr("y", heightScale.rangeBand()/2 - 16/2)
    .style("fill", function(d){ return attrColorScale(d.name.toLowerCase().split('=')[0]) })
  })



  cell.append("rect")
      .attr("width", function(d){ return d.type == 'dimension' ? maxDimLabWidth : widthScale.rangeBand() - 1})
      .attr("height", lineHeight)
      //.attr("class", function (d) { return d.type})
      .attr("x", 0)
      .attr("y", 0)
      .style("stroke", function(d) { return d.is ? null : '#ccc'})
      .style("fill", function(d) {
        if(d.type == 'val'){
          if(d.is)
            return d.cls == 'cls1' ? bluecolor[Math.round(color1Helper(allRulesMap[d.cls][d.rid]))] : redcolor[Math.round(color2Helper(allRulesMap[d.cls][d.rid]))];
          else return 'white'}
        else return 'none';
      })

  cell.filter(function (d) { return d.is })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)



  return {'rowData': itemsets_ary, 'row': row, 'rules': rules, 'widthScale': widthScale, 'heightScale': heightScale};
}

// parameter obs might be part of allObs
function creatSVGgrid(rules, obs) {

  var obsLab1 = obs.filter(function(o){return o.lab == 1}),
    obsLab2 = obs.filter(function(o){return o.lab == 2}),
    ruleCls1 = rules.filter(function(r){return r.cls == 'cls1'}),
    ruleCls2 = rules.filter(function(r){return r.cls == 'cls2'});


  /*
    var obsOp = [$('input[name=sortObs]:checked').val(), 10],
        ruleOp = [$('input[name=sortRule]:checked').val(), 10];
    mycomparator(obsLab1, obsLab2, obsOp, ruleCls1, ruleCls2, ruleOp);
  */

  ruleCls2.sort(function(a, b){ if(+a.rank.substr(1) < +b.rank.substr(1)) return -1; if(+a.rank.substr(1) > +b.rank.substr(1)) return 1; return 0;});
  ruleCls1.sort(function(a, b){ if(+a.rank.substr(1) < +b.rank.substr(1)) return -1; if(+a.rank.substr(1) > +b.rank.substr(1)) return 1; return 0;});
  obsLab2.sort(function(a, b){ if(+a.rank.substr(1) < +b.rank.substr(1)) return -1; if(+a.rank.substr(1) > +b.rank.substr(1)) return 1; return 0;});
  obsLab1.sort(function(a, b){ if(+a.rank.substr(1) < +b.rank.substr(1)) return -1; if(+a.rank.substr(1) > +b.rank.substr(1)) return 1; return 0;});

  var newRules = ruleCls2.concat(ruleCls1),
      newObs = obsLab2.concat(obsLab1);

  //console.log(newObs.length)

  var obsIdxLab1 = obsLab1.map(function(o){ return o.idx}),
      obsIdxLab2 = obsLab2.map(function(o){ return o.idx});

  var obsIdx = obsIdxLab2.concat(obsIdxLab1);

  var obsIdxDict = {};
  obsIdx.forEach(function(v, i){
    obsIdxDict[v] = i;
  })


  // will keep the incoming order of rules and observations
  var domainclsid = newRules.map(function(r){return r.cls+"_"+r.id});

  var maxLenRule_dv =-1;
  rules.forEach(function(r){ if(maxLenRule_dv < r.it.length) maxLenRule_dv = r.it.length});
  //console.log('maxLenRule_dv: ', maxLenRule_dv)
  

  var x_scale = d3.scale.ordinal().rangeBands([0, width-10], 0.1).domain(domainclsid),
      y_scale = d3.scale.ordinal().rangeBands([(itemsetRectHeight + itemsetPadding) * maxLenRule_dv, cvsHeight]).domain(obsIdx);

  var d3OrdinalScalebigStep = (x_scale.rangeExtent()[1] - x_scale.rangeExtent()[0])/20 - 0.1 + 2 * 0.1;


  if(newRules.length <=20){
    //console.log('d3OrdinalScalebigStep', d3OrdinalScalebigStep)
    x_scale = function(rclsid){
      return domainclsid.indexOf(rclsid) * d3OrdinalScalebigStep
    }
    // 56 is the minimum width of rule_column in detail view
    x_scale.rangeBand= function(){ return 56}
    x_scale.rangeExtent = function(){ return [0, width-10]}
    x_scale.domain = function(){ return domainclsid }
    x_scale.step = d3OrdinalScalebigStep;
    x_scale.padding = d3OrdinalScalebigStep - x_scale.rangeBand();
  }

  var brushSelect_focus = d3.svg.brush()
    .x(x_scale)
    .y(y_scale)
    .on("brush", function() {
      //console.log('focusRules: ', rules)


      var extent = d3.event.target.extent();

      var x0 = extent[0][0],
          y0 = extent[0][1],
          x1 = extent[1][0],
          y1 = extent[1][1];

      //console.log('x0', x0, 'y0', y0, 'x1', x1, 'y1', y1);
      // test, wrong code for orinal scale, bcz unable to check white space area between two bars
      //var selectedObs = y_scale.domain().filter(function(d){ return (y0 <= y_scale(d)) && (y_scale(d) <= y1) });
      //var selectedRules = x_scale.domain().filter(function(d){ return (x0 <= x_scale(d)) && (x_scale(d) <= x1) });


      var obsWithinExt = [],
          ruleClsId = [],
          ruleWithinExt = [],
          obsIdxWithinExt = [];
      var ruleDomain = x_scale.domain(),
          ruleRange = x_scale.range(),
          obsDomain = y_scale.domain(),
          obsRange = y_scale.range();


      for (var i = x0; i <= x1; i = i + x_scale.rangeBand()) {
        var idx = d3.bisect(ruleRange, i) - 1;

        if(idx > -1){
          var r = ruleDomain[idx];
          ruleClsId.push(r);
          var rcls = r.split('_')[0],
              rid = r.split('_')[1];
          ruleWithinExt.push(allRulesMap[rcls][rid]);
        }
      }




      for (var i = y0; i <= y1; i = i + y_scale.rangeBand()) {
        var idx = d3.bisect(obsRange, i) - 1

        if(idx > -1){
          //console.log('focus2 obs:', obsDomain[idx]);
          obsIdxWithinExt.push(obsDomain[idx]);
          obsWithinExt.push(allObsMap[obsDomain[idx]]);
        }
      }

      // check
      //

      console.log('focus2 obs: ', obsIdxWithinExt,'focus2 Rules: ', ruleWithinExt)

      /*
      {
        slickGridRowIdx_0: {
          "cap-shape": "slickGrid_highlight_red_0",
          "cap-color": "slickGrid_highlight_red2"
          "bruises":   "slickGrid_highlight_blue_2"
        },
        slickGridRowIdx_4: {
         "bruises": "slickGrid_highlight_blue_0"
        }
      }
      */
      highlightRawData(obsIdxWithinExt, ruleWithinExt);


    })

  d3.select('#tabs-1').selectAll('svg g').remove();
  d3.select('#tabs-1').selectAll('svg line').remove();


  var yzoomScale = d3.scale.linear()
    .domain([0, obsIdx.length])
    .range([(itemsetRectHeight + itemsetPadding) * maxLenRule_dv, cvsHeight]);

  var yzoomer = d3.behavior.zoom().y(yzoomScale).scaleExtent([1, 10]).on("zoom", zoom);

  var svg = d3.select('#tabs-1').select('svg')
      .attr("width", width)
      .attr("height", cvsHeight)
      .append("g")
      .attr("class", "brush")
      //.call(yzoomer)
      .call(itemsetLabTip)




  // a solution to a probelm that zoom stops working when mouse hovers on the base svg
  svg.append("rect")
    .attr("width", width)
    .attr("height", cvsHeight)
    .style("fill", "none")
    .style("pointer-events", "all");

  /*
    function zoom() {
      svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
  */
  function zoom() {
    cell.attr("y", function(d) { return yzoomScale(obsIdxDict[d.oidx]); })
     .attr("height", d3.event.scale * y_scale.rangeBand())

    svg.select('.purpleLine')

      //.attr("y1", y_scale(obsIdxLab1[0]))
      .attr("y1", yzoomScale(obsIdxDict[obsIdxLab1[0]]))
      

      .attr("y2", yzoomScale(obsIdxDict[obsIdxLab1[0]]))
  }

  /**
  * rcls or obs-label
  if they are different
  */
  function reorderObsByRule(rcls, rid) {

    var firstObsLab1 = obsLab1.filter(function(d){ return d.ruleid[rcls].indexOf(rid) != -1}),
        firstObsIdx = firstObsLab1.map(function(d){ return d.idx});

    var newObsLab1IdxDict = {};
    var i = 0;
    for (; i < firstObsIdx.length; i++){
      newObsLab1IdxDict[firstObsIdx[i]] = i;
    }
    var ii = 0;
    for (var j =0; j < obsLab1.length; j++){
      if (!newObsLab1IdxDict.hasOwnProperty(obsLab1[j].idx)){
        newObsLab1IdxDict[obsLab1[j].idx] = i + ii;
        ii++;
      }
    }

    var newObsLab1Idx = [];
    for(var k in newObsLab1IdxDict){
      var order = newObsLab1IdxDict[k];
      newObsLab1Idx[order] = k;
    }



    var firstObsLab2 = obsLab2.filter(function(d){ return d.ruleid[rcls].indexOf(rid) != -1}),
        firstObsIdx = firstObsLab2.map(function(d){ return d.idx});

    var newObsLab2IdxDict = {};
    var i = 0;
    for (; i < firstObsIdx.length; i++){
      newObsLab2IdxDict[firstObsIdx[i]] = i;
    }
    var ii = 0;
    for (var j = 0; j < obsLab2.length; j++){
      if (!newObsLab2IdxDict.hasOwnProperty(obsLab2[j].idx)){
        newObsLab2IdxDict[obsLab2[j].idx] = i + ii;
        ii++;
      }
    }

    var newObsLab2Idx = [];
    for(var k in newObsLab2IdxDict){
      var order = newObsLab2IdxDict[k];
      newObsLab2Idx[order] = k;
    }

    var newObsIdx = newObsLab2Idx.concat(newObsLab1Idx);
      newObsIdx.forEach(function(v, i){
      obsIdxDict[v] = i;
    })

    y_scale.domain(newObsIdx);


    cell.attr("y", function(d) { return y_scale(d.oidx); })
      // restore the initial height for the bars
      .attr("height", y_scale.rangeBand())


    addTab(rcls, rid, firstObsLab1, firstObsLab2, newRules, '');

  }

  var col = svg.append('g').selectAll('.col')
      .data(newRules)
      .enter().append("g")
      .attr("class", "col")
      .attr('rclsid', function(d){ return d.cls+"_"+d.id})
      .attr("transform", function(d){
        return "translate(" + x_scale(d.cls+"_"+d.id) + ", 0)";
      })


  /*
    var colHeadLabel = colHead.append('text')
        //.attr("x",x_scale.rangeBand()/2)
        .attr("y",0)
        .attr("dy",".8em")
        .text(function(d){return d.cls + '-' + d.id;});

    colHeadLabel.attr('x', function(){ var labelWidth = d3.select(this).node().getComputedTextLength(); return x_scale.rangeBand()/2 - labelWidth/2});

    colHead.insert('rect', 'text')
      .attr("ry", 6)
      .attr("rx", 6)
      .attr("width", x_scale.rangeBand())
      .attr("height", colHeadHeight)
      .attr("y", 0)
  */

  var cell = col.selectAll('.focus_cell')
      .data(function(d){ // rule
        var res = [];
        for(var i = 0; i < newObs.length; i++){
          var o = newObs[i];
          if(o.ruleid[d.cls].indexOf(d.id) != -1){
            res.push({cls: d.cls, rid: d.id, oidx: o.idx, intersection: intersect(d.it, o.freqItem)});
          }
        }
        //console.log(res)
        return res;
      })
      .enter().append("rect")
      .attr("class", function(d){ return "focus_cell o_" + d.oidx})
      .attr("width", x_scale.rangeBand())
      .attr("height", y_scale.rangeBand())
      .attr("cls", function(d){return d.cls})
      .attr("rule", function(d){return d.rid})
      //.attr("oId", function(d){return d.oid})
      .attr("id", function(d) { return "focuse_cell_" + d.cls + '_' + d.rid})
      .attr("y", function(d) { return y_scale(d.oidx); })
      .style("fill", function(d) {
        if (d.cls == "cls1") {
          return bluecolor[Math.round(color1Helper(allRulesMap[d.cls][d.rid]))];
        }else{
          return redcolor[Math.round(color2Helper(allRulesMap[d.cls][d.rid]))];
        }
      })
      .on("click", function(d){
        //console.log('ruleid: ', d.cls + '_' + d.rid);
        //console.log('obsidx: ', d.oid);

        d3.selectAll('.focus_cell').classed('focus_highlight', false);
        d3.selectAll(".o_" + d.oidx).classed('focus_highlight', true);

        var hitrules = [];
        d3.selectAll('.focus_highlight').each(function(d){ if(hitrules.indexOf(d.cls + '_' + d.rid) == -1) hitrules.push(d.cls + '_' + d.rid)})
        var hitrulesObj = hitrules.map(function(d){ var cls = d.split('_')[0], rid = d.split('_')[1]; return allRulesMap[cls][rid] });
        highlightRawData([d.oidx], hitrulesObj);
        //highlightRawData_new([d.oidx], hitrulesObj);

      })
      .on("mouseover", function(d){ hightlightOverviewPos(d.oidx, d.cls, d.rid) })
      .on("mouseout", function(){ d3.select("#bsvg .inline").selectAll("line").remove()})


  var colHead = col
      .append('g')
      .attr("class", "rulehead")
      .on('click', function(d){ reorderObsByRule(d.cls, d.id)});


  colHead.each(function(d){


    var itemGroup_detail = d3.select(this).selectAll('.g')
      .data(d.it).enter()
      .append('g')
      .attr("transform", function(d, i){return "translate("+ (x_scale.rangeBand() - itemsetRectWidth)/2 + ","+i * (itemsetRectHeight + itemsetPadding) +")"})
      .on('mouseover', itemsetLabTip.show)
      .on('mouseout', itemsetLabTip.hide)

    itemGroup_detail.append('text')
     .attr("dy","1em")
     .attr('dx', '.2em')
    .text(function(d){ return d.split('=')[1] })

    var itemRect_detail = itemGroup_detail.insert('rect', 'text')
      .attr("width", itemsetRectWidth)
      .attr("height", itemsetRectHeight) 
      .attr('class', 'itemsetRect')
      .style('fill', function(d){ return attrColorScale(d.toLowerCase().split('=')[0])})
      //.call(d3.helper.tooltipItemRect())

  })



  // horizontal line
  if (obsLab2.length != 0 && obsLab1.length !=0 ){
    svg.append("line")
      .attr('class', 'purpleLine')
      .attr("x1", 0)
      .attr("y1", y_scale(obsIdxLab1[0]))
      .attr("x2", width)
      .attr("y2", y_scale(obsIdxLab1[0]))

      .style("stroke", sepLineColor);
  }

  // vertical line
  // refer to d3.scale.ordinal source
  /*
  var d3OrdinalScaleStep = (x_scale.rangeExtent()[1] - x_scale.rangeExtent()[0])/x_scale.domain().length - 0.1 + 2 * 0.1;
  if(ruleCls1.length != 0 && ruleCls2.length !=0){
    svg.append("line")
      .attr("x1", ruleCls2.length*x_scale.rangeBand() + ruleCls2.length * (d3OrdinalScaleStep - x_scale.rangeBand()))
      .attr("y1", 0)
      .attr("x2", ruleCls2.length*x_scale.rangeBand() + ruleCls2.length * (d3OrdinalScaleStep - x_scale.rangeBand()))
      .attr("y2", cvsHeight)
      .style("stroke", sepLineColor);
  }
  */
  var d3OrdinalScaleStep = (x_scale.rangeExtent()[1] - x_scale.rangeExtent()[0])/x_scale.domain().length - 0.1 + 2 * 0.1,
      padding = d3OrdinalScaleStep - x_scale.rangeBand();
  var offset = 0;
  if(ruleCls1.length != 0 && ruleCls2.length !=0){
    var rightFirstRuleIdx = x_scale.domain().indexOf(ruleCls1[0].cls + "_" + ruleCls1[0].id);
    // rightFirstRuleIdx * d3OrdinalScaleStep - padding/2)
    if(x_scale.domain().length < 20){ // 20 is reasonable number to have a good look without squzing the width of rule column
      offset = rightFirstRuleIdx * x_scale.step  + x_scale.padding/2 - 1;
    } else {
      offset = x_scale(ruleCls1[0].cls + "_" + ruleCls1[0].id) - padding/2
    }
    svg.append("line")
      .attr("x1", offset)
      .attr("y1", 0)
      .attr("x2", offset)
      .attr("y2", cvsHeight)
      .style("stroke", sepLineColor);
  }


  function hightlightOverviewPos(oid, rcls, rid){
    var svgPosY = Math.floor(grid.obsIdx_pos[oid] * grid.cellHeight),
        svgPosX = Math.floor(grid.ruleid_pos[rcls + '_' + rid] * grid.cellWidth) + grid.cellWidth/2;

    //d3.select("#bsvg .inline").selectAll("line").remove();

    var brushExts = brushSelect.extent();
    var leftX = brushExts[0][0],
        topY = brushExts[0][1],
        rightX = brushExts[1][0],
        bottomY = brushExts[1][1];

    if (svgPosX < leftX || svgPosX > rightX) return;
    if (svgPosY < topY || svgPosY > bottomY) return;

    d3.select("#bsvg .inline")
      .append("line")
      .attr("x1", leftX)
      .attr("y1", svgPosY)
      .attr("x2", rightX)
      .attr("y2", svgPosY)


    d3.select("#bsvg .inline")
      .append("line")
      .attr("x1", svgPosX)
      .attr("y1", topY)
      .attr("x2", svgPosX)
      .attr("y2", bottomY)



  }
  //svg.call(brushSelect_focus);

  //TODO has a problem, forget about it
  // get all dataitems in the slickGrid
  // reorder rows based on the to-be-highlt o.idx
  // reorder columns based on freqItems in the passed rules
  // rerender the slickGrid
  function highlightRawData_new(obsIdx, ruleWithinExt){
    // process dataitems
    var allDataItems = descDataView.getItems();
    var itemsTobehighlt = [],
        remainedItems = [];
    for (var i = 0; i < allDataItems.length; i++) {
      var d = allDataItems[i];
      if(obsIdx == d.id){
        itemsTobehighlt.push(d);
      } else {
        remainedItems.push(d);
      }
    }

    var newAllDataItems = itemsTobehighlt.concat(remainedItems);

    var toHighLt = {'0': {}};

    // process columns
    var columnsToBeFirst = ['cls'],
        tempDictCol = {};
    for (var j = 0; j < ruleWithinExt.length; j++) {
      var ro = ruleWithinExt[j];
      var color_pos = ro.cls == 'cls1' ? Math.round(color1Helper(ro)) : Math.round(color2Helper(ro));
      var validAttr = intersect(ro.it, allObsMap[obsIdx].freqItem);
      for(var k = 0; k < validAttr.length; k++){
        var a = validAttr[k],
            aName = a.split('=')[0],
            aVal = a.split('=')[1];
        if(!tempDictCol.hasOwnProperty(aName.toLowerCase())){
          columnsToBeFirst.push(aName.toLowerCase());
          tempDictCol[aName.toLowerCase()] = true;

          toHighLt[0][aName] = ro.cls == 'cls1' ? 'slickGrid_highlight_blue_' + color_pos : 'slickGrid_highlight_red_' + color_pos;

        }
      }
    }

    var curColumns = descGrid.getColumns();
    var newColumns = [];
    for (var i = 0; i < columnsToBeFirst.length; i++){
      var colName = columnsToBeFirst[i];
      var colO = curColumns.filter(function(c){ return c.field.toLowerCase() == colName;})[0];
      //console.log('filtered :', colO);
      newColumns.push(colO);
    }
    for (var i = 1; i < curColumns.length; i++){
      var col = curColumns[i];
      if(columnsToBeFirst.indexOf(col.field.toLowerCase()) == -1){
        newColumns.push(col);
      }

    }
    descGrid.setColumns(newColumns);

    descGrid.resetActiveCell();
    descDataView.setItems(newAllDataItems);
    descGrid.render();

    descTabHighlight(toHighLt, columnsToBeFirst.map(function(d){ return d.name }));


  }

  function highlightRawData(obsIdxWithinExt, ruleWithinExt){
    //console.log(obsIdxWithinExt, ruleWithinExt, ruleClsId);
    var toHighLt = {},
        toSortColumns = [],
        tempDict = {};
    for (var i = 0; i < obsIdxWithinExt.length; i++) {
      var oIdx = obsIdxWithinExt[i],
          slickGridIdx = descDataView.getIdxById(oIdx);
      for (var j = 0; j < ruleWithinExt.length; j++) {
        var ro = ruleWithinExt[j];
        var color_pos = ro.cls == 'cls1' ? Math.round(color1Helper(ro)) : Math.round(color2Helper(ro));
        var validAttr = intersect(ro.it, allObsMap[oIdx].freqItem);
        for(var k = 0; k < validAttr.length; k++){
          var a = validAttr[k],
              aName = a.split('=')[0],
              aVal = a.split('=')[1];

          if(!tempDict.hasOwnProperty(aName.toLowerCase())){
            toSortColumns.push({name: aName.toLowerCase(), val: aVal});
            tempDict[aName.toLowerCase()] = true;

          }
          if (!toHighLt[slickGridIdx]) {
            toHighLt[slickGridIdx] = {};
          }
          toHighLt[slickGridIdx][aName] = ro.cls == 'cls1' ? 'slickGrid_highlight_blue_' + color_pos : 'slickGrid_highlight_red_' + color_pos;
        }

      }

    }

    //toSortColumns.sort(function(a, b){ if(a.name < b.name) return -1; if(a.name > b.name) return 1; return 0;});
    //console.log('base:', toSortColumns)
    descTabHighlight(toHighLt, toSortColumns.map(function(d){ return d.name }));

    //console.log('toSortColumns:', toSortColumns);

    //highlightRule(ruleClsId);

  }


  function highlightRule(ruleClsId){
    // currenty, only hightlight the first rule
    var rcls = ruleClsId[0].split("_")[0],
        rid = ruleClsId[0].split("_")[1],
        ruleObj = allRulesMap[rcls][rid];
    var toSortColumns = ruleObj.it.map(function(d){ var itemset = d.split("="); return {name: itemset[0], val: itemset[1] }});
    //var curRow = itemsetMap.rowData;
    var newRow = sortObjArrayByArray(curRow, toSortColumns);

    //console.log('rulemap:',newRow)

    /*
    var curRuleClsIds = itemsetMap.rules.map(function(d) { return d.cls + '_' + d.id; });
    var tofirstRuleClsId = ruleClsId[0],
        tofirstRuleClsIdIdx = curRuleClsIds.indexOf(tofirstRuleClsId);
    curRuleClsIds.splice(tofirstRuleClsIdIdx, 1)
    curRuleClsIds.unshift(tofirstRuleClsId);
    */

    //itemsetMap.heightScale.domain(newRow.map(function(d){ return d.name + '_' + d.val}));
    //itemsetMap.widthScale.domain(curRuleClsIds);

    //itemsetMap.row.attr("transform", function(d, i) { return "translate(0," + itemsetMap.heightScale(d.name + '_' + d.val) + ")"; });
    //itemsetMap.row.selectAll(".i_cell").attr("transform", function(d, i) { return i == 0 ? null : "translate(" + (itemsetMap.widthScale(d.cls + '_' + d.rid)) + ",0)"; });

    //ItemsetMapGrid hightlight
    /*
    d3.select('#grid_itemset').selectAll('rect').classed('itemset_highlight', false);
    for(var i = 0; i < ruleClsId.length; i++){
      d3.select('#grid_itemset').selectAll('.' + ruleClsId[i] + ' rect').filter(function(d){ return d.is }).classed('itemset_highlight', true);
    }
    */

  }

}

/**
* a: [{name: "bruises", val: t}, {name: "stalk-surface-below-ring", val: f}, {name: "stalk-shape", val: t}]
* oa: [
          {"name":"bruises","val":"f"},
          {"name":"odor","val":"f"},
          {"name":"ring-type","val":"l"},
          {"name":"spore-print-color","val":"h"},
          {"name":"stalk-shape","val":"e"},
          {"name":"stalk-surface-above-ring","val":"k"},
          {"name":"stalk-surface-below-ring","val":"k"}
      ]

*/
function sortObjArrayByArray(oa, a){
  var d = {};
  for (var i = 0; i < a.length; i++){
    d[a[i].name + '=' + a[i].val] = true;
  }

  for(var i = 0; i < oa.length; i++){
    var o = oa[i];
    if(d.hasOwnProperty(o.name + '=' + o.val)){
      o.rank = 10;
    } else {
      o.rank = 0;
    }
  }

  return oa.sort(function(a, b){ return b.rank - a.rank})
}
function sortObjArrayByArray1(oa, a){
  var newOa = [];
  for (var i = 0; i < a.length; i++){
    var o = getObjByAttrVal(oa, 'name', a[i]);
    if(o.length != 0){
      for(var j = 0; j < o.length; j++){
        newOa.push(o[j]);
      }
    }
  }

  for(var i = 0; i < oa.length; i++){
    var oriObj = oa[i];
    if(getObjByAttrVal(newOa, 'name', oriObj.name).length != 0){
      newOa.push(oriObj);
    }
  }
  return newOa;

  function getObjByAttrVal(oa, a, v) {
    var res = [];
    for (var i = 0; i < oa.length; i++){
      var o = oa[i];
      if(o[a] === v) {
        res.push(o);
      }
    }
    return res;
  }
}


function intersect(s1, s2){
  var seen={},
      result=[];
   for (var i = 0; i < s1.length; i++) {
     seen[s1[i]] = true;
   }
   for (var i = 0; i < s2.length; i++) {
     if (seen[s2[i]])
        result.push(s2[i]);
   }
   return result;

}

// for rule click
function creatSVGgridfromHighlt(selectedRules){
  // console.log("Selected Rules in ruleclick:", selectedRules)
  // for o in allObs
  // if o.cls contains at least one rule in selectedRules
  // push o.id
  //
  var mergedObsDict = {};
  for(var i = 0; i < allObs.length; i++){
    var ob = allObs[i];
    for(var j = 0; j < selectedRules.length; j++){
      var ru = selectedRules[j];
      if(ob.ruleid[ru.cls].indexOf(ru.id) != -1){
        mergedObsDict[ob.idx] = true;
      }
    }

  }
  var mergedObs = [];
  for( var obsidx in mergedObsDict){
    mergedObs.push(allObsMap[obsidx]);
  }
  //console.log("Selected obs in ruleclick:", mergedObsDict)

  creatSVGgrid(selectedRules, mergedObs);

  displayRawData(Object.keys(mergedObsDict));
  //itemsetMap = createRuleMap(selectedRules);
  var includedFreqItems = [];
  for(var i = 0; i < selectedRules.length; i++){
    includedFreqItems = includedFreqItems.concat(selectedRules[i].it)
  }
  highlightFreqItemList(includedFreqItems);
  keepTab0Only();

}
