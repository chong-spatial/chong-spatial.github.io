d3.helper = {};

d3.helper.nulltooltip = function(){
    function nulltooltip(selection){
        selection.on('mouseover.tooltip', null).on('mousemove.tooltip', null).on('mouseout.tooltip', null);
    }

    return nulltooltip;

}

d3.helper.ruleTooltip = function(colOrder){
    var tooltipDiv;
    var bodyNode = d3.select('body').node();

    function tooltip(selection){

        selection.on('mouseover.tooltip', function(d){
            // Clean up lost tooltips
            d3.select('body').selectAll('div.ruleTooltip').remove();
            // Append tooltip
            tooltipDiv = d3.select('body')
                           .append('div')
                           .attr('class', 'ruleTooltip')
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style({
                left: (absoluteMousePos[0] + 10)+'px',
                top: (absoluteMousePos[1] - 40)+'px',
                //'background-color': '#636363',
                'background-color': 'rgba(242, 242, 242, .9)',
                padding: '5px',
                position: 'absolute',
                'z-index': 1001,
                opacity: 0.8,
                //color: '#fff',
                'box-shadow': '0 1px 2px 0 #656565'
            });

            var ro = d.filter(function(r){ return r.z != 0})[0].rule;
            var ruleItems = {};
            ro.it.forEach(function(a){ ruleItems[a.aname] = a.aval; });

            var ruleItemTip = [];
            colOrder.forEach(function(c){
                if(c in ruleItems){
                    ruleItemTip.push(c+'='+ruleItems[c]);
                }
            })
            
            var itemNames = "<div>" + ruleItemTip.join(', ') + "</div>";
            var first_line = "<span>Support = " + (ro.m[0] * 100).toFixed(2) + "%, </span>";
            var second_line = "<span>Confidence = " + (ro.m[1]  * 100).toFixed(2) + "%, </span>";
            var third_line = "<span>Lift = " + +ro.m[2].toFixed(2) + " </span>";

            tooltipDiv.html(itemNames + first_line + second_line + third_line);


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






