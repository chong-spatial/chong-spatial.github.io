"esri/views/layers/GraphicsLayerView": function() {
    define(["../../core/declare", "./LayerView"], function(a, h) {
        return a(h, {
            declaredClass: "esri.views.layers.GraphicsLayerView",
            constructor: function(a) {},
            getRenderer: function(a) {
                if (!a || a.symbol) return null;
                var h = this._rndForScale || this.layer.get("renderer");
                a && (h && h.getObservationRenderer) &&
                    (h = h.getObservationRenderer(a));
                return h
            },
            getSymbol: function(a) {
                if (a.symbol) return a.symbol;
                var h = this.getRenderer(a);
                return h && h.getSymbol(a)
            },
            getRenderingInfo: function(a) {
                var h = this.getRenderer(a),
                    g = this.getSymbol(a),
                    k;
                if (!g) return null;
                g = {
                    renderer: h,
                    symbol: g
                };
                if (h && (h.colorInfo && (g.color = h.getColor(a)), h.sizeInfo && (k = h.getSize(a), g.size = [k, k, k]), h.visualVariables)) {
                    a = h.getVisualVariableValues(a);
                    k = ["proportional", "proportional", "proportional"];
                    for (h = 0; h < a.length; h++) {
                        var f = a[h];
                        if ("outline" !==
                            f.variable.target) {
                            var e = f.variable.type;
                            "color" === e ? g.color = f.value : "size" === e ? (e = f.variable.axis, f = f.variable.useSymbolValue ? "symbolValue" : f.value, "width" === e ? k[0] = f : "depth" === e ? k[1] = f : "height" === e ? k[2] = f : k[0] = "width-and-depth" === e ? k[1] = f : k[1] = k[2] = f) : "opacity" === e ? g.opacity = f.value : "rotation" === e && (g.rotationAngle = f.value)
                        }
                    }
                    if (isFinite(k[0]) || isFinite(k[1]) || isFinite(k[2])) g.size = k
                }
                return g
            },
            _evalSDRenderer: function() {}
        })
    })
},
"esri/views/layers/LayerView": function() {
    define(["../../core/declare",
        "../../core/Accessoire", "../../core/Evented", "../../core/AccessoirePromise"
    ], function(a, h, m, n) {
        var g = 0;
        return a([h, m, n], {
            declaredClass: "esri.views.layers.LayerView",
            classMetadata: {
                properties: {
                    refreshTimer: {
                        readOnly: !0,
                        dependsOn: ["suspended", "layer.refreshInterval"]
                    },
                    suspended: {
                        dependsOn: ["view", "visible", "layer.loaded", "parent.suspended"],
                        readOnly: !0
                    },
                    updating: {
                        dependsOn: ["suspended"],
                        value: !1
                    },
                    visible: {
                        dependsOn: ["layer.visible"]
                    }
                }
            },
            constructor: function() {
                this.id = Date.now().toString(16) + "-layerview-" +
                    g++;
                this._layerHandles = [];
                this.watch("suspended", this._suspendedWatcher.bind(this))
            },
            initialize: function() {
                this.addResolvingPromise(this.layer)
            },
            destroy: function() {
                this.layer = this.parent = null
            },
            layer: null,
            _layerSetter: function(a) {
                var f = this._layerHandles;
                f.forEach(function(a) {
                    a.remove()
                });
                f.length = 0;
                a && f.push(a.on("refresh", this.refresh.bind(this)));
                return a
            },
            parent: null,
            _refreshTimerGetter: function(a) {
                var f = this.suspended,
                    e = this.get("layer.refreshInterval") || 0;
                a && (clearTimeout(a), a = null);
                !f && e && (a =
                    setTimeout(this.refresh.bind(this), 6E4 * e));
                return a
            },
            suspended: !0,
            _suspendedGetter: function() {
                return !this.canResume()
            },
            _updating: !1,
            _updatingGetter: function() {
                return !(!this._updating || this.suspended)
            },
            _updatingSetter: function(a) {
                this._updating = !!a
            },
            visible: !0,
            _visibleSetter: function(a) {
                this._visible = a
            },
            _visibleGetter: function() {
                return null != this._visible ? this._visible : this.get("layer.visible")
            },
            refresh: function() {},
            canResume: function() {
                return !this.get("parent.suspended") && this.get("view.ready") &&
                    this.get("layer.loaded") && this.visible || !1
            },
            _suspendedWatcher: function(a) {
                a ? this.emit("suspend") : this.emit("resume")
            }
        })
    })
},
