class Media {

  constructor(file) {

    this.file = file;
    [this.type] = file.type.split("/");
    this.id = file.id;
    this.mimetype = file.type;

  }

  loadFile() {

    if (this.type === "image") {

      const size = this.file.sizes.find(size => size.key === "carousel-media") || this.file;

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

    } else {

      this.src = "/uploads/"+this.file.filename;
      this.width = this.file.width;
      this.height = this.file.height;

    }

  }

  write(canvas, image, zoom, zoomX, zoomY, maxZoom) {

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;

    const fWidth = image.width;
    const fHeight = image.height;
    const cWidth = canvas.width;
    const cHeight = canvas.height;

    const portrait = fWidth/fHeight < cWidth/cHeight;

    let sWidth;
    let sHeight;

    if (portrait) {

      sHeight = fHeight;
      sWidth = sHeight*cWidth/cHeight;

    } else {

      sWidth = fWidth;
      sHeight = sWidth*cHeight/cWidth;

    }

    const fRect = {
      x: (sWidth - fWidth)/2,
      y: (sHeight - fHeight)/2,
      width: fWidth,
      height: fHeight
    };

    const zRect = {
      x: (sWidth - sWidth/zoom)*zoomX,
      y: (sHeight - sHeight/zoom)*zoomY,
      width: sWidth/zoom,
      height: sHeight/zoom
    };

    const uRect = {
      x: Math.max(fRect.x, zRect.x),
      y: Math.max(fRect.y, zRect.y),
      width: Math.min(fRect.x + fRect.width, zRect.x + zRect.width) - Math.max(fRect.x, zRect.x),
      height: Math.min(fRect.y + fRect.height, zRect.y + zRect.height) - Math.max(fRect.y, zRect.y)
    }

    if (uRect.width > 0 && uRect.height > 0) {

      const fsRect = {
        x: uRect.x - fRect.x,
        y: uRect.y - fRect.y,
        width: uRect.width,
        height: uRect.height
      }

      const dRect = {
        x: (uRect.x - zRect.x)*(cWidth/zRect.width),
        y: (uRect.y - zRect.y)*(cHeight/zRect.height),
        width: uRect.width*(cWidth/zRect.width),
        height: uRect.height*(cHeight/zRect.height)
      }

      ctx.clearRect(0, 0, cWidth, cHeight);
      ctx.drawImage(
        image,
        Math.round(fsRect.x),
        Math.round(fsRect.y),
        Math.round(fsRect.width),
        Math.round(fsRect.height),
        Math.round(dRect.x),
        Math.round(dRect.y),
        Math.round(dRect.width),
        Math.round(dRect.height)
      );

    }

  }

}
