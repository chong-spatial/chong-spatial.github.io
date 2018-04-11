// <script src="https://gitcdn.xyz/repo/cool-Blue/d3-lib/master/elapsedTime/elapsedTime/elapsed%20time%201.0.js"></script>

var ElapsedTime = (function (d3) {
	(function(){
		//polly-fill for safari
		if ("performance" in window == false) {
			window.performance = {};
		}

		Date.now = (Date.now || function () {  // thanks IE8
			return new Date().getTime();
		});

		if ("now" in window.performance == false){

			var nowOffset = Date.now();

			if (performance.timing && performance.timing.navigationStart){
				nowOffset = performance.timing.navigationStart
			}

			window.performance.now = function now(){
				return Date.now() - nowOffset;
			}
		}

	})();
	function OutputDiv() {
		//constructor
		function _OutputDiv(on, style, before) {
			//private instance state
			var _sel = d3.select(on), id = ~~(Math.random() * 1000),
				_style = merge({
					margin            : '10px 10px 10px 0',
					padding           : '3px 3px 3px 3px',
					display           : 'inline-block',
					'white-space': 'pre'
				},style || {}),
				_message = function(value) {return value};
			if (before) {
				_sel = _sel.insert('div', before)
			} else {
				_sel = _sel.append('div')
			}
			_sel = _sel.style(_style)
				.attr("id", "ouputDiv_" + id)
				.attr("class", "ouputDiv");

			//public instance state
			this.selection = _sel
			this.update = function (value) {
				this.selection.text(_message.call(this, value));
				return this
			};
			this.message = function (f) {
				_message = f;
				return this
			};
			function merge (source, target) {
				for (var p in source) if(target && !target.hasOwnProperty(p)) target[p] = source[p];
				return target;
			}
		}

		//create and initialise new instance
		return function (on, style, before) {
			return new _OutputDiv(on, style, before)
		};
	}
	function ElapsedTime(on, style, before) {
		var elapsedTime = OutputDiv()(on, style, before).update("loading...");
		elapsedTime.start = function (aveWindow) {
			this.aveLap = this.AveLap(aveWindow || 1000)
			this.startTime = window.performance.now()
			this.lapTime = this.startTime
			this.ticks = 0
			this.update(0)
			this.running = true
			return this
		}
		elapsedTime.lap = function () {
			if (this.running) {
				this.lastLap = (window.performance.now() - this.lapTime) / 1000
				this.lapTime = window.performance.now()
			}
			return this
		}
		elapsedTime.AveLap = function (aveWindow) {
			var _i = 0, _aveP = 0, _history = [];
			this.AveLap.window = aveWindow || this.AveLap.window
			return function (this_lap) {
				this_lap = this_lap || this.lap().lastLap
				if (!this.AveLap.window) return _aveP = _i++ ? (_aveP + this_lap / (_i - 1)) * (_i - 1) / _i : this.lap().lastLap;
				if (this_lap) _history.push(this_lap);
				for (; _history.length > this.AveLap.window;) {
					_history.shift()
				}
				return _history.reduce(function (ave, t, i, h) {
					return ave + t / h.length
				}, 0)
			}
		}
		elapsedTime.AveLap.window = null
		elapsedTime.t = function () {
			return d3.format(" >8,.3f")((window.performance.now() - this.startTime) / 1000)
		}
		elapsedTime.mark = function (f) {
			if (this.running) {
				var _tMark = (window.performance.now() - this.startTime);
				this.ticks += 1
				if (!f) {
					this.update(_tMark / 1000)
				} else if (f.call) {
					f.call(this, _tMark)
				} else this.update(f)
			} else {
				_tMark = 0
				//this.start()
			}
			return this
		}
		elapsedTime.message(function (value) {
			return 'time elapsed : ' + d3.format(",.3f")(value)
				+ ' sec\t' + d3.format(",d")(this.ticks)
		});
		elapsedTime.stop = function () {
			this.running = false
			return this
		}
		elapsedTime.timestamp = function (caller, message) {
			if (this.consoleOn) {
				var _caller = (caller && caller.callee) ? /function\s+(\w*)\(/.exec(caller.callee)[1] : caller ;
				this.mark(function (t) {
					console.log(d3.format(" >8,.6f")(t / 1000) + (_caller ? "\t" + _caller + (message ? "\t" + message : "") : ""))
				})
			}
		}
		elapsedTime.consoleOn = false;
		return elapsedTime;
	}
	return ElapsedTime
})(d3);


