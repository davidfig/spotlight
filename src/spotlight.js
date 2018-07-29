const Penner = require('penner')

/**
 * spotlight-ui: a canvas element that dims the screen except for spotlight locations formed by circles or polygons
 */
class Spotlight
{
    /**
     * create a spotlight div
     * @param {object} [options]
     * @param {number} [options.x=0] use to place layer on creation
     * @param {number} [options.y=0]
     * @param {number} [options.width=window.innerWidth]
     * @param {number} [options.height=window.innerHeight]
     * @param {PIXI.Texture} [options.texture=PIXI.Texture.WHITE]
     * @param {number} [options.color=black] color of under layer
     * @param {number} [options.alpha=0.5] alpha of under layer
     * @param {HTMLElement} [options.parent=document.body] parent of spotlight layer
     */
    constructor(options)
    {
        this.options = options || {}
        this.canvas = document.createElement('canvas')
        if (!this.options.parent)
        {
            document.body.appendChild(this.canvas)
        }
        else
        {
            this.parent.appendChild(this.canvas)
        }
        this.canvas.style.position = 'fixed'
        this.canvas.style.top = this.options.x || 0
        this.canvas.style.left = this.options.y || 0

        /**
         * the list of spotlights. if manually changed then call redraw() to update the canvas
         * @type {object[]}
         */
        this.openings = []
        this.resize()
    }

    /**
     * resize the layer to ensure entire screen is covered
     */
    resize()
    {
        const width = this.options.width || window.innerWidth
        const height = this.options.height || window.innerHeight
        this.canvas.width = width
        this.canvas.height = height
        this.redraw()
    }

    /**
     * force a redraw of the spotlight (usually called internally)
     */
    redraw()
    {
        const context = this.canvas.getContext('2d')
        context.save()
        context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        context.fillStyle = this.options.color || 'black'
        context.globalAlpha = this.options.alpha || 0.5
        context.fillRect(0, 0, this.canvas.width, this.canvas.height)
        context.restore()
        context.save()
        context.globalCompositeOperation = 'destination-out'
        for (let entry of this.openings)
        {
            switch (entry.type)
            {
                case 'circle':
                    context.beginPath()
                    context.arc(entry.x, entry.y, entry.radius, 0, Math.PI * 2)
                    context.fill()
                    break

                case 'polygon':
                    context.beginPath()
                    context.moveTo(entry.points[0], entry.points[1])
                    for (let i = 2; i < entry.points.length; i += 2)
                    {
                        context.lineTo(entry.points[i], entry.points[i + 1])
                    }
                    context.closePath()
                    context.fill()
                    context.stroke()
                    break
            }
        }
        context.restore()
    }

    /**
     * clears any cutouts
     * @param {boolean} [noRedraw] don't force a canvas redraw
     */
    clear(noRedraw)
    {
        this.openings = []
        if (!noRedraw)
        {
            this.resize()
        }
    }

    /**
     * adds a circle spotlight
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     * @param {boolean} [noRedraw] don't force a canvas redraw
     */
    circle(x, y, radius, noRedraw)
    {
        this.openings.push({ type: 'circle', x, y, radius })
        if (!noRedraw)
        {
            this.redraw()
        }
    }

    /**
     * adds a polygon spotlight
     * @param {number[]} points - [x1, y1, x2, y2, ... xn, yn]
     * @param {boolean} [noRedraw] don't force a canvas redraw
     */
    polygon(points, noRedraw)
    {
        this.openings.push({ type: 'polygon', points })
        if (!noRedraw)
        {
            this.redraw()
        }
    }

    /**
     * used internally for fade
     * @param {object} data
     * @private
     */
    fade(data)
    {
        this.request = null
        const now = performance.now()
        const difference = now - this.last
        this.last = now
        data.time += difference
        if (data.time > data.duration)
        {
            this.canvas.style.opacity = data.end
        }
        else
        {
            this.canvas.style.opacity = data.ease(data.time, data.start, data.end, data.duration)
            this.request = requestAnimationFrame(() => this.fade(data))
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
    fadeIn(options)
    {
        if (this.request)
        {
            cancelAnimationFrame(this.request)
        }
        options = options || {}
        const start = options.start || 0
        const end = options.end || 1
        const ease = !options.ease ? Penner.easeInOutSine : typeof options.ease === 'string' ? Penner[options.ease] : options.ease
        this.canvas.style.opacity = start
        const duration = options.duration || 1000
        this.last = performance.now()
        this.fade({ time: 0, start, end, duration, ease })
    }

    /**
     * fade out the under layer
     * @param {*} [options]
     * @param {number} [options.start=1] starting opacity
     * @param {number} [options.end=0] ending opacity
     * @param {number} [options.duration=1000] duration of fade in milliseconds
     * @param {string|Function} [options.ease='easeInOutSine'] easing function (@see https://www.npmjs.com/package/penner)
     */
    fadeOut(options)
    {
        options = options || {}
        options.start = typeof options.start === 'undefined' ? 1 : options.start
        options.end = typeof options.end === 'undefined' ? 0 : options.end
        this.fadeIn(options)
    }
}

module.exports = Spotlight