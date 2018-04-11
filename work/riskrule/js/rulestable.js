
function createRulesTable(){
	var oTable = $('#ruletable').dataTable({
		"bJQueryUI": true,
		"bAutoWidth": false,
		"asStripClasses": [],									
		"sPaginationType": "full_numbers",
		"sScrollXInner": "100%",
		"sScrollY": "770px",//456px
		"sScrollYInner": "110%",
		"bScrollCollapse": true,
		//"sDom": '<"H"lfr><"#sigor">t<"F"ip>',
		"oLanguage": { "sSearch": "<span style=' margin-top: 8px; '>Significance level for Odds Ratio is 0.05 </span>Search Antecedent: " ,
								"sZeroRecords": "No matching rules found.",
								"sLengthMenu": 'Show <select>' +
																	'<option value="16">16</option>' +
																	'<option value="20">20</option>' +       
																	'<option value="50">50</option>' +
																	'<option value="-1">All</option>' +
																	'</select> rules '
								},
		"iDisplayLength": 16,		
		"fnDrawCallback": reassignRuleID,
		//"aaData": getDTdata('bd100'),
		//"aaData":[["M_AGE_V=19", "", 0.0502, "0", "A1319773", 0.208],["M_EDUBYYEA=16", "", 0.0502, "Infinity", "", 0],["M_AGE_V=31", "", 0.0502, "0.149", "A78933", 0.161]],
		"aoColumns":[ 
			{"sWidth": "40%","bSearchable": true},
			{"sWidth": "8%","bSearchable": false},
			{"sWidth": "8%","bSearchable": false},
			{"sWidth": "8%","bSearchable": false}, 
			{"sWidth": "50px","bSearchable": false}
		]
	});	
	//$('#sigor').html('Significance level for Odds Ratio is 0.05');
	return oTable;
}
function fnShowHide(imgid,icol ){
	/* Get the DataTables object again - this is not a recreation, just a get of the object */
	var oTable = $('#ruletable').dataTable();
	for (var i = 0;i < icol.length; i++){
		var bVis = oTable.fnSettings().aoColumns[icol[i]].bVisible;
		oTable.fnSetColumnVis(icol[i], bVis ? false : true );
	}
	//var src = ($('#'+imgid).attr('src')==='css/images/minus.jpg')?'css/images/plus.jpg':'css/images/minus.jpg'
	//$('#' + imgid).attr('src', src);
}
// [[],[],[],...]
function getDTdata(bdtype){	
	var res = [];
	
	var fitbdrules;
	var bdsdata = rulesdata['cates'];
	for (var i = 0; i < bdsdata.length; i++){
		if (bdtype == bdsdata[i]['class']){
			fitbdrules = bdsdata[i]['data'];
			break;
		}
	}
	
	var minlogor = minsup = mindiff = 1,
		maxlogor = maxsup = maxdiff = -1;	
	for (var i = 0; i < fitbdrules.length; i++){
		var onerule = fitbdrules[i];
		if (!onerule["maxname"]) continue;
		
		var eachlogor = onerule['logor'],
			eachrelsup = onerule['relsupp'],
			eachdiff = onerule['maxdiff'];
		
		if (eachlogor != 'Infinity' && eachlogor > maxlogor) {
			maxlogor = eachlogor;
		}
		if (eachlogor < minlogor) {
			minlogor = eachlogor;
		}
		
		if (eachrelsup >maxsup ) {
			maxsup = eachrelsup;
		}
		if (eachrelsup < minsup) {
			minsup = eachrelsup;
		}
		
		if (eachdiff > maxdiff) {
			maxdiff = eachdiff;
		}
		if (eachdiff < mindiff) {
			mindiff = eachdiff;
		}
		
		var attrvalpairs = [];		
		var items = onerule['items'];
		for (var j = 0; j < items.length; j++){
			var oneattrval = items[j];
			attrvalpairs.push(oneattrval['attr'] + '=' + oneattrval['val'])
		}
		var attrvalstr = attrvalpairs.join(',');
		
		res.push([onerule['ruleid'], attrvalstr, '', onerule['relsupp'], onerule['logor'].toString(), onerule['cil'].toString(), onerule['ciu'].toString(), onerule['maxname'], onerule['maxdiff']]);
	}	
	//return res;
	
	// Use underscore to convert the template to a 'template' object
	var rulestmpl = _.template($('#rulestabletmpl').text());

	// Use the template object to output our html
	// Note that the customerList name equates to the customerList
	// array that is used in the template.
	var html = rulestmpl({'curBDrules': res, 'bdtype': bdtype.toUpperCase()});
	$("#rulestablediv").html(html);
	
	return {'mmlogor': {'min': minlogor, 'max': maxlogor}, 'mmrelsup': {'min': minsup, 'max': maxsup}, 'mmdiff': {'min': mindiff, 'max': maxdiff} };
}
