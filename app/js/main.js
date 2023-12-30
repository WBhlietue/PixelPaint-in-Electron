const require = window.parent.require;
const fs = require("fs");
const PNG = require("pngjs").PNG;
const paintWindowConfig = {
    width: 16,
    height: 16,
    scale: 5,
    scaleInit: 1,
    left: 0,
    top: 0,
    penWidth: 1,
};
const pen = new Pen("#000000", 255);
const color = new ColorPanel(pen);
const panel = new Panel(paintWindowConfig, pen);
panel.SpawnPaint(document.getElementById("paint"));
color.Spawn();
document.addEventListener("mousedown", function (event) {
    if (event.button === 1) {
        event.preventDefault();
    }
});

const paintWindow = document.getElementById("paintMain");
document.getElementById("btnTest").addEventListener("click", () => {
    ExportPNG();
});
InitPanelEvent();
PaintWindowSet();

function InitPanelEvent() {
    const main = document.getElementById("paint");
    let isEnter = false;
    main.addEventListener("wheel", Scroll);
    main.addEventListener("mousedown", MoveBegin);
    main.addEventListener("mouseup", MoveEnd);
    main.addEventListener("mouseout", (e) => {
        if (e.target === main) {
            isEnter = false;
        }
    });
    paintWindowConfig.scale = main.offsetWidth / paintWindow.offsetWidth;
    paintWindowConfig.scaleInit = main.offsetWidth / paintWindow.offsetWidth;
    main.addEventListener("mousemove", Move);

    function MoveBegin(e) {
        if (e.button == 1) {
            isEnter = true;
        }
    }
    function Move(e) {
        if (isEnter) {
            paintWindowConfig.left += e.movementX;
            paintWindowConfig.top += e.movementY;
            PaintWindowSet();
        }
    }
    function MoveEnd(e) {
        if (e.button == 1) {
            isEnter = false;
        }
    }

    function Scroll(e) {
        if (e.ctrlKey) {
            if (e.deltaY > 0) {
                paintWindowConfig.scale -= 0.1 * paintWindowConfig.scaleInit;
            } else {
                paintWindowConfig.scale += 0.1 * paintWindowConfig.scaleInit;
            }
            PaintWindowSet();
        }
    }
    PaintWindowSet();
    const size = parseInt(paintWindow.offsetHeight / paintWindowConfig.height);
    paintWindow.style.backgroundSize = size + "px " + size + "px";
}

function PaintWindowSet() {
    paintWindow.style.left = `calc(50% + ${paintWindowConfig.left}px)`;
    paintWindow.style.top = `calc(50% + ${paintWindowConfig.top}px)`;
    paintWindow.style.transform = `translate(-50%, -50%) scale(${paintWindowConfig.scale})`;
}

function ExportPNG() {
    const width = paintWindowConfig.width;
    const height = paintWindowConfig.height;
    const png = new PNG({ width, height });
    const canvas = document.getElementById("paintMain");
    const context = canvas.getContext("2d");

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const data = context.getImageData(x, y, 1, 1).data;
            const idx = (width * y + x) << 2;
            png.data[idx] = data[0]; // R
            console.log(data[0], data[1], data[2], data[3]);
            png.data[idx + 1] = data[1]; // G
            png.data[idx + 2] = data[2]; // B
            png.data[idx + 3] = data[3]; // A
        }
    }
    console.log(png);
    console.log("export");
    png.pack().pipe(fs.createWriteStream("output.png"));
}
