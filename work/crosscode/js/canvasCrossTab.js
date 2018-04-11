// @author Chong Zhang.
// Please contact me at chongzhang.nc@gmail.com if you have any questions


function canvasPixelColor(ev, context) {
  var x = ev.offsetX || ev.layerX;
  var y = ev.offsetY || ev.layerY;
  var data = context.getImageData(x, y, 1, 1).data;
  var r = data[0];
  var g = data[1];
  var b = data[2];
  var a = data[3];

  return {
    hex: rgbToHex(r, g, b),
    rgba: [r,g,b,a]
  }

  function rgbToHex(r, g, b) {
    return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
  }
}


function CanvasCrossTable(canvasId, options) {
  var w = options.w || 800,
      h = options.h || 800;

  this.colData = options.colData;
  this.rowData = options.rowData;

  this.defaultColor = options.defaultColor || '#ccc';
  this.borderWidth = w;
  this.borderHeight = h;

  this.padding = 0;

  this.xScale = d3.scale.linear()
    .domain([0, this.borderWidth])
    .range([0, this.borderWidth]);

  this.yScale = d3.scale.linear()
    .domain([0, this.borderHeight])
    .range([0, this.borderHeight]);



  this.rules_ids = this.colData.map(function(r){return r.cls + "_" + r.id});



  this.obsIdx = this.rowData.map(function(o){ return o.idx});

  var self = this;
  // get rule-pos by rule_id
  this.ruleid_pos = {},
  // get obx-pos by obs_idx
  this.obsIdx_pos = {};

  this.rules_ids.forEach(function(v, i){
    self.ruleid_pos[v] = i;
  })
  this.obsIdx.forEach(function(v, i){
    self.obsIdx_pos[v] = i;
  })

  this.x_scale = d3.scale.linear().domain([0, this.colData.length]).range([0, this.colData.length]),// rules_ids
  this.y_scale = d3.scale.linear().domain([0, this.rowData.length]).range([0, this.rowData.length]); // obsIdx




  var zoom = d3.behavior.zoom()
    .x(this.x_scale)
    .y(this.y_scale)
    .scaleExtent([1, 12])
    //.on("zoomstart", self.drawGridLines)
    .on("zoom", zoomCallback);

  this.canvas = d3.select("#" + canvasId);
  //this.canvas.call(zoom);

  function  zoomCallback () {
    self.clearAll();
    self.fill();
    console.log("zoomed")
  }

  this.ctx = this.canvas.node().getContext('2d');

  this.colSpace = 1.7;

  this.canvasWidth = this.borderWidth + 2 * this.padding ,
  this.canvasHeight = this.borderHeight + 2 * this.padding ;

  this.cellWidth = this.borderWidth / this.colData.length;
  this.cellHeight = this.borderHeight / this.rowData.length;

  this.canvas.attr('width', this.canvasWidth);
  this.canvas.attr('height', this.canvasHeight);


 /*
  document.getElementById(canvasId).addEventListener('click', function(ev) {
    var pos = {
        x: ev.offsetX || ev.layerX,
        y: ev.offsetY || ev.layerY
    };

    ev.cursorPos = pos;
    ev.gridInfo = self.lookup(pos);
    ev.gridInfo.color = canvasPixelColor(ev, self.ctx);
    console.log(pos)
    console.log(ev.gridInfo.color.hex)
  });
*/


}

