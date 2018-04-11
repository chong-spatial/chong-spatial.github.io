// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/4.0/esri/copyright.txt for details.
//>>built
require({
    cache: {
        "esri/geometry/ScreenPoint": function() {
            define(["../core/declare", "./Point"], function(h, k) {
                return h(k, {
                    declaredClass: "esri.geometry.ScreenPoint",
                    verifySR: function() {}
                })
            })
        },
        "esri/views/inputs/GestureManager": function() {
            define(["../../core/declare", "../../core/Accessoire", "./HandlerList", "./HammerInput"], function(h, k, c, e) {
                return h([k], {
                    constructor: function(b) {
                        (b = b.surface || this.surface) ? (this.inputManager = new e(b), this.handlers = new c({
                            gestureManager: this
                        })) : console.error("GestureManager requires a surface dom element to work.")
                    },
                    view: null,
                    surface: null,
                    trackHover: !1,
                    handlers: null,
                    _handlersSetter: function(b, a) {
                        null == b ? b = new c({
                            gestureManager: this
                        }) : b.gestureManager = this;
                        this._removeListeners(a);
                        this._addListeners(b, b);
                        return b
                    },
                    _inputManager: null,
                    on: function(b, a) {
                        var f = this.inputManager;
                        return f && f.on(b, a)
                    },
                    addGesture: function(b) {
                        var a = this.inputManager;
                        if ("input" === (b && b.event)) console.log("'input' is not a configurable gesture. listen to 'input' event with the 'on' function");
                        else return (b = a.addGesture(b)) ? this : b
                    },
                    addHandler: function(b) {
                        this.handlers ||
                            (this.handlers = new c);
                        this.handlers.add(b);
                        this._addListeners(this.handlers, b);
                        return this
                    },
                    removeHandler: function(b) {
                        if (this.handlers) {
                            this._removeListeners(this.handlers);
                            this.handlers.remove(b);
                            for (b = this.handlers.first; b;) this._addListeners(this.handlers, b), b = this.handlers.next()
                        }
                        return this
                    },
                    removeGesture: function(b) {
                        return this.inputManager.removeGesture(b)
                    },
                    configureGesture: function(b, a) {
                        return this.inputManager.configureGesture(b, a)
                    },
                    _addListeners: function(b, a) {
                        var f = a.events,
                            g = b.removers || [],
                            l = this;
                        f && (f = f.map(function(a) {
                            return l.on(a, b.processEvent.bind(b))
                        }), b.removers = g.concat(f))
                    },
                    _removeListeners: function(b) {
                        (b = b && b.removers) && b.forEach(function(a) {
                            a && a.remove()
                        })
                    }
                })
            })
        },
        "esri/views/inputs/HandlerList": function() {
            define(["../../core/LinkedList", "../../core/declare"], function(h, k) {
                return k([h], {
                    classMetadata: {
                        properties: {
                            view: {
                                dependsOn: ["gestureManager.view"]
                            }
                        }
                    },
                    constructor: function() {
                        this.on("add, remove", this._collectEvents.bind(this))
                    },
                    removers: null,
                    _gestureManager: null,
                    _gestureManagerSetter: function(c) {
                        this._addCustomGestures();
                        return c
                    },
                    _gestures: null,
                    _eventsGetter: function() {
                        return this._gestures
                    },
                    _customGestures: null,
                    _customGesturesSetter: function(c) {
                        this._addCustomGestures();
                        return c
                    },
                    _viewGetter: function() {
                        return this.get("gestureManager.view")
                    },
                    _gestureConfig: null,
                    _phaseDict: {
                        1: "start",
                        2: "move",
                        4: "end",
                        8: "cancel",
                        START: 1,
                        MOVE: 2,
                        END: 4,
                        CANCEL: 8
                    },
                    processEvent: function(c) {
                        var e = c && (c.type || c.name || c.eventType);
                        c.lastEvent = this._lastEvt;
                        "hammer.input" === e && (e = "input");
                        var b = this.first,
                            a = !0;
                        if (!c.screenPoint) {
                            var f = this.view.pageToContainer(c.center.x,
                                c.center.y);
                            c.screenPoint = {
                                x: f[0],
                                y: f[1]
                            }
                        }
                        for (; b;) {
                            if (f = b[e]) b = f.call(b, c), a = !1 !== b && !0 !== c.canceled;
                            b = a && this.next()
                        }
                        this._lastEvt = c.eventType < this._phaseDict.END && "scroll" !== e ? c : null;
                        a && this.view.emit(e, c)
                    },
                    _collectEvents: function() {
                        var c = this.first,
                            e = [];
                        for (this._gestureConfig = this._collectCustoms(); c;) e = e.concat(c.get("events")), c = this.next();
                        return this._gestures = e
                    },
                    _collectCustoms: function() {
                        for (var c = this.first, e = null; c;) {
                            if (c = c.customGestures)
                                if (e)
                                    for (var b = Object.keys(c), a = b.length - 1; 0 <=
                                        a; a--) {
                                        var f = b[a];
                                        e[f] || (e[f] = c[f])
                                    } else e = c;
                            c = this.next()
                        }
                        if (null != e && this.gestureManager) {
                            this._gestureConfig = e;
                            var g = this.gestureManager;
                            e.forEach(function(a) {
                                g.addGesture(a)
                            })
                        }
                        return e
                    },
                    _addCustomGestures: function() {
                        if (this._gestureManager && this._customGestures) {
                            var c = this._gestureManager;
                            this.customGestures.forEach(function(e) {
                                c.addGesture(e)
                            })
                        }
                    }
                })
            })
        },
        "esri/core/LinkedList": function() {
            define(["./declare", "../core/Accessoire", "../core/Evented"], function(h, k, c) {
                return h([k, c], {
                    next: function() {
                        var c =
                            this.item || this.first;
                        return this.item = c && c.next ? c.next : null
                    },
                    add: function(c) {
                        if (!c) return !1;
                        0 === this.count ? this.last = c : c.next = this.first;
                        this.item = this.first = c;
                        this.count++;
                        this.emit("add", c);
                        return this
                    },
                    remove: function(c) {
                        !c && null != this.item && (c = this.item);
                        for (var b = this.first, a = null; b != c && b.next;) a = this.item, b = this.next();
                        b == c && (b.next ? a ? a.next = b.next : this.first = b.next : (a.next = null, this.last = a), this.item = this.first, this.emit("remove", c));
                        return this
                    },
                    reset: function() {
                        this.item = this.first
                    },
                    empty: function(c) {
                        this.reset();
                        for (var b = this.item, a = b.next; null != b;) b.next = null, c && (b.destroy && "function" == typeof b.destroy) && b.destroy(), b = this.item = a, a = this.next();
                        this.last = this.first = null;
                        return this
                    },
                    first: null,
                    last: null,
                    count: 0
                })
            })
        },
        "esri/views/inputs/HammerInput": function() {
            define(["../../core/hammerExtended", "../../core/declare", "dojo/aspect"], function(h, k, c) {
                var e = {
                        drag: {
                            event: "drag",
                            action: "pan",
                            button: 0
                        },
                        click: {
                            event: "click",
                            action: "tap",
                            threshold: 5,
                            posThreshold: 20,
                            interval: 185,
                            exclusiveTo: ["double-click"]
                        },
                        "right-click": {
                            event: "right-click",
                            action: "tap",
                            button: 2
                        },
                        altdrag: {
                            event: "altdrag",
                            action: "pan",
                            button: 2,
                            exclusiveTo: ["drag"]
                        },
                        pinch: {
                            threshold: 0.01,
                            firesWith: ["drag", "rotation"]
                        },
                        rotation: {
                            threshold: 5,
                            firesWith: ["drag", "pinch"]
                        },
                        hold: {
                            time: 350
                        },
                        swipe: {
                            firesWith: ["drag"]
                        },
                        scroll: !0,
                        "double-click": {
                            event: "double-click",
                            action: "tap",
                            taps: 2,
                            threshold: 30,
                            posThreshold: 30,
                            firesWith: ["click"]
                        }
                    },
                    b = /\s*,\s*/g;
                return k(null, {
                    gestures: null,
                    manager: null,
                    constructor: function(a) {
                        var b = function(a) {
                            a.preventDefault()
                        };
                        a.addEventListener("selectstart",
                            b, !1);
                        a.addEventListener("dragstart", b, !1);
                        a.addEventListener("contextmenu", b, !1);
                        this.manager = new h.Manager(a);
                        this.gestures = {};
                        c.after(this.manager, "add", this._emitAdd.bind(this.manager), !0)
                    },
                    on: function(a, f) {
                        var g = this.manager,
                            l = e[a];
                        if (b.test(a)) {
                            var c = this;
                            a.split(b).forEach(function(a) {
                                c.on(a, f)
                            });
                            return {
                                remove: function() {
                                    g.off(a.replace(b, " "), f)
                                }
                            }
                        }
                        "input" != a && (!g.get(a) && l) && this.addGesture({
                            action: l.action || a,
                            event: l.event || a,
                            rules: !0 === l ? void 0 : l
                        });
                        return this.gestures && this.gestures[a] ||
                            "input" == a ? ("input" == a && (a = "hammer.input"), g.on(a, f), {
                                remove: function() {
                                    g.off(a, f)
                                }
                            }) : !1
                    },
                    addGesture: function(a) {
                        if (!a) return !1;
                        var b = a.action,
                            g = a.event,
                            l = a.rules;
                        a = l && l.firesWith;
                        var m = l && l.exclusiveTo,
                            b = "hold" == b ? "Press" : b && b.slice(0, 1).toUpperCase() + b.slice(1);
                        if (h[b] && "function" == typeof h[b]) return l = new h[b](l), this.gestures[g || b] = l, this.manager && this.manager.add(l), c.around(l, "recognizeWith", this._checkGestureLinks.bind(l)), c.around(l, "requireFailure", this._checkGestureLinks.bind(l)), a && (Array.isArray(a) ||
                            (a = [a]), l.recognizeWith(a)), m && l.requireFailure(m), !0;
                        console.warn("no such action to base the new gesture on");
                        return !1
                    },
                    removeGesture: function(a) {
                        return this.manager && this.manager.remove(a)
                    },
                    configureGesture: function(a, b) {
                        return this.manager && this.manager.set(a, b)
                    },
                    _checkGestureLinks: function(a) {
                        var b = this.manager;
                        a = a.bind(this);
                        return function(b) {
                            return function(l) {
                                if (b && b.get(l) || Array.isArray(l)) a(l);
                                else {
                                    var f = function(c) {
                                        l == c.gesture.options.event && (a(l), b.off("add", f))
                                    };
                                    b.on("add", f)
                                }
                            }
                        }(b)
                    },
                    _emitAdd: function(a) {
                        this.emit("add", {
                            gesture: a
                        })
                    }
                })
            })
        },
        "esri/core/hammerExtended": function() {
            define(["./libs/hammer/hammer"], function(h) {
                function k() {
                    g.apply(this, arguments)
                }
                h.INPUT_TYPE_TOUCH = "touch";
                h.INPUT_TYPE_PEN = "pen";
                h.INPUT_TYPE_MOUSE = "mouse";
                h.INPUT_TYPE_KINECT = "kinect";
                var c = {
                        mousedown: h.INPUT_START,
                        mousemove: h.INPUT_MOVE,
                        mouseup: h.INPUT_END,
                        wheel: h.INPUT_MOVE
                    },
                    e = {
                        pointerdown: h.INPUT_START,
                        pointermove: h.INPUT_MOVE,
                        pointerup: h.INPUT_END,
                        pointercancel: h.INPUT_CANCEL,
                        pointerout: h.INPUT_CANCEL,
                        wheel: h.INPUT_MOVE
                    },
                    b = {
                        2: h.INPUT_TYPE_TOUCH,
                        3: h.INPUT_TYPE_PEN,
                        4: h.INPUT_TYPE_MOUSE,
                        5: h.INPUT_TYPE_KINECT
                    };
                h.prototype._emit = h.prototype.emit;
                h.prototype.emit = function(a, b) {
                    b.cancelled = !1;
                    b.cancel = function() {
                        b.srcEvent.preventDefault();
                        b.srcEvent.stopImmediatePropagation();
                        b.cancelled = !0
                    };
                    this._emit(a, b)
                };
                h.extend(h.MouseInput.prototype, {
                    _lastButton: null,
                    handler: function(a) {
                        var b = c[a.type];
                        b & h.INPUT_START && (0 === a.button || 2 === a.button) ? (this.pressed = !0, this._lastButton = a.button) : b & h.INPUT_MOVE && "wheel" ===
                            a.type && (this.pressed = !0, a.preventDefault());
                        b & h.INPUT_MOVE && (null != this._lastButton && a.which !== this._lastButton + 1) && (b = h.INPUT_END);
                        this.pressed && this.allow && (b & h.INPUT_END && (this.pressed = !1, this._lastButton = null), this.callback(this.manager, b, {
                            pointers: [a],
                            changedPointers: [a],
                            pointerType: h.INPUT_TYPE_MOUSE,
                            srcEvent: a,
                            button: a.button,
                            scrollDelta: a.deltaY && -1 * a.deltaY
                        }))
                    }
                });
                h.extend(h.PointerEventInput.prototype, {
                    handler: function(a) {
                        var g = this.store,
                            f = !1,
                            d = !1,
                            c = null,
                            k = a.type.toLowerCase().replace("ms",
                                ""),
                            k = e[k],
                            p = b[a.pointerType] || a.pointerType,
                            A = p == h.INPUT_TYPE_TOUCH,
                            r = h.inArray(g, a.pointerId, "pointerId");
                        k & h.INPUT_START && (0 === a.button || 2 === a.button || A) ? (0 > r && (d = !0), this.pressed = !0, c = this._lastButton = a.button) : k & h.INPUT_MOVE && "wheel" === a.type ? (0 > r && (d = !0), f = this.pressed = !0, a.preventDefault()) : k & h.INPUT_MOVE && this.pressed ? c = this._lastButton : k & (h.INPUT_END | h.INPUT_CANCEL) && (f = !0, this.pressed = !1, c = a.button);
                        !0 === d && (g.push(a), r = g.length - 1);
                        0 > r || (g[r] = a, this.callback(this.manager, k, {
                            pointers: g,
                            changedPointers: [a],
                            pointerType: p,
                            srcEvent: a,
                            button: c,
                            scrollDelta: a.deltaY && -1 * a.deltaY
                        }), f && (g.splice(r, 1), this._lastButton = this.pressed = !1))
                    }
                });
                var a = h.Tap.prototype.process,
                    f = function(a) {
                        var b;
                        b = a.pointerType != h.INPUT_TYPE_MOUSE || null == this.options.button ? null : this.options.button;
                        return null === b || a.button === b
                    };
                h.extend(h.AttrRecognizer.prototype, {
                    _attrTest: h.AttrRecognizer.prototype.attrTest,
                    _btnTest: f,
                    attrTest: function(a) {
                        return this._attrTest(a) && this._btnTest(a)
                    }
                });
                h.extend(h.Tap.prototype.defaults, {
                    button: 0
                });
                h.extend(h.Tap.prototype, {
                    _btnTest: f,
                    _tapProcess: a,
                    process: function(a) {
                        return this._btnTest(a) ? this._tapProcess(a) : h.STATE_FAILED
                    }
                });
                h.extend(h.Pan.prototype, {
                    process: function(a) {
                        a = this._super.process.call(this, a);
                        a >= h.STATE_CANCELLED && (a = h.STATE_FAILED);
                        return a
                    }
                });
                var g = h.AttrRecognizer;
                h.inherit(k, g, {
                    defaults: {
                        event: "scroll",
                        threshold: 0,
                        pointers: 0
                    },
                    getTouchAction: function() {
                        return [h.TOUCH_ACTION_COMPUTE]
                    },
                    attrTest: function(a) {
                        return this._super.attrTest.call(this, a) && Math.abs(a.scrollDelta) > this.options.threshold
                    },
                    process: function(a) {
                        a = this._super.process.call(this, a);
                        a >= h.STATE_CANCELLED && (a = h.STATE_FAILED);
                        return a
                    }
                });
                h.Scroll = k;
                return h
            })
        },
        "esri/core/libs/hammer/hammer": function() {
            define([], function() {
                function h(a, b, d) {
                    return Array.isArray(a) ? (k(a, d[b], d), !0) : !1
                }

                function k(a, b, d) {
                    var g;
                    if (a)
                        if (a.forEach) a.forEach(b, d);
                        else if (void 0 !== a.length)
                        for (g = 0; g < a.length;) b.call(d, a[g], g, a), g++;
                    else
                        for (g in a) a.hasOwnProperty(g) && b.call(d, a[g], g, a)
                }

                function c(a, b, d) {
                    for (var g = Object.keys(b), f = 0; f < g.length;) {
                        if (!d ||
                            d && void 0 === a[g[f]]) a[g[f]] = b[g[f]];
                        f++
                    }
                    return a
                }

                function e(a, b) {
                    return c(a, b, !0)
                }

                function b(a, b, d) {
                    b = b.prototype;
                    var g;
                    g = a.prototype = Object.create(b);
                    g.constructor = a;
                    g._super = b;
                    d && c(g, d)
                }

                function a(a, b) {
                    return function() {
                        return a.apply(b, arguments)
                    }
                }

                function f(a, b) {
                    return typeof a == Ba ? a.apply(b ? b[0] || void 0 : void 0, b) : a
                }

                function g(a, b, d) {
                    k(n(b), function(b) {
                        a.addEventListener(b, d, !1)
                    })
                }

                function l(a, b, d) {
                    k(n(b), function(b) {
                        a.removeEventListener(b, d, !1)
                    })
                }

                function m(a, b) {
                    for (; a;) {
                        if (a == b) return !0;
                        a =
                            a.parentNode
                    }
                    return !1
                }

                function n(a) {
                    return a.trim().split(/\s+/g)
                }

                function d(a, b, d) {
                    if (a.indexOf && !d) return a.indexOf(b);
                    for (var g = 0; g < a.length;) {
                        if (d && a[g][d] == b || !d && a[g] === b) return g;
                        g++
                    }
                    return -1
                }

                function q(a) {
                    return Array.prototype.slice.call(a, 0)
                }

                function t(a, b, g) {
                    for (var f = [], l = [], c = 0; c < a.length;) {
                        var m = b ? a[c][b] : a[c];
                        0 > d(l, m) && f.push(a[c]);
                        l[c] = m;
                        c++
                    }
                    g && (f = b ? f.sort(function(a, d) {
                        return a[b] > d[b]
                    }) : f.sort());
                    return f
                }

                function p(a, b) {
                    for (var d, g = b[0].toUpperCase() + b.slice(1), f = 0; f < qa.length;) {
                        d =
                            (d = qa[f]) ? d + g : b;
                        if (d in a) return d;
                        f++
                    }
                }

                function A(a) {
                    a = a.ownerDocument || a;
                    return a.defaultView || a.parentWindow || window
                }

                function r(a, b) {
                    var d = this;
                    this.manager = a;
                    this.callback = b;
                    this.element = a.element;
                    this.target = a.options.inputTarget;
                    this.domHandler = function(b) {
                        f(a.options.enable, [a]) && d.handler(b)
                    };
                    this.init()
                }

                function s(a) {
                    var b = a.options.inputClass;
                    return new(b ? b : Ca ? ia : Da ? $ : ra ? x : aa)(a, v)
                }

                function v(a, b, d) {
                    var g = d.pointers.length,
                        f = d.changedPointers.length,
                        c = b & D && 0 === g - f,
                        g = b & (B | E) && 0 === g - f;
                    d.isFirst = !!c;
                    d.isFinal = !!g;
                    c && (a.session = {});
                    d.eventType = b;
                    b = a.session;
                    c = d.pointers;
                    g = c.length;
                    b.firstInput || (b.firstInput = u(d));
                    1 < g && !b.firstMultiple ? b.firstMultiple = u(d) : 1 === g && (b.firstMultiple = !1);
                    var f = b.firstInput,
                        l = (g = b.firstMultiple) ? g.center : f.center,
                        e = d.center = z(c);
                    d.timeStamp = ja();
                    d.deltaTime = d.timeStamp - f.timeStamp;
                    d.angle = C(l, e);
                    d.distance = w(l, e);
                    var f = d.center,
                        l = b.offsetDelta || {},
                        e = b.prevDelta || {},
                        s = b.prevInput || {};
                    if (d.eventType === D || s.eventType === B) e = b.prevDelta = {
                            x: s.deltaX || 0,
                            y: s.deltaY || 0
                        },
                        l = b.offsetDelta = {
                            x: f.x,
                            y: f.y
                        };
                    d.deltaX = e.x + (f.x - l.x);
                    d.deltaY = e.y + (f.y - l.y);
                    d.offsetDirection = y(d.deltaX, d.deltaY);
                    d.scale = g ? w(c[0], c[1], ba) / w(g.pointers[0], g.pointers[1], ba) : 1;
                    d.rotation = g ? C(c[1], c[0], ba) - C(g.pointers[1], g.pointers[0], ba) : 0;
                    l = b.lastInterval || d;
                    c = d.timeStamp - l.timeStamp;
                    d.eventType != E && (c > Ea || void 0 === l.velocity) ? (f = l.deltaX - d.deltaX, l = l.deltaY - d.deltaY, e = f / c || 0, s = l / c || 0, c = e, g = s, e = R(e) > R(s) ? e : s, f = y(f, l), b.lastInterval = d) : (e = l.velocity, c = l.velocityX, g = l.velocityY, f = l.direction);
                    d.velocity =
                        e;
                    d.velocityX = c;
                    d.velocityY = g;
                    d.direction = f;
                    b = a.element;
                    m(d.srcEvent.target, b) && (b = d.srcEvent.target);
                    d.target = b;
                    a.emit("hammer.input", d);
                    a.recognize(d);
                    a.session.prevInput = d
                }

                function u(a) {
                    for (var b = [], d = 0; d < a.pointers.length;) b[d] = {
                        clientX: O(a.pointers[d].clientX),
                        clientY: O(a.pointers[d].clientY)
                    }, d++;
                    return {
                        timeStamp: ja(),
                        pointers: b,
                        center: z(b),
                        deltaX: a.deltaX,
                        deltaY: a.deltaY
                    }
                }

                function z(a) {
                    var b = a.length;
                    if (1 === b) return {
                        x: O(a[0].clientX),
                        y: O(a[0].clientY)
                    };
                    for (var d = 0, g = 0, f = 0; f < b;) d += a[f].clientX,
                        g += a[f].clientY, f++;
                    return {
                        x: O(d / b),
                        y: O(g / b)
                    }
                }

                function y(a, b) {
                    return a === b ? ca : R(a) >= R(b) ? 0 < a ? S : T : 0 < b ? U : V
                }

                function w(a, b, d) {
                    d || (d = sa);
                    var g = b[d[0]] - a[d[0]];
                    a = b[d[1]] - a[d[1]];
                    return Math.sqrt(g * g + a * a)
                }

                function C(a, b, d) {
                    d || (d = sa);
                    return 180 * Math.atan2(b[d[1]] - a[d[1]], b[d[0]] - a[d[0]]) / Math.PI
                }

                function aa() {
                    this.evEl = Fa;
                    this.evWin = Ga;
                    this.allow = !0;
                    this.pressed = !1;
                    r.apply(this, arguments)
                }

                function ia() {
                    this.evEl = ta;
                    this.evWin = ua;
                    r.apply(this, arguments);
                    this.store = this.manager.session.pointerEvents = []
                }

                function va() {
                    this.evTarget =
                        Ha;
                    this.evWin = Ia;
                    this.started = !1;
                    r.apply(this, arguments)
                }

                function $() {
                    this.evTarget = Ja;
                    this.targetIds = {};
                    r.apply(this, arguments)
                }

                function Ka(a, b) {
                    var d = q(a.touches),
                        g = this.targetIds;
                    if (b & (D | M) && 1 === d.length) return g[d[0].identifier] = !0, [d, d];
                    var f, l = q(a.changedTouches),
                        c = [],
                        e = this.target;
                    f = d.filter(function(a) {
                        return m(a.target, e)
                    });
                    if (b === D)
                        for (d = 0; d < f.length;) g[f[d].identifier] = !0, d++;
                    for (d = 0; d < l.length;) g[l[d].identifier] && c.push(l[d]), b & (B | E) && delete g[l[d].identifier], d++;
                    if (c.length) return [t(f.concat(c),
                        "identifier", !0), c]
                }

                function x() {
                    r.apply(this, arguments);
                    var d = a(this.handler, this);
                    this.touch = new $(this.manager, d);
                    this.mouse = new aa(this.manager, d)
                }

                function K(a, d) {
                    this.manager = a;
                    this.set(d)
                }

                function La(a) {
                    if (-1 < a.indexOf(W)) return W;
                    var d = -1 < a.indexOf(X),
                        b = -1 < a.indexOf(Y);
                    return d && b ? X + " " + Y : d || b ? d ? X : Y : -1 < a.indexOf(ka) ? ka : wa
                }

                function I(a) {
                    this.id = Ma++;
                    this.manager = null;
                    this.options = e(a || {}, this.defaults);
                    this.options.enable = void 0 === this.options.enable ? !0 : this.options.enable;
                    this.state = da;
                    this.simultaneous = {};
                    this.requireFail = []
                }

                function xa(a) {
                    return a == V ? "down" : a == U ? "up" : a == S ? "left" : a == T ? "right" : ""
                }

                function ea(a, d) {
                    var b = d.manager;
                    return b ? b.get(a) : a
                }

                function G() {
                    I.apply(this, arguments)
                }

                function fa() {
                    G.apply(this, arguments);
                    this.pY = this.pX = null
                }

                function la() {
                    G.apply(this, arguments)
                }

                function ma() {
                    I.apply(this, arguments);
                    this._input = this._timer = null
                }

                function na() {
                    G.apply(this, arguments)
                }

                function oa() {
                    G.apply(this, arguments)
                }

                function ga() {
                    I.apply(this, arguments);
                    this.pCenter = this.pTime = !1;
                    this._input =
                        this._timer = null;
                    this.count = 0
                }

                function P(a, d) {
                    d = d || {};
                    d.recognizers = void 0 === d.recognizers ? P.defaults.preset : d.recognizers;
                    return new pa(a, d)
                }

                function pa(a, d) {
                    d = d || {};
                    this.options = e(d, P.defaults);
                    this.options.inputTarget = this.options.inputTarget || a;
                    this.handlers = {};
                    this.session = {};
                    this.recognizers = [];
                    this.element = a;
                    this.input = s(this);
                    this.touchAction = new K(this, this.options.touchAction);
                    ya(this, !0);
                    k(d.recognizers, function(a) {
                            var d = this.add(new a[0](a[1]));
                            a[2] && d.recognizeWith(a[2]);
                            a[3] && d.requireFailure(a[3])
                        },
                        this)
                }

                function ya(a, d) {
                    var b = a.element;
                    b.style && k(a.options.cssProps, function(a, g) {
                        b.style[p(b.style, g)] = d ? a : ""
                    })
                }

                function Na(a, d) {
                    var b = document.createEvent("Event");
                    b.initEvent(a, !0, !0);
                    b.gesture = d;
                    d.target.dispatchEvent(b)
                }
                var qa = " webkit moz MS ms o".split(" "),
                    Oa = document.createElement("div"),
                    Ba = "function",
                    O = Math.round,
                    R = Math.abs,
                    ja = Date.now,
                    Ma = 1,
                    ha = /mobile|tablet|ip(ad|hone|od)|android/i,
                    ra = "ontouchstart" in window,
                    Ca = void 0 !== p(window, "PointerEvent"),
                    Da = ra && ha.test(navigator.userAgent),
                    Ea = 25,
                    D = 1,
                    M = 2,
                    B = 4,
                    E = 8,
                    ca = 1,
                    S = 2,
                    T = 4,
                    U = 8,
                    V = 16,
                    H = S | T,
                    N = U | V,
                    ha = H | N,
                    sa = ["x", "y"],
                    ba = ["clientX", "clientY"];
                r.prototype = {
                    handler: function() {},
                    init: function() {
                        this.evEl && g(this.element, this.evEl, this.domHandler);
                        this.evTarget && g(this.target, this.evTarget, this.domHandler);
                        this.evWin && g(A(this.element), this.evWin, this.domHandler)
                    },
                    destroy: function() {
                        this.evEl && l(this.element, this.evEl, this.domHandler);
                        this.evTarget && l(this.target, this.evTarget, this.domHandler);
                        this.evWin && l(A(this.element), this.evWin, this.domHandler)
                    }
                };
                var Pa = {
                        mousedown: D,
                        mousemove: M,
                        mouseup: B
                    },
                    Fa = "mousedown wheel",
                    Ga = "mousemove mouseup";
                b(aa, r, {
                    handler: function(a) {
                        var d = Pa[a.type];
                        d & D && 0 === a.button && (this.pressed = !0);
                        d & M && 1 !== a.which && (d = B);
                        this.pressed && this.allow && (d & B && (this.pressed = !1), this.callback(this.manager, d, {
                            pointers: [a],
                            changedPointers: [a],
                            pointerType: "mouse",
                            srcEvent: a
                        }))
                    }
                });
                var Qa = {
                        pointerdown: D,
                        pointermove: M,
                        pointerup: B,
                        pointercancel: E,
                        pointerout: E
                    },
                    Ra = {
                        2: "touch",
                        3: "pen",
                        4: "mouse",
                        5: "kinect"
                    },
                    ta = "pointerdown wheel",
                    ua = "pointermove pointerup pointercancel";
                window.MSPointerEvent && (ta = "MSPointerDown wheel", ua = "MSPointerMove MSPointerUp MSPointerCancel");
                b(ia, r, {
                    handler: function(a) {
                        var b = this.store,
                            g = !1,
                            f = a.type.toLowerCase().replace("ms", ""),
                            f = Qa[f],
                            l = Ra[a.pointerType] || a.pointerType,
                            c = "touch" == l,
                            m = d(b, a.pointerId, "pointerId");
                        f & D && (0 === a.button || c) ? 0 > m && (b.push(a), m = b.length - 1) : f & (B | E) && (g = !0);
                        0 > m || (b[m] = a, this.callback(this.manager, f, {
                            pointers: b,
                            changedPointers: [a],
                            pointerType: l,
                            srcEvent: a
                        }), g && b.splice(m, 1))
                    }
                });
                var Sa = {
                        touchstart: D,
                        touchmove: M,
                        touchend: B,
                        touchcancel: E
                    },
                    Ha = "touchstart",
                    Ia = "touchstart touchmove touchend touchcancel";
                b(va, r, {
                    handler: function(a) {
                        var d = Sa[a.type];
                        d === D && (this.started = !0);
                        if (this.started) {
                            var b;
                            b = q(a.touches);
                            var g = q(a.changedTouches);
                            d & (B | E) && (b = t(b.concat(g), "identifier", !0));
                            b = [b, g];
                            d & (B | E) && 0 === b[0].length - b[1].length && (this.started = !1);
                            this.callback(this.manager, d, {
                                pointers: b[0],
                                changedPointers: b[1],
                                pointerType: "touch",
                                srcEvent: a
                            })
                        }
                    }
                });
                var Ta = {
                        touchstart: D,
                        touchmove: M,
                        touchend: B,
                        touchcancel: E
                    },
                    Ja = "touchstart touchmove touchend touchcancel";
                b($, r, {
                    handler: function(a) {
                        var d = Ta[a.type],
                            b = Ka.call(this, a, d);
                        b && this.callback(this.manager, d, {
                            pointers: b[0],
                            changedPointers: b[1],
                            pointerType: "touch",
                            srcEvent: a
                        })
                    }
                });
                b(x, r, {
                    handler: function(a, d, b) {
                        var g = "mouse" == b.pointerType;
                        if ("touch" == b.pointerType) this.mouse.allow = !1;
                        else if (g && !this.mouse.allow) return;
                        d & (B | E) && (this.mouse.allow = !0);
                        this.callback(a, d, b)
                    },
                    destroy: function() {
                        this.touch.destroy();
                        this.mouse.destroy()
                    }
                });
                var za = p(Oa.style, "touchAction"),
                    Aa = void 0 !== za,
                    wa = "auto",
                    ka = "manipulation",
                    W = "none",
                    X = "pan-x",
                    Y = "pan-y";
                K.prototype = {
                    set: function(a) {
                        "compute" == a && (a = this.compute());
                        Aa && this.manager.element.style && (this.manager.element.style[za] = a);
                        this.actions = a.toLowerCase().trim()
                    },
                    update: function() {
                        this.set(this.manager.options.touchAction)
                    },
                    compute: function() {
                        var a = [];
                        k(this.manager.recognizers, function(d) {
                            f(d.options.enable, [d]) && (a = a.concat(d.getTouchAction()))
                        });
                        return La(a.join(" "))
                    },
                    preventDefaults: function(a) {
                        if (!Aa) {
                            var d = a.srcEvent;
                            a = a.offsetDirection;
                            if (this.manager.session.prevented) d.preventDefault();
                            else {
                                var b = this.actions,
                                    g = -1 < b.indexOf(W),
                                    f = -1 < b.indexOf(Y),
                                    b = -1 < b.indexOf(X);
                                if (g || f && a & H || b && a & N) return this.preventSrc(d)
                            }
                        }
                    },
                    preventSrc: function(a) {
                        this.manager.session.prevented = !0;
                        a.preventDefault()
                    }
                };
                var da = 1,
                    F = 2,
                    Q = 4,
                    L = 8,
                    J = L,
                    Z = 16;
                I.prototype = {
                    defaults: {},
                    set: function(a) {
                        c(this.options, a);
                        this.manager && this.manager.touchAction.update();
                        return this
                    },
                    recognizeWith: function(a) {
                        if (h(a, "recognizeWith", this)) return this;
                        var d = this.simultaneous;
                        a = ea(a, this);
                        d[a.id] || (d[a.id] = a, a.recognizeWith(this));
                        return this
                    },
                    dropRecognizeWith: function(a) {
                        if (h(a, "dropRecognizeWith", this)) return this;
                        a = ea(a, this);
                        delete this.simultaneous[a.id];
                        return this
                    },
                    requireFailure: function(a) {
                        if (h(a, "requireFailure", this)) return this;
                        var b = this.requireFail;
                        a = ea(a, this); - 1 === d(b, a) && (b.push(a), a.requireFailure(this));
                        return this
                    },
                    dropRequireFailure: function(a) {
                        if (h(a, "dropRequireFailure", this)) return this;
                        a = ea(a, this);
                        a = d(this.requireFail, a); - 1 < a && this.requireFail.splice(a, 1);
                        return this
                    },
                    hasRequireFailures: function() {
                        return 0 <
                            this.requireFail.length
                    },
                    canRecognizeWith: function(a) {
                        return !!this.simultaneous[a.id]
                    },
                    emit: function(a) {
                        function d(f) {
                            b.manager.emit(b.options.event + (f ? g & Z ? "cancel" : g & L ? "end" : g & Q ? "move" : g & F ? "start" : "" : ""), a)
                        }
                        var b = this,
                            g = this.state;
                        g < L && d(!0);
                        d();
                        g >= L && d(!0)
                    },
                    tryEmit: function(a) {
                        if (this.canEmit()) return this.emit(a);
                        this.state = 32
                    },
                    canEmit: function() {
                        for (var a = 0; a < this.requireFail.length;) {
                            if (!(this.requireFail[a].state & (32 | da))) return !1;
                            a++
                        }
                        return !0
                    },
                    recognize: function(a) {
                        a = c({}, a);
                        f(this.options.enable, [this, a]) ? (this.state & (J | Z | 32) && (this.state = da), this.state = this.process(a), this.state & (F | Q | L | Z) && this.tryEmit(a)) : (this.reset(), this.state = 32)
                    },
                    process: function(a) {},
                    getTouchAction: function() {},
                    reset: function() {}
                };
                b(G, I, {
                    defaults: {
                        pointers: 1
                    },
                    attrTest: function(a) {
                        var d = this.options.pointers;
                        return 0 === d || a.pointers.length === d
                    },
                    process: function(a) {
                        var d = this.state,
                            b = a.eventType,
                            g = d & (F | Q);
                        a = this.attrTest(a);
                        return g && (b & E || !a) ? d | Z : g || a ? b & B ? d | L : !(d & F) ? F : d | Q : 32
                    }
                });
                b(fa, G, {
                    defaults: {
                        event: "pan",
                        threshold: 10,
                        pointers: 1,
                        direction: ha
                    },
                    getTouchAction: function() {
                        var a = this.options.direction,
                            d = [];
                        a & H && d.push(Y);
                        a & N && d.push(X);
                        return d
                    },
                    directionTest: function(a) {
                        var d = this.options,
                            b = !0,
                            g = a.distance,
                            f = a.direction,
                            l = a.deltaX,
                            c = a.deltaY;
                        f & d.direction || (d.direction & H ? (f = 0 === l ? ca : 0 > l ? S : T, b = l != this.pX, g = Math.abs(a.deltaX)) : (f = 0 === c ? ca : 0 > c ? U : V, b = c != this.pY, g = Math.abs(a.deltaY)));
                        a.direction = f;
                        return b && g > d.threshold && f & d.direction
                    },
                    attrTest: function(a) {
                        return G.prototype.attrTest.call(this, a) && (this.state & F || !(this.state &
                            F) && this.directionTest(a))
                    },
                    emit: function(a) {
                        this.pX = a.deltaX;
                        this.pY = a.deltaY;
                        var d = xa(a.direction);
                        d && this.manager.emit(this.options.event + d, a);
                        this._super.emit.call(this, a)
                    }
                });
                b(la, G, {
                    defaults: {
                        event: "pinch",
                        threshold: 0,
                        pointers: 2
                    },
                    getTouchAction: function() {
                        return [W]
                    },
                    attrTest: function(a) {
                        return this._super.attrTest.call(this, a) && (Math.abs(a.scale - 1) > this.options.threshold || this.state & F)
                    },
                    emit: function(a) {
                        this._super.emit.call(this, a);
                        1 !== a.scale && this.manager.emit(this.options.event + (1 > a.scale ?
                            "in" : "out"), a)
                    }
                });
                b(ma, I, {
                    defaults: {
                        event: "press",
                        pointers: 1,
                        time: 500,
                        threshold: 5
                    },
                    getTouchAction: function() {
                        return [wa]
                    },
                    process: function(d) {
                        var b = this.options,
                            g = d.pointers.length === b.pointers,
                            f = d.distance < b.threshold,
                            l = d.deltaTime > b.time;
                        this._input = d;
                        if (!f || !g || d.eventType & (B | E) && !l) this.reset();
                        else if (d.eventType & D) this.reset(), this._timer = setTimeout(a(function() {
                            this.state = J;
                            this.tryEmit()
                        }, this), b.time);
                        else if (d.eventType & B) return J;
                        return 32
                    },
                    reset: function() {
                        clearTimeout(this._timer)
                    },
                    emit: function(a) {
                        this.state ===
                            J && (a && a.eventType & B ? this.manager.emit(this.options.event + "up", a) : (this._input.timeStamp = ja(), this.manager.emit(this.options.event, this._input)))
                    }
                });
                b(na, G, {
                    defaults: {
                        event: "rotate",
                        threshold: 0,
                        pointers: 2
                    },
                    getTouchAction: function() {
                        return [W]
                    },
                    attrTest: function(a) {
                        return this._super.attrTest.call(this, a) && (Math.abs(a.rotation) > this.options.threshold || this.state & F)
                    }
                });
                b(oa, G, {
                    defaults: {
                        event: "swipe",
                        threshold: 10,
                        velocity: 0.65,
                        direction: H | N,
                        pointers: 1
                    },
                    getTouchAction: function() {
                        return fa.prototype.getTouchAction.call(this)
                    },
                    attrTest: function(a) {
                        var d = this.options.direction,
                            b;
                        d & (H | N) ? b = a.velocity : d & H ? b = a.velocityX : d & N && (b = a.velocityY);
                        return this._super.attrTest.call(this, a) && d & a.direction && a.distance > this.options.threshold && R(b) > this.options.velocity && a.eventType & B
                    },
                    emit: function(a) {
                        var d = xa(a.direction);
                        d && this.manager.emit(this.options.event + d, a);
                        this.manager.emit(this.options.event, a)
                    }
                });
                b(ga, I, {
                    defaults: {
                        event: "tap",
                        pointers: 1,
                        taps: 1,
                        interval: 300,
                        time: 250,
                        threshold: 2,
                        posThreshold: 10
                    },
                    getTouchAction: function() {
                        return [ka]
                    },
                    process: function(d) {
                        var b = this.options,
                            g = d.pointers.length === b.pointers,
                            f = d.distance < b.threshold,
                            l = d.deltaTime < b.time;
                        this.reset();
                        if (d.eventType & D && 0 === this.count) return this.failTimeout();
                        if (f && l && g) {
                            if (d.eventType != B) return this.failTimeout();
                            g = this.pTime ? d.timeStamp - this.pTime < b.interval : !0;
                            f = !this.pCenter || w(this.pCenter, d.center) < b.posThreshold;
                            this.pTime = d.timeStamp;
                            this.pCenter = d.center;
                            this.count = !f || !g ? 1 : this.count + 1;
                            this._input = d;
                            if (0 === this.count % b.taps) return this.hasRequireFailures() ?
                                (this._timer = setTimeout(a(function() {
                                    this.state = J;
                                    this.tryEmit()
                                }, this), b.interval), F) : J
                        }
                        return 32
                    },
                    failTimeout: function() {
                        this._timer = setTimeout(a(function() {
                            this.state = 32
                        }, this), this.options.interval);
                        return 32
                    },
                    reset: function() {
                        clearTimeout(this._timer)
                    },
                    emit: function() {
                        this.state == J && (this._input.tapCount = this.count, this.manager.emit(this.options.event, this._input))
                    }
                });
                P.VERSION = "2.0.4";
                P.defaults = {
                    domEvents: !1,
                    touchAction: "compute",
                    enable: !0,
                    inputTarget: null,
                    inputClass: null,
                    preset: [
                        [na, {
                            enable: !1
                        }],
                        [la, {
                                enable: !1
                            },
                            ["rotate"]
                        ],
                        [oa, {
                            direction: H
                        }],
                        [fa, {
                                direction: H
                            },
                            ["swipe"]
                        ],
                        [ga],
                        [ga, {
                                event: "doubletap",
                                taps: 2
                            },
                            ["tap"]
                        ],
                        [ma]
                    ],
                    cssProps: {
                        userSelect: "none",
                        touchSelect: "none",
                        touchCallout: "none",
                        contentZooming: "none",
                        userDrag: "none",
                        tapHighlightColor: "rgba(0,0,0,0)"
                    }
                };
                pa.prototype = {
                    set: function(a) {
                        c(this.options, a);
                        a.touchAction && this.touchAction.update();
                        a.inputTarget && (this.input.destroy(), this.input.target = a.inputTarget, this.input.init());
                        return this
                    },
                    stop: function(a) {
                        this.session.stopped = a ? 2 : 1
                    },
                    recognize: function(a) {
                        var d = this.session;
                        if (!d.stopped) {
                            this.touchAction.preventDefaults(a);
                            var b, g = this.recognizers,
                                f = d.curRecognizer;
                            if (!f || f && f.state & J) f = d.curRecognizer = null;
                            for (var l = 0; l < g.length;) b = g[l], 2 !== d.stopped && (!f || b == f || b.canRecognizeWith(f)) ? b.recognize(a) : b.reset(), !f && b.state & (F | Q | L) && (f = d.curRecognizer = b), l++
                        }
                    },
                    get: function(a) {
                        if (a instanceof I) return a;
                        for (var d = this.recognizers, b = 0; b < d.length; b++)
                            if (d[b].options.event == a) return d[b];
                        return null
                    },
                    add: function(a) {
                        if (h(a, "add", this)) return this;
                        var d = this.get(a.options.event);
                        d && this.remove(d);
                        this.recognizers.push(a);
                        a.manager = this;
                        this.touchAction.update();
                        return a
                    },
                    remove: function(a) {
                        if (h(a, "remove", this)) return this;
                        var b = this.recognizers;
                        a = this.get(a);
                        b.splice(d(b, a), 1);
                        this.touchAction.update();
                        return this
                    },
                    on: function(a, d) {
                        var b = this.handlers;
                        k(n(a), function(a) {
                            b[a] = b[a] || [];
                            b[a].push(d)
                        });
                        return this
                    },
                    off: function(a, b) {
                        var g = this.handlers;
                        k(n(a), function(a) {
                            b ? g[a].splice(d(g[a], b), 1) : delete g[a]
                        });
                        return this
                    },
                    emit: function(a, d) {
                        this.options.domEvents &&
                            Na(a, d);
                        var b = this.handlers[a] && this.handlers[a].slice();
                        if (b && b.length) {
                            d.type = a;
                            d.preventDefault = function() {
                                d.srcEvent.preventDefault()
                            };
                            for (var g = 0; g < b.length;) b[g](d), g++
                        }
                    },
                    destroy: function() {
                        this.element && ya(this, !1);
                        this.handlers = {};
                        this.session = {};
                        this.input.destroy();
                        this.element = null
                    }
                };
                c(P, {
                    INPUT_START: D,
                    INPUT_MOVE: M,
                    INPUT_END: B,
                    INPUT_CANCEL: E,
                    STATE_POSSIBLE: da,
                    STATE_BEGAN: F,
                    STATE_CHANGED: Q,
                    STATE_ENDED: L,
                    STATE_RECOGNIZED: J,
                    STATE_CANCELLED: Z,
                    STATE_FAILED: 32,
                    DIRECTION_NONE: ca,
                    DIRECTION_LEFT: S,
                    DIRECTION_RIGHT: T,
                    DIRECTION_UP: U,
                    DIRECTION_DOWN: V,
                    DIRECTION_HORIZONTAL: H,
                    DIRECTION_VERTICAL: N,
                    DIRECTION_ALL: ha,
                    Manager: pa,
                    Input: r,
                    TouchAction: K,
                    TouchInput: $,
                    MouseInput: aa,
                    PointerEventInput: ia,
                    TouchMouseInput: x,
                    SingleTouchInput: va,
                    Recognizer: I,
                    AttrRecognizer: G,
                    Tap: ga,
                    Pan: fa,
                    Swipe: oa,
                    Pinch: la,
                    Rotate: na,
                    Press: ma,
                    on: g,
                    off: l,
                    each: k,
                    merge: e,
                    extend: c,
                    inherit: b,
                    bindFn: a,
                    prefixed: p,
                    inArray: d
                });
                return P
            })
        },
        "esri/views/2d/AnimationManager": function() {
            define("../../core/declare ../../core/Accessoire ../../core/Scheduler ../../core/now ../ViewAnimation ./unitBezier ./viewpointUtils".split(" "),
                function(h, k, c, e, b, a, f) {
                    var g = function(b, g, f, d) {
                        var c = b.targetGeometry,
                            e = g.targetGeometry;
                        d ? "string" === typeof d && (d = a.parse(d) || a.ease) : d = a.ease;
                        this.easing = d;
                        this.duration = f;
                        this.sCenterX = c.x;
                        this.sCenterY = c.y;
                        this.sScale = b.scale;
                        this.sRotation = b.rotation;
                        this.tCenterX = e.x;
                        this.tCenterY = e.y;
                        this.tScale = g.scale;
                        this.tRotation = g.rotation;
                        this.dCenterX = this.tCenterX - this.sCenterX;
                        this.dCenterY = this.tCenterY - this.sCenterY;
                        this.dScale = this.tScale - this.sScale;
                        this.dRotation = this.tRotation - this.sRotation;
                        180 < this.dRotation ? this.dRotation -= 360 : -180 > this.dRotation && (this.dRotation += 360)
                    };
                    g.prototype.applyRatio = function(a, b) {
                        var g = this.easing(b),
                            d, f, c;
                        1 <= b ? (d = this.tCenterX, f = this.tCenterY, c = this.tRotation, g = this.tScale) : (d = this.sCenterX + g * this.dCenterX, f = this.sCenterY + g * this.dCenterY, c = this.sRotation + g * this.dRotation, g = this.sScale + g * this.dScale);
                        a.targetGeometry.x = d;
                        a.targetGeometry.y = f;
                        a.scale = g;
                        a.rotation = c
                    };
                    return h(k, {
                        constructor: function() {
                            this._updateTask = c.addFrameTask({
                                postRender: this._postRender.bind(this)
                            });
                            this._updateTask.pause()
                        },
                        getDefaults: function() {
                            return {
                                viewpoint: f.create()
                            }
                        },
                        duration: 200,
                        transition: null,
                        easing: a.ease,
                        animateTo: function(a, c, h) {
                            f.copy(this.viewpoint, c);
                            this.transition = new g(this.viewpoint, a, h && h.duration || this.duration, h && h.easing || this.easing);
                            this.animation && (this.animation.stop(), this.animation = null);
                            a = this.animation = new b({
                                target: a.clone()
                            });
                            a.always(function() {
                                this._updateTask && (this._updateTask.pause(), this.animation = null)
                            }.bind(this));
                            this._startTime = e();
                            this._updateTask.resume();
                            return a
                        },
                        _postRender: function(a) {
                            a = this.animation;
                            if (!a || a.state === b.STOPPED) this._updateTask.pause();
                            else {
                                a = (e() - this._startTime) / this.transition.duration;
                                var g = 1 <= a;
                                this.transition.applyRatio(this.viewpoint, a);
                                this.animation._dfd.progress(this.viewpoint);
                                g && this.animation.finish()
                            }
                        }
                    })
                })
        },
        "esri/views/2d/unitBezier": function() {
            define([], function() {
                var h = function(c, e, b, a) {
                        function f(a, d) {
                            var b, f, c, e;
                            d = null == d ? 1E-6 : d;
                            c = a;
                            for (f = 0; 8 > f; f++) {
                                e = ((m * c + l) * c + g) * c - a;
                                if (Math.abs(e) < d) return c;
                                b = (3 * m * c + 2 * l) *
                                    c + g;
                                if (1E-6 > Math.abs(b)) break;
                                c -= e / b
                            }
                            b = 0;
                            f = 1;
                            c = a;
                            if (c < b) return b;
                            if (c > f) return f;
                            for (; b < f;) {
                                e = ((m * c + l) * c + g) * c;
                                if (Math.abs(e - a) < d) break;
                                a > e ? b = c : f = c;
                                c = 0.5 * (f - b) + b
                            }
                            return c
                        }
                        var g = 3 * c,
                            l = 3 * (b - c) - g,
                            m = 1 - g - l,
                            h = 3 * e,
                            d = 3 * (a - e) - h,
                            q = 1 - h - d;
                        return function(a, b) {
                            var g = f(a, b);
                            return ((q * g + d) * g + h) * g
                        }
                    },
                    k = /^cubic-bezier\((.*)\)/;
                h.parse = function(c) {
                    var e = h[c] || null;
                    if (!e && (c = k.exec(c))) c = c[1].split(",").map(function(b) {
                        return parseFloat(b.trim())
                    }), 4 === c.length && !c.some(function(b) {
                        return isNaN(b)
                    }) && (e = h.apply(h, c));
                    return e
                };
                h.ease = h(0.25, 0.1, 0.25, 1);
                h.linear = h(0, 0, 1, 1);
                h.easeIn = h["ease-in"] = h(0.42, 0, 1, 1);
                h.easeOut = h["ease-out"] = h(0, 0, 0.58, 1);
                h.easeInOut = h["ease-in-out"] = h(0.42, 0, 0.58, 1);
                return h
            })
        },
        "esri/views/2d/PaddedViewState": function() {
            define("./viewpointUtils ./ViewState ./math/vec2 ./math/mat2d ./math/common ../../core/Accessoire".split(" "), function(h, k, c, e, b, a) {
                var f = a.createSubclass({
                    classMetadata: {
                        properties: {
                            left: {},
                            top: {},
                            right: {},
                            bottom: {}
                        }
                    },
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0
                });
                f.copy = function(a, b) {
                    a.left =
                        b.left;
                    a.top = b.top;
                    a.right = b.right;
                    a.bottom = b.bottom
                };
                return k.createSubclass({
                    declaredClass: "esri.views.2d.PaddedViewState",
                    classMetadata: {
                        properties: {
                            padding: {
                                type: f,
                                copy: f.copy
                            },
                            transform: {
                                dependsOn: ["padding"]
                            },
                            paddedScreenCenter: {
                                dependsOn: ["size", "padding"],
                                readOnly: !0,
                                copy: c.copy
                            },
                            clipRect: {
                                dependsOn: ["worldScreenWidth", "rotation", "paddedScreenCenter", "screenCenter"],
                                readOnly: !0,
                                copy: function(a, b) {
                                    a.top = b.top;
                                    a.left = b.left;
                                    a.right = b.right;
                                    a.bottom = b.bottom
                                }
                            }
                        }
                    },
                    getDefaults: function() {
                        return {
                            content: new k,
                            padding: new f,
                            size: c.fromValues(0, 0)
                        }
                    },
                    _clipRectGetter: function() {
                        var a = c.create(),
                            f = e.create();
                        return function(m) {
                            var h = this.worldScreenWidth;
                            if (!h) return null;
                            var d = b.toRadian(this.rotation),
                                q = Math.abs(Math.cos(d)),
                                k = Math.abs(Math.sin(d)),
                                q = this.width * q + this.height * k;
                            if (h > q) return null;
                            c.copy(a, this.screenCenter);
                            e.fromTranslation(f, a);
                            e.rotate(f, f, d);
                            c.negate(a, a);
                            e.translate(f, f, a);
                            c.transformMat2d(a, this.paddedScreenCenter, f);
                            m || (m = {});
                            m.top = -Math.round(q);
                            m.left = Math.round(a[0] - 0.5 * h);
                            m.right =
                                Math.round(a[0] + 0.5 * h);
                            m.bottom = +Math.round(q);
                            return m
                        }
                    }(),
                    _padding: null,
                    _paddingSetter: function(a) {
                        this._padding = a || new f;
                        this._updateContent();
                        return a
                    },
                    _size: null,
                    _sizeSetter: function(a) {
                        this._size = a;
                        this._updateContent();
                        return a
                    },
                    _paddedScreenCenterGetter: function(a) {
                        var b = this.content.size,
                            f = this.padding;
                        a || (a = c.create());
                        c.scale(a, b, 0.5);
                        a[0] += f.left;
                        a[1] += f.top;
                        return a
                    },
                    viewpoint: null,
                    _viewpointSetter: function() {
                        var a;
                        return function(b, f) {
                            a || (a = b.clone());
                            this.content.viewpoint = b;
                            h.addPadding(a,
                                b, this._size, this._padding);
                            return !f ? h.addPadding(a.clone(), b, this._size, this._padding) : h.addPadding(f, b, this._size, this._padding)
                        }
                    }(),
                    _updateContent: function() {
                        var a = c.create();
                        return function() {
                            var b = this._size,
                                f = this._padding;
                            if (b && f) {
                                var e = this.content;
                                c.set(a, f.left + f.right, f.top + f.bottom);
                                c.subtract(a, b, a);
                                e.size = a;
                                if (b = e.viewpoint) this.viewpoint = b
                            }
                        }
                    }()
                })
            })
        },
        "esri/views/2d/ViewState": function() {
            define(["./viewpointUtils", "./math/vec2", "./math/mat2d", "../../geometry/Extent", "../../core/Accessoire"],
                function(h, k, c, e, b) {
                    var a = b.createSubclass({
                        declaredClass: "esri.views.2d.ViewState",
                        classMetadata: {
                            properties: {
                                center: {
                                    copy: k.copy,
                                    dependsOn: ["viewpoint"]
                                },
                                extent: {
                                    dependsOn: ["viewpoint", "size"],
                                    copy: function(a, b) {
                                        a.xmin = b.xmin;
                                        a.ymin = b.ymin;
                                        a.xmax = b.xmax;
                                        a.ymax = b.ymax;
                                        a.spatialReference = b.spatialReference
                                    }
                                },
                                height: {
                                    dependsOn: ["size"]
                                },
                                inverseTransform: {
                                    readOnly: !0,
                                    copy: c.copy,
                                    dependsOn: ["transform"]
                                },
                                latitude: {
                                    dependsOn: ["viewpoint"]
                                },
                                longitude: {
                                    dependsOn: ["viewpoint"]
                                },
                                resolution: {
                                    dependsOn: ["viewpoint"]
                                },
                                rotation: {
                                    dependsOn: ["viewpoint"]
                                },
                                scale: {
                                    dependsOn: ["viewpoint"]
                                },
                                screenCenter: {
                                    readOnly: !0,
                                    copy: k.copy,
                                    dependsOn: ["size"]
                                },
                                size: {
                                    copy: k.copy
                                },
                                spatialReference: {
                                    dependsOn: ["viewpoint"]
                                },
                                transform: {
                                    readOnly: !0,
                                    copy: c.copy,
                                    dependsOn: ["viewpoint", "size"]
                                },
                                transformNoRotation: {
                                    readOnly: !0,
                                    copy: c.copy,
                                    dependsOn: ["viewpoint", "size"]
                                },
                                version: {
                                    readOnly: !0,
                                    dependsOn: ["transform"]
                                },
                                viewpoint: {
                                    copy: h.copy
                                },
                                width: {
                                    dependsOn: ["size"]
                                },
                                worldScreenWidth: {
                                    readOnly: !0,
                                    dependsOn: ["worldWidth", "resolution"]
                                },
                                worldWidth: {
                                    readOnly: !0,
                                    dependsOn: ["spatialReference"]
                                },
                                wrappable: {
                                    readOnly: !0,
                                    dependsOn: ["spatialReference"]
                                },
                                x: {
                                    dependsOn: ["center"]
                                },
                                y: {
                                    dependsOn: ["center"]
                                }
                            }
                        },
                        _centerGetter: function(a) {
                            var b = this.viewpoint.targetGeometry;
                            return !a ? k.fromValues(b.x, b.y) : k.set(a, b.x, b.y)
                        },
                        _extentGetter: function(a) {
                            a || (a = new e);
                            return h.getExtent(a, this.viewpoint, this.size)
                        },
                        _heightGetter: function() {
                            return this.size ? this.size[1] : 0
                        },
                        _inverseTransformGetter: function(a) {
                            a || (a = c.create());
                            return c.invert(a, this.transform)
                        },
                        _latitudeGetter: function() {
                            return this.viewpoint.targetGeometry.latitude
                        },
                        _longitudeGetter: function() {
                            return this.viewpoint.targetGeometry.longitude
                        },
                        _resolutionGetter: function() {
                            return h.getResolution(this.viewpoint)
                        },
                        _rotationGetter: function() {
                            return this.viewpoint.rotation
                        },
                        _scaleGetter: function() {
                            return this.viewpoint.scale
                        },
                        _screenCenterGetter: function(a) {
                            var b = this.size;
                            a || (a = k.create());
                            return k.scale(a, b, 0.5)
                        },
                        size: null,
                        _sizeSetter: function(a, b) {
                            return !b ? k.clone(a) : k.copy(b, a)
                        },
                        _spatialReferenceGetter: function() {
                            return this.viewpoint.targetGeometry.spatialReference
                        },
                        _transformGetter: function(a) {
                            a || (a = c.create());
                            return h.getTransform(a, this.viewpoint, this.size)
                        },
                        _transformNoRotationGetter: function(a) {
                            a || (a = c.create());
                            return h.getTransformNoRotation(a, this.viewpoint, this.size)
                        },
                        version: 0,
                        _versionGetter: function(a) {
                            return a + 1
                        },
                        viewpoint: null,
                        _viewpointSetter: function(a, b) {
                            return !b ? a.clone() : h.copy(b, a)
                        },
                        _widthGetter: function() {
                            return this.size ? this.size[0] : 0
                        },
                        _worldScreenWidthGetter: function() {
                            return this.worldWidth / this.resolution
                        },
                        _worldWidthGetter: function() {
                            if (this.wrappable) {
                                var a =
                                    this.spatialReference._getInfo();
                                return a.valid[1] - a.valid[0]
                            }
                            return 0
                        },
                        _wrappableGetter: function() {
                            return !!this.spatialReference && this.spatialReference.isWrappable
                        },
                        _xGetter: function() {
                            return this.center[0]
                        },
                        _yGetter: function() {
                            return this.center[1]
                        },
                        copy: function(a) {
                            return this.set({
                                viewpoint: a.viewpoint,
                                size: a.size
                            })
                        },
                        clone: function() {
                            return new a({
                                viewpoint: this.viewpoint.clone(),
                                size: k.clone(this.size)
                            })
                        },
                        toMap: function(a, b) {
                            return k.transformMat2d(a, b, this.inverseTransform)
                        },
                        toScreen: function(a,
                            b) {
                            return k.transformMat2d(a, b, this.transform)
                        },
                        pixelSizeAt: function(a) {
                            return h.pixelSizeAt(a, this.viewpoint, this.size)
                        }
                    });
                    return a
                })
        },
        "esri/views/2d/MapViewConstraints": function() {
            define(["../../core/Accessor", "../../core/Evented", "../../layers/support/LOD", "./constraints/ZoomConstraint", "./constraints/RotationConstraint"], function(h, k, c, e, b) {
                e = e.default;
                b = b.default;
                return h.createSubclass([k], {
                    declaredClass: "esri.views.2d.MapViewConstraints",
                    destroy: function() {
                        this.view = null
                    },
                    initialize: function() {
                        this.watch("_zoom, _rotation",
                            this.emit.bind(this, "update"), !0)
                    },
                    properties: {
                        effectiveLODs: {
                            readOnly: !0,
                            aliasOf: "_zoom.effectiveLODs"
                        },
                        effectiveMinScale: {
                            readOnly: !0,
                            aliasOf: "_zoom.effectiveMinScale"
                        },
                        effectiveMaxScale: {
                            readOnly: !0,
                            aliasOf: "_zoom.effectiveMaxScale"
                        },
                        effectiveMinZoom: {
                            readOnly: !0,
                            aliasOf: "_zoom.effectiveMinZoom"
                        },
                        effectiveMaxZoom: {
                            readOnly: !0,
                            aliasOf: "_zoom.effectiveMaxZoom"
                        },
                        enabled: !0,
                        lods: {
                            value: null,
                            type: [c]
                        },
                        minScale: 0,
                        maxScale: 0,
                        minZoom: -1,
                        maxZoom: -1,
                        rotationEnabled: !0,
                        snapToZoom: !0,
                        view: {
                            value: null
                        },
                        _zoom: {
                            type: e,
                            dependsOn: "lods minZoom maxZoom minScale maxScale snapToZoom view.tileInfo".split(" "),
                            get: function() {
                                return new e({
                                    lods: this.lods || this.view && this.view.tileInfo && this.view.tileInfo.lods,
                                    minZoom: this.minZoom,
                                    maxZoom: this.maxZoom,
                                    minScale: this.minScale,
                                    maxScale: this.maxScale,
                                    snapToZoom: this.snapToZoom
                                })
                            }
                        },
                        _rotation: {
                            type: b,
                            dependsOn: ["rotationEnabled"],
                            get: function() {
                                return new b({
                                    rotationEnabled: this.rotationEnabled
                                })
                            }
                        }
                    },
                    constrain: function(a, b, g) {
                        if (!this.enabled) return a;
                        this._zoom.constrain(a, b,
                            g);
                        this._rotation.constrain(a, b, g);
                        return a
                    },
                    zoomToScale: function(a) {
                        return this._zoom.zoomToScale(a)
                    },
                    scaleToZoom: function(a) {
                        return this._zoom.scaleToZoom(a)
                    },
                    snapScale: function(a, b) {
                        return this._zoom.snapScale(a, b)
                    }
                })
            })
        },
        "esri/views/2d/constraints/ZoomConstraint": function() {
            define("require exports ../../../core/tsSupport/declareExtendsHelper ../../../core/tsSupport/decorateHelper ../../../core/tsSupport/declare ../../../core/Accessor ../../../layers/support/LOD".split(" "), function(h, k, c, e, b, a,
                f) {
                h = function(a) {
                    function l() {
                        a.apply(this, arguments);
                        this._lodByScale = {};
                        this._scales = [];
                        this.effectiveLODs = null;
                        this.effectiveMaxZoom = this.effectiveMinZoom = -1;
                        this.effectiveMaxScale = this.effectiveMinScale = 0;
                        this.enabled = !0;
                        this.lods = null;
                        this.maxZoom = this.minZoom = -1;
                        this.maxScale = this.minScale = 0;
                        this.snapToZoom = !0
                    }
                    c(l, a);
                    l.prototype.initialize = function() {
                        var a = this,
                            b = this.lods,
                            d = this.minScale,
                            g = this.maxScale,
                            f = this.minZoom,
                            c = this.maxZoom,
                            l = -1,
                            e = -1,
                            s = !1,
                            h = !1;
                        0 !== d && (0 !== g && d < g) && (g = [g, d], d = g[0],
                            g = g[1]);
                        if (b && b.length) {
                            b = b.map(function(a) {
                                return a.clone()
                            });
                            b.sort(function(a, b) {
                                return b.scale - a.scale
                            });
                            b.forEach(function(a, b) {
                                return a.level = b
                            });
                            for (var u, k = 0, y = b; k < y.length; k++) {
                                var w = y[k];
                                !s && (0 < d && d >= w.scale) && (l = w.level, s = !0);
                                !h && (0 < g && g >= w.scale) && (e = u ? u.level : -1, h = !0);
                                u = w
                            } - 1 === f && (f = 0 === d ? 0 : l); - 1 === c && (c = 0 === g ? b.length - 1 : e);
                            f = Math.max(f, 0);
                            f = Math.min(f, b.length - 1);
                            c = Math.max(c, 0);
                            c = Math.min(c, b.length - 1);
                            f > c && (d = [c, f], f = d[0], c = d[1]);
                            d = b[f].scale;
                            g = b[c].scale;
                            b.splice(0, f);
                            b.splice(c -
                                f + 1, b.length);
                            b.forEach(function(b, d) {
                                a._lodByScale[b.scale] = b;
                                a._scales[d] = b.scale
                            });
                            this._set("effectiveLODs", b);
                            this._set("effectiveMinZoom", f);
                            this._set("effectiveMaxZoom", c)
                        }
                        this._set("effectiveMinScale", d);
                        this._set("effectiveMaxScale", g)
                    };
                    l.prototype.constrain = function(a, b, d) {
                        if (!this.enabled || b && a.scale === b.scale) return a;
                        var g = this.effectiveMinScale,
                            f = this.effectiveMaxScale;
                        d = a.targetGeometry;
                        var c = b && b.targetGeometry,
                            l = 0 !== g && a.scale > g;
                        if (0 !== f && a.scale < f || l) g = l ? g : f, c && (b = (g - b.scale) / (a.scale -
                            b.scale), d.x = c.x + (d.x - c.x) * b, d.y = c.y + (d.y - c.y) * b), a.scale = g;
                        this.snapToZoom && this.effectiveLODs && (a.scale = this._getClosestScale(a.scale));
                        return a
                    };
                    l.prototype.zoomToScale = function(a) {
                        if (!this.effectiveLODs) return 0;
                        a -= this.effectiveMinZoom;
                        a = Math.max(0, a);
                        var b = this._scales;
                        if (0 >= a) return b[0];
                        if (a >= b.length) return b[b.length - 1];
                        var d = Math.round(a - 0.5),
                            g = Math.round(a);
                        return b[g] + (g - a) * (b[d] - b[g])
                    };
                    l.prototype.scaleToZoom = function(a) {
                        if (!this.effectiveLODs) return -1;
                        var b = this._scales,
                            d = 0,
                            g = b.length -
                            1,
                            f, c;
                        for (d; d < g; d++) {
                            f = b[d];
                            c = b[d + 1];
                            if (f <= a) return d + this.effectiveMinZoom;
                            if (c === a) return d + 1 + this.effectiveMinZoom;
                            if (f > a && c < a) return d + 1 - (a - c) / (f - c) + this.effectiveMinZoom
                        }
                        return d
                    };
                    l.prototype.snapScale = function(a, b) {
                        void 0 === b && (b = 0.95);
                        if (!this.effectiveLODs) return a;
                        var d = this.scaleToZoom(a);
                        return (d + 1) % Math.floor(d + 1) >= b ? this.zoomToScale(Math.ceil(d)) : this.zoomToScale(Math.floor(d))
                    };
                    l.prototype.clone = function() {
                        return new l({
                            enabled: this.enabled,
                            lods: this.lods,
                            minZoom: this.minZoom,
                            maxZoom: this.maxZoom,
                            minScale: this.minScale,
                            maxScale: this.maxScale
                        })
                    };
                    l.prototype._getClosestScale = function(a) {
                        if (this._lodByScale[a]) return this._lodByScale[a].scale;
                        a = this._scales.reduce(function(b, d, g, f) {
                            return Math.abs(d - a) <= Math.abs(b - a) ? d : b
                        }, this._scales[0]);
                        return this._lodByScale[a].scale
                    };
                    e([b.shared("esri.views.2d.constraints.ZoomConstraint")], l.prototype, "declaredClass", void 0);
                    e([b.property({
                        readOnly: !0
                    })], l.prototype, "effectiveLODs", void 0);
                    e([b.property({
                        readOnly: !0
                    })], l.prototype, "effectiveMinZoom", void 0);
                    e([b.property({
                        readOnly: !0
                    })], l.prototype, "effectiveMaxZoom", void 0);
                    e([b.property({
                        readOnly: !0
                    })], l.prototype, "effectiveMinScale", void 0);
                    e([b.property({
                        readOnly: !0
                    })], l.prototype, "effectiveMaxScale", void 0);
                    e([b.property()], l.prototype, "enabled", void 0);
                    e([b.property({
                        type: [f]
                    })], l.prototype, "lods", void 0);
                    e([b.property()], l.prototype, "minZoom", void 0);
                    e([b.property()], l.prototype, "maxZoom", void 0);
                    e([b.property()], l.prototype, "minScale", void 0);
                    e([b.property()], l.prototype, "maxScale", void 0);
                    e([b.property()],
                        l.prototype, "snapToZoom", void 0);
                    return l = e([b.subclass()], l)
                }(b.declared(a));
                Object.defineProperty(k, "__esModule", {
                    value: !0
                });
                k.default = h
            })
        },
        "esri/views/2d/constraints/RotationConstraint": function() {
            define("require exports ../../../core/tsSupport/declareExtendsHelper ../../../core/tsSupport/decorateHelper ../../../core/tsSupport/declare ../../../core/Accessor".split(" "), function(h, k, c, e, b, a) {
                h = function(a) {
                    function g() {
                        a.apply(this, arguments);
                        this.rotationEnabled = this.enabled = !0
                    }
                    c(g, a);
                    g.prototype.constrain =
                        function(a, b, g) {
                            if (!this.enabled) return a;
                            this.rotationEnabled || (a.rotation = 0);
                            return a
                        };
                    g.prototype.clone = function() {
                        return new g({
                            enabled: this.enabled,
                            rotationEnabled: this.rotationEnabled
                        })
                    };
                    e([b.shared("esri.views.2d.constraints.RotationConstraint")], g.prototype, "declaredClass", void 0);
                    e([b.property()], g.prototype, "enabled", void 0);
                    e([b.property()], g.prototype, "rotationEnabled", void 0);
                    return g = e([b.subclass()], g)
                }(b.declared(a));
                Object.defineProperty(k, "__esModule", {
                    value: !0
                });
                k.default = h
            })
        },
        "esri/views/2d/layers/GraphicsView2D": function() {
            define("dojox/gfx dojo/dom-style ../engine/Container ../../layers/GraphicsView ./LayerView2D ../../../geometry/support/webMercatorUtils ../VectorGroup ../Vector".split(" "), function(h, k, c, e, b, a, f, g) {
                return e.createSubclass({
                    declaredClass: "esri.views.2d.layers.GraphicsView2D",
                    classMetadata: {
                        properties: {
                            needsRedraw: {
                                dependsOn: ["gfx", "mapView.stationary"]
                            },
                            renderer: {},
                            view: {}
                        }
                    },
                    constructor: function() {
                        this.mapView = null
                    },
                    initialize: function() {
                        var a = this.view;
                        if (!a || !this.graphics) throw Error("view and graphics are required parameter options");
                        a.then(function() {
                            this.container = new c({
                                visible: !1
                            });
                            this._vectors = {};
                            this._bgVectors = {};
                            this._prevScale = null;
                            var g = this.container.render;
                            this.container.render = function(a) {
                                g.call(this.container, a);
                                this.render()
                            }.bind(this);
                            this.container.watch("surface", this._surfaceCreateHandler.bind(this));
                            this.watch("needsRedraw, graphics, mapView.state.version, view.suspended", this.redraw.bind(this));
                            this.watch("renderer", this._resymbolizeGraphics.bind(this));
                            a.isInstanceOf(b) ? (this.mapView = this.view.view, this.container.visible = a.layer.visible, a.container.addChild(this.container)) : (this.mapView = this.view, this.container.visible = !0, a.stage.addChild(this.container))
                        }.bind(this))
                    },
                    destroy: function() {
                        this._colChgHandle && (this._colChgHandle.remove(), this._colChgHandle = null);
                        this._vectors = this._bgVectors = this.container = this.group = this.bgGroup = null
                    },
                    _graphicsSetter: function(a) {
                        var b = this.graphics;
                        if (a === b) return a;
                        b && (this._colChgHandle.remove(), this._colChgHandle =
                            null, this.removeAll());
                        a && (this.addMany(a.toArray()), this._colChgHandle = a.on("change", function(a) {
                            this.addMany(a.added);
                            this.remove(a.removed)
                        }.bind(this)));
                        return a
                    },
                    _needsRedrawGetter: function() {
                        return (this.group || this.bgGroup) && this.mapView.stationary
                    },
                    hitTest: function(a, g) {
                        null != a && "object" === typeof a && (g = a.y, a = a.x);
                        var c = this.mapView,
                            d = this.view.isInstanceOf(b) ? this.view.container.surface : this.container.surface,
                            f = null,
                            e;
                        e = [a, g];
                        c.containerToPage(a, g, e);
                        d && (c = d.style.zIndex, d.style.zIndex = "10000",
                            k.getComputedStyle(d), f = (e = (f = (f = document.elementFromPoint(e[0], e[1])) && f.vector) && (f.parent === this.group || f.parent === this.bgGroup)) && f.graphic || null, d.style.zIndex = c);
                        return f
                    },
                    redraw: function() {
                        if (this.needsRedraw && !this.view.suspended && this.mapView.stationary) {
                            var a = this.mapView.state,
                                b = {},
                                g = !1;
                            a.resolution !== this.group.resolution && (b.x = a.x, b.y = a.y, b.resolution = a.resolution, g = !0, this._prevScale !== this.mapView.scale && (this._prevScale = this.mapView.scale, this._resizeGraphics()));
                            a.rotation !== this.group.rotation &&
                                (b.rotation = a.rotation, g = !0);
                            g && (this.group.set(b), this.bgGroup.set(b), this.group._updateTransform(), this.bgGroup._updateTransform(), this.group.draw(), this.bgGroup.draw(), this.render())
                        }
                    },
                    render: function() {
                        if (!this.view.suspended && this.group) {
                            var a = this.mapView.state;
                            this.gfx.setDimensions(a.width, a.height);
                            this.group.applyState(a);
                            this.bgGroup.applyState(a)
                        }
                    },
                    add: function(a) {
                        this.addMany([a])
                    },
                    addMany: function(a) {
                        if (a && this.group) {
                            a.hasOwnProperty("length") || (a = [a]);
                            var b, f = a.length,
                                d, c, e = this.mapView.extent.spatialReference;
                            for (b = 0; b < f; b++)
                                if (d = a[b], c = this.getRenderingInfo(d)) {
                                    var h = c.renderer && c.renderer.backgroundFillSymbol,
                                        k = d.id,
                                        r = d.geometry,
                                        s = this._projectGeometry(r, e),
                                        v = this._isPolygonMarkerSymbol(c.symbol.type, r),
                                        u = c.outlineSize;
                                    null == u && (u = c.size);
                                    this._vectors[k] = new g({
                                        graphic: d,
                                        symbol: c.symbol,
                                        color: c.color,
                                        size: c.size,
                                        opacity: c.opacity,
                                        rotationAngle: c.rotationAngle,
                                        outlineSize: u,
                                        geometry: v ? r && r.centroid : r,
                                        projectedGeometry: s && (v ? s.centroid : s)
                                    });
                                    this.group.addVector(this._vectors[k]);
                                    v && h && (this._bgVectors[k] =
                                        new g({
                                            graphic: d,
                                            symbol: h,
                                            outlineSize: c.outlineSize,
                                            geometry: r,
                                            projectedGeometry: s
                                        }), this.bgGroup.addVector(this._bgVectors[k]))
                                }
                            this.group.draw();
                            this.bgGroup.draw();
                            this.render()
                        }
                    },
                    remove: function(a) {
                        if (a) {
                            a.hasOwnProperty("length") || (a = [a]);
                            var b, g = a.length,
                                d, c;
                            for (b = 0; b < g; b++)
                                if (d = a[b], c = this._vectors[d.id], this.group.removeVector(c), delete this._vectors[d.id], c = this._bgVectors[d.id]) this.bgGroup.removeVector(c), delete this._bgVectors[d.id]
                        }
                    },
                    removeAll: function() {
                        this._clear(this.group, this._vectors);
                        this._vectors = {};
                        this._clear(this.bgGroup, this._bgVectors);
                        this._bgVectors = {}
                    },
                    _isPolygonMarkerSymbol: function(a, b) {
                        return b && "polygon" === b.type && ("simple-marker-symbol" === a || "picture-marker-symbol" === a || "text-symbol" === a)
                    },
                    _clear: function(a, b) {
                        Object.getOwnPropertyNames(b).forEach(function(c) {
                            a.removeVector(b[c])
                        }.bind(this))
                    },
                    _projectGeometry: function(b, c) {
                        var g = b && b.spatialReference,
                            d;
                        g && (c && !g.equals(c) && a.canProject(g, c)) && (d = c.isWebMercator ? a.geographicToWebMercator(b) : a.webMercatorToGeographic(b, !0));
                        return d
                    },
                    _resymbolizeGraphics: function() {
                        if (this.group) {
                            var a = this._vectors,
                                b = this.mapView.extent.spatialReference;
                            Object.getOwnPropertyNames(a).forEach(function(c) {
                                var d = a[c],
                                    f = d.graphic,
                                    e = this.getRenderingInfo(f);
                                if (e) {
                                    var h = e.renderer && e.renderer.backgroundFillSymbol,
                                        k = f.geometry,
                                        r = this._projectGeometry(k, b),
                                        s = this._isPolygonMarkerSymbol(e.symbol.type, k),
                                        v = e.outlineSize;
                                    null == v && (v = e.size);
                                    d.symbol = e.symbol;
                                    d.color = e.color;
                                    d.size = e.size;
                                    d.opacity = e.opacity;
                                    d.rotationAngle = e.rotationAngle;
                                    d.outlineSize = v;
                                    d.geometry = s ? k && k.centroid : k;
                                    d.projectedGeometry = r && (s ? r.centroid : r);
                                    d.offsets = null;
                                    d = this._bgVectors[c];
                                    s && h ? d ? (d.symbol = h, d.outlineSize = e.outlineSize, d.geometry = k, d.projectedGeometry = r, d.offsets = null) : (this._bgVectors[c] = new g({
                                        graphic: f,
                                        symbol: h,
                                        outlineSize: e.outlineSize,
                                        geometry: k,
                                        projectedGeometry: r
                                    }), this.bgGroup.addVector(this._bgVectors[c])) : d && (this.bgGroup.removeVector(d), delete this._bgVectors[c])
                                }
                            }.bind(this));
                            this.group.draw();
                            this.bgGroup.draw();
                            this.render()
                        }
                    },
                    _resizeGraphics: function() {
                        if (this.group) {
                            var a =
                                this._vectors;
                            Object.getOwnPropertyNames(a).forEach(function(b) {
                                var c = a[b],
                                    d = this.getRenderingInfo(c.graphic);
                                if (d) {
                                    var g = d.outlineSize;
                                    null == g && (g = d.size);
                                    c.size = d.size;
                                    c.outlineSize = g;
                                    c.offsets = null;
                                    if (c = this._bgVectors[b]) c.outlineSize = d.outlineSize, c.offsets = null
                                }
                            }.bind(this))
                        }
                    },
                    _createVectorGroup: function() {
                        var a = this.mapView.state;
                        return new f({
                            view: this.mapView,
                            x: a.x,
                            y: a.y,
                            resolution: a.resolution,
                            rotation: a.rotation,
                            surface: this.gfx.createGroup(),
                            layer: this.view.layer
                        })
                    },
                    _surfaceCreateHandler: function(a,
                        b, c, d) {
                        a = this.mapView.state;
                        this.gfx = h.createSurface(this.container.surface, a.width, a.height);
                        this.bgGroup = this._createVectorGroup();
                        this.group = this._createVectorGroup();
                        this.addMany(this.graphics.toArray())
                    }
                })
            })
        },
        "dojox/gfx": function() {
            define(["dojo/_base/lang", "./gfx/_base", "./gfx/renderer!"], function(h, k, c) {
                k.switchTo(c);
                return k
            })
        },
        "dojox/gfx/_base": function() {
            define("dojo/_base/kernel dojo/_base/lang dojo/_base/Color dojo/_base/sniff dojo/_base/window dojo/_base/array dojo/dom dojo/dom-construct dojo/dom-geometry".split(" "),
                function(h, k, c, e, b, a, f, g, l) {
                    var m = k.getObject("dojox.gfx", !0),
                        n = m._base = {};
                    m._hasClass = function(a, b) {
                        var d = a.getAttribute("className");
                        return d && 0 <= (" " + d + " ").indexOf(" " + b + " ")
                    };
                    m._addClass = function(a, b) {
                        var d = a.getAttribute("className") || "";
                        if (!d || 0 > (" " + d + " ").indexOf(" " + b + " ")) a.setAttribute("className", d + (d ? " " : "") + b)
                    };
                    m._removeClass = function(a, b) {
                        var d = a.getAttribute("className");
                        d && a.setAttribute("className", d.replace(RegExp("(^|\\s+)" + b + "(\\s+|$)"), "$1$2"))
                    };
                    n._getFontMeasurements = function() {
                        var a = {
                                "1em": 0,
                                "1ex": 0,
                                "100%": 0,
                                "12pt": 0,
                                "16px": 0,
                                "xx-small": 0,
                                "x-small": 0,
                                small: 0,
                                medium: 0,
                                large: 0,
                                "x-large": 0,
                                "xx-large": 0
                            },
                            d, c;
                        e("ie") && (c = b.doc.documentElement.style.fontSize || "", c || (b.doc.documentElement.style.fontSize = "100%"));
                        var f = g.create("div", {
                            style: {
                                position: "absolute",
                                left: "0",
                                top: "-100px",
                                width: "30px",
                                height: "1000em",
                                borderWidth: "0",
                                margin: "0",
                                padding: "0",
                                outline: "none",
                                lineHeight: "1",
                                overflow: "hidden"
                            }
                        }, b.body());
                        for (d in a) f.style.fontSize = d, a[d] = 16 * Math.round(12 * f.offsetHeight / 16) / 12 / 1E3;
                        e("ie") && (b.doc.documentElement.style.fontSize = c);
                        b.body().removeChild(f);
                        return a
                    };
                    var d = null;
                    n._getCachedFontMeasurements = function(a) {
                        if (a || !d) d = n._getFontMeasurements();
                        return d
                    };
                    var q = null,
                        t = {};
                    n._getTextBox = function(a, d, c) {
                        var f, e, h = arguments.length,
                            m;
                        q || (q = g.create("div", {
                            style: {
                                position: "absolute",
                                top: "-10000px",
                                left: "0",
                                visibility: "hidden"
                            }
                        }, b.body()));
                        f = q;
                        f.className = "";
                        e = f.style;
                        e.borderWidth = "0";
                        e.margin = "0";
                        e.padding = "0";
                        e.outline = "0";
                        if (1 < h && d)
                            for (m in d) m in t || (e[m] = d[m]);
                        2 < h && c && (f.className =
                            c);
                        f.innerHTML = a;
                        f.getBoundingClientRect ? (e = f.getBoundingClientRect(), e = {
                            l: e.left,
                            t: e.top,
                            w: e.width || e.right - e.left,
                            h: e.height || e.bottom - e.top
                        }) : e = l.getMarginBox(f);
                        f.innerHTML = "";
                        return e
                    };
                    n._computeTextLocation = function(a, b, d, c) {
                        var f = {};
                        switch (a.align) {
                            case "end":
                                f.x = a.x - b;
                                break;
                            case "middle":
                                f.x = a.x - b / 2;
                                break;
                            default:
                                f.x = a.x
                        }
                        f.y = a.y - d * (c ? 0.75 : 1);
                        return f
                    };
                    n._computeTextBoundingBox = function(a) {
                        if (!m._base._isRendered(a)) return {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0
                        };
                        var b;
                        b = a.getShape();
                        var d = a.getFont() || m.defaultFont;
                        a = a.getTextWidth();
                        d = m.normalizedLength(d.size);
                        b = n._computeTextLocation(b, a, d, !0);
                        return {
                            x: b.x,
                            y: b.y,
                            width: a,
                            height: d
                        }
                    };
                    n._isRendered = function(a) {
                        for (a = a.parent; a && a.getParent;) a = a.parent;
                        return null !== a
                    };
                    var p = 0;
                    n._getUniqueId = function() {
                        var a;
                        do a = h._scopeName + "xUnique" + ++p; while (f.byId(a));
                        return a
                    };
                    n._fixMsTouchAction = function(a) {
                        a = a.rawNode;
                        "undefined" != typeof a.style.msTouchAction && (a.style.msTouchAction = "none")
                    };
                    k.mixin(m, {
                        defaultPath: {
                            type: "path",
                            path: ""
                        },
                        defaultPolyline: {
                            type: "polyline",
                            points: []
                        },
                        defaultRect: {
                            type: "rect",
                            x: 0,
                            y: 0,
                            width: 100,
                            height: 100,
                            r: 0
                        },
                        defaultEllipse: {
                            type: "ellipse",
                            cx: 0,
                            cy: 0,
                            rx: 200,
                            ry: 100
                        },
                        defaultCircle: {
                            type: "circle",
                            cx: 0,
                            cy: 0,
                            r: 100
                        },
                        defaultLine: {
                            type: "line",
                            x1: 0,
                            y1: 0,
                            x2: 100,
                            y2: 100
                        },
                        defaultImage: {
                            type: "image",
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0,
                            src: ""
                        },
                        defaultText: {
                            type: "text",
                            x: 0,
                            y: 0,
                            text: "",
                            align: "start",
                            decoration: "none",
                            rotated: !1,
                            kerning: !0
                        },
                        defaultTextPath: {
                            type: "textpath",
                            text: "",
                            align: "start",
                            decoration: "none",
                            rotated: !1,
                            kerning: !0
                        },
                        defaultStroke: {
                            type: "stroke",
                            color: "black",
                            style: "solid",
                            width: 1,
                            cap: "butt",
                            join: 4
                        },
                        defaultLinearGradient: {
                            type: "linear",
                            x1: 0,
                            y1: 0,
                            x2: 100,
                            y2: 100,
                            colors: [{
                                offset: 0,
                                color: "black"
                            }, {
                                offset: 1,
                                color: "white"
                            }]
                        },
                        defaultRadialGradient: {
                            type: "radial",
                            cx: 0,
                            cy: 0,
                            r: 100,
                            colors: [{
                                offset: 0,
                                color: "black"
                            }, {
                                offset: 1,
                                color: "white"
                            }]
                        },
                        defaultPattern: {
                            type: "pattern",
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0,
                            src: ""
                        },
                        defaultFont: {
                            type: "font",
                            style: "normal",
                            variant: "normal",
                            weight: "normal",
                            size: "10pt",
                            family: "serif"
                        },
                        getDefault: function() {
                            var a = {};
                            return function(b) {
                                var d =
                                    a[b];
                                if (d) return new d;
                                d = a[b] = new Function;
                                d.prototype = m["default" + b];
                                return new d
                            }
                        }(),
                        normalizeColor: function(a) {
                            return a instanceof c ? a : new c(a)
                        },
                        normalizeParameters: function(a, b) {
                            var d;
                            if (b) {
                                var c = {};
                                for (d in a) d in b && !(d in c) && (a[d] = b[d])
                            }
                            return a
                        },
                        makeParameters: function(a, b) {
                            var d = null;
                            if (!b) return k.delegate(a);
                            var c = {};
                            for (d in a) d in c || (c[d] = k.clone(d in b ? b[d] : a[d]));
                            return c
                        },
                        formatNumber: function(a, b) {
                            var d = a.toString();
                            if (0 <= d.indexOf("e")) d = a.toFixed(4);
                            else {
                                var c = d.indexOf(".");
                                0 <= c && 5 < d.length - c && (d = a.toFixed(4))
                            }
                            return 0 > a ? d : b ? " " + d : d
                        },
                        makeFontString: function(a) {
                            return a.style + " " + a.variant + " " + a.weight + " " + a.size + " " + a.family
                        },
                        splitFontString: function(a) {
                            var b = m.getDefault("Font");
                            a = a.split(/\s+/);
                            if (!(5 > a.length)) {
                                b.style = a[0];
                                b.variant = a[1];
                                b.weight = a[2];
                                var d = a[3].indexOf("/");
                                b.size = 0 > d ? a[3] : a[3].substring(0, d);
                                var c = 4;
                                0 > d && ("/" == a[4] ? c = 6 : "/" == a[4].charAt(0) && (c = 5));
                                c < a.length && (b.family = a.slice(c).join(" "))
                            }
                            return b
                        },
                        cm_in_pt: 72 / 2.54,
                        mm_in_pt: 7.2 / 2.54,
                        px_in_pt: function() {
                            return m._base._getCachedFontMeasurements()["12pt"] /
                                12
                        },
                        pt2px: function(a) {
                            return a * m.px_in_pt()
                        },
                        px2pt: function(a) {
                            return a / m.px_in_pt()
                        },
                        normalizedLength: function(a) {
                            if (0 === a.length) return 0;
                            if (2 < a.length) {
                                var b = m.px_in_pt(),
                                    d = parseFloat(a);
                                switch (a.slice(-2)) {
                                    case "px":
                                        return d;
                                    case "pt":
                                        return d * b;
                                    case "in":
                                        return 72 * d * b;
                                    case "pc":
                                        return 12 * d * b;
                                    case "mm":
                                        return d * m.mm_in_pt * b;
                                    case "cm":
                                        return d * m.cm_in_pt * b
                                }
                            }
                            return parseFloat(a)
                        },
                        pathVmlRegExp: /([A-Za-z]+)|(\d+(\.\d+)?)|(\.\d+)|(-\d+(\.\d+)?)|(-\.\d+)/g,
                        pathSvgRegExp: /([A-DF-Za-df-z])|([-+]?\d*[.]?\d+(?:[eE][-+]?\d+)?)/g,
                        equalSources: function(a, b) {
                            return a && b && a === b
                        },
                        switchTo: function(b) {
                            var d = "string" == typeof b ? m[b] : b;
                            d && (a.forEach("Group Rect Ellipse Circle Line Polyline Image Text Path TextPath EsriPath Surface createSurface fixTarget".split(" "), function(a) {
                                m[a] = d[a]
                            }), "string" == typeof b ? m.renderer = b : a.some(["svg", "vml", "canvas", "canvasWithEvents", "silverlight"], function(a) {
                                return m.renderer = m[a] && m[a].Surface === m.Surface ? a : null
                            }))
                        }
                    });
                    return m
                })
        },
        "dojox/gfx/renderer": function() {
            define(["./_base", "dojo/_base/lang",
                "dojo/_base/sniff", "dojo/_base/window", "dojo/_base/config"
            ], function(h, k, c, e, b) {
                var a = null;
                c.add("vml", function(a, b, c) {
                    c.innerHTML = '\x3cv:shape adj\x3d"1"/\x3e';
                    a = "adj" in c.firstChild;
                    c.innerHTML = "";
                    return a
                });
                return {
                    load: function(f, g, l) {
                        function m() {
                            g(["dojox/gfx/" + n], function(b) {
                                h.renderer = n;
                                a = b;
                                l(b)
                            })
                        }
                        if (a && "force" != f) l(a);
                        else {
                            var n = b.forceGfxRenderer;
                            f = !n && (k.isString(b.gfxRenderer) ? b.gfxRenderer : "svg,vml,canvas,silverlight").split(",");
                            for (var d, q; !n && f.length;) switch (f.shift()) {
                                case "svg":
                                    "SVGAngle" in
                                    e.global && (n = "svg");
                                    break;
                                case "vml":
                                    c("vml") && (n = "vml");
                                    break;
                                case "silverlight":
                                    try {
                                        c("ie") ? (d = new ActiveXObject("AgControl.AgControl")) && d.IsVersionSupported("1.0") && (q = !0) : navigator.plugins["Silverlight Plug-In"] && (q = !0)
                                    } catch (t) {
                                        q = !1
                                    } finally {
                                        d = null
                                    }
                                    q && (n = "silverlight");
                                    break;
                                case "canvas":
                                    e.global.CanvasRenderingContext2D && (n = "canvas")
                            }
                            "canvas" === n && !1 !== b.canvasEvents && (n = "canvasWithEvents");
                            b.isDebug && console.log("gfx renderer \x3d " + n);
                            "svg" == n && "undefined" != typeof window.svgweb ? window.svgweb.addOnLoad(m) :
                                m()
                        }
                    }
                }
            })
        },
        "esri/views/2d/engine/Container": function() {
            define(["./DisplayObject", "./bitFlagUtil"], function(h, k) {
                return h.createSubclass({
                    declaredClass: "esri.views.2D.engine.Container",
                    "-chains-": {
                        childAdded: "after",
                        childRemoved: "after"
                    },
                    constructor: function() {
                        this.children = [];
                        this.trash = {
                            children: [],
                            ids: {}
                        }
                    },
                    tag: "inherit",
                    _stageSetter: function(c) {
                        var e = this._get("stage"),
                            b = this.children,
                            a, f;
                        this.inherited(arguments);
                        if (e !== c) {
                            if (b) {
                                a = 0;
                                for (f = b.length; a < f; a++) e = b[a], e.stage = c
                            }
                            return this._set("stage",
                                c)
                        }
                    },
                    _numChildrenGetter: function() {
                        return this.children.length
                    },
                    addChild: function(c) {
                        return this.addChildAt(c, this.children.length)
                    },
                    addChildAt: function(c, e) {
                        var b;
                        if (this.contains(c)) return c;
                        (b = c.parent) && b.removeChild(c);
                        e = Math.min(this.children.length, e);
                        this.children.splice(e, 0, c);
                        this.trash.ids[c.id] && (this.trash.ids[c.id] = null, this.trash.children.splice(this.trash.children.indexOf(c), 1));
                        this.childAdded(c, e);
                        this.notifyChange("numChildren");
                        return c
                    },
                    childAdded: function(c, e) {
                        c.set({
                            parent: this,
                            stage: this.stage
                        });
                        this.requestRender()
                    },
                    removeAllChildren: function() {
                        for (var c = this.numChildren; c--;) this.removeChildAt(0)
                    },
                    removeChild: function(c) {
                        var e = this.children.indexOf(c);
                        return -1 < e ? this.removeChildAt(e) : c
                    },
                    removeChildAt: function(c) {
                        if (0 > c || c >= this.children.length) return null;
                        c = this.children.splice(c, 1)[0];
                        this.trash.ids[c.id] = c;
                        this.trash.children.push(c);
                        this.childRemoved(c);
                        this.notifyChange("numChildren");
                        return c
                    },
                    childRemoved: function(c) {
                        c.parent = null;
                        c.stage = null;
                        this.requestRender()
                    },
                    contains: function(c) {
                        return -1 < this.getChildIndex(c)
                    },
                    getChildIndex: function(c) {
                        return this.children.indexOf(c)
                    },
                    getChildAt: function(c) {
                        return 0 > c || c > this.children.length ? null : this.children[c]
                    },
                    setChildIndex: function(c, e) {
                        var b = this.getChildIndex(c); - 1 < b && (this.children.splice(b, 1), this.children.splice(e, 0, c), this.requestRender())
                    },
                    requestChildRender: function(c) {
                        c && c.parent === this && this.requestRender()
                    },
                    reflow: function(c) {
                        var e = this.children,
                            b = e.length,
                            a;
                        c.emptyTrash(this);
                        c.pushParent(this);
                        for (a =
                            0; a < b; a++) c.reflowChild(e[a], a);
                        c.popParent()
                    },
                    render: function(c) {
                        var e = this._flags;
                        this._renderFlag = !1;
                        this._flags = 0;
                        e && (k.isSet(e, h.SIZE) && c.setSize(this.width, this.height), k.isSet(e, h.VISIBLE) && c.setVisibility(this.visible), k.isSet(e, h.BLENDMODE) && c.setBlendMode(this.blendMode), k.isSet(e, h.OPACITY) && c.setOpacity(this.opacity));
                        var b = (e = this.children) && e.length || 0,
                            a;
                        c.pushParent(this);
                        for (a = 0; a < b; a++) c.pushMatrix(), c.renderChild(e[a]), c.popMatrix();
                        c.popParent()
                    }
                })
            })
        },
        "esri/views/2d/engine/DisplayObject": function() {
            define("dojo/_base/lang ../../../core/Accessor ../math/common ../math/mat2d ../math/vec2 ./bitFlagUtil".split(" "),
                function(h, k, c, e, b, a) {
                    var f = 0,
                        g = 0,
                        l = {
                            TRANSFORM: 1 << g++,
                            VISIBLE: 1 << g++,
                            SIZE: 1 << g++,
                            BLENDMODE: 1 << g++,
                            CLIP: 1 << g++,
                            OPACITY: 1 << g++
                        },
                        m = "multiply screen overlay darken lighten color-dodge color-burn hard-light soft-light difference exclusion hue saturation color luminosity".split(" "),
                        n = k.createSubclass({
                            declaredClass: "esri.views.2d.engine.DisplayObject",
                            tag: null,
                            className: "esri-display-object",
                            constructor: function() {
                                this.id = "esri-display-object-" + f++
                            },
                            _flags: 0,
                            _renderFlag: !1,
                            _flipY: !0,
                            properties: {
                                blendMode: {
                                    value: "normal",
                                    cast: function(a) {
                                        return -1 < m.indexOf(a) ? a : "normal"
                                    },
                                    set: function(a) {
                                        this._invalidateFlag(l.BLENDMODE);
                                        this._set("blendMode", a)
                                    }
                                },
                                coords: {
                                    set: function(a) {
                                        this._invalidateFlag(l.TRANSFORM);
                                        this._set("coords", a)
                                    }
                                },
                                opacity: {
                                    value: 1,
                                    cast: function(a) {
                                        return Math.min(1, Math.max(a, 0))
                                    },
                                    set: function(a) {
                                        this._get("opacity") !== a && (this._invalidateFlag(l.OPACITY), this._set("opacity", a))
                                    }
                                },
                                parent: {
                                    value: null,
                                    set: function(a) {
                                        this._get("parent") !== a && (a && this._renderFlag && a.requestChildRender(this), this._set("parent",
                                            a))
                                    }
                                },
                                resolution: {
                                    value: NaN,
                                    set: function(a) {
                                        this._get("resolution") !== a && (this._invalidateFlag(l.TRANSFORM), this._set("resolution", a))
                                    }
                                },
                                rotation: {
                                    value: 0,
                                    set: function(a) {
                                        this._get("rotation") !== a && (this._invalidateFlag(l.TRANSFORM), this._set("rotation", a || 0))
                                    }
                                },
                                size: {
                                    value: null,
                                    set: function(a) {
                                        this._get("size") !== a && (this._invalidateFlag(l.SIZE), this._set("size", a))
                                    }
                                },
                                stage: {},
                                surface: {},
                                transform: {
                                    readOnly: !0,
                                    dependsOn: ["rotation", "coords", "resolution", "size"],
                                    get: function() {
                                        var a = this._get("transform"),
                                            f = this.coords,
                                            g = this.size,
                                            l = this.resolution,
                                            h = this.rotation;
                                        if (f)
                                            if (l) {
                                                if (!a || 6 !== a.length) a = e.create();
                                                g && e.translate(a, a, g);
                                                e.scale(a, a, b.fromValues(1 / l, (this._flipY ? -1 : 1) * (1 / l)));
                                                e.rotate(a, a, c.toRadian(h));
                                                e.translate(a, a, b.negate(b.create(), f))
                                            } else {
                                                if (!a || 2 !== a.length) return b.clone(f);
                                                b.copy(a, f)
                                            } else if (h) {
                                            if (!a || 6 !== a.length) a = e.create();
                                            e.rotate(a, a, c.toRadian(h))
                                        }
                                        return a
                                    }
                                },
                                visible: {
                                    value: !0,
                                    set: function(a) {
                                        this._get("visible") !== a && (this._invalidateFlag(l.VISIBLE), this._set("visible",
                                            a))
                                    }
                                }
                            },
                            requestRender: function() {
                                var a = this.parent;
                                this._renderFlag || (this._renderFlag = !0, a && a.requestChildRender(this))
                            },
                            createSurface: function() {
                                if (!this.surface) {
                                    var a = document.createElement("div");
                                    a.className = this.className;
                                    this.surface = a
                                }
                                return this.surface
                            },
                            reflow: function(a) {},
                            render: function(b) {
                                var c = this._flags;
                                this._renderFlag = !1;
                                this._flags = 0;
                                c && (a.isSet(c, n.SIZE) && b.setSize(this.width, this.height), a.isSet(c, n.VISIBLE) && b.setVisibility(this.visible), a.isSet(c, n.BLENDMODE) && b.setBlendMode(this.blendMode),
                                    a.isSet(c, n.OPACITY) && b.setOpacity(this.opacity))
                            },
                            _invalidateFlag: function(b) {
                                this._flags = a.set(this._flags, b, !0);
                                this.requestRender()
                            }
                        });
                    h.mixin(n, l);
                    return n
                })
        },
        "esri/views/2d/engine/bitFlagUtil": function() {
            define([], function() {
                return {
                    isSet: function(h, k) {
                        return k == (h & k)
                    },
                    set: function(h, k, c) {
                        if (c) {
                            if ((h & k) === k) return h;
                            h |= k
                        } else {
                            if (0 === (h & k)) return h;
                            h &= ~k
                        }
                        return h
                    }
                }
            })
        },
        "esri/views/layers/GraphicsView": function() {
            define(["../../core/Accessoire", "../../core/declare"], function(h, k) {
                return k([h], {
                    declaredClass: "esri.views.layers.GraphicsView",
                    graphics: null,
                    renderer: null,
                    view: null,
                    getRenderer: function(c) {
                        if (!c || c.symbol) return null;
                        var e = this._rndForScale || this.renderer;
                        c && (e && e.getObservationRenderer) && (e = e.getObservationRenderer(c));
                        return e
                    },
                    getSymbol: function(c) {
                        if (c.symbol) return c.symbol;
                        var e = this.getRenderer(c);
                        return e && e.getSymbol(c)
                    },
                    getRenderingInfo: function(c) {
                        var e = this.getRenderer(c),
                            b = this.getSymbol(c);
                        if (!b) return null;
                        b = {
                            renderer: e,
                            symbol: b
                        };
                        if (e && e.visualVariables) {
                            var a = this.view.view.state,
                                e = e.getVisualVariableValues(c, {
                                    resolution: a.resolution,
                                    scale: a.scale
                                });
                            c = ["proportional", "proportional", "proportional"];
                            for (a = 0; a < e.length; a++) {
                                var f = e[a],
                                    g = f.variable.type;
                                "color" === g ? b.color = f.value : "size" === g ? f.variable.target ? b.outlineSize = f.value : (g = f.variable.axis, f = f.variable.useSymbolValue ? "symbolValue" : f.value, "width" === g ? c[0] = f : "depth" === g ? c[1] = f : "height" === g ? c[2] = f : c[0] = "width-and-depth" === g ? c[1] = f : c[1] = c[2] = f) : "opacity" === g ? b.opacity = f.value : "rotation" === g && (b.rotationAngle = f.value)
                            }
                            if (isFinite(c[0]) || isFinite(c[1]) ||
                                isFinite(c[2])) b.size = c
                        }
                        return b
                    },
                    _evalSDRenderer: function(c) {}
                })
            })
        },
        "esri/views/2d/layers/LayerView2D": function() {
            define(["../../layers/LayerView", "../../../core/watchUtils", "../engine/Container"], function(h, k, c) {
                return h.createSubclass({
                    declaredClass: "esri.views.2d.layers.LayerView2D",
                    classMetadata: {
                        properties: {
                            suspended: {
                                dependsOn: ["view.scale", "layer.minScale", "layer.maxScale"]
                            }
                        }
                    },
                    constructor: function(e) {
                        this.container = new c({
                            visible: !1
                        });
                        this.watch("suspended", this._suspendedWatcher.bind(this));
                        this._opacityWatch = this.watch("layer.opacity", function(b) {
                            this.container.opacity = b
                        }.bind(this));
                        this._opacityWatch = this.watch("layer.blendMode", function(b) {
                            this.container.blendMode = b
                        }.bind(this))
                    },
                    destroy: function() {
                        this._opacityWatch.remove();
                        this._opacityWatch = null;
                        this.updateNeeded = !1;
                        this.layer = null
                    },
                    _viewChangeHdl: null,
                    _viewSetter: function(c) {
                        this.inherited(arguments);
                        this._viewChangeHdl && (this._viewChangeHdl.remove(), this._viewChangeHdl = null);
                        c && (this._viewChangeHdl = k.when(c, "state.transform",
                            function(b) {
                                this.emit("view-change")
                            }.bind(this)));
                        return c
                    },
                    hitTest: function(c, b) {
                        return null
                    },
                    needUpdate: function() {
                        this.updateNeeded || (this.updateNeeded = !0, this.suspended || this.view.scheduleLayerViewUpdate(this))
                    },
                    _commitUpdate: function() {
                        this.updateNeeded && (this.updateNeeded = !1, this.update())
                    },
                    canResume: function() {
                        var c = this.inherited(arguments);
                        if (c) {
                            var c = this.view.scale,
                                b = this.layer,
                                a = b.minScale,
                                b = b.maxScale,
                                f = !a,
                                g = !b;
                            !f && c <= a && (f = !0);
                            !g && c >= b && (g = !0);
                            c = f && g
                        }
                        return c
                    },
                    _suspendedWatcher: function(c) {
                        this.container.visible = !c;
                        !c && this.updateNeeded && this.view.scheduleLayerViewUpdate(this)
                    }
                })
            })
        },
        "esri/views/2d/VectorGroup": function() {
            define("../../core/declare dojo/_base/lang dojox/gfx dojox/gfx/matrix ./math/common ./math/mat2d ./math/vec2 ./Projector ../../geometry/Polygon ../../symbols/SimpleMarkerSymbol ../../symbols/support/gfxUtils ../../core/screenUtils ../../core/Accessoire".split(" "), function(h, k, c, e, b, a, f, g, l, m, n, d, q) {
                var t = 0,
                    p = -1 !== c.renderer.toLowerCase().indexOf("svg"),
                    A = {
                        "picture-marker-symbol": "image",
                        "picture-fill-symbol": "path",
                        "simple-fill-symbol": "path",
                        "simple-line-symbol": "path",
                        "cartographic-line-symbol": "path",
                        "text-symbol": "text"
                    },
                    r = {
                        square: 1,
                        cross: 1,
                        x: 1,
                        diamond: 1,
                        target: 1
                    };
                return h(q, {
                    declaredClass: "esri.views.2d.VectorGroup",
                    constructor: function(b) {
                        this.id = "vecgp" + t++;
                        this._transform = a.create();
                        this._projector = new g;
                        this.vectors = [];
                        this.adding = [];
                        this.removing = [];
                        this.updating = []
                    },
                    applyState: function(b) {
                        if (this.transform) {
                            var d = a.invert(this._transform, this.transform);
                            a.multiply(d, b.transformNoRotation,
                                d);
                            this.surface.setTransform({
                                xx: d[0],
                                yx: d[1],
                                xy: d[2],
                                yy: d[3],
                                dx: d[4],
                                dy: d[5]
                            })
                        }
                    },
                    requestVectorDraw: function(a) {},
                    addVector: function(a) {
                        return this.addVectorAt(a, this.vectors.length)
                    },
                    addVectorAt: function(a, b) {
                        b = Math.min(this.vectors.length, b);
                        this.vectors.splice(b, 0, a);
                        a.set({
                            parent: this,
                            view: this.view
                        });
                        return a
                    },
                    removeVector: function(a) {
                        if (!this.vectors) return a;
                        var b = this.vectors.indexOf(a); - 1 < b && (a = this.vectors.splice(b, 1)[0], a.set({
                            parent: null,
                            view: null
                        }), this._removeShape(a));
                        return a
                    },
                    draw: function() {
                        this.transform ||
                            this._updateTransform();
                        this.surface.openBatch();
                        var a, b, d;
                        b = 0;
                        for (d = this.vectors.length; b < d; b++)(a = this.vectors[b]) && this.drawVector(a);
                        this.surface.closeBatch()
                    },
                    drawVector: function(a, b) {
                        var d = a.extent,
                            c = a.shape,
                            f, g, e, l = a.geometry,
                            h = a.projectedGeometry;
                        if (a.graphic.visible && d && (f = this._intersects(this._map, d, l._originOnly)) && (g = a.symbol)) {
                            if (a.resolution !== this.resolution || a.rotation !== this.rotation || !a.offsets || a.offsets.join(",") !== f.join(",") ? a.offsets = f : e = !0, !c || b || !e) d = l.type, a.resolution =
                                this.resolution, a.rotation = this.rotation, "point" === d ? (this._isInvalidShape(g, c) && this._removeShape(a), c = a.shape = this._drawPoint(this.surface, h || l, g, a, f), this._stylePoint(a, g)) : "multipoint" === d ? (c = a.shape = this._drawMarkers(this.surface, h || l, g, a, f), this._styleMarkers(a, g)) : g && (this._isInvalidShape(g, c) && this._removeShape(a, !1), c = a.shape = this._drawShape(this.surface, h || l, a, f), this._styleShape(a, g)), c.getNode().vector = a
                        } else c && this._removeShape(a)
                    },
                    _intersects: function(a, b, d) {
                        return [0]
                    },
                    _isInvalidShape: function(a,
                        b) {
                        var d = b && b.shape && b.shape.type,
                            c = a && a.type,
                            f = a && a.style;
                        c && (f = A[c] || f);
                        r[f] && (f = "path");
                        return !(!d || !(f && d !== f))
                    },
                    _removeShape: function(a, b) {
                        var d = a.shape,
                            c = d && d.getNode();
                        d && (d.removeShape(), d.destroy());
                        a.shape = a.offsets = null;
                        !1 !== b && this._removeBgShape(a);
                        c && (c.e_graphic = null)
                    },
                    _removeBgShape: function(a) {
                        var b = a.bgShape,
                            d = b && b.getNode();
                        b && (b.removeShape(), b.destroy());
                        a.bgShape = null;
                        d && (d.e_graphic = null)
                    },
                    _drawPoint: function(a, c, g, l, h, w) {
                        var C = g.type;
                        c = f.fromValues(c.x, c.y);
                        var k = f.transformMat2d(c,
                            c, this.transform);
                        c = Math.round(k[0]);
                        var q = Math.round(k[1]),
                            t = null != w ? l.shape && l.shape.children[w] : l.shape,
                            r;
                        w = [];
                        var A = l.rotationAngle,
                            x;
                        if (l = l.size) l = isFinite(l[0]) && l[0], x = !!l;
                        l = x ? d.pt2px(l) : null;
                        k = {
                            x: k[0],
                            y: k[1]
                        };
                        if (null == A) {
                            var K = b.toRadian(360 - this.view.rotation);
                            w.push(e.rotateAt(K, k))
                        }
                        A && w.push(e.rotategAt(A, k));
                        A = d.pt2px(g.xoffset);
                        K = d.pt2px(g.yoffset);
                        (0 !== A || 0 !== K) && w.push(e.translate(A, -K));
                        0 !== g.angle && w.push(e.rotategAt(g.angle, k));
                        if ("simple-marker-symbol" === C) switch (r = g.style, C = Math.round,
                                l = x ? l : d.pt2px(g.size), r) {
                                case m.STYLE_SQUARE:
                                case m.STYLE_CROSS:
                                case m.STYLE_X:
                                case m.STYLE_DIAMOND:
                                    g = isNaN(l) ? 16 : l / 2;
                                    r = this._drawPath(a, t, this._smsToPath(m, r, c, q, C(c - g), C(c + g), C(q - g), C(q + g)));
                                    break;
                                case m.STYLE_TARGET:
                                    x = d.pt2px(g._targetWidth) / 2;
                                    k = d.pt2px(g._targetHeight) / 2;
                                    r = this._drawPath(a, t, this._smsToPath(m, r, c, q, C(c - x), C(c + x), C(q - k), C(q + k), d.pt2px(g._spikeSize)));
                                    break;
                                case m.STYLE_PATH:
                                    r = this._drawPath(a, t, g.path, !0);
                                    g = r.getBoundingBox();
                                    a = this._getScaleMatrix(g, l);
                                    (1 !== a.xx || 1 !== a.yy) && w.push(e.scaleAt(a.xx,
                                        a.yy, k));
                                    w.push(e.translate(-(g.x + g.width / 2) + c, -(g.y + g.height / 2) + q));
                                    break;
                                default:
                                    g = isNaN(l) ? 16 : l / 2, r = this._drawCircle(a, t, {
                                        cx: c,
                                        cy: q,
                                        r: g
                                    })
                            } else if ("shield-label-symbol" === C) k = d.pt2px(g.width), x = d.pt2px(g.height), r = a.createGroup(), t = a.createImage({
                                x: c - k / 2,
                                y: q - x / 2,
                                width: k,
                                height: x,
                                src: g.url
                            }), r.add(t), null != g.font && (q += 0.2 * d.pt2px(g.getHeight()), a = a.createText({
                                    type: "text",
                                    text: g.text,
                                    x: c,
                                    y: q,
                                    align: "middle",
                                    decoration: g.decoration,
                                    rotated: g.rotated,
                                    kerning: g.kerning
                                }), x = g.font.clone(), x.size = d.pt2px(x.size),
                                a.setFont(x), a.setFill(g.color), r.add(a));
                            else if ("picture-marker-symbol" === C) k = x ? l : d.pt2px(g.width), x = x ? l : d.pt2px(g.height), r = this._drawImage(a, t, {
                            x: c - k / 2,
                            y: q - x / 2,
                            width: k,
                            height: x,
                            src: g.url
                        });
                        else if ("text-symbol" === C) {
                            if (x = g.font) x = x.clone(), x.size = null != l ? l : d.pt2px(x.size);
                            r = this._drawText(a, t, {
                                type: "text",
                                text: g.text,
                                x: c,
                                y: q,
                                align: n.getSVGAlign(g),
                                decoration: g.decoration || x && x.decoration,
                                rotated: g.rotated,
                                kerning: g.kerning
                            });
                            x && r.setFont(x);
                            p && (a = r.getNode(), c = n.getSVGBaseline(g), g = n.getSVGBaselineShift(g),
                                a && (a.setAttribute("dominant-baseline", c), g && a.setAttribute("baseline-shift", g)))
                        }
                        r.setTransform(e.multiply(w));
                        r._wrapOffsets = h;
                        return r
                    },
                    _getScaleMatrix: function(a, b) {
                        var d = a.width / a.height,
                            c = 1,
                            g = 1;
                        isNaN(b) || (1 < d ? (c = b / a.width, g = b / d / a.height) : (g = b / a.height, c = b * d / a.width));
                        return {
                            xx: c,
                            yy: g
                        }
                    },
                    _drawMarkers: function(a, b, d, c, g) {
                        var f = b.points;
                        a = c.shape || a.createGroup();
                        var e, l, h = f.length,
                            m = [],
                            k = 0,
                            q, p = g ? g.length : 0;
                        a.children[0] && this._isInvalidShape(d, a.children[0]) && a.clear();
                        for (l = 0; l < h; l++) {
                            e = f[l];
                            for (q = 0; q < p; q++) m[0] = g[q], a.add(this._drawPoint(a, {
                                x: e[0],
                                y: e[1],
                                spatialReference: b.spatialReference
                            }, d, c, m, k++))
                        }
                        b = a.children.length;
                        if (h * g.length < b)
                            for (l = b - 1; l >= h * g.length; l--) a.children[l].removeShape();
                        return a
                    },
                    _drawShape: function(a, b, d, c) {
                        var g = b.type;
                        d = d.shape;
                        var f = this._projector,
                            e = [],
                            h, m;
                        "extent" === g && (b = l.fromExtent(b), g = b.type);
                        if ("polyline" === g || "polygon" === g) {
                            h = 0;
                            for (m = c.length; h < m; h++) e = e.concat(f.toScreenPath(b, c[h]));
                            d = this._drawPath(a, d, e);
                            this._rendererLimits && ("polyline" === g ? this._clipPolyline(d,
                                b) : this._clipPolygon(d, b))
                        }
                        return d
                    },
                    _drawRect: function(a, b, d) {
                        return b ? b.setShape(d) : a.createRect(d)
                    },
                    _drawImage: function(a, b, d) {
                        return b ? b.setShape(d) : a.createImage(d)
                    },
                    _drawCircle: function(a, b, d) {
                        return b ? b.setShape(d) : a.createCircle(d)
                    },
                    _drawPath: function(a, b, d, c) {
                        d = c ? d : d.join(" ");
                        return b ? b.setShape(d) : a.createPath(d)
                    },
                    _drawText: function(a, b, d) {
                        return b ? b.setShape(d) : a.createText(d)
                    },
                    _smsToPath: function(a, b, d, c, g, f, e, l, h) {
                        switch (b) {
                            case a.STYLE_SQUARE:
                                return ["M", g + "," + e, f + "," + e, f + "," + l, g + "," +
                                    l, "Z"
                                ];
                            case a.STYLE_CROSS:
                                return ["M", d + "," + e, d + "," + l, "M", g + "," + c, f + "," + c];
                            case a.STYLE_X:
                                return ["M", g + "," + e, f + "," + l, "M", g + "," + l, f + "," + e];
                            case a.STYLE_DIAMOND:
                                return ["M", d + "," + e, f + "," + c, d + "," + l, g + "," + c, "Z"];
                            case a.STYLE_TARGET:
                                return ["M", g + "," + e, f + "," + e, f + "," + l, g + "," + l, g + "," + e, "M", g - h + "," + c, g + "," + c, "M", d + "," + (e - h), d + "," + e, "M", f + h + "," + c, f + "," + c, "M", d + "," + (l + h), d + "," + l]
                        }
                    },
                    _stylePoint: function(a, b, d) {
                        var c = b.type,
                            g = b.style;
                        d = null != d ? a.shape && a.shape.children[d] : a.shape;
                        if (!("shield-label-symbol" === c ||
                                "picture-marker-symbol" === c)) {
                            var f = n.getStroke(b);
                            b = n.getFill(b);
                            var g = g === m.STYLE_X || g === m.STYLE_CROSS,
                                e = f && f.color,
                                l = a.color || (g ? e : b);
                            a = a.opacity;
                            l && null != a && (l = this._applyOpacity(l, a));
                            l && (g ? l !== e && (f = f ? k.mixin({}, f) : {}, f.color = l) : l !== b && (b = l));
                            "text-symbol" === c ? d.setFill(b) : "simple-marker-symbol" === c && d.setFill(b).setStroke(f)
                        }
                    },
                    _styleMarkers: function(a, b) {
                        var d, c = a.shape.children.length;
                        for (d = 0; d < c; d++) this._stylePoint(a, b, d)
                    },
                    _styleShape: function(a, b) {
                        var c = n.getStroke(b),
                            g = n.getFill(b),
                            f =
                            b.type,
                            e = a.shape,
                            l = a.outlineSize,
                            h = -1 !== f.indexOf("line-symbol"),
                            m = h ? "none" !== b.style : b.outline && "none" !== b.outline.style,
                            q, t, r;
                        l && Array.isArray(l) && (l = isFinite(l[0]) && l[0]);
                        l = null != l ? d.pt2px(l) : null;
                        if ((a.color || null != a.opacity) && "picture-fill-symbol" !== f) f = a.color, q = a.opacity, h ? (t = f || c && c.color) && null != q && (t = this._applyOpacity(t, q)) : g && g.toCss && (r = f || g) && null != q && (r = this._applyOpacity(r, q));
                        e.setStroke(!m || null == l && !t ? c : k.mixin({}, c, null != l ? {
                            width: l
                        } : null, t && {
                            color: t
                        })).setFill(r || g);
                        p && e.rawNode.setAttribute("vector-effect",
                            "non-scaling-stroke")
                    },
                    _applyOpacity: function(a, b) {
                        null != b && (a = a.clone(), a.a = b);
                        return a
                    },
                    _updateTransform: function() {
                        var b = this.transform = this.transform || a.create(),
                            d = this.resolution,
                            c = f.fromValues(0.5 * this.view.width, 0.5 * this.view.height),
                            g = f.fromValues(1 / d, -1 / d),
                            e = f.fromValues(-this.x, -this.y);
                        a.identity(b);
                        a.translate(b, b, c);
                        a.scale(b, b, g);
                        a.translate(b, b, e);
                        b[4] = Math.round(b[4]);
                        b[5] = Math.round(b[5]);
                        this._projector.set({
                            resolution: d,
                            transform: b
                        })
                    }
                })
            })
        },
        "dojox/gfx/matrix": function() {
            define(["./_base",
                "dojo/_base/lang"
            ], function(h, k) {
                var c = h.matrix = {},
                    e = {};
                c._degToRad = function(b) {
                    return e[b] || (e[b] = Math.PI * b / 180)
                };
                c._radToDeg = function(b) {
                    return 180 * (b / Math.PI)
                };
                c.Matrix2D = function(b) {
                    if (b)
                        if ("number" == typeof b) this.xx = this.yy = b;
                        else if (b instanceof Array) {
                        if (0 < b.length) {
                            for (var a = c.normalize(b[0]), f = 1; f < b.length; ++f) {
                                var g = a,
                                    e = c.normalize(b[f]),
                                    a = new c.Matrix2D;
                                a.xx = g.xx * e.xx + g.xy * e.yx;
                                a.xy = g.xx * e.xy + g.xy * e.yy;
                                a.yx = g.yx * e.xx + g.yy * e.yx;
                                a.yy = g.yx * e.xy + g.yy * e.yy;
                                a.dx = g.xx * e.dx + g.xy * e.dy + g.dx;
                                a.dy =
                                    g.yx * e.dx + g.yy * e.dy + g.dy
                            }
                            k.mixin(this, a)
                        }
                    } else k.mixin(this, b)
                };
                k.extend(c.Matrix2D, {
                    xx: 1,
                    xy: 0,
                    yx: 0,
                    yy: 1,
                    dx: 0,
                    dy: 0
                });
                k.mixin(c, {
                    identity: new c.Matrix2D,
                    flipX: new c.Matrix2D({
                        xx: -1
                    }),
                    flipY: new c.Matrix2D({
                        yy: -1
                    }),
                    flipXY: new c.Matrix2D({
                        xx: -1,
                        yy: -1
                    }),
                    translate: function(b, a) {
                        return 1 < arguments.length ? new c.Matrix2D({
                            dx: b,
                            dy: a
                        }) : new c.Matrix2D({
                            dx: b.x,
                            dy: b.y
                        })
                    },
                    scale: function(b, a) {
                        return 1 < arguments.length ? new c.Matrix2D({
                            xx: b,
                            yy: a
                        }) : "number" == typeof b ? new c.Matrix2D({
                            xx: b,
                            yy: b
                        }) : new c.Matrix2D({
                            xx: b.x,
                            yy: b.y
                        })
                    },
                    rotate: function(b) {
                        var a = Math.cos(b);
                        b = Math.sin(b);
                        return new c.Matrix2D({
                            xx: a,
                            xy: -b,
                            yx: b,
                            yy: a
                        })
                    },
                    rotateg: function(b) {
                        return c.rotate(c._degToRad(b))
                    },
                    skewX: function(b) {
                        return new c.Matrix2D({
                            xy: Math.tan(b)
                        })
                    },
                    skewXg: function(b) {
                        return c.skewX(c._degToRad(b))
                    },
                    skewY: function(b) {
                        return new c.Matrix2D({
                            yx: Math.tan(b)
                        })
                    },
                    skewYg: function(b) {
                        return c.skewY(c._degToRad(b))
                    },
                    reflect: function(b, a) {
                        1 == arguments.length && (a = b.y, b = b.x);
                        var f = b * b,
                            g = a * a,
                            e = f + g,
                            h = 2 * b * a / e;
                        return new c.Matrix2D({
                            xx: 2 * f / e -
                                1,
                            xy: h,
                            yx: h,
                            yy: 2 * g / e - 1
                        })
                    },
                    project: function(b, a) {
                        1 == arguments.length && (a = b.y, b = b.x);
                        var f = b * b,
                            g = a * a,
                            e = f + g,
                            h = b * a / e;
                        return new c.Matrix2D({
                            xx: f / e,
                            xy: h,
                            yx: h,
                            yy: g / e
                        })
                    },
                    normalize: function(b) {
                        return b instanceof c.Matrix2D ? b : new c.Matrix2D(b)
                    },
                    isIdentity: function(b) {
                        return 1 == b.xx && 0 == b.xy && 0 == b.yx && 1 == b.yy && 0 == b.dx && 0 == b.dy
                    },
                    clone: function(b) {
                        var a = new c.Matrix2D,
                            f;
                        for (f in b) "number" == typeof b[f] && ("number" == typeof a[f] && a[f] != b[f]) && (a[f] = b[f]);
                        return a
                    },
                    invert: function(b) {
                        b = c.normalize(b);
                        var a = b.xx *
                            b.yy - b.xy * b.yx;
                        return b = new c.Matrix2D({
                            xx: b.yy / a,
                            xy: -b.xy / a,
                            yx: -b.yx / a,
                            yy: b.xx / a,
                            dx: (b.xy * b.dy - b.yy * b.dx) / a,
                            dy: (b.yx * b.dx - b.xx * b.dy) / a
                        })
                    },
                    _multiplyPoint: function(b, a, c) {
                        return {
                            x: b.xx * a + b.xy * c + b.dx,
                            y: b.yx * a + b.yy * c + b.dy
                        }
                    },
                    multiplyPoint: function(b, a, f) {
                        b = c.normalize(b);
                        return "number" == typeof a && "number" == typeof f ? c._multiplyPoint(b, a, f) : c._multiplyPoint(b, a.x, a.y)
                    },
                    multiplyRectangle: function(b, a) {
                        var f = c.normalize(b);
                        a = a || {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0
                        };
                        if (c.isIdentity(f)) return {
                            x: a.x,
                            y: a.y,
                            width: a.width,
                            height: a.height
                        };
                        var g = c.multiplyPoint(f, a.x, a.y),
                            e = c.multiplyPoint(f, a.x, a.y + a.height),
                            h = c.multiplyPoint(f, a.x + a.width, a.y),
                            k = c.multiplyPoint(f, a.x + a.width, a.y + a.height),
                            f = Math.min(g.x, e.x, h.x, k.x),
                            d = Math.min(g.y, e.y, h.y, k.y),
                            q = Math.max(g.x, e.x, h.x, k.x),
                            g = Math.max(g.y, e.y, h.y, k.y);
                        return {
                            x: f,
                            y: d,
                            width: q - f,
                            height: g - d
                        }
                    },
                    multiply: function(b) {
                        for (var a = c.normalize(b), f = 1; f < arguments.length; ++f) {
                            var g = a,
                                e = c.normalize(arguments[f]),
                                a = new c.Matrix2D;
                            a.xx = g.xx * e.xx + g.xy * e.yx;
                            a.xy = g.xx * e.xy + g.xy * e.yy;
                            a.yx =
                                g.yx * e.xx + g.yy * e.yx;
                            a.yy = g.yx * e.xy + g.yy * e.yy;
                            a.dx = g.xx * e.dx + g.xy * e.dy + g.dx;
                            a.dy = g.yx * e.dx + g.yy * e.dy + g.dy
                        }
                        return a
                    },
                    _sandwich: function(b, a, f) {
                        return c.multiply(c.translate(a, f), b, c.translate(-a, -f))
                    },
                    scaleAt: function(b, a, f, g) {
                        switch (arguments.length) {
                            case 4:
                                return c._sandwich(c.scale(b, a), f, g);
                            case 3:
                                return "number" == typeof f ? c._sandwich(c.scale(b), a, f) : c._sandwich(c.scale(b, a), f.x, f.y)
                        }
                        return c._sandwich(c.scale(b), a.x, a.y)
                    },
                    rotateAt: function(b, a, f) {
                        return 2 < arguments.length ? c._sandwich(c.rotate(b),
                            a, f) : c._sandwich(c.rotate(b), a.x, a.y)
                    },
                    rotategAt: function(b, a, f) {
                        return 2 < arguments.length ? c._sandwich(c.rotateg(b), a, f) : c._sandwich(c.rotateg(b), a.x, a.y)
                    },
                    skewXAt: function(b, a, f) {
                        return 2 < arguments.length ? c._sandwich(c.skewX(b), a, f) : c._sandwich(c.skewX(b), a.x, a.y)
                    },
                    skewXgAt: function(b, a, f) {
                        return 2 < arguments.length ? c._sandwich(c.skewXg(b), a, f) : c._sandwich(c.skewXg(b), a.x, a.y)
                    },
                    skewYAt: function(b, a, f) {
                        return 2 < arguments.length ? c._sandwich(c.skewY(b), a, f) : c._sandwich(c.skewY(b), a.x, a.y)
                    },
                    skewYgAt: function(b,
                        a, f) {
                        return 2 < arguments.length ? c._sandwich(c.skewYg(b), a, f) : c._sandwich(c.skewYg(b), a.x, a.y)
                    }
                });
                h.Matrix2D = c.Matrix2D;
                return c
            })
        },
        "esri/views/2d/Projector": function() {
            define(["../../core/Accessoire", "../../geometry/Polyline"], function(h, k) {
                var c = function(e, b) {
                    var a = e.length,
                        f = e[0],
                        g = e[a - 1],
                        l = 0,
                        h = 0,
                        k, d;
                    for (k = 1; k < a - 1; k++) {
                        d = e[k];
                        var q = f,
                            t = g,
                            p = void 0,
                            A = void 0,
                            p = void 0;
                        q[0] === t[0] ? p = Math.abs(d[0] - q[0]) : (p = (t[1] - q[1]) / (t[0] - q[0]), A = q[1] - p * q[0], p = Math.abs(p * d[0] - d[1] + A) / Math.sqrt(p * p + 1));
                        d = p;
                        d > l && (h = k,
                            l = d)
                    }
                    l > b ? (a = c(e.slice(0, h + 1), b), h = c(e.slice(h), b), h = a.concat(h)) : h = [f, g];
                    return h
                };
                return h.createSubclass({
                    _transformSetter: function(c) {
                        this._transformers = [];
                        return c
                    },
                    toScreenPoint: function(c, b, a) {
                        b = this.getTransformer(b);
                        a || (a = {
                            x: 0,
                            y: 0
                        });
                        b.transformPoint(c.x, c.y, function(b, c) {
                            a.x = b;
                            a.y = c
                        });
                        return a
                    },
                    toScreenPath: function(e, b) {
                        var a = e instanceof k ? e.paths : e.rings,
                            f = this.getTransformer(b),
                            g = [],
                            l, h, n = function(a, b) {
                                g.push(a + "," + b)
                            };
                        if (a) {
                            l = 0;
                            for (h = a.length; l < h; l++) g.push("M"), f.forEach(c(a[l], this.resolution),
                                n)
                        }
                        return g
                    },
                    getTransformer: function(c) {
                        if (!this._transformers[c]) {
                            var b = this.transform,
                                a = b[0],
                                f = b[1],
                                g = b[2],
                                l = b[3],
                                h = b[4] + c,
                                k = b[5],
                                d = 0 !== f && 0 !== g,
                                q, t, p = Math.round;
                            this._transformers[c] = {
                                transformPoint: function() {
                                    return d ? function(b, d, c) {
                                        c(p(a * b + g * d + h), p(f * b + l * d + k))
                                    } : function(b, d, c) {
                                        c(p(a * b + h), p(l * d + k))
                                    }
                                }(),
                                forEach: function(a, b) {
                                    q = 0;
                                    for (t = a.length; q < t; q++) this.transformPoint(a[q][0], a[q][1], b)
                                }
                            }
                        }
                        return this._transformers[c]
                    }
                })
            })
        },
        "esri/symbols/support/gfxUtils": function() {
            define(["require", "dojo/_base/lang",
                "dojox/gfx/_base", "../../core/screenUtils"
            ], function(h, k, c, e) {
                var b = h.toUrl("../../images/symbol/sfs/"),
                    a = {
                        left: "start",
                        center: "middle",
                        right: "end",
                        justify: "start"
                    },
                    f = {
                        top: "text-before-edge",
                        middle: "central",
                        baseline: "alphabetic",
                        bottom: "text-after-edge"
                    },
                    g = function(a) {
                        var d = null,
                            g = a.style;
                        if (a) {
                            var f = a.constructor;
                            switch (a.type) {
                                case "simple-marker-symbol":
                                    g !== f.STYLE_CROSS && g !== f.STYLE_X && (d = a.color);
                                    break;
                                case "simple-fill-symbol":
                                    g === f.STYLE_SOLID ? d = a.color : g !== f.STYLE_NULL && (d = k.mixin({}, c.defaultPattern, {
                                        src: b + g + ".png",
                                        width: 10,
                                        height: 10
                                    }));
                                    break;
                                case "picture-fill-symbol":
                                    d = k.mixin({}, c.defaultPattern, {
                                        src: a.url,
                                        width: e.pt2px(a.width) * a.xscale,
                                        height: e.pt2px(a.height) * a.yscale,
                                        x: e.pt2px(a.xoffset),
                                        y: e.pt2px(a.yoffset)
                                    });
                                    break;
                                case "text-symbol":
                                    d = a.color
                            }
                        }
                        return d
                    },
                    l = function d(a) {
                        var b = null;
                        if (a) {
                            var c = a.constructor,
                                g = e.pt2px(a.width);
                            switch (a.type) {
                                case "simple-fill-symbol":
                                case "picture-fill-symbol":
                                case "simple-marker-symbol":
                                    b = d(a.outline);
                                    break;
                                case "simple-line-symbol":
                                    a.style !== c.STYLE_NULL &&
                                        0 !== g && (b = {
                                            color: a.color,
                                            style: m(a.style),
                                            width: g
                                        });
                                    break;
                                case "cartographic-line-symbol":
                                    a.style !== c.STYLE_NULL && 0 !== g && (b = {
                                        color: a.color,
                                        style: m(a.style),
                                        width: g,
                                        cap: a.cap,
                                        join: a.join === c.JOIN_MITER ? e.pt2px(a.miterLimit) : a.join
                                    });
                                    break;
                                default:
                                    b = null
                            }
                        }
                        return b
                    },
                    m = function() {
                        var a = {};
                        return function(b) {
                            if (a[b]) return a[b];
                            var c = b.replace(/-/g, "");
                            return a[b] = c
                        }
                    }();
                return {
                    getFill: g,
                    getStroke: l,
                    getShapeDescriptors: function(a) {
                        if (!a) return {
                            defaultShape: null,
                            fill: null,
                            stroke: null
                        };
                        var b = {
                                fill: g(a),
                                stroke: l(a)
                            },
                            f = a.constructor,
                            h = f.defaultProps,
                            k = null;
                        switch (a.type) {
                            case "simple-marker-symbol":
                                var m = a.style,
                                    h = 0.5 * e.pt2px(a.size || h.size),
                                    s = -h,
                                    v = +h,
                                    u = -h,
                                    z = +h;
                                switch (m) {
                                    case f.STYLE_CIRCLE:
                                        k = {
                                            type: "circle",
                                            cx: 0,
                                            cy: 0,
                                            r: h
                                        };
                                        break;
                                    case f.STYLE_CROSS:
                                        k = {
                                            type: "path",
                                            path: "M " + s + ",0 L " + v + ",0 M 0," + u + " L 0," + z + " E"
                                        };
                                        break;
                                    case f.STYLE_DIAMOND:
                                        k = {
                                            type: "path",
                                            path: "M " + s + ",0 L 0," + u + " L " + v + ",0 L 0," + z + " L " + s + ",0 E"
                                        };
                                        break;
                                    case f.STYLE_SQUARE:
                                        k = {
                                            type: "path",
                                            path: "M " + s + "," + z + " L " + s + "," + u + " L " + v + "," + u + " L " + v + "," + z +
                                                " L " + s + "," + z + " E"
                                        };
                                        break;
                                    case f.STYLE_X:
                                        k = {
                                            type: "path",
                                            path: "M " + s + "," + z + " L " + v + "," + u + " M " + s + "," + u + " L " + v + "," + z + " E"
                                        };
                                        break;
                                    case f.STYLE_PATH:
                                        k = {
                                            type: "path",
                                            path: a.path || ""
                                        }
                                }
                                break;
                            case "simple-line-symbol":
                            case "cartographic-line-symbol":
                                k = {
                                    type: "path",
                                    path: "M -15,0 L 15,0 E"
                                };
                                break;
                            case "picture-fill-symbol":
                            case "simple-fill-symbol":
                                k = {
                                    type: "path",
                                    path: "M -10,-10 L 10,0 L 10,10 L -10,10 L -10,-10 E"
                                };
                                break;
                            case "picture-marker-symbol":
                                k = {
                                    type: "image",
                                    x: -Math.round(e.pt2px(a.width) / 2),
                                    y: -Math.round(e.pt2px(a.height) /
                                        2),
                                    width: e.pt2px(a.width),
                                    height: e.pt2px(a.height),
                                    src: a.source && a.source.imageData ? "data:" + a.source.contentType + ";base64," + a.source.imageData : a.url || ""
                                };
                                break;
                            case "text-symbol":
                                f = a.font, m = e.pt2px(f.size), k = {
                                    type: "text",
                                    text: a.text,
                                    x: 0,
                                    y: 0.25 * c.normalizedLength(f ? m : 0),
                                    align: "middle",
                                    decoration: a.decoration || f && f.decoration,
                                    rotated: a.rotated,
                                    kerning: a.kerning
                                }, b.font = f && {
                                    size: m,
                                    style: f.style,
                                    variant: f.variant,
                                    decoration: f.decoration,
                                    weight: f.weight,
                                    family: f.family
                                }
                        }
                        b.defaultShape = k;
                        return b
                    },
                    getSVGAlign: function(b) {
                        return b =
                            (b = b.horizontalAlignment) && a[b.toLowerCase()] || "middle"
                    },
                    getSVGBaseline: function(a) {
                        return (a = a.verticalAlignment) && f[a.toLowerCase()] || "alphabetic"
                    },
                    getSVGBaselineShift: function(a) {
                        return "bottom" === a.verticalAlignment ? "super" : null
                    }
                }
            })
        },
        "esri/views/2d/Vector": function() {
            define(["../../core/declare", "../../geometry/Extent", "../../core/Accessoire"], function(h, k, c) {
                var e = 0;
                return h([c], {
                    declaredClass: "esri.views.2d.Vector",
                    constructor: function() {
                        this.id = "vec" + e++
                    },
                    _graphicSetter: function(b, a) {
                        if (b ===
                            a) return a;
                        this.extent = b ? this._getGraphicExtent(b) : null;
                        this.graphicChanged();
                        return b
                    },
                    _symbolSetter: function(b, a) {
                        if (b === a) return a;
                        this._symbolChangeHandle && (this._symbolChangeHandle.remove(), this._symbolChangeHandle = null);
                        this.symbolChanged();
                        return b
                    },
                    _colorSetter: function(b, a) {
                        if (b === a) return a;
                        this.symbolChanged();
                        return b
                    },
                    _sizeSetter: function(b, a) {
                        if (b === a) return a;
                        this.symbolChanged();
                        return b
                    },
                    _opacitySetter: function(b, a) {
                        if (b === a) return a;
                        this.symbolChanged();
                        return b
                    },
                    _rotationAngleSetter: function(b,
                        a) {
                        if (b === a) return a;
                        this.symbolChanged();
                        return b
                    },
                    _outlineSizeSetter: function(b, a) {
                        if (b === a) return a;
                        this.symbolChanged();
                        return b
                    },
                    _geometrySetter: function(b, a) {
                        if (b === a) return a;
                        this.graphicChanged();
                        return b
                    },
                    _projectedGeometrySetter: function(b, a) {
                        if (b === a) return a;
                        this.graphicChanged();
                        return b
                    },
                    _parentSetter: function(b, a) {
                        if (b === a) return a;
                        b && this._requestDrawFlag && b.requestVectorDraw(this);
                        return b
                    },
                    graphicChanged: function() {
                        this._graphicChanged = !0;
                        this.requestDraw()
                    },
                    symbolChanged: function() {
                        this._symbolChanged = !0;
                        this.requestDraw()
                    },
                    rendered: function() {
                        this._symbolChanged = this._graphicChanged = !1
                    },
                    requestDraw: function() {
                        this._requestDrawFlag || (this._requestDrawFlag = !0, this.parent && this.parent.requestVectorDraw(this))
                    },
                    _getGraphicExtent: function(b) {
                        b = b.geometry;
                        var a = null;
                        if (b && (a = b.extent, !a)) {
                            var c;
                            if ("esri.geometry.Point" === b.declaredClass) a = b.x, c = b.y;
                            else if ("esri.geometry.Multipoint" === b.declaredClass) a = b.points[0][0], c = b.points[0][1];
                            else return null;
                            a = new k(a, c, a, c, b.spatialReference)
                        }
                        return a
                    }
                })
            })
        },
        "esri/views/2d/handlers/Navigation": function() {
            define(["../../../core/declare", "dojo/keys", "../../../core/sniff", "../../inputs/Handler", "../../2d/viewpointUtils"], function(h, k, c, e, b) {
                return h(e, {
                    declaredClass: "esri.views.2d.handlers.Navigation",
                    constructor: function() {
                        !1 !== this.mouseRotate && null != this.mouseRotate && (this.altdrag = this._altdrag)
                    },
                    _scrollAccum: 0,
                    _scrollTimeout: null,
                    _lastPosition: null,
                    _canZoom: !0,
                    mouseRotate: c("mac") ? k.META : k.CTRL,
                    mouseZoomOut: k.SHIFT,
                    mouseWheelZoom: !0,
                    drag: function(a) {
                        var c =
                            a.deltaX,
                            g = a.deltaY,
                            e = a.lastEvent,
                            c = e ? e.deltaX - c : -c,
                            g = e ? g - e.deltaY : g,
                            e = this.view,
                            h = a.eventType;
                        h == this._phaseDict.START && (e.interacting = !0);
                        h >= this._phaseDict.END ? (e.interacting = !1, this._coords = this._lastPosition = null) : (e.interacting || (e.interacting = !0), 0 === c && 0 === g || (this._hasRotateKey(a.srcEvent) ? this._altdrag(a) : e.viewpoint = b.translateBy(this.viewpoint, e.viewpoint, [c || 0, g || 0])))
                    },
                    "double-click": function(a) {
                        var b = a.srcEvent.shiftKey ? 0.5 : 2,
                            c = this.view;
                        a = a.screenPoint;
                        c.interacting = !1;
                        c.goTo(this._scaleAndRotateViewpoint(a.x,
                            a.y, b))
                    },
                    pinch: function(a) {
                        var b = this.view,
                            c = a.lastEvent,
                            e = a.scale,
                            h = a.rotation,
                            k = a.eventType;
                        if (!(1 === e && 0 === h)) {
                            a = a.screenPoint;
                            var h = c ? h - c.rotation : h,
                                e = c ? e / c.scale : e,
                                c = Math.abs(1 - e),
                                d = Math.abs(h / 90);
                            k >= this._phaseDict.END ? (b.interacting = !1, b.constraints._zoom.enabled = !0, b.goTo(b.viewpoint)) : (!1 === b.interacting && (b.interacting = !0, b.constraints._zoom.enabled = !1), c >= d && 1 !== e ? b.viewpoint = this._scaleAndRotateViewpoint(a.x, a.y, e) : d > c && 0 !== h && (b.viewpoint = this._scaleAndRotateViewpoint(a.x, a.y, e, h)))
                        }
                    },
                    scroll: function(a) {
                        if (this.mouseWheelZoom) {
                            var b = this.view,
                                c = a.scrollDelta,
                                e = a.screenPoint.x;
                            a = a.screenPoint.y;
                            if (!(0 === c || -0 === c) && this._canZoom) this._canZoom = !1, b.interacting = !1, b.goTo(this._scaleAndRotateViewpoint(e, a, 0 > c ? 0.5 : 2)), this._scrollTimeout = setTimeout(function() {
                                this._canZoom = !0
                            }.bind(this), 100)
                        }
                    },
                    click: function(a) {
                        a.mapPoint = this.view.toMap(a.screenPoint)
                    },
                    hold: function(a) {
                        this.view.emit("hold", a)
                    },
                    altdrag: function(a) {},
                    _altdrag: function(a) {
                        var c = a.deltaX,
                            g = a.deltaY,
                            e = a.lastEvent,
                            c = e ?
                            e.deltaX - c : -c,
                            g = e ? e.deltaY - g : g,
                            e = this.view,
                            h = 0,
                            h = a.eventType;
                        a = [a.screenPoint.x, a.screenPoint.y];
                        h == this._phaseDict.START && (e.interacting = !0);
                        h >= this._phaseDict.END ? (e.interacting = !1, this._coords = this._lastPosition = null) : (e.interacting || (e.interacting = !0), 0 === c && 0 === g || (h = b.angleBetween(e.state.paddedScreenCenter, this._lastPosition || a, a), e.viewpoint = b.rotateBy(this.viewpoint, e.content.viewpoint, h), c = this._lastPosition, this._lastPosition = a, this._coords = c))
                    },
                    _contextStop: function(a) {
                        a.preventDefault()
                    },
                    _scaleAndRotateViewpoint: function(a, c, g, e) {
                        var h = this.view;
                        a = [a, c];
                        c = [];
                        b.getPaddingScreenTranslation(c, h.size, h.padding);
                        var k = h.animation ? h.animation.target : h.viewpoint;
                        a[0] += c[0];
                        a[1] += c[1];
                        return void 0 == e ? b.scaleBy(this.viewpoint, k, g, a, h.size) : b.scaleAndRotateBy(this.viewpoint, k, g, e, a, h.content.size)
                    },
                    _hasRotateKey: function(a) {
                        var b = c("mac") ? k.META : k.CTRL,
                            g = !1;
                        if (!1 === b) return g;
                        a.altKey && b == k.ALT ? g = !0 : a.ctrlKey && b == k.CTRL ? g = !0 : a.metaKey && b == k.META ? g = !0 : a.shiftKey && b == k.SHIFT && (g = !0);
                        return g
                    }
                })
            })
        },
        "esri/views/inputs/Handler": function() {
            define(["../../core/Accessoire", "../../core/declare", "../2d/viewpointUtils"], function(h, k, c) {
                return k([h], {
                    declaredClass: "esri.views.Handler",
                    classMetadata: {
                        properties: {
                            surface: {
                                dependsOn: ["view.surface"]
                            }
                        }
                    },
                    constructor: function(e) {
                        this.viewpoint = c.create()
                    },
                    destroy: function() {
                        this.view = null
                    },
                    next: null,
                    customGestures: null,
                    viewpoint: null,
                    _surfaceGetter: function() {
                        return this.get("view.surface")
                    },
                    _phaseDict: {
                        1: "start",
                        2: "move",
                        4: "end",
                        8: "cancel",
                        START: 1,
                        MOVE: 2,
                        END: 4,
                        CANCEL: 8
                    },
                    _eventsGetter: function() {
                        var c = Object.keys(this.constructor.prototype),
                            b = Object.keys(h.prototype);
                        return c.filter(function(a) {
                            return a && "_" !== a[0] && 0 !== a.indexOf("get") && "events" !== a && "function" == typeof this[a] && 0 > b.indexOf(a)
                        }, this)
                    }
                })
            })
        },
        "esri/views/ui/2d/DefaultUI2D": function() {
            define(["../DefaultUI", "dojo/_base/lang"], function(h, k) {
                return h.createSubclass({
                    declaredClass: "esri.views.ui.2d.DefaultUI2D",
                    getDefaults: function() {
                        return k.mixin(this.inherited(arguments), {
                            components: ["attribution",
                                "zoom"
                            ]
                        })
                    }
                })
            })
        },
        "esri/views/ui/ZoomBox": function() {
            define("dojo/_base/lang dojo/dom-construct ../../core/Accessoire ../../core/HandleRegistry ../../core/requestAnimationFrame ../2d/handlers/ZoomBox".split(" "), function(h, k, c, e, b, a) {
                var f = {
                    container: "esri-zoom-box__container",
                    overlay: "esri-zoom-box__overlay",
                    background: "esri-zoom-box__overlay-background",
                    box: "esri-zoom-box__outline"
                };
                return c.createSubclass({
                    declaredClass: "esri.views.ui.ZoomBox",
                    constructor: function() {
                        this._event = {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0
                        };
                        this._handles = new e;
                        this._redraw = this._redraw.bind(this)
                    },
                    destroy: function() {
                        this.view = null
                    },
                    _container: null,
                    _overlay: null,
                    _backgroundShape: null,
                    _boxShape: null,
                    _handler: null,
                    _handles: null,
                    _event: null,
                    view: null,
                    _viewSetter: function(b, c) {
                        this._handler && (this._handles.removeAll(), this.view.removeHandler(this._handler), this._handler = this._handler.view = null, this._destroyOverlay(c));
                        if (b) {
                            var f = this._handler = new a({
                                view: b
                            });
                            b.addHandler(f);
                            this._handles.add(f.on("start", this._startHandler.bind(this)),
                                f.on("update", this._updateHandler.bind(this)), f.on("end", this._endHandler.bind(this)))
                        }
                        return b
                    },
                    css: f,
                    _updateBox: function(a, b, c, e) {
                        var d = this._boxShape;
                        d.setAttributeNS(null, "x", a);
                        d.setAttributeNS(null, "y", b);
                        d.setAttributeNS(null, "width", c);
                        d.setAttributeNS(null, "height", e);
                        d.setAttributeNS(null, "class", f.box)
                    },
                    _updateBackground: function(a, b, c, f) {
                        this._backgroundShape.setAttributeNS(null, "d", this._toSVGPath(a, b, c, f, this.view.width, this.view.height))
                    },
                    _createContainer: function() {
                        var a = k.create("div", {
                            className: f.container
                        });
                        this.view.root.appendChild(a);
                        this._container = a
                    },
                    _createOverlay: function() {
                        var a = this.view.width,
                            b = this.view.height,
                            c = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        c.setAttributeNS(null, "d", "M 0 0 L " + a + " 0 L " + a + " " + b + " L 0 " + b + " Z");
                        c.setAttributeNS(null, "class", f.background);
                        a = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        b = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        b.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink",
                            "http://www.w3.org/1999/xlink");
                        b.setAttributeNS(null, "class", f.overlay);
                        b.appendChild(c);
                        b.appendChild(a);
                        this._container.appendChild(b);
                        this._backgroundShape = c;
                        this._boxShape = a;
                        this._overlay = b
                    },
                    _destroyOverlay: function(a) {
                        this._container && this._container.parentNode && this._container.parentNode.removeChild(this._container);
                        this._container = this._backgroundShape = this._boxShape = this._overlay = null
                    },
                    _toSVGPath: function(a, b, c, f, d, e) {
                        c = a + c;
                        f = b + f;
                        return "M 0 0 L " + d + " 0 L " + d + " " + e + " L 0 " + e + " ZM " + a + " " +
                            b + " L " + a + " " + f + " L " + c + " " + f + " L " + c + " " + b + " Z"
                    },
                    _redraw: function() {
                        this._rafId = null;
                        if (this._overlay) {
                            var a = this._event;
                            this._updateBox(a.x, a.y, a.width, a.height);
                            this._updateBackground(a.x, a.y, a.width, a.height);
                            this._rafId = b(this._redraw)
                        }
                    },
                    _startHandler: function(a) {
                        this._createContainer();
                        this._createOverlay()
                    },
                    _updateHandler: function(a) {
                        h.mixin(this._event, a);
                        this._rafId || (this._rafId = b(this._redraw))
                    },
                    _endHandler: function(a) {
                        var b = this.view,
                            c = b.toMap(a.x + 0.5 * a.width, a.y + 0.5 * a.height),
                            f = Math.min(a.width /
                                b.width, a.height / b.height); - 1 === a.direction && (f = 1 / f);
                        this._destroyOverlay();
                        b.goTo({
                            center: c,
                            scale: b.scale * f
                        })
                    }
                })
            })
        },
        "esri/views/2d/handlers/ZoomBox": function() {
            define(["../../../core/Evented", "../../inputs/Handler"], function(h, k) {
                return k.createSubclass([h], {
                    declaredClass: "esri.views.2d.handlers.ZoomBox",
                    constructor: function() {
                        this._event = {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0
                        }
                    },
                    _panStarted: !1,
                    _startCoords: {},
                    view: null,
                    enabled: !1,
                    drag: function(c) {
                        var e = this._event,
                            b = c.eventType,
                            a = c.screenPoint.x,
                            f = c.screenPoint.y,
                            g = this._startCoords.x || null,
                            h = this._startCoords.y || null;
                        !0 === c.srcEvent.shiftKey && (!1 === this._panStarted && 4 !== b) && (this._panStarted = !0, b = this._phaseDict.START);
                        if (b === this._phaseDict.START && !0 === c.srcEvent.shiftKey) return c.preventDefault(), this.enabled = !0, this._startCoords = {
                            x: a,
                            y: f
                        }, e.x = a, e.y = f, e.width = 0, e.height = 0, this.emit("start", e), !1;
                        a > g ? (e.x = g, e.width = a - g) : (e.x = a, e.width = g - a);
                        f > h ? (e.y = h, e.height = f - h) : (e.y = f, e.height = h - f);
                        if (this.enabled) return c.preventDefault(), b >= this._phaseDict.END ? (this.enabled = !1, this._startCoords = {}, this._panStarted = !1, e.direction = c.srcEvent.ctrlKey ? -1 : 1, this.emit("end", e)) : this.emit("update", e), !1
                    }
                })
            })
        },
        "esri/views/2d/engine/Stage": function() {
            define(["../../../core/Accessoire", "../../../core/HandleRegistry", "./cssUtils", "./Container", "./RenderContext"], function(h, k, c, e, b) {
                return h.createSubclass({
                    classMetadata: {
                        properties: {
                            clipVisible: {}
                        }
                    },
                    constructor: function() {
                        this._handles = new k
                    },
                    getDefaults: function(a) {
                        return {
                            context: new b,
                            root: new e,
                            wrapper: new e({
                                stage: this,
                                parent: this,
                                surface: a.container
                            })
                        }
                    },
                    initialize: function() {
                        this._handles.add(this.watch("clipVisible", this.rerender.bind(this)))
                    },
                    destroy: function() {
                        this.stop();
                        this._handles.destroy();
                        this._handles = null
                    },
                    _rerender: !1,
                    clipVisible: !0,
                    _stateSetter: function(a, b) {
                        b && this._handles.remove("version");
                        a && this._handles.add(a.watch("version", this.rerender.bind(this)), "version");
                        return a
                    },
                    rerender: function() {
                        this._rerender || (this._rerender = !0, this._running && this.task.isPaused() && this.task.resume())
                    },
                    run: function() {
                        this._running ||
                            (this.wrapper.addChild(this.root), this.task = this.scheduler.addFrameTask({
                                render: this._render.bind(this)
                            }), this._running = !0)
                    },
                    stop: function() {
                        this._running && (this.wrapper.removeChild(this.root), this.task.remove(), this.task = null, this._running = !1)
                    },
                    addChild: function(a) {
                        return this.root.addChild(a)
                    },
                    addChildAt: function(a, b) {
                        return this.root.addChildAt(a, b)
                    },
                    removeChild: function(a) {
                        return this.root.removeChild(a)
                    },
                    removeAllChildren: function() {
                        this.root.removeAllChildren()
                    },
                    removeChildAt: function(a) {
                        return this.root.removeChildAt(a)
                    },
                    contains: function(a) {
                        return this.root.contains(a)
                    },
                    getChildIndex: function(a) {
                        return this.root.getChildIndex(a)
                    },
                    getChildAt: function(a) {
                        return this.root.getChildAt(a)
                    },
                    setChildIndex: function(a, b) {
                        return this.root.setChildIndex(a, b)
                    },
                    requestChildRender: function(a) {
                        this.rerender()
                    },
                    _render: function() {
                        if (this._rerender) {
                            var a = this.context,
                                b = this.state,
                                g = this.wrapper,
                                e = this.root;
                            this._rerender = !1;
                            a.setViewTransform(b.transformNoRotation);
                            g.reflow(a);
                            g.render(a);
                            e.render(a);
                            g = e.surface.style;
                            e = this.clipVisible &&
                                b.clipRect;
                            c.setOrigin(g, b.screenCenter);
                            c.setTransformStyle(g, c.rotateZ(b.rotation));
                            c.clip(g, e);
                            a.reset();
                            this._rerender || this.task.pause()
                        }
                    }
                })
            })
        },
        "esri/views/2d/engine/cssUtils": function() {
            define(["dojo/has"], function(h) {
                var k = h("ff"),
                    c = h("ie"),
                    e = h("webkit");
                h = h("opera");
                var b = e && "-webkit-transform" || k && "-moz-transform" || h && "-o-transform" || c && "-ms-transform" || "transform",
                    a = !c || 9 < c,
                    f = {
                        supports3DTransforms: a,
                        transformStyleName: b,
                        clip: function(a, b) {
                            a.clip = b ? "rect(" + b.top + "px, " + b.right + "px, " + b.bottom +
                                "px," + b.left + "px)" : ""
                        },
                        setTransform: function(a, b) {
                            var c = null;
                            2 === b.length && (c = f.translate(b));
                            6 === b.length && (c = f.matrix3d(b));
                            f.setTransformStyle(a, c)
                        },
                        setTransformStyle: function(a, c) {
                            a.transform = a[b] = c
                        },
                        setOrigin: function() {
                            return a ? function(a, b) {
                                a["transform-origin"] = b[0] + "px " + b[1] + "px"
                            } : function(a, b) {
                                a["transform-origin"] = b[0] + "px " + b[1] + "px 0"
                            }
                        }(),
                        matrix: function(a) {
                            return "matrix(" + a[0].toFixed(10) + "," + a[1].toFixed(10) + "," + a[2].toFixed(10) + "," + a[3].toFixed(10) + "," + a[4] + "," + a[5] + ")"
                        },
                        matrix3d: function() {
                            return a ?
                                function(a) {
                                    if (6 === a.length) return "matrix3d(" + a[0].toFixed(10) + "," + a[1].toFixed(10) + ",0,0," + a[2].toFixed(10) + "," + a[3].toFixed(10) + ",0,0,0,0,1,0," + Math.round(a[4]).toFixed(10) + "," + Math.round(a[5]).toFixed(10) + ",0,1)"
                                } : function(a) {
                                    return "matrix(" + a[0].toFixed(10) + "," + a[1].toFixed(10) + "," + a[2].toFixed(10) + "," + a[3].toFixed(10) + "," + Math.round(a[4]) + "," + Math.round(a[5]) + ")"
                                }
                        }(),
                        translate: function(a) {
                            return "translate(" + Math.round(a[0]) + "px, " + Math.round(a[1]) + "px)"
                        },
                        rotate: function(a) {
                            return f.rotateZ(a.toFixed(3))
                        },
                        rotateZ: function() {
                            return a ? function(a) {
                                return "rotateZ(" + a + "deg)"
                            } : function(a) {
                                return "rotate(" + a + "deg)"
                            }
                        }()
                    };
                return f
            })
        },
        "esri/views/2d/engine/RenderContext": function() {
            define(["dojo/dom-construct", "../math/mat2d", "../math/vec2", "./cssUtils"], function(h, k, c, e) {
                var b = function() {
                    this._parentStack = [];
                    this._tStack = [];
                    this._tStackSize = 0;
                    this._tmpMat2d = k.create();
                    this._tmpVec2 = c.create();
                    this.transform = k.create();
                    this.viewTransform = k.create()
                };
                b.prototype = {
                    reset: function() {
                        this._tStackSize = this._parentStack.length =
                            0;
                        this.child = null;
                        k.identity(this.transform)
                    },
                    setSize: function(a, b) {
                        this.surface.style.width = a + "px";
                        this.surface.style.height = b + "px"
                    },
                    setOpacity: function(a) {
                        this.surface.style.opacity = a
                    },
                    setVisibility: function(a) {
                        this.surface.style.display = a ? "block" : "none"
                    },
                    setBlendMode: function(a) {
                        this.surface.style["mix-blend-mode"] = a ? a : "normal"
                    },
                    setViewTransform: function(a) {
                        k.copy(this.transform, a);
                        k.copy(this.viewTransform, a)
                    },
                    reflowChild: function(a, b) {
                        this.child = a;
                        this.placeChild(a, b);
                        a.reflow(this)
                    },
                    renderChild: function(a,
                        b) {
                        this.child = a;
                        this.surface = a.surface;
                        this.setChildTransform(a);
                        a.render(this)
                    },
                    placeChild: function(a, b) {
                        var c = this._parentStack[this._parentStack.length - 1].surface,
                            e = c.childNodes,
                            h = a.createSurface();
                        e[b] ? e[b] !== h && c.insertBefore(h, e[b]) : c.appendChild(h)
                    },
                    setChildTransform: function(a) {
                        a = a.transform;
                        var b = null;
                        a && (6 === a.length ? (b = k.invert(this._tmpMat2d, a), k.multiply(b, this.transform, b), e.setTransform(this.surface.style, b), k.copy(this.transform, a)) : 2 === a.length && (b = c.transformMat2d(this._tmpVec2,
                            a, this.transform), e.setTransform(this.surface.style, b)))
                    },
                    pushParent: function(a) {
                        this._parentStack.push(a)
                    },
                    popParent: function() {
                        this._parentStack.pop()
                    },
                    pushMatrix: function() {
                        var a = this._tStack;
                        a.length < this._tStackSize + 1 && a.push(k.create());
                        k.copy(a[this._tStackSize++], this.transform)
                    },
                    popMatrix: function() {
                        k.copy(this.transform, this._tStack[--this._tStackSize])
                    },
                    emptyTrash: function(a) {
                        if (a.trash && a.trash.children.length) {
                            a = a.trash;
                            var b = a.children,
                                c, e;
                            c = 0;
                            for (e = b.length; c < e; c++) h.destroy(b[c].surface);
                            b.length = 0;
                            a.ids = {}
                        }
                    }
                };
                return b
            })
        },
        "dojox/gfx/svg": function() {
            define("dojo/_base/lang dojo/_base/sniff dojo/_base/window dojo/dom dojo/_base/declare dojo/_base/array dojo/dom-geometry dojo/dom-attr dojo/_base/Color ./_base ./shape ./path".split(" "), function(h, k, c, e, b, a, f, g, l, m, n, d) {
                function q(a, b) {
                    return c.doc.createElementNS ? c.doc.createElementNS(a, b) : c.doc.createElement(b)
                }

                function t(a) {
                    return p.useSvgWeb ? c.doc.createTextNode(a, !0) : c.doc.createTextNode(a)
                }
                var p = m.svg = {};
                p.useSvgWeb = "undefined" !=
                    typeof window.svgweb;
                var A = navigator.userAgent,
                    r = k("ios"),
                    s = k("android"),
                    v = k("chrome") || s && 4 <= s ? "auto" : "optimizeLegibility";
                p.xmlns = {
                    xlink: "http://www.w3.org/1999/xlink",
                    svg: "http://www.w3.org/2000/svg"
                };
                p.getRef = function(a) {
                    return !a || "none" == a ? null : a.match(/^url\(#.+\)$/) ? e.byId(a.slice(5, -1)) : a.match(/^#dojoUnique\d+$/) ? e.byId(a.slice(1)) : null
                };
                p.dasharray = {
                    solid: "none",
                    shortdash: [4, 1],
                    shortdot: [1, 1],
                    shortdashdot: [4, 1, 1, 1],
                    shortdashdotdot: [4, 1, 1, 1, 1, 1],
                    dot: [1, 3],
                    dash: [4, 3],
                    longdash: [8, 3],
                    dashdot: [4,
                        3, 1, 3
                    ],
                    longdashdot: [8, 3, 1, 3],
                    longdashdotdot: [8, 3, 1, 3, 1, 3]
                };
                var u = 0;
                p.Shape = b("dojox.gfx.svg.Shape", n.Shape, {
                    destroy: function() {
                        if (this.fillStyle && "type" in this.fillStyle) {
                            var a = this.rawNode.getAttribute("fill");
                            (a = p.getRef(a)) && a.parentNode.removeChild(a)
                        }
                        if (this.clip && (a = this.rawNode.getAttribute("clip-path")))(a = e.byId(a.match(/gfx_clip[\d]+/)[0])) && a.parentNode.removeChild(a);
                        n.Shape.prototype.destroy.apply(this, arguments)
                    },
                    setFill: function(b) {
                        if (!b) return this.fillStyle = null, this.rawNode.setAttribute("fill",
                            "none"), this.rawNode.setAttribute("fill-opacity", 0), this;
                        var d, c = function(a) {
                            this.setAttribute(a, d[a].toFixed(8))
                        };
                        if ("object" == typeof b && "type" in b) {
                            switch (b.type) {
                                case "linear":
                                    d = m.makeParameters(m.defaultLinearGradient, b);
                                    b = this._setFillObject(d, "linearGradient");
                                    a.forEach(["x1", "y1", "x2", "y2"], c, b);
                                    break;
                                case "radial":
                                    d = m.makeParameters(m.defaultRadialGradient, b);
                                    b = this._setFillObject(d, "radialGradient");
                                    a.forEach(["cx", "cy", "r"], c, b);
                                    break;
                                case "pattern":
                                    d = m.makeParameters(m.defaultPattern, b),
                                        b = this._setFillObject(d, "pattern"), a.forEach(["x", "y", "width", "height"], c, b)
                            }
                            this.fillStyle = d;
                            return this
                        }
                        this.fillStyle = d = m.normalizeColor(b);
                        this.rawNode.setAttribute("fill", d.toCss());
                        this.rawNode.setAttribute("fill-opacity", d.a);
                        this.rawNode.setAttribute("fill-rule", "evenodd");
                        return this
                    },
                    setStroke: function(a) {
                        var b = this.rawNode;
                        if (!a) return this.strokeStyle = null, b.setAttribute("stroke", "none"), b.setAttribute("stroke-opacity", 0), this;
                        if ("string" == typeof a || h.isArray(a) || a instanceof l) a = {
                            color: a
                        };
                        a = this.strokeStyle = m.makeParameters(m.defaultStroke, a);
                        a.color = m.normalizeColor(a.color);
                        if (a) {
                            b.setAttribute("stroke", a.color.toCss());
                            b.setAttribute("stroke-opacity", a.color.a);
                            b.setAttribute("stroke-width", a.width);
                            b.setAttribute("stroke-linecap", a.cap);
                            "number" == typeof a.join ? (b.setAttribute("stroke-linejoin", "miter"), b.setAttribute("stroke-miterlimit", a.join)) : b.setAttribute("stroke-linejoin", a.join);
                            var d = a.style.toLowerCase();
                            d in p.dasharray && (d = p.dasharray[d]);
                            if (d instanceof Array) {
                                var d =
                                    h._toArray(d),
                                    c;
                                for (c = 0; c < d.length; ++c) d[c] *= a.width;
                                if ("butt" != a.cap) {
                                    for (c = 0; c < d.length; c += 2) d[c] -= a.width, 1 > d[c] && (d[c] = 1);
                                    for (c = 1; c < d.length; c += 2) d[c] += a.width
                                }
                                d = d.join(",")
                            }
                            b.setAttribute("stroke-dasharray", d);
                            b.setAttribute("dojoGfxStrokeStyle", a.style)
                        }
                        return this
                    },
                    _getParentSurface: function() {
                        for (var a = this.parent; a && !(a instanceof m.Surface); a = a.parent);
                        return a
                    },
                    _setFillObject: function(a, b) {
                        var d = p.xmlns.svg;
                        this.fillStyle = a;
                        var c = this._getParentSurface().defNode,
                            f = this.rawNode.getAttribute("fill");
                        if (f = p.getRef(f))
                            if (f.tagName.toLowerCase() != b.toLowerCase()) {
                                var g = f.id;
                                f.parentNode.removeChild(f);
                                f = q(d, b);
                                f.setAttribute("id", g);
                                c.appendChild(f)
                            } else
                                for (; f.childNodes.length;) f.removeChild(f.lastChild);
                        else f = q(d, b), f.setAttribute("id", m._base._getUniqueId()), c.appendChild(f);
                        if ("pattern" == b) f.setAttribute("patternUnits", "userSpaceOnUse"), d = q(d, "image"), d.setAttribute("x", 0), d.setAttribute("y", 0), d.setAttribute("width", a.width.toFixed(8)), d.setAttribute("height", a.height.toFixed(8)), d.setAttributeNS ?
                            d.setAttributeNS(p.xmlns.xlink, "xlink:href", a.src) : d.setAttribute("xlink:href", a.src), f.appendChild(d);
                        else {
                            f.setAttribute("gradientUnits", "userSpaceOnUse");
                            for (c = 0; c < a.colors.length; ++c) {
                                var g = a.colors[c],
                                    e = q(d, "stop"),
                                    h = g.color = m.normalizeColor(g.color);
                                e.setAttribute("offset", g.offset.toFixed(8));
                                e.setAttribute("stop-color", h.toCss());
                                e.setAttribute("stop-opacity", h.a);
                                f.appendChild(e)
                            }
                        }
                        this.rawNode.setAttribute("fill", "url(#" + f.getAttribute("id") + ")");
                        this.rawNode.removeAttribute("fill-opacity");
                        this.rawNode.setAttribute("fill-rule", "evenodd");
                        return f
                    },
                    _applyTransform: function() {
                        if (this.matrix) {
                            var a = this.matrix;
                            this.rawNode.setAttribute("transform", "matrix(" + a.xx.toFixed(8) + "," + a.yx.toFixed(8) + "," + a.xy.toFixed(8) + "," + a.yy.toFixed(8) + "," + a.dx.toFixed(8) + "," + a.dy.toFixed(8) + ")")
                        } else this.rawNode.removeAttribute("transform");
                        return this
                    },
                    setRawNode: function(a) {
                        a = this.rawNode = a;
                        "image" != this.shape.type && a.setAttribute("fill", "none");
                        a.setAttribute("fill-opacity", 0);
                        a.setAttribute("stroke",
                            "none");
                        a.setAttribute("stroke-opacity", 0);
                        a.setAttribute("stroke-width", 1);
                        a.setAttribute("stroke-linecap", "butt");
                        a.setAttribute("stroke-linejoin", "miter");
                        a.setAttribute("stroke-miterlimit", 4);
                        a.__gfxObject__ = this
                    },
                    setShape: function(a) {
                        this.shape = m.makeParameters(this.shape, a);
                        for (var b in this.shape) "type" != b && this.rawNode.setAttribute(b, this.shape[b]);
                        this.bbox = null;
                        return this
                    },
                    _moveToFront: function() {
                        this.rawNode.parentNode.appendChild(this.rawNode);
                        return this
                    },
                    _moveToBack: function() {
                        this.rawNode.parentNode.insertBefore(this.rawNode,
                            this.rawNode.parentNode.firstChild);
                        return this
                    },
                    setClip: function(a) {
                        this.inherited(arguments);
                        var b = a ? "width" in a ? "rect" : "cx" in a ? "ellipse" : "points" in a ? "polyline" : "d" in a ? "path" : null : null;
                        if (a && !b) return this;
                        "polyline" === b && (a = h.clone(a), a.points = a.points.join(","));
                        var d, c = g.get(this.rawNode, "clip-path");
                        c && (d = e.byId(c.match(/gfx_clip[\d]+/)[0])) && d.removeChild(d.childNodes[0]);
                        a ? (d ? (b = q(p.xmlns.svg, b), d.appendChild(b)) : (c = "gfx_clip" + ++u, this.rawNode.setAttribute("clip-path", "url(#" + c + ")"), d =
                            q(p.xmlns.svg, "clipPath"), b = q(p.xmlns.svg, b), d.appendChild(b), this.rawNode.parentNode.insertBefore(d, this.rawNode), g.set(d, "id", c)), g.set(b, a)) : (this.rawNode.removeAttribute("clip-path"), d && d.parentNode.removeChild(d));
                        return this
                    },
                    _removeClipNode: function() {
                        var a, b = g.get(this.rawNode, "clip-path");
                        b && (a = e.byId(b.match(/gfx_clip[\d]+/)[0])) && a.parentNode.removeChild(a);
                        return a
                    }
                });
                p.Group = b("dojox.gfx.svg.Group", p.Shape, {
                    constructor: function() {
                        n.Container._init.call(this)
                    },
                    setRawNode: function(a) {
                        this.rawNode =
                            a;
                        this.rawNode.__gfxObject__ = this
                    },
                    destroy: function() {
                        this.clear(!0);
                        p.Shape.prototype.destroy.apply(this, arguments)
                    }
                });
                p.Group.nodeType = "g";
                p.Rect = b("dojox.gfx.svg.Rect", [p.Shape, n.Rect], {
                    setShape: function(a) {
                        this.shape = m.makeParameters(this.shape, a);
                        this.bbox = null;
                        for (var b in this.shape) "type" != b && "r" != b && this.rawNode.setAttribute(b, this.shape[b]);
                        null != this.shape.r && (this.rawNode.setAttribute("ry", this.shape.r), this.rawNode.setAttribute("rx", this.shape.r));
                        return this
                    }
                });
                p.Rect.nodeType = "rect";
                p.Ellipse = b("dojox.gfx.svg.Ellipse", [p.Shape, n.Ellipse], {});
                p.Ellipse.nodeType = "ellipse";
                p.Circle = b("dojox.gfx.svg.Circle", [p.Shape, n.Circle], {});
                p.Circle.nodeType = "circle";
                p.Line = b("dojox.gfx.svg.Line", [p.Shape, n.Line], {});
                p.Line.nodeType = "line";
                p.Polyline = b("dojox.gfx.svg.Polyline", [p.Shape, n.Polyline], {
                    setShape: function(a, b) {
                        a && a instanceof Array ? (this.shape = m.makeParameters(this.shape, {
                            points: a
                        }), b && this.shape.points.length && this.shape.points.push(this.shape.points[0])) : this.shape = m.makeParameters(this.shape,
                            a);
                        this.bbox = null;
                        this._normalizePoints();
                        for (var d = [], c = this.shape.points, f = 0; f < c.length; ++f) d.push(c[f].x.toFixed(8), c[f].y.toFixed(8));
                        this.rawNode.setAttribute("points", d.join(" "));
                        return this
                    }
                });
                p.Polyline.nodeType = "polyline";
                p.Image = b("dojox.gfx.svg.Image", [p.Shape, n.Image], {
                    setShape: function(a) {
                        this.shape = m.makeParameters(this.shape, a);
                        this.bbox = null;
                        a = this.rawNode;
                        for (var b in this.shape) "type" != b && "src" != b && a.setAttribute(b, this.shape[b]);
                        a.setAttribute("preserveAspectRatio", "none");
                        a.setAttributeNS ?
                            a.setAttributeNS(p.xmlns.xlink, "xlink:href", this.shape.src) : a.setAttribute("xlink:href", this.shape.src);
                        a.__gfxObject__ = this;
                        return this
                    }
                });
                p.Image.nodeType = "image";
                p.Text = b("dojox.gfx.svg.Text", [p.Shape, n.Text], {
                    setShape: function(a) {
                        this.shape = m.makeParameters(this.shape, a);
                        this.bbox = null;
                        a = this.rawNode;
                        var b = this.shape;
                        a.setAttribute("x", b.x);
                        a.setAttribute("y", b.y);
                        a.setAttribute("text-anchor", b.align);
                        a.setAttribute("text-decoration", b.decoration);
                        a.setAttribute("rotate", b.rotated ? 90 : 0);
                        a.setAttribute("kerning",
                            b.kerning ? "auto" : 0);
                        a.setAttribute("text-rendering", v);
                        a.firstChild ? a.firstChild.nodeValue = b.text : a.appendChild(t(b.text));
                        return this
                    },
                    getTextWidth: function() {
                        var a = this.rawNode,
                            b = a.parentNode,
                            a = a.cloneNode(!0);
                        a.style.visibility = "hidden";
                        var d = 0,
                            c = a.firstChild.nodeValue;
                        b.appendChild(a);
                        if ("" != c)
                            for (; !d;) d = a.getBBox ? parseInt(a.getBBox().width) : 68;
                        b.removeChild(a);
                        return d
                    },
                    getBoundingBox: function() {
                        var a = null;
                        if (this.getShape().text) try {
                            a = this.rawNode.getBBox()
                        } catch (b) {
                            a = {
                                x: 0,
                                y: 0,
                                width: 0,
                                height: 0
                            }
                        }
                        return a
                    }
                });
                p.Text.nodeType = "text";
                p.Path = b("dojox.gfx.svg.Path", [p.Shape, d.Path], {
                    _updateWithSegment: function(a) {
                        this.inherited(arguments);
                        "string" == typeof this.shape.path && this.rawNode.setAttribute("d", this.shape.path)
                    },
                    setShape: function(a) {
                        this.inherited(arguments);
                        this.shape.path ? this.rawNode.setAttribute("d", this.shape.path) : this.rawNode.removeAttribute("d");
                        return this
                    }
                });
                p.Path.nodeType = "path";
                p.TextPath = b("dojox.gfx.svg.TextPath", [p.Shape, d.TextPath], {
                    _updateWithSegment: function(a) {
                        this.inherited(arguments);
                        this._setTextPath()
                    },
                    setShape: function(a) {
                        this.inherited(arguments);
                        this._setTextPath();
                        return this
                    },
                    _setTextPath: function() {
                        if ("string" == typeof this.shape.path) {
                            var a = this.rawNode;
                            if (!a.firstChild) {
                                var b = q(p.xmlns.svg, "textPath"),
                                    d = t("");
                                b.appendChild(d);
                                a.appendChild(b)
                            }
                            b = (b = a.firstChild.getAttributeNS(p.xmlns.xlink, "href")) && p.getRef(b);
                            if (!b && (d = this._getParentSurface())) {
                                var d = d.defNode,
                                    b = q(p.xmlns.svg, "path"),
                                    c = m._base._getUniqueId();
                                b.setAttribute("id", c);
                                d.appendChild(b);
                                a.firstChild.setAttributeNS ?
                                    a.firstChild.setAttributeNS(p.xmlns.xlink, "xlink:href", "#" + c) : a.firstChild.setAttribute("xlink:href", "#" + c)
                            }
                            b && b.setAttribute("d", this.shape.path)
                        }
                    },
                    _setText: function() {
                        var a = this.rawNode;
                        if (!a.firstChild) {
                            var b = q(p.xmlns.svg, "textPath"),
                                d = t("");
                            b.appendChild(d);
                            a.appendChild(b)
                        }
                        a = a.firstChild;
                        b = this.text;
                        a.setAttribute("alignment-baseline", "middle");
                        switch (b.align) {
                            case "middle":
                                a.setAttribute("text-anchor", "middle");
                                a.setAttribute("startOffset", "50%");
                                break;
                            case "end":
                                a.setAttribute("text-anchor",
                                    "end");
                                a.setAttribute("startOffset", "100%");
                                break;
                            default:
                                a.setAttribute("text-anchor", "start"), a.setAttribute("startOffset", "0%")
                        }
                        a.setAttribute("baseline-shift", "0.5ex");
                        a.setAttribute("text-decoration", b.decoration);
                        a.setAttribute("rotate", b.rotated ? 90 : 0);
                        a.setAttribute("kerning", b.kerning ? "auto" : 0);
                        a.firstChild.data = b.text
                    }
                });
                p.TextPath.nodeType = "text";
                var z = 534 < function() {
                    var a = /WebKit\/(\d*)/.exec(A);
                    return a ? a[1] : 0
                }();
                p.Surface = b("dojox.gfx.svg.Surface", n.Surface, {
                    constructor: function() {
                        n.Container._init.call(this)
                    },
                    destroy: function() {
                        n.Container.clear.call(this, !0);
                        this.defNode = null;
                        this.inherited(arguments)
                    },
                    setDimensions: function(a, b) {
                        if (!this.rawNode) return this;
                        this.rawNode.setAttribute("width", a);
                        this.rawNode.setAttribute("height", b);
                        z && (this.rawNode.style.width = a, this.rawNode.style.height = b);
                        return this
                    },
                    getDimensions: function() {
                        return this.rawNode ? {
                            width: m.normalizedLength(this.rawNode.getAttribute("width")),
                            height: m.normalizedLength(this.rawNode.getAttribute("height"))
                        } : null
                    }
                });
                p.createSurface = function(a,
                    b, d) {
                    var c = new p.Surface;
                    c.rawNode = q(p.xmlns.svg, "svg");
                    c.rawNode.setAttribute("overflow", "hidden");
                    b && c.rawNode.setAttribute("width", b);
                    d && c.rawNode.setAttribute("height", d);
                    b = q(p.xmlns.svg, "defs");
                    c.rawNode.appendChild(b);
                    c.defNode = b;
                    c._parent = e.byId(a);
                    c._parent.appendChild(c.rawNode);
                    m._base._fixMsTouchAction(c);
                    return c
                };
                k = {
                    _setFont: function() {
                        var a = this.fontStyle;
                        this.rawNode.setAttribute("font-style", a.style);
                        this.rawNode.setAttribute("font-variant", a.variant);
                        this.rawNode.setAttribute("font-weight",
                            a.weight);
                        this.rawNode.setAttribute("font-size", a.size);
                        this.rawNode.setAttribute("font-family", a.family)
                    }
                };
                var y = n.Container;
                b = p.Container = {
                    openBatch: function() {
                        if (!this._batch) {
                            var a;
                            a = p.useSvgWeb ? c.doc.createDocumentFragment(!0) : c.doc.createDocumentFragment();
                            this.fragment = a
                        }++this._batch;
                        return this
                    },
                    closeBatch: function() {
                        this._batch = 0 < this._batch ? --this._batch : 0;
                        this.fragment && !this._batch && (this.rawNode.appendChild(this.fragment), delete this.fragment);
                        return this
                    },
                    add: function(a) {
                        this != a.getParent() &&
                            (this.fragment ? this.fragment.appendChild(a.rawNode) : this.rawNode.appendChild(a.rawNode), y.add.apply(this, arguments), a.setClip(a.clip));
                        return this
                    },
                    remove: function(a, b) {
                        this == a.getParent() && (this.rawNode == a.rawNode.parentNode && this.rawNode.removeChild(a.rawNode), this.fragment && this.fragment == a.rawNode.parentNode && this.fragment.removeChild(a.rawNode), a._removeClipNode(), y.remove.apply(this, arguments));
                        return this
                    },
                    clear: function() {
                        for (var a = this.rawNode; a.lastChild;) a.removeChild(a.lastChild);
                        var b =
                            this.defNode;
                        if (b) {
                            for (; b.lastChild;) b.removeChild(b.lastChild);
                            a.appendChild(b)
                        }
                        return y.clear.apply(this, arguments)
                    },
                    getBoundingBox: y.getBoundingBox,
                    _moveChildToFront: y._moveChildToFront,
                    _moveChildToBack: y._moveChildToBack
                };
                d = p.Creator = {
                    createObject: function(a, b) {
                        if (!this.rawNode) return null;
                        var d = new a,
                            c = q(p.xmlns.svg, a.nodeType);
                        d.setRawNode(c);
                        d.setShape(b);
                        this.add(d);
                        return d
                    }
                };
                h.extend(p.Text, k);
                h.extend(p.TextPath, k);
                h.extend(p.Group, b);
                h.extend(p.Group, n.Creator);
                h.extend(p.Group, d);
                h.extend(p.Surface,
                    b);
                h.extend(p.Surface, n.Creator);
                h.extend(p.Surface, d);
                p.fixTarget = function(a, b) {
                    a.gfxTarget || (a.gfxTarget = r && a.target.wholeText ? a.target.parentElement.__gfxObject__ : a.target.__gfxObject__);
                    return !0
                };
                p.useSvgWeb && (p.createSurface = function(a, b, d) {
                    var c = new p.Surface;
                    if (!b || !d) {
                        var g = f.position(a);
                        b = b || g.w;
                        d = d || g.h
                    }
                    a = e.byId(a);
                    var g = a.id ? a.id + "_svgweb" : m._base._getUniqueId(),
                        h = q(p.xmlns.svg, "svg");
                    h.id = g;
                    h.setAttribute("width", b);
                    h.setAttribute("height", d);
                    svgweb.appendChild(h, a);
                    h.addEventListener("SVGLoad",
                        function() {
                            c.rawNode = this;
                            c.isLoaded = !0;
                            var a = q(p.xmlns.svg, "defs");
                            c.rawNode.appendChild(a);
                            c.defNode = a;
                            if (c.onLoad) c.onLoad(c)
                        }, !1);
                    c.isLoaded = !1;
                    return c
                }, p.Surface.extend({
                    destroy: function() {
                        var a = this.rawNode;
                        svgweb.removeChild(a, a.parentNode)
                    }
                }), k = {
                    connect: function(a, b, d) {
                        "on" === a.substring(0, 2) && (a = a.substring(2));
                        d = 2 == arguments.length ? b : h.hitch(b, d);
                        this.getEventSource().addEventListener(a, d, !1);
                        return [this, a, d]
                    },
                    disconnect: function(a) {
                        this.getEventSource().removeEventListener(a[1], a[2], !1);
                        delete a[0]
                    }
                }, h.extend(p.Shape, k), h.extend(p.Surface, k));
                return p
            })
        },
        "dojox/gfx/shape": function() {
            define("./_base dojo/_base/lang dojo/_base/declare dojo/_base/kernel dojo/_base/sniff dojo/on dojo/_base/array dojo/dom-construct dojo/_base/Color ./matrix".split(" "), function(h, k, c, e, b, a, f, g, l, m) {
                var n = h.shape = {};
                n.Shape = c("dojox.gfx.shape.Shape", null, {
                    constructor: function() {
                        this.parentMatrix = this.parent = this.bbox = this.strokeStyle = this.fillStyle = this.matrix = this.shape = this.rawNode = null;
                        if (b("gfxRegistry")) {
                            var a =
                                n.register(this);
                            this.getUID = function() {
                                return a
                            }
                        }
                    },
                    destroy: function() {
                        b("gfxRegistry") && n.dispose(this);
                        this.rawNode && "__gfxObject__" in this.rawNode && (this.rawNode.__gfxObject__ = null);
                        this.rawNode = null
                    },
                    getNode: function() {
                        return this.rawNode
                    },
                    getShape: function() {
                        return this.shape
                    },
                    getTransform: function() {
                        return this.matrix
                    },
                    getFill: function() {
                        return this.fillStyle
                    },
                    getStroke: function() {
                        return this.strokeStyle
                    },
                    getParent: function() {
                        return this.parent
                    },
                    getBoundingBox: function() {
                        return this.bbox
                    },
                    getTransformedBoundingBox: function() {
                        var a =
                            this.getBoundingBox();
                        if (!a) return null;
                        var b = this._getRealMatrix();
                        return [m.multiplyPoint(b, a.x, a.y), m.multiplyPoint(b, a.x + a.width, a.y), m.multiplyPoint(b, a.x + a.width, a.y + a.height), m.multiplyPoint(b, a.x, a.y + a.height)]
                    },
                    getEventSource: function() {
                        return this.rawNode
                    },
                    setClip: function(a) {
                        this.clip = a
                    },
                    getClip: function() {
                        return this.clip
                    },
                    setShape: function(a) {
                        this.shape = h.makeParameters(this.shape, a);
                        this.bbox = null;
                        return this
                    },
                    setFill: function(a) {
                        if (!a) return this.fillStyle = null, this;
                        var b = null;
                        if ("object" ==
                            typeof a && "type" in a) switch (a.type) {
                            case "linear":
                                b = h.makeParameters(h.defaultLinearGradient, a);
                                break;
                            case "radial":
                                b = h.makeParameters(h.defaultRadialGradient, a);
                                break;
                            case "pattern":
                                b = h.makeParameters(h.defaultPattern, a)
                        } else b = h.normalizeColor(a);
                        this.fillStyle = b;
                        return this
                    },
                    setStroke: function(a) {
                        if (!a) return this.strokeStyle = null, this;
                        if ("string" == typeof a || k.isArray(a) || a instanceof l) a = {
                            color: a
                        };
                        a = this.strokeStyle = h.makeParameters(h.defaultStroke, a);
                        a.color = h.normalizeColor(a.color);
                        return this
                    },
                    setTransform: function(a) {
                        this.matrix = m.clone(a ? m.normalize(a) : m.identity);
                        return this._applyTransform()
                    },
                    _applyTransform: function() {
                        return this
                    },
                    moveToFront: function() {
                        var a = this.getParent();
                        a && (a._moveChildToFront(this), this._moveToFront());
                        return this
                    },
                    moveToBack: function() {
                        var a = this.getParent();
                        a && (a._moveChildToBack(this), this._moveToBack());
                        return this
                    },
                    _moveToFront: function() {},
                    _moveToBack: function() {},
                    applyRightTransform: function(a) {
                        return a ? this.setTransform([this.matrix, a]) : this
                    },
                    applyLeftTransform: function(a) {
                        return a ?
                            this.setTransform([a, this.matrix]) : this
                    },
                    applyTransform: function(a) {
                        return a ? this.setTransform([this.matrix, a]) : this
                    },
                    removeShape: function(a) {
                        this.parent && this.parent.remove(this, a);
                        return this
                    },
                    _setParent: function(a, b) {
                        this.parent = a;
                        return this._updateParentMatrix(b)
                    },
                    _updateParentMatrix: function(a) {
                        this.parentMatrix = a ? m.clone(a) : null;
                        return this._applyTransform()
                    },
                    _getRealMatrix: function() {
                        for (var a = this.matrix, b = this.parent; b;) b.matrix && (a = m.multiply(b.matrix, a)), b = b.parent;
                        return a
                    }
                });
                n._eventsProcessing = {
                    on: function(b, c) {
                        return a(this.getEventSource(), b, n.fixCallback(this, h.fixTarget, c))
                    },
                    connect: function(a, b, c) {
                        "on" == a.substring(0, 2) && (a = a.substring(2));
                        return this.on(a, c ? k.hitch(b, c) : b)
                    },
                    disconnect: function(a) {
                        return a.remove()
                    }
                };
                n.fixCallback = function(a, b, c, f) {
                    f || (f = c, c = null);
                    if (k.isString(f)) {
                        c = c || e.global;
                        if (!c[f]) throw ['dojox.gfx.shape.fixCallback: scope["', f, '"] is null (scope\x3d"', c, '")'].join("");
                        return function(g) {
                            return b(g, a) ? c[f].apply(c, arguments || []) : void 0
                        }
                    }
                    return !c ? function(g) {
                        return b(g,
                            a) ? f.apply(c, arguments) : void 0
                    } : function(g) {
                        return b(g, a) ? f.apply(c, arguments || []) : void 0
                    }
                };
                k.extend(n.Shape, n._eventsProcessing);
                n.Container = {
                    _init: function() {
                        this.children = [];
                        this._batch = 0
                    },
                    openBatch: function() {
                        return this
                    },
                    closeBatch: function() {
                        return this
                    },
                    add: function(a) {
                        var b = a.getParent();
                        b && b.remove(a, !0);
                        this.children.push(a);
                        return a._setParent(this, this._getRealMatrix())
                    },
                    remove: function(a, b) {
                        for (var c = 0; c < this.children.length; ++c)
                            if (this.children[c] == a) {
                                b || (a.parent = null, a.parentMatrix =
                                    null);
                                this.children.splice(c, 1);
                                break
                            }
                        return this
                    },
                    clear: function(a) {
                        for (var b, c = 0; c < this.children.length; ++c) b = this.children[c], b.parent = null, b.parentMatrix = null, a && b.destroy();
                        this.children = [];
                        return this
                    },
                    getBoundingBox: function() {
                        if (this.children) {
                            var a = null;
                            f.forEach(this.children, function(b) {
                                var c = b.getBoundingBox();
                                c && ((b = b.getTransform()) && (c = m.multiplyRectangle(b, c)), a ? (a.x = Math.min(a.x, c.x), a.y = Math.min(a.y, c.y), a.endX = Math.max(a.endX, c.x + c.width), a.endY = Math.max(a.endY, c.y + c.height)) : a = {
                                    x: c.x,
                                    y: c.y,
                                    endX: c.x + c.width,
                                    endY: c.y + c.height
                                })
                            });
                            a && (a.width = a.endX - a.x, a.height = a.endY - a.y);
                            return a
                        }
                        return null
                    },
                    _moveChildToFront: function(a) {
                        for (var b = 0; b < this.children.length; ++b)
                            if (this.children[b] == a) {
                                this.children.splice(b, 1);
                                this.children.push(a);
                                break
                            }
                        return this
                    },
                    _moveChildToBack: function(a) {
                        for (var b = 0; b < this.children.length; ++b)
                            if (this.children[b] == a) {
                                this.children.splice(b, 1);
                                this.children.unshift(a);
                                break
                            }
                        return this
                    }
                };
                n.Surface = c("dojox.gfx.shape.Surface", null, {
                    constructor: function() {
                        this._parent =
                            this.rawNode = null;
                        this._nodes = [];
                        this._events = []
                    },
                    destroy: function() {
                        f.forEach(this._nodes, g.destroy);
                        this._nodes = [];
                        f.forEach(this._events, function(a) {
                            a && a.remove()
                        });
                        this._events = [];
                        this.rawNode = null;
                        if (b("ie"))
                            for (; this._parent.lastChild;) g.destroy(this._parent.lastChild);
                        else this._parent.innerHTML = "";
                        this._parent = null
                    },
                    getEventSource: function() {
                        return this.rawNode
                    },
                    _getRealMatrix: function() {
                        return null
                    },
                    isLoaded: !0,
                    onLoad: function(a) {},
                    whenLoaded: function(b, c) {
                        var f = k.hitch(b, c);
                        if (this.isLoaded) f(this);
                        else a.once(this, "load", function(a) {
                            f(a)
                        })
                    }
                });
                k.extend(n.Surface, n._eventsProcessing);
                n.Rect = c("dojox.gfx.shape.Rect", n.Shape, {
                    constructor: function(a) {
                        this.shape = h.getDefault("Rect");
                        this.rawNode = a
                    },
                    getBoundingBox: function() {
                        return this.shape
                    }
                });
                n.Ellipse = c("dojox.gfx.shape.Ellipse", n.Shape, {
                    constructor: function(a) {
                        this.shape = h.getDefault("Ellipse");
                        this.rawNode = a
                    },
                    getBoundingBox: function() {
                        if (!this.bbox) {
                            var a = this.shape;
                            this.bbox = {
                                x: a.cx - a.rx,
                                y: a.cy - a.ry,
                                width: 2 * a.rx,
                                height: 2 * a.ry
                            }
                        }
                        return this.bbox
                    }
                });
                n.Circle = c("dojox.gfx.shape.Circle", n.Shape, {
                    constructor: function(a) {
                        this.shape = h.getDefault("Circle");
                        this.rawNode = a
                    },
                    getBoundingBox: function() {
                        if (!this.bbox) {
                            var a = this.shape;
                            this.bbox = {
                                x: a.cx - a.r,
                                y: a.cy - a.r,
                                width: 2 * a.r,
                                height: 2 * a.r
                            }
                        }
                        return this.bbox
                    }
                });
                n.Line = c("dojox.gfx.shape.Line", n.Shape, {
                    constructor: function(a) {
                        this.shape = h.getDefault("Line");
                        this.rawNode = a
                    },
                    getBoundingBox: function() {
                        if (!this.bbox) {
                            var a = this.shape;
                            this.bbox = {
                                x: Math.min(a.x1, a.x2),
                                y: Math.min(a.y1, a.y2),
                                width: Math.abs(a.x2 -
                                    a.x1),
                                height: Math.abs(a.y2 - a.y1)
                            }
                        }
                        return this.bbox
                    }
                });
                n.Polyline = c("dojox.gfx.shape.Polyline", n.Shape, {
                    constructor: function(a) {
                        this.shape = h.getDefault("Polyline");
                        this.rawNode = a
                    },
                    setShape: function(a, b) {
                        a && a instanceof Array ? (this.inherited(arguments, [{
                            points: a
                        }]), b && this.shape.points.length && this.shape.points.push(this.shape.points[0])) : this.inherited(arguments, [a]);
                        return this
                    },
                    _normalizePoints: function() {
                        var a = this.shape.points,
                            b = a && a.length;
                        if (b && "number" == typeof a[0]) {
                            for (var c = [], f = 0; f < b; f +=
                                2) c.push({
                                x: a[f],
                                y: a[f + 1]
                            });
                            this.shape.points = c
                        }
                    },
                    getBoundingBox: function() {
                        if (!this.bbox && this.shape.points.length) {
                            for (var a = this.shape.points, b = a.length, c = a[0], f = c.x, g = c.y, e = c.x, h = c.y, k = 1; k < b; ++k) c = a[k], f > c.x && (f = c.x), e < c.x && (e = c.x), g > c.y && (g = c.y), h < c.y && (h = c.y);
                            this.bbox = {
                                x: f,
                                y: g,
                                width: e - f,
                                height: h - g
                            }
                        }
                        return this.bbox
                    }
                });
                n.Image = c("dojox.gfx.shape.Image", n.Shape, {
                    constructor: function(a) {
                        this.shape = h.getDefault("Image");
                        this.rawNode = a
                    },
                    getBoundingBox: function() {
                        return this.shape
                    },
                    setStroke: function() {
                        return this
                    },
                    setFill: function() {
                        return this
                    }
                });
                n.Text = c(n.Shape, {
                    constructor: function(a) {
                        this.fontStyle = null;
                        this.shape = h.getDefault("Text");
                        this.rawNode = a
                    },
                    getFont: function() {
                        return this.fontStyle
                    },
                    setFont: function(a) {
                        this.fontStyle = "string" == typeof a ? h.splitFontString(a) : h.makeParameters(h.defaultFont, a);
                        this._setFont();
                        return this
                    },
                    getBoundingBox: function() {
                        var a = null;
                        this.getShape().text && (a = h._base._computeTextBoundingBox(this));
                        return a
                    }
                });
                n.Creator = {
                    createShape: function(a) {
                        switch (a.type) {
                            case h.defaultPath.type:
                                return this.createPath(a);
                            case h.defaultRect.type:
                                return this.createRect(a);
                            case h.defaultCircle.type:
                                return this.createCircle(a);
                            case h.defaultEllipse.type:
                                return this.createEllipse(a);
                            case h.defaultLine.type:
                                return this.createLine(a);
                            case h.defaultPolyline.type:
                                return this.createPolyline(a);
                            case h.defaultImage.type:
                                return this.createImage(a);
                            case h.defaultText.type:
                                return this.createText(a);
                            case h.defaultTextPath.type:
                                return this.createTextPath(a)
                        }
                        return null
                    },
                    createGroup: function() {
                        return this.createObject(h.Group)
                    },
                    createRect: function(a) {
                        return this.createObject(h.Rect,
                            a)
                    },
                    createEllipse: function(a) {
                        return this.createObject(h.Ellipse, a)
                    },
                    createCircle: function(a) {
                        return this.createObject(h.Circle, a)
                    },
                    createLine: function(a) {
                        return this.createObject(h.Line, a)
                    },
                    createPolyline: function(a) {
                        return this.createObject(h.Polyline, a)
                    },
                    createImage: function(a) {
                        return this.createObject(h.Image, a)
                    },
                    createText: function(a) {
                        return this.createObject(h.Text, a)
                    },
                    createPath: function(a) {
                        return this.createObject(h.Path, a)
                    },
                    createTextPath: function(a) {
                        return this.createObject(h.TextPath, {}).setText(a)
                    },
                    createObject: function(a, b) {
                        return null
                    }
                };
                return n
            })
        },
        "dojox/gfx/path": function() {
            define(["./_base", "dojo/_base/lang", "dojo/_base/declare", "./matrix", "./shape"], function(h, k, c, e, b) {
                b = c("dojox.gfx.path.Path", b.Shape, {
                    constructor: function(a) {
                        this.shape = k.clone(h.defaultPath);
                        this.segments = [];
                        this.tbbox = null;
                        this.absolute = !0;
                        this.last = {};
                        this.rawNode = a;
                        this.segmented = !1
                    },
                    setAbsoluteMode: function(a) {
                        this._confirmSegmented();
                        this.absolute = "string" == typeof a ? "absolute" == a : a;
                        return this
                    },
                    getAbsoluteMode: function() {
                        this._confirmSegmented();
                        return this.absolute
                    },
                    getBoundingBox: function() {
                        this._confirmSegmented();
                        return this.bbox && "l" in this.bbox ? {
                            x: this.bbox.l,
                            y: this.bbox.t,
                            width: this.bbox.r - this.bbox.l,
                            height: this.bbox.b - this.bbox.t
                        } : null
                    },
                    _getRealBBox: function() {
                        this._confirmSegmented();
                        if (this.tbbox) return this.tbbox;
                        var a = this.bbox,
                            b = this._getRealMatrix();
                        this.bbox = null;
                        for (var c = 0, e = this.segments.length; c < e; ++c) this._updateWithSegment(this.segments[c], b);
                        b = this.bbox;
                        this.bbox = a;
                        return this.tbbox = b ? [{
                            x: b.l,
                            y: b.t
                        }, {
                            x: b.r,
                            y: b.t
                        }, {
                            x: b.r,
                            y: b.b
                        }, {
                            x: b.l,
                            y: b.b
                        }] : null
                    },
                    getLastPosition: function() {
                        this._confirmSegmented();
                        return "x" in this.last ? this.last : null
                    },
                    _applyTransform: function() {
                        this.tbbox = null;
                        return this.inherited(arguments)
                    },
                    _updateBBox: function(a, b, c) {
                        c && (b = e.multiplyPoint(c, a, b), a = b.x, b = b.y);
                        this.bbox && "l" in this.bbox ? (this.bbox.l > a && (this.bbox.l = a), this.bbox.r < a && (this.bbox.r = a), this.bbox.t > b && (this.bbox.t = b), this.bbox.b < b && (this.bbox.b = b)) : this.bbox = {
                            l: a,
                            b: b,
                            r: a,
                            t: b
                        }
                    },
                    _updateWithSegment: function(a, b) {
                        var c = a.args,
                            e = c.length,
                            k;
                        switch (a.action) {
                            case "M":
                            case "L":
                            case "C":
                            case "S":
                            case "Q":
                            case "T":
                                for (k = 0; k < e; k += 2) this._updateBBox(c[k], c[k + 1], b);
                                this.last.x = c[e - 2];
                                this.last.y = c[e - 1];
                                this.absolute = !0;
                                break;
                            case "H":
                                for (k = 0; k < e; ++k) this._updateBBox(c[k], this.last.y, b);
                                this.last.x = c[e - 1];
                                this.absolute = !0;
                                break;
                            case "V":
                                for (k = 0; k < e; ++k) this._updateBBox(this.last.x, c[k], b);
                                this.last.y = c[e - 1];
                                this.absolute = !0;
                                break;
                            case "m":
                                k = 0;
                                "x" in this.last || (this._updateBBox(this.last.x = c[0], this.last.y = c[1], b), k = 2);
                                for (; k < e; k += 2) this._updateBBox(this.last.x +=
                                    c[k], this.last.y += c[k + 1], b);
                                this.absolute = !1;
                                break;
                            case "l":
                            case "t":
                                for (k = 0; k < e; k += 2) this._updateBBox(this.last.x += c[k], this.last.y += c[k + 1], b);
                                this.absolute = !1;
                                break;
                            case "h":
                                for (k = 0; k < e; ++k) this._updateBBox(this.last.x += c[k], this.last.y, b);
                                this.absolute = !1;
                                break;
                            case "v":
                                for (k = 0; k < e; ++k) this._updateBBox(this.last.x, this.last.y += c[k], b);
                                this.absolute = !1;
                                break;
                            case "c":
                                for (k = 0; k < e; k += 6) this._updateBBox(this.last.x + c[k], this.last.y + c[k + 1], b), this._updateBBox(this.last.x + c[k + 2], this.last.y + c[k + 3], b),
                                    this._updateBBox(this.last.x += c[k + 4], this.last.y += c[k + 5], b);
                                this.absolute = !1;
                                break;
                            case "s":
                            case "q":
                                for (k = 0; k < e; k += 4) this._updateBBox(this.last.x + c[k], this.last.y + c[k + 1], b), this._updateBBox(this.last.x += c[k + 2], this.last.y += c[k + 3], b);
                                this.absolute = !1;
                                break;
                            case "A":
                                for (k = 0; k < e; k += 7) this._updateBBox(c[k + 5], c[k + 6], b);
                                this.last.x = c[e - 2];
                                this.last.y = c[e - 1];
                                this.absolute = !0;
                                break;
                            case "a":
                                for (k = 0; k < e; k += 7) this._updateBBox(this.last.x += c[k + 5], this.last.y += c[k + 6], b);
                                this.absolute = !1
                        }
                        var n = [a.action];
                        for (k =
                            0; k < e; ++k) n.push(h.formatNumber(c[k], !0));
                        if ("string" == typeof this.shape.path) this.shape.path += n.join("");
                        else {
                            k = 0;
                            for (e = n.length; k < e; ++k) this.shape.path.push(n[k])
                        }
                    },
                    _validSegments: {
                        m: 2,
                        l: 2,
                        h: 1,
                        v: 1,
                        c: 6,
                        s: 4,
                        q: 4,
                        t: 2,
                        a: 7,
                        z: 0
                    },
                    _pushSegment: function(a, b) {
                        this.tbbox = null;
                        var c = this._validSegments[a.toLowerCase()];
                        "number" == typeof c && (c ? b.length >= c && (c = {
                            action: a,
                            args: b.slice(0, b.length - b.length % c)
                        }, this.segments.push(c), this._updateWithSegment(c)) : (c = {
                            action: a,
                            args: []
                        }, this.segments.push(c), this._updateWithSegment(c)))
                    },
                    _collectArgs: function(a, b) {
                        for (var c = 0; c < b.length; ++c) {
                            var e = b[c];
                            "boolean" == typeof e ? a.push(e ? 1 : 0) : "number" == typeof e ? a.push(e) : e instanceof Array ? this._collectArgs(a, e) : "x" in e && "y" in e && a.push(e.x, e.y)
                        }
                    },
                    moveTo: function() {
                        this._confirmSegmented();
                        var a = [];
                        this._collectArgs(a, arguments);
                        this._pushSegment(this.absolute ? "M" : "m", a);
                        return this
                    },
                    lineTo: function() {
                        this._confirmSegmented();
                        var a = [];
                        this._collectArgs(a, arguments);
                        this._pushSegment(this.absolute ? "L" : "l", a);
                        return this
                    },
                    hLineTo: function() {
                        this._confirmSegmented();
                        var a = [];
                        this._collectArgs(a, arguments);
                        this._pushSegment(this.absolute ? "H" : "h", a);
                        return this
                    },
                    vLineTo: function() {
                        this._confirmSegmented();
                        var a = [];
                        this._collectArgs(a, arguments);
                        this._pushSegment(this.absolute ? "V" : "v", a);
                        return this
                    },
                    curveTo: function() {
                        this._confirmSegmented();
                        var a = [];
                        this._collectArgs(a, arguments);
                        this._pushSegment(this.absolute ? "C" : "c", a);
                        return this
                    },
                    smoothCurveTo: function() {
                        this._confirmSegmented();
                        var a = [];
                        this._collectArgs(a, arguments);
                        this._pushSegment(this.absolute ? "S" :
                            "s", a);
                        return this
                    },
                    qCurveTo: function() {
                        this._confirmSegmented();
                        var a = [];
                        this._collectArgs(a, arguments);
                        this._pushSegment(this.absolute ? "Q" : "q", a);
                        return this
                    },
                    qSmoothCurveTo: function() {
                        this._confirmSegmented();
                        var a = [];
                        this._collectArgs(a, arguments);
                        this._pushSegment(this.absolute ? "T" : "t", a);
                        return this
                    },
                    arcTo: function() {
                        this._confirmSegmented();
                        var a = [];
                        this._collectArgs(a, arguments);
                        this._pushSegment(this.absolute ? "A" : "a", a);
                        return this
                    },
                    closePath: function() {
                        this._confirmSegmented();
                        this._pushSegment("Z", []);
                        return this
                    },
                    _confirmSegmented: function() {
                        if (!this.segmented) {
                            var a = this.shape.path;
                            this.shape.path = [];
                            this._setPath(a);
                            this.shape.path = this.shape.path.join("");
                            this.segmented = !0
                        }
                    },
                    _setPath: function(a) {
                        a = k.isArray(a) ? a : a.match(h.pathSvgRegExp);
                        this.segments = [];
                        this.absolute = !0;
                        this.bbox = {};
                        this.last = {};
                        if (a) {
                            for (var b = "", c = [], e = a.length, m = 0; m < e; ++m) {
                                var n = a[m],
                                    d = parseFloat(n);
                                isNaN(d) ? (b && this._pushSegment(b, c), c = [], b = n) : c.push(d)
                            }
                            this._pushSegment(b, c)
                        }
                    },
                    setShape: function(a) {
                        this.inherited(arguments, ["string" == typeof a ? {
                            path: a
                        } : a]);
                        this.segmented = !1;
                        this.segments = [];
                        h.lazyPathSegmentation || this._confirmSegmented();
                        return this
                    },
                    _2PI: 2 * Math.PI
                });
                c = c("dojox.gfx.path.TextPath", b, {
                    constructor: function(a) {
                        "text" in this || (this.text = k.clone(h.defaultTextPath));
                        "fontStyle" in this || (this.fontStyle = k.clone(h.defaultFont))
                    },
                    getText: function() {
                        return this.text
                    },
                    setText: function(a) {
                        this.text = h.makeParameters(this.text, "string" == typeof a ? {
                            text: a
                        } : a);
                        this._setText();
                        return this
                    },
                    getFont: function() {
                        return this.fontStyle
                    },
                    setFont: function(a) {
                        this.fontStyle = "string" == typeof a ? h.splitFontString(a) : h.makeParameters(h.defaultFont, a);
                        this._setFont();
                        return this
                    }
                });
                return h.path = {
                    Path: b,
                    TextPath: c
                }
            })
        },
        "esri/views/2d/layers/GraphicsLayerView2D": function() {
            define("../../../core/HandleRegistry ../../../core/promiseUtils ../../../core/Error ../../../layers/graphics/QueryEngine ./LayerView2D ./GraphicsView2D".split(" "), function(h, k, c, e, b, a) {
                return b.createSubclass({
                    declaredClass: "esri.views.2d.layers.GraphicsLayerView2D",
                    classMetadata: {
                        properties: {
                            updating: {
                                dependsOn: ["_controller.isQueryInProgress",
                                    "_controller._socketConnector.status"
                                ],
                                getter: function() {
                                    return !0 === this.get("_controller.isQueryInProgress") || 0 === this.get("_controller._socketConnector.status")
                                }
                            }
                        }
                    },
                    constructor: function() {
                        this._rendererChanged = this._rendererChanged.bind(this);
                        this._handlesGLV = new h
                    },
                    initialize: function() {
                        this._createController().then(this._startup.bind(this)).otherwise(function() {
                            console.log("GraphicsLayerView2D: unable to startup graphics layer view.")
                        })
                    },
                    destroy: function() {
                        this._handlesGLV.destroy();
                        this._controller &&
                            this._controller.destroy && this._controller.destroy();
                        this._graphicsView && this._graphicsView.destroy();
                        this._handlesGLV = this._controller = this._graphicsView = null
                    },
                    layer: null,
                    view: null,
                    _controller: null,
                    _graphics: null,
                    _graphicsView: null,
                    _handlesGLV: null,
                    hitTest: function(a, b) {
                        return this._graphicsView ? this._graphicsView.hitTest(a, b) : null
                    },
                    queryGraphics: function() {
                        return this._queryEngine ? this._queryEngine.queryFeatures() : this._rejectQuery()
                    },
                    queryFeatures: function(a) {
                        return this._queryEngine ? this._queryEngine.queryFeatures(a) :
                            this._rejectQuery()
                    },
                    queryObjectIds: function(a) {
                        return this._queryEngine ? this._queryEngine.queryObjectIds(a) : this._rejectQuery()
                    },
                    queryFeatureCount: function(a) {
                        return this._queryEngine ? this._queryEngine.queryFeatureCount(a) : this._rejectQuery()
                    },
                    queryExtent: function(a) {
                        return this._queryEngine ? this._queryEngine.queryExtent(a) : this._rejectQuery()
                    },
                    _startup: function() {
                        this._queryEngine = new e({
                            features: this._graphics,
                            objectIdField: this.layer.objectIdField
                        });
                        this._createGraphicsView();
                        this._setupWatchers()
                    },
                    _createController: function() {
                        return this.layer.createGraphicsController({
                            layerView: this
                        }).then(function(a) {
                            this._controller = a;
                            this._graphics = a.graphics
                        }.bind(this)).otherwise(function() {
                            console.log("GraphicsLayerView2D: unable to create controller.")
                        })
                    },
                    _createGraphicsView: function() {
                        this._graphicsView = new a({
                            view: this,
                            graphics: this._graphics,
                            renderer: this.layer.renderer
                        })
                    },
                    _setupWatchers: function() {
                        this._handlesGLV.add(this.layer.watch("renderer", this._rendererChanged))
                    },
                    _rendererChanged: function() {
                        this._graphicsView.renderer =
                            this.layer.renderer
                    },
                    _rejectQuery: function(a) {
                        return k.reject(new c("GraphicsLayerView2D", "Not ready to execute query"))
                    }
                })
            })
        },
        "esri/views/2d/layers/TiledLayerView2D": function() {
            define("dojo/on dojo/has ../../../core/Collection ../ResourceLoader ../TileInfoView ../Tile ../math/vec2 ../collections/ReferenceMap ../collections/Set ../engine/Container ../engine/Bitmap ./LayerView2D ./TileQueue".split(" "), function(h, k, c, e, b, a, f, g, l, m, n, d, q) {
                var t = k("esri-mobile");
                k = d.createSubclass({
                    declaredClass: "esri.views.2d.layers.TiledLayerView2D",
                    constructor: function(a) {
                        this.container = new p;
                        this._viewHdl = h.pausable(this, "view-change", function() {
                            this.needUpdate()
                        }.bind(this));
                        this._viewWtch = this.watch("suspended, view.stationary", function() {
                            !this.suspended && (!t || t && this.view.stationary) ? (this.needUpdate(), this._viewHdl.resume()) : this._viewHdl.pause()
                        }.bind(this))
                    },
                    initialize: function() {
                        this.then(this.setup.bind(this))
                    },
                    destroy: function() {
                        this._viewWtch.remove();
                        this._viewWtch = null;
                        this._viewHdl.remove();
                        this._viewHdl = null;
                        this._updatingDependenciesWatcher.forEach(function(a) {
                            a.remove()
                        })
                    },
                    _tCol: null,
                    _rtCol: null,
                    setup: function() {
                        var a = this.layer;
                        this.tileInfoView = new b({
                            tileInfo: a.tileInfo,
                            fullExtent: a.fullExtent
                        });
                        this._rtCol = this._tCol = new A;
                        var c = [];
                        a.tileMap && (this._rtCol = new r({
                            tileInfoView: this.tileInfoView,
                            tileMap: a.tileMap,
                            tiles: this._tCol
                        }), c.push(this._rtCol));
                        this._loadingCol = new s({
                            loader: this.createLoader(),
                            tileInfoView: this.tileInfoView,
                            layer: this.layer,
                            tiles: this._rtCol,
                            view: this.view
                        });
                        c.push(this._loadingCol);
                        this.container.set({
                            tileInfoView: this.tileInfoView,
                            tiles: this._loadingCol,
                            state: this.view.state
                        });
                        var d = function() {
                            this.updating = this._rtCol.updating || this._loadingCol.updating
                        }.bind(this);
                        this._updatingDependenciesWatcher = c.map(function(a) {
                            return a.watch("updating", d, !0)
                        })
                    },
                    update: function() {
                        if (!this.suspended) {
                            var a = this.tileInfoView.getTileSpans(this.view.state);
                            this._tCol.tileSpans = a
                        }
                    },
                    createLoader: function() {
                        return new e({
                            queue: new q({
                                tileInfo: this.layer.tileInfo,
                                state: this.view.state
                            })
                        })
                    }
                });
                var p = m.createSubclass({
                        declaredClass: "TileContainer",
                        properties: {
                            tileInfoView: {},
                            tiles: {},
                            state: {}
                        },
                        constructor: function() {
                            this.levels = {}
                        },
                        _hdl: null,
                        _tilesSetter: function(a) {
                            var b = this._hdl;
                            this._get("tiles") !== a && (b && (this.removeAllChildren(), b.remove(), b = null), a && (b = a.on("change", this._colChange.bind(this)), this._tilesAdded(a.toArray())), this._hld = b, this._set("tiles", a))
                        },
                        _tilesAdded: function(a) {
                            var b, c;
                            b = 0;
                            for (c = a.length; b < c; b++) {
                                var d = a[b].tile,
                                    e = a[b].data,
                                    g = d.coords[2],
                                    h = this.levels[g],
                                    k = this.tileInfoView.getTileOrigin(f.create(), d.coords);
                                h || (this.levels[g] = h = new m, h.coords =
                                    this.state.center, h.resolution = d.lodInfo.resolution, this.addChild(h));
                                d.bitmap = new n({
                                    coords: k,
                                    source: e
                                });
                                h.addChild(d.bitmap)
                            }
                        },
                        _tilesRemoved: function(a) {
                            var b, c, d, e;
                            b = 0;
                            for (c = a.length; b < c; b++)
                                if (d = a[b].tile, (e = this.levels[d.coords[2]]) && d.bitmap) e.removeChild(d.bitmap), 0 === e.numChildren && (this.removeChild(e), delete this.levels[d.level])
                        },
                        _colChange: function(a) {
                            0 < a.added.length && this._tilesAdded(a.added);
                            0 < a.removed.length && this._tilesRemoved(a.removed)
                        }
                    }),
                    A = l.createSubclass({
                        declaredClass: "TileSet",
                        _tileSpansSetter: function(b) {
                            (!b || 0 === b.length) && this.removeAll();
                            var c = this.keys(),
                                d = {},
                                e = [],
                                f = [],
                                g, h, k, l, p, m, q, n, r, t;
                            k = 0;
                            for (t = b.length; k < t; k++) {
                                g = b[k];
                                h = g.lodInfo;
                                m = g.row;
                                q = h.z;
                                l = g.colFrom;
                                for (r = g.colTo; l <= r; l++) n = h.getWorldForX(l), p = h.normalizeX(l), g = a.getId(p, m, q, n), this.contains(g) ? d[g] = this.getItem(g) : (d[g] = new a([p, m, q, n], h), e.push(d[g]))
                            }
                            k = 0;
                            for (t = c.length; k < t; k++) d[c[k]] || f.push(c[k]);
                            this.addMany(e);
                            this.removeMany(f)
                        }
                    }),
                    r = g.createSubclass({
                        declaredClass: "TileMapTilesCollection",
                        properties: {
                            updating: !1,
                            tileInfoView: {},
                            tileMap: {},
                            tiles: {}
                        },
                        constructor: function() {
                            this._loading = new l;
                            this._tileMapCallback = this._tileMapCallback.bind(this)
                        },
                        _hdl: null,
                        _tilesSetter: function(a) {
                            var b = this._hdl;
                            this._get("tiles") !== a && (b && (this.removeAll(), b.remove(), b = null), a && (b = a.on("change", this._colChange.bind(this)), this._tilesAdded(a.toArray())), this._hld = b, this._set("tiles", a))
                        },
                        _tileMapCallback: function(b, c) {
                            this._loading.contains(c) && (this._loading.remove(c), this.updating = this._loading.length, b !== c && (b = new a([b.col,
                                b.row, b.level, 0
                            ], this.tileInfoView.getInfoForZoom(b.level)), b.world = c.world), this.add(b.id, b))
                        },
                        _tilesAdded: function(a) {
                            var b, c, d;
                            b = 0;
                            for (c = a.length; b < c; b++) d = a[b], !this._loading.contains(d) && !this.contains(d) && (this._loading.add(d), this.updating = this._loading.length, this.tileMap.getTile(d, this._tileMapCallback))
                        },
                        _tilesRemoved: function(a) {
                            this._loading.removeMany(a);
                            this.removeMany(a)
                        },
                        _colChange: function(a) {
                            0 < a.added.length && this._tilesAdded(a.added);
                            0 < a.removed.length && this._tilesRemoved(a.removed)
                        }
                    }),
                    s = c.createSubclass({
                        declaredClass: "TileLoader",
                        properties: {
                            updating: !1,
                            loader: {},
                            tileInfoView: {},
                            layer: {},
                            tiles: {},
                            view: {}
                        },
                        constructor: function() {
                            this._tileLoadHandler = this._tileLoadHandler.bind(this);
                            this._tileErrorHandler = this._tileErrorHandler.bind(this);
                            this._loadingList = [];
                            this._removingList = []
                        },
                        destroy: function() {
                            this._viewHdl.remove();
                            this._viewHdl = null
                        },
                        initialize: function() {
                            this._viewHdl = this.view.watch("stationary", function(a) {
                                if (a && !this._loadingList.length && (!this.tiles._loading || !this.tiles._loading.length)) a =
                                    this._removingList.map(function(a) {
                                        return this.find(function(b) {
                                            return a === b.tile
                                        })
                                    }.bind(this)), this.removeMany(a), this._removingList.length = 0, this.updating = this._loadingList.length
                            }.bind(this))
                        },
                        _hdl: null,
                        _tilesSetter: function(a) {
                            var b = this._hdl;
                            this._get("tiles") !== a && (b && (this.removeAll(), b.remove(), b = null), a && (this._tilesAdded(a.toArray()), b = a.on("change", this._colChange.bind(this))), this._hld = b, this._set("tiles", a))
                        },
                        _tilesAdded: function(a) {
                            var b, c, d;
                            b = 0;
                            for (c = a.length; b < c; b++) d = a[b], this._loadingList.push(d),
                                this.updating = !0, this.loader.load({
                                    id: d.id,
                                    url: this.layer.getTileUrl(d.level, d.row, d.col),
                                    tile: d,
                                    loadCallback: this._tileLoadHandler,
                                    errorCallback: this._tileErrorHandler
                                })
                        },
                        _tilesRemoved: function(a) {
                            var b, c, d, e, f, g = this._loadingList;
                            b = 0;
                            for (c = a.length; b < c; b++)
                                if (f = a[b], f.bitmap) this._removingList.push(f);
                                else {
                                    d = 0;
                                    for (e = g.length; d < e; d++)
                                        if (g[d] === f) {
                                            g.splice(d, 1);
                                            break
                                        }
                                    this.loader.cancel(f.id);
                                    this._removeIntersectingTiles(f)
                                }
                            this.updating = g.length
                        },
                        _colChange: function(a) {
                            0 < a.added.length && this._tilesAdded(a.added);
                            0 < a.removed.length && this._tilesRemoved(a.removed)
                        },
                        _tileLoadHandler: function(a) {
                            var b = a.request.tile,
                                c = this._loadingList,
                                d;
                            this.add({
                                tile: b,
                                data: a.data
                            });
                            a = 0;
                            for (d = c.length; a < d; a++)
                                if (c[a] === b) {
                                    c.splice(a, 1);
                                    break
                                }
                            this.view.stationary && !c.length && (!this.tiles._loading || !this.tiles._loading.length) ? (b = this._removingList.map(function(a) {
                                return this.find(function(b) {
                                    return a === b.tile
                                })
                            }.bind(this)), this.removeMany(b), this._removingList.length = 0) : this._removeIntersectingTiles(b);
                            this.updating = c.length
                        },
                        _removeIntersectingTiles: function(a) {
                            var b = this._loadingList,
                                c = this._removingList,
                                d, e, f, g = !1;
                            for (e = c.length - 1; 0 <= e; e--)
                                if (d = c[e], a.intersects(d)) {
                                    for (f = b.length - 1; 0 <= f; f--) d.intersects(b[f]) && (g = !0);
                                    g || (c.splice(e, 1), this.removeAt(this.findIndex(function(a) {
                                        return a.tile === d
                                    })))
                                }
                        },
                        _tileErrorHandler: function(a) {}
                    });
                return k
            })
        },
        "esri/views/2d/ResourceLoader": function() {
            define(["../../core/declare", "dojo/_base/lang", "dojo/_base/array"], function(h, k, c) {
                var e = h(null, {
                        constructor: function() {
                            this._requestIds = {};
                            this._queue = []
                        },
                        add: function(a, b) {
                            this.contains(a) || (this._requestIds[a] = b, this._queue.push(b))
                        },
                        contains: function(a) {
                            return null != this._requestIds[a]
                        },
                        get: function(a) {
                            for (var b = [], c; !this.isEmpty() && b.length < a;) c = this._queue.pop(), delete this._requestIds[c.id], b.push(c);
                            return b
                        },
                        remove: function(a) {
                            if (!this.contains(a)) return null;
                            var b = this._requestIds[a];
                            this._queue.splice(c.indexOf(this._queue, b), 1);
                            delete this._requestIds[a];
                            return b
                        },
                        isEmpty: function() {
                            return 0 === this._queue.length
                        }
                    }),
                    b =
                    h(null, {
                        constructor: function(a) {
                            a = k.mixin({
                                loaders: {},
                                contentType: "img",
                                activeRequests: {},
                                numActiveRequests: 0,
                                maxActiveRequests: 10
                            }, a || {});
                            k.mixin(this, a);
                            this._requestLoadHandler = this._requestLoadHandler.bind(this);
                            this._requestErrorHandler = this._requestErrorHandler.bind(this);
                            this.queue || (this.queue = new e)
                        },
                        paused: !1,
                        pause: function() {
                            this.paused = !0
                        },
                        resume: function() {
                            this.paused = !1;
                            this._next()
                        },
                        load: function(a) {
                            var b = a.id;
                            !this.activeRequests[b] && !this.queue.contains(b) && (this.queue.add(b, a), this._next());
                            return b
                        },
                        cancel: function(a) {
                            this.queue.contains(a) ? (a = this.queue.remove(a), this._requestErrorHandler({
                                request: a,
                                canceled: !0
                            })) : this.activeRequests[a] && this.activeRequests[a].cancel()
                        },
                        dispose: function(a) {
                            var b = this.getLoader(a.contentType || this.contentType);
                            b && b.dispose && b.dispose(a.data)
                        },
                        registerLoader: function(a, b) {
                            k.isArray(a) ? c.forEach(a, function(a) {
                                this.registerLoader(a, b)
                            }) : this.loaders[a.toLowerCase()] = b
                        },
                        getLoader: function(a) {
                            a = a.toLowerCase();
                            var c = b.getLoader(a);
                            a = this.loaders[a];
                            return !a &&
                                !c ? null : a || c
                        },
                        _next: function() {
                            this.paused || (this.queue.isEmpty() ? 0 === this.numActiveRequests && (this.running = !1) : this.numActiveRequests < this.maxActiveRequests && this._loadRequests(this.queue.get(this.maxActiveRequests - this.numActiveRequests)))
                        },
                        _loadRequests: function(a) {
                            var b, c, e = a.length;
                            for (c = 0; c < e; c++) b = a[c], this._loadRequest(b)
                        },
                        _loadRequest: function(a) {
                            var b = a.contentType || this.contentType,
                                c = this.getLoader(b);
                            this.numActiveRequests++;
                            b ? c ? (b = c.load(a, this._requestLoadHandler, this._requestErrorHandler)) &&
                                (this.activeRequests[a.id] = b) : (a.error = "No loader for contentType:" + b, this._requestErrorHandler({
                                    request: a
                                })) : (a.error = "contentType not set", this._requestErrorHandler({
                                    request: a
                                }))
                        },
                        _requestLoadHandler: function(a) {
                            this.numActiveRequests--;
                            this.activeRequests[a.request.id] && delete this.activeRequests[a.request.id];
                            a.canceled ? a.request.errorCallback.call(this, a) : a.request.loadCallback.call(this, a);
                            this._next()
                        },
                        _requestErrorHandler: function(a) {
                            this.activeRequests[a.request.id] && (this.numActiveRequests--,
                                delete this.activeRequests[a.request.id]);
                            a.request.errorCallback.call(null, a);
                            this._next()
                        }
                    });
                b.loaders = {};
                b.registerLoader = function(a, e) {
                    k.isArray(a) ? c.forEach(a, function(a) {
                        b.registerLoader(a, e)
                    }) : b.loaders[a.toLowerCase()] = e
                };
                b.getLoader = function(a) {
                    a = a.toLowerCase();
                    return void 0 === b.loaders[a] ? void 0 : b.loaders[a]
                };
                b.registerLoader("img", {
                    load: function(a, b, c) {
                        var e = document.createElement("img");
                        e.setAttribute("alt", "");
                        e.onload = function(c) {
                            e.onload = e.onerror = null;
                            c.canceled || b.call(this, {
                                request: a,
                                data: e
                            })
                        };
                        e.onerror = function(b) {
                            e.onload = e.onerror = null;
                            c.call(this, {
                                request: a,
                                error: b
                            })
                        };
                        e.src = a.url;
                        return {
                            cancel: function() {
                                e.onload = e.onerror = null;
                                c.call(this, {
                                    request: a,
                                    canceled: !0
                                })
                            }
                        }
                    }
                });
                return b
            })
        },
        "esri/views/2d/TileInfoView": function() {
            define(["../../core/declare", "../../core/Accessoire", "./LODInfo"], function(h, k, c) {
                var e = Math.max,
                    b = Math.min,
                    a = Math.floor,
                    f = Math.ceil,
                    g = function(a, b, c, e) {
                        this.lodInfo = a;
                        this.row = b;
                        this.colFrom = c;
                        this.colTo = e
                    },
                    l = function(a, b, c, e, f, g, h, k) {
                        this.x = a;
                        this.ymin = b;
                        this.ymax = c;
                        this.invM = e;
                        this.leftAdjust = f;
                        this.rightAdjust = g;
                        this.leftBound = h;
                        this.rightBound = k
                    };
                l.prototype.incrRow = function() {
                    this.x += this.invM
                };
                l.prototype.getLeftCol = function() {
                    return e(this.x + this.leftAdjust, this.leftBound)
                };
                l.prototype.getRightCol = function() {
                    return b(this.x + this.rightAdjust, this.rightBound)
                };
                l.create = function(b, c) {
                    var e;
                    b[1] > c[1] && (e = b, b = c, c = e);
                    e = b[0];
                    var g = b[1],
                        h = c[0],
                        k = c[1],
                        m = h - e,
                        n = k - g,
                        n = 0 !== n ? m / n : 0,
                        u = (f(g) - g) * n,
                        z = (a(g) - g) * n;
                    return new l(e, a(g), f(k), n, 0 > m ? u : z, 0 > m ? z : u, 0 > m ?
                        h : e, 0 > m ? e : h)
                };
                var m = [
                        [0, 0],
                        [0, 0],
                        [0, 0],
                        [0, 0]
                    ],
                    n = h([k], {
                        normalizeCtorArgs: function(a) {
                            var b = a.tileInfo,
                                c = b.lods,
                                e = a.constraints || {};
                            if (c && c.length) {
                                var g = e.minZoom,
                                    f = e.maxZoom,
                                    h = e.minScale,
                                    e = e.maxScale,
                                    k = -1,
                                    l = -1,
                                    m = !1,
                                    n = !1,
                                    w;
                                for (w = 0; w < c.length; w++) !m && (0 < h && h >= c[w].scale) && (k = c[w].level, m = !0), !n && (0 < e && e >= c[w].scale) && (l = 0 < w ? c[w - 1].level : -1, n = !0);
                                null == g && (g = null == h ? c[0].level : k);
                                null == f && (f = null == e ? c[c.length - 1].level : l)
                            }
                            return {
                                tileInfo: b,
                                fullExtent: a.fullExtent,
                                constraints: {
                                    minZoom: g,
                                    maxZoom: f
                                }
                            }
                        },
                        getDefaults: function(a) {
                            return {
                                wrap: a.tileInfo.spatialReference.isWrappable
                            }
                        },
                        initialize: function() {
                            var a = this.tileInfo,
                                b = this.fullExtent,
                                e = this.dpi / a.dpi,
                                g = this.constraints || {
                                    minZoom: -Infinity,
                                    maxZoom: Infinity
                                },
                                f = g.minZoom,
                                h = g.maxZoom,
                                g = a.lods;
                            this._infoByZoom = {};
                            this._infoByScale = {};
                            this.zooms = [];
                            this.scales = [];
                            g = g.map(function(a) {
                                a = a.clone();
                                a.scale *= e;
                                return a
                            }).filter(function(a) {
                                return a.level >= f && a.level <= h
                            }).sort(function(a, b) {
                                return b.scale - a.scale
                            });
                            this.lodInfos = g.map(function(e) {
                                return new c(a,
                                    e, b)
                            });
                            g.forEach(function(a, b) {
                                this._infoByZoom[a.level] = this.lodInfos[b];
                                this._infoByScale[a.scale] = this.lodInfos[b];
                                this.zooms[b] = a.level;
                                this.scales[b] = a.scale
                            }, this);
                            this.lods = g;
                            f = this.zooms[0];
                            h = this.zooms[this.zooms.length - 1];
                            this.constraints = {
                                minZoom: f,
                                maxZoom: h,
                                minScale: this._infoByZoom[f].scale,
                                maxScale: this._infoByZoom[h].scale
                            };
                            this.wrap = this.wrap && a.spatialReference.isWrappable
                        },
                        _infoByZoom: null,
                        _infoByScale: null,
                        constraints: null,
                        dpi: 96,
                        lods: null,
                        scales: null,
                        wrap: !1,
                        zooms: null,
                        getZoomForScale: function(a) {
                            var b =
                                this.lods,
                                c = null,
                                e = null,
                                g = 0,
                                f = b.length - 1;
                            for (g; g < f; g++) {
                                c = b[g];
                                e = b[g + 1];
                                if (c.scale <= a) return c.level;
                                if (e.scale === a) return e.level;
                                if (c.scale > a && e.scale < a) return e.level - (a - e.scale) / (c.scale - e.scale)
                            }
                        },
                        getScaleForZoom: function(a) {
                            var b = this.lods,
                                c = null,
                                e = null,
                                g = 0,
                                f = b.length - 1;
                            for (g; g < f; g++) {
                                c = b[g];
                                e = b[g + 1];
                                if (c.level <= a) return c.scale;
                                if (e.level === a) return e.scale;
                                if (c.level > a && e.level < a) return e.scale - (a - e.level) / (c.level - e.level)
                            }
                        },
                        getInfoForZoom: function(a) {
                            return this._infoByZoom[a]
                        },
                        getInfoForScale: function(a) {
                            return this._infoByScale[a]
                        },
                        getTileOrigin: function(a, b) {
                            var c = this._infoByZoom[b[2]];
                            return !c ? null : c.getTileOrigin(a, b)
                        },
                        getTileSpans: function(c) {
                            var f = this._getClosestInfoForScale(c.scale),
                                h = this.wrap,
                                k;
                            k = Infinity;
                            var n = -Infinity,
                                r, s, v, u, z = [],
                                y, w = [];
                            m[0][0] = m[0][1] = m[1][1] = m[3][0] = 0;
                            m[1][0] = m[2][0] = c.size[0];
                            m[2][1] = m[3][1] = c.size[1];
                            y = m.map(function(a) {
                                c.toMap(a, a);
                                a[0] = f.toGridCol(a[0]);
                                a[1] = f.toGridRow(a[1]);
                                return a
                            });
                            u = 3;
                            for (v = 0; 4 > v; v++) y[v][1] !== y[u][1] && (u = l.create(y[v], y[u]), k = b(u.ymin, k), n = e(u.ymax, n), void 0 === z[u.ymin] &&
                                (z[u.ymin] = []), z[u.ymin].push(u)), u = v;
                            if (null == k || null == n || 100 < n - k) return [];
                            for (y = []; k < n;) {
                                null != z[k] && (y = y.concat(z[k]));
                                r = Infinity;
                                s = -Infinity;
                                for (v = y.length - 1; 0 <= v; v--) u = y[v], r = b(r, u.getLeftCol()), s = e(s, u.getRightCol());
                                r = a(r);
                                s = a(s);
                                if (k >= f.start[1] && k <= f.end[1])
                                    if (h)
                                        if (f.size[0] < f.worldSize[0]) {
                                            v = a(r / f.worldSize[0]);
                                            for (u = a(s / f.worldSize[0]); v <= u; v++) w.push(new g(f, k, e(f.getWorldStartCol(v), r), b(f.getWorldEndCol(v), s)))
                                        } else w.push(new g(f, k, r, s));
                                else r > f.end[0] || s < f.start[0] || (r = e(r, f.start[0]),
                                    s = b(s, f.end[0]), w.push(new g(f, k, r, s)));
                                k += 1;
                                for (v = y.length - 1; 0 <= v; v--) u = y[v], u.ymax >= k ? u.incrRow() : y.splice(v, 1)
                            }
                            return w
                        },
                        clone: function() {
                            return new n(this.tileInfo ? this.tileInfo.clone() : null)
                        },
                        _getClosestInfoForScale: function(a) {
                            var b = this.scales;
                            this._infoByScale[a] || (a = b.reduce(function(b, c, e, f) {
                                return Math.abs(c - a) < Math.abs(b - a) ? c : b
                            }, b[0], this));
                            return this._infoByScale[a]
                        }
                    });
                return n
            })
        },
        "esri/views/2d/LODInfo": function() {
            define(["./math/vec2", "./Tile"], function(h, k) {
                var c = function(c, b, a) {
                    this.z =
                        b.level;
                    this.scale = b.scale;
                    var f = c.spatialReference._getInfo(),
                        g = h.fromValues(c.origin.x, c.origin.y),
                        k = h.fromValues(c.cols * b.resolution, c.rows * b.resolution),
                        m = h.fromValues(-Infinity, -Infinity),
                        n = h.fromValues(Infinity, Infinity),
                        d = h.fromValues(Infinity, Infinity);
                    a && (h.set(m, Math.max(0, Math.floor((a.xmin - g[0]) / k[0])), Math.max(0, Math.floor((g[1] - a.ymax) / k[1]))), h.set(n, Math.max(0, Math.floor((a.xmax - g[0]) / k[0])), Math.max(0, Math.floor((g[1] - a.ymin) / k[1]))), h.set(d, n[0] - m[0] + 1, n[1] - m[1] + 1));
                    this.origin =
                        g;
                    this.norm = k;
                    this.start = m;
                    this.end = n;
                    this.size = d;
                    this.resolution = b.resolution;
                    f ? (this.worldSize = h.set(h.create(), Math.ceil(Math.round(2 * f.origin[1] / b.resolution) / c.cols), d[1]), this.worldStart = h.set(h.create(), Math.floor((f.origin[0] - g[0]) / k[0]), m[1]), this.worldEnd = h.set(h.create(), this.worldSize[0] - this.worldStart[0] - 1, n[1]), this.wrap = !0) : (this.worldStart = m, this.wldEnd = n, this.worldSize = d, this.wrap = !1)
                };
                c.prototype = {
                    normalizeX: function(c) {
                        if (!this.wrap) return c;
                        var b = this.worldSize[0];
                        return 0 > c ?
                            b - 1 - Math.abs((c + 1) % b) : c % b
                    },
                    getXForWorld: function(c, b) {
                        return !this.wrap ? c : this.worldSize[0] * b + c
                    },
                    getWorldForX: function(c) {
                        return !this.wrap ? c : Math.floor(c / this.worldSize[0])
                    },
                    getWorldStartCol: function(c) {
                        return c * this.worldSize[0] + this.start[0]
                    },
                    getWorldEndCol: function(c) {
                        return c * this.worldSize[0] + this.start[0] + this.size[0] - 1
                    },
                    toGridCol: function(c) {
                        return (c - this.origin[0]) / this.norm[0]
                    },
                    toGridRow: function(c) {
                        return (this.origin[1] - c) / this.norm[1]
                    },
                    getTileOrigin: function(c, b) {
                        var a = this.origin,
                            f = this.norm;
                        return h.set(c, a[0] + this.getXForWorld(b[0], b[3]) * f[0], a[1] - b[1] * f[1])
                    },
                    getIntersectingTile: function(c) {
                        var b = this.resolution,
                            a = c.lodInfo.resolution;
                        if (c.coords[2] < this.z) return null;
                        b = [Math.floor(c.coords[0] * a / b + 0.01), Math.floor(c.row * a / b + 0.01), this.z, 0];
                        b[3] = this.getXForWorld(b[0], c.world);
                        return new k(b, this)
                    }
                };
                return c
            })
        },
        "esri/views/2d/Tile": function() {
            define([], function() {
                var h = function(k, c) {
                    this.coords = k;
                    this.id = h.getId(k);
                    this.lodInfo = c
                };
                h.prototype = {
                    clone: function() {
                        return new h(this.coords,
                            this.lodInfo)
                    },
                    intersects: function(h) {
                        var c = this.coords,
                            e = h.coords,
                            b = this.lodInfo;
                        if (c[2] === e[2]) return c[3] === e[3] && c[1] === e[1];
                        e = c[2] < e[2] ? c : e;
                        b = (e === c ? this : h).lodInfo;
                        h = b.getIntersectingTile(e === c ? h : this).coords;
                        return e[2] === h[2] && e[1] === h[1] && e[3] === h[3]
                    }
                };
                Object.defineProperties(h.prototype, {
                    level: {
                        get: function() {
                            return this.coords[2]
                        }
                    },
                    row: {
                        get: function() {
                            return this.coords[1]
                        }
                    },
                    col: {
                        get: function() {
                            return this.coords[0]
                        }
                    },
                    world: {
                        get: function() {
                            return this.coords[3]
                        },
                        set: function(k) {
                            var c = this.coords;
                            c[3] = k;
                            c[0] = this.lodInfo.getXForWorld(c[0], k);
                            this.id = h.getId(c)
                        }
                    }
                });
                h.getId = function(h, c, e, b) {
                    return (Array.isArray(h) ? h : null != b ? [h, c, e, b] : [h, c, e]).join("/")
                };
                return h
            })
        },
        "esri/views/2d/collections/ReferenceMap": function() {
            define(["../../../core/Collection"], function(h) {
                return h.createSubclass({
                    constructor: function() {
                        this._itemById = {};
                        this._itemToKeys = {};
                        this._keyToItem = {}
                    },
                    add: function(h, c) {
                        var e = this.hash(h),
                            b = this.hash(c),
                            a = this._itemToKeys[b];
                        c = this._itemById[b] ? this._itemById[b] : c;
                        this._keyToItem[e] =
                            c;
                        a || (this._itemById[b] = c, this._itemToKeys[b] = a = [], this.getInherited(arguments).call(this, c));
                        a.push(e)
                    },
                    remove: function(h) {
                        return this.removeMany([h])
                    },
                    removeMany: function(h) {
                        if (!h || !h.length) return null;
                        var c, e, b, a, f, g = [];
                        for (c = h.length - 1; 0 <= c; c--)
                            if (e = this.hash(h[c]), b = this.getItem(e)) delete this._keyToItem[e], a = this.hash(b), f = this._itemToKeys[a], f.splice(f.indexOf(e), 1), f.length || (delete this._itemToKeys[a], delete this._itemById[a], g.push(b));
                        this.getInherited(arguments).call(this, g);
                        return g
                    },
                    getItem: function(h) {
                        return this._keyToItem[this.hash(h)]
                    },
                    contains: function(h) {
                        return null != this.getItem(h)
                    },
                    hash: function(h) {
                        return h && h.id ? h.id : h
                    }
                })
            })
        },
        "esri/views/2d/collections/Set": function() {
            define(["../../../core/Collection"], function(h) {
                return h.createSubclass({
                    constructor: function() {
                        this._index = {}
                    },
                    add: function(h) {
                        if (!this.contains(h)) {
                            var c = this.hash(h);
                            this._index[c] = h;
                            this.inherited(arguments)
                        }
                    },
                    addMany: function(h) {
                        var c, e, b;
                        for (c = h.length - 1; 0 <= c; c--) e = h[c], b = this.hash(e), this.contains(b) ?
                            h.splice(c, 1) : this._index[b] = e;
                        return this.getInherited(arguments).call(this, h)
                    },
                    remove: function(h) {
                        var c = this.hash(h);
                        this.contains(c) ? (h = this.getItem(c), delete this._index[c], this.getInherited(arguments).call(this, h)) : h = null;
                        return h
                    },
                    removeMany: function(h) {
                        if (!h || !h.length) return null;
                        var c, e;
                        h = h.slice(0);
                        for (c = h.length - 1; 0 <= c; c--) e = this.hash(h[c]), this.contains(e) ? (h[c] = this.getItem(e), delete this._index[e]) : h.splice(c, 1);
                        return this.getInherited(arguments).call(this, h)
                    },
                    getItem: function(h) {
                        return this._index[this.hash(h)]
                    },
                    contains: function(h) {
                        return !!this.getItem(h)
                    },
                    removeAll: function() {
                        this._index = {};
                        this.inherited(arguments)
                    },
                    keys: function() {
                        var h = this._index,
                            c = [],
                            e;
                        for (e in h) h.hasOwnProperty(e) && c.push(e);
                        return c
                    },
                    hash: function(h) {
                        return h && h.id ? h.id : h
                    }
                })
            })
        },
        "esri/views/2d/engine/Bitmap": function() {
            define(["./DisplayObject"], function(h) {
                return h.createSubclass({
                    declaredClass: "esri.views.2d.engine.Bitmap",
                    className: "esri-bitmap",
                    source: null,
                    _sourceSetter: function(h) {
                        var c = this._get("source");
                        h !== c && (h.className =
                            this.className, this.surface = h, this.requestRender(), this._set("source", h))
                    }
                })
            })
        },
        "esri/views/2d/layers/TileQueue": function() {
            define(["../../../core/declare", "dojo/_base/lang"], function(h, k) {
                var c = function() {
                    this.requests = []
                };
                return h(null, {
                    constructor: function(c) {
                        k.mixin(this, c);
                        this._scales = [];
                        this._scaleBins = {};
                        this._levelToScale = {};
                        c.tileInfo.lods.forEach(function(b) {
                            this._levelToScale[b.level] = b.scale
                        }, this);
                        this._requestIds = {}
                    },
                    _minScale: 0,
                    _maxScale: -1,
                    _scales: null,
                    _scaleBins: null,
                    _levelToScale: null,
                    _requestIds: null,
                    add: function(e, b) {
                        if (!this.contains(e)) {
                            var a = this._levelToScale[b.tile.level];
                            this._maxScale < this._minScale ? this._minScale = this._maxScale = a : (a < this._minScale && (this._minScale = a), a > this._maxScale && (this._maxScale = a));
                            var f = this._scaleBins[a];
                            f || (this._scales.push(a), this._scales.sort(this._sortNumbers), f = this._scaleBins[a] = new c);
                            f.requests.push(b);
                            this._requestIds[e] = b
                        }
                    },
                    get: function(c) {
                        var b = [],
                            a = this.state.scale,
                            f = this.state.x,
                            g = this.state.y,
                            h = this._scales,
                            k = this.tileInfo,
                            n, d,
                            q;
                        for (null == c && (c = 1); b.length < c && this._minScale <= this._maxScale;) {
                            q = this._scaleBins[a];
                            if (!q) {
                                if (a < this._minScale) a = this._minScale;
                                else if (a > this._maxScale) a = this._maxScale;
                                else {
                                    n = 1;
                                    for (d = h.length; n < d; n++) a < h[n] && (a = a - h[n - 1] < h[n] - a ? h[n - 1] : h[n])
                                }
                                q = this._scaleBins[a]
                            }
                            d = 1 / a / k.rows;
                            n = 1 / a / k.cols;
                            for (q.requests.sort(this._sortRequests((f - k.origin.x) * n, (k.origin.y - g) * d)); b.length < c && 0 < q.requests.length;) b.push(this._remove(q, a, q.requests[0]))
                        }
                        return b
                    },
                    contains: function(c) {
                        return void 0 !== this._requestIds[c]
                    },
                    remove: function(c) {
                        c = this._requestIds[c];
                        var b, a;
                        c && (b = this._levelToScale[c.tile.level], a = this._scaleBins[b], this._remove(a, b, c));
                        return c
                    },
                    isEmpty: function() {
                        return this._minScale > this._maxScale
                    },
                    _remove: function(c, b, a) {
                        c.requests.splice(c.requests.indexOf(a), 1);
                        c.requests.length || (this._scales.splice(this._scales.indexOf(b), 1), delete this._scaleBins[b], this._scales.sort(), 0 < this._scales.length ? (this._minScale = this._scales[0], this._maxScale = this._scales[this._scales.length - 1]) : (this._minScale = 0,
                            this._maxScale = -1));
                        delete this._requestIds[a.id];
                        return a
                    },
                    _sortNumbers: function(c, b) {
                        return c - b
                    },
                    _sortRequests: function(c, b) {
                        return function(a, f) {
                            a = a.tile;
                            f = f.tile;
                            return Math.sqrt((c - a.c) * (c - a.c) + (b - a.row) * (b - a.row)) - Math.sqrt((c - f.c) * (c - f.c) + (b - f.row) * (b - f.row))
                        }
                    }
                })
            })
        },
        "*noref": 1
    }
});
define("../core/declare dojo/_base/lang dojo/_base/kernel dojo/promise/all ../core/Collection ../core/Scheduler ../geometry/Point ../geometry/Extent ../geometry/ScreenPoint ./View ./ViewAnimation ./inputs/GestureManager ./2d/AnimationManager ./2d/PaddedViewState ./2d/viewpointUtils ./2d/MapViewConstraints ./2d/layers/GraphicsView2D ./2d/handlers/Navigation ./ui/2d/DefaultUI2D ./ui/ZoomBox ./2d/engine/Stage ../core/accessorSupport/get ../core/watchUtils".split(" "), function(h, k, c, e, b, a, f, g, l, m, n, d,
    q, t, p, A, r, s, v, u, z, y, w) {
    y = y.get;
    return h([m], {
        declaredClass: "esri.views.MapView",
        classMetadata: {
            properties: {
                constraints: {
                    type: A
                },
                center: {
                    type: f,
                    copy: function(a, b) {
                        a.x = b.x;
                        a.y = b.y;
                        a.spatialReference = b.spatialReference
                    },
                    dependsOn: ["content.center"]
                },
                extent: {
                    type: g,
                    copy: function(a, b) {
                        a.xmin = b.xmin;
                        a.ymin = b.ymin;
                        a.xmax = b.xmax;
                        a.ymax = b.ymax;
                        a.spatialReference = b.spatialReference
                    },
                    dependsOn: ["content.extent"]
                },
                initialExtentRequired: {
                    dependsOn: ["map.initialViewProperties.viewpoint"],
                    getter: function() {
                        return this.get("map.initialViewProperties.viewpoint") ?
                            !(!this._proxyProps || !this._proxyProps.center || void 0 !== this._proxyProps.scale || this.initialExtent) : this._proxyProps ? !(this._proxyProps.extent || this._proxyProps.viewpoint || this._proxyProps.center && this._proxyProps.scale || this._proxyProps.zoom) : !this.initialExtent
                    }
                },
                rotation: {
                    dependsOn: ["content.rotation"]
                },
                scale: {
                    dependsOn: ["content.scale"]
                },
                spatialReference: {
                    dependsOn: ["map.initialViewProperties.spatialReference"]
                },
                state: {},
                tileInfo: {
                    dependsOn: ["map.initialViewProperties.viewpoint", "map.layers",
                        "map.basemap"
                    ]
                },
                ui: {
                    type: v
                },
                viewpoint: {
                    copy: p.copy,
                    dependsOn: ["content.viewpoint"]
                },
                zoom: {
                    dependsOn: ["content.scale"]
                }
            }
        },
        constructor: function() {
            this._proxyProps = {};
            this._pendingUpdates = new b;
            this._updateTask = a.addFrameTask({
                update: function() {
                    this._pendingUpdates.drain(function(a) {
                        a._commitUpdate()
                    });
                    this._pendingUpdates.length || this._updateTask.pause()
                }.bind(this)
            });
            this._updateTask.pause();
            this._handles.add([this.on("resize", this._resizeHandler.bind(this))]);
            var c = this.notifyChange.bind(this, "tileInfo");
            w.on(this, "map.basemap.baseLayers", "change", c, c, c);
            w.on(this, "map.layers", "change", c, c, c);
            w.whenFalse(this, "ready", function() {
                this.stage && this.stage.removeAllChildren()
            }.bind(this))
        },
        getDefaults: function() {
            return k.mixin(this.inherited(arguments), {
                constraints: {},
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            })
        },
        initialize: function() {
            this._graphicsView = new r({
                view: this,
                graphics: this.graphics
            })
        },
        destroy: function() {
            this._graphicsView.destroy()
        },
        _pendingUpdates: null,
        _graphicsView: null,
        _zoomBox: null,
        className: "esriMapView",
        resizeAlign: "center",
        animation: null,
        _animationSetter: function(a, b) {
            b && b.stop();
            return a && !a.isFulfilled() ? (a.then(function() {
                this.animation = null
            }.bind(this), function() {
                this.animation = null
            }.bind(this), function(a) {
                this.state.viewpoint = a
            }.bind(this)), a) : null
        },
        center: null,
        _centerGetter: function(a) {
            if (this._proxyProps) return this._proxyProps.center;
            a || (a = new f);
            var b = this.content.center,
                c = this.content.spatialReference;
            a.x = b[0];
            a.y = b[1];
            a.spatialReference = c;
            return a
        },
        _centerSetter: function(a) {
            if (null !=
                a)
                if (this._proxyProps) this._proxyProps.center = a, null != this._proxyProps.center && null != this._proxyProps.scale && (this.initialExtentRequired = !1);
                else {
                    var b = this.viewpoint;
                    p.centerAt(b, b, a);
                    this.viewpoint = b
                }
        },
        constraints: null,
        _constraintsSetter: function(a, b) {
            b && (this._handles.remove("constraints"), b.view = null);
            a && (this._ready && (a.view = this, this.state.viewpoint = a.constrain(this.content.viewpoint, null, this)), this._handles.add(a.on("update", function() {
                this._ready && this.state && (this.state.viewpoint = a.constrain(this.content.viewpoint,
                    null, this))
            }.bind(this)), "constraints"));
            return a
        },
        extent: null,
        _extentGetter: function(a) {
            if (this._proxyProps) return this._proxyProps.extent;
            a || (a = new g);
            var b = this.content.extent;
            a.xmin = b.xmin;
            a.ymin = b.ymin;
            a.xmax = b.xmax;
            a.ymax = b.ymax;
            a.spatialReference = b.spatialReference;
            return a
        },
        _extentSetter: function(a) {
            if (null != a)
                if (this._proxyProps) this._proxyProps.extent = a, this.initialExtentRequired = !1;
                else {
                    var b = this.viewpoint;
                    p.setExtent(b, b, a, this.size, {
                        constraints: this.constraints
                    });
                    this.viewpoint = b
                }
        },
        _paddingGetter: function() {
            return this._proxyProps ? this._proxyProps.padding : this.state.padding
        },
        _paddingSetter: function(a) {
            a = k.mixin({
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            }, a);
            if (this._proxyProps) return this._proxyProps.padding = a;
            this.state.padding = a;
            return this.state.padding
        },
        rotation: 0,
        _rotationGetter: function() {
            return this._proxyProps ? this._proxyProps.rotation : this.content.rotation
        },
        _rotationSetter: function(a) {
            if (null != a)
                if (this._proxyProps) this._proxyProps.rotation = a;
                else {
                    var b = this.viewpoint;
                    p.rotateTo(b,
                        b, a);
                    this.viewpoint = b
                }
        },
        scale: 0,
        _scaleGetter: function() {
            return this._proxyProps ? this._proxyProps.scale : this.content.scale
        },
        _scaleSetter: function(a) {
            if (null != a)
                if (this._proxyProps) this._proxyProps.scale = a, null != this._proxyProps.center && null != this._proxyProps.scale && (this.initialExtentRequired = !1);
                else {
                    var b = this.viewpoint;
                    p.scaleTo(b, b, a);
                    this.viewpoint = b
                }
        },
        _surfaceSetter: function(b, c) {
            if (c === b) return c;
            c && (this.stage.destroy(), this._zoomBox.destroy(), this._zoomBox = null, this.gestureManager.destroy(),
                this.gestureManager = null);
            if (b) {
                this.stage = new z({
                    container: b,
                    scheduler: a.instance
                });
                this.gestureManager = new d({
                    view: this,
                    surface: b,
                    inputOptions: {
                        mouseModifiers: !0
                    }
                });
                var e = new s({
                    view: this
                });
                this.addHandler(e);
                this._zoomBox = new u({
                    view: this
                })
            }
            return b
        },
        _tileInfoGetter: function() {
            return y(this, "map.basemap.baseLayers.0.tileInfo") || y(this, "map.layers.0.tileInfo")
        },
        type: "2d",
        viewpoint: null,
        _viewpointGetter: function(a) {
            var b = this._proxyProps ? this._proxyProps.viewpoint : this.content.viewpoint;
            return !b ?
                b : !a ? b.clone() : p.copy(a, b)
        },
        _viewpointSetter: function(a) {
            null != a && (this._proxyProps ? (this._proxyProps.viewpoint = a, this.initialExtentRequired = !1) : (this.constraints.constrain(a, this.content.viewpoint, this), this.state.viewpoint = a))
        },
        zoom: -1,
        _zoomGetter: function() {
            return this._proxyProps ? this._proxyProps.zoom : this.constraints.scaleToZoom(this.scale)
        },
        _zoomSetter: function(a) {
            if (null != a) {
                if (this._proxyProps) return this._proxyProps.zoom = a, this.initialExtentRequired = !1, a;
                if (!this.constraints.effectiveLODs) return null;
                var b = this.viewpoint;
                p.scaleTo(b, b, this.constraints.zoomToScale(a));
                this.viewpoint = b
            }
        },
        goTo: function(a, b) {
            var c = this.content;
            b = k.mixin({
                animate: !0
            }, b, {
                spatialReference: this.spatialReference || null,
                size: c ? c.size : this.size,
                currentViewpoint: c ? c.viewpoint : this.viewpoint,
                constraints: this.constraints,
                snapToZoom: this.constraints.snapToZoom
            });
            return p.createAsync(a, b).then(function(a) {
                if (b.animate) {
                    var c = null;
                    if (!this.ready || !this.animationManager) return this.viewpoint = a, c = new n({
                        target: a
                    }), c.finish(), c;
                    this.constraints.constrain(a,
                        this.viewpoint, this);
                    return c = this.animation = this.animationManager.animateTo(a, this.viewpoint, b)
                }
                this.viewpoint = a
            }.bind(this))
        },
        animateTo: function(a, b) {
            c.deprecated(this.declaredClass + ".animateTo is deprecated. Use .goTo instead.", "", "4.0");
            return this.goTo(a, b)
        },
        hitTest: function(a, b) {
            if (!this.ready) return null;
            var c;
            c = null != a && a.x ? a : {
                x: a,
                y: b
            };
            var d = this.toMap(c),
                f = [this._graphicsView].concat(this.allLayerViews.toArray());
            return e(f.map(function(c) {
                return !c.hitTest ? null : c.hitTest(a, b)
            })).then(function(a) {
                return {
                    screenPoint: c,
                    results: a.filter(function(a) {
                        return a
                    }).map(function(a) {
                        return {
                            mapPoint: d,
                            graphic: a
                        }
                    })
                }
            })
        },
        toMap: function(a, b, c) {
            if (!this.ready) return null;
            a && null != a.x && (c = b, b = a.y, a = a.x);
            var d = [0, 0];
            this.state.toMap(d, [a, b]);
            c = c || new f;
            c.x = d[0];
            c.y = d[1];
            c.spatialReference = this.spatialReference;
            return c
        },
        toScreen: function(a, b, c, d) {
            if (!this.ready) return null;
            a && null != a.x && (d = b, b = a.y, a = a.x);
            d = c || d || new l;
            a = [a, b];
            this.state.toScreen(a, a);
            d.x = a[0];
            d.y = a[1];
            return d
        },
        pixelSizeAt: function(a, b) {
            if (!this.ready) return NaN;
            a && null != a.x && (b = a.y, a = a.x);
            return this.content.pixelSizeAt([a, b])
        },
        scheduleLayerViewUpdate: function(a) {
            this._pendingUpdates.add(a);
            this.ready && this._updateTask.resume()
        },
        getDefaultSpatialReference: function() {
            return this.get("map.initialViewProperties.spatialReference") || this.get("defaultsFromMap.spatialReference")
        },
        _readyGetter: function(a) {
            var b = this.inherited(arguments);
            if (!!b === !!a) return a;
            this._ready = b;
            if (!b && a) return this._proxyProps = {
                viewpoint: this.viewpoint,
                padding: this.padding
            }, b;
            this.constraints.view =
                this;
            var c = this._proxyProps,
                d = this.get("map.initialViewProperties.viewpoint"),
                d = p.create(d && !c.center && !c.extent ? {
                    viewpoint: d
                } : c, {
                    spatialReference: this.spatialReference,
                    size: this.size,
                    constraints: this.constraints,
                    extent: this.initialExtent
                }),
                c = new t({
                    padding: c.padding,
                    size: this.size,
                    viewpoint: d
                });
            this._proxyProps = null;
            this.initialExtentRequired = !0;
            this.animationManager = new q;
            this.state = c;
            this.content = c.content;
            this._handles.remove("allLayerViews");
            this._viewsChangeHandler({
                added: this.allLayerViews.toArray(),
                removed: [],
                moved: []
            });
            this._handles.add(this.allLayerViews.on("change", this._viewsChangeHandler.bind(this)), "allLayerViews");
            this.stage.state = c;
            this.stage.run();
            this._pendingUpdates.length && this._updateTask.resume();
            return b
        },
        _viewsChangeHandler: function(a) {
            var b = this.allLayerViews.filter(function(a) {
                    return !a.layerViews
                }),
                c = a.added,
                d = a.removed;
            a = a.moved;
            var e, f;
            e = 0;
            for (f = d.length; e < f; e++) this.stage.removeChild(d[e].container);
            e = 0;
            for (f = c.length; e < f; e++) c[e].container && this.stage.addChildAt(c[e].container,
                b.indexOf(c[e]));
            e = 0;
            for (f = a.length; e < f; e++) this.stage.setChildIndex(a[e].container, b.indexOf(a[e]));
            var g = function() {
                this.updating = b.some(function(a) {
                    return a.updating
                })
            }.bind(this);
            this._handles.remove("layerViewsUpdating");
            this._handles.add(b.map(function(a) {
                return a.watch("updating", g)
            }), "layerViewsUpdating")
        },
        _resizeHandler: function(a) {
            var b = this.state;
            if (b) {
                var c = this.content.viewpoint,
                    d = this.content.size.concat();
                b.size = [a.width, a.height];
                p.resize(c, c, d, this.content.size, this.resizeAlign);
                c = this.constraints.constrain(c, null, this);
                this.state.viewpoint = c
            }
        }
    })
});
