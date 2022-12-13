class Tile {

  static margin = 4;
  static speed = 0.01;
  static numRow = 10;
  static offsetWidth = 4;

  constructor(file) {

    this.file = file;
    [this.type] = file.type.split("/");
    this.id = file.id;
    this.mimetype = file.type;

  }

  loadFile() {

    if (this.type === "image") {

      const size = this.file.sizes.find(size => size.key === "wall-tile") || this.file;

      this.src = "/uploads/"+size.filename;
      this.width = size.width;
      this.height = size.height;

      return new Promise(resolve => {
        this.image = new Image(this.width, this.height);
        this.image.src = this.src;
        this.image.onload = event => {
          resolve();
        };
      });

    }

  }

  createCanvas(width, height) {
    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.image, 0, 0, width, height);

    const gradientW = 2;

    const gradient = ctx.createLinearGradient(0, 0, gradientW, 0);
    gradient.addColorStop(0, "black");
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, gradientW, height);

    const rightG = ctx.createLinearGradient(width-gradientW, 0, width, 0);
    rightG.addColorStop(0, "transparent");
    rightG.addColorStop(1, "black");
    ctx.fillStyle = rightG;
    ctx.fillRect(width-gradientW, 0, gradientW, height);

    const topG = ctx.createLinearGradient(0, 0, 0, gradientW);
    topG.addColorStop(0, "black");
    topG.addColorStop(1, "transparent");
    ctx.fillStyle = topG;
    ctx.fillRect(0, 0, width, gradientW);

    const bottomG = ctx.createLinearGradient(0, height-gradientW, 0, height);
    bottomG.addColorStop(0, "transparent");
    bottomG.addColorStop(1, "black");
    ctx.fillStyle = bottomG;
    ctx.fillRect(0, height-gradientW, width, gradientW);

    return canvas;
  }


  static createItems(tiles) {

    this.items = [];

    let x = 0;
    let y = this.margin;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const totalHeight = screenHeight-this.margin;


    let shuffleArray = this.shuffleArray(tiles);
    let imageIndex = 0;

    for (let i = 0; i < this.numRow; i++) {

      x = 0;

      const row = {};

      row.index = i;
      row.width = 0;
      row.height = ((totalHeight-y)/(this.numRow-i))*(1 + (Math.random()-0.5)*0.5*((this.numRow-i-1)/this.numRow));
      row.imageHeight = row.height - this.margin*2;
      row.speed = this.speed*row.height;
      row.y = y + this.margin;
      row.offsetWidth = this.offsetWidth*row.height;

      const offset = Math.floor(Math.random()*tiles.length);

      while (x < screenWidth + row.offsetWidth) {

        const tile = shuffleArray[imageIndex];
        imageIndex++;
        if (imageIndex >= tiles.length) {
          shuffleArray = this.shuffleArray(shuffleArray);
          imageIndex = 0;
        }

        const imageWidth = (row.imageHeight/tile.height)*tile.width;
        const width = imageWidth+this.margin*2;

        const item = {
          image: tile,
          tile: tile,
          width: width,
          imageWidth: imageWidth,
          x: x + this.margin,
          row: row,
          canvas: tile.createCanvas(width, row.imageHeight)
        };
        this.items.push(item);

        x += width;
        row.width += width;

      }

      y += row.height;

    }

    this.items.sort((a, b) => {
      if (Math.abs(a.row.index - this.numRow/2) < Math.abs(b.row.index - this.numRow/2)) return -1;
      else if (Math.abs(a.row.index - this.numRow/2) > Math.abs(b.row.index - this.numRow/2)) return 1;
      else return 0;
    });

    return this.items;

  }


  static shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }




}
