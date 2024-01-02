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
    const alphaNum = document.getElementById("colorAlphaNum");
    alphaNum.value = parseInt(a.value);
    alphaNum.type = "number";
    alphaNum.oninput = () => {
      let num = alphaNum.value;
      if (num > 255) {
        num = 255;
      } else if (num < 0) {
        num = 0;
      }
      num = parseInt(num);
      a.value = num;
      alphaNum.value = num;
    };
    color.addEventListener("change", () => {
      const c = color.value;
      this.pen.hex = c;
    });
    color.addEventListener("input", () => {
      const c = color.value;
      document.getElementById("colorHex").value = c;
      this.pen.hex = c;
    });
    a.addEventListener("input", () => {
      this.pen.a = parseInt(a.value) / 255;
      alphaNum.value = parseInt(a.value);
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
    this.SelectTools();
    document.onkeydown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() == "z") {
        this.Undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() == "s") {
        SaveFile();
      }
    };
  }
  Undo() {
    if (this.history.length == 0) {
      return;
    }
    if (this.config.isSave) {
      this.config.isSave = false;
      document.title += "*";
    }
    const history = this.history.pop();
    const backColor = this.ctx.fillStyle;
    const backAlpha = this.ctx.globalAlpha;
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        const s = history[y][x];
        const color = ConvertHex(s);
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

  Paint(x, y, width) {
    switch (this.pen.type) {
      case PenType.Eraser:
        this.ctx.clearRect(x, y, width, width);
        break;
      case PenType.Pencil:
        this.ctx.clearRect(x, y, width, width);
        this.ctx.fillRect(x, y, width, width);
        break;
      case PenType.Fill:
        let pixel = this.ctx.getImageData(x, y, 1, 1).data;
        const hex = ConvertHex(pixel);
        if (this.pen.hex == hex && this.pen.a == p[3] / 255) {
          return;
        }
        this.CheckPixel(x, y, pixel);
        break;
      case PenType.Picker:
        let color = this.ctx.getImageData(x, y, 1, 1).data;
        let h = ConvertHex(color);
        this.pen.hex = h;
        this.pen.a = color[3] / 255;
        document.getElementById("colorPanel").value = h;
        document.getElementById("colorHex").value = h;
        document.getElementById("colorAlpha").value = parseInt(
          this.pen.a * 255
        );
        document.getElementById("colorAlphaNum").value = parseInt(
          this.pen.a * 255
        );
        break;
      case PenType.Light:
        let c = this.ctx.getImageData(x, y, 1, 1).data;
        let r = Math.random() * 0.1 + 1;
        c[0] += 10;
        c[1] += 10;
        c[2] += 10;
        c[0] *= r;
        c[1] *= r;
        c[2] *= r;
        let h1 = ConvertHex(c);
        this.ctx.fillStyle = h1;
        this.ctx.globalAlpha = c[3] / 255;
        this.ctx.clearRect(x, y, 1, 1);
        this.ctx.fillRect(x, y, 1, 1);
        break;
      case PenType.Alpha:
        let ca = this.ctx.getImageData(x, y, 1, 1).data;
        let ra = 1 - Math.random() * 0.1;
        ca[3] *= ra;
        let he = ConvertHex(ca);
        this.ctx.fillStyle = he;
        this.ctx.globalAlpha = ca[3] / 255;
        this.ctx.clearRect(x, y, 1, 1);
        this.ctx.fillRect(x, y, 1, 1);
        break;
    }
  }
  CheckPixel(x, y, pixel) {
    if (x < 0 || y < 0 || x >= this.config.width || y >= this.config.height) {
      return;
    }
    const p = this.ctx.getImageData(x, y, 1, 1).data;
    if (this.ComparePixel(pixel, p)) {
      this.ctx.clearRect(x, y, 1, 1);
      this.ctx.fillRect(x, y, 1, 1);
      this.CheckPixel(x + 1, y, pixel);
      this.CheckPixel(x - 1, y, pixel);
      this.CheckPixel(x, y - 1, pixel);
      this.CheckPixel(x, y + 1, pixel);
    }
  }
  ComparePixel(p1, p2) {
    if (p1[0] != p2[0]) {
      return false;
    }
    if (p1[1] != p2[1]) {
      return false;
    }
    if (p1[2] != p2[2]) {
      return false;
    }
    if (p1[3] != p2[3]) {
      return false;
    }
    return true;
  }

  SpawnPaint(element) {
    const main = document.createElement("canvas");
    main.id = "paintMain";
    main.style.width = this.config.width + "px";
    main.style.height = this.config.height + "px";
    main.width = this.config.width;
    main.height = this.config.height;
    console.log(main.width, main.height);
    element.appendChild(main);
    this.ctx = main.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    main.addEventListener("mousedown", (e) => {
      if (e.button == 0) {
        this.action = "paint";
        this.ctx.globalAlpha = this.pen.a;
        this.ctx.fillStyle = this.pen.hex;
        if (this.config.isSave) {
          this.config.isSave = false;
          document.title += "*";
        }
        const history = [];
        const imageData = this.ctx.getImageData(
          0,
          0,
          this.config.width,
          this.config.height
        );
        const data = imageData.data;
        const pixelSize = 4; 
        const newImageData = [];

        for (let y = 0; y < this.config.height; y++) {
          const row = [];
          for (let x = 0; x < this.config.width; x++) {
            const index = (y * this.config.width + x) * pixelSize;
            const pixel = [
              data[index],
              data[index + 1],
              data[index + 2],
              data[index + 3],
            ];
            row.push(pixel);
          }
          newImageData.push(row);
        }
        this.history.push(newImageData)

        // for (let y = 0; y < this.config.height; y++) {
        //   const tmp = [];
        //   for (let x = 0; x < this.config.width; x++) {
        //     // const data = this.ctx.getImageData(x, y, 1, 1).data;
        //     tmp.push(data[i], data[i + 1], data[i + 2], data[i + 3]);
        //   }
        //   history.push(tmp);
        // }
        // this.history.push(history);
        let x = parseInt(
          (e.clientX - main.offsetLeft) / this.config.scale + main.width / 2
        );
        let y = parseInt(
          (e.clientY - main.offsetTop) / this.config.scale + main.height / 2
        );
        this.Paint(x, y, this.config.penWidth);
      }
    });
    main.addEventListener("mouseup", (e) => {
      if (e.button == 0) {
        if (this.action == "paint") {
        }
        this.action = "none";
      }
    });
    main.addEventListener("mouseout", (e) => {
      this.action = "none";
    });
    main.addEventListener("mousemove", (e) => {
      if (this.action == "paint") {
        let x = parseInt(
          (e.clientX - main.offsetLeft) / this.config.scale + main.width / 2
        );
        let y = parseInt(
          (e.clientY - main.offsetTop) / this.config.scale + main.height / 2
        );
        this.Paint(x, y, this.config.penWidth);
      }
    });
  }
  SelectTools() {
    const tools = [];
    GetTools("tools-pencil", () => {
      this.pen.type = PenType.Pencil;
    });
    GetTools("tools-eraser", () => {
      this.pen.type = PenType.Eraser;
    });
    GetTools("tools-fill", () => {
      this.pen.type = PenType.Fill;
    });
    GetTools("tools-picker", () => {
      this.pen.type = PenType.Picker;
    });
    GetTools("tools-light", () => {
      this.pen.type = PenType.Light;
    });
    GetTools("tools-alpha", () => {
      this.pen.type = PenType.Alpha;
    });
    function GetTools(id, click) {
      const t = document.getElementById(id);
      tools.push(t);
      t.onclick = () => {
        tools.map((i) => {
          i.className = "";
        });
        t.className = "select";
        click();
      };
    }
  }
}

class Pen {
  constructor(hex, a) {
    this.type = PenType.Pencil;
    this.hex = hex;
    this.a = a;
  }
}

const PenType = {
  Pencil: 0,
  Eraser: 1,
  Fill: 2,
  Picker: 3,
  Light: 4,
  Alpha: 5,
};

function ConvertHex(pixel) {
  const r = pixel[0].toString(16);
  const g = pixel[1].toString(16);
  const b = pixel[2].toString(16);
  return (
    "#" +
    (r.length == 1 ? "0" : "") +
    r +
    (g.length == 1 ? "0" : "") +
    g +
    (b.length == 1 ? "0" : "") +
    b
  );
}