CanvasCrossTable.prototype = {
  updateData: function(colData, rowData){
    this.colData = colData;
    this.rowData = rowData;
    this.rules_ids = this.colData.map(function(r){return r.cls + "_" + r.id});

    // get id by position
    this.obsIdx = this.rowData.map(function(o) { return o.idx})

    var self = this;

    // get position by id
    this.ruleid_pos = {},
    this.obsIdx_pos = {};

    this.rules_ids.forEach(function(v, i){
      self.ruleid_pos[v] = i;
    })
    this.obsIdx.forEach(function(v, i){
      self.obsIdx_pos[v] = i;
    })
  },
  lookup: function(pos) {
    // these are zero indexed, since they are most
    // likely representing an array/matrix.
    var x = Math.floor(pos.x / this.cellWidth);
    var y = Math.floor(pos.y / this.cellHeight);
    return {
      x: x,
      y: y,
      dimensions: {
        t: this.cellHeight * y,
        l: this.cellWidth * x,
        w: this.cellWidth,
        h: this.cellHeight
      }
    };
  },

  getColorByPos: function(pos) {
    var x = pos.x; // < this.colSpace ? pos.x : pos.x - this.colSpace;
    var y = pos.y;
    var data = this.ctx.getImageData(x, y, 1, 1).data;
    var r = data[0];
    var g = data[1];
    var b = data[2];
    var a = data[3];

    return rgbToHex(r, g, b);

    function rgbToHex(r, g, b) {
      return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
    }
  },

  fillCell: function(x, y, color) {
    this.ctx.fillStyle = color || this.defaultColor;
    this.ctx.fillRect(this.cellWidth * x , this.cellHeight * y , this.cellWidth - this.colSpace, this.cellHeight  );
    //this.ctx.fillRect(this.cellWidth * x +1 , this.cellHeight * y +0.01 , this.cellWidth -2, this.cellHeight -1 );
    //this.ctx.fillRect(this.cellWidth * x + 1, this.cellHeight * y + 1, this.cellWidth - 0.9, this.cellHeight - 2); // +1, +1, -0.9, -2
  },

  clearCell: function(x, y) {
    this.ctx.clearRect(this.cellWidth * x, this.cellHeight * y, this.cellWidth , this.cellHeight); // -0.9
    //this.ctx.clearRect(this.cellWidth * x + 1, this.cellHeight * y + 1, this.cellWidth - 0.9, this.cellHeight - 2); // -1.4
  },

  clearAll: function(){
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  },

  drawLine: function (x1, y1, x2, y2, color) {
    this.ctx.beginPath();
    this.ctx.moveTo(this.cellWidth * x1, this.cellHeight * y1);
    this.ctx.lineTo(this.cellWidth * x2, this.cellHeight * y2);
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
    /*
    this.ctx.beginPath();
    this.ctx.moveTo(0.5 + this.cellWidth * x1, 0.5 + this.cellHeight * y1);
    this.ctx.lineTo(0.5 + this.cellWidth * x2, 0.5 + this.cellHeight * y2);
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
    */
  },

  fill: function () {
    for (var i = 0; i < this.rowData.length; i++) {
      var o = this.rowData[i];

        for (var j = 0; j < o.ruleid.cls1.length; j++){
          var rid = o.ruleid.cls1[j];
          this.fillCell(this.ruleid_pos["cls1_"+rid], this.obsIdx_pos[o.idx], bluecolor[Math.round(color1Helper(allRulesMap['cls1'][rid]))]);

        }

        for (var j = 0; j < o.ruleid.cls2.length; j++){
          var rid = o.ruleid.cls2[j];
          this.fillCell(this.ruleid_pos["cls2_"+rid], this.obsIdx_pos[o.idx], redcolor[Math.round(color2Helper(allRulesMap['cls2'][rid]))]);
          //if(i <5 && j<4){console.log('x: ', this.ruleid_pos["cls2_"+rid] * this.cellWidth +1, 'y: ', this.obsIdx_pos[o.idx]*this.cellHeight+0.01 )}
        }

    }
    //this.drawLine(0, this.allObsLab2.length, this.colData.length, this.allObsLab2.length, "#000000");
    //this.drawLine(cls1Rule.length, 1, cls1Rule.length, this.allObs.length, "#000000");

  },


  drawGridLines: function() {


    // draw vertical lines
    for (var x = 0; x <= this.borderWidth; x += this.cellWidth) {

        this.ctx.moveTo(0.5 + x + this.padding, this.padding);
        this.ctx.lineTo(0.5 + x + this.padding, this.borderHeight + this.padding);
    }

    // draw horizontal lines
    for (var x = 0; x <= this.borderHeight; x += this.cellHeight) {
        this.ctx.moveTo(this.padding, 0.5 + x + this.padding);
        this.ctx.lineTo(this.borderWidth + this.padding, 0.5 + x + this.padding);
    }
    /*
    // draw vertical lines
    var x = 0;
    for (var i = 0; i <= matrix.col; i++) {

        this.ctx.moveTo(0.5 + x + padding, padding);
        this.ctx.lineTo(0.5 + x + padding, this.borderHeight + padding);
        x += this.cellWidth;
    }

    // draw horizontal lines
    x = 0;
    for (var i = 0; i <= matrix.row; i++) {
        this.ctx.moveTo(padding, 0.5 + x + padding);
        this.ctx.lineTo(this.borderWidth + padding, 0.5 + x + padding);
        x += this.cellHeight
    }
    */

    this.ctx.strokeStyle = "white"; //white
    this.ctx.stroke();

  },



  drawRow: function(y, columns, width) {



   /*
    context.rect(x_scale(d.cls+"_"+d.rid), 0, x_scale.rangeBand(), y_scale.rangeBand());
        context.fillStyle = redcolor[Math.round(cls1_color(allRulesMap[d.cls][d.rid].it.length))];
        context.fill();
        */
  }
};
