var classes = 5,
	colorStyle = 'cm1';
	
d3.select('#rulesview').classed(colorStyle, true);
d3.select('#restvisbtn').on('click', function(){restoreRightVis();})

var minmax = getDTdata('bd100');
var oTable = createRulesTable();
d3.select('#ruletable').classed(colorStyle, true);
updateRuleColor(minmax, oTable,'bd100');

reassignRuleID();
dtEventSetup();

$('input[name="bdtype"]').change(function() {		
	var type = $(this).val();		
	d3.selectAll('fieldset#bdtype label').classed('sel', false);
	d3.select('label[for="type_' + type + '"]').classed('sel', true);

	minmax = getDTdata(type);
	oTable = createRulesTable();
	d3.select('#ruletable').classed(colorStyle, true);
	updateRuleColor(minmax, oTable, type);
	dtEventSetup();
});

$('input[name="charttype"]').change(function() {
	var type = $(this).val();
	d3.selectAll('fieldset#charttype label').classed('sel', false);
	d3.select('label[for="chart_' + type + '"]').classed('sel', true);
	barchart.changeType(type);
});

$('input[name="pcpkeytype"]').change(function() {		
		var type = $(this).val();		
		d3.selectAll('fieldset#pcpkeytype label').classed('sel', false);
		d3.select('label[for="pcpkeytype_' + type + '"]').classed('sel', true);
		
		var pcpmatchtype = $('#pcpkeytype :radio:checked').val();		
		pcp.data = extractPCPda(pcp.curruleid, pcpmatchtype);
		pcp.updatePCP();
		
});

$('input[name="sortingtype"]').change(function() {		
		var type = $(this).val();		
		d3.selectAll('#sortingtype label').classed('sel', false);
		d3.select('label[for="sorting_' + type + '"]').classed('sel', true);		
		var sortingtype = $('#sortingtype :radio:checked').val();		
		barchart.sorting(sortingtype);
		
});

function reassignRuleID(){
	var firstRowID = $("#ruletable tbody").find("tr:first").attr("id");
	$('#ruletable tbody tr').removeClass('highlight');
	$("#ruletable tbody #" + firstRowID).addClass('highlight');
	
	var sortingtype = $('#sortingtype :radio:checked').val();		
	barchart.update(barchart.charttype, sortingtype, extractToxicD(firstRowID));
	var pcpmatchtype = $('#pcpkeytype :radio:checked').val();		
	pcp.data = extractPCPda(firstRowID,pcpmatchtype);
	pcp.curruleid = firstRowID;
	pcp.updatePCP();
}

function dtEventSetup(){
	//oTable.fnDrawCallback=reassignRuleID;
	$('#ruletable tbody').on('click', 'tr', function() {//click mouseover
		//barchart.updateChart(extractToxicD($(this).attr('id')));
		var ruleid = $(this).attr('id');
		var newd = extractToxicD(ruleid);
		var sortingtype = $('#sortingtype :radio:checked').val();	
		barchart.update(barchart.charttype, sortingtype, newd);
		$('#ruletable tbody tr').removeClass('highlight');
        $(this).addClass('highlight');
		
		var pcpmatchtype = $('#pcpkeytype :radio:checked').val();		
		var newpcpd = extractPCPda(ruleid, pcpmatchtype);
		pcp.restoreHigh();
		pcp.curruleid = ruleid;//store it
		pcp.updatePCP(newpcpd);			
	});

	var rows = oTable.fnGetNodes();
	
	for (var i = 0;i < rows.length; i++){		
		$(rows[i]).find('.tile').tooltip({ 			
			track: true 
		});
		//toxic with maxdiff tooltip
		$(rows[i]).find('.maxtoxic').tooltip({ 		
			content: function(){
				var toxicname = $(this).text();
				return toxicname == '' ? 'N/A': toxicname;		
			},
			track: true 
		});
	};
}

