function ruleGraph(ruleRoot, leftRoot, rightRoot, outerHeight) {
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 820,
    step = 140, 
    chemStep=100,
    leafNodeWidth=22;

  if (arguments.length < 3) outerHeight = rightRoot, rightRoot = null;

  var height = outerHeight - margin.top - margin.bottom;

  var ruleHeightScale=d3.scale.linear().domain([0,ruleRoot.length]).range([0,height]) ; 
  var ruleRectw=100,
      ruleRecth=20,
      ruleTextY = 15,
        ruleTextX = 10;

  var ruleMarginHorizontal=(width-(2*step+leafNodeWidth+2)-(2*chemStep+leafNodeWidth+2)-(ruleRectw+2))/2.0;

  ruleRoot.forEach(function (d, i) {
            d.x = (2*step+leafNodeWidth+2)+ruleMarginHorizontal;//2 tree (left and right), 2 levels, 2 border
            d.y = ruleHeightScale(i);           
        });

  var tree = d3.layout.tree()
      .size([height, 1])
      .separation(function() { return 2; });

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      //.style("margin-top", "50px");

  
  var g = svg.selectAll("g")
      .data([].concat(
        leftRoot ? {type: "left", nodes: tree.nodes(leftRoot)} : [],
        rightRoot ? {type: "right", nodes: tree.nodes(rightRoot).map(flip), flipped: true} : []
      ))
    .enter().append("g")
      .attr("class", function(d) { return d.type; })
      .attr("transform", function(d) {
        return "translate(" + (!!d.flipped * width + margin.left) + "," + margin.top + ")";
      });

  var node = g.append("g")
      .attr("class", "node")
    .selectAll("g")
      .data(function(d) { return d.nodes; })
    .enter().append("g")
      .attr("class", function(d) { return d.type; })
      .attr("transform", function(d) { return "translate(" + d.depth * (d.type=="chemicals"?chemStep:step) + "," + d.x + ")"; })
      .on("mouseover", onMouseOverNode)
      .on("mouseout", onMouseOutNode);


  node.append("text")
      .attr("x", function(d) { return d.flipped ? -6 : 6; })
      .attr("dy", ".35em")
      .text(function(d) { return d.name; })
      .each(function(d) { d.width =Math.max(leafNodeWidth, this.getComputedTextLength() + 12); });//Math.max(leafNodeWidth, this.getComputedTextLength() + 12)

  var ruleDiagonal=d3.svg.diagonal()
        .source(function(d) { return {x: d.x1,y:d.y1 }; })
        .target(function(d) { return {x: d.x2,y: d.y2 }; })
        .projection(function(d) { return [d.y, d.x]; })

  node.insert("rect", "text")//outline rectangle
      .attr("ry", 6)
      .attr("rx", 6)
      .attr("y", -10)
      .attr("height", 20)
      .attr("width", function(d) { return d.width; })      
      .attr("id",function(d){return "node_"+d.group+"_"+d.name})
    .filter(function(d) { return d.flipped; })
      .attr("x", function(d) { return -d.width; });

  var varDiagonal = d3.svg.diagonal()
        .source(function(d) { return {y: d.source.depth * step + (d.source.flipped ? -1 : +1) * d.source.width, x: d.source.x}; })
        .target(function(d) { return {y: d.target.depth * step, x: d.target.x}; })
        .projection(function(d) { return [d.y, d.x]; });

  var varDiagonal1 = d3.svg.diagonal()
        .source(function(d) { var curstep=d.target.type=="chemicals"?chemStep:step; return {y: d.source.depth * curstep + (d.source.flipped ? -1 : +1) * d.source.width, x: d.source.x}; })
        .target(function(d) {var curstep=d.target.type=="chemicals"?chemStep:step; return {y: d.target.depth * curstep, x: d.target.x}; })
        .projection(function(d) { return [d.y, d.x]; });


  var varlink = g.insert("g", ".node")
      .attr("class", "varlink")
    .selectAll("path")
      .data(function(d) { return tree.links(d.nodes); })
    .enter().append("path")
      .attr("class", function(d) { return "to-" + d.target.type + " from-" + d.source.type; })
      .attr("d", varDiagonal1);

  var variablesKeySet={}, rulesSet={};
  var charNodes=[], chemNodes=[];
  charData.children.forEach(function(g){g.children.forEach(function(n){charNodes.push(n)})});
  chemData.children.forEach(function(g){g.children.forEach(function(n){chemNodes.push(n)})});
  var mergedNodeData=[].concat(charNodes, chemNodes);

  mergedNodeData.forEach(function (variable) {
    variable.key = variable.group+"_"+variable.name;
    variablesKeySet[variable.key] = variable;

    //construct the rules set where variable as the key  
    /* 
    rulesSet[variable.key]=[]; 
    ruleRoot.forEach(function(l){
      if(~l.links.indexOf(variable.key)){

      }else{
        rulesSet[variable.key].push(l);
      }
    })*/
  });

  


  var rulelinks = [], item, rulek;
  ruleRoot.forEach(function (r) {
    r.links.forEach(function (i) {
      item = variablesKeySet[i];
      if (!item || item.type === "reference") {
        return
      }   
      rulek = "r_"+r.name + "-to-" + item.key;             
      rulelinks.push({
        source: r,
        target: item,
        key: rulek,
        x1: r.y+ruleRecth/2.0,
        y1: r.x + (item.type === "characteristics" ? 0 : ruleRectw),
        x2: item.x,
        y2: item.flipped ? r.x+ruleMarginHorizontal+ruleRectw:item.depth * step+leafNodeWidth
      })
    })
  });


  var rulePaths = svg.append("g").attr("class","rulelinks").selectAll("path")
    .data(rulelinks)
    .enter()
    .append("path")
    .attr("id",function(d){return d.key})
    .attr("class", "join")
    .attr("d",ruleDiagonal);

  var allPathsID=[];
  d3.select(".rulelinks").selectAll("path").each(function(d){
    allPathsID.push(d.key);
  })
      
  function flip(d) {
    d.depth *= -1;
    d.flipped = true;
    return d;
  }

  //draw rule rects
  var allrules = svg.append("g").attr("class", "rules").attr("transform", function(d) { return "translate("+(2*step+leafNodeWidth+2+ruleMarginHorizontal)+","+margin.top+")"; });
  var rulesvg = allrules.selectAll(".rule")
      .data(ruleRoot)
      .enter()
      .append("g")
      .attr("class", "rule")
      .attr("id",function(d){return "r_"+d.name})
      .on("mouseover", onMouseOverRule)
      .on("mouseout", onMouseOutRule)
      .on("click", HighlightSelRule);
  
  rulesvg.append("rect").attr("width", ruleRectw).attr("height", ruleRecth).attr("x", 0).attr("y", function (d) {
    return d.y
  });
  rulesvg.append("text").attr("x", 10).attr("y", function (d) {
    return d.y+15
  })
  .attr("fill", "#fff").text(function (d) {
    return d.localSupp+", "+d.or;
  });

  //mouse events
  function onMouseOverRule(d){
    var highlightNodes=d.links, highlightPaths=[];
    highlightNodes.forEach(function(l){highlightPaths.push("r_"+d.name+"-to-"+l); return "node_"+l})
    highlightNodes.forEach(function(nodeid){
      d3.select("#"+nodeid).classed("highlight",true);
    })

    highlightPaths.forEach(function(pathid){
      d3.select("#"+pathid).classed("highlight",true);
    })
    d3.select(this).select("rect").classed("highlight",true);
  }

  function onMouseOutRule(){
    d3.selectAll(".rulelinks path").classed("highlight",false);
    d3.selectAll(".node rect").classed("highlight",false);
    d3.select(this).select("rect").classed("highlight",false);
  }
  function HighlightSelRule(){
    var isSelected = d3.select(this).classed( "selected");
    d3.select(this).classed("selected", !isSelected);
  }

  function onMouseOutNode(d) {
    d3.selectAll(".rulelinks path").classed("highlight",false);
    d3.selectAll(".node ").classed("highlight",false);
    d3.selectAll(".rule rect").classed("highlight",false);
    d3.selectAll(".node rect").classed("highlight",false);
    d3.selectAll(".rule ").classed("highlight",false);
  }

  function onMouseOverNode(node) {
    var highlightPaths=[], highlightRules=[], highlightNodes=[];
    if("children" in node && "parent" in node){
      var highlightChildren=node.children;
      highlightChildren.forEach(function(o){
        var keyword=o.group+"_"+o.name;
        
        //find rules
        d3.selectAll(".rule").each(function(d){
          if(d.links.indexOf(keyword)!=-1){
            highlightRules.push("r_"+d.name);
          }
        })

        //find nodes
        //itself
        highlightNodes.push("node_"+keyword);
        //find nodes in the other category: chemical/characteristics
        for(var i=0; i<highlightRules.length; ++i){
          var rulelinks=d3.select("#"+highlightRules[i]).data()[0].links;
          var nodeid=[];
          rulelinks.forEach(function(l){
            if(d3.select("#node_"+l).data()[0]){
				//if(d3.select("#node_"+l).data()[0].type!=node.type){
					highlightNodes.push("node_"+l);
				//}
            }
          });
        }
        //find paths
        for(var i=0; i<allPathsID.length; ++i){
          var nodeid=allPathsID[i].substr(allPathsID[i].lastIndexOf("-")+1);
          var ruleid=allPathsID[i].substr(0,allPathsID[i].indexOf('-'));
          if(highlightNodes.indexOf("node_"+nodeid)!=-1 && highlightRules.indexOf(ruleid)!=-1){
            highlightPaths.push(allPathsID[i]);
          }
        }

      })   
    }else if("parent" in node){
      var keyword=node.group+"_"+node.name;
   
      //find rules
      d3.selectAll(".rule").each(function(d){
        if(d.links.indexOf(keyword)!=-1){
          highlightRules.push("r_"+d.name);
        }
      })

      //find nodes
      //add itself
      highlightNodes.push("node_"+keyword);
      //find nodes in the other category: chemical/characteristics
        for(var i=0; i<highlightRules.length; ++i){
          var rulelinks=d3.select("#"+highlightRules[i]).data()[0].links;
          var nodeid=[];
          rulelinks.forEach(function(l){
            //if(d3.select("#node_"+l).data()[0].type!=node.type){
              highlightNodes.push("node_"+l);
            //}
          });
        }

      //find paths
      for(var i=0; i<allPathsID.length; ++i){
        var nodeid=allPathsID[i].substr(allPathsID[i].lastIndexOf("-")+1);
        var ruleid=allPathsID[i].substr(0,allPathsID[i].indexOf('-'));
        if(highlightNodes.indexOf("node_"+nodeid)!=-1 && highlightRules.indexOf(ruleid)!=-1){
          highlightPaths.push(allPathsID[i]);
        }
      }

    }else if("children" in node){
      console.log("children in node" )
    }

    highlightPaths.forEach(function(pathid){
      d3.select("#"+pathid).classed("highlight",true);
    })
    highlightRules.forEach(function(ruleid){
      d3.select("#"+ruleid).classed("highlight",true);
    })
    highlightNodes.forEach(function(nodeid){
      d3.select("#"+nodeid).classed("highlight",true);
    })

  }

}


