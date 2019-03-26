(function () {
    function postData(url = ``, data = {}) {
        return fetch(url, {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                redirect: "follow",
                referrer: "no-referrer",
                body: JSON.stringify(data)
            })
            .then(response => response.json());
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
            this.speed = 10 - value;
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
        settings.setSize(textSize.valueAsNumber);
        settings.setSpeed(textSpeed.valueAsNumber);
        settings.setColor(textColor.value);
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

    function setCanvasSize(canvas, width, height) {
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
        } else {
            const style = window.getComputedStyle(canvas.parentElement);
            width = style.width.replace(/\D/g, '');
            height = style.height.replace(/\D/g, '');
            canvas.width = width;
            canvas.height = height;
        }
        return {width, height};
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
            return CanvasRenderingContext2D.prototype[func].apply(ctx, d);
        }
    }

    function run() {
        controlsEnabling(false);
        setCanvasSize(ctx.canvas);
        document.body.classList.add('running');
        const data = getDataToDraw(textInput.value);
        drawContent(data);
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

    function getDataToDraw(text) {
        const rows = [];
        let row = [];
        let word = [];
        const letters = getLetters(text);
        let symbolX = 0;
        let symbolY = 0;
        const lineHeight = 300 * settings.size;
        const maxWidth = canvas.width;
        let afterWord = [];

        for (let i = 0; i < text.length; i += 1) {
            const symbol = [];
            letter = letters[text[i]] || letters[' '];
            if (letter.ref) {
                letter = Object.assign({}, letters[letter.ref] || {}, letter);
            }
            if (!word.length && letter.first) {
                symbolX = addDataToSymbol(symbol, letter.first, symbolX, symbolY);
            } else if (word.length && letter.before) {
                symbolX = addDataToSymbol(symbol, letter.before, symbolX, symbolY);
            }
            if (letter.afterWord) {
                addDataToSymbol(afterWord, letter.afterWord, symbolX, symbolY);
            }
            symbolX = addDataToSymbol(symbol, letter, symbolX, symbolY);
            if (letter.startWord || letter.separateWords) {
                if (letter.breakLine === 'always' ||
                    (letter.breakLine && symbolX > maxWidth)) {
                    rows.push(row);
                    row = [];
                    symbolX = 0;
                    symbolY += lineHeight;
                }
                if (afterWord.length) {
                    word.push(afterWord);
                    afterWord = [];
                }
                row.push(word);
                word = [symbol];
                if (letter.separateWords) {
                    row.push(word);
                    word = [];
                }
            } else {
                word.push(symbol);
            }
        }
        if (word.length) {
            if (afterWord.length) {
                word.push(afterWord);
                afterWord = [];
            }
            row.push(word);
        }
        if (row.length) {
            rows.push(row);
        }

        return rows;
    }

    function drawContent(data) {
        const all = data.flat(2);
        let maxX = 0;
        let maxY = 0;
        all.forEach(a => {
            a.forEach(b => {
                b.filter((x, i) => i % 2 > 0).forEach(c => maxX = Math.max(maxX, c));
                b.filter((x, i) => i % 2 > 0 && !isNaN(x)).forEach(c => maxY = Math.max(maxY, c));
            });
        });
        setCanvasSize(canvas, maxX, maxY);

        ctx.clear();
        ctx.lineCap = 'round';
        ctx.init(settings.width, '#ddd');
        data.forEach(row => row.forEach(word => word.forEach(line => line.forEach(letter => render(letter, false)))));
        ctx.stroke();

        let i = -1;
        let symbol;
        const drawSymbol = () => {
            i += 1;
            symbol = all[i];
            if (symbol) {
                draw(symbol).then(drawSymbol);
            } else {
                stop();
            }
        }
        drawSymbol();
    }

    function getLetters(text) {
        const letters = {};
        const data = require('./assets/data/letters.json');
        for (let i = 0; i < text.length; i += 1) {
            let char = text[i];
            if (!letters[char]) {
                let letter = data[char] || letters[' '];
                letters[char] = letter;
                if (letter.ref) {
                    letters[letter.ref] = letters[letter.ref] || data[letter.ref] || letters[' '];
                }
            }
        }
        return letters;
    }

    function addDataToSymbol(symbol, source, x, y) {
        x = x || 0;
        y = y || 0;
        const scale = settings.size;
        source.data.forEach(m =>
            symbol.push(m.map((d, i) => {
                return i === 0 ? d : d * scale + (i % 2 ? x : y);
            })));
        return symbolLastPosition(symbol);
    }

    function symbolLastPosition(symbol) {
        const last = symbol[symbol.length - 1];
        return last[last.length - 2];
    }

    function draw(letter) {
        ctx.init(settings.width, settings.color);
        return new Promise(resolve => {
            let i = -1;
            const drawLine = () => {
                i += 1;
                const line = letter[i];
                if (line) {
                    render(line).then(drawLine);
                } else {
                    resolve();
                }
            }
            drawLine();
        });
    }

    init();
})();
