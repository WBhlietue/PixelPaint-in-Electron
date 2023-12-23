const require = window.parent.require;
const fs = require("fs");

const pen = new Pen(0, 0, 0, 1);
const color = new ColorPanel(pen);
const panel = new Panel(64, 64, pen);
panel.SpawnPaint(document.getElementById("paint"));
const controlPanel = document.getElementById("controls");
const colorPanel = document.createElement("div");
colorPanel.id = "color";
color.Spawn(colorPanel);
controlPanel.appendChild(colorPanel);
document.addEventListener("mousedown", function (event) {
    if (event.button === 1) {
        event.preventDefault();
    }
});

const paintWindowConfig = {
    scale: 1,
    left: 0,
    top: 0,
};
const paintWindow = document.getElementById("paintMain");
InitPanelEvent();
PaintWindowSet();

function InitPanelEvent() {
    const main = document.getElementById("paint");
    let isEnter = false;
    main.addEventListener("wheel", Scroll);
    main.addEventListener("mousedown", MoveBegin);
    main.addEventListener("mouseup", MoveEnd);
    main.addEventListener("mouseout", ()=>{
        console.log("Asd");
    })
    main.addEventListener("mousemove", Move);
    
    function MoveBegin(e){
        if(e.button == 1){
            isEnter = true
        }
    }
    function Move(e){
        if(isEnter){
            paintWindowConfig.left += e.movementX
            paintWindowConfig.top += e.movementY
            PaintWindowSet()
        }
    }
    function MoveEnd(e){
        if(e.button == 1){
            isEnter = false;
        }
    }

    function Scroll(e) {
        if (e.ctrlKey) {
            if (e.deltaY > 0) {
                if (paintWindowConfig.scale > 0.1) {
                    paintWindowConfig.scale -= 0.1;
                }
            } else {
                if (paintWindowConfig.scale < 5) {
                    paintWindowConfig.scale += 0.1;
                }
            }
            PaintWindowSet();
        }
        console.log(e);
    }
}

function PaintWindowSet() {
    paintWindow.style.left = `calc(50% + ${paintWindowConfig.left}px)`;
    paintWindow.style.top = `calc(50% + ${paintWindowConfig.top}px)`;
    paintWindow.style.transform = `translate(-50%, -50%) scale(${paintWindowConfig.scale})`;
}
