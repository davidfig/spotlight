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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcG90bGlnaHQuanMiXSwibmFtZXMiOlsiUGVubmVyIiwicmVxdWlyZSIsIlNwb3RsaWdodCIsIm9wdGlvbnMiLCJjYW52YXMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJwYXJlbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJzdHlsZSIsInBvc2l0aW9uIiwidG9wIiwieCIsImxlZnQiLCJ5IiwicG9pbnRlckV2ZW50cyIsIm9wZW5pbmdzIiwicmVzaXplIiwid2lkdGgiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJyZWRyYXciLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInNhdmUiLCJjbGVhclJlY3QiLCJmaWxsU3R5bGUiLCJjb2xvciIsImdsb2JhbEFscGhhIiwiYWxwaGEiLCJmaWxsUmVjdCIsInJlc3RvcmUiLCJnbG9iYWxDb21wb3NpdGVPcGVyYXRpb24iLCJlbnRyeSIsInR5cGUiLCJiZWdpblBhdGgiLCJhcmMiLCJyYWRpdXMiLCJNYXRoIiwiUEkiLCJmaWxsIiwibW92ZVRvIiwicG9pbnRzIiwiaSIsImxlbmd0aCIsImxpbmVUbyIsImNsb3NlUGF0aCIsIm5vUmVkcmF3IiwicHVzaCIsImRhdGEiLCJyZXF1ZXN0Iiwibm93IiwicGVyZm9ybWFuY2UiLCJkaWZmZXJlbmNlIiwibGFzdCIsInRpbWUiLCJkdXJhdGlvbiIsIm9wYWNpdHkiLCJlbmQiLCJlYXNlIiwic3RhcnQiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJmYWRlIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJlYXNlSW5PdXRTaW5lIiwiZmFkZUluIiwiZGlzcGxheSIsInJlbW92ZUNoaWxkIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxRQUFSLENBQWY7O0FBRUE7Ozs7SUFHTUMsUztBQUVGOzs7Ozs7Ozs7OztBQVdBLHVCQUFZQyxPQUFaLEVBQ0E7QUFB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QUFDSDs7QUFFRDs7Ozs7OzsrQkFLQTtBQUNJLGlCQUFLakUsTUFBTCxDQUFZTSxLQUFaLENBQWtCMkQsT0FBbEIsR0FBNEIsTUFBNUI7QUFDQSxtQkFBTyxJQUFQO0FBQ0g7O0FBRUQ7Ozs7Ozs7b0NBS0E7QUFDSSxtQkFBTyxLQUFLakUsTUFBTCxDQUFZTSxLQUFaLENBQWtCMkQsT0FBbEIsS0FBOEIsT0FBckM7QUFDSDs7QUFFRDs7Ozs7O2tDQUlBO0FBQ0ksZ0JBQUksQ0FBQyxLQUFLbEUsT0FBTCxDQUFhSSxNQUFsQixFQUNBO0FBQ0lGLHlCQUFTRyxJQUFULENBQWM4RCxXQUFkLENBQTBCLEtBQUtsRSxNQUEvQjtBQUNILGFBSEQsTUFLQTtBQUNJLHFCQUFLRCxPQUFMLENBQWFJLE1BQWIsQ0FBb0IrRCxXQUFwQixDQUFnQyxLQUFLbEUsTUFBckM7QUFDSDtBQUNKOzs7Ozs7QUFHTG1FLE9BQU9DLE9BQVAsR0FBaUJ0RSxTQUFqQiIsImZpbGUiOiJzcG90bGlnaHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQZW5uZXIgPSByZXF1aXJlKCdwZW5uZXInKVxyXG5cclxuLyoqXHJcbiAqIHNwb3RsaWdodC1jYW52YXM6IGEgY2FudmFzIGVsZW1lbnQgdGhhdCBkaW1zIHRoZSBzY3JlZW4gZXhjZXB0IGZvciBzcG90bGlnaHQgbG9jYXRpb25zIGZvcm1lZCBieSBjaXJjbGVzIG9yIHBvbHlnb25zXHJcbiAqL1xyXG5jbGFzcyBTcG90bGlnaHRcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGUgYSBzcG90bGlnaHQgZGl2XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMueD0wXSB1c2UgdG8gcGxhY2UgbGF5ZXIgb24gY3JlYXRpb25cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy55PTBdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2lkdGg9d2luZG93LmlubmVyV2lkdGhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuaGVpZ2h0PXdpbmRvdy5pbm5lckhlaWdodF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5jb2xvcj1ibGFja10gY29sb3Igb2YgdW5kZXIgbGF5ZXJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5hbHBoYT0wLjVdIGFscGhhIG9mIHVuZGVyIGxheWVyXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbb3B0aW9ucy5wYXJlbnQ9ZG9jdW1lbnQuYm9keV0gcGFyZW50IG9mIHNwb3RsaWdodCBsYXllclxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucGFyZW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcylcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnXHJcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUudG9wID0gdGhpcy5vcHRpb25zLnggfHwgMFxyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmxlZnQgPSB0aGlzLm9wdGlvbnMueSB8fCAwXHJcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJ1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiB0aGUgbGlzdCBvZiBzcG90bGlnaHRzLiBpZiBtYW51YWxseSBjaGFuZ2VkIHRoZW4gY2FsbCByZWRyYXcoKSB0byB1cGRhdGUgdGhlIGNhbnZhc1xyXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3RbXX1cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLm9wZW5pbmdzID0gW11cclxuICAgICAgICB0aGlzLnJlc2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXNpemUgdGhlIGxheWVyIHRvIGVuc3VyZSBlbnRpcmUgc2NyZWVuIGlzIGNvdmVyZWQ7IGFsc28gY2FsbHMgcmVkcmF3KClcclxuICAgICAqIEByZXR1cm5zIHtTcG90bGlnaHR9XHJcbiAgICAgKi9cclxuICAgIHJlc2l6ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLm9wdGlvbnMud2lkdGggfHwgd2luZG93LmlubmVyV2lkdGhcclxuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLm9wdGlvbnMuaGVpZ2h0IHx8IHdpbmRvdy5pbm5lckhlaWdodFxyXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGhcclxuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHRcclxuICAgICAgICB0aGlzLnJlZHJhdygpXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZvcmNlIGEgcmVkcmF3IG9mIHRoZSBzcG90bGlnaHQgKHVzdWFsbHkgY2FsbGVkIGludGVybmFsbHkpXHJcbiAgICAgKiBAcmV0dXJucyB7U3BvdGxpZ2h0fVxyXG4gICAgICovXHJcbiAgICByZWRyYXcoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAgICAgY29udGV4dC5zYXZlKClcclxuICAgICAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KVxyXG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5vcHRpb25zLmNvbG9yIHx8ICdibGFjaydcclxuICAgICAgICBjb250ZXh0Lmdsb2JhbEFscGhhID0gdGhpcy5vcHRpb25zLmFscGhhIHx8IDAuNVxyXG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodClcclxuICAgICAgICBjb250ZXh0LnJlc3RvcmUoKVxyXG4gICAgICAgIGNvbnRleHQuc2F2ZSgpXHJcbiAgICAgICAgY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24tb3V0J1xyXG4gICAgICAgIGZvciAobGV0IGVudHJ5IG9mIHRoaXMub3BlbmluZ3MpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGVudHJ5LnR5cGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2NpcmNsZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuYXJjKGVudHJ5LngsIGVudHJ5LnksIGVudHJ5LnJhZGl1cywgMCwgTWF0aC5QSSAqIDIpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5maWxsKClcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgJ3JlY3RhbmdsZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFJlY3QoZW50cnkueCwgZW50cnkueSwgZW50cnkud2lkdGgsIGVudHJ5LmhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgJ3BvbHlnb24nOlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKClcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyhlbnRyeS5wb2ludHNbMF0sIGVudHJ5LnBvaW50c1sxXSlcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMjsgaSA8IGVudHJ5LnBvaW50cy5sZW5ndGg7IGkgKz0gMilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKGVudHJ5LnBvaW50c1tpXSwgZW50cnkucG9pbnRzW2kgKyAxXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbCgpXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZXh0LnJlc3RvcmUoKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGVhcnMgYW55IGN1dG91dHNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW25vUmVkcmF3XSBkb24ndCBmb3JjZSBhIGNhbnZhcyByZWRyYXdcclxuICAgICAqIEByZXR1cm5zIHtTcG90bGlnaHR9XHJcbiAgICAgKi9cclxuICAgIGNsZWFyKG5vUmVkcmF3KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMub3BlbmluZ3MgPSBbXVxyXG4gICAgICAgIGlmICghbm9SZWRyYXcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnJlc2l6ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGRzIGEgY2lyY2xlIHNwb3RsaWdodFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtub1JlZHJhd10gZG9uJ3QgZm9yY2UgYSBjYW52YXMgcmVkcmF3XHJcbiAgICAgKiBAcmV0dXJucyB7U3BvdGxpZ2h0fVxyXG4gICAgICovXHJcbiAgICBjaXJjbGUoeCwgeSwgcmFkaXVzLCBub1JlZHJhdylcclxuICAgIHtcclxuICAgICAgICB0aGlzLm9wZW5pbmdzLnB1c2goeyB0eXBlOiAnY2lyY2xlJywgeCwgeSwgcmFkaXVzIH0pXHJcbiAgICAgICAgaWYgKCFub1JlZHJhdylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucmVkcmF3KClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGRzIGEgcmVjdGFuZ2xlIHNwb3RsaWdodFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbm9SZWRyYXcgZG9uJ3QgZm9yY2UgYSBjYW52YXMgcmVkcmF3XHJcbiAgICAgKiBAcmV0dXJucyB7U3BvdGxpZ2h0fVxyXG4gICAgICovXHJcbiAgICByZWN0YW5nbGUoeCwgeSwgd2lkdGgsIGhlaWdodCwgbm9SZWRyYXcpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5vcGVuaW5ncy5wdXNoKHsgdHlwZTogJ3JlY3RhbmdsZScsIHgsIHksIHdpZHRoLCBoZWlnaHQgfSlcclxuICAgICAgICBpZiAoIW5vUmVkcmF3KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5yZWRyYXcoKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkcyBhIHBvbHlnb24gc3BvdGxpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcltdfSBwb2ludHMgLSBbeDEsIHkxLCB4MiwgeTIsIC4uLiB4biwgeW5dXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtub1JlZHJhd10gZG9uJ3QgZm9yY2UgYSBjYW52YXMgcmVkcmF3XHJcbiAgICAgKiBAcmV0dXJucyB7U3BvdGxpZ2h0fVxyXG4gICAgICovXHJcbiAgICBwb2x5Z29uKHBvaW50cywgbm9SZWRyYXcpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5vcGVuaW5ncy5wdXNoKHsgdHlwZTogJ3BvbHlnb24nLCBwb2ludHMgfSlcclxuICAgICAgICBpZiAoIW5vUmVkcmF3KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5yZWRyYXcoKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXNlZCBpbnRlcm5hbGx5IGZvciBmYWRlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgZmFkZShkYXRhKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucmVxdWVzdCA9IG51bGxcclxuICAgICAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKVxyXG4gICAgICAgIGNvbnN0IGRpZmZlcmVuY2UgPSBub3cgLSB0aGlzLmxhc3RcclxuICAgICAgICB0aGlzLmxhc3QgPSBub3dcclxuICAgICAgICBkYXRhLnRpbWUgKz0gZGlmZmVyZW5jZVxyXG4gICAgICAgIGlmIChkYXRhLnRpbWUgPiBkYXRhLmR1cmF0aW9uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUub3BhY2l0eSA9IGRhdGEuZW5kXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLm9wYWNpdHkgPSBkYXRhLmVhc2UoZGF0YS50aW1lLCBkYXRhLnN0YXJ0LCBkYXRhLmVuZCwgZGF0YS5kdXJhdGlvbilcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0ID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuZmFkZShkYXRhKSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmYWRlIGluIHRoZSB1bmRlciBsYXllclxyXG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zdGFydD0wXSBzdGFydGluZyBvcGFjaXR5XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZW5kPTFdIGVuZGluZyBvcGFjaXR5XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZHVyYXRpb249MTAwMF0gZHVyYXRpb24gb2YgZmFkZSBpbiBtaWxsaXNlY29uZHNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfEZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPSdlYXNlSW5PdXRTaW5lJ10gZWFzaW5nIGZ1bmN0aW9uIChAc2VlIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3Blbm5lcilcclxuICAgICAqIEByZXR1cm5zIHtTcG90bGlnaHR9XHJcbiAgICAgKi9cclxuICAgIGZhZGVJbihvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnJlcXVlc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnJlcXVlc3QpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBvcHRpb25zLnN0YXJ0IHx8IDBcclxuICAgICAgICBjb25zdCBlbmQgPSBvcHRpb25zLmVuZCB8fCAxXHJcbiAgICAgICAgY29uc3QgZWFzZSA9ICFvcHRpb25zLmVhc2UgPyBQZW5uZXIuZWFzZUluT3V0U2luZSA6IHR5cGVvZiBvcHRpb25zLmVhc2UgPT09ICdzdHJpbmcnID8gUGVubmVyW29wdGlvbnMuZWFzZV0gOiBvcHRpb25zLmVhc2VcclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5vcGFjaXR5ID0gc3RhcnRcclxuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24gfHwgMTAwMFxyXG4gICAgICAgIHRoaXMubGFzdCA9IHBlcmZvcm1hbmNlLm5vdygpXHJcbiAgICAgICAgdGhpcy5mYWRlKHsgdGltZTogMCwgc3RhcnQsIGVuZCwgZHVyYXRpb24sIGVhc2UgfSlcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmFkZSBvdXQgdGhlIHVuZGVyIGxheWVyXHJcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnN0YXJ0PTFdIHN0YXJ0aW5nIG9wYWNpdHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5lbmQ9MF0gZW5kaW5nIG9wYWNpdHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5kdXJhdGlvbj0xMDAwXSBkdXJhdGlvbiBvZiBmYWRlIGluIG1pbGxpc2Vjb25kc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8RnVuY3Rpb259IFtvcHRpb25zLmVhc2U9J2Vhc2VJbk91dFNpbmUnXSBlYXNpbmcgZnVuY3Rpb24gKEBzZWUgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvcGVubmVyKVxyXG4gICAgICogQHJldHVybnMge1Nwb3RsaWdodH1cclxuICAgICAqL1xyXG4gICAgZmFkZU91dChvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgb3B0aW9ucy5zdGFydCA9IHR5cGVvZiBvcHRpb25zLnN0YXJ0ID09PSAndW5kZWZpbmVkJyA/IDEgOiBvcHRpb25zLnN0YXJ0XHJcbiAgICAgICAgb3B0aW9ucy5lbmQgPSB0eXBlb2Ygb3B0aW9ucy5lbmQgPT09ICd1bmRlZmluZWQnID8gMCA6IG9wdGlvbnMuZW5kXHJcbiAgICAgICAgdGhpcy5mYWRlSW4ob3B0aW9ucylcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2hvdyBzcG90bGlnaHRcclxuICAgICAqIEByZXR1cm4ge1Nwb3RsaWdodH1cclxuICAgICAqL1xyXG4gICAgc2hvdygpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGlkZSBzcG90bGlnaHRcclxuICAgICAqIEByZXR1cm4ge1Nwb3RsaWdodH1cclxuICAgICAqL1xyXG4gICAgaGlkZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGVja3Mgd2hldGhlciBzcG90bGlnaHQgaXMgdmlzaWJsZVxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGlzVmlzaWJsZSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzLnN0eWxlLmRpc3BsYXkgPT09ICdibG9jaydcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgc3BvdGxpZ2h0XHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3koKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnBhcmVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGhpcy5jYW52YXMpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wYXJlbnQucmVtb3ZlQ2hpbGQodGhpcy5jYW52YXMpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNwb3RsaWdodCJdfQ==