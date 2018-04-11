// based on ArcGIS API for JavaScript 3.13
// @author Chong Zhang.
// Please contact me at chongzhang.nc@gmail.com if you have any questions
define([
        "dojo/_base/declare",
        "esri/geometry/Point",
        "dojo/_base/lang",
        "esri/layers/GraphicsLayer",
        "js/lib/d3.js"
    ],
    function(
        declare,
        Point,
        lang,
        GraphicsLayer,
        d3) {

        return GraphicsLayer.createSubclass({

            // extend esri.layers.Layer
            constructor: function(jsonurl, options) {
                var self = this;
                // data in the url must be FeatureCollection definded in GeoJSON
                this.url = jsonurl;
                this.callback = options.callback || function() {};
                this.svg_type = options.svgType || 'path';
                // id is also the HTML Dom ID
                this.id = options.id || Date.now().toString(16);

                // d3 part
                this._styles = options.style || [];
                this._attrs = options.attr || [];
                this._svg_layer_sel = "#" + this.id + "_layer";

                // clustering
                this.partitionSize = 40;
                this.unitRadius = 4;
                this.isClustering = false || options.isClustering;

            },


            // extend
            _setMap: function(map, surface) {
                var self = this;
                d3.json(self.url, function(geojson) {
                    self.geoFeatures = geojson;
                    self.bbox = d3.geo.bounds(self.geojson);
                    self.loaded = true;

                    self._render();
                    //When the layer is loaded, the value becomes "true", and layer properties can be accessed. The onLoad event is also fired.
                    self.onLoad(self);
                    self.callback(geojson);
                });

                this.mapWidth = map.width;
                this.mapHeight = map.height;

                this._redraw = map.on("zoom-end", lang.hitch(this, function() {
                    this.redraw();
                }));

                this._path_draw = d3.geo.path().projection(d3.geo.mercator().scale((map.width + 1) / 2 / Math.PI).translate([map.width / 2, map.height / 2]).precision(.1));

                return this.inherited(arguments);
            },

            // extend
            _unsetMap: function() {
                this.inherited(arguments);
                this._redraw.remove();
            },

            // extend
            attr: function(a) {

                if (a != "data-suspended" || this.suspended) {
                    this.getSVGFeatureSelections().attr(a.key, a.value);
                }

                return this.inherited(arguments);

            },

            _render: function() {

                var self = this;
                var g = this.getSVGFeatureGroupSelections();


                if (this.isClustering) {
                    var quadtree = (d3.geom.quadtree()
                        .x(function(d) {
                            return d.x;
                        })
                        .y(function(d) {
                            return d.y;
                        })
                    )(this._initClusteringArray(this.geoFeatures.features));

                    this.quadtree = quadtree;

                    var features = this.clustering();
                    var featureg = g.data(features, function(f) {
                            if (!f) return 'null';
                            return Math.floor(f.x) + '_' + Math.floor(f.y) + '_' + f.r + '_' + f.index
                        })
                        .enter().append('g')


                    var features = featureg.append(this.svg_type).attr('r', function(d) {
                        return d.r
                    });

                    // path is not supported for clustering
                    if (this.svg_type !== 'path') {

                        featureg.attr('transform', function(d) {
                            return 'translate(' + d.x + ',' + d.y + ')'
                        })
                    }

                    // set other passed attributes
                    this._attrs.forEach(function(a) {
                        features.attr(a.name, a.value);
                    })

                    // add layer's id to class
                    features.attr('class', function(d, el) {
                        // in case the _attrs contain class setting
                        return d3.select(this).attr('class') + " " + self.id;
                    });
                    // set passed styles
                    this._styles.forEach(function(s) {
                        features.style(s.name, s.value);
                    })
                } else {


                    var featureg = g.data(this.geoFeatures.features)
                        .enter().append('g')
                        .attr('class', self.id)

                    var features = featureg.append(this.svg_type);


                    if (this.svg_type == 'path') {
                        features.attr('d', this._path_draw);
                    } else {
                        featureg.attr('transform', function(d) {
                            return 'translate(' + self._project_to_screen(d.geometry.coordinates)[0] + ',' + self._project_to_screen(d.geometry.coordinates)[1] + ')'
                        })
                    }

                    // set other passed attributes
                    this._attrs.forEach(function(a) {
                        features.attr(a.name, a.value);
                    })
                    // add layer's id to class
                    features.attr('class', function(d, el) {
                        // in case the _attrs contain class setting
                        return d3.select(this).attr('class') + " " + self.id;
                    });
                    // set passed styles
                    this._styles.forEach(function(s) {
                        features.style(s.name, s.value);
                    })

                }

            },


            redraw: function() {
                var self = this;
                if (this.isClustering) {
                    if (this.svg_type != 'path') {
                        var g = this.getSVGFeatureGroupSelections();

                        var quadtree = (d3.geom.quadtree()
                            .x(function(d) {
                                return d.x;
                            })
                            .y(function(d) {
                                return d.y;
                            })
                        )(this._initClusteringArray(this.geoFeatures.features));

                        this.quadtree = quadtree;

                        var features = this.clustering();
                        var featureg = g.data(features, function(f) {
                            if (!f) return 'null';
                            return Math.floor(f.x) + '_' + Math.floor(f.y) + '_' + f.r + '_' + f.index
                        })

                        featureg.selectAll('g').attr('transform', function(d) {
                            return 'translate(' + d.x + ',' + d.y + ')'
                        })
                        featureg.selectAll('g ' + self.svg_type).attr('r', function(d) {
                            return d.r
                        });

                        var newFeatures = featureg.enter().append('g').attr('transform', function(d) {
                                return 'translate(' + d.x + ',' + d.y + ')'
                            })
                            .append(this.svg_type).attr('r', function(d) {
                                return d.r
                            });
                        // set other passed attributes
                        this._attrs.forEach(function(a) {
                            newFeatures.attr(a.name, a.value);
                        })

                        // set passed styles
                        this._styles.forEach(function(s) {
                            newFeatures.style(s.name, s.value);
                        })

                        newFeatures.call(d3.helper.attractiontip());

                        featureg.exit().remove()

                    }
                } else {
                    if (this.svg_type != 'path') {
                        this.getSVGFeatureGroupSelections()
                            .attr('transform', function(d) {
                                return 'translate(' + self._project_to_screen(d.geometry.coordinates)[0] + ',' + self._project_to_screen(d.geometry.coordinates)[1] + ')'
                            })
                    } else {
                        this.getSVGFeatureSelections().attr('d', self._path_draw)
                    }
                }
            },

            getSVGLayerSelector: function() {
                return this._svg_layer_sel;
            },

            getSVGFeatureSelections: function() {
                return d3.select(this._svg_layer_sel).selectAll(this.svg_type);
            },

            getSVGFeatureGroupSelections: function() {
                return d3.select(this._svg_layer_sel).selectAll('g');
            },

            _project_to_screen: function(o) {
                var p = new Point(o[0], o[1]);
                var point = this._map.toScreen(p)
                return [point.x, point.y];
            },

            // events handle
            // getSVGFeatureSelections.on(eventType, eventHandlor)
            // follow d3, eventType is like: 'click', 'mouseover', 'mouseout', ...
            // eventHandlor is like: function(d) {}


            _initClusteringArray: function(points) {
                var self = this;
                var clusters = points.map(function(d, i) {
                    var scrPoint = self._project_to_screen(d.geometry.coordinates);
                    return {
                        x: scrPoint[0],
                        y: scrPoint[1],
                        r: self.unitRadius,
                        points: [d]
                    };
                });

                // Consolidate coincident vertices. The voronoi tesselation will not
                // work if there are duplicate vertices.
                return d3.nest()
                    .key(function(d) {
                        return [d.x.toFixed(3), d.y.toFixed(3)].join(',');
                    })
                    .rollup(function(leaves) {
                        return leaves.reduce(self._mergePoints.bind(self));
                    })
                    .entries(clusters)
                    .map(function(d, i) {
                        return d.values;
                    });
            },
            // Merge the coordinates of two points, weighted by their radii.
            _mergePoints: function(a, b) {
                var weight = b.r / (a.r + b.r);
                return {
                    x: a.x + weight * (b.x - a.x),
                    y: a.y + weight * (b.y - a.y),
                    r: this.unitRadius * Math.sqrt(a.points.length + b.points.length),
                    points: a.points.concat(b.points)
                };
            },
            clustering: function() {
                var self = this;
                var clusters = [];
                d3.pairs(d3.range(0, self.mapWidth + 1, self.partitionSize)).forEach(function(x) {
                    d3.pairs(d3.range(0, self.mapHeight + 1, self.partitionSize)).forEach(function(y) {
                        var x0 = x[0],
                            x3 = x[1];
                        var y0 = y[0],
                            y3 = y[1];
                        var points = [];
                        self.quadtree.visit(function(node, x1, y1, x2, y2) {
                            var p = node.point;
                            if (p && p.x >= x0 && p.x < x3 && p.y >= y0 && p.y < y3) {
                                points.push(p);
                            }
                            return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
                        });
                        if (points.length) {
                            clusters.push(points.reduce(self._mergePoints.bind(self)));
                        }
                    });
                });

                var maxRadius = d3.max(clusters, function(d) {
                        return d.r;
                    }),
                    hasClusters = true;
                clusters.map(function(d, i) {
                    d.index = i;
                    return d;
                })

                while (hasClusters) {
                    hasClusters = false;
                    var links = d3.geom.voronoi()
                        .x(function(d) {
                            return d.x;
                        })
                        .y(function(d) {
                            return d.y;
                        })
                        .links(clusters.filter(function(v) {
                            return !!v;
                        }))
                        .map(function(link) {
                            var dx = link.source.x - link.target.x,
                                dy = link.source.y - link.target.y;
                            link.distance = Math.sqrt(dx * dx + dy * dy);
                            return link;
                        }).sort(function(a, b) {
                            return a.distance - b.distance;
                        });

                    links.every(function(link) {

                        if (link.distance > maxRadius * 2) {
                            return false;
                        }
                        if (link.distance < link.source.r + link.target.r) {
                            var cluster = self._mergePoints(link.source, link.target);
                            cluster.index = link.source.index;
                            clusters[link.target.index] = null;
                            clusters[link.source.index] = cluster;
                            maxRadius = Math.max(maxRadius, cluster.r);
                            hasClusters = true;
                            return false;
                        }
                        return true;
                    });
                }
                return clusters.filter(function(v) {
                    return !!v;
                });

            }

        });

    });