d3.helper = {};


d3.helper.tooltipFreq = function(){
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
                top: (absoluteMousePos[1] - 40)+'px',
                'background-color': '#636363',
                padding: '5px',
                position: 'absolute',
                'z-index': 1001,
                opacity: 0.8,
                color: '#fff',
                'box-shadow': '0 1px 2px 0 #656565'
            });

            if (pD.type == 'val'){
                var lab = mushroomlabels[pD.parent.name][pD.name];
                var first_line = "<p>" + lab + "</p>";


                tooltipDiv.html(first_line)
            }
            if(pD.type == 'other'){
                var lab = mushroomlabels[pD.parent.parent.name][pD.name];
                var first_line = "<p>" + lab + "</p>";

                tooltipDiv.html(first_line)

            }
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