$('#barft_in').change( function(){
	barchart.restoreHigh();
	d3.select('#pcview').selectAll('.dimension')
		.selectAll('text')
          .style('font-size', null)
          .style('font-weight', null)
          .style('display', null);
	
	
	var curToxicIds = [],
		resToxicids = [];
	$.map(pcp.data, function(o){curToxicIds.push(o.name);}) ;
	
	for (var i in curToxicIds){
		if (curToxicIds[i].search(this.value.toUpperCase()) != -1) {
			resToxicids.push(curToxicIds[i]);			
		}
	}
	if (resToxicids.length != 0){
		d3.select('#barsvg').selectAll('.bars rect').style("display","none");
		d3.select('#barsvg').selectAll('text').style("display",null);
		d3.select('#barsvg').select('#txt_nofd').remove();
		var pathids = [];
		for (i in resToxicids){
			var toxicid = resToxicids[i].trim().toUpperCase(), 
				baridp = toxicid + '_p', 
				baridnp = toxicid + '_np', 
				pathid = toxicid;

			pathids.push(pathid);
			d3.select('#barsvg').selectAll('.bars #'+baridp).style("display", null);
			d3.select('#barsvg').selectAll('.bars #'+baridnp).style("display", null);
			d3.select(' #t_' + resToxicids[i].trim().toUpperCase()).style("display", null);
		}	
		pcp.highlight(pathids);		
	} else {
		d3.select('#barsvg').selectAll('.bars rect').style("display", "none");
		d3.select('#barsvg').selectAll('text').style("display", "none");
		var tblk = d3.select('#barsvg')
			.select('g')
			.append("svg:text")
			.style("text-anchor", "start")
			.attr("x", barchart.w / 2 - barchart.margin.left)
			.attr("y", barchart.h / 2 - barchart.margin.left)
			.attr("id", 'txt_nofd')
			.attr("class", "label")
			
		tblk.append("tspan").attr('x',barchart.w / 2 - barchart.margin.left).attr('dy', '0em').text('No Toxic Factors Found!')
		tblk.append("tspan").attr('x',barchart.w / 2 - barchart.margin.left).attr('dy', '2em').text('Please Try Another Keywords!')

		
		d3.select('#pcsvg').select('.foreground').selectAll("path").style("display", "none");	
		d3.select('#pcsvg').select(".background").selectAll("path").style("display", null);	
		
	}
	
});

/**
* returned format:
* data=
*/	
function extractToxicD(ruleid){
	var aP = [], 
		aNP = [];
	var rd = $.grep(rulesdata['conts'], function(r){return r.ruleid == ruleid;}),
		rdItems = rd[0].items;

	if (rdItems.length != 0){
		for (var i = 0; i < rdItems.length; i++){
			var aToxic = rdItems[i];
			var aToxic_rabs = aToxic['r_abs'];
			var bdtype = ruleid.substr(0,5),
				kp = 'r_' + bdtype + '_p',
				knp = 'r_' + bdtype + '_np';

			aP.push({t: aToxic.name, y: aToxic_rabs[kp] });
			aNP.push({t: aToxic.name, y: aToxic_rabs[knp] });		
		}
		return [aP, aNP];
		//return [[{t:'T1',y:5},{t:'T2',y:4},{t:'T3',y:-3}], [{t:'T1',y:3},{t:'T2',y:-9},{t:'T3',y:1}]];
	} else {
		return [[{t: '', y: ''}],[{t: '', y: ''}]];
	}
	//[[{t:'T1',y:3},{t:'T2',y:4},{t:'T3',y:-3}], [{t:'T1',y:-4},{t:'T2',y:-9},{t:'T3',y:1}]]
}
/**
* return object array: 
* [{name: "A108316",r_bd100_np: 0.084,r_bd100_p: 0.264,
								r_bd400_np: 0.086,r_bd400_p: 0.186,
								r_bd200_np: 0,r_bd200_p: 0,
								r_bd300_np: 0,r_bd300_p: 0}];
*/
function extractPCPda(ruleid,matchkeytype){
	var res = [],
		defaultks0 = ['name',
					'r_bd100_p','r_bd100_np',
					'r_bd200_p','r_bd200_np',
					'r_bd300_p','r_bd300_np',
					'r_bd400_p','r_bd400_np'];
		defaultks1 = ['name',
					'r_bd100',
					'r_bd200',
					'r_bd300',
					'r_bd400'];
		
		defaultks = matchkeytype == 0 ? defaultks0 : defaultks1;
	var ks = sortingPCdims(defaultks, ruleid.substr(0,5), matchkeytype);
	var rd = $.grep(rulesdata['conts'], function(r){ return r.ruleid == ruleid;}),
		rdItems = rd[0].items;	
	
	if (rdItems.length != 0){
		if(matchkeytype == 0){//cond items and toxic match
			for (var i = 0; i < rdItems.length; i++){
				var aToxic = rdItems[i];
				var aToxic_rabs = aToxic['r_abs'];
				var jsono = {};
				$.each(ks, function(j, d){
					if(aToxic_rabs.hasOwnProperty(d)){
						jsono[d] = aToxic_rabs[d];
					} else {
						jsono[d] = 'NULL';
					}
				});	

				jsono['name'] = aToxic['name'];
				res.push(jsono);
			}
			return res;	
		} else {// only toxic match
			for (var i = 0; i < rdItems.length; i++){
				var aToxic = rdItems[i];
				var aToxic_rabs = aToxic['r_chem'];
				var jsono = {};
				$.each(ks, function(j, d){
					if(aToxic_rabs.hasOwnProperty(d)){
						jsono[d] = aToxic_rabs[d];
					}else{
						jsono[d] = 'NULL';
					}
				});	
				jsono['name'] = aToxic['name'];
				res.push(jsono);
			}
			return res;			
		}
			
	} else {
		return [];
	}
}

