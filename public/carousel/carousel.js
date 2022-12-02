class Screen {

  constructor() {

    this.language = "fr";

    this.screenId = location.hash.slice(1) || "1";

    this.cache = {};

    this.screensaver = new Screensaver();

    this.onPop = () => {};

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

  // startScreensaver() {
  //   if (this.timer) {
  //     clearTimeout(this.timer);
  //   }
  //   this.onPop({
  //     screenId: this.screenId
  //   });
  //   this.screensaving = true;
  //   this.render();
  // }
  //
  // stopScreensaver() {
  //   if (this.timer) {
  //     clearTimeout(this.timer);
  //   }
  //   this.timer = setTimeout(() => {
  //     this.startScreensaver();
  //   }, 6000000);
  //   if (this.screensaving) {
  //     this.screensaving = false;
  //     this.render();
  //   }
  // }



  build() {

    return {
      class: "screen",
      init: async screen => {
        this.render = screen.render;
        this.screensaving = true;
        this.items = await this.fetch("items");
        const fileIds = this.items.reduce((ids, item) => [...ids, ...item.medias.filter(media => media.image && media.image.length).map(media => media.image[0])], []);
        // this.files = await this.fetch(`files?ids=${fileIds.join(",")}`);
        this.files = await this.fetch(`files`);
        this.filesDirectory = Object.fromEntries(this.files.map(file => [file.id, file]));

        this.options = await fetch(`/get/options/carousel`).then(response => response.json());
        this.screensaver.timeout = this.options && this.options.screensavertimeout && this.options.screensavertimeout[0] || 3600;
        this.screensaver.onStart = () => {
          this.onPop({
            screenId: this.screenId
          });
          screen.render();
        };
        this.screensaver.active = true;

        this.mainOptions = await fetch(`/get/options/main`).then(response => response.json()) || {};

        if (this.mainOptions.pointerthresold && this.mainOptions.pointerthresold[0]) {
          this.pointerThresold = Number(this.mainOptions.pointerthresold[0]);
        }
      },
      children: [
        {
          class: "screensaver",

          update: screensaver => {

            if (this.screensaver.active) {
              screensaver.element.classList.remove("hidden");
              document.body.offsetHeight; // -> force reflow
              screensaver.element.ontransitionend = event => {
                this.popupActive = false;
                this.currentSlide = null;
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
              if (this.currentSlide) return;
              event.preventDefault();
              // this.stopScreensaver();
              this.screensaver.stop();
              this.player.shift(-trap.diffX/slideshow.element.clientWidth);
            }

            slideshow.element.onrelease = (trap, event) => {
              if (this.currentSlide) return;
              event.preventDefault();

              this.screensaver.stop();

              if (trap.swipeRight || trap.click && trap.map.x < 0.5) {
                this.player.prev();
              } else if (trap.swipeLeft || trap.click && trap.map.x >= 0.5) {
                this.player.next();
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

                      // const canvasWidth = window.innerWidth;
                      // const canvasHeight = window.innerHeight;
                      const canvasWidth = slideshow.element.clientWidth
                      const canvasHeight = slideshow.element.clientHeight;

                      const medias = item.medias || [];
                      const media = medias.find(media => media.image && media.image.length);
                      const fileId = media && media.image[0];
                      const file = this.filesDirectory[fileId];
                      // const medium = file && file.sizes.find(size => size.key === "medium");


                      const image = new Image(file.width, file.height);
                      image.src = "/uploads/" + file.filename;

                      await new Promise(resolve => {
                        image.onload = event => resolve();
                      });

                      const portrait = file.width/file.height < (canvasWidth*60/100)/canvasHeight;

                      let width;
                      let height;

                      if (portrait) {
                        height = canvasHeight;
                        width = height*file.width/file.height;
                      } else {
                        width = canvasWidth*60/100;
                        height = width*file.height/file.width;
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
                            ctx.drawImage(image, left, top, width, height);
                          }
                        },
                        {
                          class: "gabarit",
                          init: gabarit => {
                            gabarit.element.style.top = `${100*top/canvasHeight}%`;
                            gabarit.element.style.left = `${100*left/canvasWidth}%`;
                            gabarit.element.style.width = `${100*width/canvasWidth}%`;
                            gabarit.element.style.height = `${100*height/canvasHeight}%`;
                          },
                          update: gabarit => {
                            new PointerTrap(gabarit.element, this.pointerThresold);
                            gabarit.element.onrelease = (trap, event) => {
                              const currentSlide = this.player.getCurrent();
                              if (trap.click && currentSlide && currentSlide.item === item) {
                                event.preventDefault();
                                this.onPop({
                                  screenId: this.screenId,
                                  mediaId: fileId
                                });
                                this.currentSlide = currentSlide;
                                this.renderPopup();
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
            slideshow.element.classList.toggle("active", Boolean(this.currentSlide));
            // slideshow.element.classList.toggle("hidden", Boolean(this.screensaver.active));
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
            popup.element.classList.toggle("active", Boolean(this.popupActive));

            if (this.currentSlide) {
              const item = this.currentSlide.item;
              let currentMedia = item.medias && item.medias.find(media => media.image && media.image[0]);

              popup.element.style.display = "block";
              popup.children = [{
                class: "popup-content",
                update: content => {
                  const currentFileId = currentMedia && currentMedia.image && currentMedia.image[0];
                  content.children = [
                    {
                      class: "media",
                      children: [
                        {
                          class: "viewer",
                          update: viewer => {
                            const medias = item.medias || [];
                            viewer.children = medias.filter(media => media.image && media.image[0]).map(media => {
                              return {
                                class: "frame",
                                update: async frame => {
                                  const fileId = media.image[0];
                                  const file = this.filesDirectory[fileId];

                                  // const file = await fetch("/get/files/"+media.image[0]).then(response => response.json());
                                  frame.element.classList.toggle("active", currentFileId === fileId);
                                  if (file) {
                                    frame.children = [
                                      {
                                        tag: "figure",
                                        class: "image",
                                        update: figure => {
                                          figure.element.classList.toggle("hidden", !file.type.startsWith("image"));
                                          if (file.type.startsWith("image")) {
                                            figure.child = {
                                              tag: "img",
                                              init: img => {
                                                img.element.draggable = false;
                                                new PointerTrap(img.element, this.pointerThresold);
                                              },
                                              update: async img => {
                                                const box = figure.element.getBoundingClientRect();
                                                const isPortrait = Number(file.width)/Number(file.height) < box.width/box.height;

                                                // const big = file.sizes.find(size => size.key === "carousel-slide") || file;
                                                // const src = "/uploads/" + big.filename;
                                                const src = "/uploads/" + file.filename;

                                                if (!img.element.src.endsWith(src)) {
                                                  img.element.src = src;
                                                  img.element.width = file.width;
                                                  img.element.height = file.height;
                                                  img.element.classList.toggle("portrait", isPortrait);
                                                }

                                                const updateZoom = (clientX, clientY) => {

                                                  let x = (event.clientX - box.x)/box.width;
                                                  let y = (event.clientY - box.y)/box.height;

                                                  x = Math.max(Math.min(1, x), 0);
                                                  y = Math.max(Math.min(1, y), 0);

                                                  let originX = 100*x;
                                                  let originY = 100*y;

                                                  const zoom = 2;

                                                  if (isPortrait) {
                                                    originX = 50 + (x-0.5)*100*(file.width*box.height*zoom/(file.height*box.width) - 1)/(zoom - 1);
                                                  } else {
                                                    originY = 50 + (y-0.5)*100*(file.height*box.width*zoom/file.width - box.height)/(box.height*zoom - box.height);
                                                  }

                                                  figure.element.style.transformOrigin = `${originX}% ${originY}%`;
                                                  figure.element.style.transform = `scale(${zoom})`;

                                                  this.onPop({
                                                    screenId: this.screenId,
                                                    mediaId: file.id,
                                                    zoom: 1,
                                                    zoomX: x,
                                                    zoomY: y
                                                  });

                                                }

                                                const endZoom = () => {
                                                  figure.element.style.transform = `scale(1)`;
                                                  this.onPop({
                                                    screenId: this.screenId,
                                                    mediaId: file.id,
                                                    zoom: 0
                                                  });
                                                }

                                                img.element.oncatch = (trap) => {
                                                  this.screensaver.stop();
                                                  updateZoom(trap.x, trap.y);
                                                };
                                                img.element.onrelease = (trap) => {
                                                  endZoom();
                                                };



                                                // if ('ontouchstart' in window) {
                                                //   img.element.ontouchstart = event => {
                                                //       const box = img.element.getBoundingClientRect();
                                                //       const onMouseMove = event => {
                                                //         updateZoom(event.touches[0].clientX, event.touches[0].clientY);
                                                //       }
                                                //       const onMouseUp = event => {
                                                //         document.removeEventListener("touchend", onMouseUp);
                                                //         document.removeEventListener("touchmove", onMouseMove);
                                                //         endZoom();
                                                //       }
                                                //       updateZoom(event.touches[0].clientX, event.touches[0].clientY);
                                                //       document.addEventListener("touchend", onMouseUp);
                                                //       document.addEventListener("touchmove", onMouseMove);
                                                //     }
                                                //
                                                // } else {
                                                //
                                                //   img.element.onmousedown = event => {
                                                //     if (event.button === 0) {
                                                //       const onMouseMove = event => {
                                                //         updateZoom(event.clientX, event.clientY);
                                                //       }
                                                //       const onMouseUp = event => {
                                                //         document.removeEventListener("mouseup", onMouseUp);
                                                //         document.removeEventListener("mousemove", onMouseMove);
                                                //         endZoom();
                                                //       }
                                                //       onMouseMove(event.clientX, event.clientY);
                                                //       document.addEventListener("mouseup", onMouseUp);
                                                //       document.addEventListener("mousemove", onMouseMove);
                                                //     }
                                                //   }
                                                //
                                                // }


                                              }
                                            };
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
                                            figure.child = {
                                              tag: "video",
                                              update: video => {
                                                const src = "/uploads/"+file.filename;
                                                if (!video.element.src.endsWith(src)) { // no change -> no reload
                                                  video.element.src = src;
                                                  video.element.type = file.type;
                                                  video.element.controls = true;

                                                  video.element.onplay = event => {
                                                    this.onPop({
                                                      screenId: this.screenId,
                                                      mediaId: file.id,
                                                      currentTime: video.element.currentTime
                                                    });
                                                  };
                                                  video.element.onpause = event => {
                                                    const slide = this.player.getCurrent();
                                                    this.onPop({
                                                      screenId: this.screenId,
                                                      mediaId: file.id,
                                                      currentTime: video.element.currentTime,
                                                      playing: false
                                                    });
                                                  };
                                                }
                                                // console.log(video.element.paused, this.popupActive);
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
                            const medias = item.medias || [];
                            gallery.element.classList.toggle("hidden", medias.length <= 1);

                            if (medias.length > 1) {

                              gallery.children = medias.filter(media => media.image && media.image.length).map(media => {
                                const fileId = media.image[0];
                                const file = this.filesDirectory[fileId];
                                return {
                                  class: "frame",
                                  update: async frame => {
                                    frame.element.classList.toggle("active", currentFileId === fileId);

                                    frame.children = [
                                      {
                                        tag: "figure",
                                        class: "image",
                                        update: figure => {
                                          const active = file.type.startsWith("image");
                                          figure.element.classList.toggle("hidden", !active);
                                          if (active) {
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
                                                      currentMedia = media;
                                                      this.onPop({
                                                        screenId: this.screenId,
                                                        mediaId: file.id
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
                                          const active = file.type.startsWith("video");
                                          figure.element.classList.toggle("hidden", !active);
                                          if (active) {
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
                                                    currentMedia = media;
                                                    this.onPop({
                                                      screenId: this.screenId,
                                                      mediaId: file.id,
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

                                    this.popupActive = false;
                                    await popup.render();

                                    // wait for animation...

                                    setTimeout(() => {
                                      this.currentSlide = null;

                                      popup.render();

                                      this.onPop({ // -> depop
                                        screenId: this.screenId
                                      });

                                    }, 200);
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
                                    title.element.innerHTML = item["jeux"+this.getSuffix()];
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
                                              children: (item.medias || []).filter(media => media.text).map(media => {
                                                return {
                                                  class: "text",
                                                  update: text => {
                                                    const mediaImageId = media.image && media.image[0] || "";
                                                    const key = `text${this.getSuffix()}`;
                                                    text.element.innerHTML = media[key];
                                                    if (media === currentMedia && text.element.offsetTop !== content.element.scrollTop) {
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
                                            content.element.innerHTML = item["note"+this.getSuffix()];
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
                },
                ready: popupcontent => {
                  requestAnimationFrame(() => {
                    this.popupActive = true;
                    popup.render();
                  });
                }
              }];
            } else {
              popup.children = [];
            }
          }
        }
        // {
        //   class: "overlay",
        //   init: overlay => {
        //     this.renderOverlay = overlay.render;
        //   },
        //   update: overlay => {
        //     let playing = false;
        //     overlay.element.classList.toggle("active", Boolean(this.overlayActive));
        //
        //
        //     if (this.fullscreenItem) {
        //       const videoId = this.fullscreenItem.id;
        //       overlay.children = [{
        //         class: "overlay-content",
        //         children: [
        //           {
        //             class: "close",
        //             init: close => {
        //               close.element.onclick = async event => {
        //                 this.overlayActive = false;
        //                 await overlay.render();
        //
        //                 // wait for animation...
        //
        //                 setTimeout(() => {
        //                   this.fullscreenItem = null;
        //                   overlay.render();
        //                 }, 200);
        //               }
        //             },
        //             child: {
        //               tag: "span",
        //               init: span => {
        //                 span.element.innerHTML = "X";
        //               }
        //             }
        //           },
        //           {
        //             tag: "figure",
        //             class: "video",
        //             update: figure => {
        //               figure.children = [
        //                 {
        //                   tag: "video",
        //                   init: video => {
        //                     video.element.src = "/uploads/"+this.fullscreenItem.filename;
        //                     video.element.type = this.fullscreenItem.type;
        //
        //                     video.element.onloadeddata = event => {
        //                       if (!this.overlayActive) {
        //                         requestAnimationFrame(() => {
        //                           console.log("video loaded");
        //                           this.overlayActive = true;
        //                           overlay.render();
        //                         });
        //                       }
        //                     }
        //
        //                     video.element.onplay = event => {
        //                       this.onPop({
        //                         screenId: this.screenId,
        //                         mediaId: videoId,
        //                         currentTime: video.element.currentTime
        //                       });
        //                     };
        //                     video.element.onpause = event => {
        //                       const slide = this.player.getCurrent();
        //                       this.onPop({
        //                         screenId: this.screenId,
        //                         mediaId: videoId,
        //                         currentTime: video.element.currentTime,
        //                         playing: false
        //                       });
        //                     };
        //                   },
        //                   update: video => {
        //                     if (playing) {
        //                       video.element.play();
        //                     } else {
        //                       video.element.pause();
        //                     }
        //                   }
        //                 },
        //                 {
        //                   class: "video-play",
        //                   update: button => {
        //                     button.element.classList.toggle("playing", Boolean(playing));
        //                     button.element.onclick = event => {
        //                       playing = !playing;
        //                       figure.render();
        //                     }
        //                   },
        //                   child: {
        //                     class: "circle",
        //                     child: {
        //                       class: "triangle"
        //                     }
        //                   }
        //                 }
        //               ];
        //             }
        //           }
        //         ]
        //       }];
        //     } else {
        //       overlay.children = [];
        //     }
        //   }
        // }
      ]
    }
  }

}
