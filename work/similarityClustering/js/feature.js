d3.ruleGrid = function() {


  var margin = {top: 90, right: 0, bottom: 10, left: 10},    
    outerWidth = 400,
    outerHeight = 600,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

  var svg;

  var x = d3.scale.ordinal().rangeBands([0, width]),
    y = d3.scale.ordinal().rangeBands([0, height]),
    c = function(cls){ return cls == "cls1" ? "red" : "green"};


  var dispatch = d3.dispatch('nodeClick');
  dispatch.on('nodeClick.int', function(d){
    _checkChildren(d);
  });
  dispatch.on('nodeClick.ext');




  function exports(sel) {
    // [{"cls":"cls1","m":[[0.0519,2534],90.5323,1.19009],"id":1,"it":["workclass=?"]}, ...]
    sel.each(function(ruleData) {


      svg = sel.append("svg")
            .attr("width", outerWidth)
            .attr("height", outerHeight) 
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // matrix: [[{it:[{aname,aval}, {}, ...], m, id], [], ...]
      var matrix = [],
          attrs = ruleData.attributes.map(function(a, i){ return {name: a, index: i}}),
          n = attrs.length;
      
      var attrMap = {};
      attrs.forEach(function(a) {
        attrMap[a.name] = a.index;
      })
            
      ruleData.data.forEach(function(r, i) {        
        // z is used to determine if the attribute hits the rule
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });       
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
        name: d3.range(n).sort(function(a, b) { return d3.ascending(attrs[a].name, attrs[b].name); }),
        ruleConf: d3.range(ruleData.data.length).sort(function(a, b) { return d3.ascending(ruleData.data[a].m[1], ruleData.data[b].m[1]); })
      };

      // The default sort order.
      x.domain(orders.name);
      y.domain(orders.ruleConf);

      svg.append("rect")
          .attr("class", "background")
          .attr("width", width)
          .attr("height", height);

      var row = svg.selectAll(".row")
          .data(matrix)
        .enter().append("g")
          .attr("class", "row")
          .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; })
      
      row.append('rect')
        .attr('width', width)
        .attr("height", y.rangeBand())
        .attr('class', 'rowBg')
        .style('display', 'none')

      row.each(drawRow);

      row.append("line")
          .attr("x2", width);

      

      /*
      row.append("text")
          .attr("x", -6)
          .attr("y", y.rangeBand() / 2)
          .attr("dy", ".32em")
          .attr("text-anchor", "end")
          .text(function(d, i) { return 'rule_' + i });
      */

      var column = svg.selectAll(".column")
          .data(attrs)
        .enter().append("g")
          .attr("class", "column")
          .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; })
          .on('click', columnClick);

      column.append("line")
          .attr("x1", -height);

      column.append("text")
          .attr("x", 6)
          .attr("y", x.rangeBand() / 2)
          .attr("dy", ".32em")
          .attr("text-anchor", "start")
          .text(function(d, i) { return attrs[i].name; });

      function drawRow(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function(d) { return d.z; }))
          .enter().append("rect")
            .attr("class", function(d){ return "cell " + d.itname})
            .attr("x", function(d) { return x(d.x); })
            .attr("width", x.rangeBand())
            .attr("height", y.rangeBand())            
            //.style("fill-opacity", function(d) { return z(d.z); })
            .style("fill", function(d) { return c(d.rule.cls); })
            .on("click", cellClickCell)
            //.on("mouseout", mouseout);
      }

  function mouseover(p) {
    d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
    d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
  }

  function mouseout() {
    d3.selectAll("text").classed("active", false);
  }

  d3.select("#order").on("change", function() {
    clearTimeout(timeout);
    order(this.value);
  });

  function order(value) {
    x.domain(orders[value]);

    var t = svg.transition().duration(2500);

    t.selectAll(".row")
        .delay(function(d, i) { return x(i) * 4; })
        .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
      .selectAll(".cell")
        .delay(function(d) { return x(d.x) * 4; })
        .attr("x", function(d) { return x(d.x); });

    t.selectAll(".column")
        .delay(function(d, i) { return x(i) * 4; })
        .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
  } 

  function cellClickRule(d) {
    if (!~scatterView.rules().indexOf(d.rule.cls + '_' + d.rule.id)) {
      scatterView.rules.add(d.rule.cls + '_' + d.rule.id);

      d3.select(this.parentNode).select('.rowBg').style('display', 'block');
      if(d.rule.cls == 'cls1') {
        for(var i = 0; i < d.rule.it.length; i++){
          var r = d.rule.it[i];
          scatterView.xFeatures.add(r.aname + '=' + r.aval);
        }
        
      } else if(d.rule.cls == 'cls2'){
        for(var i = 0; i < d.rule.it.length; i++){
          var r = d.rule.it[i];
          scatterView.yFeatures.add(r.aname + '=' + r.aval);
        }

      }
    } else {
      scatterView.rules.remove(d.rule.cls + '_' + d.rule.id);

      d3.select(this.parentNode).select('.rowBg').style('display', 'none');

      if(d.rule.cls == 'cls1') {   
        for(var i = 0; i < d.rule.it.length; i++){
          var r = d.rule.it[i];
          scatterView.xFeatures.remove(r.aname + '=' + r.aval);
        }
        
      } else if(d.rule.cls == 'cls2'){
        for(var i = 0; i < d.rule.it.length; i++){
          var r = d.rule.it[i];
          scatterView.yFeatures.remove(r.aname + '=' + r.aval);
        }
        
      }
      
    }
    

    scatterView.update();

  }

  function cellClickCell(d) {
    var featureId = d.itname + '_' + d.itval + '-' + d.rule.cls + '_' + d.rule.id;
    if (!~scatterView.features().indexOf(featureId)) {
      scatterView.features.add(featureId);

      d3.select(this).classed('cellHighlight', true);
      if(d.rule.cls == 'cls1') {
        
        scatterView.xFeatures.add(d.itname + '=' + d.itval);
        
        
      } else if(d.rule.cls == 'cls2'){
        
          scatterView.yFeatures.add(d.itname + '=' + d.itval);
      

      }
    } else {
      scatterView.features.remove(featureId);

      d3.select(this).classed('cellHighlight', false);

      if(d.rule.cls == 'cls1') {   
        
        scatterView.xFeatures.remove(d.itname + '=' + d.itval);
        
        
      } else if(d.rule.cls == 'cls2'){
        
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

  exports.width = function(_) {
    if(!arguments.length){
            return width;
        }
       width = _;
       return this;
  }

  exports.height = function(_) {
    if(!arguments.length){
            return height;
        }
        height = _;
        return this;

  }

  return d3.rebind(exports, dispatch, 'on');

}
