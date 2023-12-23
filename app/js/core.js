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
        const color = document.createElement("input");
        color.type = "color";
        const a = document.createElement("input");
        a.type = "range";
        a.min = 0;
        a.max = 255;
        a.step = 1;
        a.value = 255;
        color.addEventListener("change", () => {
            const c = color.value;
            const r = parseInt(c.substring(1, 3), 16);
            const g = parseInt(c.substring(3, 5), 16);
            const b = parseInt(c.substring(5, 7), 16);
            this.pen.r = r;
            this.pen.g = g;
            this.pen.b = b;
        });
        a.addEventListener("change", () => {
            this.pen.a = parseInt(a.value) / 255;
        });
        element.appendChild(color);
        element.appendChild(a);
    }
}

class Panel {
    constructor(w, h, p) {
        this.pen = p;
        this.width = w;
        this.height = h;
        this.cell = [];
        this.action = "none";
        this.history = [];
        const pixel = [];
        for (let i = 0; i < h; i++) {
            const row = [];
            for (let j = 0; j < w; j++) {
                row.push(new Pixel(255, 255, 255, 1));
            }
            pixel.push(row);
        }
        this.pixel = pixel;
        document.onkeydown = (e) => {
            if (e.ctrlKey && e.key.toLowerCase() == "z") {
                if (this.history.length == 0) {
                    return;
                }
                this.pixel = this.history.pop();
                this.RePaintAll();
                console.log("undo");
            }
        };
    }

    ClonePixel() {
        let pixel = [];
        for (let i = 0; i < this.height; i++) {
            const row = [];
            for (let j = 0; j < this.width; j++) {
                const a = this.pixel[i][j];
                const p = new Pixel(a.r, a.g, a.b, a.a);
                row.push(p);
            }
            pixel.push(row);
        }
        return pixel;
    }

    SpawnPaint(element) {
        const main = CreateElement("paintMain");
        main.id = "paintMain"
        main.addEventListener("mousedown", (e) => {
            if (e.button == 0) {
                this.history.push(this.ClonePixel());
                this.action = "paint";
            }
        });
        main.addEventListener("mouseup", (e) => {
            if (e.button == 0) {
                if (this.action == "paint") {
                }
                this.action = "none";
            }
        });
        this.cell = [];
        for (let i = 0; i < this.height; i++) {
            const row = CreateElement("paintRow");
            for (let j = 0; j < this.width; j++) {
                const cell = CreateElement("paintCell");
                this.cell.push(cell);
                cell.i = i;
                cell.j = j;
                cell.addEventListener("mouseenter", (e) => {
                    this.GridEnter(e, cell);
                });
                this.PaintCell(cell);
                row.appendChild(cell);
            }
            main.appendChild(row);
        }
        element.appendChild(main);
        console.log(element);
    
    }
    GridEnter(e, cell) {
        if (this.action === "paint") {
            this.pixel[cell.i][cell.j].Paint(this.pen);
            this.PaintCell(cell);
            console.log("paint");
        }
    }

    RePaintAll() {
        console.log(this.pixel);
        for (let i of this.cell) {
            this.PaintCell(i);
        }
    }

    PaintCell(cell) {
        const pixel = this.pixel[cell.i][cell.j];
        cell.style.backgroundColor = `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a})`;
    }
}

class Pixel {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    Paint(pen) {
        this.r = pen.r;
        this.g = pen.g;
        this.b = pen.b;
        this.a = pen.a;
    }
}

class Pen {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}
