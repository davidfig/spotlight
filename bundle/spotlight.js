(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Penner = require('penner');

/**
 * spotlight-canvas: a canvas element that dims the screen except for spotlight locations formed by circles or polygons
 */

var Spotlight = function () {
    /**
     * create a spotlight div
     * @param {object} [options]
     * @param {number} [options.x=0] use to place layer on creation
     * @param {number} [options.y=0]
     * @param {number} [options.width=window.innerWidth]
     * @param {number} [options.height=window.innerHeight]
     * @param {number} [options.color=black] color of under layer
     * @param {number} [options.alpha=0.5] alpha of under layer
     * @param {HTMLElement} [options.parent=document.body] parent of spotlight layer
     */
    function Spotlight(options) {
        _classCallCheck(this, Spotlight);

        this.options = options || {};
        this.canvas = document.createElement('canvas');
        if (!this.options.parent) {
            document.body.appendChild(this.canvas);
        } else {
            this.options.parent.appendChild(this.canvas);
        }
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = this.options.x || 0;
        this.canvas.style.left = this.options.y || 0;
        this.canvas.style.pointerEvents = 'none';

        /**
         * the list of spotlights. if manually changed then call redraw() to update the canvas
         * @type {object[]}
         */
        this.openings = [];
        this.resize();
    }

    /**
     * resize the layer to ensure entire screen is covered; also calls redraw()
     * @returns {Spotlight}
     */


    _createClass(Spotlight, [{
        key: 'resize',
        value: function resize() {
            var width = this.options.width || window.innerWidth;
            var height = this.options.height || window.innerHeight;
            this.canvas.width = width;
            this.canvas.height = height;
            this.redraw();
            return this;
        }

        /**
         * force a redraw of the spotlight (usually called internally)
         * @returns {Spotlight}
         */

    }, {
        key: 'redraw',
        value: function redraw() {
            var context = this.canvas.getContext('2d');
            context.save();
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            context.fillStyle = this.options.color || 'black';
            context.globalAlpha = this.options.alpha || 0.5;
            context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            context.restore();
            context.save();
            context.globalCompositeOperation = 'destination-out';
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.openings[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var entry = _step.value;

                    switch (entry.type) {
                        case 'circle':
                            context.beginPath();
                            context.arc(entry.x, entry.y, entry.radius, 0, Math.PI * 2);
                            context.fill();
                            break;

                        case 'rectangle':
                            context.beginPath();
                            context.fillRect(entry.x, entry.y, entry.width, entry.height);
                            break;

                        case 'polygon':
                            context.beginPath();
                            context.moveTo(entry.points[0], entry.points[1]);
                            for (var i = 2; i < entry.points.length; i += 2) {
                                context.lineTo(entry.points[i], entry.points[i + 1]);
                            }
                            context.closePath();
                            context.fill();
                            break;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            context.restore();
            return this;
        }

        /**
         * clears any cutouts
         * @param {boolean} [noRedraw] don't force a canvas redraw
         * @returns {Spotlight}
         */

    }, {
        key: 'clear',
        value: function clear(noRedraw) {
            this.openings = [];
            if (!noRedraw) {
                this.resize();
            }
            return this;
        }

        /**
         * adds a circle spotlight
         * @param {number} x
         * @param {number} y
         * @param {number} radius
         * @param {boolean} [noRedraw] don't force a canvas redraw
         * @returns {Spotlight}
         */

    }, {
        key: 'circle',
        value: function circle(x, y, radius, noRedraw) {
            this.openings.push({ type: 'circle', x: x, y: y, radius: radius });
            if (!noRedraw) {
                this.redraw();
            }
        }

        /**
         * adds a rectangle spotlight
         * @param {number} x
         * @param {number} y
         * @param {number} width
         * @param {number} height
         * @param {boolean} noRedraw don't force a canvas redraw
         * @returns {Spotlight}
         */

    }, {
        key: 'rectangle',
        value: function rectangle(x, y, width, height, noRedraw) {
            this.openings.push({ type: 'rectangle', x: x, y: y, width: width, height: height });
            if (!noRedraw) {
                this.redraw();
            }
            return this;
        }

        /**
         * adds a polygon spotlight
         * @param {number[]} points - [x1, y1, x2, y2, ... xn, yn]
         * @param {boolean} [noRedraw] don't force a canvas redraw
         * @returns {Spotlight}
         */

    }, {
        key: 'polygon',
        value: function polygon(points, noRedraw) {
            this.openings.push({ type: 'polygon', points: points });
            if (!noRedraw) {
                this.redraw();
            }
            return this;
        }

        /**
         * used internally for fade
         * @param {object} data
         * @private
         */

    }, {
        key: 'fade',
        value: function fade(data) {
            var _this = this;

            this.request = null;
            var now = performance.now();
            var difference = now - this.last;
            this.last = now;
            data.time += difference;
            if (data.time > data.duration) {
                this.canvas.style.opacity = data.end;
            } else {
                this.canvas.style.opacity = data.ease(data.time, data.start, data.end, data.duration);
                this.request = requestAnimationFrame(function () {
                    return _this.fade(data);
                });
            }
        }

        /**
         * fade in the under layer
         * @param {*} [options]
         * @param {number} [options.start=0] starting opacity
         * @param {number} [options.end=1] ending opacity
         * @param {number} [options.duration=1000] duration of fade in milliseconds
         * @param {string|Function} [options.ease='easeInOutSine'] easing function (@see https://www.npmjs.com/package/penner)
         * @returns {Spotlight}
         */

    }, {
        key: 'fadeIn',
        value: function fadeIn(options) {
            if (this.request) {
                cancelAnimationFrame(this.request);
            }
            options = options || {};
            var start = options.start || 0;
            var end = options.end || 1;
            var ease = !options.ease ? Penner.easeInOutSine : typeof options.ease === 'string' ? Penner[options.ease] : options.ease;
            this.canvas.style.opacity = start;
            var duration = options.duration || 1000;
            this.last = performance.now();
            this.fade({ time: 0, start: start, end: end, duration: duration, ease: ease });
            return this;
        }

        /**
         * fade out the under layer
         * @param {*} [options]
         * @param {number} [options.start=1] starting opacity
         * @param {number} [options.end=0] ending opacity
         * @param {number} [options.duration=1000] duration of fade in milliseconds
         * @param {string|Function} [options.ease='easeInOutSine'] easing function (@see https://www.npmjs.com/package/penner)
         * @returns {Spotlight}
         */

    }, {
        key: 'fadeOut',
        value: function fadeOut(options) {
            options = options || {};
            options.start = typeof options.start === 'undefined' ? 1 : options.start;
            options.end = typeof options.end === 'undefined' ? 0 : options.end;
            this.fadeIn(options);
            return this;
        }

        /**
         * show spotlight
         * @return {Spotlight}
         */

    }, {
        key: 'show',
        value: function show() {
            this.canvas.style.display = 'block';
            return this;
        }

        /**
         * hide spotlight
         * @return {Spotlight}
         */

    }, {
        key: 'hide',
        value: function hide() {
            this.canvas.style.display = 'none';
            return this;
        }

        /**
         * checks whether spotlight is visible
         * @returns {boolean}
         */

    }, {
        key: 'isVisible',
        value: function isVisible() {
            return this.canvas.style.display === 'block';
        }

        /**
         * removes spotlight
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            if (!this.options.parent) {
                document.body.removeChild(this.canvas);
            } else {
                this.options.parent.removeChild(this.canvas);
            }
        }
    }]);

    return Spotlight;
}();

module.exports = Spotlight;

},{"penner":2}],2:[function(require,module,exports){

/*
	Copyright © 2001 Robert Penner
	All rights reserved.

	Redistribution and use in source and binary forms, with or without modification, 
	are permitted provided that the following conditions are met:

	Redistributions of source code must retain the above copyright notice, this list of 
	conditions and the following disclaimer.
	Redistributions in binary form must reproduce the above copyright notice, this list 
	of conditions and the following disclaimer in the documentation and/or other materials 
	provided with the distribution.

	Neither the name of the author nor the names of contributors may be used to endorse 
	or promote products derived from this software without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
	EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
	MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
	COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
	EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
	GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
	AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
	OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function() {
  var penner, umd;

  umd = function(factory) {
    if (typeof exports === 'object') {
      return module.exports = factory;
    } else if (typeof define === 'function' && define.amd) {
      return define([], factory);
    } else {
      return this.penner = factory;
    }
  };

  penner = {
    linear: function(t, b, c, d) {
      return c * t / d + b;
    },
    easeInQuad: function(t, b, c, d) {
      return c * (t /= d) * t + b;
    },
    easeOutQuad: function(t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t + b;
      } else {
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
      }
    },
    easeInCubic: function(t, b, c, d) {
      return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function(t, b, c, d) {
      return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t * t + b;
      } else {
        return c / 2 * ((t -= 2) * t * t + 2) + b;
      }
    },
    easeInQuart: function(t, b, c, d) {
      return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function(t, b, c, d) {
      return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t * t * t + b;
      } else {
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
      }
    },
    easeInQuint: function(t, b, c, d) {
      return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function(t, b, c, d) {
      return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t * t * t * t + b;
      } else {
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
      }
    },
    easeInSine: function(t, b, c, d) {
      return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function(t, b, c, d) {
      return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function(t, b, c, d) {
      return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function(t, b, c, d) {
      if (t === 0) {
        return b;
      } else {
        return c * Math.pow(2, 10 * (t / d - 1)) + b;
      }
    },
    easeOutExpo: function(t, b, c, d) {
      if (t === d) {
        return b + c;
      } else {
        return c * (-Math.pow(2, -10 * t / d) + 1) + b;
      }
    },
    easeInOutExpo: function(t, b, c, d) {
      if (t === 0) {
        b;
      }
      if (t === d) {
        b + c;
      }
      if ((t /= d / 2) < 1) {
        return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
      } else {
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
      }
    },
    easeInCirc: function(t, b, c, d) {
      return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function(t, b, c, d) {
      return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
      } else {
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
      }
    },
    easeInElastic: function(t, b, c, d) {
      var a, p, s;
      s = 1.70158;
      p = 0;
      a = c;
      if (t === 0) {
        b;
      } else if ((t /= d) === 1) {
        b + c;
      }
      if (!p) {
        p = d * .3;
      }
      if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
      } else {
        s = p / (2 * Math.PI) * Math.asin(c / a);
      }
      return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function(t, b, c, d) {
      var a, p, s;
      s = 1.70158;
      p = 0;
      a = c;
      if (t === 0) {
        b;
      } else if ((t /= d) === 1) {
        b + c;
      }
      if (!p) {
        p = d * .3;
      }
      if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
      } else {
        s = p / (2 * Math.PI) * Math.asin(c / a);
      }
      return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },
    easeInOutElastic: function(t, b, c, d) {
      var a, p, s;
      s = 1.70158;
      p = 0;
      a = c;
      if (t === 0) {
        b;
      } else if ((t /= d / 2) === 2) {
        b + c;
      }
      if (!p) {
        p = d * (.3 * 1.5);
      }
      if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
      } else {
        s = p / (2 * Math.PI) * Math.asin(c / a);
      }
      if (t < 1) {
        return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
      } else {
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
      }
    },
    easeInBack: function(t, b, c, d, s) {
      if (s === void 0) {
        s = 1.70158;
      }
      return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function(t, b, c, d, s) {
      if (s === void 0) {
        s = 1.70158;
      }
      return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function(t, b, c, d, s) {
      if (s === void 0) {
        s = 1.70158;
      }
      if ((t /= d / 2) < 1) {
        return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
      } else {
        return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
      }
    },
    easeInBounce: function(t, b, c, d) {
      var v;
      v = penner.easeOutBounce(d - t, 0, c, d);
      return c - v + b;
    },
    easeOutBounce: function(t, b, c, d) {
      if ((t /= d) < 1 / 2.75) {
        return c * (7.5625 * t * t) + b;
      } else if (t < 2 / 2.75) {
        return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b;
      } else if (t < 2.5 / 2.75) {
        return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b;
      } else {
        return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
      }
    },
    easeInOutBounce: function(t, b, c, d) {
      var v;
      if (t < d / 2) {
        v = penner.easeInBounce(t * 2, 0, c, d);
        return v * .5 + b;
      } else {
        v = penner.easeOutBounce(t * 2 - d, 0, c, d);
        return v * .5 + c * .5 + b;
      }
    }
  };

  umd(penner);

}).call(this);

},{}]},{},[1]);
