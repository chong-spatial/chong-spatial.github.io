var testdata=[{"name":"A74908","corrs":[{"n":"A74908","v":"1"},{"n":"A120832","v":"0.503"},{"n":"AN078","v":"0.157"},{"n":"A75150","v":"0.156"},{"n":"A98953","v":"0.519"},{"n":"A56235","v":"0.442"},{"n":"A95545","v":"0.606"},{"n":"A120821","v":"0.503"},{"n":"A4080313","v":"-0.014"},{"n":"A75865","v":"0.372"},{"n":"A79061","v":"0.155"},{"n":"A1344281","v":"0.003"},{"n":"A62533","v":"0.569"},{"n":"AN020","v":"-0.004"},{"n":"AN050","v":"-0.002"},{"n":"A67663","v":"0.165"},{"n":"AN084","v":"0.503"},{"n":"A7440508","v":"-0.01"},{"n":"A1163195","v":"-0.012"},{"n":"A117817","v":"-0.007"},{"n":"A1918009","v":"0.503"},{"n":"A131113","v":"-0.012"},{"n":"A124403","v":"0.357"},{"n":"A2300665","v":"0.503"},{"n":"A122394","v":"0.205"},{"n":"A7782414","v":"-0.011"},{"n":"A64186","v":"0.008"},{"n":"A7439921","v":"-0.006"},{"n":"A108383","v":"0.598"},{"n":"AN458","v":"0.02"},{"n":"A67561","v":"0.322"},{"n":"AN511","v":"0.103"},{"n":"A95476","v":"0.545"},{"n":"P_GESTAGE","v":"0.001"},{"n":"A108952","v":"0.33"},{"n":"AN725","v":"-0.004"},{"n":"A1982690","v":"0.503"},{"n":"AN760","v":"-0.002"},{"n":"A137268","v":"0.156"},{"n":"A108883","v":"0.415"},{"n":"A79016","v":"-0.014"},{"n":"A121448","v":"0.1"},{"n":"A7440666","v":"-0.006"},{"n":"I_BWT_V","v":"-0.007"}],"models":[{"n":["A120832","A67561","A98953","A75865","A108883","A74908"],"p":["2.668","1.000","1.001","0.977","1.000","1.000"]},{"n":["A120832","A67561","A56235","A75865","A108883","A74908"],"p":["3.340","1.000","1.000","0.966","1.000","1.000"]},{"n":["A120832","A67561","A62533","A75865","A108883","A74908"],"p":["2.736","1.000","1.000","0.969","1.000","1.000"]},{"n":["A120832","A108952","A98953","A75865","A108883","A74908"],"p":["2.663","1.000","1.001","0.976","1.000","1.000"]}]},{"name":"A120832","corrs":[{"n":"A74908","v":"0.503"},{"n":"A120832","v":"1"},{"n":"AN078","v":"-0.004"},{"n":"A75150","v":"0.004"},{"n":"A98953","v":"0.615"},{"n":"A56235","v":"0.386"},{"n":"A95545","v":"0.831"},{"n":"A120821","v":"1"},{"n":"A4080313","v":"-0.004"},{"n":"A75865","v":"0.46"},{"n":"A79061","v":"-0.002"},{"n":"A1344281","v":"-0.001"},{"n":"A62533","v":"0.652"},{"n":"AN020","v":"-0.001"},{"n":"AN050","v":"-0.001"},{"n":"A67663","v":"0.141"},{"n":"AN084","v":"1"},{"n":"A7440508","v":"-0.003"},{"n":"A1163195","v":"-0.005"},{"n":"A117817","v":"-0.005"},{"n":"A1918009","v":"1"},{"n":"A131113","v":"-0.004"},{"n":"A124403","v":"0.496"},{"n":"A2300665","v":"1"},{"n":"A122394","v":"-0.003"},{"n":"A7782414","v":"-0.003"},{"n":"A64186","v":"-0.004"},{"n":"A7439921","v":"-0.004"},{"n":"A108383","v":"-0.006"},{"n":"AN458","v":"-0.001"},{"n":"A67561","v":"0.022"},{"n":"AN511","v":"-0.002"},{"n":"A95476","v":"-0.005"},{"n":"P_GESTAGE","v":"-0.001"},{"n":"A108952","v":"-0.004"},{"n":"AN725","v":"-0.001"},{"n":"A1982690","v":"1"},{"n":"AN760","v":"-0.001"},{"n":"A137268","v":"-0.003"},{"n":"A108883","v":"0.022"},{"n":"A79016","v":"-0.005"},{"n":"A121448","v":"-0.002"},{"n":"A7440666","v":"-0.002"},{"n":"I_BWT_V","v":"-0.013"}],"models":[{"n":["A98953","A124403","A75865","A120832"],"p":["1.001","0.998","0.981","6.426"]},{"n":["A56235","A124403","A75865","A120832"],"p":["1.000","0.999","0.967","5.473"]},{"n":["A62533","A124403","A75865","A120832"],"p":["1.000","0.998","0.972","5.829"]}]}];

var marginH=20,
    marginV=20;
var width = 860,
    height = 160;

var lableW=20, lableH=30;

var curCorrMin=0.3,curCorrMax=0.7;

var varInQuestionSizeTimes=1;
var negone=d3.range(testdata[0].corrs.length).map(function(){return -1;});
var x = d3.scale.ordinal().domain(d3.range(testdata[0].corrs.length)).rangeBands([lableW, width]);

