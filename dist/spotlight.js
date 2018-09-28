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
            var change = data.end - data.start;
            if (data.time > data.duration) {
                this.canvas.style.opacity = data.end;
                if (data.onEnd) {
                    data.onEnd();
                }
            } else {
                this.canvas.style.opacity = data.ease(data.time, data.start, change, data.duration);
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
         * @param {Function} [options.onEnd] callback after fading
         * @returns {Spotlight}
         */

    }, {
        key: 'fadeIn',
        value: function fadeIn(options) {
            if (this.request) {
                cancelAnimationFrame(this.request);
            }
            options = options || {};
            var start = typeof options.start === 'undefined' ? 0 : options.start;
            var end = typeof options.end === 'undefined' ? 1 : options.end;
            var ease = !options.ease ? Penner.easeInOutSine : typeof options.ease === 'string' ? Penner[options.ease] : options.ease;
            var onEnd = options.onEnd;
            this.canvas.style.opacity = start;
            var duration = options.duration || 1000;
            this.last = performance.now();
            this.fade({ time: 0, start: start, end: end, duration: duration, ease: ease, onEnd: onEnd });
            return this;
        }

        /**
         * fade out the under layer
         * @param {*} [options]
         * @param {number} [options.start=1] starting opacity
         * @param {number} [options.end=0] ending opacity
         * @param {number} [options.duration=1000] duration of fade in milliseconds
         * @param {string|Function} [options.ease='easeInOutSine'] easing function (@see https://www.npmjs.com/package/penner)
         * @param {Function} [options.onEnd] callback after fading
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcG90bGlnaHQuanMiXSwibmFtZXMiOlsiUGVubmVyIiwicmVxdWlyZSIsIlNwb3RsaWdodCIsIm9wdGlvbnMiLCJjYW52YXMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJwYXJlbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJzdHlsZSIsInBvc2l0aW9uIiwidG9wIiwieCIsImxlZnQiLCJ5IiwicG9pbnRlckV2ZW50cyIsIm9wZW5pbmdzIiwicmVzaXplIiwid2lkdGgiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJyZWRyYXciLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInNhdmUiLCJjbGVhclJlY3QiLCJmaWxsU3R5bGUiLCJjb2xvciIsImdsb2JhbEFscGhhIiwiYWxwaGEiLCJmaWxsUmVjdCIsInJlc3RvcmUiLCJnbG9iYWxDb21wb3NpdGVPcGVyYXRpb24iLCJlbnRyeSIsInR5cGUiLCJiZWdpblBhdGgiLCJhcmMiLCJyYWRpdXMiLCJNYXRoIiwiUEkiLCJmaWxsIiwibW92ZVRvIiwicG9pbnRzIiwiaSIsImxlbmd0aCIsImxpbmVUbyIsImNsb3NlUGF0aCIsIm5vUmVkcmF3IiwicHVzaCIsImRhdGEiLCJyZXF1ZXN0Iiwibm93IiwicGVyZm9ybWFuY2UiLCJkaWZmZXJlbmNlIiwibGFzdCIsInRpbWUiLCJjaGFuZ2UiLCJlbmQiLCJzdGFydCIsImR1cmF0aW9uIiwib3BhY2l0eSIsIm9uRW5kIiwiZWFzZSIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsImZhZGUiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsImVhc2VJbk91dFNpbmUiLCJmYWRlSW4iLCJkaXNwbGF5IiwicmVtb3ZlQ2hpbGQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFFBQVIsQ0FBZjs7QUFFQTs7OztJQUdNQyxTO0FBRUY7Ozs7Ozs7Ozs7O0FBV0EsdUJB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S0FBbkU7QUFDQTFELG9CQUFReUQsR0FBUixHQUFjLE9BQU96RCxRQUFReUQsR0FBZixLQUF1QixXQUF2QixHQUFxQyxDQUFyQyxHQUF5Q3pELFFBQVF5RCxHQUEvRDtBQUNBLGlCQUFLVSxNQUFMLENBQVluRSxPQUFaO0FBQ0EsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7OytCQUtBO0FBQ0ksaUJBQUtDLE1BQUwsQ0FBWU0sS0FBWixDQUFrQjZELE9BQWxCLEdBQTRCLE9BQTVCO0FBQ0EsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7OytCQUtBO0FBQ0ksaUJBQUtuRSxNQUFMLENBQVlNLEtBQVosQ0FBa0I2RCxPQUFsQixHQUE0QixNQUE1QjtBQUNBLG1CQUFPLElBQVA7QUFDSDs7QUFFRDs7Ozs7OztvQ0FLQTtBQUNJLG1CQUFPLEtBQUtuRSxNQUFMLENBQVlNLEtBQVosQ0FBa0I2RCxPQUFsQixLQUE4QixPQUFyQztBQUNIOztBQUVEOzs7Ozs7a0NBSUE7QUFDSSxnQkFBSSxDQUFDLEtBQUtwRSxPQUFMLENBQWFJLE1BQWxCLEVBQ0E7QUFDSUYseUJBQVNHLElBQVQsQ0FBY2dFLFdBQWQsQ0FBMEIsS0FBS3BFLE1BQS9CO0FBQ0gsYUFIRCxNQUtBO0FBQ0kscUJBQUtELE9BQUwsQ0FBYUksTUFBYixDQUFvQmlFLFdBQXBCLENBQWdDLEtBQUtwRSxNQUFyQztBQUNIO0FBQ0o7Ozs7OztBQUdMcUUsT0FBT0MsT0FBUCxHQUFpQnhFLFNBQWpCIiwiZmlsZSI6InNwb3RsaWdodC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBlbm5lciA9IHJlcXVpcmUoJ3Blbm5lcicpXHJcblxyXG4vKipcclxuICogc3BvdGxpZ2h0LWNhbnZhczogYSBjYW52YXMgZWxlbWVudCB0aGF0IGRpbXMgdGhlIHNjcmVlbiBleGNlcHQgZm9yIHNwb3RsaWdodCBsb2NhdGlvbnMgZm9ybWVkIGJ5IGNpcmNsZXMgb3IgcG9seWdvbnNcclxuICovXHJcbmNsYXNzIFNwb3RsaWdodFxyXG57XHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZSBhIHNwb3RsaWdodCBkaXZcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy54PTBdIHVzZSB0byBwbGFjZSBsYXllciBvbiBjcmVhdGlvblxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnk9MF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aWR0aD13aW5kb3cuaW5uZXJXaWR0aF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5oZWlnaHQ9d2luZG93LmlubmVySGVpZ2h0XVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmNvbG9yPWJsYWNrXSBjb2xvciBvZiB1bmRlciBsYXllclxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmFscGhhPTAuNV0gYWxwaGEgb2YgdW5kZXIgbGF5ZXJcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtvcHRpb25zLnBhcmVudD1kb2N1bWVudC5ib2R5XSBwYXJlbnQgb2Ygc3BvdGxpZ2h0IGxheWVyXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wYXJlbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucGFyZW50LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCdcclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS50b3AgPSB0aGlzLm9wdGlvbnMueCB8fCAwXHJcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUubGVmdCA9IHRoaXMub3B0aW9ucy55IHx8IDBcclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHRoZSBsaXN0IG9mIHNwb3RsaWdodHMuIGlmIG1hbnVhbGx5IGNoYW5nZWQgdGhlbiBjYWxsIHJlZHJhdygpIHRvIHVwZGF0ZSB0aGUgY2FudmFzXHJcbiAgICAgICAgICogQHR5cGUge29iamVjdFtdfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMub3BlbmluZ3MgPSBbXVxyXG4gICAgICAgIHRoaXMucmVzaXplKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlc2l6ZSB0aGUgbGF5ZXIgdG8gZW5zdXJlIGVudGlyZSBzY3JlZW4gaXMgY292ZXJlZDsgYWxzbyBjYWxscyByZWRyYXcoKVxyXG4gICAgICogQHJldHVybnMge1Nwb3RsaWdodH1cclxuICAgICAqL1xyXG4gICAgcmVzaXplKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXMub3B0aW9ucy53aWR0aCB8fCB3aW5kb3cuaW5uZXJXaWR0aFxyXG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMub3B0aW9ucy5oZWlnaHQgfHwgd2luZG93LmlubmVySGVpZ2h0XHJcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aFxyXG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodFxyXG4gICAgICAgIHRoaXMucmVkcmF3KClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZm9yY2UgYSByZWRyYXcgb2YgdGhlIHNwb3RsaWdodCAodXN1YWxseSBjYWxsZWQgaW50ZXJuYWxseSlcclxuICAgICAqIEByZXR1cm5zIHtTcG90bGlnaHR9XHJcbiAgICAgKi9cclxuICAgIHJlZHJhdygpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJylcclxuICAgICAgICBjb250ZXh0LnNhdmUoKVxyXG4gICAgICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpXHJcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSB0aGlzLm9wdGlvbnMuY29sb3IgfHwgJ2JsYWNrJ1xyXG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSB0aGlzLm9wdGlvbnMuYWxwaGEgfHwgMC41XHJcbiAgICAgICAgY29udGV4dC5maWxsUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KVxyXG4gICAgICAgIGNvbnRleHQucmVzdG9yZSgpXHJcbiAgICAgICAgY29udGV4dC5zYXZlKClcclxuICAgICAgICBjb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1vdXQnXHJcbiAgICAgICAgZm9yIChsZXQgZW50cnkgb2YgdGhpcy5vcGVuaW5ncylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZW50cnkudHlwZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY2lyY2xlJzpcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5hcmMoZW50cnkueCwgZW50cnkueSwgZW50cnkucmFkaXVzLCAwLCBNYXRoLlBJICogMilcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGwoKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAncmVjdGFuZ2xlJzpcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5maWxsUmVjdChlbnRyeS54LCBlbnRyeS55LCBlbnRyeS53aWR0aCwgZW50cnkuaGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAncG9seWdvbic6XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKGVudHJ5LnBvaW50c1swXSwgZW50cnkucG9pbnRzWzFdKVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAyOyBpIDwgZW50cnkucG9pbnRzLmxlbmd0aDsgaSArPSAyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8oZW50cnkucG9pbnRzW2ldLCBlbnRyeS5wb2ludHNbaSArIDFdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5maWxsKClcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRleHQucmVzdG9yZSgpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsZWFycyBhbnkgY3V0b3V0c1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbbm9SZWRyYXddIGRvbid0IGZvcmNlIGEgY2FudmFzIHJlZHJhd1xyXG4gICAgICogQHJldHVybnMge1Nwb3RsaWdodH1cclxuICAgICAqL1xyXG4gICAgY2xlYXIobm9SZWRyYXcpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5vcGVuaW5ncyA9IFtdXHJcbiAgICAgICAgaWYgKCFub1JlZHJhdylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucmVzaXplKClcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZHMgYSBjaXJjbGUgc3BvdGxpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW25vUmVkcmF3XSBkb24ndCBmb3JjZSBhIGNhbnZhcyByZWRyYXdcclxuICAgICAqIEByZXR1cm5zIHtTcG90bGlnaHR9XHJcbiAgICAgKi9cclxuICAgIGNpcmNsZSh4LCB5LCByYWRpdXMsIG5vUmVkcmF3KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMub3BlbmluZ3MucHVzaCh7IHR5cGU6ICdjaXJjbGUnLCB4LCB5LCByYWRpdXMgfSlcclxuICAgICAgICBpZiAoIW5vUmVkcmF3KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5yZWRyYXcoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZHMgYSByZWN0YW5nbGUgc3BvdGxpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBub1JlZHJhdyBkb24ndCBmb3JjZSBhIGNhbnZhcyByZWRyYXdcclxuICAgICAqIEByZXR1cm5zIHtTcG90bGlnaHR9XHJcbiAgICAgKi9cclxuICAgIHJlY3RhbmdsZSh4LCB5LCB3aWR0aCwgaGVpZ2h0LCBub1JlZHJhdylcclxuICAgIHtcclxuICAgICAgICB0aGlzLm9wZW5pbmdzLnB1c2goeyB0eXBlOiAncmVjdGFuZ2xlJywgeCwgeSwgd2lkdGgsIGhlaWdodCB9KVxyXG4gICAgICAgIGlmICghbm9SZWRyYXcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnJlZHJhdygpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGRzIGEgcG9seWdvbiBzcG90bGlnaHRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyW119IHBvaW50cyAtIFt4MSwgeTEsIHgyLCB5MiwgLi4uIHhuLCB5bl1cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW25vUmVkcmF3XSBkb24ndCBmb3JjZSBhIGNhbnZhcyByZWRyYXdcclxuICAgICAqIEByZXR1cm5zIHtTcG90bGlnaHR9XHJcbiAgICAgKi9cclxuICAgIHBvbHlnb24ocG9pbnRzLCBub1JlZHJhdylcclxuICAgIHtcclxuICAgICAgICB0aGlzLm9wZW5pbmdzLnB1c2goeyB0eXBlOiAncG9seWdvbicsIHBvaW50cyB9KVxyXG4gICAgICAgIGlmICghbm9SZWRyYXcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnJlZHJhdygpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1c2VkIGludGVybmFsbHkgZm9yIGZhZGVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBmYWRlKGRhdGEpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5yZXF1ZXN0ID0gbnVsbFxyXG4gICAgICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpXHJcbiAgICAgICAgY29uc3QgZGlmZmVyZW5jZSA9IG5vdyAtIHRoaXMubGFzdFxyXG4gICAgICAgIHRoaXMubGFzdCA9IG5vd1xyXG4gICAgICAgIGRhdGEudGltZSArPSBkaWZmZXJlbmNlXHJcbiAgICAgICAgY29uc3QgY2hhbmdlID0gZGF0YS5lbmQgLSBkYXRhLnN0YXJ0XHJcbiAgICAgICAgaWYgKGRhdGEudGltZSA+IGRhdGEuZHVyYXRpb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5vcGFjaXR5ID0gZGF0YS5lbmRcclxuICAgICAgICAgICAgaWYgKGRhdGEub25FbmQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRhdGEub25FbmQoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLm9wYWNpdHkgPSBkYXRhLmVhc2UoZGF0YS50aW1lLCBkYXRhLnN0YXJ0LCBjaGFuZ2UsIGRhdGEuZHVyYXRpb24pXHJcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLmZhZGUoZGF0YSkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmFkZSBpbiB0aGUgdW5kZXIgbGF5ZXJcclxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3RhcnQ9MF0gc3RhcnRpbmcgb3BhY2l0eVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmVuZD0xXSBlbmRpbmcgb3BhY2l0eVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmR1cmF0aW9uPTEwMDBdIGR1cmF0aW9uIG9mIGZhZGUgaW4gbWlsbGlzZWNvbmRzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xGdW5jdGlvbn0gW29wdGlvbnMuZWFzZT0nZWFzZUluT3V0U2luZSddIGVhc2luZyBmdW5jdGlvbiAoQHNlZSBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9wZW5uZXIpXHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5vbkVuZF0gY2FsbGJhY2sgYWZ0ZXIgZmFkaW5nXHJcbiAgICAgKiBAcmV0dXJucyB7U3BvdGxpZ2h0fVxyXG4gICAgICovXHJcbiAgICBmYWRlSW4ob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5yZXF1ZXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yZXF1ZXN0KVxyXG4gICAgICAgIH1cclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gdHlwZW9mIG9wdGlvbnMuc3RhcnQgPT09ICd1bmRlZmluZWQnID8gMCA6IG9wdGlvbnMuc3RhcnRcclxuICAgICAgICBjb25zdCBlbmQgPSB0eXBlb2Ygb3B0aW9ucy5lbmQgPT09ICd1bmRlZmluZWQnID8gMSA6IG9wdGlvbnMuZW5kXHJcbiAgICAgICAgY29uc3QgZWFzZSA9ICFvcHRpb25zLmVhc2UgPyBQZW5uZXIuZWFzZUluT3V0U2luZSA6IHR5cGVvZiBvcHRpb25zLmVhc2UgPT09ICdzdHJpbmcnID8gUGVubmVyW29wdGlvbnMuZWFzZV0gOiBvcHRpb25zLmVhc2VcclxuICAgICAgICBjb25zdCBvbkVuZCA9IG9wdGlvbnMub25FbmRcclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5vcGFjaXR5ID0gc3RhcnRcclxuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24gfHwgMTAwMFxyXG4gICAgICAgIHRoaXMubGFzdCA9IHBlcmZvcm1hbmNlLm5vdygpXHJcbiAgICAgICAgdGhpcy5mYWRlKHsgdGltZTogMCwgc3RhcnQsIGVuZCwgZHVyYXRpb24sIGVhc2UsIG9uRW5kIH0pXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZhZGUgb3V0IHRoZSB1bmRlciBsYXllclxyXG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zdGFydD0xXSBzdGFydGluZyBvcGFjaXR5XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZW5kPTBdIGVuZGluZyBvcGFjaXR5XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZHVyYXRpb249MTAwMF0gZHVyYXRpb24gb2YgZmFkZSBpbiBtaWxsaXNlY29uZHNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfEZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPSdlYXNlSW5PdXRTaW5lJ10gZWFzaW5nIGZ1bmN0aW9uIChAc2VlIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3Blbm5lcilcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtvcHRpb25zLm9uRW5kXSBjYWxsYmFjayBhZnRlciBmYWRpbmdcclxuICAgICAqIEByZXR1cm5zIHtTcG90bGlnaHR9XHJcbiAgICAgKi9cclxuICAgIGZhZGVPdXQob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIG9wdGlvbnMuc3RhcnQgPSB0eXBlb2Ygb3B0aW9ucy5zdGFydCA9PT0gJ3VuZGVmaW5lZCcgPyAxIDogb3B0aW9ucy5zdGFydFxyXG4gICAgICAgIG9wdGlvbnMuZW5kID0gdHlwZW9mIG9wdGlvbnMuZW5kID09PSAndW5kZWZpbmVkJyA/IDAgOiBvcHRpb25zLmVuZFxyXG4gICAgICAgIHRoaXMuZmFkZUluKG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNob3cgc3BvdGxpZ2h0XHJcbiAgICAgKiBAcmV0dXJuIHtTcG90bGlnaHR9XHJcbiAgICAgKi9cclxuICAgIHNob3coKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhpZGUgc3BvdGxpZ2h0XHJcbiAgICAgKiBAcmV0dXJuIHtTcG90bGlnaHR9XHJcbiAgICAgKi9cclxuICAgIGhpZGUoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hlY2tzIHdoZXRoZXIgc3BvdGxpZ2h0IGlzIHZpc2libGVcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBpc1Zpc2libGUoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcy5zdHlsZS5kaXNwbGF5ID09PSAnYmxvY2snXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIHNwb3RsaWdodFxyXG4gICAgICovXHJcbiAgICBkZXN0cm95KClcclxuICAgIHtcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wYXJlbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRoaXMuY2FudmFzKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucGFyZW50LnJlbW92ZUNoaWxkKHRoaXMuY2FudmFzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTcG90bGlnaHQiXX0=