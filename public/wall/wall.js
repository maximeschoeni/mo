class Wall {

  constructor() {

    this.screenId = location.hash.slice(1) || "1";

    // this.popups = {};

    this.eye = {
      state: 0,
      originX: 0.5,
      originY: 1.5,
      destX: 0.5,
      destY: 0.5,
      next: 0
    };

    this.cache = {};
    this.options = {};

    this.medias = [];

    this.render = () => {};
    this.renderPopups = () => {};

    this.maxZoom = 2;

  }

  async fetchImages(query) {
    if (!this.cache[query]) {
      this.cache[query] = await fetch("/query/"+query).then(response => response.json());
    }
    return this.cache[query];
  }

  async getOptions() {

    const query = `options/carousel`;

    if (!this.cache[query]) {

      this.cache[query] = await fetch(`/get/${query}`).then(response => response.json());

    }

    return this.cache[query];
  }

  async load() {

    this.loading = true;

    // medias
    this.medias = [];

    this.loadInfo = `loading medias... (0%)`;
    await this.render();

    const files = await this.fetchImages(`files`);
    this.filesDirectory = Object.fromEntries(files.map(file => [file.id, file]));

    const items = await this.fetchImages("items") || [];

    const fileIds = items.reduce((ids, item) => [...ids, ...item.medias.filter(media => media.image && media.image.length).map(media => media.image[0])], []);

    for (let i = 0; i < fileIds.length; i++) {

      let fileId = fileIds[i];

      const file = this.filesDirectory[fileId];

      if (!file) {

        console.error(`file not found: ${fileId}`);

      }

      const media = new Media(file);

      await media.loadFile();

      this.loadInfo = `loading medias... (${(100*i/fileIds.length).toFixed()}%)`;
      await this.render();

      this.medias.push(media);

    }

    // tiles

    this.loadInfo = `loading tiles... (0%)`;
    await this.render();

    const tileFiles = await this.fetchImages("files?parent=2");

    const tiles = [];

    for (let j = 0; j < tileFiles.length; j++) {

      const file = tileFiles[j];

      const tile = new Tile(file);

      await tile.loadFile();

      tiles.push(tile);

      this.loadInfo = `loading tiles... (${(100*j/tileFiles.length).toFixed()}%)`;
      await this.render();

    }

    this.items = Tile.createItems(tiles);

    this.loading = false;

    await this.render();

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
    const force = 12*window.innerHeight;

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
      // const diffY = cy - window.innerHeight*(ey*0.5 + 0.03);
      const diffY = cy - window.innerWidth*0.5625*(ey*0.5 + 0.03);



      // let dist = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
      let dist2 = Math.pow(diffX, 2) + Math.pow(diffY, 2);

      item.currentY += state*force*diffY/dist2;
      item.opacity = Math.max(0, item.opacity - state*0.4*force/dist2);
      // item.z += state*dist2/10;

    }

  }


  async run(msg) {

    switch (msg.action) {

      case "load": {
        if (msg.clean) {
          this.medias.forEach(media => {
            if (media.active) {
              media.onclose = () => media.trash = true;
            } else {
              media.trash = true;
            }
          });
        }
        for (let media of this.medias) {
          if (msg.mediaIds.includes(media.id)) {
            media.trash = false;
          }
        }
        await this.renderPopups();
        break;
      }
      case "unload": {
        const media = this.medias.find(media => media.id === msg.mediaId);
        if (media) {
          media.trash = true;
          await this.renderPopups();
        }
        break;
      }
      case "open": {

        const media = this.medias.find(media => media.id === msg.mediaId);
        if (media) {
          if (media.trash) {
            media.trash = false;
            media.state = 0;
          }

          while (this.medias.some(media => media.active)) {
            this.run({
              action: "close"
            });
          }

          this.eye.state = 0;

          media.state = 1;

          media.active = true;

          await this.renderPopups();

          TinyAnimate.animate(0, 1, 500, value => {
            this.eye.state = value;
          }, "easeInOutSine",  () => {
            this.renderPopups();
          });


        }
        break;
      }
      case "close": {

        const activeMedias = this.medias.filter(media => media.active);

        for (let media of activeMedias) {

          media.active = false;

          media.state = 0;

          await this.renderPopups();

          media.animation = TinyAnimate.animate(1, 0, 500, value => {
            this.eye.state = value;
          }, "easeInOutSine", () => {
            // media.active = false;
            if (media.onclose) {
              media.onclose();
              media.onclose = null;
            }
            this.renderPopups();
          });

        }

        break;
      }
      case "videotime": {
        const media = this.medias.find(media => media.id === msg.mediaId);
        if (media) {
          media.currentTime = msg.currentTime;
          await this.renderPopups();
        }
        break;
      }
      case "videoplay": {
        const media = this.medias.find(media => media.id === msg.mediaId);
        if (media) {
          media.playing = msg.playing;
          media.currentTime = msg.currentTime;
          await this.renderPopups();
        }
        break;
      }
      case "zoom": {
        const media = this.medias.find(media => media.id === msg.mediaId);
        if (media) {

          if (msg.zoomX !== undefined) media.zoomX = msg.zoomX;
          if (msg.zoomY !== undefined) media.zoomY = msg.zoomY;

          this.eye.destX = 1-media.zoomX;
          this.eye.destY = 1-media.zoomY;

          if (msg.zoom && media.zoom === 1) {
            TinyAnimate.animate(media.zoom, this.maxZoom, 500, value => {
              media.zoom = value;
              this.eye.destX = 1-media.zoomX;
              this.eye.destY = 1-media.zoomY;
              this.renderPopups();
            }, "easeInOutSine");
          } else if (!msg.zoom && media.zoom > 1) {
            TinyAnimate.animate(media.zoom, 1, 500, value => {
              media.zoom = value;
              const state = (value-1)/(this.maxZoom-1);
              media.zoomX = state*media.zoomX + (1-state)*0.5;
              media.zoomY = state*media.zoomY + (1-state)*0.5;
              this.eye.destX = 1-media.zoomX;
              this.eye.destY = 1-media.zoomY;
              this.renderPopups();
            }, "easeInOutSine");
          }

          await this.renderPopups();
        }
        break;
      }

    }
  }

  async pop(msg) {

    if (msg.screenId === this.screenId) {

      // await Promise.resolve(this.task);

      this.task = this.run(msg);

    }
  }


  build() {

    return {
      class: "wall",
      init: async wall => {
        this.render = wall.render;
        this.load();
      },
      children: [
        {
          class: "load-screen",
          update: loading => {
            loading.element.classList.toggle("hidden", !this.loading);
            if (this.loading) {
              loading.element.innerHTML = this.loadInfo || "";
            }
          }
        },
        {
          class: "wall-content",
          update: wall => {
            wall.element.classList.toggle("hidden", !!this.loading);
            if (!this.loading) {
              wall.children = [
                {
                  tag: "canvas",
                  init: wall => {
                    const onFrame = () => {
                      wall.render();
                      requestAnimationFrame(onFrame);
                    }
                    requestAnimationFrame(onFrame);
                  },
                  update: wall => {

                    const canvas = wall.element;

                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;

                    const ctx = canvas.getContext("2d");

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    for (let i in this.items) {

                      const item = this.items[i];
                      // const src = item.image.small;
                      const image = item.image.image;
                      const width = item.imageWidth;
                      const height = item.row.imageHeight;

                      this.updateItem(item);

                      const x = item.currentX;
                      const y = item.currentY;

                      ctx.globalAlpha = 1;
                      ctx.fillStyle = "black";
                      ctx.fillRect(x, y, width, height);


                      ctx.globalAlpha = item.opacity;
                      ctx.drawImage(item.canvas, x, y, width, height);

                    }

                  }
                },
                {
                  class: "popups",
                  init: popups => {
                    this.renderPopups = popups.render;
                  },
                  update: popups => {
                    popups.children = this.medias.map(media => {
                      return {
                        class: "popup",
                        update: popup => {

                          popup.element.classList.toggle("trash", !!media.trash);
                          const state = Math.max(media.state || 0, 0.1);
                          popup.element.style.transform = `scale(${state})`;
                          popup.element.style.transformOrigin = `${this.eye.originX*100}% ${this.eye.originY*100}%`;
                          popup.element.style.transition = `transform 500ms`;

                        },
                        children: [
                          {
                            class: "canvas",
                            update: canvas => {
                              canvas.element.classList.toggle("hidden", media.type !== "image");
                              if (media.type === "image") {
                                if (media.trash) {
                                  canvas.children = [];
                                } else {
                                  canvas.children = [
                                    {
                                      class: "main",
                                      tag: "canvas",
                                      update: canvas => {
                                        canvas.element.width = window.innerWidth*window.devicePixelRatio;
                                        canvas.element.height = window.innerHeight*window.devicePixelRatio;

                                        media.write(canvas.element, media.image, media.zoom, media.zoomX, media.zoomY);
                                      }
                                    },
                                  ];
                                }
                              }
                            }
                          },
                          {
                            class: "video",
                            update: node => {
                              node.element.classList.toggle("hidden", media.type !== "video");
                              if (media.type === "video") {
                                if (media.trash) {
                                  media.loaded = false;
                                  node.children = [];
                                 } else {
                                  node.children = [
                                    {
                                      tag: "video",
                                      init: node => {
                                        node.element.muted = true;
                                      },
                                      update: node => {
                                        if (media.currentTime || media.currentTime === 0) {
                                          node.element.currentTime = media.currentTime;
                                        }
                                        if (media.playing) {
                                          node.element.play();
                                        } else {
                                          node.element.pause();
                                        }
                                      },
                                      child: {
                                        tag: "source",
                                        init: source => {
                                          source.element.src = media.src;
                                          source.element.type = "video/mp4";
                                        }
                                      }
                                    }
                                  ];
                                }
                              }
                            }
                          }
                        ]
                      };
                    });
                  }
                }
              ];
            }
          }
        }
      ]
    }
  }
}
