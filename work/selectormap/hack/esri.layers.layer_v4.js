"esri/layers/Layer": function() {
    define("require dojo/Deferred ../core/Accessor ../core/Error ../core/Evented ../core/Identifiable ../core/Loadable ../core/urlUtils ../core/requireUtils ../core/promiseUtils ../kernel ../request ../geometry/SpatialReference ../geometry/Extent".split(" "), function(a, h, m, n, g, k, f, e, d, c, b, p, q, u) {
        var t = 0;
        m = m.createSubclass([g, k, f], {
            declaredClass: "esri.layers.Layer",
            properties: {
                attributionDataUrl: null,
                credential: {
                    value: null,
                    readOnly: !0,
                    dependsOn: ["loaded",
                        "parsedUrl"
                    ],
                    get: function() {
                        var a = this.loaded && this.parsedUrl && b.id && b.id.findCredential(this.parsedUrl.path) || null;
                        a && a.ssl && (this.url = this.url.replace(/^http:/i, "https:"));
                        return a
                    }
                },
                fullExtent: new u(-180, -90, 180, 90, q.WGS84),
                hasAttributionData: {
                    readOnly: !0,
                    dependsOn: ["attributionDataUrl"],
                    get: function() {
                        return null != this.attributionDataUrl
                    }
                },
                id: {
                    get: function() {
                        return Date.now().toString(16) + "-layer-" + t++
                    }
                },
                legendEnabled: !0,
                listMode: "show",
                minScale: {
                    value: 0,
                    type: Number,
                    cast: function(a) {
                        return a ||
                            0
                    }
                },
                maxScale: {
                    value: 0,
                    type: Number,
                    cast: function(a) {
                        return a || 0
                    }
                },
                opacity: {
                    value: 1,
                    type: Number,
                    cast: function(a) {
                        return 0 > a ? 0 : 1 < a ? 1 : a
                    }
                },
                parsedUrl: {
                    readOnly: !0,
                    dependsOn: ["url"],
                    get: function() {
                        var a = this._get("url");
                        return a ? e.urlToObject(a) : null
                    }
                },
                popupEnabled: !0,
                refreshInterval: 0,
                attributionVisible: !0,
                spatialReference: q.WGS84,
                title: null,
                token: {
                    dependsOn: ["credential.token"],
                    get: function() {
                        var a = this.get("parsedUrl.query.token"),
                            b = this.get("credential.token");
                        return a || b || null
                    },
                    set: function(a) {
                        a ? this._override("token",
                            a) : this._clearOverride("token")
                    }
                },
                url: {
                    value: null,
                    cast: function(a) {
                        return e.normalize(a)
                    }
                },
                visible: !0
            },
            createLayerView: function(b) {
                var e = this.viewModulePaths[b.type];
                return e ? d.when(a, e).then(function(a) {
                    return new a({
                        layer: this,
                        view: b
                    })
                }.bind(this)) : c.reject(new n("layerview:module-unavailable", "No LayerView module available for layer '${layer.declaredClass}' and view type: '${view.type}'", {
                    view: b,
                    layer: this
                }))
            },
            destroyLayerView: function(a) {
                a.destroy()
            },
            fetchAttributionData: function() {
                var a = this.attributionDataUrl;
                this.hasAttributionData && a ? a = p(a, {
                    query: {
                        f: "json"
                    },
                    responseType: "json"
                }).then(function(a) {
                    return a.data
                }) : (a = new h, a.reject(new n("Layer does not have attribution data")), a = a.promise);
                return a
            },
            refresh: function() {
                this.emit("refresh")
            }
        });
        m.fromArcGISServerUrl = function(b) {
            "string" === typeof b && (b = {
                url: b
            });
            return d.when(a, "./support/arcgisLayers").then(function(a) {
                return a.fromURL(b)
            })
        };
        m.fromPortalItem = function(b) {
            if (b && !b.portalItem && "object" === typeof b && (!b.declaredClass || "esri.portal.PortalItem" ===
                    b.declaredClass)) b = {
                portalItem: b
            };
            return d.when(a, "../portal/loaders/support/layerUtils").then(function(a) {
                return a.layerFromPortalItem(b)
            })
        };
        return m
    })
},












"esri/layers/TiledLayer": function() {
    define(["./Layer", "./support/TileInfo"], function(a, h) {
        return a.createSubclass({
            properties: {
                attributionDataUrl: null,
                tileInfo: h
            },
            viewModulePaths: {
                "2d": "../views/2d/layers/TiledLayerView2D",
                "3d": "../views/3d/layers/TiledLayerView3D"
            },
            getTileUrl: function(a, h, g) {}
        })
    })
},