function sortingPCdims(dims,bdtype,matchkeytype){
	var first2dims0, first2dims1;
	if (matchkeytype == 0){
		first2dims0 = 'r_' + bdtype + '_p';
		first2dims1 ='r_' + bdtype + '_np';
		
		var idx0 = dims.indexOf(first2dims0);
		dims.splice(idx0, 1);
		var idx1 = dims.indexOf(first2dims1);
		dims.splice(idx1,1);
		return [first2dims0, first2dims1].concat(dims);
	} else {
		firstdim = 'r_' + bdtype;
		var idx = dims.indexOf(firstdim);
		dims.splice(idx, 1);
		return [firstdim].concat(dims);
	}
		
}
function toggleVis() {
	//var oTable=$('#ruletable').dataTable();
	var rows = oTable.fnGetNodes();
	
	var valdisp = d3.select(".tileval").style("display");	
	var tiledisp = d3.select(".tile").style("display");	
	if(valdisp == 'block') {
    	//d3.selectAll(".tileval").style("display", "none");
		//d3.selectAll(".tile").style("display","inline-block");
		for (var i = 0; i < rows.length; i++){
			$(rows[i]).find('.tileval').css('display','none');
			$(rows[i]).find('.tile').css('display','inline-block');
		}
  	} else {
		//d3.selectAll(".tileval").style("display", "block");
		//d3.selectAll(".tile").style("display","none");
		for (var i = 0; i < rows.length; i++){
			$(rows[i]).find('.tileval').css('display','block');
			$(rows[i]).find('.tile').css('display','none');
		}
	}
} 

