function CreateElement(className) {
    const elem = document.createElement("div");
    elem.className = className;
    return elem;
}

class ColorPanel {
    constructor(pen) {
        this.pen = pen;
    }
    Spawn(element) {
        const color = document.getElementById("colorPanel");
        color.type = "color";
        const a = document.getElementById("colorAlpha");
        a.type = "range";
        a.min = 0;
        a.max = 255;
        a.step = 1;
        a.value = 255;
        color.addEventListener("change", () => {
            const c = color.value;
            this.pen.hex = c;
        });
        color.addEventListener("input", () => {
            const c = color.value;
            this.pen.hex = c;
        });
        a.addEventListener("change", () => {
            this.pen.a = parseInt(a.value) / 255;
        });
    }
}

class Panel {
    constructor(config, p) {
        this.pen = p;
        this.config = config;
        this.width = config.width;
        this.height = config.height;
        this.cell = [];
        this.action = "none";
        this.history = [];
        this.ctx = null;
        document.onkeydown = (e) => {
            if (e.ctrlKey && e.key.toLowerCase() == "z") {
                if (this.history.length == 0) {
                    return;
                }
                const history = this.history.pop();
                const backColor = this.ctx.fillStyle;
                const backAlpha = this.ctx.globalAlpha;
                for (let y = 0; y < this.config.height; y++) {
                    for (let x = 0; x < this.config.width; x++) {
                        const s = history[y][x];
                        const color =
                            "#" +
                            s[0].toString(16) +
                            s[1].toString(16) +
                            s[2].toString(16);
                        const a = s[3] / 255;
                        this.ctx.fillStyle = color;
                        this.ctx.globalAlpha = a;
                        this.ctx.clearRect(x, y, 1, 1);
                        this.ctx.fillRect(x, y, 1, 1);
                    }
                }
                this.ctx.fillStyle = backColor;
                this.ctx.globalAlpha = backAlpha;
            }
        };
    }

    SpawnPaint(element) {
        const main = document.createElement("canvas");
        main.id = "paintMain";
        main.style.width = this.config.width + "px";
        main.style.height = this.config.height + "px";
        main.width = this.config.width;
        main.height = this.config.height;
        element.appendChild(main);
        this.ctx = main.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
        main.addEventListener("mousedown", (e) => {
            if (e.button == 0) {
                this.action = "paint";
                this.ctx.globalAlpha = this.pen.a;
                this.ctx.fillStyle = this.pen.hex;
                const history = [];
                for (let y = 0; y < this.config.height; y++) {
                    const tmp = [];
                    for (let x = 0; x < this.config.width; x++) {
                        const data = this.ctx.getImageData(x, y, 1, 1).data;
                        tmp.push(data);
                    }
                    history.push(tmp);
                }
                this.history.push(history);
                let x = parseInt(
                    (e.clientX - main.offsetLeft) / this.config.scale +
                        main.width / 2
                );
                let y = parseInt(
                    (e.clientY - main.offsetTop) / this.config.scale +
                        main.height / 2
                );
                this.ctx.clearRect(
                    x,
                    y,
                    this.config.penWidth,
                    this.config.penWidth
                );
                this.ctx.fillRect(
                    x,
                    y,
                    this.config.penWidth,
                    this.config.penWidth
                );
            }
        });
        main.addEventListener("mouseup", (e) => {
            if (e.button == 0) {
                if (this.action == "paint") {
                }
                this.action = "none";
            }
        });
        main.addEventListener("mousemove", (e) => {
            if (this.action == "paint") {
                let x = parseInt(
                    (e.clientX - main.offsetLeft) / this.config.scale +
                        main.width / 2
                );
                let y = parseInt(
                    (e.clientY - main.offsetTop) / this.config.scale +
                        main.height / 2
                );
                this.ctx.clearRect(
                    x,
                    y,
                    this.config.penWidth,
                    this.config.penWidth
                );
                this.ctx.fillRect(
                    x,
                    y,
                    this.config.penWidth,
                    this.config.penWidth
                );
            }
        });
    }
}

class Pen {
    constructor(hex, a) {
        this.hex = hex;
        this.a = a;
    }
}
