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
            this.parent.appendChild(this.canvas);
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
     * resize the layer to ensure entire screen is covered
     */


    _createClass(Spotlight, [{
        key: 'resize',
        value: function resize() {
            var width = this.options.width || window.innerWidth;
            var height = this.options.height || window.innerHeight;
            this.canvas.width = width;
            this.canvas.height = height;
            this.redraw();
        }

        /**
         * force a redraw of the spotlight (usually called internally)
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

                        case 'polygon':
                            context.beginPath();
                            context.moveTo(entry.points[0], entry.points[1]);
                            for (var i = 2; i < entry.points.length; i += 2) {
                                context.lineTo(entry.points[i], entry.points[i + 1]);
                            }
                            context.closePath();
                            context.fill();
                            context.stroke();
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
        }

        /**
         * clears any cutouts
         * @param {boolean} [noRedraw] don't force a canvas redraw
         */

    }, {
        key: 'clear',
        value: function clear(noRedraw) {
            this.openings = [];
            if (!noRedraw) {
                this.resize();
            }
        }

        /**
         * adds a circle spotlight
         * @param {number} x
         * @param {number} y
         * @param {number} radius
         * @param {boolean} [noRedraw] don't force a canvas redraw
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
         * adds a polygon spotlight
         * @param {number[]} points - [x1, y1, x2, y2, ... xn, yn]
         * @param {boolean} [noRedraw] don't force a canvas redraw
         */

    }, {
        key: 'polygon',
        value: function polygon(points, noRedraw) {
            this.openings.push({ type: 'polygon', points: points });
            if (!noRedraw) {
                this.redraw();
            }
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
        }

        /**
         * fade out the under layer
         * @param {*} [options]
         * @param {number} [options.start=1] starting opacity
         * @param {number} [options.end=0] ending opacity
         * @param {number} [options.duration=1000] duration of fade in milliseconds
         * @param {string|Function} [options.ease='easeInOutSine'] easing function (@see https://www.npmjs.com/package/penner)
         */

    }, {
        key: 'fadeOut',
        value: function fadeOut(options) {
            options = options || {};
            options.start = typeof options.start === 'undefined' ? 1 : options.start;
            options.end = typeof options.end === 'undefined' ? 0 : options.end;
            this.fadeIn(options);
        }
    }]);

    return Spotlight;
}();

