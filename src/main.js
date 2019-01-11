(function () {
    function postData(url = ``, data = {}) {
        // Default options are marked with *
        return fetch(url, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, cors, *same-origin
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                credentials: "same-origin", // include, *same-origin, omit
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    // "Content-Type": "application/x-www-form-urlencoded",
                },
                redirect: "follow", // manual, *follow, error
                referrer: "no-referrer", // no-referrer, *client
                body: JSON.stringify(data), // body data type must match "Content-Type" header
            })
            .then(response => response.json()); // parses response to JSON
    }
    require('./assets/styles/main.css');
    require('./helpers');

    var textInput;
    var textSize;
    var textSpeed;
    var textColor;
    var runButton;
    var canvas;
    var ctx;
    // var letters = require('./assets/data/letters.json');

    const settings = {
        size: 1,
        speed: 10,
        width: 3,
        color: '#ff0000',
        drawing: false,
        setSize: function (value) {
            this.size = value / 5;
            this.width = this.size * 3;
            if (this.width < 1) {
                this.width = 1;
            }
        },
        setSpeed: function (value) {
            this.speed = 100 - value;
            ctx.animationTime = this.speed;
        },
        setColor: function (value) {
            this.color = value;
        }
    }

    function init() {
        let controls = document.querySelector('.controls');
        textInput = controls.querySelector('#text-input');
        textSize = controls.querySelector('#text-size');
        textSpeed = controls.querySelector('#text-speed');
        textColor = controls.querySelector('#text-color');
        runButton = controls.querySelector('#run');
        canvas = document.querySelector('#drawing');
        ctx = canvas.getContext('2d');
        bindEvents();
        setCanvasSize(ctx.canvas);
    }

    function bindEvents() {
        runButton.addEventListener('click', () => {
            if (document.body.classList.contains('running')) {
                ctx.cancelDrawing = true;
                stop();
            } else {
                run();
            }
        });

        textSize.addEventListener('change', (evt) => {
            settings.setSize(evt.target.valueAsNumber);
        });

        textSpeed.addEventListener('change', (evt) => {
            settings.setSpeed(evt.target.valueAsNumber);
        });

        textColor.addEventListener('change', (evt) => {
            settings.setColor(evt.target.value);
        });
    }

    function render(data, animate) {
        if (animate == null) { animate = true; }
        let func;
        let d = data.map(i => i);
        switch (d.shift()) {
            case 'M':
                func = animate ? 'move' : 'moveTo';
                break;
            case 'L':
                func = animate ? 'line' : 'lineTo';
                break;
            case 'C':
                func = animate ? 'bezierCurve' : 'bezierCurveTo';
                break;
            case 'Q':
                func = animate ? 'quadraticCurve' : 'quadraticCurveTo';
                break;
        }
        if (func) {
            CanvasRenderingContext2D.prototype[func].apply(ctx, d);
            ctx.stroke();
        }
    }

    function run() {
        controlsEnabling(false);
        document.body.classList.add('running');
        drawText(textInput.value);
    }

    function stop() {
        controlsEnabling(true);
        document.body.classList.remove('running');
    }

    function controlsEnabling(enable) {
        textInput.disabled = !enable;
        textSize.disabled = !enable;
        textSpeed.disabled = !enable;
    }

    init();

    function addData(symbol, source, x, y) {
        x = x || 0;
        y = y || 0;
        source.data.forEach(m =>
            symbol.push(m.map((d, i) => i === 0 ? d : d + (i % 2 ? x : y))));
        return lastPosition(symbol);
    }

    function lastPosition(symbol) {
        const last = symbol[symbol.length - 1];
        return last[last.length - 2];
    }

    function resize(data) {
        if (settings.size === undefined) {
            return data;
        }
        return data.map(d => isNaN(d) ? d : (d * settings.size));
    }

    function setCanvasSize(canvas) {
        const style = window.getComputedStyle(canvas);
        const width = style.width.replace(/\D/g, '');
        const height = style.height.replace(/\D/g, '');
        canvas.width = width;
        canvas.height = height;
        return {width, height};
    }

    function getSymbolLimit(symbol) {
        let max = Math.max.apply(null,
            symbol.data.map(d =>
                max = Math.max.apply(null, d.map((v, j) => j % 2 ? v : -999))
            )
        );
        return max;
    }

    function scaleSymbol(symbol) {
        const result = Object.assign({}, symbol);
        if (result.data) {
            result.data = result.data.map(d =>
                d.map(v => isNaN(v) ? v : (v * settings.size))
            );
        }
        Object.keys(result).forEach(p => {
            if (result[p].data) {
                scaleSymbol(result[p]);
            }
        });
        return result;
    }

    function getLetters(text) {
        const letters = {};
        const data = require('./assets/data/letters.json');
        for (let i = 0; i < text.length; i += 1) {
            let char = text[i];
            letters[char] = letters[char] || data[char] || letters[' '];
        }
        return letters;
    }

    function drawText(text) {
        text =text.toLowerCase();
        const canvasSize = setCanvasSize(ctx.canvas);
        const content = [];
        let row = [];
        let word = [];
        let letter;
        let afterWord = {data:[]};
        let x = 0;
        let y = 0;
        row.push(word);
        const letters = getLetters(text);
        for (let i = 0; i < text.length; i += 1) {
            const symbol = [];
            letter = letters[text[i]] || letters[' '];
            if (letter.ref) {
                letter = Object.assign({}, letters[letter.ref] || {}, letter);
            }
            let letterStart = x;
            if (!word.length && letter.first) {
                letterStart = addData(symbol, letter.first, letterStart);
            } else if (symbol.length && letter.before) {
                letterStart = addData(symbol, letter.before, letterStart);
            }
            letterStart = addData(symbol, letter, letterStart);
            if (letter.afterWord) {
                addData(symbol, letter.afterWord, x);
            }
            symbol.forEach(d => word.push(d));
            x = letterStart;
        }
        content.push(row);
        console.log(content);

        ctx.clear();
        ctx.init(settings.width, '#ddd');
        content.forEach(row => row.forEach(word => word.forEach(line => render(line, false))));
        ctx.stroke();
        stop();
    }

    function __drawText(text) {
        // TEMP
        text = text.toLowerCase();
        const canvasSize = setCanvasSize(ctx.canvas);
        let symbol;
        let i;
        let row = [];
        let col;
        let x = 0;
        let y = 0;
        const content = [];
        let afterWord = {data:[], length:0};



        
        for (i = 0; i < text.length; i += 1) {
            let letter = letters[text[i]] || letters[' '];
            if (letter) {
                const lastLetter = row.last();
                if (lastLetter && getSymbolLimit(lastLetter) > canvasSize.width - 100) {
                    content.push(row);
                    row = [];
                    x = 0;
                    y += 300;
                }
                let isFirstLetter = i === 0 || (row.length && row[row.length - 1].breakWord);
                let start = x;
                symbol = {data:[], length: 0};
                if (letter.ref) {
                    let ref = letters[letter.ref];
                    letter = Object.assign({}, ref, letter);
                }
                if (isFirstLetter && letter.first) {
                    start = addData(symbol, letter.first, start, y);
                } else if (!isFirstLetter && letter.before) {
                    start = addData(symbol, letter.before, start, y);
                }
                if (letter.afterWord) {
                    addData(afterWord, letter.afterWord, x, y);
                }
                start = addData(symbol, letter, start, y);
                x = start;
                row.push(symbol);
                if (letter.breakWord && afterWord.data) {
                    row.push(afterWord);
                    afterWord = {data:[], length:0};
                }
                if (getSymbolLimit(symbol) > canvasSize.width) {
                    content.push(row);
                    row = [];
                    x = 0;
                    y += 300;
                }
            }
        }
        if (afterWord.data) {
            row.push(afterWord);
        }
        if (row.length) {
            content.push(row);
        }

        content.forEach(word => {
            word.forEach(letter => letter.data = letter.data.map(l => resize(l)))
        });
        ctx.clear();
        ctx.init(settings.width, '#ddd');
        content.forEach(word => {
            word.forEach(letter => letter.data.forEach(l => render(l, false)));
        });
        ctx.stroke();

        row = 0;
        col = 0;
        x = 0;
        symbol = content[row][col];
        const drawSymbol = () => {
            col += 1;
            if (col >= content[row].length) {
                row += 1;
                col = 0;
                if (row < content.length) {
                    drawSymbol();
                } else {
                    stop();
                }
            } else {
                symbol = content[row][col];
                if (symbol) {
                    draw(symbol).then(drawSymbol);
                } else {
                    stop();
                }
            }
        }

        draw(symbol).then(drawSymbol);
    }

    function draw(letter) {
        ctx.init(settings.width, settings.color);
        return new Promise(resolve => {
            let i = -1;
            const drawLine = () => {
                i += 1;
                const line = letter.data[i];
                if (line) {
                    render(line).then(drawLine);
                } else {
                    resolve();
                }
            }
            drawLine();
        });
    }

    function test(v) {
        try { postData('test/Default.asmx/Post', {value: JSON.stringify(v.join('#'))}); }
        catch (x) { }
    }
})();
