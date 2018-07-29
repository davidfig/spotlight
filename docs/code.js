const Spotlight = require('../src/spotlight')

const RADIUS = 50

let _spotlight

function spotlight()
{
    _spotlight = new Spotlight()
    _spotlight.polygon([100, 10, 280, 10, 270, 50, 115, 45], true)
    _spotlight.circle(window.innerWidth / 2, window.innerHeight / 2, RADIUS)
    _spotlight.fadeIn()

    document.body.addEventListener('mouseup', (e) => up(e))
    document.body.addEventListener('mousemove', (e) => move(e))
}

function move(e)
{
    const point = translateEvent(e)
    const opening = _spotlight.openings[_spotlight.openings.length - 1]
    opening.x = point.x
    opening.y = point.y
    _spotlight.redraw()
}

function up(e)
{
    const point = translateEvent(e)
    _spotlight.circle(point.x, point.y, RADIUS)
}

function resize()
{
    _spotlight.resize()
}

function translateEvent(e)
{
    let x, y

    if (e.changedTouches)
    {
        const touch = e.changedTouches[0]
        x = touch.pageX
        y = touch.pageY
    }
    else
    {
        x = e.pageX
        y = e.pageY
    }
    return { x, y }
}

window.onload = function ()
{
    spotlight()
    window.addEventListener('resize', resize)
    require('./highlight')()
}