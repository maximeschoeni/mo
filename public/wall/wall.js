class Wall {

  constructor() {

    this.screenId = location.hash.slice(1) || "1";

    this.popups = {};

    this.eye = {
      state: 0,
      originX: 0,
      originY: 0,
      destX: 0.5,
      destY: 0.5,
      next: 0
    };

  }

  loadImage(filename) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = event => {
        resolve(image);
      }
      image.src = filename;
    });
  }


  async getMedias() {

    const files = await fetch("/query/files?parent=4").then(response => response.json());
    const medias = [];

    for (let file of files) {

      const medium = file.sizes && file.sizes.find(size => size.key === "medium") || file;
      const src = "/uploads/"+medium.filename;
      const [mediaType] = file.type.split("/");

      medias.push({
        src: src,
        width: file.width,
        height: file.height,
        id: file.id,
        type: mediaType
      });

    }

    return medias;

  }

  async getThumbs() {

    const files = await fetch("/query/files?parent=2").then(response => response.json());

    const thumbs = [];

    for (let file of files) {

      const tile = file.sizes.find(size => size.key === "tile");
      const src = "/uploads/"+tile.filename;
      const image = await this.loadImage(src);

      thumbs.push({
        image: image,
        small: src,
        width: image.width,
        height: 100
      });

    }

    return thumbs;

    // const filenames = Database.thumbs;
    // const thumbs = [];
    //
    // for (let filename of filenames) {
    //
    //   const src = "thumbs/small/"+filename;
    //   const image = await this.loadImage(src);
    //
    //   thumbs.push({
    //     small: src,
    //     width: image.width,
    //     height: image.height
    //   });
    //
    // }
    //
    // return thumbs;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  createItems(medias) {




    const items = [];

    const margin = 4;

    let x = 0;
    let y = margin;
    let speed = 0.02;

    let numRow = 10;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const totalHeight = screenHeight-margin;
    const offsetWidth = 4;

    // this.eye = {x: screenWidth/4, y: screenHeight/4};

    // let imageIndex = Math.floor(Math.random()*medias.length);

    let shuffleArray = this.shuffleArray(medias);
    let imageIndex = 0;

    for (let i = 0; i < numRow; i++) {

      x = 0;

      const row = {};

      row.index = i;
      row.width = 0;
      row.height = ((totalHeight-y)/(numRow-i))*(1 + (Math.random()-0.5)*0.5*((numRow-i-1)/numRow));
      row.imageHeight = row.height - margin*2;
      row.speed = speed*row.height;
      row.y = y + margin;
      row.offsetWidth = offsetWidth*row.height;


      const offset = Math.floor(Math.random()*medias.length);

      while (x < screenWidth + row.offsetWidth) {

        // for (let k = 0; k < this.medias.length; k++) {

          // const image = medias[(offset+k)%medias.length].smallImage;
          // const image = medias[Math.floor(Math.random()*medias.length)];
          const image = shuffleArray[imageIndex];
          imageIndex++;
          if (imageIndex >= medias.length) {
            shuffleArray = this.shuffleArray(shuffleArray);
            imageIndex = 0;
          }

          const imageWidth = (row.imageHeight/image.height)*image.width;
          const width = imageWidth+margin*2;

          const item = {
            image: image,
            width: width,
            imageWidth: imageWidth,
            x: x + margin,
            row: row
          };
          items.push(item);

          x += width;
          row.width += width;

        // }

      }

      y += row.height;

    }

    items.sort((a, b) => {
      if (Math.abs(a.row.index - numRow/2) < Math.abs(b.row.index - numRow/2)) return -1;
      else if (Math.abs(a.row.index - numRow/2) > Math.abs(b.row.index - numRow/2)) return 1;
      else return 0;
    });

    return items;
  }

  updateItem(item) {

    item.x = item.x - item.row.speed;

    if (item.x + item.row.offsetWidth < 0) {
      item.x += item.row.width;
      item.currentX = item.x;
    }

    if (item.currentX === undefined) {
      item.currentX = item.x;
    }
    if (item.currentY === undefined) {
      item.currentY = item.row.y;
    }
    if (item.opacity === undefined) {
      item.opacity = 1;
    }
    if (item.z === undefined) {
      item.z = 10000;
    }

    const transition = 8;
    const force = 8*window.innerHeight;

    let gX = (item.x-item.currentX)/transition;
    let gY = (item.row.y-item.currentY)/transition;
    let gOpacity = (1-item.opacity)/transition;
    // let gZ = Math.floor((1000-item.z)/transition);

    item.currentX += gX;
    item.currentY += gY;
    item.opacity += gOpacity;
    // item.z += gZ;

    // let size = 1;
    let opacity = 1;
    // let z = 1000;
    // let blur = 0;

    if (this.eye) {
      const state = this.eye.state || 0;

      const cx = (item.currentX + item.imageWidth)/2;
      const cy = (item.currentY + item.row.imageHeight)/2;

      const ex = this.eye.originX + state*(this.eye.destX-this.eye.originX);
      const ey = this.eye.originY + state*(this.eye.destY-this.eye.originY);

      const diffX = cx - window.innerWidth*(ex*0.5 + 0.02);
      const diffY = cy - window.innerHeight*(ey*0.5 + 0.03);
      // let dist = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
      let dist2 = Math.pow(diffX, 2) + Math.pow(diffY, 2);

      item.currentY += state*force*diffY/dist2;
      item.opacity = Math.max(0, item.opacity - state*0.4*force/dist2);
      // item.z += state*dist2/10;

    }

  }



  // pop(msg) {
  //   if (msg.screenId === this.screenId) {
  //     this.popupId = msg.mediaId;
  //     this.popupData = msg;
  //     console.log(msg);
  //     if (this.popupId) {
  //       this.eye = {x: window.innerWidth*0.27, y: window.innerHeight*0.28};
  //     } else {
  //       this.eye = null;
  //     }
  //     this.renderPopups();
  //   }
  // }

  // pop(msg) {
  //   if (msg.screenId === this.screenId) {
  //     // if (msg.mediaId && msg.mediaId !== this.popupId) {
  //     if (msg.mediaId) {
  //       this.popupId = msg.mediaId;
  //       this.popupData = msg;
  //       this.eye = {x: window.innerWidth*0.27, y: window.innerHeight*0.28};
  //     } else {
  //       this.eye = null;
  //       this.popupId = null;
  //       this.popupData = {};
  //     }
  //     this.renderPopups();
  //   }
  // }

  pop(msg) {
    if (msg.screenId === this.screenId) {
      // if (msg.mediaId && msg.mediaId !== this.popupId) {
      if (msg.mediaId) {
        // const origin = {
        //   x: Math.random(),
        //   y: Math.random()
        // };
        this.eye = {
          state: this.eye.state || 0,
          // originX: Math.random(),
          // originY: Math.random(),
          originX: 0.5,
          originY: 2,
          destX: 0.5,
          destY: 0.5,
          next: 1,
          data: msg,
          id: msg.mediaId
        };


        // if (this.eye.state === 1) {
        //   this.eye = {
        //     origin: origin,
        //     dest: {x: 0.5, y: 0.5},
        //     next: 1
        //     // x: window.innerWidth*0.27,
        //     // y: window.innerHeight*0.28,
        //   };
        // } else {
        //   this.eye = {
        //     origin: origin,
        //     dest: {x: 0.5, y: 0.5},
        //     next: 0
        //     // x: window.innerWidth*0.27,
        //     // y: window.innerHeight*0.28,
        //   };
        // }
        // this.popupId = msg.mediaId;
        // this.popupData = msg;
        // this.eye = {x: window.innerWidth*0.27, y: window.innerHeight*0.28};
      } else {
        this.eye = {
          state: this.eye.state || 0,
          originX: this.eye.originX || Math.random(),
          originY: this.eye.originY || Math.random(),
          destX: 0.5,
          destY: 0.5,
          next: 0
        };
        // this.eye = null;
        // this.popupId = null;
        // this.popupData = {};
      }
      // if (this.eye.next !== this.eye.state) {
      //   TinyAnimate.animate(this.eye.state, this.eye.next, 400, value => {
      //     this.eye.x = this.eye.originX + value*(this.eye.destX-this.eye.originX);
      //     this.eye.y = this.eye.originY + value*(this.eye.destY-this.eye.originY);
      //     this.eye.state = value;
      //     const x = (this.eye.x*100).toFixed(4);
      //     const y = (this.eye.y*100).toFixed(4);
      //     popup.element.style.transform = `translate3d(${x}%, ${y}%, 0)`;
      //   }, "easeInOutSine");
      // }


      this.renderPopups();
    }
  }


  build() {

    return {
      class: "wall",
      init: async wall => {
        this.medias = await this.getMedias();
        this.thumbs = await this.getThumbs();
        // this.items = this.createItems(this.shuffleArray(this.thumbs));
        this.items = this.createItems(this.thumbs);

      },
      children: [
        // {
        //   tag: "canvas",
        //   init: wall => {
        //     const onFrame = () => {
        //       wall.render();
        //       requestAnimationFrame(onFrame);
        //     }
        //
        //     requestAnimationFrame(onFrame);
        //   },
        //   update: wall => {
        //
        //     const canvas = wall.element;
        //
        //     canvas.width = window.innerWidth;
        //     canvas.height = window.innerHeight;
        //
        //     const ctx = canvas.getContext("2d");
        //
        //     ctx.clearRect(0, 0, canvas.width, canvas.height);
        //
        //     for (let i in this.items) {
        //
        //       const item = this.items[i];
        //       // const src = item.image.small;
        //       const image = item.image.image;
        //       const width = item.imageWidth;
        //       const height = item.row.imageHeight;
        //
        //       this.updateItem(item);
        //
        //       const x = item.currentX;
        //       const y = item.currentY;
        //
        //       ctx.globalAlpha = 1;
        //       ctx.fillStyle = "black";
        //       ctx.fillRect(x, y, width, height);
        //
        //
        //       ctx.globalAlpha = item.opacity;
        //       ctx.drawImage(image, x, y, width, height);
        //
        //     }
        //
        //   }
        // },
        {
          class: "background",
          init: wall => {

            const onFrame = () => {
              wall.render();
              requestAnimationFrame(onFrame);
            }
            requestAnimationFrame(onFrame);
          },
          update: wall => {

            wall.children = this.items.map(item => {
              return {
                class: "thumb",
                tag: "img",
                init: thumb => {
                  // thumb.element.src = item.image.small;

                  // thumb.element.src = `images/small/${item.image.id}.jpeg`; //item.image.small;

                  thumb.element.src = item.image.small;
                  thumb.element.style.width = item.imageWidth.toFixed()+"px";
                  thumb.element.style.height = item.row.imageHeight.toFixed()+"px";
                },
                update: thumb => {

                  this.updateItem(item);

                  const x = item.currentX;
                  const y = item.currentY;

                  // thumb.element.style.zIndex = item.z.toFixed();
                  thumb.element.style.filter = "brightness("+item.opacity.toFixed(4)+")";

                  // thumb.element.style.filter = "blur("+blur.toFixed()+"px)";
                  // thumb.element.style.transform = "translate("+x.toFixed(4)+"px, "+y.toFixed(4)+"px)";
                  thumb.element.style.transform = "translate3d("+x.toFixed(4)+"px, "+y.toFixed(4)+"px, 0px)";
                }
              };
            });
          }
        },
        {
          class: "popups",
          init: popups => {
            this.renderPopups = popups.render;
          },
          child: {
            class: "popup",
            update: popup => {
              // popup.element.classList.toggle("active", Boolean(this.popupId));

              popup.element.classList.toggle("active", this.eye.next === 1);

              // const media = this.medias.concat(this.testMedias).find(image => image.id == this.popupId);
              const media = this.medias.find(image => image.id == this.eye.id);

              if (this.eye.next !== this.eye.state) {
                TinyAnimate.animate(this.eye.state, this.eye.next, 500, value => {
                  this.eye.state = value;

                  const ex = this.eye.originX + value*(this.eye.destX-this.eye.originX);
                  const ey = this.eye.originY + value*(this.eye.destY-this.eye.originY);
                  // const x = (ex*window.innerWidth).toFixed(4);
                  // const y = (ey*window.innerHeight).toFixed(4);
                  // popup.element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                }, "easeInOutSine");
              }

              if (media) {
                popup.children = [
                  {
                    class: "image",
                    update: node => {
                      if (media.type === "image" || !media.type) {
                        node.children = [{
                          tag: "img",
                          update: img => {
                            img.element.src = media.src;
                            img.element.width = media.width;
                            img.element.height = media.height;
                            img.element.classList.toggle("portrait", media.width/media.height < window.innerWidth/window.innerHeight);
                          }
                        }];
                      } else {
                        node.children = [];
                      }
                    }
                  },
                  {
                    class: "video",
                    update: node => {
                      if (media.type === "video") {
                        node.children = [{
                          tag: "video",
                          init: node => {
                            // node.element.autoplay = true;
                            node.element.muted = true;
                          },
                          update: node => {

                            node.child = {
                              tag: "source",
                              init: source => {
                                source.element.src = media.src;
                                source.element.type = "video/mp4";
                              }
                            }
                            if (this.eye.data && this.eye.data.currentTime) {
                              node.element.currentTime = this.eye.data.currentTime;
                            }
                            if (this.eye.data && this.eye.data.playing === false) {
                              node.element.pause();
                            } else {
                              node.element.play();
                            }
                          }
                        }];
                      } else {
                        node.children = [];
                      }
                    }
                  }
                ];
              }
            }
          }
        }
      ]
    }
  }

}
