var charData={type: "char", name: "characteristics", children: [
      {type:"characteristics",name:"I_SEX_V",children:[
        {"type":"characteristics","name":"I_SEX_V_1","group":"I_SEX_V","cap":"Male"},    
        {"type":"characteristics","name":"I_SEX_V_2","group":"I_SEX_V","cap":"Female"}       
      ]},      
      {type:"characteristics",name:"M_DIAB_V",children:[
        {"type":"characteristics","name":"M_DIAB_V_1","group":"M_DIAB_V","cap":"Yes"},    
        {"type":"characteristics","name":"M_DIAB_V_2","group":"M_DIAB_V","cap":"No"}       
      ]},
      {type:"characteristics",name:"M_BMIG_V",children:[
        {"type":"characteristics","name":"M_BMIG_V_1","group":"M_BMIG_V","cap":"Underweight"},    
        {"type":"characteristics","name":"M_BMIG_V_2","group":"M_BMIG_V","cap":"Normal weight"},
        {"type":"characteristics","name":"M_BMIG_V_3","group":"M_BMIG_V","cap":"Overweight"},
        {"type":"characteristics","name":"M_BMIG_V_4","group":"M_BMIG_V","cap":"Obese"}  
      ]},
      {type:"characteristics",name:"M_AGEG_V",children:[
        {"type":"characteristics","name":"M_AGEG_V_1","group":"M_AGEG_V","cap":"10-19"},    
        {"type":"characteristics","name":"M_AGEG_V_2","group":"M_AGEG_V","cap":"20-24"},
        {"type":"characteristics","name":"M_AGEG_V_3","group":"M_AGEG_V","cap":"25-29"},    
        {"type":"characteristics","name":"M_AGEG_V_4","group":"M_AGEG_V","cap":"30-34"}, 
        {"type":"characteristics","name":"M_AGEG_V_5","group":"M_AGEG_V","cap":"35-39"},    
        {"type":"characteristics","name":"M_AGEG_V_6","group":"M_AGEG_V","cap":"40-100"}     
      ]},
      {type:"characteristics",name:"M_ETHRACE",children:[
        {"type":"characteristics","name":"M_ETHRACE_1","group":"M_ETHRACE","cap":"White non-Hispanic"},    
        {"type":"characteristics","name":"M_ETHRACE_2","group":"M_ETHRACE","cap":"Black non-Hispanic"},
        {"type":"characteristics","name":"M_ETHRACE_3","group":"M_ETHRACE","cap":"Hispanic"},
        {"type":"characteristics","name":"M_ETHRACE_4","group":"M_ETHRACE","cap":"Other non-Hispanic"}  
      ]},     
      {type:"characteristics",name:"M_EDUG_V",children:[
        {"type":"characteristics","name":"M_EDUG_V_1","group":"M_EDUG_V","cap":"Less than high school"},
        {"type":"characteristics","name":"M_EDUG_V_2","group":"M_EDUG_V","cap":"High school"},
        {"type":"characteristics","name":"M_EDUG_V_3","group":"M_EDUG_V","cap":"Greater than high school"}
      ]},
      {type:"characteristics",name:"M_SMOKED_V",children:[
        {"type":"characteristics","name":"M_SMOKED_V_0","group":"M_SMOKED_V","cap":"Yes"},
        {"type":"characteristics","name":"M_SMOKED_V_1","group":"M_SMOKED_V","cap":"No"}
      ]}     
    ]};





var margin = {top: 20, right: 120, bottom: 20, left: 60},
    width = 270 - margin.right - margin.left,
    height = 300 - margin.top - margin.bottom;

  var leafNodeWidth=22;
    
var i = 0,
    duration = 750,
    root;

var tree = d3.layout.tree()
    .size([height, 1]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 
  root = charData;
  root.x0 = height / 2;
  root.y0 = 0;

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  root.children.forEach(collapse);
  update(root);


//d3.select(self.frameElement).style("height", "800px");

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 100; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click);

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? 6 : -6; })
      .attr("dy", ".1em")
      .attr("text-anchor", function(d) { return d.children ? "end":  "start"; })
      //.text(function(d) { return d.name; })
      .text(function(d) { return d.children || d._children?d.name:d.cap; })
      //.style("fill-opacity", 1e-6)
      .each(function(d) { d.width =Math.max(leafNodeWidth, this.getComputedTextLength() + 12); });//Math.max(leafNodeWidth, this.getComputedTextLength() + 12)

  
  nodeEnter.insert("rect", "text")//outline rectangle
      .attr("ry", 6)
      .attr("rx", 6)
      .attr("y", -10)
      .attr("height", 20)
      .attr("width", 2)      
      .attr("id",function(d){return "node_"+d.name})
      .attr("x",function(d){ return d.children ? -70: 0 ; })
      

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("rect")
       .attr("width", function(d) { return d.width; })      
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("rect")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("rect")
      .attr("width", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}