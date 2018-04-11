//var descGrid;
//var descDataView = initDescTab();

$(".grid-header .ui-icon")
  .addClass("ui-state-default ui-corner-all")
  .mouseover(function (e) {
    $(e.target).addClass("ui-state-hover")
  })
  .mouseout(function (e) {
    $(e.target).removeClass("ui-state-hover")
  });


// raw data highlight
function descTabHighlight(rowCol, goFirstColumnFields){
    /*
    {
      slickGridIdx_0: {
        "cap-shape": "slickGrid_highlight_red_0",
        "cap-color": "slickGrid_highlight_red2"
        "bruises":   "slickGrid_highlight_blue_2"
      },
      slickGridIdx_4: {
       "bruises": "slickGrid_highlight_blue_0"
      }
    }
    */
  //descDataView.getIdxById()
  //console.log(rowCol);
  for(var i = 0; i < descDataView.getLength(); i++){
    descDataView.getItemByIdx(i).slickGridRank =  10;
  }
  var selected = [];
  //console.log('highlt rawdata: ', rowCol)  
  for (var s in rowCol){
    descDataView.getItemByIdx(s).slickGridRank =  0;
  }
  descDataView.fastSort('slickGridRank');
  // index changed after sorting
  var newRCobj = {};
  for(var i in rowCol){
    newRCobj[0] = rowCol[i];
  }

  //console.log('highlight:', newRCobj);
  descGrid.setCellCssStyles("highlight", newRCobj);


  //console.log('first col:', goFirstColumnFields);

  var curColumns = descGrid.getColumns();
  //console.log('curColumns:', curColumns);
  var newColumns = [];
  for (var i = 0; i < goFirstColumnFields.length; i++){
    var colName = goFirstColumnFields[i];
    var colO = curColumns.filter(function(c){ return c.field.toLowerCase() == colName;})[0];
    //console.log('filtered :', colO);
    newColumns.push(colO);

  }


  newColumns.unshift(curColumns[0]);// cls goes first
  //console.log('first columns: ',newColumns);

  for (var i = 1; i < curColumns.length; i++){
    var col = curColumns[i];
    if(goFirstColumnFields.indexOf(col.field.toLowerCase()) == -1){
      newColumns.push(col);
    }

  }
  descGrid.setColumns(newColumns);


  /*
  var items = descDataView.getItems();
  var items_ids = items.map(function (o) { return o.id; })
  console.log('ori items_ids: ',items_ids);
  var selected = [];
  for (var s in rowCol){

    selected.push(items_ids.splice(s, 1)[0]);
  }
  var newItems_ids = selected.concat(items_ids);
  console.log('selected items_ids: ',selected);
  console.log('new items_ids: ',newItems_ids);
  var newItems = [];
  for(var i = 0; i < newItems_ids.length; i++) {
    var to_get_id = newItems_ids[i],
        to_get = items.filter(function (it) { return it.id == to_get_id; })[0];
    newItems.push(to_get)
  }


  descGrid.setCellCssStyles("highlight", rowCol);
  descDataView.setItems(newItems);
  */




}

