var tabs = $( "#tabs" ).tabs();
var tabCounter = 0;

addRuleBG();
rootsvg.selectAll('.rulebg').style("display", "none");

var selectedRules = [];
selectedRules.push= function(){Array.prototype.push.apply(this, arguments); afterPush();}

$("#blueColorBar").selectmenu({
      change: function( event, data ) {
        if(data.item.value == 'length'){//length, support, confidence, lift

          cls1_len_ext = d3.extent(cls1Rule, function(d){return d.it.length});

          cls1_color = d3.scale.linear().domain(cls1_len_ext).clamp(true).range([0, 4]);

          color1Helper = function(rule){ return cls1_color(rule.it.length)};
        } else if (data.item.value == 'support') {

          cls1_supp_ext = d3.extent(cls1Rule, function(d){return d.m[0][1]});

          cls1_color = d3.scale.linear().domain(cls1_supp_ext).clamp(true).range([4, 0]);

          color1Helper = function(rule){ return cls1_color(rule.m[0][1])};
        } else if (data.item.value == 'confidence'){

          cls1_conf_ext = d3.extent(cls1Rule, function(d){return d.m[1]});

          cls1_color = d3.scale.linear().domain(cls1_conf_ext).clamp(true).range([4, 0]);

          color1Helper = function(rule){ return cls1_color(rule.m[1])};
        } else {

          cls1_lift_ext = d3.extent(cls1Rule, function(d){return d.m[2]});

          cls1_color = d3.scale.linear().domain(cls1_lift_ext).clamp(true).range([4, 0]);

          color1Helper = function(rule){ return cls1_color(rule.m[2])};
        }


        // update canvasgrid, svggrid, rulemap, rawdata

        //descGrid.invalidateAllRows()


        grid.clearAll();
        grid.fill();
        grid.drawLine(0, lab2Obs.length, grid.colData.length, lab2Obs.length, sepLineColor);
        grid.drawLine(cls2Rule.length, 0, cls2Rule.length, grid.rowData.length, sepLineColor);


        d3.selectAll('.focus_cell').filter(function(d){ return d.cls == 'cls1'})
          .style("fill", function(d) {
            return bluecolor[Math.round(color1Helper(allRulesMap[d.cls][d.rid]))];
        })

        d3.selectAll('.i_cell').filter(function(d){ return d.type == 'val' && d.is == true && d.cls == 'cls1'})
          .style("fill", function(d) {
            return bluecolor[Math.round(color1Helper(allRulesMap[d.cls][d.rid]))];
        })

        if(descGrid.hasOwnProperty('highlightObs')){
          highlightRawData(descGrid.highlightObs);
        }


      }
});

$("#redColorBar").selectmenu({
      change: function( event, data ) {
        if(data.item.value == 'length'){//length, support, confidence, lift

          cls2_len_ext = d3.extent(cls2Rule, function(d){return d.it.length});

          cls2_color = d3.scale.linear().domain(cls2_len_ext).clamp(true).range([0, 4]);

          color2Helper = function(rule){ return cls2_color(rule.it.length)};
        } else if (data.item.value == 'support') {

          cls2_supp_ext = d3.extent(cls2Rule, function(d){return d.m[0][1]});

          cls2_color = d3.scale.linear().domain(cls2_supp_ext).clamp(true).range([4, 0]);

          color2Helper = function(rule){ return cls2_color(rule.m[0][1])};
        } else if (data.item.value == 'confidence'){

          cls2_conf_ext = d3.extent(cls2Rule, function(d){return d.m[1]});

          cls2_color = d3.scale.linear().domain(cls2_conf_ext).clamp(true).range([4, 0]);

          color2Helper = function(rule){ return cls2_color(rule.m[1])};
        } else {

          cls2_lift_ext = d3.extent(cls2Rule, function(d){return d.m[2]});

          cls2_color = d3.scale.linear().domain(cls2_lift_ext).clamp(true).range([4, 0]);

          color2Helper = function(rule){ return cls2_color(rule.m[2])};
        }

        grid.clearAll();
        grid.fill();
        grid.drawLine(0, lab2Obs.length, grid.colData.length, lab2Obs.length, sepLineColor);
        grid.drawLine(cls2Rule.length, 0, cls2Rule.length, grid.rowData.length, sepLineColor);

        d3.selectAll('.focus_cell').filter(function(d){ return d.cls == 'cls2'})
          .style("fill", function(d) {
            return redcolor[Math.round(color2Helper(allRulesMap[d.cls][d.rid]))];
        })

        d3.selectAll('.i_cell').filter(function(d){ return d.type == 'val' && d.is == true && d.cls == 'cls2'})
          .style("fill", function(d) {
            return redcolor[Math.round(color2Helper(allRulesMap[d.cls][d.rid]))];
        })

        if(descGrid.hasOwnProperty('highlightObs')){
          highlightRawData(descGrid.highlightObs, descGrid.highlightRules);
        }


      }
});