var corrsVars=[];
testdata[0].corrs.forEach(function(r){corrsVars.push(r.n)})

var color = d3.scale.quantize()
    .domain([-.05, .05])
    .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

var rootsvg = d3.select("#chart").selectAll("svg")
    .data(testdata)
  .enter().append("svg")
    .attr("width", width)
    .attr("height", height)

  rootsvg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height);

var svg=rootsvg  
    .append("g")
    .attr("height",height-lableH)
    .attr("transform", "translate(0," + lableH + ")");
    //.attr("transform", "translate(" + marginH+ "," + marginV + ")");
/*
svg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) { return d.name; });
*/
/*var corrSvg=svg.append("g").attr("class","Corr").attr("transform", function(d,i) { return "translate("+varInQuestionSizeTimes* x.rangeBand() +",0)"; });*/
var corrSvg=svg.append("g").attr("class","Corr").attr("transform", function(d,i) { return "translate(0,0)"; });

var rowCorrs = corrSvg.selectAll("rect")
    .data(function(d){return d.corrs;})
  .enter().append("rect")
    .attr("class", function(d,i){return "q"+corrColorScale0(d.v,curCorrMin,curCorrMax)+"-5";})
    .attr("width", x.rangeBand())
    .attr("height", x.rangeBand())
    .attr("x", function(d,i) { return x(i); })
    .attr("y", 0)
    .attr("lat",function(d){return d.n});


rowCorrs.append("title")
    .text(function(d) { return d.n+", "+d.v; });

var rowModels = svg.selectAll(".Model")
   .data(function(d){return d.models}) 
  .enter().append("g")
    .attr("class", "Model")  
    .attr("transform", function(d,i) { return "translate(0,"+(varInQuestionSizeTimes+ i) * x.rangeBand()+")"; }); 
    //.attr("transform", function(d,i) { return "translate("+varInQuestionSizeTimes* x.rangeBand() +","+(varInQuestionSizeTimes+ i) * x.rangeBand()+")"; });

rowModels.selectAll(".cell")
   .data(function(d){
      var allModelParas=[];
         
      for(var i in corrsVars){
        var idx=d.n.indexOf(corrsVars[i]);  
        if(idx==-1){
          allModelParas.push(-1);
        }else{          
          allModelParas.push(d.p[idx]);
        }
      }
      return d3.zip(corrsVars,allModelParas);
  })
  .enter().append("rect")
    .attr("class", function(d){return "q"+orColorScale(+d[1])+"-3";}) 
    .classed("cell",true)
    .attr("x", function(d, i) { return x(i); })
    .attr("lat",function(d,i){return d[0];})
    .attr("width", x.rangeBand())
    .attr("height", x.rangeBand())
    .append("title")
    .text(function(d) { return d[0]+", "+d[1]; });

rootsvg.each(function(d){
  var varInQuestionSvg=d3.select(this).append("g")
    .attr("class","varsvg")
    .attr("transform","translate(0,0)");

   var varLabel=varInQuestionSvg.append("text")
                .attr("x",0)
                .attr("y",5)
                .attr("dy",".6em")
                .text(function(d){return d.name;});
varInQuestionSvg.insert("rect","text")//outline rectangle
                

                .attr("height", varInQuestionSizeTimes*x.rangeBand())
                .attr("width", varLabel.node().getComputedTextLength());



})


svg.each(function(d){
  d3.select(this).append("g").attr("class","confdInd")
    .attr("transform",function(da,i){return "translate("+(x.rangeBand()-10)+","+(x.rangeBand()-10)+")rotate(90)";})
    .selectAll(".confdIndCell")
    .data(d.models)
    .enter().append("circle")
    .attr("class", "confdIndCell")
    .attr("cx", function(da, i) { return x(i); })
    .attr("r", x.rangeBand()/2.0);  
})
/*
svg.each(function(d){
  d3.select(this).append("g").attr("class","confdInd")
    .attr("transform",function(d,i){return "translate("+x.rangeBand()+","+varInQuestionSizeTimes*x.rangeBand()+")rotate(90)";})
    .selectAll(".confdIndCell")
    .data(function(d){return d.models;})
    .enter().append("rect")
    .attr("class", "confdIndCell")
    .attr("x", function(d, i) { return x(i); })
    .attr("width", x.rangeBand())
    .attr("height", x.rangeBand());  
})
*/



/*
d3.csv("dji.csv", function(error, csv) {
  var data = d3.nest()
    .key(function(d) { return d.Date; })
    .rollup(function(d) { return (d[0].Close - d[0].Open) / d[0].Open; })
    .map(csv);

  rect.filter(function(d) { return d in data; })
      .attr("class", function(d) { return "day " + color(data[d]); })
    .select("title")
      .text(function(d) { return d + ": " + percent(data[d]); });
});
*/
function orColorScale(or){
  if(or==-1){//not selected
    return "n"
  }else if(or>1) {
    return "0";
  }else if(or==1){
    return "1";
  }else{
    return "2";
  }
}

function corrColorScale0(r, confdMin, confdMax){
  if(r <=1 && r >confdMax) {
    return "0";
  }else if(r <=confdMax && r >= confdMin){
    return "1";
  }else if(r <confdMin && r>-confdMin){
    return "2";
  }else if(r<=-confdMin && r>=-confdMax){
    return "3";
  }else{
    return "4";
  }
}