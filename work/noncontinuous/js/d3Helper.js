d3Helper = {};

d3Helper.nulltooltip = function(){
    function nulltooltip(selection){
        selection.on('mouseover.tooltip', null).on('mousemove.tooltip', null).on('mouseout.tooltip', null);
    }

    return nulltooltip;

}

d3Helper.areaTip = function(){
    var tooltipDiv;
    var bodyNode = d3.select('body').node();

    function tooltip(selection){

        selection.on('mouseover', function(pD, pI){
            // Clean up lost tooltips
            d3.select('body').selectAll('div.tooltip').remove();
            // Append tooltip
            tooltipDiv = d3.select('body')
                           .append('div')
                           .attr('class', 'tooltip')
            var absoluteMousePos = d3.mouse(bodyNode);
            //var absoluteMousePos = [d3.event.pageX, d3.event.pageY];
            tooltipDiv.style({
                left: (absoluteMousePos[0] + 10)+'px',
                top: (absoluteMousePos[1] - 40)+'px'

            });


            var first_line = "<p>Name: " + pD.properties.NAME + "</p>",
                second_line = "<p>Address: " + pD.properties.ADDRESS + "</p>",
                third_line = "<p>Theme: " + pD.properties.THEME + " </p>",
                fline = "<p>Phone: " + pD.properties.PHONE + "</p>";

            tooltipDiv.html(first_line + second_line + third_line + fline)
        })
        .on('mousemove', function(pD, pI){
            // Move tooltip
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style({
                left: (absoluteMousePos[0] + 10)+'px',
                top: (absoluteMousePos[1] - 40)+'px'
            });
        })
        .on('mouseout', function(pD, pI){
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



d3Helper.hoteltip = function(){
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



            var first_line = "<p>Name: " + pD.properties.NAME + "</p>",
                second_line = "<p>Address: " + pD.properties.ADDRESS + "</p>",
                third_line = "<p>Number of rooms: " + pD.properties.NUMROOMS + " </p>",
                fline = "<p>Phone: " + pD.properties.PHONE + "</p>";

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


d3Helper.attractiontip = function(){
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

            var first_line = "<p>Name: " + pD.properties.NAME + "</p>",
                second_line = "<p>Address: " + pD.properties.ADDRESS + "</p>",
                third_line = "<p>Theme: " + pD.properties.THEME + " </p>",
                fline = "<p>Phone: " + pD.properties.PHONE + "</p>";

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