$("#selectmoderatio input").checkboxradio();

$("#sortruleratio").buttonset();

$("#sortobsratio").buttonset();


var tabTemplate = "<li id='{id}'><a href='#{href}'>Detail_</a>#{span} <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>";

tabs.delegate( "span.ui-icon-close", "click", function() {
    var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
    $( "#" + panelId ).remove();
    tabs.tabs( "refresh" );
});

tabs.bind( "keyup", function( event ) {
    if ( event.altKey && event.keyCode === $.ui.keyCode.BACKSPACE ) {
    	var panelId = tabs.find( ".ui-tabs-active" ).remove().attr( "aria-controls" );
        $( "#" + panelId ).remove();
        tabs.tabs( "refresh" );
    }
});

/**
* selRules: [{cls, id, it, m}]
* obsLabMatches [{d:{}, freqItem:[], idx, lab, rank, ruleid:{cls1:[], cls2:[]}}]
*/
function addTab(rcls, rid, obsLab1Matches, obsLab2Matches, selRules, pre_li_id) {
  var its = [];
  var ruleObj = allRulesMap[rcls][rid];
  if(ruleObj.hasOwnProperty('it')){
    for(var i = 0; i < ruleObj.it.length; i++){
      its.push(ruleObj.it[i].split('=')[0]);

    }
  } else return;

  var id = "tabs-" + rcls + "_" + rid;
  var spans = '';

  if(pre_li_id != ''){
    $('#' + pre_li_id + ' .itemsetTtl').each(function(i){    
      spans += "<span class='itemsetTtl' style='background-color: " + $(this).css('background-color') + "'></span>"
    });
  }
  
  
  //var spans = pre_li_id =='' ? '' :$('#' + pre_li_id + ' .itemsetTtl').toArray().join('');
  //var spans = $('#' + id + '.itemsetTtl');
  
  for(var i = 0; i < its.length; i++){
    spans += "<span class='itemsetTtl' style='background-color: " + attrColorScale(its[i]) + "'></span>"
  }


    var li = $( tabTemplate.replace( /\{id\}/g, "li_" + id ).replace( /#\{href\}/g, "#" + id ).replace( /#\{span\}/g, spans ) );

    tabs.find( ".ui-tabs-nav" ).append( li );
    tabs.append( "<div id='" + id + "'></div>" );
    tabs.tabs( "refresh" );

    tabCounter ++;
    tabs.tabs( "option", "active", tabCounter);

    d3.select('#' + id).append('svg').attr('id', 'testsvg_' + id);

    creatDetailSVGgrid(obsLab1Matches, obsLab2Matches, selRules, 'testsvg_' + id, rcls, rid);

    /*
		 var col = svg.append('g').selectAll('.col')
      .data(newRules)
      .enter().append("g")
      .attr("class", "col")
      .attr('rclsid', function(d){ return d.cls+"_"+d.id})
      .attr("transform", function(d){
        return "translate(" + x_scale(d.cls+"_"+d.id) + ", 0)";
      })

    */

}




$('#turnoffhighlt').button().click(function() {
  /*
  if(rootsvg.selectAll('.rulebg').size() != 0) {
    //addRuleBG();
    var curVal = rootsvg.selectAll('.rulebg').style("display");
    if(curVal === "none"){
      rootsvg.selectAll('.rulebg').style("display", null);
    } else {
      rootsvg.selectAll('.rulebg').style("display", "none");
    }
  }
  */

  // sort of reset views
  itemsetsvg.selectAll('.itemRect').classed('highltItem', false);

  d3.select('#grid_itemset').select('svg').selectAll('g').remove();

  descGrid.invalidateAllRows();

  d3.select('#freDiv').selectAll('.highltrect').style('display', "none");
  ftree.collapseAll();

  keepTab0Only();
  d3.select('#tabs-1 svg').selectAll('g').remove();

  rootsvg.selectAll('.rulebg').classed('highltRule', false)
  rootsvg.selectAll('.rulebg').style("display", 'none');

  selectedItems = [];

  d3.select('#pager').html('');

  d3.selectAll(".brush").call(brushSelect.clear());

  d3.select('#crossTab').selectAll('span').html('');

});

function addRuleBG(){
  var rulebg = rootsvg.selectAll('.rulebg')
      .data(allRules)
      .enter().append('rect')
      //.attr("x", function(d){ return rulebg_scale(d.cls + "_" + d.id)})
      //.attr("width", rulebg_scale.rangeBand())
      .attr("x", function(d){ return rulebg_scale(d.cls + "_" + d.id) + rulebg_scale.rangeBand()/2-2})
      .attr("width", 2)
      .attr("height", cvsHeight)
      .attr("class", function(d){ return "rulebg " + d.it.map(function(i){return i.split('=')[0]}).join(' ')})
      .attr("id", function(d) { return 'rulebg_' + d.cls + '_' + d.id})


  //rulebg.call(d3.helper.tooltip());

  rulebg.on('mousedown', function(){
    brush_elm = rootsvg.select(".brush").node();
    new_click_event = new Event('mousedown');
    new_click_event.pageX = d3.event.pageX;
    new_click_event.clientX = d3.event.clientX;
    new_click_event.pageY = d3.event.pageY;
    new_click_event.clientY = d3.event.clientY;
    brush_elm.dispatchEvent(new_click_event);


  });
}

/**
* selRules: [{cls, id, it, m}]
* obsLabMatches [{d:{}, freqItem:[], idx, lab, rank, ruleid:{cls1:[], cls2:[]}}]
*/
function creatDetailSVGgrid(obsLab1Matches, obsLab2Matches, selRules, svgContainer, pre_sortBy_rcls, pre_sortBy_rid) {
  //console.log('creatDetailSVGgrid')

  for(var i = 0; i < selRules.length; i++){
    var ro = selRules[i],
        rid = ro.id;
    ro.matobs = {'cls1': 0, 'cls2':0};

    for(var j = 0; j < obsLab1Matches.length; j++){
      if(obsLab1Matches[j].ruleid[ro.cls].indexOf(rid) != -1) {
        ro.matobs[ro.cls] += 1;
      }
    }

    for(var j = 0; j < obsLab2Matches.length; j++){
      if(obsLab2Matches[j].ruleid[ro.cls].indexOf(rid) != -1) {
        ro.matobs[ro.cls] += 1;
      }
    }
  }




  // sort the rules based on matobs
  var validRules = selRules.filter(function(d){ return (d.matobs.cls1 + d.matobs.cls2) != 0});

    var ruleCls1 = validRules.filter(function(r){return r.cls == 'cls1'}),
      ruleCls2 = validRules.filter(function(r){return r.cls == 'cls2'});

  ruleCls1.sort(function(a, b){ return (b.matobs.cls1 + b.matobs.cls2) - (a.matobs.cls1 + a.matobs.cls2)});
  ruleCls2.sort(function(a, b){ return (b.matobs.cls1 + b.matobs.cls2) - (a.matobs.cls1 + a.matobs.cls2)})

  var sortedRules = ruleCls2.concat(ruleCls1);

  var matObs = obsLab2Matches.concat(obsLab1Matches);

  var obsIdxLab1 = obsLab1Matches.map(function(o){ return o.idx}),
      obsIdxLab2 = obsLab2Matches.map(function(o){ return o.idx});

  var obsIdx = obsIdxLab2.concat(obsIdxLab1);

  var obsIdxDict = {};
  obsIdx.forEach(function(v, i){
    obsIdxDict[v] = i;
  })


  var maxLenRule_dv =-1;
  selRules.forEach(function(r){ if(maxLenRule_dv < r.it.length) maxLenRule_dv = r.it.length});
  //console.log('maxLenRule_dv: ', maxLenRule_dv)
  

  // will keep the incoming order of rules and observations
  var x_scale = d3.scale.ordinal().rangeBands([0, width-10], 0.1).domain(sortedRules.map(function(r){return r.cls+"_"+r.id})),
      y_scale = d3.scale.ordinal().rangeBands([(itemsetRectHeight + itemsetPadding) * maxLenRule_dv, cvsHeight]).domain(obsIdx);


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


  var yzoomScale = d3.scale.linear()
    .domain([0, obsIdx.length])
    //.range([colHeadHeight + 1, cvsHeight]);
        .range([(itemsetRectHeight + itemsetPadding) * maxLenRule_dv, cvsHeight]);

  var yzoomer = d3.behavior.zoom().y(yzoomScale).scaleExtent([1, 10]).on("zoom", zoom);

  d3.select('#' + svgContainer).select('g').remove();

  var svg = d3.select('#' + svgContainer)
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


  function zoom() {
    cell.attr("y", function(d) { return yzoomScale(obsIdxDict[d.oid]); })
     .attr("height", d3.event.scale * y_scale.rangeBand())

    svg.select('.purpleLine')

      .attr("y1", yzoomScale(obsIdxDict[obsIdxLab1[0]]))
      

      .attr("y2", yzoomScale(obsIdxDict[obsIdxLab1[0]]))
  }


  var col = svg.append('g').selectAll('.col')
      .data(sortedRules)
      .enter().append("g")
      .attr("class", "col")
      .attr('rclsid', function(d){ return d.cls+"_"+d.id})
      .attr("transform", function(d){
        return "translate(" + x_scale(d.cls+"_"+d.id) + ", 0)";
      })



  var cell = col.selectAll('.focus_cell')
      .data(function(d){ // rule
        var res = [];
        for(var i = 0; i < matObs.length; i++){
          var o = matObs[i];
          if(o.ruleid[d.cls].indexOf(d.id) != -1){
            res.push({cls: d.cls, rid: d.id, oid: o.idx, intersection: intersect(d.it, o.freqItem)});
          }
        }
        //console.log(res)
        return res;
      })
      .enter().append("rect")
      .attr("class", function(d){ return "focus_cell o_" + d.oid})
      .attr("width", x_scale.rangeBand())
      .attr("height", y_scale.rangeBand())
      .attr("cls", function(d){return d.cls})
      .attr("rule", function(d){return d.rid})
      //.attr("oId", function(d){return d.oid})
      .attr("id", function(d) { return "focuse_cell_" + d.cls + '_' + d.rid})
      .attr("y", function(d) { return y_scale(d.oid); })
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
        d3.selectAll(".o_" + d.oid).classed('focus_highlight', true);
        highlightRawData([d.oid], [allRulesMap[d.cls][d.rid]]);
        //hightlightOverviewPos(d.oid, d.cls, d.rid);

      })
      .on("mouseover", function(d){ hightlightOverviewPos(d.oid, d.cls, d.rid) })
      .on("mouseout", function(){ d3.select("#bsvg .inline").selectAll("line").remove()})


  var colHead = col
      .append('g')
      .attr("class", "rulehead")
      .on('click', function(d){ reorderDetailObsByRule(d.cls, d.id); });
      


  colHead.each(function(d){
    
    /*  
    var ruleHeadScale = d3.scale.ordinal().domain(d3.range(d.it.length)).rangeBands([0, x_scale.rangeBand()]);
    var itemsetRect = d3.select(this).selectAll('.itemsetRect')
      .data(d.it)
      .enter().append('rect')
      .attr('class', 'itemsetRect')
      .attr("ry", 6)
      .attr("rx", 6)
      .attr("width", ruleHeadScale.rangeBand())
      .attr("height", colHeadHeight)
      .attr("x", function(d, i){ return ruleHeadScale(i)})
      .attr("y", 0)
      .style("fill", function(d){return attrColorScale(d.toLowerCase().split('=')[0]) })
      .on('mouseover', itemsetLabTip.show)
      .on('mouseout', itemsetLabTip.hide)
    */
      var itemGroup_detail_tab = d3.select(this).selectAll('.g')
      .data(d.it).enter()
      .append('g')
      .attr("transform", function(d, i){return "translate("+ (x_scale.rangeBand() - itemsetRectWidth)/2 + ","+i * (itemsetRectHeight + itemsetPadding) +")"})
      .on('mouseover', itemsetLabTip.show)
      .on('mouseout', itemsetLabTip.hide)

    itemGroup_detail_tab.append('text')
     .attr("dy","1em")
     .attr('dx', '.2em')
    .text(function(d){ return d.split('=')[1] })

    var itemRect_detail = itemGroup_detail_tab.insert('rect', 'text')
      .attr("width", itemsetRectWidth)
      .attr("height", itemsetRectHeight) 
      .attr('class', 'itemsetRect')
      .style('fill', function(d){ return attrColorScale(d.toLowerCase().split('=')[0])})
     

  })



  // horizontal line
  /*
  if (obsLab2Matches.length != 0 || obsLab1Matches.length !=0 ){
    svg.append("line")
      .attr("x1", 0)
      .attr("y1", y_scale(obsIdxLab1[0]))
      .attr("x2", width)
      .attr("y2", y_scale(obsIdxLab1[0]))
      .style("stroke", sepLineColor);
  }
  */

  if (obsLab2Matches.length != 0 ){
    svg.append("line")
      .attr("x1", 0)
      .attr("y1", cvsHeight)
      .attr("x2", width)
      .attr("y2", cvsHeight)
      .style("stroke", sepLineColor);
  }
  if (obsLab1Matches.length != 0 ){
    svg.append("line")
      .attr("x1", 0)
      .attr("y1", y_scale(obsIdxLab1[0]))
      .attr("x2", width)
      .attr("y2", y_scale(obsIdxLab1[0]))
      .style("stroke", sepLineColor);
  }


  var d3OrdinalScaleStep = (x_scale.rangeExtent()[1] - x_scale.rangeExtent()[0])/x_scale.domain().length - 0.1 + 2 * 0.1,
      padding = d3OrdinalScaleStep - x_scale.rangeBand();
  if(ruleCls1.length != 0 && ruleCls2.length !=0){
    svg.append("line")
      .attr("x1", x_scale(ruleCls1[0].cls + "_" + ruleCls1[0].id) - padding/2)
      .attr("y1", 0)
      .attr("x2", x_scale(ruleCls1[0].cls + "_" + ruleCls1[0].id) - padding/2)
      .attr("y2", cvsHeight)
      .style("stroke", sepLineColor);
  }


  function reorderDetailObsByRule(rcls, rid) {

    var firstObsLab1 = obsLab1Matches.filter(function(d){ return d.ruleid[rcls].indexOf(rid) != -1}),
        firstObsIdx = firstObsLab1.map(function(d){ return d.idx});

    var newObsLab1IdxDict = {};
    var i = 0;
    for (; i < firstObsIdx.length; i++){
      newObsLab1IdxDict[firstObsIdx[i]] = i;
    }
    var ii = 0;
    for (var j =0; j < obsLab1Matches.length; j++){
      if (!newObsLab1IdxDict.hasOwnProperty(obsLab1Matches[j].idx)){
        newObsLab1IdxDict[obsLab1Matches[j].idx] = i + ii;
        ii++;
      }
    }

    var newObsLab1Idx = [];
    for(var k in newObsLab1IdxDict){
      var order = newObsLab1IdxDict[k];
      newObsLab1Idx[order] = k;
    }



    var firstObsLab2 = obsLab2Matches.filter(function(d){ return d.ruleid[rcls].indexOf(rid) != -1}),
        firstObsIdx = firstObsLab2.map(function(d){ return d.idx});

    var newObsLab2IdxDict = {};
    var i = 0;
    for (; i < firstObsIdx.length; i++){
      newObsLab2IdxDict[firstObsIdx[i]] = i;
    }
    var ii = 0;
    for (var j = 0; j < obsLab2Matches.length; j++){
      if (!newObsLab2IdxDict.hasOwnProperty(obsLab2Matches[j].idx)){
        newObsLab2IdxDict[obsLab2Matches[j].idx] = i + ii;
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


    cell.attr("y", function(d) { return y_scale(d.oid); })
      // restore the initial height for the bars
      .attr("height", y_scale.rangeBand())

    //todo
    // process sortedRules
    // new tab includes rules that does not contain current node
    
    var nextLevelRules = sortedRules.filter(function(r){return r.cls != pre_sortBy_rcls || r.id != pre_sortBy_rid});
    addTab(rcls, rid, firstObsLab1, firstObsLab2, nextLevelRules, 'li_'+"tabs-" + pre_sortBy_rcls + "_" + pre_sortBy_rid);

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

  function highlightRawData(obsIdxWithinExt, ruleWithinExt){
    //console.log(obsIdxWithinExt, ruleWithinExt, ruleClsId);
    if(obsIdxWithinExt.length == 0 || ruleWithinExt.length == 0) return;
    descGrid.highlightObs = obsIdxWithinExt;
    descGrid.highlightRules = ruleWithinExt;
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

    toSortColumns.sort(function(a, b){ if(a.name < b.name) return -1; if(a.name > b.name) return 1; return 0;});
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

    itemsetMap.heightScale.domain(newRow.map(function(d){ return d.name + '_' + d.val}));
    //itemsetMap.widthScale.domain(curRuleClsIds);

    itemsetMap.row.attr("transform", function(d, i) { return "translate(0," + itemsetMap.heightScale(d.name + '_' + d.val) + ")"; });
    //itemsetMap.row.selectAll(".i_cell").attr("transform", function(d, i) { return i == 0 ? null : "translate(" + (itemsetMap.widthScale(d.cls + '_' + d.rid)) + ",0)"; });

    //ItemsetMapGrid hightlight
    d3.select('#grid_itemset').selectAll('rect').classed('itemset_highlight', false);
    for(var i = 0; i < ruleClsId.length; i++){
      d3.select('#grid_itemset').selectAll('.' + ruleClsId[i] + ' rect').filter(function(d){ return d.is }).classed('itemset_highlight', true);
    }

  }

}

function keepTab0Only(){
  $('#tabs ul li').each(function(idx, ele) {
    if (idx != 0 ) {
        $(this).remove();
    }
  });
  tabs.tabs( "refresh" );
  tabCounter =0;
}
