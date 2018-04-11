// version 3.x

"esri/layers/layer": function() {
    define("dojo/_base/declare dojo/_base/config dojo/_base/connect dojo/_base/lang dojo/_base/Deferred dojo/_base/json dojo/has ../Evented ../kernel ../lang ../request ../deferredUtils ../urlUtils ../SpatialReference ../geometry/Extent".split(" "), function(p, m, a, f, l, k, q, g, d, b, c, e, h, r, t) {
        var n = p([g], {
            declaredClass: "esri.layers.Layer",
            _eventMap: {
                error: ["error"],
                load: ["layer"],
                "opacity-change": ["opacity"],
                "update-end": ["error"],
                "visibility-change": ["visible"]
            },
            constructor: function(c, d) {
                if (c && f.isString(c)) this._url = h.urlToObject(this.url = c);
                else if (this.url = this._url = null, (d = d || c) && (d.layerDefinition || d.query)) d = null;
                this.spatialReference = new r(4326);
                this.initialExtent = new t(-180, -90, 180, 90, new r(4326));
                this._map = this._div = null;
                this.normalization = !0;
                d && (d.id && (this.id = d.id), !1 === d.visible && (this.visible = !1), b.isDefined(d.opacity) && (this.opacity = d.opacity), b.isDefined(d.minScale) &&
                    this.setMinScale(d.minScale), b.isDefined(d.maxScale) && this.setMaxScale(d.maxScale), this.attributionDataUrl = d.attributionDataUrl || "", this.hasAttributionData = !!this.attributionDataUrl, b.isDefined(d.showAttribution) && (this.showAttribution = d.showAttribution), this.className = d.className, this.refreshInterval = d.refreshInterval || 0);
                this._errorHandler = f.hitch(this, this._errorHandler);
                this.refresh = f.hitch(this, this.refresh);
                if (this.managedSuspension) {
                    var e = this._setMap;
                    this._setMap = function(b) {
                        var c = e.apply(this,
                            arguments);
                        this.evaluateSuspension();
                        if (this.suspended && !b.loaded) var d = a.connect(b, "onLoad", this, function() {
                            a.disconnect(d);
                            d = null;
                            this.evaluateSuspension()
                        });
                        return c
                    }
                }
                this.registerConnectEvents()
            },
            _errorHandler: function(a) {
                this.loaded || (this.loadError = a);
                this.onError(a)
            },
            _setMap: function(b, c, d, e) {
                this._map =
                    b;
                this._lyrZEHandle = a.connect(b, "onZoomEnd", this, this._processMapScale);
                if (b.loaded) this.visibleAtMapScale = this._isMapAtVisibleScale();
                else var f = a.connect(b, "onLoad", this, function() {
                    a.disconnect(f);
                    f = null;
                    this._processMapScale()
                })
            },
            _unsetMap: function(b, c) {
                a.disconnect(this._lyrZEHandle);
                this._toggleRT();
                this._map = this._lyrZEHandle = null;
                this.suspended = !0
            },
            _cleanUp: function() {
                this._map = this._div = null
            },
            id: null,
            visible: !0,
            opacity: 1,
            loaded: !1,
            loadError: null,
            minScale: 0,
            maxScale: 0,
            visibleAtMapScale: !1,
            suspended: !0,
            attributionDataUrl: "",
            hasAttributionData: !1,
            showAttribution: !0,
            refreshInterval: 0,
            _errorHandler: function(a) {
                this.loaded || (this.loadError = a);
                this.onError(a)
            },
            _setMap: function(b, c, d, e) {
                this._map =
                    b;
                this._lyrZEHandle = a.connect(b, "onZoomEnd", this, this._processMapScale);
                if (b.loaded) this.visibleAtMapScale = this._isMapAtVisibleScale();
                else var f = a.connect(b, "onLoad", this, function() {
                    a.disconnect(f);
                    f = null;
                    this._processMapScale()
                })
            },
            _unsetMap: function(b, c) {
                a.disconnect(this._lyrZEHandle);
                this._toggleRT();
                this._map = this._lyrZEHandle = null;
                this.suspended = !0
            },
            _cleanUp: function() {
                this._map = this._div = null
            },
            _fireUpdateStart: function() {
                this.updating || (this.updating = !0, this.attr("data-updating", ""), this._toggleRT(),
                    this.onUpdateStart(), this._map && this._map._incr())
            },
            _fireUpdateEnd: function(a, b) {
                this.updating && (this.updating = !1, this.attr("data-updating"), this._toggleRT(!0), this.onUpdateEnd(a, b), this._map && this._map._decr())
            },
            _getToken: function() {
                var a = this._url,
                    b = this.credential;
                return a && a.query && a.query.token || b && b.token || void 0
            },
            _findCredential: function() {
                this.credential = d.id && this._url && d.id.findCredential(this._url.path)
            },
            _useSSL: function() {
                var a = this._url,
                    b = /^http:/i;
                this.url && (this.url = this.url.replace(b,
                    "https:"));
                a && a.path && (a.path = a.path.replace(b, "https:"))
            },
            refresh: function() {},
            show: function() {
                this.setVisibility(!0)
            },
            hide: function() {
                this.setVisibility(!1)
            },
            setMinScale: function(a) {
                this.setScaleRange(a)
            },
            setMaxScale: function(a) {
                this.setScaleRange(null, a)
            },
            setScaleRange: function(a, c) {
                var d = b.isDefined(a),
                    e = b.isDefined(c);
                this.loaded || (this._hasMin = this._hasMin || d, this._hasMax = this._hasMax || e);
                var f = this.minScale,
                    h = this.maxScale;
                this.minScale = (d ? a : this.minScale) || 0;
                this.maxScale = (e ? c : this.maxScale) ||
                    0;
                if (f !== this.minScale || h !== this.maxScale) this.onScaleRangeChange(), this._processMapScale()
            },
            suspend: function() {
                this._suspended = !0;
                this.evaluateSuspension()
            },
            resume: function() {
                this._suspended = !1;
                this.evaluateSuspension()
            },
            canResume: function() {
                return this.loaded && this._map && this._map.loaded && this.visible && this.visibleAtMapScale && !this._suspended
            },
            evaluateSuspension: function() {
                this.canResume() ? this.suspended && this._resume() : this.suspended || this._suspend()
            },
            _suspend: function() {
                this.suspended = !0;
                this.attr("data-suspended",
                    "");
                this._toggleRT();
                this.onSuspend();
                if (this._map) this._map.onLayerSuspend(this)
            },
            _resume: function() {
                this.suspended = !1;
                this.attr("data-suspended");
                var a = void 0 === this._resumedOnce,
                    b = this.className,
                    c = this.getNode();
                if (a && (this._resumedOnce = !0, b && c)) {
                    var d = c.getAttribute("class") || "";
                    RegExp("(^|\\s)" + b + "(\\s|$)", "i").test(d) || c.setAttribute("class", d + ((d ? " " : "") + b))
                }
                this._toggleRT(!0);
                this.onResume({
                    firstOccurrence: a
                });
                if (this._map) this._map.onLayerResume(this)
            },
            _processMapScale: function() {
                var a = this.visibleAtMapScale;
                this.visibleAtMapScale = this._isMapAtVisibleScale();
                a !== this.visibleAtMapScale && (this.onScaleVisibilityChange(), this.evaluateSuspension())
            },
            isVisibleAtScale: function(a) {
                return a ? n.prototype._isMapAtVisibleScale.apply(this, arguments) : !1
            },
            _isMapAtVisibleScale: function(a) {
                if (!a && (!this._map || !this._map.loaded)) return !1;
                a = a || this._map.getScale();
                var b = this.minScale,
                    c = this.maxScale,
                    d = !b,
                    e = !c;
                !d && a <= b && (d = !0);
                !e && a >= c && (e = !0);
                return d && e
            },
            getAttributionData: function() {
                var a = this.attributionDataUrl,
                    b = new l(e._dfdCanceller);
                this.hasAttributionData && a ? (b._pendingDfd = c({
                    url: a,
                    content: {
                        f: "json"
                    },
                    handleAs: "json",
                    callbackParamName: "callback"
                }), b._pendingDfd.then(function(a) {
                    b.callback(a)
                }, function(a) {
                    b.errback(a)
                })) : (a = Error("Layer does not have attribution data"), a.log = m.isDebug, b.errback(a));
                return b
            },
            getResourceInfo: function() {
                var a = this.resourceInfo;
                return f.isString(a) ? k.fromJson(a) : f.clone(a)
            },
            getMap: function() {
                return this._map
            },
            getNode: function() {
                return this._div
            },
            attr: function(a, b) {
                var c = this.getNode();
                c && (null ==
                    b ? c.removeAttribute(a) : c.setAttribute(a, b));
                return this
            },
            setRefreshInterval: function(a) {
                var b = this.refreshInterval;
                this.refreshInterval = a;
                this._toggleRT();
                a && !this.updating && !this.suspended && this._toggleRT(!0);
                if (b !== a) this.onRefreshIntervalChange();
                return this
            },
            _toggleRT: function(a) {
                a && this.refreshInterval ? (clearTimeout(this._refreshT), this._refreshT = setTimeout(this.refresh, 6E4 * this.refreshInterval)) : this._refreshT && (clearTimeout(this._refreshT), this._refreshT = null)
            },
            setNormalization: function(a) {
                this.normalization =
                    a
            },
            setVisibility: function(a) {
                this.visible !== a && (this.visible = a, this.onVisibilityChange(this.visible), this.evaluateSuspension());
                this.attr("data-hidden", a ? null : "")
            },
            onLoad: function() {},
            onVisibilityChange: function() {},
            onScaleRangeChange: function() {},
            onScaleVisibilityChange: function() {},
            onSuspend: function() {},
            onResume: function() {},
            onUpdate: function() {},
            onUpdateStart: function() {},
            onUpdateEnd: function() {},
            onRefreshIntervalChange: function() {},
            onError: function() {}
        });
        q("extend-esri") && f.setObject("layers.Layer",
            n, d);
        return n
    })
}
