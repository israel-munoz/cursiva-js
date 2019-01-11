(function (canvas) {
    canvas.animatebezierCurveTo = canvas.animatebezierCurveTo || function (cp1x, cp1y, cp2x, cp2y, x, y, duration, delay) {
        setTimeout(function () {
            return new Promise(function (resolve, reject) {
                var start = null;

                var step = function animatePathDrawingStep(timestamp) {
                    if (start === null) {
                        start = timestamp;
                    }

                    var delta = timestamp - start;
                    var progress = Math.min(delta / duration, 1);

                    drawBezierSplit(ctx, cp1x, cp1y, cp2x, cp2y, x, y, 0, progress);

                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    }
                };

                window.requestAnimationFrame(step);
            });
        }, delay);
    };

function animatePathDrawing(ctx, x0, y0, x1, y1, x2, y2, duration) {
    var start = null;
    
    var step = function animatePathDrawingStep(timestamp) {
        if (start === null)
            start = timestamp;
        
        var delta = timestamp - start,
            progress = Math.min(delta / duration, 1);
        
        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw curve
        drawBezierSplit(ctx, x0, y0, x1, y1, x2, y2, 0, progress);
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    
    window.requestAnimationFrame(step);
}

/**
 * Draws a splitted bezier-curve
 * 
 * @param ctx       The canvas context to draw to
 * @param x0        The x-coord of the start point
 * @param y0        The y-coord of the start point
 * @param x1        The x-coord of the control point
 * @param y1        The y-coord of the control point
 * @param x2        The x-coord of the end point
 * @param y2        The y-coord of the end point
 * @param t0        The start ratio of the splitted bezier from 0.0 to 1.0
 * @param t1        The start ratio of the splitted bezier from 0.0 to 1.0
 */
function drawBezierSplit(ctx, x0, y0, x1, y1, x2, y2, t0, t1) {
    ctx.beginPath();
    
	if( 0.0 == t0 && t1 == 1.0 ) {
		ctx.moveTo( x0, y0 );
		ctx.quadraticCurveTo( x1, y1, x2, y2 );
	} else if( t0 != t1 ) {
        var t00 = t0 * t0,
            t01 = 1.0 - t0,
            t02 = t01 * t01,
            t03 = 2.0 * t0 * t01;
        
        var nx0 = t02 * x0 + t03 * x1 + t00 * x2,
            ny0 = t02 * y0 + t03 * y1 + t00 * y2;
        
        t00 = t1 * t1;
        t01 = 1.0 - t1;
        t02 = t01 * t01;
        t03 = 2.0 * t1 * t01;
        
        var nx2 = t02 * x0 + t03 * x1 + t00 * x2,
            ny2 = t02 * y0 + t03 * y1 + t00 * y2;
        
        var nx1 = lerp ( lerp ( x0 , x1 , t0 ) , lerp ( x1 , x2 , t0 ) , t1 ),
            ny1 = lerp ( lerp ( y0 , y1 , t0 ) , lerp ( y1 , y2 , t0 ) , t1 );
        
        ctx.moveTo( nx0, ny0 );
        ctx.quadraticCurveTo( nx1, ny1, nx2, ny2 );
	}
    
    ctx.stroke();
    ctx.closePath();
}

/**
 * Linearly interpolates between two numbers
 */
function lerp(v0, v1, t) {
    return ( 1.0 - t ) * v0 + t * v1;
}

var docCanvas = document.getElementById('canvas');
var ctx = docCanvas.getContext('2d');

animatePathDrawing(ctx, 0, 100, 150, -50, 300, 100, 5000);
})(CanvasRenderingContext2D.prototype);