module.exports = Spotlight;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zcG90bGlnaHQuanMiXSwibmFtZXMiOlsiUGVubmVyIiwicmVxdWlyZSIsIlNwb3RsaWdodCIsIm9wdGlvbnMiLCJjYW52YXMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJwYXJlbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJzdHlsZSIsInBvc2l0aW9uIiwidG9wIiwieCIsImxlZnQiLCJ5IiwicG9pbnRlckV2ZW50cyIsIm9wZW5pbmdzIiwicmVzaXplIiwid2lkdGgiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJyZWRyYXciLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInNhdmUiLCJjbGVhclJlY3QiLCJmaWxsU3R5bGUiLCJjb2xvciIsImdsb2JhbEFscGhhIiwiYWxwaGEiLCJmaWxsUmVjdCIsInJlc3RvcmUiLCJnbG9iYWxDb21wb3NpdGVPcGVyYXRpb24iLCJlbnRyeSIsInR5cGUiLCJiZWdpblBhdGgiLCJhcmMiLCJyYWRpdXMiLCJNYXRoIiwiUEkiLCJmaWxsIiwibW92ZVRvIiwicG9pbnRzIiwiaSIsImxlbmd0aCIsImxpbmVUbyIsImNsb3NlUGF0aCIsInN0cm9rZSIsIm5vUmVkcmF3IiwicHVzaCIsImRhdGEiLCJyZXF1ZXN0Iiwibm93IiwicGVyZm9ybWFuY2UiLCJkaWZmZXJlbmNlIiwibGFzdCIsInRpbWUiLCJkdXJhdGlvbiIsIm9wYWNpdHkiLCJlbmQiLCJlYXNlIiwic3RhcnQiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJmYWRlIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJlYXNlSW5PdXRTaW5lIiwiZmFkZUluIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxRQUFSLENBQWY7O0FBRUE7Ozs7SUFHTUMsUztBQUVGOzs7Ozs7Ozs7OztBQVdBLHVCQUFZQyxPQUFaLEVBQ0E7QUFBQTs7QUFDSSxhQUFLQSxPQUFMLEdBQWVBLFdBQVcsRUFBMUI7QUFDQSxhQUFLQyxNQUFMLEdBQWNDLFNBQVNDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBZDtBQUNBLFlBQUksQ0FBQyxLQUFLSCxPQUFMLENBQWFJLE1BQWxCLEVBQ0E7QUFDSUYscUJBQVNHLElBQVQsQ0FBY0MsV0FBZCxDQUEwQixLQUFLTCxNQUEvQjtBQUNILFNBSEQsTUFLQTtBQUNJLGlCQUFLRyxNQUFMLENBQVlFLFdBQVosQ0FBd0IsS0FBS0wsTUFBN0I7QUFDSDtBQUNELGFBQUtBLE1BQUwsQ0FBWU0sS0FBWixDQUFrQkMsUUFBbEIsR0FBNkIsT0FBN0I7QUFDQSxhQUFLUCxNQUFMLENBQVlNLEtBQVosQ0FBa0JFLEdBQWxCLEdBQXdCLEtBQUtULE9BQUwsQ0FBYVUsQ0FBYixJQUFrQixDQUExQztBQUNBLGFBQUtULE1BQUwsQ0FBWU0sS0FBWixDQUFrQkksSUFBbEIsR0FBeUIsS0FBS1gsT0FBTCxDQUFhWSxDQUFiLElBQWtCLENBQTNDO0FBQ0EsYUFBS1gsTUFBTCxDQUFZTSxLQUFaLENBQWtCTSxhQUFsQixHQUFrQyxNQUFsQzs7QUFFQTs7OztBQUlBLGFBQUtDLFFBQUwsR0FBZ0IsRUFBaEI7QUFDQSxhQUFLQyxNQUFMO0FBQ0g7O0FBRUQ7Ozs7Ozs7aUNBSUE7QUFDSSxnQkFBTUMsUUFBUSxLQUFLaEIsT0FBTCxDQUFhZ0IsS0FBYixJQUFzQkMsT0FBT0MsVUFBM0M7QUFDQSxnQkFBTUMsU0FBUyxLQUFLbkIsT0FBTCxDQUFhbUIsTUFBYixJQUF1QkYsT0FBT0csV0FBN0M7QUFDQSxpQkFBS25CLE1BQUwsQ0FBWWUsS0FBWixHQUFvQkEsS0FBcEI7QUFDQSxpQkFBS2YsTUFBTCxDQUFZa0IsTUFBWixHQUFxQkEsTUFBckI7QUFDQSxpQkFBS0UsTUFBTDtBQUNIOztBQUVEOzs7Ozs7aUNBSUE7QUFDSSxnQkFBTUMsVUFBVSxLQUFLckIsTUFBTCxDQUFZc0IsVUFBWixDQUF1QixJQUF2QixDQUFoQjtBQUNBRCxvQkFBUUUsSUFBUjtBQUNBRixvQkFBUUcsU0FBUixDQUFrQixDQUFsQixFQUFxQixDQUFyQixFQUF3QixLQUFLeEIsTUFBTCxDQUFZZSxLQUFwQyxFQUEyQyxLQUFLZixNQUFMLENBQVlrQixNQUF2RDtBQUNBRyxvQkFBUUksU0FBUixHQUFvQixLQUFLMUIsT0FBTCxDQUFhMkIsS0FBYixJQUFzQixPQUExQztBQUNBTCxvQkFBUU0sV0FBUixHQUFzQixLQUFLNUIsT0FBTCxDQUFhNkIsS0FBYixJQUFzQixHQUE1QztBQUNBUCxvQkFBUVEsUUFBUixDQUFpQixDQUFqQixFQUFvQixDQUFwQixFQUF1QixLQUFLN0IsTUFBTCxDQUFZZSxLQUFuQyxFQUEwQyxLQUFLZixNQUFMLENBQVlrQixNQUF0RDtBQUNBRyxvQkFBUVMsT0FBUjtBQUNBVCxvQkFBUUUsSUFBUjtBQUNBRixvQkFBUVUsd0JBQVIsR0FBbUMsaUJBQW5DO0FBVEo7QUFBQTtBQUFBOztBQUFBO0FBVUkscUNBQWtCLEtBQUtsQixRQUF2Qiw4SEFDQTtBQUFBLHdCQURTbUIsS0FDVDs7QUFDSSw0QkFBUUEsTUFBTUMsSUFBZDtBQUVJLDZCQUFLLFFBQUw7QUFDSVosb0NBQVFhLFNBQVI7QUFDQWIsb0NBQVFjLEdBQVIsQ0FBWUgsTUFBTXZCLENBQWxCLEVBQXFCdUIsTUFBTXJCLENBQTNCLEVBQThCcUIsTUFBTUksTUFBcEMsRUFBNEMsQ0FBNUMsRUFBK0NDLEtBQUtDLEVBQUwsR0FBVSxDQUF6RDtBQUNBakIsb0NBQVFrQixJQUFSO0FBQ0E7O0FBRUosNkJBQUssU0FBTDtBQUNJbEIsb0NBQVFhLFNBQVI7QUFDQWIsb0NBQVFtQixNQUFSLENBQWVSLE1BQU1TLE1BQU4sQ0FBYSxDQUFiLENBQWYsRUFBZ0NULE1BQU1TLE1BQU4sQ0FBYSxDQUFiLENBQWhDO0FBQ0EsaUNBQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJVixNQUFNUyxNQUFOLENBQWFFLE1BQWpDLEVBQXlDRCxLQUFLLENBQTlDLEVBQ0E7QUFDSXJCLHdDQUFRdUIsTUFBUixDQUFlWixNQUFNUyxNQUFOLENBQWFDLENBQWIsQ0FBZixFQUFnQ1YsTUFBTVMsTUFBTixDQUFhQyxJQUFJLENBQWpCLENBQWhDO0FBQ0g7QUFDRHJCLG9DQUFRd0IsU0FBUjtBQUNBeEIsb0NBQVFrQixJQUFSO0FBQ0FsQixvQ0FBUXlCLE1BQVI7QUFDQTtBQWxCUjtBQW9CSDtBQWhDTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWlDSXpCLG9CQUFRUyxPQUFSO0FBQ0g7O0FBRUQ7Ozs7Ozs7OEJBSU1pQixRLEVBQ047QUFDSSxpQkFBS2xDLFFBQUwsR0FBZ0IsRUFBaEI7QUFDQSxnQkFBSSxDQUFDa0MsUUFBTCxFQUNBO0FBQ0kscUJBQUtqQyxNQUFMO0FBQ0g7QUFDSjs7QUFFRDs7Ozs7Ozs7OzsrQkFPT0wsQyxFQUFHRSxDLEVBQUd5QixNLEVBQVFXLFEsRUFDckI7QUFDSSxpQkFBS2xDLFFBQUwsQ0FBY21DLElBQWQsQ0FBbUIsRUFBRWYsTUFBTSxRQUFSLEVBQWtCeEIsSUFBbEIsRUFBcUJFLElBQXJCLEVBQXdCeUIsY0FBeEIsRUFBbkI7QUFDQSxnQkFBSSxDQUFDVyxRQUFMLEVBQ0E7QUFDSSxxQkFBSzNCLE1BQUw7QUFDSDtBQUNKOztBQUVEOzs7Ozs7OztnQ0FLUXFCLE0sRUFBUU0sUSxFQUNoQjtBQUNJLGlCQUFLbEMsUUFBTCxDQUFjbUMsSUFBZCxDQUFtQixFQUFFZixNQUFNLFNBQVIsRUFBbUJRLGNBQW5CLEVBQW5CO0FBQ0EsZ0JBQUksQ0FBQ00sUUFBTCxFQUNBO0FBQ0kscUJBQUszQixNQUFMO0FBQ0g7QUFDSjs7QUFFRDs7Ozs7Ozs7NkJBS0s2QixJLEVBQ0w7QUFBQTs7QUFDSSxpQkFBS0MsT0FBTCxHQUFlLElBQWY7QUFDQSxnQkFBTUMsTUFBTUMsWUFBWUQsR0FBWixFQUFaO0FBQ0EsZ0JBQU1FLGFBQWFGLE1BQU0sS0FBS0csSUFBOUI7QUFDQSxpQkFBS0EsSUFBTCxHQUFZSCxHQUFaO0FBQ0FGLGlCQUFLTSxJQUFMLElBQWFGLFVBQWI7QUFDQSxnQkFBSUosS0FBS00sSUFBTCxHQUFZTixLQUFLTyxRQUFyQixFQUNBO0FBQ0kscUJBQUt4RCxNQUFMLENBQVlNLEtBQVosQ0FBa0JtRCxPQUFsQixHQUE0QlIsS0FBS1MsR0FBakM7QUFDSCxhQUhELE1BS0E7QUFDSSxxQkFBSzFELE1BQUwsQ0FBWU0sS0FBWixDQUFrQm1ELE9BQWxCLEdBQTRCUixLQUFLVSxJQUFMLENBQVVWLEtBQUtNLElBQWYsRUFBcUJOLEtBQUtXLEtBQTFCLEVBQWlDWCxLQUFLUyxHQUF0QyxFQUEyQ1QsS0FBS08sUUFBaEQsQ0FBNUI7QUFDQSxxQkFBS04sT0FBTCxHQUFlVyxzQkFBc0I7QUFBQSwyQkFBTSxNQUFLQyxJQUFMLENBQVViLElBQVYsQ0FBTjtBQUFBLGlCQUF0QixDQUFmO0FBQ0g7QUFDSjs7QUFFRDs7Ozs7Ozs7Ozs7K0JBUU9sRCxPLEVBQ1A7QUFDSSxnQkFBSSxLQUFLbUQsT0FBVCxFQUNBO0FBQ0lhLHFDQUFxQixLQUFLYixPQUExQjtBQUNIO0FBQ0RuRCxzQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGdCQUFNNkQsUUFBUTdELFFBQVE2RCxLQUFSLElBQWlCLENBQS9CO0FBQ0EsZ0JBQU1GLE1BQU0zRCxRQUFRMkQsR0FBUixJQUFlLENBQTNCO0FBQ0EsZ0JBQU1DLE9BQU8sQ0FBQzVELFFBQVE0RCxJQUFULEdBQWdCL0QsT0FBT29FLGFBQXZCLEdBQXVDLE9BQU9qRSxRQUFRNEQsSUFBZixLQUF3QixRQUF4QixHQUFtQy9ELE9BQU9HLFFBQVE0RCxJQUFmLENBQW5DLEdBQTBENUQsUUFBUTRELElBQXRIO0FBQ0EsaUJBQUszRCxNQUFMLENBQVlNLEtBQVosQ0FBa0JtRCxPQUFsQixHQUE0QkcsS0FBNUI7QUFDQSxnQkFBTUosV0FBV3pELFFBQVF5RCxRQUFSLElBQW9CLElBQXJDO0FBQ0EsaUJBQUtGLElBQUwsR0FBWUYsWUFBWUQsR0FBWixFQUFaO0FBQ0EsaUJBQUtXLElBQUwsQ0FBVSxFQUFFUCxNQUFNLENBQVIsRUFBV0ssWUFBWCxFQUFrQkYsUUFBbEIsRUFBdUJGLGtCQUF2QixFQUFpQ0csVUFBakMsRUFBVjtBQUNIOztBQUVEOzs7Ozs7Ozs7OztnQ0FRUTVELE8sRUFDUjtBQUNJQSxzQkFBVUEsV0FBVyxFQUFyQjtBQUNBQSxvQkFBUTZELEtBQVIsR0FBZ0IsT0FBTzdELFFBQVE2RCxLQUFmLEtBQXlCLFdBQXpCLEdBQXVDLENBQXZDLEdBQTJDN0QsUUFBUTZELEtBQW5FO0FBQ0E3RCxvQkFBUTJELEdBQVIsR0FBYyxPQUFPM0QsUUFBUTJELEdBQWYsS0FBdUIsV0FBdkIsR0FBcUMsQ0FBckMsR0FBeUMzRCxRQUFRMkQsR0FBL0Q7QUFDQSxpQkFBS08sTUFBTCxDQUFZbEUsT0FBWjtBQUNIOzs7Ozs7QUFHTG1FLE9BQU9DLE9BQVAsR0FBaUJyRSxTQUFqQiIsImZpbGUiOiJzcG90bGlnaHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQZW5uZXIgPSByZXF1aXJlKCdwZW5uZXInKVxyXG5cclxuLyoqXHJcbiAqIHNwb3RsaWdodC1jYW52YXM6IGEgY2FudmFzIGVsZW1lbnQgdGhhdCBkaW1zIHRoZSBzY3JlZW4gZXhjZXB0IGZvciBzcG90bGlnaHQgbG9jYXRpb25zIGZvcm1lZCBieSBjaXJjbGVzIG9yIHBvbHlnb25zXHJcbiAqL1xyXG5jbGFzcyBTcG90bGlnaHRcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGUgYSBzcG90bGlnaHQgZGl2XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMueD0wXSB1c2UgdG8gcGxhY2UgbGF5ZXIgb24gY3JlYXRpb25cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy55PTBdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2lkdGg9d2luZG93LmlubmVyV2lkdGhdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuaGVpZ2h0PXdpbmRvdy5pbm5lckhlaWdodF1cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5jb2xvcj1ibGFja10gY29sb3Igb2YgdW5kZXIgbGF5ZXJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5hbHBoYT0wLjVdIGFscGhhIG9mIHVuZGVyIGxheWVyXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbb3B0aW9ucy5wYXJlbnQ9ZG9jdW1lbnQuYm9keV0gcGFyZW50IG9mIHNwb3RsaWdodCBsYXllclxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucGFyZW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJ1xyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnRvcCA9IHRoaXMub3B0aW9ucy54IHx8IDBcclxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5sZWZ0ID0gdGhpcy5vcHRpb25zLnkgfHwgMFxyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSdcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogdGhlIGxpc3Qgb2Ygc3BvdGxpZ2h0cy4gaWYgbWFudWFsbHkgY2hhbmdlZCB0aGVuIGNhbGwgcmVkcmF3KCkgdG8gdXBkYXRlIHRoZSBjYW52YXNcclxuICAgICAgICAgKiBAdHlwZSB7b2JqZWN0W119XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5vcGVuaW5ncyA9IFtdXHJcbiAgICAgICAgdGhpcy5yZXNpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVzaXplIHRoZSBsYXllciB0byBlbnN1cmUgZW50aXJlIHNjcmVlbiBpcyBjb3ZlcmVkXHJcbiAgICAgKi9cclxuICAgIHJlc2l6ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLm9wdGlvbnMud2lkdGggfHwgd2luZG93LmlubmVyV2lkdGhcclxuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLm9wdGlvbnMuaGVpZ2h0IHx8IHdpbmRvdy5pbm5lckhlaWdodFxyXG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gd2lkdGhcclxuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHRcclxuICAgICAgICB0aGlzLnJlZHJhdygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmb3JjZSBhIHJlZHJhdyBvZiB0aGUgc3BvdGxpZ2h0ICh1c3VhbGx5IGNhbGxlZCBpbnRlcm5hbGx5KVxyXG4gICAgICovXHJcbiAgICByZWRyYXcoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICAgICAgY29udGV4dC5zYXZlKClcclxuICAgICAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KVxyXG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5vcHRpb25zLmNvbG9yIHx8ICdibGFjaydcclxuICAgICAgICBjb250ZXh0Lmdsb2JhbEFscGhhID0gdGhpcy5vcHRpb25zLmFscGhhIHx8IDAuNVxyXG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodClcclxuICAgICAgICBjb250ZXh0LnJlc3RvcmUoKVxyXG4gICAgICAgIGNvbnRleHQuc2F2ZSgpXHJcbiAgICAgICAgY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24tb3V0J1xyXG4gICAgICAgIGZvciAobGV0IGVudHJ5IG9mIHRoaXMub3BlbmluZ3MpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGVudHJ5LnR5cGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2NpcmNsZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuYXJjKGVudHJ5LngsIGVudHJ5LnksIGVudHJ5LnJhZGl1cywgMCwgTWF0aC5QSSAqIDIpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5maWxsKClcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgJ3BvbHlnb24nOlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKClcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm1vdmVUbyhlbnRyeS5wb2ludHNbMF0sIGVudHJ5LnBvaW50c1sxXSlcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMjsgaSA8IGVudHJ5LnBvaW50cy5sZW5ndGg7IGkgKz0gMilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQubGluZVRvKGVudHJ5LnBvaW50c1tpXSwgZW50cnkucG9pbnRzW2kgKyAxXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbCgpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5zdHJva2UoKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGV4dC5yZXN0b3JlKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsZWFycyBhbnkgY3V0b3V0c1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbbm9SZWRyYXddIGRvbid0IGZvcmNlIGEgY2FudmFzIHJlZHJhd1xyXG4gICAgICovXHJcbiAgICBjbGVhcihub1JlZHJhdylcclxuICAgIHtcclxuICAgICAgICB0aGlzLm9wZW5pbmdzID0gW11cclxuICAgICAgICBpZiAoIW5vUmVkcmF3KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5yZXNpemUoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZHMgYSBjaXJjbGUgc3BvdGxpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXNcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW25vUmVkcmF3XSBkb24ndCBmb3JjZSBhIGNhbnZhcyByZWRyYXdcclxuICAgICAqL1xyXG4gICAgY2lyY2xlKHgsIHksIHJhZGl1cywgbm9SZWRyYXcpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5vcGVuaW5ncy5wdXNoKHsgdHlwZTogJ2NpcmNsZScsIHgsIHksIHJhZGl1cyB9KVxyXG4gICAgICAgIGlmICghbm9SZWRyYXcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnJlZHJhdygpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkcyBhIHBvbHlnb24gc3BvdGxpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcltdfSBwb2ludHMgLSBbeDEsIHkxLCB4MiwgeTIsIC4uLiB4biwgeW5dXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtub1JlZHJhd10gZG9uJ3QgZm9yY2UgYSBjYW52YXMgcmVkcmF3XHJcbiAgICAgKi9cclxuICAgIHBvbHlnb24ocG9pbnRzLCBub1JlZHJhdylcclxuICAgIHtcclxuICAgICAgICB0aGlzLm9wZW5pbmdzLnB1c2goeyB0eXBlOiAncG9seWdvbicsIHBvaW50cyB9KVxyXG4gICAgICAgIGlmICghbm9SZWRyYXcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnJlZHJhdygpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXNlZCBpbnRlcm5hbGx5IGZvciBmYWRlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgZmFkZShkYXRhKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMucmVxdWVzdCA9IG51bGxcclxuICAgICAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKVxyXG4gICAgICAgIGNvbnN0IGRpZmZlcmVuY2UgPSBub3cgLSB0aGlzLmxhc3RcclxuICAgICAgICB0aGlzLmxhc3QgPSBub3dcclxuICAgICAgICBkYXRhLnRpbWUgKz0gZGlmZmVyZW5jZVxyXG4gICAgICAgIGlmIChkYXRhLnRpbWUgPiBkYXRhLmR1cmF0aW9uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUub3BhY2l0eSA9IGRhdGEuZW5kXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLm9wYWNpdHkgPSBkYXRhLmVhc2UoZGF0YS50aW1lLCBkYXRhLnN0YXJ0LCBkYXRhLmVuZCwgZGF0YS5kdXJhdGlvbilcclxuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0ID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuZmFkZShkYXRhKSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmYWRlIGluIHRoZSB1bmRlciBsYXllclxyXG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zdGFydD0wXSBzdGFydGluZyBvcGFjaXR5XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZW5kPTFdIGVuZGluZyBvcGFjaXR5XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZHVyYXRpb249MTAwMF0gZHVyYXRpb24gb2YgZmFkZSBpbiBtaWxsaXNlY29uZHNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfEZ1bmN0aW9ufSBbb3B0aW9ucy5lYXNlPSdlYXNlSW5PdXRTaW5lJ10gZWFzaW5nIGZ1bmN0aW9uIChAc2VlIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3Blbm5lcilcclxuICAgICAqL1xyXG4gICAgZmFkZUluKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVxdWVzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMucmVxdWVzdClcclxuICAgICAgICB9XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBjb25zdCBzdGFydCA9IG9wdGlvbnMuc3RhcnQgfHwgMFxyXG4gICAgICAgIGNvbnN0IGVuZCA9IG9wdGlvbnMuZW5kIHx8IDFcclxuICAgICAgICBjb25zdCBlYXNlID0gIW9wdGlvbnMuZWFzZSA/IFBlbm5lci5lYXNlSW5PdXRTaW5lIDogdHlwZW9mIG9wdGlvbnMuZWFzZSA9PT0gJ3N0cmluZycgPyBQZW5uZXJbb3B0aW9ucy5lYXNlXSA6IG9wdGlvbnMuZWFzZVxyXG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLm9wYWNpdHkgPSBzdGFydFxyXG4gICAgICAgIGNvbnN0IGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiB8fCAxMDAwXHJcbiAgICAgICAgdGhpcy5sYXN0ID0gcGVyZm9ybWFuY2Uubm93KClcclxuICAgICAgICB0aGlzLmZhZGUoeyB0aW1lOiAwLCBzdGFydCwgZW5kLCBkdXJhdGlvbiwgZWFzZSB9KVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmFkZSBvdXQgdGhlIHVuZGVyIGxheWVyXHJcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnN0YXJ0PTFdIHN0YXJ0aW5nIG9wYWNpdHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5lbmQ9MF0gZW5kaW5nIG9wYWNpdHlcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5kdXJhdGlvbj0xMDAwXSBkdXJhdGlvbiBvZiBmYWRlIGluIG1pbGxpc2Vjb25kc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8RnVuY3Rpb259IFtvcHRpb25zLmVhc2U9J2Vhc2VJbk91dFNpbmUnXSBlYXNpbmcgZnVuY3Rpb24gKEBzZWUgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvcGVubmVyKVxyXG4gICAgICovXHJcbiAgICBmYWRlT3V0KG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBvcHRpb25zLnN0YXJ0ID0gdHlwZW9mIG9wdGlvbnMuc3RhcnQgPT09ICd1bmRlZmluZWQnID8gMSA6IG9wdGlvbnMuc3RhcnRcclxuICAgICAgICBvcHRpb25zLmVuZCA9IHR5cGVvZiBvcHRpb25zLmVuZCA9PT0gJ3VuZGVmaW5lZCcgPyAwIDogb3B0aW9ucy5lbmRcclxuICAgICAgICB0aGlzLmZhZGVJbihvcHRpb25zKVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNwb3RsaWdodCJdfQ==