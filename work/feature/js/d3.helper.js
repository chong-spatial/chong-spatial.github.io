d3.helper = {};

d3.helper.nulltooltip = function(){
    function nulltooltip(selection){
        selection.on('mouseover.tooltip', null).on('mousemove.tooltip', null).on('mouseout.tooltip', null);
    }

    return nulltooltip;

}

d3.helper.tooltip = function(){
    var tooltipDiv;
    var bodyNode = d3.select('body').node();

    function tooltip(selection){

        selection.on('mouseover.tooltip', function(d){
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

            var ro = d.filter(function(r){ return r.z != 0})[0].rule;
            
            var first_line = "<p>Support = " + (ro.m[0] * 100).toFixed(2) + "%,</p>";
            var second_line = "<p>Confidence = " + (ro.m[1]  * 100).toFixed(2) + "%,</p>";
            var third_line = "<p>Lift = " + +ro.m[2].toFixed(2) + " </p>";

            tooltipDiv.html(first_line + second_line + third_line);


        })
        .on('mousemove.tooltip', function(d){
            // Move tooltip
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style({
                left: (absoluteMousePos[0] + 10)+'px',
                top: (absoluteMousePos[1] - 40)+'px'
            });
        })
        .on('mouseout.tooltip', function(d){
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




