const require = window.parent.require;
const fs = require("fs");
const PNG = require("pngjs").PNG;
const { ipcRenderer } = require("electron");

const paintWindowConfig = {
  width: 16,
  height: 16,
  scale: 5,
  scaleInit: 1,
  left: 0,
  top: 0,
  penWidth: 1,
  isOpen: false,
  openPath: "",
  isSave: true,
};
const pen = new Pen("#000000", 255);
const color = new ColorPanel(pen);

color.Spawn();
document.addEventListener("mousedown", function (event) {
  if (event.button === 1) {
    event.preventDefault();
  }
});

document.getElementById("btnExport").addEventListener("click", () => {
  ExportPNG();
});
document.getElementById("btnSave").addEventListener("click", () => {
  SaveFile();
});
document.getElementById("btnOpen").addEventListener("click", () => {
  OpenFile();
});
document.getElementById("btnOpenPng").addEventListener("click", () => {
  OpenPng();
});
document.getElementById("bntCreate").onclick = () => {
  CreatePage();
};
document.getElementById("sizeX").value = paintWindowConfig.width;
document.getElementById("sizeY").value = paintWindowConfig.height;
document.getElementById("sizeX").oninput = () => {
  paintWindowConfig.width = document.getElementById("sizeX").value;
};
document.getElementById("sizeY").oninput = () => {
  paintWindowConfig.width = document.getElementById("sizeY").value;
};
document.getElementById("colorHex").oninput = () => {
  const result = /^#[0-9A-F]{6}$/i.test(
    document.getElementById("colorHex").value
  );
  if (result) {
    document.getElementById("colorPanel").value =
      document.getElementById("colorHex").value;
  }
};
document.getElementById("colorHex").value = "#000000";

CreatePage();

function CreatePage() {
  document.getElementById("paint").innerHTML = "";
  const panel = new Panel(paintWindowConfig, pen);
  panel.SpawnPaint(document.getElementById("paint"));
  const paintWindow = document.getElementById("paintMain");
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
  return panel;
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
      png.data[idx + 1] = data[1]; // G
      png.data[idx + 2] = data[2]; // B
      png.data[idx + 3] = data[3]; // A
    }
  }
  ipcRenderer.send("save-file");
  ipcRenderer.once("save-file-res", (event, filePath) => {
    png.pack().pipe(fs.createWriteStream(filePath));
  });
}

function SaveFile() {
  const width = paintWindowConfig.width;
  const height = paintWindowConfig.height;
  const data = {
    pageNum: 1,
    width: width,
    height: height,
    data: [],
  };
  const canvas = document.getElementById("paintMain");
  const context = canvas.getContext("2d");
  const page = [];
  for (let x = 0; x < width; x++) {
    const row = [];
    for (let y = 0; y < height; y++) {
      const data = context.getImageData(x, y, 1, 1).data;
      const pixel = [data[0], data[1], data[2], data[3]];
      row.push(pixel);
    }
    page.push(row);
  }
  data.data.push(page);
  if (paintWindowConfig.isOpen) {
    paintWindowConfig.isSave = true;
    document.title = paintWindowConfig.openPath;
    fs.writeFile(
      paintWindowConfig.openPath,
      JSON.stringify(data),
      "utf8",
      (err) => {
        if (err) {
          return;
        }
      }
    );
  } else {
    ipcRenderer.send("save-document");
    ipcRenderer.once("save-document-res", (event, filePath) => {
      document.title = filePath;
      paintWindowConfig.isOpen = true;
      paintWindowConfig.openPath = filePath;
      paintWindowConfig.isSave = true;
      fs.writeFile(filePath, JSON.stringify(data), "utf8", (err) => {
        if (err) {
          return;
        }
      });
    });
  }
}

function OpenFile() {
  const input = document.getElementById("inputFile");
  input.click();
  input.onchange = (e) => {
    paintWindowConfig.isOpen = true;
    paintWindowConfig.openPath = e.target.files[0].path;
    document.title = e.target.files[0].path;
    fs.readFile(e.target.files[0].path, "utf8", (err, data) => {
      if (err) {
        return;
      }
      const d = JSON.parse(data);
      paintWindowConfig.width = d.width;
      paintWindowConfig.height = d.height;
      const panel = CreatePage();
      const ctx = panel.ctx;
      for (let x = 0; x < d.width; x++) {
        for (let y = 0; y < d.height; y++) {
          const hex = ConvertHex(d.data[0][x][y]);
          const a = d.data[0][x][y][3] / 255;
          ctx.fillStyle = hex;
          ctx.globalAlpha = a;
          ctx.clearRect(x, y, 1, 1);
          ctx.fillRect(x, y, 1, 1);
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000000";
    });
  };
}

function OpenPng() {
  const input = document.getElementById("inputFilePng");
  input.click();
  input.onchange = (e) => {
    paintWindowConfig.isOpen = true;
    paintWindowConfig.openPath = e.target.files[0].path;
    document.title = e.target.files[0].path;

    fs.createReadStream(e.target.files[0].path)
      .pipe(new PNG())
      .on("parsed", function () {
        const panel = CreatePage();
        const ctx = panel.ctx;
        for (let x = 0; x < this.width; x++) {
          for (let y = 0; y < this.height; y++) {
            const idx = (this.width * y + x) << 2;
            const pixel = [
              this.data[idx],
              this.data[idx + 1],
              this.data[idx + 2],
              this.data[idx + 3],
            ];
            const hex = ConvertHex(pixel);
            const a = pixel[3] / 255;
            ctx.fillStyle = hex;
            ctx.globalAlpha = a;
            ctx.clearRect(x, y, 1, 1);
            ctx.fillRect(x, y, 1, 1);
          }
        }
      })
      .on("error", function (err) {});

    // fs.readFile(e.target.files[0].path, "utf8", (err, data) => {
    //   if (err) {
    //     return;
    //   }
    //   const d = JSON.parse(data);
    //   paintWindowConfig.width = d.width;
    //   paintWindowConfig.height = d.height;
    //   const panel = CreatePage();
    //   const ctx = panel.ctx;
    //   for (let x = 0; x < d.width; x++) {
    //     for (let y = 0; y < d.height; y++) {
    //       const hex = ConvertHex(d.data[0][x][y]);
    //       const a = d.data[0][x][y][3] / 255;
    //       ctx.fillStyle = hex;
    //       ctx.globalAlpha = a;
    //       ctx.clearRect(x, y, 1, 1);
    //       ctx.fillRect(x, y, 1, 1);
    //     }
    //   }
    //   ctx.globalAlpha = 1;
    //   ctx.fillStyle = "#000000";
    // });
  };
}