function initDescTab() {
  // prepare the data
  /*
  for (var i = 0; i < 50000; i++) {
    var d = (gridData[i] = {});

    d["id"] = "id_" + i;
    d["num"] = i;
    d["title"] = "Task " + i;
    d["duration"] = "5 days";
    d["percentComplete"] = Math.round(Math.random() * 100);
    d["start"] = "01/01/2009";
    d["finish"] = "01/05/2009";
    d["effortDriven"] = (i % 5 == 0);
  }
  */

  var gridColumns = [
  {id: "cls", name: "Class", field: "cls", width: 60, minWidth: 60, resizable: true, cssClass: "cell-title", sortable: true},
  {id: "cap-shape", name: "Cap-shape", field: "cap-shape", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "cap-surface", name: "Cap-surface", field: "cap-surface", width: 60, minWidth: 60,resizable: true, sortable: true},
  {id: "cap-color", name: "Cap-color", field: "cap-color", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "bruises", name: "Bruises", field: "bruises", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "odor", name: "Odor", field: "odor", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "gill-attachment", name: "Gill-attachment", field: "gill-attachment", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "gill-spacing", name: "Gill-spacing", field: "gill-spacing", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "gill-size", name: "Gill-size", field: "gill-size", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "gill-color", name: "Gill-color", field: "gill-color", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "stalk-shape", name: "Stalk-shape", field: "stalk-shape", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "stalk-root", name: "Stalk-root", field: "stalk-root", width: 60, resizable: true, sortable: true},
  {id: "stalk-surface-above-ring", name: "Stalk-surface-above-ring", field: "stalk-surface-above-ring", width: 60, minWidth: 60, resizable: true, sortable: true},

  {id: "stalk-surface-below-ring", name: "Stalk-surface-below-ring", field: "stalk-surface-below-ring", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "stalk-color-above-ring", name: "Stalk-color-above-ring", field: "stalk-color-above-ring", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "stalk-color-below-ring", name: "Stalk-color-below-ring", field: "stalk-color-below-ring", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "veil-type", name: "Veil-type", field: "veil-type", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "veil-color", name: "Veil-color", field: "veil-color", width: 60, minWidth: 60, resizable: true, sortable: true},

  {id: "ring-number", name: "Ring-number", field: "ring-number", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "ring-type", name: "Ring-type", field: "ring-type", width: 60, minWidth: 60, resizable: true, sortable: true},

  {id: "spore-print-color", name: "Spore-print-color", field: "spore-print-color", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "population", name: "Population", field: "population", width: 60, minWidth: 60, resizable: true, sortable: true},
  {id: "habitat", name: "Habitat", field: "habitat", width: 60, minWidth: 60, resizable: true, sortable: true}

  ];

/*
  gridColumns = [{id: "stalkSAR", name: ruleStats.attrMap["stalk-surface-above-ring"], filed: "stalkSAR", width: 20, minWidth: 20, resizable: true, sortable: true},
  {id: "habitat", name: ruleStats.attrMap["habitat"], field: "habitat", width: 20, minWidth: 20, resizable: true, sortable: true}];
*/
  var gridOptions = {
  editable: false,
  enableColumnReorder: true,
  enableAddRow: true,
  enableCellNavigation: true,
  asyncEditorLoading: true,
  forceFitColumns: false,
  topPanelHeight: 100
  };



  var gridDataView = new Slick.Data.DataView();
  descGrid = new Slick.Grid("#slickGrid", gridDataView, gridColumns, gridOptions);
  descGrid.registerPlugin( new Slick.AutoTooltips({ enableForHeaderCells: true }) );
  //descGrid.setSelectionModel(new Slick.RowSelectionModel());

  gridDataView.onRowCountChanged.subscribe(function (e, args) {
    descGrid.updateRowCount();
    descGrid.render();
  });

  gridDataView.onRowsChanged.subscribe(function (e, args) {
    descGrid.invalidateRows(args.rows);
    descGrid.render();
  });

  /*
  var pager = new Slick.Controls.Pager(gridDataView, descGrid, $("#pager"));
  var columnpicker = new Slick.Controls.ColumnPicker(gridColumns, descGrid, gridOptions);
  */

  descGrid.onSort.subscribe(function (e, args) {
    sortdir = args.sortAsc ? 1 : -1;
    sortcol = args.sortCol.field;


      // using native sort with comparer
      // preferred method but can be very slow in IE with huge datasets
      gridDataView.sort(comparer, args.sortAsc);

  });


/*

  descGrid.onCellChange.subscribe(function (e, args) {
    gridDataView.updateItem(args.item.id, args.item);
  });

  descGrid.onAddNewRow.subscribe(function (e, args) {
    var item = {};
    $.extend(item, args.item);
    gridDataView.addItem(item);
  });

  descGrid.onKeyDown.subscribe(function (e) {
    // select all rows on ctrl-a
    if (e.which != 65 || !e.ctrlKey) {
      return false;
    }

    var rows = [];
    for (var i = 0; i < gridDataView.getLength(); i++) {
      rows.push(i);
    }

    descGrid.setSelectedRows(rows);
    e.preventDefault();
  });

  descGrid.onSort.subscribe(function (e, args) {
    sortdir = args.sortAsc ? 1 : -1;
    sortcol = args.sortCol.field;


      // using native sort with comparer
      // preferred method but can be very slow in IE with huge datasets
      gridDataView.sort(comparer, args.sortAsc);

  });

  // wire up model events to drive the grid
  gridDataView.onRowCountChanged.subscribe(function (e, args) {
    descGrid.updateRowCount();
    descGrid.render();
  });

  gridDataView.onRowsChanged.subscribe(function (e, args) {
    descGrid.invalidateRows(args.rows);
    descGrid.render();
  });

  gridDataView.onPagingInfoChanged.subscribe(function (e, pagingInfo) {
    var isLastPage = pagingInfo.pageNum == pagingInfo.totalPages - 1;
    var enableAddRow = isLastPage || pagingInfo.pageSize == 0;
    var options = descGrid.getOptions();

    if (options.enableAddRow != enableAddRow) {
      descGrid.setOptions({enableAddRow: enableAddRow});
    }
  });
*/

  var h_runfilters = null;






  function updateFilter() {
    gridDataView.setFilterArgs({
      percentCompleteThreshold: percentCompleteThreshold,
      searchString: gridSearchString
    });
    gridDataView.refresh();
  }

  function descGridFilter(item, args) {
    if (item["perofzero"] < args.percentCompleteThreshold) {
      return false;
    }
    if (args.searchString != "" && item["name"].indexOf(args.searchString) == -1) {
      return false;
    }
    return true;
  }

  function comparer(a, b) {
    var x = a[sortcol], y = b[sortcol];
    return (x == y ? 0 : (x > y ? 1 : -1));
  }

  function percentCompleteSort(a, b) {
    return a["perofzero"] - b["perofzero"];
  }

  function requiredFieldValidator(value) {
    if (value == null || value == undefined || !value.length) {
      return {valid: false, msg: "This is a required field"};
    }
    else {
      return {valid: true, msg: null};
    }
  }



/*
  $("#btnSelectRows").click(function () {
    if (!Slick.GlobalEditorLock.commitCurrentEdit()) {
      return;
    }

    var rows = [];
    for (var i = 0; i < 10 && i < gridDataView.getLength(); i++) {
      rows.push(i);
    }

    grid.setSelectedRows(rows);
  });

*/
/*
  // initialize the model after all the events have been hooked up
  gridDataView.beginUpdate();
  //gridDataView.setItems(gridData);
  gridDataView.setFilterArgs({
    percentCompleteThreshold: percentCompleteThreshold,
    searchString: gridSearchString
  });
  gridDataView.setFilter(descGridFilter);
  gridDataView.endUpdate();

  // if you don't want the items that are not visible (due to being filtered out
  // or being on a different page) to stay selected, pass 'false' to the second arg
  gridDataView.syncGridSelection(descGrid, true);
*/
  //$("#gridContainer").resizable();

  return gridDataView;
}


function toggleFilterRow() {
  descGrid.setTopPanelVisibility(!descGrid.getOptions().showTopPanel);
}
