d3.helper = {};

d3.helper.nulltooltip = function(){
    function nulltooltip(selection){
        selection.on('mouseover.tooltip', null).on('mousemove.tooltip', null).on('mouseout.tooltip', null);
    }

    return nulltooltip;

}

d3.helper.nodetip = function(){
    var tooltipDiv;
    var bodyNode = d3.select('body').node();

    function tooltip(selection){

        selection.on('mouseover.tooltip', function(pD, pI){
            // Clean up lost tooltips
            d3.select('body').selectAll('div.tooltip').remove();
            // Append tooltip
            tooltipDiv = d3.select('body')
                           .append('div')
                           .attr('class', 'tooltip')
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style({
                left: (absoluteMousePos[0] + 10)+'px',
                top: (absoluteMousePos[1] - 40)+'px'

            });


            var first_line = "<span> <strong>Name: </strong>" + pD.properties.NAME + "</span> <br>",
                second_line = "<span> <strong>Addres</strong>s: " + pD.properties.ADDRESS + "</span> <br>",
                third_line = "<span> <strong>Theme:</strong> " + pD.properties.THEME + " </span> <br>",
                fline = "<span> <strong>Phone:</strong> " + pD.properties.PHONE + "</span> <br>";

            tooltipDiv.html(first_line + second_line + third_line + fline)
        })
        .on('mousemove.tooltip', function(pD, pI){
            // Move tooltip
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style({
                left: (absoluteMousePos[0] + 10)+'px',
                top: (absoluteMousePos[1] - 40)+'px'
            });
        })
        .on('mouseout.tooltip', function(pD, pI){
            // Remove tooltip
            tooltipDiv.remove();
        });

    }


    tooltip.attr = function(_x){
        if (!arguments.length) return attrs;
        attrs = _x;
        return this;
    };

    tooltip.style = function(_x){
        if (!arguments.length) return styles;
        styles = _x;
        return this;
    };

    return tooltip;
};



d3.helper.hoteltip = function(){
    var tooltipDiv;
    var bodyNode = d3.select('body').node();

    function tooltip(selection){

        selection.on('mouseover.tooltip', function(pD, pI){
            // Clean up lost tooltips
            d3.select('body').selectAll('div.tooltip').remove();
            // Append tooltip
            tooltipDiv = d3.select('body')
                           .append('div')
                           .attr('class', 'tooltip')
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style({
                left: (absoluteMousePos[0] + 10)+'px',
                top: (absoluteMousePos[1] - 40)+'px'

            });



            var first_line = "<span> <strong>Name: </strong>" + pD.properties.NAME + "</span> <br>",
                second_line = "<span> <strong>Addres</strong>s: " + pD.properties.ADDRESS + "</span> <br>",
                third_line = "<span> <strong>Number</strong> of rooms: " + pD.properties.NUMROOMS + " </span> <br>",
                fline = "<span> <strong>Phone:</strong> " + pD.properties.PHONE + "</span> <br>";

            tooltipDiv.html(first_line + second_line + third_line + fline)




        })
        .on('mousemove.tooltip', function(pD, pI){
            // Move tooltip
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style({
                left: (absoluteMousePos[0] + 10)+'px',
                top: (absoluteMousePos[1] - 40)+'px'
            });
        })
        .on('mouseout.tooltip', function(pD, pI){
            // Remove tooltip
            tooltipDiv.remove();
        });

    }


    tooltip.attr = function(_x){
        if (!arguments.length) return attrs;
        attrs = _x;
        return this;
    };

    tooltip.style = function(_x){
        if (!arguments.length) return styles;
        styles = _x;
        return this;
    };

    return tooltip;
};


