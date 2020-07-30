const { CanvasRenderingContext2D, requestAnimationFrame } = window;

(function(number) {
  number.prototype.isBetween = function(a, b) {
    const value = this.valueOf();
    return (a < b && value >= a && value <= b) ||
      (a > b && value <= a && value >= b) ||
      (a === value && b === value);
  };
})(Number);

(function(array) {
  array.prototype.last = array.prototype.last || function(defaultValue) {
    return this.length ? this[this.length - 1] : defaultValue || null;
  };

  array.prototype.flat = array.prototype.flat || function(depth) {
    const result = [];
    const concat = (level, index) => {
      level.forEach(item => {
        if (index < depth && item instanceof Array) {
          concat(item, index + 1);
        } else {
          result.push(item);
        }
      });
    };
    concat(this, 0);
    return result;
  };
})(Array);

(function(context) {
  context.prototype.currentPosition = { x: 0, y: 0 };
  context.prototype.animationTime = 1;
  context.prototype.cancelDrawing = false;

  context.prototype.clear = function() {
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  context.prototype.init = function(width, color) {
    this.lineWidth = width;
    this.strokeStyle = color;
    this.beginPath();
  };

  context.prototype.move = function(x, y) {
    const time =
      (Math.abs(this.currentPosition.x - x) + Math.abs(this.currentPosition.y - y)) / 2;
    return new Promise(resolve => {
      setTimeout(() => {
        this.moveTo(x, y);
        this.currentPosition.x = x;
        this.currentPosition.y = y;
        resolve();
      }, time);
    });
  };

  context.prototype.line = function(toX, toY) {
    const ctx = this;
    return new Promise((resolve, reject) => {
      const fromX = ctx.currentPosition.x;
      const fromY = ctx.currentPosition.y;
      const factorX = (toX - fromX) * 0.001;
      const factorY = (toY - fromY) * 0.001;
      const time = 1 / this.animationTime;
      let x = fromX;
      let y = fromY;
      const drawSegment = () => {
        if (ctx.cancelDrawing) {
          ctx.cancelDrawing = false;
          // eslint-disable-next-line prefer-promise-reject-errors
          reject();
          return;
        }
        for (let i = 0; i < time; i += 0.001) {
          x += factorX;
          y += factorY;
          if (!x.isBetween(fromX, toX)) {
            x = toX;
          }
          if (!y.isBetween(fromY, toY)) {
            y = toY;
          }
          ctx.lineTo(x, y);
        }
        ctx.stroke();

        if (x.isBetween(fromX, toX) && y.isBetween(fromY, toY) && (x !== toX || y !== toY)) {
          requestAnimationFrame(drawSegment);
        } else {
          ctx.currentPosition.x = x;
          ctx.currentPosition.y = y;
          resolve(x, y);
        }
      };
      requestAnimationFrame(drawSegment);
    });
  };

  context.prototype.bezierCurve = function(cp1x, cp1y, cp2x, cp2y, toX, toY) {
    const ctx = this;
    return new Promise((resolve, reject) => {
      const fromX = ctx.currentPosition.x;
      const fromY = ctx.currentPosition.y;
      const time = 1 / this.animationTime;
      let t = 0;
      const drawSegment = function() {
        if (ctx.cancelDrawing) {
          ctx.cancelDrawing = false;
          // eslint-disable-next-line prefer-promise-reject-errors
          reject();
          return;
        }
        let x;
        let y;
        ctx.beginPath();
        for (let i = 0; i < time; i += 0.001) {
          const ax = Math.pow(1 - t, 3) * fromX;
          const bx = 3 * Math.pow(1 - t, 2) * t * cp1x;
          const cx = 3 * (1 - t) * Math.pow(t, 2) * cp2x;
          const dx = Math.pow(t, 3) * toX;
          const ay = Math.pow(1 - t, 3) * fromY;
          const by = 3 * Math.pow(1 - t, 2) * t * cp1y;
          const cy = 3 * (1 - t) * Math.pow(t, 2) * cp2y;
          const dy = Math.pow(t, 3) * toY;
          x = ax + bx + cx + dx;
          y = ay + by + cy + dy;
          t += 0.001;
          ctx.lineTo(x, y);
        }
        ctx.stroke();

        if (t <= 1) {
          requestAnimationFrame(drawSegment);
        } else {
          ctx.currentPosition.x = x;
          ctx.currentPosition.y = y;
          resolve({ x, y });
        }
      };
      requestAnimationFrame(drawSegment);
    });
  };

  context.prototype.quadraticCurve = function(cpx, cpy, toX, toY) {
    const ctx = this;
    return new Promise((resolve, reject) => {
      const fromX = ctx.currentPosition.x;
      const fromY = ctx.currentPosition.y;
      const time = 1 / this.animationTime;
      let x;
      let y;
      let t = 0;
      const drawSegment = function() {
        if (ctx.cancelDrawing) {
          ctx.cancelDrawing = false;
          // eslint-disable-next-line prefer-promise-reject-errors
          reject();
          return;
        }
        for (let i = 0; i < time; i += 0.001) {
          x = (1 - t) * ((1 - t) * fromX + t * cpx) + t * ((1 - t) * cpx + t * toX);
          y = (1 - t) * ((1 - t) * fromY + t * cpy) + t * ((1 - t) * cpy + t * toY);
          t += 0.001;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        if (t <= 1) {
          requestAnimationFrame(drawSegment);
        } else {
          ctx.currentPosition.x = x;
          ctx.currentPosition.y = y;
          resolve({ x, y });
        }
      };
      drawSegment();
    });
  };
})(CanvasRenderingContext2D);
