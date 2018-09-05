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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcG90bGlnaHQuanMiXSwibmFtZXMiOlsiUGVubmVyIiwicmVxdWlyZSIsIlNwb3RsaWdodCIsIm9wdGlvbnMiLCJjYW52YXMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJwYXJlbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJzdHlsZSIsInBvc2l0aW9uIiwidG9wIiwieCIsImxlZnQiLCJ5IiwicG9pbnRlckV2ZW50cyIsIm9wZW5pbmdzIiwicmVzaXplIiwid2lkdGgiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJyZWRyYXciLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInNhdmUiLCJjbGVhclJlY3QiLCJmaWxsU3R5bGUiLCJjb2xvciIsImdsb2JhbEFscGhhIiwiYWxwaGEiLCJmaWxsUmVjdCIsInJlc3RvcmUiLCJnbG9iYWxDb21wb3NpdGVPcGVyYXRpb24iLCJlbnRyeSIsInR5cGUiLCJiZWdpblBhdGgiLCJhcmMiLCJyYWRpdXMiLCJNYXRoIiwiUEkiLCJmaWxsIiwibW92ZVRvIiwicG9pbnRzIiwiaSIsImxlbmd0aCIsImxpbmVUbyIsImNsb3NlUGF0aCIsIm5vUmVkcmF3IiwicHVzaCIsImRhdGEiLCJyZXF1ZXN0Iiwibm93IiwicGVyZm9ybWFuY2UiLCJkaWZmZXJlbmNlIiwibGFzdCIsInRpbWUiLCJjaGFuZ2UiLCJlbmQiLCJzdGFydCIsImR1cmF0aW9uIiwib3BhY2l0eSIsImVhc2UiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJmYWRlIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJlYXNlSW5PdXRTaW5lIiwiZmFkZUluIiwiZGlzcGxheSIsInJlbW92ZUNoaWxkIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxRQUFSLENBQWY7O0FBRUE7Ozs7SUFHTUMsUztBQUVGOzs7Ozs7Ozs7OztBQVdBLHVCQUFZQyxPQUFa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LE1BQUwsQ0FBWWxFLE9BQVo7QUFDQSxtQkFBTyxJQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7K0JBS0E7QUFDSSxpQkFBS0MsTUFBTCxDQUFZTSxLQUFaLENBQWtCNEQsT0FBbEIsR0FBNEIsT0FBNUI7QUFDQSxtQkFBTyxJQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7K0JBS0E7QUFDSSxpQkFBS2xFLE1BQUwsQ0FBWU0sS0FBWixDQUFrQjRELE9BQWxCLEdBQTRCLE1BQTVCO0FBQ0EsbUJBQU8sSUFBUDtBQUNIOztBQUVEOzs7Ozs7O29DQUtBO0FBQ0ksbUJBQU8sS0FBS2xFLE1BQUwsQ0FBWU0sS0FBWixDQUFrQjRELE9BQWxCLEtBQThCLE9BQXJDO0FBQ0g7O0FBRUQ7Ozs7OztrQ0FJQTtBQUNJLGdCQUFJLENBQUMsS0FBS25FLE9BQUwsQ0FBYUksTUFBbEIsRUFDQTtBQUNJRix5QkFBU0csSUFBVCxDQUFjK0QsV0FBZCxDQUEwQixLQUFLbkUsTUFBL0I7QUFDSCxhQUhELE1BS0E7QUFDSSxxQkFBS0QsT0FBTCxDQUFhSSxNQUFiLENBQW9CZ0UsV0FBcEIsQ0FBZ0MsS0FBS25FLE1BQXJDO0FBQ0g7QUFDSjs7Ozs7O0FBR0xvRSxPQUFPQyxPQUFQLEdBQWlCdkUsU0FBakIiLCJmaWxlIjoic3BvdGxpZ2h0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGVubmVyID0gcmVxdWlyZSgncGVubmVyJylcclxuXHJcbi8qKlxyXG4gKiBzcG90bGlnaHQtY2FudmFzOiBhIGNhbnZhcyBlbGVtZW50IHRoYXQgZGltcyB0aGUgc2NyZWVuIGV4Y2VwdCBmb3Igc3BvdGxpZ2h0IGxvY2F0aW9ucyBmb3JtZWQgYnkgY2lyY2xlcyBvciBwb2x5Z29uc1xyXG4gKi9cclxuY2xhc3MgU3BvdGxpZ2h0XHJcbntcclxuICAgIC8qKlxyXG4gICAgICogY3JlYXRlIGEgc3BvdGxpZ2h0IGRpdlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLng9MF0gdXNlIHRvIHBsYWNlIGxheWVyIG9uIGNyZWF0aW9uXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMueT0wXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndpZHRoPXdpbmRvdy5pbm5lcldpZHRoXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmhlaWdodD13aW5kb3cuaW5uZXJIZWlnaHRdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuY29sb3I9YmxhY2tdIGNvbG9yIG9mIHVuZGVyIGxheWVyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYWxwaGE9MC41XSBhbHBoYSBvZiB1bmRlciBsYXllclxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW29wdGlvbnMucGFyZW50PWRvY3VtZW50LmJvZHldIHBhcmVudCBvZiBzcG90bGlnaHQgbGF5ZXJcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnBhcmVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJ1xyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnRvcCA9IHRoaXMub3B0aW9ucy54IHx8IDBcclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5sZWZ0ID0gdGhpcy5vcHRpb25zLnkgfHwgMFxyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSdcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogdGhlIGxpc3Qgb2Ygc3BvdGxpZ2h0cy4gaWYgbWFudWFsbHkgY2hhbmdlZCB0aGVuIGNhbGwgcmVkcmF3KCkgdG8gdXBkYXRlIHRoZSBjYW52YXNcclxuICAgICAgICAgKiBAdHlwZSB7b2JqZWN0W119XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5vcGVuaW5ncyA9IFtdXHJcbiAgICAgICAgdGhpcy5yZXNpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVzaXplIHRoZSBsYXllciB0byBlbnN1cmUgZW50aXJlIHNjcmVlbiBpcyBjb3ZlcmVkOyBhbHNvIGNhbGxzIHJlZHJhdygpXHJcbiAgICAgKiBAcmV0dXJucyB7U3BvdGxpZ2h0fVxyXG4gICAgICovXHJcbiAgICByZXNpemUoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5vcHRpb25zLndpZHRoIHx8IHdpbmRvdy5pbm5lcldpZHRoXHJcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLmhlaWdodCB8fCB3aW5kb3cuaW5uZXJIZWlnaHRcclxuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoXHJcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0XHJcbiAgICAgICAgdGhpcy5yZWRyYXcoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmb3JjZSBhIHJlZHJhdyBvZiB0aGUgc3BvdGxpZ2h0ICh1c3VhbGx5IGNhbGxlZCBpbnRlcm5hbGx5KVxyXG4gICAgICogQHJldHVybnMge1Nwb3RsaWdodH1cclxuICAgICAqL1xyXG4gICAgcmVkcmF3KClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAgICAgIGNvbnRleHQuc2F2ZSgpXHJcbiAgICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodClcclxuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMub3B0aW9ucy5jb2xvciB8fCAnYmxhY2snXHJcbiAgICAgICAgY29udGV4dC5nbG9iYWxBbHBoYSA9IHRoaXMub3B0aW9ucy5hbHBoYSB8fCAwLjVcclxuICAgICAgICBjb250ZXh0LmZpbGxSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpXHJcbiAgICAgICAgY29udGV4dC5yZXN0b3JlKClcclxuICAgICAgICBjb250ZXh0LnNhdmUoKVxyXG4gICAgICAgIGNvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLW91dCdcclxuICAgICAgICBmb3IgKGxldCBlbnRyeSBvZiB0aGlzLm9wZW5pbmdzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3dpdGNoIChlbnRyeS50eXBlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdjaXJjbGUnOlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKClcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmFyYyhlbnRyeS54LCBlbnRyeS55LCBlbnRyeS5yYWRpdXMsIDAsIE1hdGguUEkgKiAyKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbCgpXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlICdyZWN0YW5nbGUnOlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKClcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxSZWN0KGVudHJ5LngsIGVudHJ5LnksIGVudHJ5LndpZHRoLCBlbnRyeS5oZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlICdwb2x5Z29uJzpcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oZW50cnkucG9pbnRzWzBdLCBlbnRyeS5wb2ludHNbMV0pXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDI7IGkgPCBlbnRyeS5wb2ludHMubGVuZ3RoOyBpICs9IDIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxpbmVUbyhlbnRyeS5wb2ludHNbaV0sIGVudHJ5LnBvaW50c1tpICsgMV0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKClcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGwoKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGV4dC5yZXN0b3JlKClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xlYXJzIGFueSBjdXRvdXRzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtub1JlZHJhd10gZG9uJ3QgZm9yY2UgYSBjYW52YXMgcmVkcmF3XHJcbiAgICAgKiBAcmV0dXJucyB7U3BvdGxpZ2h0fVxyXG4gICAgICovXHJcbiAgICBjbGVhcihub1JlZHJhdylcclxuICAgIHtcclxuICAgICAgICB0aGlzLm9wZW5pbmdzID0gW11cclxuICAgICAgICBpZiAoIW5vUmVkcmF3KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5yZXNpemUoKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkcyBhIGNpcmNsZSBzcG90bGlnaHRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1c1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbbm9SZWRyYXddIGRvbid0IGZvcmNlIGEgY2FudmFzIHJlZHJhd1xyXG4gICAgICogQHJldHVybnMge1Nwb3RsaWdodH1cclxuICAgICAqL1xyXG4gICAgY2lyY2xlKHgsIHksIHJhZGl1cywgbm9SZWRyYXcpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5vcGVuaW5ncy5wdXNoKHsgdHlwZTogJ2NpcmNsZScsIHgsIHksIHJhZGl1cyB9KVxyXG4gICAgICAgIGlmICghbm9SZWRyYXcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnJlZHJhdygpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkcyBhIHJlY3RhbmdsZSBzcG90bGlnaHRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG5vUmVkcmF3IGRvbid0IGZvcmNlIGEgY2FudmFzIHJlZHJhd1xyXG4gICAgICogQHJldHVybnMge1Nwb3RsaWdodH1cclxuICAgICAqL1xyXG4gICAgcmVjdGFuZ2xlKHgsIHksIHdpZHRoLCBoZWlnaHQsIG5vUmVkcmF3KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMub3BlbmluZ3MucHVzaCh7IHR5cGU6ICdyZWN0YW5nbGUnLCB4LCB5LCB3aWR0aCwgaGVpZ2h0IH0pXHJcbiAgICAgICAgaWYgKCFub1JlZHJhdylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucmVkcmF3KClcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZHMgYSBwb2x5Z29uIHNwb3RsaWdodFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJbXX0gcG9pbnRzIC0gW3gxLCB5MSwgeDIsIHkyLCAuLi4geG4sIHluXVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbbm9SZWRyYXddIGRvbid0IGZvcmNlIGEgY2FudmFzIHJlZHJhd1xyXG4gICAgICogQHJldHVybnMge1Nwb3RsaWdodH1cclxuICAgICAqL1xyXG4gICAgcG9seWdvbihwb2ludHMsIG5vUmVkcmF3KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMub3BlbmluZ3MucHVzaCh7IHR5cGU6ICdwb2x5Z29uJywgcG9pbnRzIH0pXHJcbiAgICAgICAgaWYgKCFub1JlZHJhdylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucmVkcmF3KClcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVzZWQgaW50ZXJuYWxseSBmb3IgZmFkZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGRhdGFcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGZhZGUoZGF0YSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLnJlcXVlc3QgPSBudWxsXHJcbiAgICAgICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KClcclxuICAgICAgICBjb25zdCBkaWZmZXJlbmNlID0gbm93IC0gdGhpcy5sYXN0XHJcbiAgICAgICAgdGhpcy5sYXN0ID0gbm93XHJcbiAgICAgICAgZGF0YS50aW1lICs9IGRpZmZlcmVuY2VcclxuICAgICAgICBjb25zdCBjaGFuZ2UgPSBkYXRhLmVuZCAtIGRhdGEuc3RhcnRcclxuICAgICAgICBpZiAoZGF0YS50aW1lID4gZGF0YS5kdXJhdGlvbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLm9wYWNpdHkgPSBkYXRhLmVuZFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5vcGFjaXR5ID0gZGF0YS5lYXNlKGRhdGEudGltZSwgZGF0YS5zdGFydCwgY2hhbmdlLCBkYXRhLmR1cmF0aW9uKVxyXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3QgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5mYWRlKGRhdGEpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZhZGUgaW4gdGhlIHVuZGVyIGxheWVyXHJcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnN0YXJ0PTBdIHN0YXJ0aW5nIG9wYWNpdHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5lbmQ9MV0gZW5kaW5nIG9wYWNpdHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5kdXJhdGlvbj0xMDAwXSBkdXJhdGlvbiBvZiBmYWRlIGluIG1pbGxpc2Vjb25kc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8RnVuY3Rpb259IFtvcHRpb25zLmVhc2U9J2Vhc2VJbk91dFNpbmUnXSBlYXNpbmcgZnVuY3Rpb24gKEBzZWUgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvcGVubmVyKVxyXG4gICAgICogQHJldHVybnMge1Nwb3RsaWdodH1cclxuICAgICAqL1xyXG4gICAgZmFkZUluKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVxdWVzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMucmVxdWVzdClcclxuICAgICAgICB9XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBjb25zdCBzdGFydCA9IHR5cGVvZiBvcHRpb25zLnN0YXJ0ID09PSAndW5kZWZpbmVkJyA/IDAgOiBvcHRpb25zLnN0YXJ0XHJcbiAgICAgICAgY29uc3QgZW5kID0gdHlwZW9mIG9wdGlvbnMuZW5kID09PSAndW5kZWZpbmVkJyA/IDEgOiBvcHRpb25zLmVuZFxyXG4gICAgICAgIGNvbnN0IGVhc2UgPSAhb3B0aW9ucy5lYXNlID8gUGVubmVyLmVhc2VJbk91dFNpbmUgOiB0eXBlb2Ygb3B0aW9ucy5lYXNlID09PSAnc3RyaW5nJyA/IFBlbm5lcltvcHRpb25zLmVhc2VdIDogb3B0aW9ucy5lYXNlXHJcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUub3BhY2l0eSA9IHN0YXJ0XHJcbiAgICAgICAgY29uc3QgZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uIHx8IDEwMDBcclxuICAgICAgICB0aGlzLmxhc3QgPSBwZXJmb3JtYW5jZS5ub3coKVxyXG4gICAgICAgIHRoaXMuZmFkZSh7IHRpbWU6IDAsIHN0YXJ0LCBlbmQsIGR1cmF0aW9uLCBlYXNlIH0pXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZhZGUgb3V0IHRoZSB1bmRlciBsYXllclxyXG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zdGFydD0xXSBzdGFydGluZyBvcGFjaXR5XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZW5kPTBdIGVuZGluZyBvcGFjaXR5XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZHVyYXRpb249MTAwMF0gZHVyYXRpb24gb2YgZmFkZSBpbiBtaWxsaXNlY29uZHNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfEZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPSdlYXNlSW5PdXRTaW5lJ10gZWFzaW5nIGZ1bmN0aW9uIChAc2VlIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3Blbm5lcilcclxuICAgICAqIEByZXR1cm5zIHtTcG90bGlnaHR9XHJcbiAgICAgKi9cclxuICAgIGZhZGVPdXQob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIG9wdGlvbnMuc3RhcnQgPSB0eXBlb2Ygb3B0aW9ucy5zdGFydCA9PT0gJ3VuZGVmaW5lZCcgPyAxIDogb3B0aW9ucy5zdGFydFxyXG4gICAgICAgIG9wdGlvbnMuZW5kID0gdHlwZW9mIG9wdGlvbnMuZW5kID09PSAndW5kZWZpbmVkJyA/IDAgOiBvcHRpb25zLmVuZFxyXG4gICAgICAgIHRoaXMuZmFkZUluKG9wdGlvbnMpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNob3cgc3BvdGxpZ2h0XHJcbiAgICAgKiBAcmV0dXJuIHtTcG90bGlnaHR9XHJcbiAgICAgKi9cclxuICAgIHNob3coKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhpZGUgc3BvdGxpZ2h0XHJcbiAgICAgKiBAcmV0dXJuIHtTcG90bGlnaHR9XHJcbiAgICAgKi9cclxuICAgIGhpZGUoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hlY2tzIHdoZXRoZXIgc3BvdGxpZ2h0IGlzIHZpc2libGVcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBpc1Zpc2libGUoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcy5zdHlsZS5kaXNwbGF5ID09PSAnYmxvY2snXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIHNwb3RsaWdodFxyXG4gICAgICovXHJcbiAgICBkZXN0cm95KClcclxuICAgIHtcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wYXJlbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRoaXMuY2FudmFzKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMucGFyZW50LnJlbW92ZUNoaWxkKHRoaXMuY2FudmFzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTcG90bGlnaHQiXX0=