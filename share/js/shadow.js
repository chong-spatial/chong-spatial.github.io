if(!filters) var filters = {};

filters.drop = function drop(svg, color, opacity){
	// filters go in defs element
	var id = "filter-drop-shadow",
			defs = svg.selectAll("defs").data([id]);
	defs.enter().append("defs");

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// https://gist.github.com/cpbotha/5200394
	// filter chain comes from:
	// https://github.com/wbzyl/d3-notes/blob/master/hello-drop-shadow.html
	// cpbotha added explanatory comments
	// read more about SVG filter effects here: http://www.w3.org/TR/SVG/filters.html	// create filter with id #drop-shadow
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// height=130% so that the shadow is not clipped
	var filter = defs.append("filter")
		.attr("id", function(d){return d})
		.attr({x: "-100%", y: "-100%", "height": "330%", "width": "330%"});

	// SourceAlpha refers to opacity of graphic that this filter will be applied to
	// convolve that with a Gaussian with standard deviation 3 and store result
	// in blur
	filter.append("feGaussianBlur")
		.attr("in", "SourceAlpha")
		.attr("stdDeviation",1)
		.attr("result", "blur");

	// translate output of Gaussian blur to the right and downwards with 2px
	// store result in offsetBlur
	filter.append("feOffset")
		.attr("in", "blur")
		.attr("dx", 2)
		.attr("dy", 2)
		.attr("result", "offsetBlur");

	filter.append("feFlood")
		.attr({"flood-color": color || "steelblue", "flood-opacity": opacity || "1"})
		.attr("result", "offsetColor");
	filter.append("feComposite")
		.attr({"in": "offsetColor", "in2": "offsetBlur", "operator": "in"})
		.attr("result", "offsetBlur");

	// overlay original SourceGraphic over translated blurred opacity by using
	// feMerge filter. Order of specifying inputs is important!
	var feMerge = filter.append("feMerge");

	feMerge.append("feMergeNode")
		.attr("in", "offsetBlur")
	feMerge.append("feMergeNode")
		.attr("in", "SourceGraphic");

	return "url(#" + id + ")"
}