function updateRuleColor(mm,oTb,bdtype) {	
	var clsrange = [];	
	for (var i = 0; i < classes; i++) {
		clsrange.push(i);
	}

	var logorscale = d3.scale.quantize().domain([0, mm.mmlogor.max > 0 ? mm.mmlogor.max : 1]).range(clsrange),
		relsupscale = d3.scale.quantize().domain([0, mm.mmrelsup.max > 0 ? mm.mmrelsup.max : 1]).range(clsrange),
		diffscale = d3.scale.quantize().domain([0, mm.mmdiff.max > 0 ? mm.mmdiff.max : 1]).range(clsrange);
	
	var curbdrules = $.grep(rulesdata['cates'], function(item){return item.class == bdtype;}),
		curbdrulesd = curbdrules[0].data;
		
	var rows = oTable.fnGetNodes();
	for (var d = 0; d < rows.length; d++){//row	
		var sup, lr, df;
		//var ruleid = bdtype + '_'+d;
		var ruleid = rows[d].id;
		var selsup = '#' +  ruleid + '_s' + ' .tile',
			sellogor = '#' +  ruleid + '_o' + ' .tile',
			seldiff = '#' +  ruleid + '_d' + ' .tile';
				
		for (var i = 0; i < curbdrulesd.length; i++){
			if (ruleid == curbdrulesd[i].ruleid){
				sup = curbdrulesd[i].relsupp;
				lr = (curbdrulesd[i].logor == 'Infinity' ? mm.mmlogor.max : curbdrulesd[i].logor);
				df = curbdrulesd[i].maxdiff;
				break;
			}			
		}			
		// erase all previous logorscale designations on this cell
		for (var i = 0; i < classes; i++) {
			var cls_s = 'S' + i + '-' + classes,
				cls_o = 'O' + i + '-' + classes,
				cls_d = 'D' + i + '-' + classes;
				
			$(rows[d]).find(selsup).removeClass(cls_s);
			$(rows[d]).find(sellogor).removeClass(cls_o);
			$(rows[d]).find(seldiff).removeClass(cls_d);
			//d3.select(selsup).classed(cls_s , false);
			//d3.select(sellogor).classed(cls_o , false);
			//d3.select(seldiff).classed(cls_d , false);
		}
		
		// set new scale designation for this cell
		var cls_s = 'S' + (sup > 0 ? relsupscale(sup) : 0) + '-' + classes,
			cls_o = 'O' + (lr > 0 ? logorscale(lr) : 0) + '-' + classes,
			cls_d = 'D' + (df > 0 ? diffscale(df) : 0) + '-' + classes;
		$(rows[d]).find(selsup).addClass(cls_s);
			$(rows[d]).find(sellogor).addClass(cls_o);
			$(rows[d]).find(seldiff).addClass(cls_d);
		//d3.select(selsup).classed(cls_s , true);
		//d3.select(sellogor).classed(cls_o , true);
		//d3.select(seldiff).classed(cls_d , true);

	}
	//flipTiles();


}
function restoreRightVis(){
	
	if (pcp.dimsb4drag.length != 0){//reset from the state of axes drag	
		// reorder axes	
		pcp.xscale.domain(pcp.dimsb4drag);
		$.map(pcp.dimsb4drag, function(d){			
			pcp.pcvis_svg.selectAll(".dimension")
				.attr("transform", function(d) { return "translate(" + pcp.xscale(d) + ")"; });  
			//pcp.transition(d3.select('#dim_'+d)).attr("transform", "translate(" + pcp.xscale(d) + ")");
			pcp.transition(pcp.foreground)
				.attr("d", pcp.path);
			pcp.background.attr("d", pcp.path)
				.transition().delay(500).duration(0)
				.attr("visibility", null); 
		})
		pcp.isdragged = 0;
		pcp.ishighlt = 0;
  }     
	
	pcp.restoreHigh();
	barchart.restoreHigh();
}

function flipTiles() {

	var oldSide = d3.select('#ruletable').attr('class'),
		newSide = '';
	
	var flipper = function(h, d, side) {
		return function() {
			var sel = '#d' + d + 'h' + h + ' .tile',
				rotateY = 'rotateY(180deg)';
			
			if (side === 'back') {
				rotateY = 'rotateY(0deg)';	
			}
			
			d3.select(sel).style('-webkit-transform', rotateY);
			
				
		};
	};
	
	for (var h = 0; h < bds.length; h++) {
		for (var d = 0; d < data['rules'].length; d++) {
			var side = d3.select('#ruletable').attr('class');
			setTimeout(flipper(h, d, side), (h * 20) + (d * 20) + (Math.random() * 100));
		}
	}
	d3.select('#ruletable').attr('class', newSide);
}

function contains(ary,obj) {
    var i = ary.length;
    while (i--) {
        if (ary[i].DIM_NAME === obj.DIM_NAME) {
		    return true;
        }
    }
    return false;
}

String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
};

