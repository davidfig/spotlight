# spotlight-canvas
a simple canvas-based spotlight that can be used to highlight elements

Features:
* a canvas that darkens the screen
* spotlight areas based on circles or polygons
* spotlight areas can be dynamically changed or cleared
* the canvas includes fadeIn and fadeOut functions

## Live Example
[davidfig.github.io/spotlight/](https://davidfig.github.io/spotlight/)

## Rationale
I needed a way to highlight elements in my UI. 

## Simple Example
```js
var Spotlight = require('spotlight-canvas');

// create the scrollbox
var spotlight = new Spotlight();

// create a circle spotlight
spotlight.circle(100, 100, 200);

```

## Installation

```
npm i spotlight-canvas
```

## API Documentation
[https://davidfig.github.io/spotlight/jsdoc/](https://davidfig.github.io/spotlight/jsdoc/)

## license  
MIT License  
(c) 2018 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
