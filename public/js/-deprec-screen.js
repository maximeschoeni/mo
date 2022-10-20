class Screen {


  constructor() {

    this.language = "fr";

    this.screenId = location.hash.slice(1) || "1";

  }


  getSuffix() {
    if (this.language === "en") {
      return "-en";
    }
    return "";
  }

  onPop() {}

  startScreensaver() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.onPop({
      screenId: this.screenId
    });
    this.screensaving = true;
    this.render();
  }

  stopScreensaver() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.startScreensaver();
    }, 6000000);
    if (this.screensaving) {
      this.screensaving = false;
      this.render();
    }
  }


  build() {

    return {
      class: "screen",
      init: async screen => {
        this.render = screen.render;
        this.screensaving = true;

        this.items = await fetch("/query/items").then(response => response.json());


      },
      children: [
        {
          class: "screensaver",
          init: screensaver => {
            screensaver.element.innerHTML = "Screen Saver";
            screensaver.element.onclick = event => {
              this.stopScreensaver();
            }
          },
          update: screensaver => {
            screensaver.element.classList.toggle("hidden", !this.screensaving);
          }
        },
        {
          class: "slideshow",
          init: slideshow => {

            this.player = createMediaPlayer();
            this.player.duration = 300;
          	this.player.easing = "easeInOutSine";

            this.player.onRenderSlide = (slide, x) => {

              const tx = x*40;
              const ty = Math.abs(x)*5;
              const tz = -Math.abs(x)*5 - 2;
              const ry = -x*5;
              const opacity = Math.max(0, 1-Math.abs(x)*0.25);

              slide.element.style.filter = "brightness("+opacity.toFixed(4)+")" ;
              slide.element.style.transform = "translate3D("+tx.toFixed(4)+"em, "+ty.toFixed(4)+"em, "+tz.toFixed(4)+"em) rotateY("+ry.toFixed(4)+"deg)";

            };

            let swipe = registerSwipe(slideshow.element);
            swipe.registerMouse();
            swipe.registerTouch();

            swipe.onMoveX = () => {
              this.stopScreensaver();
              if (this.currentSlide) return;
              slideshow.element.classList.add("rolling");
              this.player.shift(-swipe.diffX/slideshow.element.clientWidth);
            };
            swipe.onSlideRight = () => {
              this.stopScreensaver();
              if (this.currentSlide) return;
              this.player.prev();
              slideshow.element.classList.add("rolling");
            };
            swipe.onSlideLeft = () => {
              this.stopScreensaver();
              if (this.currentSlide) return;
              this.player.next();
              slideshow.element.classList.add("rolling");

            }
            swipe.onCancel = () => {
              this.player.cancel();
              this.stopScreensaver();
            }


            swipe.onClick = (event) => {
              this.stopScreensaver();
              if (this.currentSlide) return;
              const slide = this.player.getCurrent();
              const img = slide.element.querySelector("img");
              const box = img.getBoundingClientRect();
              if (swipe.x >= box.left && swipe.x <= box.right && swipe.y >= box.top && swipe.y <= box.bottom) {
                slideshow.element.classList.remove("rolling");
                this.onPop({
                  screenId: this.screenId,
                  // mediaId: slide.id
                  mediaId: slide.item.images[0]
                });
                this.currentSlide = slide;
                // slideshow.render();
                this.renderPopup();
              } else if (swipe.x < box.left) {
                this.player.prev();
                slideshow.element.classList.add("rolling");
              } else if (swipe.x > box.right) {
                this.player.next();
                slideshow.element.classList.add("rolling");
              }


            }

            slideshow.children = [
              {
                class: "viewer",
                children: this.items.map((item, index) => {
                  return {
                    class: "slide",
                    init: slide => {
                      this.player.addSlide({
                        element: slide.element,
                        render: slide.render,
                        id: item.id,
                        item: item
                      });
                    },
                    update: slide => {
                      // const active = Boolean(this.currentSlide && this.currentSlide.id === item.id);
                      // slide.element.classList.toggle("active", active);
                      slide.child = {
                        tag: "figure",
                        class: "image",
                        child: {
                          tag: "img",
                          init: img => {
                            img.element.draggable = false;
                          },
                          update: async img => {
                            const file = await fetch("/get/files/"+item.images[0]).then(response => response.json());
                            const medium = file.sizes.find(size => size.key === "medium");
                            const src = "/uploads/" + medium.filename;
                            img.element.src = src;
                            img.element.width = file.width;
                            img.element.height = file.height;
                          }
                        }
                      };
                    }
                  };
                })
              }
            ];
          },
          update: slideshow => {
            slideshow.element.classList.toggle("active", Boolean(this.currentSlide));
            slideshow.element.classList.toggle("hidden", Boolean(this.screensaving));
          },
          ready: slideshow => {
            this.player.init();
          }
        },
        {
          class: "popup",
          init: popup => {
            this.renderPopup = popup.render;
          },
          update: popup => {
            popup.element.classList.toggle("active", Boolean(this.popupActive));

            if (this.currentSlide) {
              const item = this.currentSlide.item;
              let mediaId = item.images[0];
              popup.element.style.display = "block";
              popup.children = [{
                class: "popup-content",
                update: content => {
                  content.children = [
                    {
                      class: "media",
                      children: [
                        {
                          tag: "figure",
                          class: "image",
                          child: {
                            tag: "img",
                            init: img => {
                              img.element.draggable = false;
                            },
                            update: async img => {
                              const file = await fetch("/get/files/"+mediaId).then(response => response.json());
                              const big = file.sizes.find(size => size.key === "big");
                              const src = "/uploads/" + big.filename;
                              img.element.src = src;
                              img.element.width = file.width;
                              img.element.height = file.height;
                              img.element.onmousedown = event => {
                                if (event.button === 0) {
                                  const box = img.element.getBoundingClientRect();
                                  const onMouseMove = event => {
                                    let x = (event.clientX - box.x)/box.width;
                                    let y = (event.clientY - box.y)/box.height;
                                    img.element.style.transform = `translate(${(-x+0.5)*500}%, ${(-y+0.5)*500}%) scale(6) `;
                                  }
                                  const onMouseUp = event => {
                                    document.removeEventListener("mouseup", onMouseUp);
                                    document.removeEventListener("mousemove", onMouseMove);
                                    img.element.classList.remove("zoom");
                                    img.element.style.transform = `scale(1)`;
                                  }
                                  onMouseMove(event);
                                  setTimeout(() => {
                                    img.element.classList.add("zoom");
                                  }, 200);
                                  document.addEventListener("mouseup", onMouseUp);
                                  document.addEventListener("mousemove", onMouseMove);
                                }
                              }
                            }
                          }
                        }
                      ]
                    },
                    {
                      class: "details",
                      update: details => {
                        details.children = [
                          {
                            class: "details-header",
                            children: [
                              {
                                class: "button fr",
                                init: button => {
                                  tag: "span",
                                  button.element.onclick = event => {
                                    this.language = "fr";
                                    details.render();
                                  }
                                },
                                update: button => {
                                  button.element.classList.toggle("active", !this.language || this.language === "fr");
                                },
                                child: {
                                  tag: "span",
                                  update: span => {
                                    span.element.innerHTML = "Fr";
                                  }
                                }
                              },
                              {
                                class: "button en",
                                init: button => {
                                  button.element.onclick = event => {
                                    this.language = "en";
                                    details.render();
                                  }
                                },
                                update: button => {
                                  button.element.classList.toggle("active", this.language === "en");
                                },
                                child: {
                                  tag: "span",
                                  update: span => {
                                    span.element.innerHTML = "En";
                                  }
                                }
                              },
                              {
                                class: "button close",
                                init: button => {
                                  button.element.onclick = async event => {
                                    this.stopScreensaver();
                                    this.onPop({ // -> depop
                                      screenId: this.screenId
                                    });

                                    this.popupActive = false;
                                    await popup.render();

                                    // wait for animation...

                                    setTimeout(() => {
                                      this.currentSlide = null;
                                      popup.render();
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
                                class: "content",
                                children: [
                                  {
                                    class: "notes",
                                    children: [
                                      {
                                        class: "text",
                                        update: content => {
                                          content.element.innerHTML = item["note"+this.getSuffix()];
                                        }
                                      }
                                    ]
                                  }
                                ]
                              },
                              {
                                class: "gallery",
                                update: gallery => {
                                  gallery.element.classList.toggle("hidden", item.images.length <= 1);
                                  if (item.images.length > 1) {
                                    gallery.children = item.images.map(fileId => {
                                      return {
                                        class: "frame",
                                        update: async frame => {
                                          const file = await fetch("/get/files/"+fileId).then(response => response.json());
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
                                                      const medium = file.sizes.find(size => size.key === "medium");
                                                      const src = "/uploads/"+medium.filename;
                                                      if (!img.element.src.endsWith(src)) {
                                                        img.element.src = src;
                                                        img.element.onclick = event => {
                                                          // if (mediaId === fileId) {
                                                          //   mediaId = item.images[0];
                                                          //   this.onPop({
                                                          //     screenId: this.screenId,
                                                          //     mediaId: mediaId
                                                          //   });
                                                          // } else {
                                                            mediaId = fileId;
                                                            this.onPop({
                                                              screenId: this.screenId,
                                                              mediaId: mediaId
                                                            });
                                                          // }
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
                                                      },
                                                      // update: video => {
                                                      //
                                                      //   // video.element.src = "/uploads/"+file.filename;
                                                      //   // video.element.type = file.type;
                                                      //
                                                      //   // video.element.controls = true;
                                                      //   // video.element.onplay = event => {
                                                      //   //   this.onPop({
                                                      //   //     screenId: this.screenId,
                                                      //   //     mediaId: fileId,
                                                      //   //     currentTime: video.element.currentTime
                                                      //   //   });
                                                      //   // };
                                                      //   // video.element.onpause = event => {
                                                      //   //   const slide = this.player.getCurrent();
                                                      //   //   this.onPop({
                                                      //   //     screenId: this.screenId,
                                                      //   //     mediaId: fileId,
                                                      //   //     currentTime: video.element.currentTime,
                                                      //   //     playing: false
                                                      //   //   });
                                                      //   // };
                                                      // }
                                                      // child: {
                                                      //   tag: "source",
                                                      //   init: source => {
                                                      //     source.element.src = "/uploads/"+file.filename;
                                                      //     source.element.type = file.type;
                                                      //   }
                                                      // }
                                                    },
                                                    {
                                                      class: "video-play",
                                                      update: button => {
                                                        button.element.onclick = event => {
                                                          this.fullscreenItem = file;
                                                          this.renderOverlay();
                                                          this.onPop({
                                                            screenId: this.screenId,
                                                            mediaId: file.id,
                                                            currentTime: 0,
                                                            playing: false
                                                          });
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
        },
        {
          class: "overlay",
          init: overlay => {
            this.renderOverlay = overlay.render;
          },
          update: overlay => {
            let playing = false;
            overlay.element.classList.toggle("active", Boolean(this.overlayActive));

            console.log("overlay update", this.overlayActive, this.fullscreenItem);

            if (this.fullscreenItem) {
              const videoId = this.fullscreenItem.id;
              overlay.children = [{
                class: "overlay-content",
                children: [
                  {
                    class: "close",
                    init: close => {
                      close.element.onclick = async event => {
                        this.overlayActive = false;
                        await overlay.render();

                        // wait for animation...

                        setTimeout(() => {
                          this.fullscreenItem = null;
                          overlay.render();
                        }, 200);
                      }
                    },
                    child: {
                      tag: "span",
                      init: span => {
                        span.element.innerHTML = "X";
                      }
                    }
                  },
                  {
                    tag: "figure",
                    class: "video",
                    update: figure => {
                      figure.children = [
                        {
                          tag: "video",
                          init: video => {
                            video.element.src = "/uploads/"+this.fullscreenItem.filename;
                            video.element.type = this.fullscreenItem.type;

                            video.element.onloadeddata = event => {
                              if (!this.overlayActive) {
                                requestAnimationFrame(() => {
                                  console.log("video loaded");
                                  this.overlayActive = true;
                                  overlay.render();
                                });
                              }
                            }

                            video.element.onplay = event => {
                              this.onPop({
                                screenId: this.screenId,
                                mediaId: videoId,
                                currentTime: video.element.currentTime
                              });
                            };
                            video.element.onpause = event => {
                              const slide = this.player.getCurrent();
                              this.onPop({
                                screenId: this.screenId,
                                mediaId: videoId,
                                currentTime: video.element.currentTime,
                                playing: false
                              });
                            };
                          },
                          update: video => {
                            if (playing) {
                              video.element.play();
                            } else {
                              video.element.pause();
                            }
                          }
                        },
                        {
                          class: "video-play",
                          update: button => {
                            button.element.classList.toggle("playing", Boolean(playing));
                            button.element.onclick = event => {
                              playing = !playing;
                              figure.render();
                            }
                          },
                          child: {
                            class: "circle",
                            child: {
                              class: "triangle"
                            }
                          }
                        }
                      ];
                    }
                  }
                ]
              }];
            } else {
              overlay.children = [];
            }
          }
        }
      ]
    }
  }

}
