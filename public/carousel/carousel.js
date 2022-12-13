class Screen {

  constructor() {

    this.language = "fr";

    this.screenId = location.hash.slice(1) || "1";

    this.cache = {};

    this.screensaver = new Screensaver();

    this.onPop = () => {};

    this.animationDuration = 500;
    this.maxZoom = 2;
    this.zoom = 1;
    this.zoomX = 0.5;
    this.zoomY = 0.5;

    this.mediaLibrary = {};

  }

  async fetch(query) {
    if (!this.cache[query]) {
      this.cache[query] = await fetch("/query/"+query).then(response => response.json());
    }
    return this.cache[query];
  }


  getSuffix() {
    if (this.language === "en") {
      return "-en";
    }
    return "";
  }

  getItemFileIds(item) {
    return (item.medias || []).map(media => media.image && media.image[0]).filter(id => id);
  }

  // loadMedia(item) {
  //   this.currentItem = item;
  //   this.state = "loaded";
  //   this.renderPopup();
  // }

  open() {
    // if (this.currentItem) {
      this.state = "fade-in";
      this.renderPopup();
      setTimeout(() => {
        this.state = "active";
        this.renderPopup();
      }, this.animationDuration);
    // }
  }

  close() {
    // if (this.currentItem) {
      this.state = "fade-out";
      this.renderPopup();
      setTimeout(() => {
        this.state = "browsing";
        this.renderPopup();
      }, this.animationDuration);
    // }
  }

  async load() {

    this.loading = true;
    this.state = "loading";
    this.loadInfo = "loading data... (0%)";
    await this.render();

    this.items = await this.fetch("items");
    this.loadInfo = "loading data... (25%)";
    await this.render();

    this.files = await this.fetch(`files`);
    this.filesDirectory = Object.fromEntries(this.files.map(file => [file.id, file]));
    this.loadInfo = "loading data... (50%)";
    await this.render();

    this.options = await fetch(`/get/options/carousel`).then(response => response.json());
    this.loadInfo = "loading data... (75%)";
    await this.render();

    this.mainOptions = await fetch(`/get/options/main`).then(response => response.json()) || {};
    this.loadInfo = "loading data... (100%)";
    await this.render();

    const fileIds = this.items.reduce((ids, item) => [...ids, ...item.medias.filter(media => media.image && media.image.length).map(media => media.image[0])], []);
    this.loadInfo = "loading images... (0%)";
    await this.render();

    for (let i = 0; i < fileIds.length; i++) {
      const fileId = fileIds[i]
      const file = this.filesDirectory[fileId];

      if (!file) {
        this.loadInfo = `error loading file (${fileId})`;
        await this.render();
        return;
      }

      const media = new Media(file);
      this.mediaLibrary[fileId] = media;
      await media.loadFile();
      this.loadInfo = `loading images... (${(100*i/fileIds.length).toFixed()}%)`;
      await this.render();
    }

    if (this.mainOptions.pointerthresold && this.mainOptions.pointerthresold[0]) {
      this.pointerThresold = Number(this.mainOptions.pointerthresold[0]);
    }

    this.screensaver.timeout = this.options && this.options.screensavertimeout && this.options.screensavertimeout[0] || 3600;
    this.screensaver.onStart = () => {
      this.onPop({
        screenId: this.screenId,
        action: "close"
      });
      this.state = "screensaver";
      screen.render();
    };

    this.screensaver.active = true;

    this.loading = false;
    this.loadInfo = "done";
    this.state = "browsing";

    await this.render();
  }



  build() {

    return {
      class: "screen",
      init: async screen => {
        this.render = screen.render;
      //   this.screensaving = true;
      //   this.items = await this.fetch("items");
      //   const fileIds = this.items.reduce((ids, item) => [...ids, ...item.medias.filter(media => media.image && media.image.length).map(media => media.image[0])], []);
      //   // this.files = await this.fetch(`files?ids=${fileIds.join(",")}`);
      //   this.files = await this.fetch(`files`);
      //   this.filesDirectory = Object.fromEntries(this.files.map(file => [file.id, file]));
      //
      //   this.options = await fetch(`/get/options/carousel`).then(response => response.json());
      //   this.screensaver.timeout = this.options && this.options.screensavertimeout && this.options.screensavertimeout[0] || 3600;
      //   this.screensaver.onStart = () => {
      //     this.onPop({
      //       screenId: this.screenId,
      //       action: "close"
      //     });
      //     screen.render();
      //   };
      //   this.screensaver.active = true;
      //
      //   this.mainOptions = await fetch(`/get/options/main`).then(response => response.json()) || {};
      //
      //   if (this.mainOptions.pointerthresold && this.mainOptions.pointerthresold[0]) {
      //     this.pointerThresold = Number(this.mainOptions.pointerthresold[0]);
      //   }

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
          class: "main",
          update: main => {
            if (!this.loading) {
              main.children = [
                {
                  class: "screensaver",
                  update: screensaver => {

                    if (this.screensaver.active) {
                      screensaver.element.classList.remove("hidden");
                      document.body.offsetHeight; // -> force reflow
                      screensaver.element.ontransitionend = event => {
                        this.state = "browsing";
                        this.renderPopup();
                      };
                      screensaver.element.classList.add("active");
                    } else {
                      screensaver.element.classList.remove("active");
                      screensaver.element.ontransitionend = event => screensaver.element.classList.add("hidden");
                    }

                    screensaver.child = {
                      tag: "video",
                      init: video => {
                        video.element.loop = true;
                        video.element.mute = true;
                        video.element.muted = true;
                        video.element.onpointerdown = event => {
                          this.screensaver.stop();
                          this.render();
                        }
                      },
                      child: {
                        tag: "source",
                        update: async source => {
                          const file = this.options && this.options.screensaver && this.options.screensaver[0] && this.filesDirectory[this.options.screensaver[0]];
                          if (file && !source.element.src.endsWith(file.filename)) {
                            source.element.type = file.type;
                            source.element.src = "/uploads/" + file.filename;
                          }
                        }
                      },
                      complete: video => {
                        if (this.screensaver.active) {
                          video.element.play();
                        } else {
                          video.element.pause();
                        }
                      }
                    }
                  }
                },
                {
                  class: "slideshow",
                  init: slideshow => {

                    this.player = createMediaPlayer();
                    this.player.duration = 300;
                  	this.player.easing = "easeInOutSine";

                    this.player.onRenderSlide = (slide, x) => {

                      const diff = Math.abs(x);

                      const tx = x*40;
                      const ty = Math.abs(x)*5;
                      const tz = -Math.abs(x)*5 - 2;
                      const ry = -x*5;
                      const opacity = Math.max(0, 1-Math.abs(x)*0.25);

                      // slide.element.style.display = diff > 4 ? "none": "block";

                      slide.element.classList.toggle("hidden", diff > 4);

                      slide.element.style.filter = "brightness("+opacity.toFixed(4)+")" ;
                      slide.element.style.transform = "translate3D("+tx.toFixed(4)+"em, "+ty.toFixed(4)+"em, "+tz.toFixed(4)+"em) rotateY("+ry.toFixed(4)+"deg)";

                    };

                    new PointerTrap(slideshow.element, this.pointerThresold);

                    slideshow.element.oncatch = (trap, event) => {
                      if (this.state !== "browsing") return;
                      event.preventDefault();
                      // this.stopScreensaver();
                      this.screensaver.stop();
                      this.player.shift(-trap.diffX/slideshow.element.clientWidth);
                    }

                    slideshow.element.onrelease = (trap, event) => {
                      if (this.state !== "browsing") return;
                      event.preventDefault();

                      this.screensaver.stop();

                      if (trap.swipeRight || trap.click && trap.map.x < 0.5) {
                        this.player.prev().then(() => {
                          this.renderPopup();
                        });
                        const fileIds = this.getItemFileIds(this.items[this.player.getCurrentIndex()]);
                        this.onPop({
                          screenId: this.screenId,
                          action: "load",
                          mediaIds: fileIds,
                          clean: true
                        });
                      } else if (trap.swipeLeft || trap.click && trap.map.x >= 0.5) {
                        // console.log(this.player.x);
                        this.player.next().then(() => {
                          this.renderPopup();
                        });
                        const fileIds = this.getItemFileIds(this.items[this.player.getCurrentIndex()]);
                        this.onPop({
                          screenId: this.screenId,
                          action: "load",
                          mediaIds: fileIds,
                          clean: true
                        });
                      } else if (trap.swipeFail) {
                        this.player.cancel();
                      }
                    }

                    slideshow.children = [
                      {
                        class: "viewer",
                        children: this.items.map((item, index) => {
                          return {
                            class: "slide",
                            init: async slide => {
                              this.player.addSlide({
                                element: slide.element,
                                render: slide.render,
                                id: item.id,
                                item: item
                              });

                              const canvasWidth = slideshow.element.clientWidth
                              const canvasHeight = slideshow.element.clientHeight;

                              const medias = item.medias || [];
                              const itemMedia = medias.find(media => media.image && media.image.length); // -> pick first image. (video!)
                              const fileId = itemMedia && itemMedia.image[0];
                              const media = this.mediaLibrary[fileId];

                              // const file = this.filesDirectory[fileId];
                              //
                              //
                              // const image = new Image(file.width, file.height);
                              // image.src = "/uploads/" + file.filename;
                              //
                              // await new Promise(resolve => {
                              //   image.onload = event => resolve();
                              // });

                              const portrait = media.width/media.height < (canvasWidth*60/100)/canvasHeight;

                              let width;
                              let height;

                              if (portrait) {
                                height = canvasHeight;
                                width = height*media.width/media.height;
                              } else {
                                width = canvasWidth*60/100;
                                height = width*media.height/media.width;
                              }
                              let left = (canvasWidth - width)/2;
                              let top = (canvasHeight - height)/2;

                              slide.children = [
                                {
                                  tag: "canvas",
                                  init: canvas => {
                                    canvas.element.width = canvasWidth;
                                    canvas.element.height = canvasHeight;
                                    const ctx = canvas.element.getContext("2d");
                                    ctx.shadowColor = "black";
                                    ctx.shadowBlur = 256;
                                    ctx.drawImage(media.image, left, top, width, height);
                                  }
                                },
                                {
                                  class: "gabarit",
                                  init: gabarit => {
                                    gabarit.element.style.top = `${100*top/canvasHeight}%`;
                                    gabarit.element.style.left = `${100*left/canvasWidth}%`;
                                    gabarit.element.style.width = `${100*width/canvasWidth}%`;
                                    gabarit.element.style.height = `${100*height/canvasHeight}%`;
                                  // },
                                  // update: gabarit => {
                                    new PointerTrap(gabarit.element, this.pointerThresold);
                                    gabarit.element.onrelease = (trap, event) => {
                                      const currentSlide = this.player.getCurrent();
                                      if (trap.click && currentSlide && currentSlide.item === item) {
                                        event.preventDefault();
                                        this.onPop({
                                          screenId: this.screenId,
                                          action: "open",
                                          mediaId: fileId
                                        });
                                        this.open();
                                        // this.currentSlide = currentSlide;
                                        // this.state = "fade-in";
                                        // this.renderPopup();

                                      }
                                    }
                                  }
                                }
                              ];

                            }
                          };
                        })
                      }
                    ];
                  },
                  update: slideshow => {
                    slideshow.element.classList.toggle("active", this.state === "browsing");
                  },
                  ready: slideshow => {
                    this.player.init();
                  }
                },
                {
                  class: "popup",
                  init: popup => {
                    this.renderPopup = popup.render;
                    popup.element.onpointerdown = event => {
                      this.screensaver.stop();
                    }
                  },
                  update: popup => {
                    popup.element.classList.toggle("active", this.state === "active");
                    popup.element.classList.toggle("fade-in", this.state === "fade-in");
                    popup.element.classList.toggle("fade-out", this.state === "fade-out");
                    popup.element.classList.toggle("browsing", this.state === "browsing");

                    const currentSlide = this.player.getCurrent();
                    this.currentItem = currentSlide && currentSlide.item;
                    const itemMedias = this.currentItem && this.currentItem.medias || [];
                    const itemMedia = itemMedias.find(media => media.image && media.image[0]);
                    const fileId = itemMedia && itemMedia.image && itemMedia.image[0];

                    this.currentMedia = fileId && this.mediaLibrary[fileId];

                    if (this.currentMedia) {


                      // popup.element.style.display = "block";
                      popup.children = [{
                        class: "popup-content",
                        update: content => {
                          content.children = [
                            {
                              class: "media",
                              children: [
                                {
                                  class: "viewer",
                                  update: viewer => {
                                    viewer.children = itemMedias.filter(media => media.image && media.image[0]).map(itemMedia => {
                                      return {
                                        class: "frame",
                                        update: async frame => {
                                          const fileId = itemMedia.image[0];
                                          const media = this.mediaLibrary[fileId];

                                          frame.element.classList.toggle("active", this.currentMedia.id === fileId);
                                          if (media) {
                                            frame.children = [
                                              {
                                                tag: "figure",
                                                class: "image",
                                                init: figure => {
                                                  new PointerTrap(figure.element, this.pointerThresold);
                                                },
                                                update: figure => {
                                                  figure.element.onstart = (trap) => {
                                                    this.screensaver.stop();
                                                    TinyAnimate.animate(1, this.maxZoom, this.animationDuration, value => {
                                                      this.zoom = value;
                                                      this.zoomX = trap.map.x;
                                                      this.zoomY = trap.map.y;
                                                      this.onPop({
                                                        screenId: this.screenId,
                                                        mediaId: media.id,
                                                        action: "zoom",
                                                        zoom: true,
                                                        zoomX: trap.map.x,
                                                        zoomY: trap.map.y
                                                      });
                                                      figure.render();
                                                    }, "easeInOutSine");
                                                  };
                                                  figure.element.oncatch = (trap) => {
                                                    this.screensaver.stop();
                                                    this.zoomX = trap.map.x;
                                                    this.zoomY = trap.map.y;
                                                    this.onPop({
                                                      screenId: this.screenId,
                                                      mediaId: media.id,
                                                      action: "zoom",
                                                      zoom: true,
                                                      zoomX: trap.map.x,
                                                      zoomY: trap.map.y
                                                    });
                                                    figure.render();
                                                  };
                                                  figure.element.onrelease = (trap) => {
                                                    this.onPop({
                                                      screenId: this.screenId,
                                                      mediaId: media.id,
                                                      action: "zoom",
                                                      zoom: false
                                                    });
                                                    TinyAnimate.animate(this.zoom, 1, this.animationDuration, value => {
                                                      this.zoom = value;
                                                      figure.render();
                                                    }, "easeInOutSine");
                                                  };

                                                  figure.element.classList.toggle("hidden", media.type !== "image");
                                                  if (media.type === "image") {
                                                    figure.child = {
                                                      tag: "canvas",
                                                      update: canvas => {
                                                        canvas.element.width = figure.element.clientWidth;
                                                        canvas.element.height = figure.element.clientHeight;
                                                        media.write(canvas.element, media.image, this.zoom, this.zoomX, this.zoomY, this.maxZoom);
                                                      }
                                                    }
                                                  }
                                                }
                                              },
                                              {
                                                tag: "figure",
                                                class: "video",
                                                update: figure => {
                                                  figure.element.classList.toggle("hidden", media.type !== "video");
                                                  if (media.type === "video") {
                                                    figure.child = {
                                                      tag: "video",
                                                      update: video => {
                                                        if (!video.element.src.endsWith(media.src)) { // no change -> no reload
                                                          video.element.src = media.src;
                                                          video.element.type = media.mimetype;
                                                          video.element.controls = true;

                                                          video.element.onplay = event => {
                                                            this.onPop({
                                                              screenId: this.screenId,
                                                              mediaId: media.id,
                                                              action: "videoplay",
                                                              currentTime: video.element.currentTime,
                                                              playing: true
                                                            });
                                                          };
                                                          video.element.onpause = event => {
                                                            const slide = this.player.getCurrent();
                                                            this.onPop({
                                                              screenId: this.screenId,
                                                              mediaId: media.id,
                                                              action: "videoplay",
                                                              currentTime: video.element.currentTime,
                                                              playing: false
                                                            });
                                                          };
                                                        }
                                                        if (!video.element.paused && !this.popupActive) {
                                                          video.element.pause();
                                                        }
                                                      }
                                                    };
                                                  }
                                                }
                                              }
                                            ];
                                          }
                                        }
                                      };
                                    });
                                  }
                                },
                                {
                                  class: "gallery",
                                  update: gallery => {
                                    const medias = this.currentItem.medias || [];
                                    gallery.element.classList.toggle("hidden", medias.length <= 1);

                                    if (medias.length > 1) {

                                      gallery.children = medias.filter(media => media.image && media.image.length).map(media => {
                                        const fileId = media.image[0];
                                        const file = this.filesDirectory[fileId];
                                        return {
                                          class: "frame",
                                          update: async frame => {
                                            frame.element.classList.toggle("active", this.currentMedia.id === fileId);
                                            frame.children = [
                                              {
                                                tag: "figure",
                                                class: "image",
                                                update: figure => {
                                                  const isImage = file.type.startsWith("image");
                                                  figure.element.classList.toggle("hidden", !isImage);
                                                  if (isImage) {
                                                    figure.child = {
                                                      tag: "img",
                                                      init: img => {
                                                        img.element.draggable = false;
                                                      },
                                                      update: img => {
                                                        const medium = file.sizes.find(size => size.key === "carousel-thumb") || file;
                                                        const src = "/uploads/"+medium.filename;
                                                        if (!img.element.src.endsWith(src)) {
                                                          img.element.src = src;
                                                          img.element.onpointerdown = event => {
                                                              this.currentMedia = this.mediaLibrary[fileId];
                                                              this.onPop({
                                                                screenId: this.screenId,
                                                                mediaId: file.id,
                                                                action: "open"
                                                              });
                                                            content.render();
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              },
                                              {
                                                tag: "figure",
                                                class: "video",
                                                update: figure => {
                                                  const isVideo = file.type.startsWith("video");
                                                  figure.element.classList.toggle("hidden", !isVideo);
                                                  if (isVideo) {
                                                    figure.children = [
                                                      {
                                                        tag: "video",
                                                        update: video => {
                                                          const src = "/uploads/"+file.filename;
                                                          if (!video.element.src.endsWith(src)) {
                                                            video.element.src = src;
                                                            video.element.type = file.type;
                                                          }
                                                        }
                                                      },
                                                      {
                                                        class: "video-play",
                                                        update: button => {
                                                          button.element.onpointerdown = event => {
                                                            event.preventDefault();
                                                            this.currentMedia = this.mediaLibrary[file.id];
                                                            this.onPop({
                                                              screenId: this.screenId,
                                                              mediaId: file.id,
                                                              action: "open",
                                                              currentTime: 0,
                                                              playing: false
                                                            });
                                                            content.render();
                                                          }
                                                        },
                                                        child: {
                                                          class: "circle",
                                                          child: {
                                                            class: "triangle"
                                                          }
                                                        }
                                                      }
                                                    ]
                                                  }
                                                }
                                              }
                                            ];
                                          }
                                        }
                                      });
                                    } else {
                                      gallery.children = [];
                                    }
                                  }
                                }
                              ]
                            },
                            {
                              class: "separator"
                            },
                            {
                              class: "details",
                              update: details => {
                                details.children = [
                                  {
                                    class: "details-header",
                                    children: [
                                      {
                                        class: "button language",
                                        update: button => {
                                          button.element.onpointerdown = event => {
                                            this.language = this.language === "en" ? "fr" : "en";
                                            details.render();
                                          }
                                        },
                                        child: {
                                          tag: "span",
                                          update: span => {
                                            span.element.innerHTML = this.language === "en" ? "English" : "Français";
                                          }
                                        }
                                      },
                                      {
                                        class: "button close",
                                        init: button => {
                                          button.element.onpointerdown = async event => {
                                            // this.stopScreensaver();
                                            this.screensaver.stop();

                                            this.onPop({ // -> depop
                                              screenId: this.screenId,
                                              action: "close"
                                            });

                                            this.close();

                                            // this.popupActive = false;
                                            // await popup.render();
                                            //
                                            // // wait for animation...
                                            //
                                            // setTimeout(() => {
                                            //   this.currentSlide = null;
                                            //
                                            //   popup.render();
                                            //
                                            //   this.onPop({ // -> depop
                                            //     screenId: this.screenId,
                                            //     action: "close"
                                            //   });
                                            //
                                            // }, 200);
                                          }
                                        },
                                        child: {
                                          tag: "span",
                                          update: span => {
                                            span.element.innerHTML = "X";
                                          }
                                        }
                                      }
                                    ]
                                  },
                                  {
                                    class: "details-body",
                                    children: [
                                      {
                                        class: "title",
                                        child: {
                                          tag: "h1",
                                          update: title => {
                                            title.element.innerHTML = this.currentItem["jeux"+this.getSuffix()];
                                          }
                                        }
                                      },
                                      {
                                        class: "content-wrap",
                                        children: [
                                          {
                                            class: "gradient-top"
                                          },
                                          {
                                            class: "content",
                                            update: content => {
                                              content.element.parentNode.classList.toggle("scrolled", content.element.scrollTop > 0);
                                              content.element.onscroll = event => {
                                                this.screensaver.stop();
                                                content.element.parentNode.classList.toggle("scrolled", content.element.scrollTop > 0);
                                              }
                                              content.children = [
                                                {
                                                  class: "notes",
                                                  children: [
                                                    {
                                                      class: "sections",
                                                      children: (this.currentItem.medias || []).filter(media => media.text).map(media => {
                                                        return {
                                                          class: "text",
                                                          update: text => {
                                                            const mediaImageId = media.image && media.image[0] || "";
                                                            const key = `text${this.getSuffix()}`;
                                                            text.element.innerHTML = media[key];
                                                            if (mediaImageId === this.currentMedia.id && text.element.offsetTop !== content.element.scrollTop) {
                                                              // content.element.scrollTo(0, text.element.offsetTop);
                                                              TinyAnimate.animate(content.element.scrollTop, text.element.offsetTop, 200, value => {
                                                                content.element.scrollTo(0, value);
                                                              }, "easeInOutSine");
                                                            }
                                                          }
                                                        }
                                                      })
                                                    }
                                                  ]
                                                },
                                                {
                                                  class: "text",
                                                  update: content => {
                                                    content.element.innerHTML = this.currentItem["note"+this.getSuffix()];
                                                  }
                                                },
                                                {
                                                  class: "placeholder"
                                                }
                                              ];
                                            }
                                          },
                                          {
                                            class: "gradient-bottom"
                                          }
                                        ]
                                      }
                                    ]
                                  }
                                ];
                              }
                            }
                          ];
                        }
                        // ,
                        // ready: popupcontent => {
                        //   requestAnimationFrame(() => {
                        //     this.popupActive = true;
                        //     popup.render();
                        //   });
                        // }
                      }];
                    } else {
                      popup.children = [];
                    }
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