filters.inset = function drop(svg, color, opacity){
	// filters go in defs element
	var id = "filter-inset-shadow",
			defs = svg.selectAll("defs").data([id]);
	defs.enter().append("defs");

	// create filter with id #drop-shadow
	// height=130% so that the shadow is not clipped
	var filter = defs.append("filter")
		.attr("id", id)
		.attr({x: "-50%", y: "-50%", "height": "200%", "width": "200%"});

	// invert the source image
	filter.append("feComponentTransfer")
		.attr("in", "SourceAlpha")
		.append("feFuncA")
		.attr({"type": "table", "tableValues": "1 0"})

	// SourceAlpha refers to opacity of graphic that this filter will be applied to
	// convolve that with a Gaussian
	filter.append("feGaussianBlur")
		.attr({"stdDeviation":3});

	// translate output of Gaussian blur to the right and downwards with 2px
	// store result in offsetBlur
	filter.append("feOffset")
		.attr("dx",5)
		.attr("dy",5)
		.attr("result", "offsetBlur");

	// flood the entire filter box
	filter.append("feFlood")
		.attr({"flood-color": color || "black", "flood-opacity": opacity || ".2"})
		.attr("result", "offsetColor");
	// mask the flood with the offset, inverted blur
	filter.append("feComposite")
		.attr({"in2": "offsetBlur", "operator": "in"});
	// then mask that with the source image
	filter.append("feComposite")
		.attr({"in2": "SourceAlpha", "operator": "in", result: "shadow"});

	// overlay original SourceGraphic over translated blurred opacity by using
	// feMerge filter. Order of specifying inputs is important!
	var feMerge = filter.append("feMerge");

	// merge with the shadow on top
	feMerge.append("feMergeNode")
		.attr("in", "SourceGraphic");
	feMerge.append("feMergeNode")
		.attr("in", "shadow")
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	return "url(#" + id + ")"
}
/**filter.sphere, filter.bubble
 * Copyright (c) 2015, cool.blue@y7mail.com.
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the cool.blue@y7mail.com nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

filters.sphere = function (svg, baseColor, opacity, highlightColor) {
	baseColor = baseColor || "black";
	opacity = opacity || 1;
	highlightColor = highlightColor || "white";
	var id = "filter-spherical-shading" + ["", baseColor, highlightColor].join("-"),
			defs = svg.selectAll("defs").data([id]),
			c = tinycolor(baseColor).toHsv(),
			stop1 = tinycolor({h: c.h, s: c.s, v: c.v}),
			stop2 = tinycolor({h: (c.h == 0) ? 0 : (c.h + 60)%360, s: c.s, v: c.v*0.65});

	defs.enter().append("defs");
	var sphere = defs.append("radialGradient")
		.attr({"id": id, "cx": "50%", "cy": "50%", "r": "80%", "fx": "25%", "fy": "25%",});
	sphere.append("stop")
		.attr({"offset": "0", "stop-color": highlightColor || "white"})
	sphere.append("stop")
		.attr({"offset": "0.5", "stop-color": stop1.toHexString(), opacity: opacity})
	sphere.append("stop")
		.attr({"offset": "1", "stop-color": stop2.toHexString(), opacity: 0.75*opacity})
	//sphere.append("stop")
	//		.attr({"offset": "0%", "stop-color": highlightColor || "white"})
	//sphere.append("stop")
	//		.attr({"offset": "75%", "stop-color": baseColor || "black"})
	return ["url(#", id, ")"].join("");
}
filters.bubble = function (svg, baseColor, opacity, highlightColor) {
	baseColor = baseColor || "black";
	opacity = opacity || 0.3;
	highlightColor = highlightColor || "white";
	var id = "filter-bubble-" + baseColor + "-" + highlightColor,
			defs = svg.selectAll("defs").data([id]),
			c = tinycolor(baseColor).toHsv(),
			stop1 = tinycolor({h: c.h, s: 100, v: 1}),
			stop2 = tinycolor({h: (c.h == 0) ? 0 : (c.h + 60)%360, s: 100, v: 0.65});

	defs.enter().append("defs");
	var sphere = defs.selectAll(".bubble").data([baseColor], function(d){return d}).enter()
		.append("radialGradient")
		.attr({"id": id, "cx": "50%", "cy": "50%", "r": "80%", "fx": "25%", "fy": "25%",});
	sphere.append("stop")
		.attr({"offset": "0", "stop-color": highlightColor || "white"})
	sphere.append("stop")
		.attr({"offset": "0.5", "stop-color": stop1.toHexString(), opacity: 0.65*opacity})
	sphere.append("stop")
		.attr({"offset": "1", "stop-color": stop2.toHexString(), opacity: 0.75*opacity})
	return "url(#" + id + ")"
}
filters.cSphere = function(ctx, x, y, radius, baseColor, highlightColor) {
    // Coloured radial gradient in circle shape

    baseColor = baseColor || "black";
    highlightColor = highlightColor || "white";

    var c = tinycolor(baseColor).toHsv(),
        stop1 = tinycolor({h: c.h, s: 255, v: c.v * 0.6}),
        stop2 = tinycolor({
            h: c.h,
            s: c.s,
            v: c.v * 0.01 //0.65
        });

    var startAngle = 0;
    var endAngle = Math.PI * 2;
    var antiClockwise = false;

    var radialGradient = ctx.createRadialGradient(
        -0.5 * radius + x, -0.5 * radius + y,
        .0 * radius,
        x, y, 1.5 * radius
    );
    radialGradient.addColorStop(0, highlightColor);
    radialGradient.addColorStop(0.6, stop1.toHexString());
    radialGradient.addColorStop(0.9, stop2.toHexString());
    radialGradient.addColorStop(1, stop2.toHexString());

    ctx.fillStyle = radialGradient;

    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.closePath();

    ctx.fill();
}
filters.makeSpriteSheet =  function makeSpriteSheet(radius, colors){
    var padding = 2, cell = 2 * radius + padding,
        canvas = document.createElement("canvas"),
        context = canvas.getContext('2d');
    canvas.width = cell * colors.length;
    canvas.height = cell;

    var sheet = new PIXI.BaseTexture.fromCanvas(
            colors.reduce(
                function(ctx, c, i) {
                    return (filters.cSphere(ctx, cell * i + cell / 2, cell
                        / 2, radius, c), ctx);
                },
                context).canvas
        );


    return function(index) {
        return new PIXI.Texture(sheet,
            new PIXI.Rectangle(index * cell, 0, cell, canvas.height)
        )
    };
}
filters.FlatShade = function (svg, dirn, _baseColor) {
    var baseColor = _baseColor || "black",
        opacity = 1,
        highlightColor = "white",
        id = "filter-flat-shading" + ["", baseColor, highlightColor].join("-").replace("#",""),
        defs = svg.selectAll("defs").data([id]),
        c = tinycolor(baseColor).toHsv(),
        stop0 = tinycolor({h: c.h, s: c.s*0.4, v: 90}),
        stop1 = tinycolor({h: c.h, s: c.s, v: c.v}),
        stop2 = tinycolor({h: c.h, s: 100, v: c.v*0.4}),
        orientation =  dirn.reduce(function(o, p, i){return (o[["x1","y1","x2","y2"][i]] = dirn[i], o)}, {});

    defs.enter().append("defs");
    var gradient = defs.selectAll("#"+id).data([[
            {"offset": "0", "stop-color": stop0.toHexString()},
            {"offset": "0.5", "stop-color": stop1.toHexString(), opacity: opacity},
            {"offset": "1", "stop-color": stop2.toHexString(), opacity: 0.75*opacity}
        ]]);
    gradient.enter().append("linearGradient").attr({"id": id});
    var stops = gradient.selectAll("stop").data(function(d){return d});
    stops.enter().append("stop");
    stops.each(function(d){d3.select(this).attr(d)});
    gradient
        .attr(orientation);
    return ["url(#", id, ")"].join("");

    function merge(source, target) {
        for(var p in source) if(target && !target.hasOwnProperty(p)) target[p] = source[p];
        return target;
    }

}
filters.Marker = function(svg, color){
    var id = "filter-marker", defs = svg.selectAll("defs").data([id]),
        idS = id + "-start", idE = id + "-end";

    defs.enter().append("defs");
    var markers = defs.selectAll("#"+id).data([
        {
            attr: {id: idS, viewBox: "0 0 7 7",
                markerWidth: "7", markerHeight: "7",
                refX: "4", refY: "4",orient: "auto"},
            symbol: {
                type: "rect",
                attr: {x: "1", y: "1", width: "5", height: "5", style: "stroke: none; fill: " + color + ";"}
            }
        },
        {
            attr: {id: idE, viewBox: "0 0 13 13",
                markerWidth: "13", markerHeight: "13",
                refX: "2", refY: "7", orient: "auto"},
            symbol: {
                type: "path",
                attr:{d: "M2,2 L2,13 L8,7 L2,2", style: "stroke: none; fill: " + color + ";"}
            }
        }
        ]);
    markers.enter().append("marker")
        .each(function(d){
            return d3.select(this).attr(d.attr)
        });
    var marker = markers.selectAll(".symbol").data(function(d){return [d.symbol]});
    marker.enter().append(function(d) {
        return document.createElementNS("http://www.w3.org/2000/svg", d.type)
    })
        .each(function(d){
            return d3.select(this).attr(d.attr)
        });

    return {
        start: ["url(#", idS, ")"].join(""),
        end: ["url(#", idE, ")"].join("")
    }
};