var ruleData=[
      {"type":"rule","name":"1","localSupp":0.21,"or":0.5,"links":["M_AGEG_V_2","M_AGEG_V_3","M_EDU8G_V_8","M_EDU8G_V_2","M_DIABPREP_V_1","A_0","A_L","A_M","C_H","B_0","B_L"]},
      {"type":"rule","name":"2","localSupp":0.22,"or":0.65,"links":["M_ETHRACE_V_1","M_EDU8G_V_8","M_EDU8G_V_1","I_SEX_V_0","C_H","A_L","A_H","C_M","B_0","B_M"]},
      {"type":"rule","name":"3","localSupp":0.23,"or":1.5,"links":["M_AGEG_V_1","M_ETHRACE_V_2","M_ETHRACE_V_1","M_EDU8G_V_8","M_EDU8G_V_1","C_H", "B_L"]},     
      {"type":"rule","name":"7","localSupp":0.27,"or":0.95,"links":["M_AGEG_V_3","M_ETHRACE_V_1","M_EDU8G_V_1","C_H","B_M"]}
    ];

var charData={type: "char", name: "characteristics", children: [    
      
      {type:"characteristics",name:"M_DIABPREP_V",children:[
        {"type":"characteristics","name":"1","group":"M_DIABPREP_V","cap":"Yes"},    
        {"type":"characteristics","name":"2","group":"M_DIABPREP_V","cap":"No"}       
      ]},
      {type:"characteristics",name:"M_EDU8G_V",children:[
        {"type":"characteristics","name":"1","group":"M_EDU8G_V","cap":"8th grade or less"},    
        {"type":"characteristics","name":"2","group":"M_EDU8G_V","cap":"9th -12th grade"},   
        {"type":"characteristics","name":"8","group":"M_EDU8G_V","cap":"Doctorate"}        
      ]},
      
      
     
      {type:"characteristics",name:"M_AGEG_V",children:[
        {"type":"characteristics","name":"1","group":"M_AGEG_V","cap":"10-19"},    
        {"type":"characteristics","name":"2","group":"M_AGEG_V","cap":"20-24"},
        {"type":"characteristics","name":"3","group":"M_AGEG_V","cap":"25-29"}   
      ]},
      {type:"characteristics",name:"M_ETHRACE_V",children:[
        {"type":"characteristics","name":"1","group":"M_ETHRACE_V","cap":"White non-Hispanic"},    
        {"type":"characteristics","name":"2","group":"M_ETHRACE_V","cap":"Black non-Hispanic"},
        {"type":"characteristics","name":"3","group":"M_ETHRACE_V","cap":"Hispanic"},
        {"type":"characteristics","name":"4","group":"M_ETHRACE_V","cap":"Other non-Hispanic"}  
      ]}
    ]};

var chemData={type: "chem", name: "chemicals", children: [
      {type:"chemicals",name:"A",children:[
        {"type":"chemicals","name":"0","group":"A"},
        {"type":"chemicals","name":"L","group":"A"},
        {"type":"chemicals","name":"M","group":"A"},
        {"type":"chemicals","name":"H","group":"A"}
      ]},
      {type:"chemicals",name:"B",children:[
        {"type":"chemicals","name":"0","group":"B"},
        {"type":"chemicals","name":"L","group":"B"},
        {"type":"chemicals","name":"M","group":"B"},
        {"type":"chemicals","name":"H","group":"B"}
      ]},
      {type:"chemicals",name:"C",children:[
        {"type":"chemicals","name":"0","group":"C"},
        {"type":"chemicals","name":"L","group":"C"},
        {"type":"chemicals","name":"M","group":"C"},
        {"type":"chemicals","name":"H","group":"C"}
      ]}]};


    ruleGraph(ruleData, charData,chemData,600);