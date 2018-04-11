// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/4.0/esri/copyright.txt for details.
//>>built
define("../core/Accessor ../core/Collection ../core/promiseUtils ./Layer ../Graphic dojo/_base/lang".split(" "), function(e, f, g, h, k, l) {
    var m = e.createSubclass({
        properties: {
            layer: null,
            layerView: null,
            graphics: null
        }
    });
    return h.createSubclass({
        declaredClass: "esri.layers.GraphicsLayer",
        viewModulePaths: {
            "2d": "../views/2d/layers/GraphicsLayerView2D",
            "3d": "../views/3d/layers/FeatureLayerView3D"
        },
        getDefaults: function(a) {
            return l.mixin(this.inherited(arguments), {
                graphics: []
            })
        },
        destroy: function() {
            this.removeAll()
        },
        _gfxHdl: null,
        properties: {
            elevationInfo: null,
            graphics: {
                type: f.ofType(k),
                set: function(a) {
                    var b = this._get("graphics");
                    b || (a.forEach(function(a) {
                        a.layer = this
                    }, this), this._gfxHdl = a.on("change", function(a) {
                        var c, b, d;
                        d = a.added;
                        for (c = 0; b = d[c]; c++) b.layer = this;
                        d = a.removed;
                        for (c = 0; b = d[c]; c++) b.layer = null
                    }.bind(this)), this._set("graphics", a), b = a);
                    b.removeAll();
                    b.addMany(a)
                }
            }
        },
        add: function(a) {
            this.graphics.add(a);
            return this
        },
        addMany: function(a) {
            this.graphics.addMany(a);
            return this
        },
        removeAll: function() {
            this.graphics.removeAll();
            return this
        },
        createGraphicsController: function(a) {
            return g.resolve(new m({
                layer: this,
                layerView: a.layerView,
                graphics: this.graphics
            }))
        },
        remove: function(a) {
            this.graphics.remove(a)
        },
        removeMany: function(a) {
            this.graphics.removeMany(a)
        },
        graphicChanged: function(a) {
            this.emit("graphic-update", a)
        }
    })
});



"esri/layers/ElevationLayer": function() {
    define("dojo/_base/lang ./TiledLayer ./mixins/ArcGISMapService ./mixins/ArcGISCachedService ./mixins/PortalLayer ../request ../core/promiseUtils".split(" "), function(a, h, m, n, g, k, f) {
        return h.createSubclass([m,
            n, g
        ], {
            declaredClass: "esri.layers.ElevationLayer",
            portalLoaderModule: "portal/loaders/ElevationLayerLoader",
            viewModulePaths: {
                "3d": "../views/3d/layers/ElevationLayerView3D"
            },
            normalizeCtorArgs: function(e, d) {
                return "string" === typeof e ? a.mixin({}, {
                    url: e
                }, d) : e
            },
            load: function() {
                this.addResolvingPromise(this.loadFromPortal(this._fetchImageService.bind(this)))
            },
            _fetchImageService: function() {
                return f.resolve().then(function() {
                    return this.resourceInfo || k(this.parsedUrl.path, {
                        query: a.mixin({
                            f: "json"
                        }, this.parsedUrl.query),
                        responseType: "json",
                        callbackParamName: "callback"
                    })
                }.bind(this)).then(function(a) {
                    a.ssl && (this.url = this.url.replace(/^http:/i, "https:"));
                    this.read(a.data)
                }.bind(this))
            }
        })
    })
},


