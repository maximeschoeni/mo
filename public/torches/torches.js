class Torches {

  static language;

  static screensaving = false;
  static currentScreenSaverIndex = 0;

  static svgCache = {};

  static x = 0;

  static player = new VideoPlayer();

  static async fetchSvg(name) {
    if (!this.svgCache[name]) {
      this.svgCache[name] = fetch(`images/${name}`).then(response => response.text());
    }
    return this.svgCache[name];
  }

  static screensaverStop() {
    this.screensaving = false;
    if (this.screensaverTimer) {
      clearTimeout(this.screensaverTimer);
    }
    this.screensaverTimer = setTimeout(() => {
      this.screensaving = true;
      this.render();
    }, 60*60*1000);
  }

  static translate(word) {
    const key = this.language === "en" ? word+"-en" : word;
    return this.options.translation && this.options.translation[0] && this.options.translation[0][key] || word;
  }

  static translateObject(object, key) {
    if (this.language === "en") {
      return object[key+"-en"] || object[key] || "";
    }
    return object[key] || "";
  }

  static getFileURL(filename) {
    return "/uploads/" + filename;
    // return upload_url + filename;
    // if (filename.endsWith(".mp4")) {
    //   return "/uploads/microtechnique.mp4";
    // } else {
    //   return "/uploads/Montreal1976-medium.png";
    // }

  }



  static build() {

    return {
      class: "torches",
      init: async div => {
        this.render = div.render;

        this.games = await fetch(`/query/games`).then(response => response.json());

        this.gamesDirectory = Object.fromEntries(this.games.map(game => [game.id, game]));

        this.torches = await fetch(`/query/torches`).then(response => response.json());

        const torchFileIds = this.torches.reduce((ids, torch) => new Set([
          ...ids,
          ...(torch.image || []),
          ...(torch.relay || []).reduce((ids, relay) => [...ids, ...(relay.medias || [])], []),
          ...(torch.design || []).reduce((ids, design) => [...ids, ...(design.medias || [])], []),
          ...(torch.doyouknow || []).reduce((ids, doyouknow) => [...ids, ...(doyouknow.medias || [])], [])
        ]), new Set());

        // this.torches = [...this.torches, ...this.torches, ...this.torches, ...this.torches, ...this.torches, ...this.torches, ...this.torches, ...this.torches];

        this.files = await fetch(`/query/files?ids=${[...torchFileIds].join(",")}`).then(response => response.json());

        this.filesDirectory = Object.fromEntries(this.files.filter(file => file && file.id).map(file => [file.id, file]));

        this.options = await fetch(`/get/options/torches`).then(response => response.json());

      },
      update: torches => {

        torches.children = [
          // {
          //   class: "screensaver",
          //   update: async screensaver => {
          //     let currentLanguage = "fr";
          //     let currentIndex = 0;
          //     const fileIds = this.gameGroup.images || [];
          //     const files = fileIds.map(fileId => this.filesDirectory[fileId]);
          //
          //     screensaver.element.classList.toggle("show", Boolean(this.screensaving));
          //     screensaver.element.onclick = event => {
          //       // this.screensaving = false;
          //       event.preventDefault();
          //       this.screensaverStop();
          //       this.render();
          //     };
          //     screensaver.children = [
          //       {
          //         class: "slides",
          //         update: slides => {
          //
          //           if (this.screensaving) {
          //             currentIndex++;
          //             if (currentIndex >= files.length) {
          //               currentIndex = 0;
          //             }
          //             slides.children = files.map((file, index) => {
          //               return {
          //                 class: "slide",
          //                 child: {
          //                   tag: "img",
          //                   init: img => {
          //                     img.element.draggable = false;
          //                     img.element.src = upload_url + file.filename;
          //                   }
          //                 },
          //                 update: slide => {
          //                   const z = (files.length + currentIndex - index)%files.length;
          //                   slide.element.style.zIndex = z;
          //                   slide.element.classList.toggle("top", z === files.length-1);
          //                 }
          //               };
          //             });
          //             setTimeout(() => {
          //               slides.render();
          //             }, 3000);
          //           }
          //         }
          //       },
          //       {
          //         class: "text",
          //         update: text => {
          //           if (this.screensaving) {
          //             currentLanguage = currentLanguage === "en" ? "fr" : "en";
          //             text.children = ["en", "fr"].map(language => {
          //               return {
          //                 class: "content",
          //                 update: content => {
          //                   content.element.classList.toggle("show", language === currentLanguage);
          //                   const suffix = language === "en" ? "-en" : "";
          //                   content.children = [
          //                     {
          //                       class: "title",
          //                       update: div => {
          //                         div.element.innerHTML = this.options["title"+suffix] || "?";
          //                       }
          //                     },
          //                     {
          //                       class: "dates",
          //                       update: div => {
          //                         div.element.innerHTML = `${this.date1} - ${this.date2}`;
          //                       }
          //                     },
          //                     {
          //                       class: "screensaverline",
          //                       update: div => {
          //                         div.element.innerHTML = this.options["screensaverline"+suffix] || "?";
          //                       }
          //                     }
          //                   ]
          //
          //                 }
          //               }
          //             });
          //
          //             setTimeout(() => {
          //               text.render();
          //             }, 8000);
          //           }
          //         }
          //       }
          //     ];
          //   }
          // },

          {
            class: "content",
            update: content => {
              this.renderContent = content.render;
              // content.element.onmousedown = event => {
              //   this.screensaverStop();
              // };
              // content.element.ontouchdown = event => {
              //   this.screensaverStop();
              // };
            },
            children: [
              {
                class: "header",
                children: [
                  {
                    class: "language",
                    update: language => {
                      language.element.onpointerdown = event => {
                        this.player.stop();
                        this.language = this.language === "en" ? "fr" : "en";
                        this.renderContent();
                      }
                    },
                    child: {
                      update: language => {
                        language.element.textContent = this.language === "en" ? "Français" : "English";
                      }
                    }
                  }
                ]
              },
              {
                class: "body",
                update: body => {
                  body.children = [
                    {
                      class: "background"
                    },
                    {
                      class: "foreground left"
                    },
                    {
                      class: "foreground right"
                    },
                    {
                      class: "miniature",
                      child: {
                        class: "slider",
                        init: slider => {
                          new PointerTrap(slider.element);
                          slider.element.oncatch = trap => {
                            const box = slider.element.getBoundingClientRect();
                          	const x = trap.x - box.left;
                            this.x = (x-slider.element.firstChild.clientWidth/2)/(box.width-slider.element.firstChild.clientWidth);
                            this.x = Math.min(Math.max(this.x, 0), 1);
                            body.render();
                          }
                        },
                        update: slider => {
                          slider.children = [
                            {
                              class: "screen",
                              update: screen => {
                                const x = this.x*(slider.element.clientWidth - screen.element.clientWidth);
                                screen.element.style.transform = `translateX(${x}px)`;
                              }
                            },
                            {
                              tag: "ul",
                              // init: ul => {
                              //   new PointerTrap(ul.element);
                              //   ul.element.oncatch = trap => {
                              //     const box = ul.element.getBoundingClientRect();
                              //   	const x = trap.x - box.left;
                              //     this.x = x/box.width;
                              //     body.render();
                              //   }
                              // },
                              children: this.torches.map(torche => {
                                return {
                                  tag: "li",
                                  child: {
                                    tag: "img",
                                    init: async img => {
                                      img.element.draggable = false;
                                      const [fileId] = torche.image;
                                      const file = this.filesDirectory[fileId];
                                      if (file) {
                                        const medium = file.sizes.find(size => size.key === "medium");
                                        if (medium) {
                                          // img.element.src = upload_url + medium.filename;
                                          img.element.src = this.getFileURL(medium.filename);

                                          img.element.style.width = `${file.width*0.00085}em`;
                                        }
                                      }
                                    }
                                  }
                                };
                              })
                            }

                            // {
                            //   class: "screen",
                            //   update: screen => {
                            //     const x = this.x*(miniature.element.clientWidth - screen.element.clientWidth);
                            //     screen.element.style.transform = `translateX(${x}px)`;
                            //   }
                            // }
                          ];
                        }
                      }
                    },
                    {
                      class: "stage",
                      init: stage => {
                        new PointerTrap(stage.element);
                        stage.element.oncatch = trap => {
                          this.x += -(trap.deltaX || 0)/(stage.element.firstChild.clientWidth - stage.element.clientWidth);
                          this.x = Math.min(Math.max(this.x, 0), 1);
                          body.render();
                        }
                        stage.element.onrelease = (trap, event) => {
                          event.preventDefault();
                          // event.stopPropagation();

                          // let speed = -trap.tDeltaX/(stage.element.firstChild.clientWidth - stage.element.clientWidth)*0.1;
                          // const slide = () => {
                          //   if (Math.abs(speed) > 0.0001) {
                          //     this.x += speed;
                          //     if (this.x < 0) {
                          //       this.x = 0;
                          //     } else if (this.x > 1) {
                          //       this.x = 1;
                          //     } else {
                          //       requestAnimationFrame(() => {
                          //         speed = speed*0.95;
                          //         slide();
                          //         body.render();
                          //       });
                          //     }
                          //   }
                          // };
                          // slide();
                        }
                      },
                      update: stage => {
                        stage.children = [
                          {
                            tag: "ul",
                            update: ul => {
                              const x = -this.x*(ul.element.clientWidth - stage.element.clientWidth);
                              ul.element.style.transform = `translateX(${x}px)`;
                            },
                            children: this.torches.map(torche => {
                              return {
                                tag: "li",
                                init: li => {
                                  new PointerTrap(li.element);

                                },
                                update: li => {
                                  li.element.onrelease = (trap, event) => {
                                    if (event.button === 0 && Math.abs(trap.diffX) < 5) {
                                      this.currentTorch = torche;
                                      torches.render();
                                    }
                                  }
                                },
                                children: [
                                  {
                                    tag: "img",
                                    init: async img => {
                                      img.element.draggable = false;
                                      const [fileId] = torche.image;
                                      const file = this.filesDirectory[fileId];
                                      if (file) {
                                        const medium = file.sizes.find(size => size.key === "medium");
                                        if (medium) {
                                          // img.element.src = upload_url + medium.filename;
                                          img.element.src = this.getFileURL(medium.filename);
                                        }
                                        img.element.style.width = `${file.width*0.007}em`;
                                      }
                                    }
                                  },
                                  {
                                    tag: "img",
                                    class: "mirror",
                                    init: async img => {
                                      img.element.draggable = false;
                                      const [fileId] = torche.image;
                                      const file = this.filesDirectory[fileId];
                                      if (file) {
                                        const medium = file.sizes.find(size => size.key === "medium");
                                        if (medium) {
                                          // img.element.src = upload_url + medium.filename;
                                          img.element.src = this.getFileURL(medium.filename);
                                        }
                                        img.element.style.width = `${file.width*0.007}em`;
                                      }
                                    }
                                  },
                                  {
                                    class: "caption",
                                    children: [
                                      {
                                        class: "city",
                                        update: city => {
                                          const game = this.gamesDirectory[torche.game] || {};
                                          // city.element.innerHTML = game.city || "";
                                          city.element.innerHTML = this.translateObject(game, "city");
                                        }
                                      },
                                      {
                                        class: "year",
                                        init: year => {
                                          const game = this.gamesDirectory[torche.game] || {};
                                          year.element.innerHTML = game.year || "";
                                        }
                                      }
                                    ]
                                  }
                                ]
                              };
                            })
                          }
                        ];
                      }
                    }
                  ];
                }
              },
              {
                class: "popup",
                complete: popup => {
                  popup.element.ontransitionend = null;
                  if (this.currentTorch) {
                    popup.element.style.opacity = 1;
                  }
                },
                update: popup => {
                  popup.element.classList.toggle("hidden", !this.currentTorch);
                  popup.children = [
                    {
                      class: "popup-background"
                    },
                    {
                      class: "popup-content",
                      update: content => {
                        this.currentMedia = 0;

                        content.children = [
                          {
                            class: "close",
                            update: async close => {
                              close.element.innerHTML = await this.fetchSvg("arrowClose.svg");
                              close.element.onpointerdown = event => {
                                this.player.unload();
                                this.currentTorch = null;
                                popup.element.style.opacity = 0;
                                popup.element.ontransitionend = event => {
                                  popup.render();
                                }
                              }
                            }
                          },
                          {
                            class: "page",
                            children: [
                              {
                                class: "page-header",
                                children: [
                                  {
                                    class: "city",
                                    update: city => {
                                      if (this.currentTorch) {
                                        const game = this.gamesDirectory[this.currentTorch.game] || {};
                                        // city.element.innerHTML = game.city || "";
                                        city.element.innerHTML = this.translateObject(game, "city");
                                      }
                                    }
                                  },
                                  {
                                    class: "year",
                                    update: year => {
                                      if (this.currentTorch) {
                                        const game = this.gamesDirectory[this.currentTorch.game] || {};
                                        year.element.innerHTML = game.year || "";
                                      }
                                    }
                                  }
                                ]
                              },
                              {
                                class: "page-body",
                                update: body => {
                                  if (this.currentTorch) {
                                    // const section = this.currentTorch[this.currentSection || "relay"];
                                    // const media = section && section[this.currentMedia || 0];

                                    body.children = ["relay", "design", "doyouknow"].filter(sectionItem => this.currentTorch[sectionItem]).map(sectionItem => {
                                      return {
                                        class: "section",
                                        update: sectionNode => {
                                          const section = this.currentTorch[sectionItem];
                                          const media = section && section[this.currentMedia || 0];

                                          sectionNode.element.classList.toggle("active", (this.currentSection || "relay") === sectionItem);
                                          sectionNode.children = [
                                            {
                                              class: "text",
                                              children: [
                                                {
                                                  class: "title",
                                                  update: title => {
                                                    if (media) {
                                                      title.element.innerHTML = this.translateObject(media, "title");
                                                    }
                                                  }
                                                },
                                                {
                                                  class: "content",
                                                  update: content => {
                                                    if (media) {
                                                      content.element.innerHTML = this.translateObject(media, "content");
                                                    }
                                                  }
                                                }
                                              ]
                                            },
                                            {
                                              class: "medias-container",
                                              children: (section || []).map((mediaItem, index) => {
                                                return {
                                                  class: "media",
                                                  update: media => {
                                                    media.element.classList.toggle("active", (this.currentMedia || 0) === index);
                                                  },
                                                  children: [
                                                    {
                                                      class: "image",
                                                      update: image => {
                                                        const [fileId] = mediaItem.medias;
                                                        const file = this.filesDirectory[fileId];
                                                        const isImage = file && file.type.startsWith("image");
                                                        image.element.classList.toggle("hidden", !isImage);
                                                        if (isImage) {
                                                          image.child = {
                                                            tag: "img",
                                                            init: async img => {
                                                              img.element.draggable = false;
                                                            },
                                                            update: async img => {
                                                              if (!img.element.src.endsWith(file.filename)) {
                                                                // img.element.src = upload_url + file.filename;
                                                                img.element.src = this.getFileURL(file.filename);
                                                              }
                                                            }
                                                          };
                                                        }
                                                      }
                                                    },
                                                    {
                                                      class: "video",
                                                      update: container => {
                                                        const [fileId] = mediaItem.medias;
                                                        const file = this.filesDirectory[fileId];
                                                        const isVideo = file && file.type.startsWith("video");
                                                        container.element.classList.toggle("hidden", !isVideo);

                                                        if (isVideo) {
                                                          container.children = [
                                                            {
                                                              tag: "video",
                                                              init: video => {
                                                                // video.element.loop = true;
                                                                video.element.controls = false;

                                                                // video.element.onended = event => {
                                                                //   this.player.unload();
                                                                //   this.currentMedia = 0;
                                                                //   main.render();
                                                                // }
                                                              },
                                                              update: video => {

                                                                video.element.onclick = event => {
                                                                  this.player.toggle();
                                                                  // container.render();
                                                                };

                                                                video.child = {
                                                                  tag: "source",
                                                                  update: async source => {
                                                                    if (!source.element.src.endsWith(file.filename)) {
                                                                      source.element.type = file.type;

                                                                      source.element.src = this.getFileURL(file.filename);
                                                                    }
                                                                  }
                                                                };
                                                              },
                                                              complete: async video => {
                                                                // if (this.currentMedia === mediaIndex) {
                                                                //   return this.player.load(video.element);
                                                                // }

                                                                if ((this.currentSection || "relay") === sectionItem && (this.currentMedia || 0) === index) {
                                                                  await this.player.load(video.element);
                                                                  this.player.play();
                                                                }
                                                              }
                                                            },
                                                            {
                                                              class: "video-timeline",
                                                              child: {
                                                                class: "line",
                                                                update: line => {
                                                                  if ((this.currentSection || "relay") === sectionItem && (this.currentMedia || 0) === index) {
                                                                    this.player.onframe = line.render;
                                                                    line.element.style.transform = `scaleX(${this.player.progress})`;
                                                                  }
                                                                }
                                                              },
                                                              init: timeline => {
                                                                // const start = clientX => {
                                                                //   update(clientX);
                                                                // }
                                                                const update = clientX => {
                                                                  const box = timeline.element.getBoundingClientRect();
                                                                  const progress = (clientX - box.left)/box.width;
                                                                  this.player.set(progress);
                                                                  timeline.render();
                                                                }
                                                                // const end = clientX => {
                                                                //   update(clientX);
                                                                // }
                                                                new PointerTrap(timeline.element);
                                                                timeline.element.onstart = trap => {
                                                                  update(trap.x);
                                                                }
                                                                timeline.element.oncatch = trap => {
                                                                  update(trap.x);
                                                                }


                                                                // if ('ontouchstart' in window) {
                                                                //   const ontouchmove = event => {
                                                                //     update(event.touches[0].clientX);
                                                                //   }
                                                                //   const ontouchend = event => {
                                                                //     end(event.touches[0].clientX);
                                                                //     document.removeEventListener("touchmove", ontouchmove);
                                                                //     document.removeEventListener("touchend", ontouchend);
                                                                //   }
                                                                //   timeline.element.ontouchstart = event => {
                                                                //     start(event.touches[0].clientX);
                                                                //     document.addEventListener("touchmove", ontouchmove);
                                                                //     document.addEventListener("touchend", ontouchend);
                                                                //   }
                                                                // } else {
                                                                //   const onmousemove = event => {
                                                                //     update(event.clientX);
                                                                //   }
                                                                //   const onmouseup = event => {
                                                                //     end(event.clientX);
                                                                //     document.removeEventListener("mousemove", onmousemove);
                                                                //     document.removeEventListener("mouseup", onmouseup);
                                                                //   }
                                                                //   timeline.element.onmousedown = event => {
                                                                //     start(event.clientX);
                                                                //     document.addEventListener("mousemove", onmousemove);
                                                                //     document.addEventListener("mouseup", onmouseup);
                                                                //   }
                                                                // }
                                                              }
                                                            }
                                                          ];
                                                        }
                                                      }
                                                    }
                                                  ]
                                                };
                                              })
                                            },
                                            {
                                              class: "nav",
                                              children: (section || []).map((mediaItem, index) => {
                                                return {
                                                  class: "media",
                                                  update: mediaContainer => {
                                                    const [fileId] = mediaItem.medias;
                                                    const file = fileId && this.filesDirectory[fileId];
                                                    mediaContainer.element.onpointerdown = event => {
                                                      this.currentMedia = index;
                                                      // this.player.unload();
                                                      this.player.stop();
                                                      sectionNode.render();
                                                    };
                                                    if (file) {
                                                      mediaContainer.children = [
                                                        {
                                                          class: "image",
                                                          update: image => {
                                                            const isImage = file.type.startsWith("image");
                                                            image.element.classList.toggle("hidden", !isImage);
                                                            if (isImage) {
                                                              const size = file.sizes.find(size => size.key === "thumb");
                                                              image.child = {
                                                                tag: "img",
                                                                init: async img => {
                                                                  img.element.draggable = false;
                                                                },
                                                                update: async img => {
                                                                  const filename = size.filename || file.filename;
                                                                  if (!img.element.src.endsWith(filename)) {
                                                                    // img.element.src = upload_url + filename;
                                                                    img.element.src = this.getFileURL(filename);
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        },
                                                        {
                                                          class: "video",
                                                          update: video => {
                                                            const isVideo = file.type.startsWith("video");
                                                            if (isVideo) {
                                                              video.children = [
                                                                {
                                                                  tag: "video",
                                                                  update: video => {
                                                                    video.child = {
                                                                      tag: "source",
                                                                      update: source => {
                                                                        if (!source.element.src.endsWith(file.filename)) {
                                                                          source.element.type = file.type;
                                                                          // source.element.src = upload_url + file.filename;
                                                                          source.element.src = this.getFileURL(file.filename);
                                                                        }
                                                                      }
                                                                    }
                                                                  },
                                                                  complete: async video => {
                                                                    const player = new VideoPlayer();
                                                                    await player.load(video.element);
                                                                    player.set(0.5);
                                                                  }
                                                                },
                                                                {
                                                                  class: "play-icon",
                                                                  init: async button => {
                                                                    button.element.innerHTML = await this.fetchSvg("play.svg");
                                                                  }
                                                                }
                                                              ]
                                                            }
                                                          }
                                                        }
                                                      ];
                                                    }
                                                  }
                                                }
                                              })
                                            }
                                          ];
                                        }
                                      }
                                    });
                                  }
                                }
                              },
                              {
                                class: "page-footer",
                                children: [
                                  {
                                    class: "button relay",
                                    update: button => {
                                      button.element.classList.toggle("active", !this.currentSection || this.currentSection === "relay");
                                      button.element.innerHTML = this.translate("Relais de la torche");
                                      button.element.onpointerdown = event => {
                                        this.currentSection = "relay";
                                        this.player.stop();
                                        content.render();
                                      }
                                    }
                                  },
                                  {
                                    class: "button design",
                                    update: button => {
                                      button.element.classList.toggle("active", this.currentSection === "design");
                                      button.element.innerHTML = this.translate("Conception");
                                      button.element.onpointerdown = event => {
                                        this.currentSection = "design";
                                        this.player.stop();
                                        content.render();
                                      }
                                    }
                                  },
                                  {
                                    class: "button doyouknow",
                                    update: button => {
                                      button.element.classList.toggle("active", this.currentSection === "doyouknow");
                                      button.element.innerHTML = this.translate("Le saviez-vous?");
                                      button.element.onpointerdown = event => {
                                        this.currentSection = "doyouknow";
                                        this.player.stop();
                                        content.render();
                                      }
                                    }
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
              }
            ]
          }
        ];
      }
    };

  }


}