d3.helper.attractiontip = function(){
    var tooltipDiv;
    var bodyNode = d3.select('body').node();

    function tooltip(selection){

        selection.on('mouseover.tooltip', function(pD, pI){
            // Clean up lost tooltips
            d3.select('body').selectAll('div.tooltip').remove();
            // Append tooltip
            tooltipDiv = d3.select('body')
                           .append('div')
                           .attr('class', 'tooltip')
            var absoluteMousePos = d3.mouse(bodyNode);

            tooltipDiv.style({
                left: (absoluteMousePos[0] + 10)+'px',
                top: (absoluteMousePos[1] + 60)+'px'

            });

            var myTableID= "<tr><td><strong>ID: </strong>",
                myTableNAME = "<tr><td><strong>Name: </strong>",
                myTableAddress = "<tr><td><strong>Address: </strong>",
                myTablePhone = "<tr><td><strong>Phone: </strong>";
            for(var i = 0; i<pD.points.length; i++){
                myTableID+= "<td>" + pD.points[i].properties.myAttrId +"</td>"
            }
            myTableID+="</tr>"
            for(var i = 0; i<pD.points.length; i++){
                myTableNAME+= "<td>" + pD.points[i].properties.NAME +"</td>"
            }
             myTableNAME+="</tr>"
            for(var i = 0; i<pD.points.length; i++){
                myTableAddress+= "<td>" + pD.points[i].properties.ADDRESS +"</td>"
            }
             myTableAddress+="</tr>"
            for(var i = 0; i<pD.points.length; i++){
                myTablePhone+= "<td>" + pD.points[i].properties.PHONE +"</td>"
            }
             myTablePhone+="</tr>"

            // var attractionId = "<span> <strong>ID: </strong>" + pD.properties.myAttrId + "</span> <br>";
            // var first_line = "<span> <strong>Name: </strong>" + pD.properties.NAME + "</span> <br>",
            //     second_line = "<span> <strong>Addres</strong>s: " + pD.properties.ADDRESS + "</span> <br>",
            //     third_line = "<span> <strong>Theme:</strong> " + pD.properties.THEME + " </span> <br>",
            //     fline = "<span> <strong>Phone:</strong> " + pD.properties.PHONE + "</span> <br>";

            var attractionIdInCluster=[];
            var attractionNameInClusters =[];
            for(var i = 0; i<pD.points.length; i++){
                attractionIdInCluster.push(pD.points[i].properties.myAttrId)
                attractionNameInClusters.push(pD.points[i].properties.NAME)
            }
            var firstlineContent='';
            var secondlineContent = '';
            if(attractionIdInCluster.length > 3) {
                firstlineContent=attractionIdInCluster[0] +', '+ attractionIdInCluster[1]+', '+attractionIdInCluster[2]+', ...';
                secondlineContent=attractionNameInClusters[0] +', <br>'+ attractionNameInClusters[1]+', <br>'+attractionNameInClusters[2]+', <br> ...'
                
            } else {
                firstlineContent = attractionIdInCluster.join(',');
                secondlineContent = attractionNameInClusters.join(', <br>');
            }
            var first_line = "<span> <strong>Cluster size: </strong>" + attractionIdInCluster.length + "</span> <br>";
            var secondContent = "<span> <strong>Attraction Names: </strong> <br>" + secondlineContent + "</span>";
            tooltipDiv.html(first_line+ "<span> <strong>Attraction IDs: </strong>" + firstlineContent + "</span> <br>" + secondContent);


        })
        .on('mousemove.tooltip', function(pD, pI){
            // Move tooltip
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style({
                left: (absoluteMousePos[0] + 10)+'px',
                top: (absoluteMousePos[1] - 40)+'px'
            });
        })
        .on('mouseout.tooltip', function(pD, pI){
            // Remove tooltip
            tooltipDiv.remove();
        });

    }


    tooltip.attr = function(_x){
        if (!arguments.length) return attrs;
        attrs = _x;
        return this;
    };

    tooltip.style = function(_x){
        if (!arguments.length) return styles;
        styles = _x;
        return this;
    };

    return tooltip;
};