"esri/layers/FeatureLayer": function() {
    define("require dojo/_base/lang dojo/io-query ../Graphic ../PopupTemplate ../core/lang ../core/jsonDictionary ../core/MultiOriginJSONSupport ../core/sniff ../core/Collection ../core/Error ../core/HandleRegistry ../core/promiseUtils ../core/requireUtils ../core/urlUtils ../geometry/Extent ../geometry/SpatialReference ../symbols/SimpleMarkerSymbol ../symbols/SimpleLineSymbol ../symbols/SimpleFillSymbol ../symbols/support/jsonUtils ../renderers/SimpleRenderer ../renderers/UniqueValueRenderer ../renderers/support/jsonUtils ../tasks/support/Query ./Layer ./mixins/PortalLayer ./graphics/sources/MemorySource ./support/Field ./support/FeatureType ./support/LabelClass ./support/arcgisLayerURL".split(" "),
        function(a, h, m, n, g, k, f, e, d, c, b, p, q, u, t, r, s, x, v, l, w, B, y, C, E, z, L, H, K, $, R, N) {
            var Q = f({
                onTheGround: "on-the-ground",
                relativeToGround: "relative-to-ground",
                absoluteHeight: "absolute-height"
            });
            f = f({
                esriGeometryPoint: "point",
                esriGeometryMultipoint: "multipoint",
                esriGeometryPolyline: "polyline",
                esriGeometryPolygon: "polygon",
                esriGeometryMultiPatch: "multipatch"
            });
            var F = z.createSubclass([L, e], {
                declaredClass: "esri.layers.FeatureLayer",
                viewModulePaths: {
                    "2d": "../views/2d/layers/GraphicsLayerView2D",
                    "3d": "../views/3d/layers/FeatureLayerView3D"
                },
                constructor: function() {
                    this._handles = new p
                },
                normalizeCtorArgs: function(a, b) {
                    return "string" === typeof a ? h.mixin({}, {
                        url: a
                    }, b) : a
                },
                load: function() {
                    var a = this.loadFromPortal(function() {
                        if (this.url) return this.createGraphicsSource().then(this._initLayerProperties.bind(this))
                    }.bind(this), !this._hasMemorySource()).then(function() {
                        if (!this.url) return this.createGraphicsSource().then(this._initLayerProperties.bind(this))
                    }.bind(this));
                    this.addResolvingPromise(a)
                },
                _handles: null,
                _rndProps: "field field2 field3 rotationInfo.field proportionalSymbolInfo.field proportionalSymbolInfo.normalizationField colorInfo.field colorInfo.normalizationField".split(" "),
                _visVariableProps: ["field", "normalizationField"],
                controllerModulePaths: {
                    "0": "./graphics/controllers/SnapshotController",
                    1: {
                        "2d": "./graphics/controllers/OnDemandController",
                        "3d": "./graphics/controllers/OnDemandController"
                    },
                    2: "./graphics/controllers/SelectionController",
                    6: "./graphics/controllers/AutoController"
                },
                properties: {
                    advancedQueryCapabilities: null,
                    allowGeometryUpdates: {
                        json: {
                            read: function(a) {
                                return null == a ? !0 : a
                            }
                        }
                    },
                    allRenderers: {
                        readOnly: !0,
                        dependsOn: ["loaded", "renderer", "fields"],
                        get: function() {
                            return this._getAllRenderers(this.renderer)
                        }
                    },
                    capabilities: {
                        json: {
                            read: function(a) {
                                return a && a.split(",").map(function(a) {
                                    return a.trim()
                                })
                            }
                        }
                    },
                    copyright: {
                        value: null,
                        json: {
                            readFrom: ["copyrightText"],
                            read: function(a, b) {
                                return b.copyrightText
                            }
                        }
                    },
                    definitionExpression: {
                        value: null,
                        json: {
                            ignore: !0
                        }
                    },
                    defaultSymbol: {
                        json: {
                            read: w.fromJSON
                        }
                    },
                    editable: {
                        value: !1,
                        get: function() {
                            return this.userIsAdmin || this._hasMemorySource() || this._get("editable")
                        },
                        json: {
                            readFrom: ["capabilities"],
                            read: function(a, b) {
                                b.capabilities && (a = -1 !== b.capabilities.toLowerCase().indexOf("editing"));
                                return !!a
                            }
                        }
                    },
                    elevationInfo: {
                        value: null,
                        json: {
                            read: function(a) {
                                a = k.clone(a);
                                a.mode = Q.fromJSON(a.mode);
                                return a
                            }
                        }
                    },
                    fields: {
                        value: null,
                        type: [K]
                    },
                    fullExtent: {
                        value: null,
                        type: r,
                        json: {
                            readFrom: ["extent"],
                            read: function(a, b) {
                                return b.extent && r.fromJSON(b.extent)
                            }
                        }
                    },
                    generalizeForScale: 4E3,
                    geometryType: {
                        json: {
                            read: f.fromJSON
                        }
                    },
                    hasAttachments: {
                        value: !1,
                        readOnly: !0,
                        get: function() {
                            return !this._hasMemorySource() && this._get("hasAttachments")
                        }
                    },
                    hasM: !1,
                    hasZ: !1,
                    id: {
                        json: {
                            ignore: !0
                        }
                    },
                    isTable: {
                        value: !1,
                        readOnly: !0,
                        json: {
                            readFrom: ["type"],
                            read: function(a, b) {
                                return "Table" === b.type
                            }
                        }
                    },
                    labelsVisible: {
                        value: !1,
                        json: {
                            readFrom: ["showLabels"],
                            read: function(a, b) {
                                return b.showLabels
                            }
                        }
                    },
                    labelingInfo: {
                        value: null,
                        json: {
                            readFrom: ["drawingInfo.labelingInfo"],
                            read: function(a, b) {
                                a = b.drawingInfo && b.drawingInfo.labelingInfo;
                                if (!a) return null;
                                var c = /\[([^\[\]]+)\]/ig,
                                    d, e = function(a, c) {
                                        var d = this.getField(c, b.fields);
                                        return "[" + (d && d.name || c) + "]"
                                    }.bind(this);
                                return a.map(function(a) {
                                    a = R.fromJSON(a);
                                    if (d = a.labelExpression) a.labelExpression =
                                        d.replace(c, e);
                                    return a
                                })
                            }
                        }
                    },
                    layerId: {
                        json: {
                            readFrom: ["id"],
                            read: function(a, b) {
                                return b.id
                            }
                        }
                    },
                    legendEnabled: {
                        value: !0,
                        json: {
                            readFrom: ["showLegend"],
                            read: function(a, b) {
                                return null != b.showLegend ? b.showLegend : !0
                            }
                        }
                    },
                    maxPointCountForAuto: 4E3,
                    maxRecordCountForAuto: 2E3,
                    maxRecordCount: null,
                    maxVertexCountForAuto: 25E4,
                    minScale: {
                        value: 0,
                        json: {
                            readFrom: ["minScale", "effectiveMinScale"],
                            read: function(a, b) {
                                return b.effectiveMinScale || a
                            }
                        }
                    },
                    maxScale: {
                        value: 0,
                        json: {
                            readFrom: ["maxScale", "effectiveMaxScale"],
                            read: function(a,
                                b) {
                                return b.effectiveMaxScale || a
                            }
                        }
                    },
                    mode: {
                        dependsOn: ["source"],
                        get: function() {
                            var a = this._get("mode");
                            null == a && (a = (this.source.isInstanceOf(c), F.MODE_SNAPSHOT));
                            return a
                        }
                    },
                    objectIdField: {
                        json: {
                            readFrom: ["fields"],
                            read: function(a, b) {
                                a || b.fields.some(function(b) {
                                    "esriFieldTypeOID" === b.type && (a = b.name);
                                    return !!a
                                });
                                return a
                            }
                        }
                    },
                    opacity: {
                        value: 1,
                        json: {
                            readFrom: ["drawingInfo.transparency"],
                            read: function(a, b) {
                                return 1 - b.drawingInfo.transparency / 100
                            }
                        }
                    },
                    outFields: {
                        value: null,
                        dependsOn: ["requiredFields"],
                        get: function() {
                            var a =
                                this._get("outFields"),
                                b = this.requiredFields;
                            a ? -1 === a.indexOf("*") && b.forEach(function(b) {
                                -1 === a.indexOf(b) && a.push(b)
                            }) : a = b;
                            this.loaded && (a = a.filter(function(a) {
                                return "*" === a || !!this.getField(a)
                            }, this), a = a.map(function(a) {
                                return "*" === a ? a : this.getField(a).name
                            }, this));
                            return a
                        },
                        set: function(a) {
                            var b = this.requiredFields;
                            a ? -1 === a.indexOf("*") && b.forEach(function(b) {
                                -1 === a.indexOf(b) && a.push(b)
                            }) : a = b;
                            this.loaded && (a = a.filter(function(a) {
                                return "*" === a || !!this.getField(a)
                            }, this), a = a.map(function(a) {
                                return "*" ===
                                    a ? a : this.getField(a).name
                            }, this));
                            this._set("outFields", a)
                        }
                    },
                    parsedUrl: {
                        dependsOn: ["layerId"],
                        get: function() {
                            var a = this.url ? t.urlToObject(this.url) : null;
                            null != this.layerId && null != a && (a.path = t.join(a.path, this.layerId.toString()));
                            return a
                        }
                    },
                    popupEnabled: {
                        value: !0,
                        json: {
                            readFrom: ["disablePopup"],
                            read: function(a, b) {
                                return null != b.disablePopup ? !b.disablePopup : !0
                            }
                        }
                    },
                    popupTemplate: {
                        value: null,
                        type: g,
                        json: {
                            readFrom: ["popupInfo"],
                            read: function(a, b) {
                                return b.popupInfo ? g.fromJSON(b.popupInfo) : null
                            }
                        }
                    },
                    portalLoaderModule: {
                        dependsOn: ["source"],
                        get: function() {
                            return this._hasMemorySource() ? "portal/loaders/FeatureCollectionLoader" : "portal/loaders/FeatureLayerLoader"
                        }
                    },
                    relationships: null,
                    renderer: {
                        set: function(a) {
                            var b = this._getAllRenderers(a);
                            this._fixRendererFields(b);
                            this._set("renderer", a)
                        },
                        json: {
                            readFrom: ["drawingInfo.renderer", "defaultSymbol", "type"],
                            read: function(a, b) {
                                var c;
                                if (a = b.drawingInfo && b.drawingInfo.renderer) a = C.fromJSON(a);
                                else if (b.defaultSymbol) w.fromJSON(b.defaultSymbol), b.types && b.types.length ? (a = new y({
                                    defaultSymbol: c,
                                    field: b.typeIdField
                                }), b.types.forEach(function(b) {
                                    a.addUniqueValueInfo(b.id, w.fromJSON(b.symbol))
                                })) : a = new B({
                                    symbol: c
                                });
                                else if ("Table" !== b.type) {
                                    switch (b.geometryType) {
                                        case "esriGeometryPoint":
                                        case "esriGeometryMultipoint":
                                            c = new x;
                                            break;
                                        case "esriGeometryPolyline":
                                            c = new v;
                                            break;
                                        case "esriGeometryPolygon":
                                            c = new l
                                    }
                                    a = c && new B({
                                        symbol: c
                                    })
                                }
                                return a
                            }
                        }
                    },
                    requiredFields: {
                        dependsOn: ["allRenderers"],
                        get: function() {
                            var a = this.timeInfo,
                                b = [this.objectIdField, this.typeIdField, this.editFieldsInfo && this.editFieldsInfo.creatorField,
                                    a && a.startTimeField, a && a.endTimeField, this.trackIdField
                                ],
                                c = this._rndProps;
                            this.allRenderers.forEach(function(a) {
                                c.forEach(function(c) {
                                    b.push(h.getObject(c, !1, a))
                                });
                                a.visualVariables && a.visualVariables.forEach(function(a) {
                                    this._visVariableProps.forEach(function(c) {
                                        b.push(a[c])
                                    })
                                }, this)
                            }, this);
                            b = b.concat(this.dataAttributes);
                            return b.filter(function(a, b, c) {
                                return !!a && c.indexOf(a) === b && "function" !== typeof a
                            })
                        }
                    },
                    returnM: !1,
                    returnZ: !1,
                    source: {
                        cast: function(a) {
                            return a && (Array.isArray(a) || a.isInstanceOf &&
                                a.isInstanceOf(c)) ? new H({
                                layer: this,
                                items: a
                            }) : a
                        },
                        set: function(a) {
                            var b = this._get("source");
                            b !== a && (b && (b.isInstanceOf && b.isInstanceOf(H)) && this._resetMemorySource(b), a && (a.isInstanceOf && a.isInstanceOf(H)) && this._initMemorySource(a), this._set("source", a))
                        }
                    },
                    supportsCoordinatesQuantization: !1,
                    serviceDefinitionExpression: {
                        json: {
                            readFrom: ["definitionExpression"],
                            read: function(a, b) {
                                return b.definitionExpression
                            }
                        }
                    },
                    spatialReference: {
                        json: {
                            readFrom: ["extent"],
                            read: function(a, b) {
                                return (a = b.extent && b.extent.spatialReference) &&
                                    s.fromJSON(a)
                            }
                        }
                    },
                    title: {
                        get: function() {
                            if (this.url) {
                                var a = N.parse(this.url);
                                if (a && a.title) return a.title
                            }
                            return ""
                        },
                        json: {
                            readFrom: ["name"],
                            read: function(a, b) {
                                if (null != a) return a;
                                var c = [];
                                if (this.titleIncludesUrl && this.url) {
                                    var d = N.parse(this.url);
                                    d && d.title && c.push(d.title)
                                }
                                b.name && (d = N.cleanTitle(b.name), (0 === c.length || -1 === c[0].toLowerCase().indexOf(d.toLowerCase())) && c.push(d));
                                return c.join(" - ")
                            }
                        }
                    },
                    titleIncludesUrl: !0,
                    trackIdField: {
                        json: {
                            readFrom: ["timeInfo.trackIdField"],
                            read: function(a, b) {
                                return b.timeInfo.trackIdField
                            }
                        }
                    },
                    typeIdField: {
                        json: {
                            read: function(a, b) {
                                if (a) {
                                    var c = this.getField(a, b.fields);
                                    c && (a = c.name)
                                }
                                return a
                            }
                        }
                    },
                    types: {
                        json: {
                            read: function(a, b) {
                                var c = b.editFieldsInfo,
                                    d = c && c.creatorField,
                                    e = c && c.editorField;
                                return a && a.map(function(a) {
                                    a = new $(a);
                                    this._fixTemplates(a.templates, d);
                                    this._fixTemplates(a.templates, e);
                                    return a
                                }, this)
                            }
                        }
                    },
                    url: {
                        set: function(a) {
                            var b = t.urlToObject(a),
                                c = N.parse(b.path);
                            c && null != c.sublayer && (null == this.layerId && (this.layerId = c.sublayer), b = m.objectToQuery(b.query), a = c.url.path, b && (a = a + "?" +
                                b));
                            this._set("url", t.normalize(a))
                        }
                    },
                    userIsAdmin: !1,
                    version: {
                        json: {
                            readFrom: "currentVersion capabilities drawingInfo hasAttachments htmlPopupType relationships timeInfo typeIdField types".split(" "),
                            read: function(a, b) {
                                (a = b.currentVersion) || (a = b.hasOwnProperty("capabilities") || b.hasOwnProperty("drawingInfo") || b.hasOwnProperty("hasAttachments") || b.hasOwnProperty("htmlPopupType") || b.hasOwnProperty("relationships") || b.hasOwnProperty("timeInfo") || b.hasOwnProperty("typeIdField") || b.hasOwnProperty("types") ?
                                    10 : 9.3);
                                return a
                            }
                        }
                    }
                },
                createGraphicsSource: function() {
                    return this._hasMemorySource() ? (this.emit("graphics-source-create", {
                        graphicsSource: this.source
                    }), q.resolve(this.source)) : u.when(a, "./graphics/sources/FeatureLayerSource").then(function(a) {
                        return new a({
                            layer: this
                        })
                    }.bind(this)).then(function(a) {
                        this.emit("graphics-source-create", {
                            graphicsSource: a
                        });
                        return a
                    }.bind(this))
                },
                createGraphicsController: function(d) {
                    var e = this.controllerModulePaths[this.mode],
                        f = d.layerView,
                        g = c.ofType(n),
                        k = this.source,
                        l =
                        k && k.isInstanceOf && k.isInstanceOf(c),
                        m = h.mixin(d.options || {}, {
                            layer: this,
                            layerView: f,
                            graphics: l ? k : new g
                        });
                    if (l) return q.resolve(m);
                    "object" === typeof e && (e = e[f.view.type]);
                    return e ? u.when(a, e).then(function(a) {
                        return new a(m)
                    }.bind(this)).then(function(a) {
                        this.emit("graphics-controller-create", {
                            graphicsController: a
                        });
                        return a
                    }.bind(this)) : q.reject(new b("Layer mode", 'Module path not found for controller type: "' + this.mode + '"'))
                },
                createQueryParameters: function() {
                    var a = new E;
                    a.returnGeometry = !0;
                    a.returnZ =
                        this.hasZ && this.returnZ || null;
                    a.returnM = this.hasM && this.returnM || null;
                    a.outFields = this.outFields;
                    a.where = this.definitionExpression || "1\x3d1";
                    a.multipatchOption = "multipatch" === this.geometryType ? "xyFootprint" : null;
                    return a
                },
                getField: function(a, b) {
                    var c;
                    if (b = b || this.fields) a = a.toLowerCase(), b.some(function(b) {
                        b && b.name.toLowerCase() === a && (c = b);
                        return !!c
                    });
                    return c
                },
                graphicChanged: function(a) {
                    this.emit("graphic-update", a)
                },
                queryFeatures: function(a) {
                    a = a || this.createQueryParameters();
                    if (!this.source.queryFeatures) return q.reject(new b("FeatureLayer",
                        "Layer source does not support queryFeatures capability"));
                    var c = this.popupTemplate;
                    return this.source.queryFeatures(a).then(function(a) {
                        a && a.features && a.features.forEach(function(a) {
                            a.popupTemplate = c
                        });
                        return a
                    })
                },
                queryObjectIds: function(a) {
                    a = a || this.createQueryParameters();
                    return this.source.queryObjectIds ? this.source.queryObjectIds(a) : q.reject(new b("FeatureLayer", "Layer source does not support queryObjectIds capability"))
                },
                queryFeatureCount: function(a) {
                    a = a || this.createQueryParameters();
                    return this.source.queryFeatureCount ?
                        this.source.queryFeatureCount(a) : q.reject(new b("FeatureLayer", "Layer source does not support queryFeatureCount capability"))
                },
                queryExtent: function(a) {
                    a = a || this.createQueryParameters();
                    return this.source.queryExtent ? this.source.queryExtent(a) : q.reject(new b("FeatureLayer", "Layer source does not support queryExtent capability"))
                },
                _initLayerProperties: function(a) {
                    this.source || (this.source = a);
                    a.url && (this.url = a.url, this.elevationInfo && (this.elevationInfo = this.properties.elevationInfo.json.read(this.elevationInfo)));
                    a.layerDefinition && this.read(a.layerDefinition);
                    this._verifySource();
                    this._verifyFields();
                    this._fixSymbolUrls();
                    this.useQueryTimestamp = (d("ie") || d("safari")) && this.editable && 10.02 > this.version;
                    this.watch("token", function() {
                        this._fixSymbolUrls()
                    }.bind(this))
                },
                _fixSymbolUrls: function() {
                    var a = this.renderer;
                    if (!this._hasMemorySource()) {
                        var b = this.token,
                            c = [a.symbol, a.defaultSymbol];
                        (a = a.classBreakInfos || a.uniqueValueInfos) && a.forEach(function(a) {
                            c.push(a.symbol)
                        });
                        c.forEach(function(a) {
                            var c = a && a.url;
                            c && (b && -1 !== c.search(/https?\:/i) && -1 === c.indexOf("?token\x3d")) && (a.url += "?token\x3d" + b)
                        })
                    }
                },
                _getAllRenderers: function(a) {
                    var b = [];
                    a && [a, a.trackRenderer, a.observationRenderer, a.latestObservationRenderer].forEach(function(a) {
                        a && (b.push(a), a.rendererInfos && a.rendererInfos.forEach(function(a) {
                            a.renderer && b.push(a.renderer)
                        }))
                    });
                    return b
                },
                _fixRendererFields: function(a) {
                    var b = this.fields;
                    a && b && a.forEach(function(a) {
                        this._fixFieldName(this._rndProps, a);
                        a.visualVariables && a.visualVariables.forEach(function(a) {
                            this._fixFieldName(this._visVariableProps,
                                a)
                        }, this)
                    }, this)
                },
                _fixFieldName: function(a, b) {
                    a && a.forEach(function(a) {
                        var c = h.getObject(a, !1, b);
                        (c = c && "function" !== typeof c && this.getField(c)) && h.setObject(a, c.name, b)
                    }, this)
                },
                _verifyFields: function() {
                    var a = this.parsedUrl && this.parsedUrl.path || "undefined";
                    this.objectIdField || console.log("FeatureLayer: 'objectIdField' property is not defined (url: " + a + ")");
                    !this.isTable && (!this._hasMemorySource() && -1 === a.search(/\/FeatureServer\//i) && (!this.fields || !this.fields.some(function(a) {
                        return "geometry" ===
                            a.type
                    }))) && console.log("FeatureLayer: unable to find field of type 'geometry' in the layer 'fields' list. If you are using a map service layer, features will not have geometry (url: " + a + ")")
                },
                _fixTemplates: function(a, b) {
                    a && a.forEach(function(a) {
                        (a = a.prototype && a.prototype.attributes) && b && delete a[b]
                    })
                },
                _verifySource: function() {
                    if (this._hasMemorySource()) {
                        if (this.url) throw new b("feature-layer:mixed-source-and-url", "FeatureLayer cannot be created with both an in-memory source and a url");
                        var a = ["geometryType",
                            "fields", "objectIdField"
                        ];
                        if (!a.every(function(a) {
                                return this.hasOwnProperty(a)
                            }, this)) throw new b("feature-layer:missing-property", "FeatureLayer created as feature collection requires properties: " + a.join(), {
                            requiredProperties: a
                        });
                    } else if (!this.url) throw new b("feature-layer:source-or-url-required", "FeatureLayer requires either a url, a valid portal item or a source");
                },
                _initMemorySource: function(a) {
                    a.forEach(function(a) {
                        a.layer = this
                    }.bind(this));
                    this._handles.add([a.on("after-add", function(a) {
                        a.item.layer =
                            this
                    }.bind(this)), a.on("after-remove", function(a) {
                        a.item.layer = null
                    }.bind(this))], "fl-source")
                },
                _resetMemorySource: function(a) {
                    a.forEach(function(a) {
                        a.layer = null
                    }.bind(this));
                    this._handles.remove("fl-source")
                },
                _hasMemorySource: function() {
                    return !this.url && this.source
                }
            });
            h.mixin(F, {
                MODE_SNAPSHOT: 0,
                MODE_ONDEMAND: 1,
                MODE_SELECTION: 2,
                MODE_AUTO: 6
            });
            return F
        })
},
