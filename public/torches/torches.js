class Torches {

  static language;

  static screensaving = false;
  static currentScreenSaverIndex = 0;

  static svgCache = {};

  static x = 0;

  static player = new VideoPlayer();

  static screensaver = new Screensaver();

  static async fetchSvg(name) {
    if (!this.svgCache[name]) {
      this.svgCache[name] = fetch(`images/${name}`).then(response => response.text());
    }
    return this.svgCache[name];
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

        // this.files = await fetch(`/query/files?ids=${[...torchFileIds].join(",")}`).then(response => response.json());
        this.files = await fetch(`/query/files`).then(response => response.json());

        this.filesDirectory = Object.fromEntries(this.files.filter(file => file && file.id).map(file => [file.id, file]));

        this.options = await fetch(`/get/options/torches`).then(response => response.json()) || {};

        this.screensaver.timeout = this.options.screensavertimeout && this.options.screensavertimeout[0] || 3600;

        this.screensaver.onStart = () => {
          div.render();
        };

        this.screensaver.active = true;

        this.mainOptions = await fetch(`/get/options/main`).then(response => response.json()) || {};

        if (this.mainOptions.pointerthresold && this.mainOptions.pointerthresold[0]) {
          this.pointerThresold = Number(this.mainOptions.pointerthresold[0]);
        }

      },
      update: torches => {

        torches.children = [
          {
            class: "screensaver",
            update: screensaver => {

              // if (this.screensaver.active) {
              //   screensaver.element.classList.remove("hidden");
              //   document.body.offsetHeight; // -> force reflow
              //   screensaver.element.ontransitionend = event => {
              //     this.popupActive = false;
              //     this.currentSlide = null;
              //   };
              //   screensaver.element.classList.add("active");
              // } else {
              //   screensaver.element.classList.remove("active");
              //   screensaver.element.ontransitionend = event => screensaver.element.classList.add("hidden");
              // }

              screensaver.element.classList.remove("hidden");

              screensaver.element.classList.toggle("fadein", !!this.screensaver.active);
              screensaver.element.classList.toggle("fadeout", !this.screensaver.active);

              screensaver.element.onanimationend = event => {
                screensaver.element.classList.toggle("hidden", !this.screensaver.active);
              }

              screensaver.element.onpointerdown = event => {
                this.screensaver.stop();
                this.render();
              }

              const files = (this.options.screensaverfiles || []).map(fileId => this.filesDirectory[fileId]);
              const line1Fr = this.options.line1 && this.options.line1[0] || "Allumage de la flamme";
              const line2Fr = this.options.line2 && this.options.line2[0] || "Torches";
              const line3Fr = this.options.line3 && this.options.line3[0] || "Touchez l‘écran pour commencer";
              const line1En = this.options["line1-en"] && this.options["line1-en"][0] || line1Fr;
              const line2En = this.options["line2-en"] && this.options["line2-en"][0] || line2Fr;
              const line3En = this.options["line3-en"] && this.options["line3-en"][0] || line3Fr;

              screensaver.children = [
                {
                  class: "images",
                  children: files.map(file => {
                    return {
                      tag: "img",
                      init: img => {
                        img.element.draggable = false;
                        img.element.src = this.getFileURL(file.filename);
                      }
                    };
                  })
                },
                {
                  class: "lines",
                  children: [
                    {
                      class: "line line1 fr",
                      init: line => line.element.innerHTML = line1Fr
                    },
                    {
                      class: "line line2 fr",
                      init: line => line.element.innerHTML = line2Fr
                    },
                    {
                      class: "line line3 fr",
                      init: line => line.element.innerHTML = line3Fr
                    },
                    {
                      class: "line line1 en",
                      init: line => line.element.innerHTML = line1En
                    },
                    {
                      class: "line line2 en",
                      init: line => line.element.innerHTML = line2En
                    },
                    {
                      class: "line line3 en",
                      init: line => line.element.innerHTML = line3En
                    }
                  ]
                }
              ];
            }
          },
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
              content.children = [
                {
                  class: "header",
                  children: [
                    {
                      class: "language",
                      update: language => {
                        language.element.onpointerdown = event => {
                          this.screensaver.stop();
                          this.player.stop();
                          this.language = this.language === "en" ? "fr" : "en";
                          content.render();
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
                            new PointerTrap(slider.element, this.pointerThresold);
                            slider.element.oncatch = trap => {
                              this.screensaver.stop();
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
                                          // const medium = file.sizes.find(size => size.key === "medium");
                                          // if (medium) {
                                          //   // img.element.src = upload_url + medium.filename;
                                          //   img.element.src = this.getFileURL(medium.filename);
                                          //
                                          //   img.element.style.width = `${file.width*0.00085}em`;
                                          // }
                                          img.element.src = this.getFileURL(file.filename);
                                          img.element.style.width = `${file.width*0.00085}em`;
                                        }
                                      }
                                    }
                                  };
                                })
                              }
                            ];
                          }
                        }
                      },
                      {
                        class: "stage",
                        init: stage => {
                          new PointerTrap(stage.element, this.pointerThresold);
                          stage.element.oncatch = trap => {
                            this.screensaver.stop();
                            this.x += -(trap.deltaX || 0)/(stage.element.firstChild.clientWidth - stage.element.clientWidth);
                            this.x = Math.min(Math.max(this.x, 0), 1);
                            body.render();
                          }
                          stage.element.onrelease = (trap, event) => {
                            this.screensaver.stop();
                            event.preventDefault();
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
                                    new PointerTrap(li.element, this.pointerThresold);

                                  },
                                  update: li => {
                                    li.element.onrelease = (trap, event) => {
                                      this.screensaver.stop();
                                      if (event.button === 0 && Math.abs(trap.diffX) < 5) {
                                        this.currentTorch = torche;
                                        content.render();
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
                                          // const medium = file.sizes.find(size => size.key === "medium");
                                          // if (medium) {
                                          //   // img.element.src = upload_url + medium.filename;
                                          //   img.element.src = this.getFileURL(medium.filename);
                                          // }
                                          img.element.src = this.getFileURL(file.filename);
                                          // img.element.style.width = `${file.width*0.007}em`;
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
                                          // const medium = file.sizes.find(size => size.key === "medium");
                                          // if (medium) {
                                          //   img.element.src = this.getFileURL(medium.filename);
                                          // }
                                          // img.element.style.width = `${file.width*0.007}em`;
                                          img.element.src = this.getFileURL(file.filename);
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
                              child: {
                                class: "x",
                                init: x => {
                                  x.element.textContent = "X";
                                }
                              },
                              update: async close => {
                                close.element.onpointerdown = event => {
                                  this.screensaver.stop();
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
                                                                const size = file.sizes.find(size => size === "torches-media") || file;
                                                                if (!img.element.src.endsWith(size.filename)) {
                                                                  // img.element.src = upload_url + file.filename;
                                                                  img.element.src = this.getFileURL(size.filename);
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
                                                                  video.element.controls = false;
                                                                },
                                                                update: video => {

                                                                  video.element.onclick = event => {
                                                                    this.screensaver.stop();
                                                                    this.player.toggle();
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
                                                                      this.player.onframe = () => {
                                                                        line.render();
                                                                        this.screensaver.stop();
                                                                      }
                                                                      line.element.style.transform = `scaleX(${this.player.progress})`;
                                                                    }
                                                                  }
                                                                },
                                                                init: timeline => {
                                                                  const update = clientX => {
                                                                    const box = timeline.element.getBoundingClientRect();
                                                                    const progress = (clientX - box.left)/box.width;
                                                                    this.player.set(progress);
                                                                    timeline.render();
                                                                  }
                                                                  new PointerTrap(timeline.element, this.pointerThresold);
                                                                  timeline.element.onstart = trap => {
                                                                    this.screensaver.stop();
                                                                    update(trap.x);
                                                                  }
                                                                  timeline.element.oncatch = trap => {
                                                                    this.screensaver.stop();
                                                                    update(trap.x);
                                                                  }
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
                                                        this.screensaver.stop();
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
                                                                // const size = file.sizes.find(size => size.key === "thumb");
                                                                const size = file.sizes.find(size => size === "torches-thumb") || file;
                                                                image.child = {
                                                                  tag: "img",
                                                                  init: async img => {
                                                                    img.element.draggable = false;
                                                                  },
                                                                  update: async img => {
                                                                    if (!img.element.src.endsWith(size.filename)) {
                                                                      // img.element.src = upload_url + filename;
                                                                      img.element.src = this.getFileURL(size.filename);
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
                                          this.screensaver.stop();
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
                                          this.screensaver.stop();
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
              ];
            }
          }
        ];
      }
    };

  }


}
