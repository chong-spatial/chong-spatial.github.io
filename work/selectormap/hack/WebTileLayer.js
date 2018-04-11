// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/4.0/esri/copyright.txt for details.
//>>built
define("dojo/_base/lang dojo/_base/url dojo/string ../core/urlUtils ../core/JSONSupport ../geometry/SpatialReference ../geometry/Extent ../geometry/Point ./TiledLayer ./support/TileInfo ./support/LOD".split(" "), function(g, h, k, l, m, d, n, p, q, r, a) {
    return q.createSubclass([m], {
        declaredClass: "esri.layers.WebTileLayer",
        normalizeCtorArgs: function(b, c) {
            return "string" === typeof b ? g.mixin({
                urlTemplate: b
            }, c || {}) : b
        },
        getDefaults: function(b) {
            var c = new n(-2.0037508342787E7, -2.003750834278E7, 2.003750834278E7, 2.0037508342787E7,
                d.WebMercator);
            return g.mixin(this.inherited(arguments), {
                fullExtent: c,
                tileInfo: new r({
                    rows: 256,
                    cols: 256,
                    dpi: 96,
                    format: "PNG8",
                    compressionQuality: 0,
                    origin: new p({
                        x: -2.0037508342787E7,
                        y: 2.0037508342787E7,
                        spatialReference: d.WebMercator
                    }),
                    spatialReference: d.WebMercator,
                    lods: [new a({
                            level: 0,
                            scale: 5.91657527591555E8,
                            resolution: 156543.033928
                        }), new a({
                            level: 1,
                            scale: 2.95828763795777E8,
                            resolution: 78271.5169639999
                        }), new a({
                            level: 2,
                            scale: 1.47914381897889E8,
                            resolution: 39135.7584820001
                        }), new a({
                            level: 3,
                            scale: 7.3957190948944E7,
                            resolution: 19567.8792409999
                        }), new a({
                            level: 4,
                            scale: 3.6978595474472E7,
                            resolution: 9783.93962049996
                        }), new a({
                            level: 5,
                            scale: 1.8489297737236E7,
                            resolution: 4891.96981024998
                        }), new a({
                            level: 6,
                            scale: 9244648.868618,
                            resolution: 2445.98490512499
                        }), new a({
                            level: 7,
                            scale: 4622324.434309,
                            resolution: 1222.99245256249
                        }), new a({
                            level: 8,
                            scale: 2311162.217155,
                            resolution: 611.49622628138
                        }), new a({
                            level: 9,
                            scale: 1155581.108577,
                            resolution: 305.748113140558
                        }), new a({
                            level: 10,
                            scale: 577790.554289,
                            resolution: 152.874056570411
                        }), new a({
                            level: 11,
                            scale: 288895.277144,
                            resolution: 76.4370282850732
                        }), new a({
                            level: 12,
                            scale: 144447.638572,
                            resolution: 38.2185141425366
                        }), new a({
                            level: 13,
                            scale: 72223.819286,
                            resolution: 19.1092570712683
                        }), new a({
                            level: 14,
                            scale: 36111.909643,
                            resolution: 9.55462853563415
                        }), new a({
                            level: 15,
                            scale: 18055.954822,
                            resolution: 4.77731426794937
                        }), new a({
                            level: 16,
                            scale: 9027.977411,
                            resolution: 2.38865713397468
                        }), new a({
                            level: 17,
                            scale: 4513.988705,
                            resolution: 1.19432856685505
                        }), new a({
                            level: 18,
                            scale: 2256.994353,
                            resolution: 0.597164283559817
                        }),
                        new a({
                            level: 19,
                            scale: 1128.497176,
                            resolution: 0.298582141647617
                        })
                    ]
                })
            })
        },
        properties: {
            copyright: "",
            legendEnabled: {
                json: {
                    readFrom: ["showLegend"],
                    read: function(b, c) {
                        return null != c.showLegend ? c.showLegend : !0
                    }
                }
            },
            levelValues: {
                dependsOn: ["tileInfo"],
                get: function() {
                    var b = [];
                    if (!this.tileInfo) return null;
                    this.tileInfo.lods.forEach(function(c) {
                        b[c.level] = c.levelValue || c.level
                    }, this);
                    return b
                }
            },
            popupEnabled: {
                json: {
                    readFrom: ["disablePopup"],
                    read: function(b, c) {
                        return null != c.disablePopup ? !c.disablePopup : !0
                    }
                }
            },
            spatialReference: d.WebMercator,
            subDomains: null,
            tileServers: {
                value: null,
                dependsOn: ["urlTemplate", "subDomains", "urlPath"],
                get: function() {
                    var b = new h(this.urlTemplate),
                        c = b.scheme ? b.scheme + "://" : "//",
                        a = c + b.authority + "/",
                        e = this.subDomains,
                        d, f = []; - 1 === b.authority.indexOf("{subDomain}") && f.push(a);
                    e && (0 < e.length && 1 < b.authority.split(".").length) && e.forEach(function(a, e) {
                        -1 < b.authority.indexOf("{subDomain}") && (d = c + b.authority.replace(/\{subDomain\}/gi, a) + "/");
                        f.push(d)
                    }, this);
                    return f = f.map(function(b) {
                        "/" !== b.charAt(b.length - 1) && (b +=
                            "/");
                        return b
                    })
                }
            },
            urlPath: {
                dependsOn: ["urlTemplate"],
                get: function() {
                    if (!this.urlTemplate) return null;
                    var b = this.urlTemplate,
                        a = new h(b);
                    return b.substring(((a.scheme ? a.scheme + "://" : "//") + a.authority + "/").length)
                }
            },
            urlTemplate: null
        },
        getTileUrl: function(b, a, d) {
            b = this.levelValues[b];
            var e = this.tileServers[a % this.tileServers.length] + k.substitute(this.urlPath, {
                    level: b,
                    col: d,
                    row: a
                }),
                e = e.replace(/\{level\}/gi, b).replace(/\{row\}/gi, a).replace(/\{col\}/gi, d);
            return l.addProxy(e)
        }
    })
});
