class Media {

  constructor(file) {

    this.file = file;
    [this.type] = file.type.split("/");
    this.id = file.id;
    this.mimetype = file.type;

    this.trash = true;
    this.zoom = 1;
    this.zoomX = 0.5;
    this.zoomY = 0.5;

  }

  loadFile() {

    if (this.type === "image") {

      const size = this.file.sizes.find(size => size.key === "wall-media") || this.file;

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

      sHeight = fHeight/0.9;
      sWidth = sHeight*cWidth/cHeight;

    } else {

      sWidth = fWidth/0.9;
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

    ctx.clearRect(0, 0, cWidth, cHeight);


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



//
//
// class Media {
//
//   constructor() {
//
//     const [mediaType] = file.type.split("/");
//
//     this.src = "/uploads/"+file.filename;
//     this.type = mediaType;
//     this.width = file.width,
//     this.height = file.height,
//     this.id = file.id,
//     this.trash = true;
//
//   }
//
//   loadFile() {
//
//     if (mediaType === "image") {
//
//       return new Promise(resolve => {
//         this.image = new Image(file.width, file.height);
//         this.image.src = src;
//         this.image.onload = event => {
//           resolve(this.image);
//         };
//       });
//
//     }
//
//   }
//
//   write(canvas) {
//
//     const ctx = canvas.getContext("2d");
//
//     const portrait = this.image.width/this.image.height < canvas.width/canvas.height;
//
//     let width;
//     let height;
//
//     if (portrait) {
//       height = canvas.height*0.9;
//       width = height*this.image.width/this.image.height;
//     } else {
//       width = canvas.width*0.9;
//       height = width*this.image.height/this.image.width;
//     }
//
//     ctx.drawImage(this.image, (canvas.width-width)/2, (canvas.height-height)/2, width, height);
//
//     return canvas;
//   }
//
//
//
// }
