class Torches {

  static language;

  static screensaving = false;
  static currentScreenSaverIndex = 0;

  static svgCache = {};

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

  static build() {

    return {
      class: "torches",
      init: async div => {
        this.render = div.render;

        this.games = await fetch(`/query/games`).then(response => response.json());
        this.torches = await fetch(`/query/torches`).then(response => response.json());

        const torchFileIds = this.torches.reduce((ids, torch) => new Set([
          ...ids,
          ...torch.image,
          ...torch.relay.reduce((ids, relay) => [...ids, ...relay.media], []),
          ...torch.design.reduce((ids, design) => [...ids, ...design.media], []),
          ...torch.doyouknow.reduce((ids, doyouknow) => [...ids, ...doyouknow.media], [])
        ]), new Set());

        this.files = await fetch(`/query/files?ids=${[...torchFileIds].join(",")}`).then(response => response.json());

        this.filesDirectory = Object.fromEntries(this.files.filter(file => file && file.id).map(file => [file.id, file]));

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
            //                     img.element.src = "/uploads/" + file.filename;
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
                      child: {
                        update: language => {
                          language.element.textContent = this.language === "en" ? "Français" : "English";
                          language.element.onclick = event => {
                            this.player.stop();
                            this.language = this.language === "en" ? "fr" : "en";
                            this.renderContent();

                          }
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

                      },
                      {
                        class: "slideshow",
                        update: slideshow => {
                          // let currentSlide = 0;
                          // let nextSlide = 0;

                          slideshow.children = this.stories.map((story, index) => {
                            return {
                              class: "slide",
                              update: slide => {
                                const medias = story.medias || [];
                                this.currentMedia = 0;


                                let x = index - this.nextSlide;

                                while (x < -1) {
                                  x += this.stories.length;
                                }
                                while (x > this.stories.length - 2) {
                                  x -= this.stories.length;
                                }

                                // const n = this.stories.length;
                                // let x = ((index - this.nextSlide)%n + n)%n;

                                // slide.element.style.transform = `translate(${x*100}%, 0)`;
                                slide.element.style.opacity = x === 0 ? "1" : "0";
                                slide.element.style.zIndex = x === 0 ? "1" : "0";

                                slide.element.classList.toggle("hidden", x > 1);
                                slide.element.classList.toggle("current", x === 0);


                                if (x <= 1) {
                                  slide.children = [
                                    {
                                      class: "title",
                                      update: frame => {
                                        // frame.element.innerHTML = story.title || "";
                                        frame.element.innerHTML = this.translateObject(story, "title");
                                      }
                                    },
                                    {
                                      class: "main-frame",
                                      update: main => {
                                        const media = medias[this.currentMedia];
                                        const fileId = media.file && media.file[0];
                                        const file = fileId && this.filesDirectory[fileId];
                                        const isVideo = file && file.type.startsWith("video");
                                        main.element.classList.toggle("video-media", Boolean(isVideo));

                                        main.children = [
                                          {
                                            class: "info-frame",
                                            update: frame => {
                                              frame.element.classList.toggle("flip", story.showInfo === true);
                                              frame.children = [
                                                {
                                                  class: "pile",
                                                  children: [
                                                    {
                                                      class: "name",
                                                      init: div => {
                                                        div.element.innerHTML = `${story.firstname} ${story.lastname.toUpperCase()}`;
                                                      }
                                                    },
                                                    {
                                                      class: "content",
                                                      children: medias.map((media, mediaIndex) => {
                                                        return {
                                                          class: "media-body",
                                                          update: async div => {
                                                            // div.element.innerHTML = media.body || "";
                                                            div.element.innerHTML = this.translateObject(media, "body");
                                                            div.element.classList.toggle("active", this.currentMedia === mediaIndex);
                                                          }
                                                        }
                                                      })
                                                    },
                                                    {
                                                      class: "pile-footer",
                                                      child: {
                                                        class: "toggle-button",
                                                        init: button => {
                                                          button.element.onclick = event => {
                                                            story.showInfo = !story.showInfo;
                                                            frame.render();
                                                          }
                                                        },
                                                        child: {
                                                          init: div => {
                                                            div.element.textContent = "id";
                                                          }
                                                        }
                                                      }
                                                    }
                                                  ]
                                                },
                                                {
                                                  class: "face",
                                                  children: [
                                                    {
                                                      class: "info-header",
                                                      children: [
                                                        {
                                                          class: "country",
                                                          child: {
                                                            tag: "img",
                                                            init: async img => {
                                                              img.element.draggable = false;
                                                              const countryId = story.country && story.country[0];
                                                              const country = countryId && this.countries.find(country => country.id === countryId);
                                                              const fileId = country && country.image;
                                                              const file = fileId && this.filesDirectory[fileId];
                                                              if (file) {
                                                                img.element.src = "/uploads/" + file.filename;
                                                              }
                                                            }
                                                          }
                                                        },
                                                        {
                                                          class: "toggle-button",
                                                          init: button => {
                                                            button.element.onclick = event => {
                                                              story.showInfo = !story.showInfo;
                                                              frame.render();
                                                            }
                                                          },
                                                          child: {
                                                            init: button => {
                                                              button.element.textContent = "id";
                                                            }
                                                          }
                                                        }
                                                      ]
                                                    },
                                                    {
                                                      class: "info-body",
                                                      children: [
                                                        {
                                                          class: "sport",
                                                          update: sport => {
                                                            sport.element.classList.toggle("hidden", !story.sport || !story.sport.length);
                                                          },
                                                          children: [
                                                            {
                                                              class: "label",
                                                              init: label => {
                                                                label.element.textContent = "Sport";
                                                              }
                                                            },
                                                            {
                                                              class: "value",
                                                              update: async value => {
                                                                // const sport = await this.getSport(story);
                                                                // value.element.textContent = sport && sport.name || "";
                                                                // value.element.textContent = this.getSport(story);

                                                                const sportId = story.sport && story.sport[0];
                                                                const sport = sportId && this.sports.find(sport => sport.id === sportId);
                                                                value.element.textContent = sport && this.translateObject(sport, "name") || "";
                                                              }
                                                            }
                                                          ]
                                                        },
                                                        {
                                                          class: "nicknames",
                                                          update: sport => {
                                                            sport.element.classList.toggle("hidden", !story.nicknames);
                                                          },
                                                          children: [
                                                            {
                                                              class: "label",
                                                              update: label => {
                                                                // label.element.textContent = "Nicknames";
                                                                label.element.textContent = this.translate("Nicknames");
                                                              }
                                                            },
                                                            {
                                                              class: "value",
                                                              update: value => {
                                                                // value.element.textContent = story.nicknames || "";
                                                                value.element.innerHTML = this.translateObject(story, "nicknames");
                                                              }
                                                            }
                                                          ]
                                                        },
                                                        {
                                                          class: "games",
                                                          children: [
                                                            {
                                                              class: "games-header",
                                                              children: [
                                                                {
                                                                  class: "logo",
                                                                  // init: async logo => {
                                                                  //   logo.element.innerHTML = await fetch("/images/logo.svg").then(response => response.text());
                                                                  // }
                                                                  child: {
                                                                    tag: "img",
                                                                    init: img => {
                                                                      img.element.draggable = false;
                                                                      img.element.src = "images/Olympic_Rings_black.svg";
                                                                    }
                                                                  }
                                                                },
                                                                {
                                                                  class: "jeux",
                                                                  update: div => {
                                                                    // div.element.textContent = "jeux";
                                                                    div.element.textContent = this.translate("games");
                                                                  }
                                                                }
                                                              ]
                                                            },
                                                            {
                                                              class: "games-body",
                                                              child: {
                                                                class: "games-body-content",
                                                                children: [
                                                                  {
                                                                    tag: "ul",
                                                                    update: async ul => {
                                                                      const games = await this.groupGames(story);
                                                                      ul.children = games.map(game => {
                                                                        return {
                                                                          tag: "li",
                                                                          children: [
                                                                            {
                                                                              class: "medals",
                                                                              children: game.medals.map(medal => {
                                                                                return {
                                                                                  class: "medal",
                                                                                  update: div => {
                                                                                    const medals = {
                                                                                      "1": "gold",
                                                                                      "2": "silver",
                                                                                      "3": "bronze"
                                                                                    };
                                                                                    const medalName = medals[medal.medal];
                                                                                    div.element.classList.add(medalName);
                                                                                  },
                                                                                  children: [{class: "branch"}, {class: "branch"}, {class: "circle"}]
                                                                                };
                                                                              })
                                                                            },
                                                                            {
                                                                              class: "game",
                                                                              init: div => {
                                                                                div.element.innerHTML = `${game.city}, ${game.year}`;
                                                                              }
                                                                            },
                                                                            {
                                                                              class: "disciplines",
                                                                              tag: "ul",
                                                                              update: ul => {
                                                                                // div.element.innerHTML = Object.values(game.medalGroups).map(group => {
                                                                                //   return `${group.num} ${this.translate(this.medals[group.medal])} - ${group.disciplines.join(", ")}`
                                                                                // }).join("; ");

                                                                                ul.children = Object.values(game.medalGroups).map(nameGroup => {
                                                                                  return {
                                                                                    tag: "li",
                                                                                    children: [
                                                                                      {
                                                                                        class: "name",
                                                                                        update: name => {
                                                                                          name.element.innerHTML = nameGroup.name || "";
                                                                                          name.element.classList.toggle("hidden", !nameGroup.name);
                                                                                        }
                                                                                      },
                                                                                      {
                                                                                        tag: "ul",
                                                                                        children: Object.values(nameGroup.medals).map((group, index, array) => {
                                                                                          return {
                                                                                            tag: "li",
                                                                                            update: li => {
                                                                                              const num = (group.num > 1 || array.length > 1) && group.num || "";
                                                                                              li.element.innerHTML = `${num} ${this.translate(this.medals[group.medal])} - ${group.disciplines.join(", ")}`;
                                                                                            }
                                                                                          };
                                                                                        })
                                                                                      }
                                                                                    ]
                                                                                  }
                                                                                });
                                                                              }
                                                                            }
                                                                          ]
                                                                        }
                                                                      })
                                                                    }
                                                                  },
                                                                  {
                                                                    class: "gradient"
                                                                  }
                                                                ]
                                                              }
                                                            }
                                                          ]
                                                        }
                                                      ]
                                                    },
                                                    {
                                                      class: "info-flip",
                                                      child: {
                                                        class: "toggle-button",
                                                        // child: {
                                                        //
                                                        // },
                                                        init: async button => {
                                                          // button.element.innerHTML = await fetch("images/arrowClose.svg").then(response => response.text());
                                                          button.element.innerHTML = await this.fetchSvg("arrowClose.svg");
                                                          button.element.onclick = event => {
                                                            story.showInfo = !story.showInfo;
                                                            frame.render();
                                                          }
                                                        }
                                                      }
                                                    }
                                                  ]
                                                }
                                              ];
                                            }
                                          },
                                          {
                                            class: "media-frame",
                                            children: medias.map((media, mediaIndex) => {
                                              return {
                                                class: "media",
                                                update: async div => {

                                                  div.element.classList.toggle("active", this.currentMedia === mediaIndex);

                                                  const fileId = media.file && media.file[0];
                                                  const file = fileId && this.filesDirectory[fileId];

                                                  if (file && file.type.startsWith("image")) {
                                                    div.children = [
                                                      {
                                                        tag: "img",
                                                        init: img => {
                                                          img.element.draggable = false;
                                                        },
                                                        update: img => {
                                                          const size = file.sizes.find(size => size.key === "medium");
                                                          if (!img.element.src.endsWith(size.filename)) {
                                                            img.element.src = "/uploads/" + size.filename;
                                                          }
                                                        }
                                                      },
                                                      {
                                                        class: "caption",
                                                        child: {
                                                          update: caption => {
                                                            // caption.element.innerHTML = media.caption;
                                                            caption.element.innerHTML = this.translateObject(media, "caption");
                                                          }
                                                        }
                                                      }
                                                    ];
                                                  } else if (file && file.type.startsWith("video")) {
                                                    div.children = [
                                                      {
                                                        class: "video-container",
                                                        update: container => {
                                                          container.children = [
                                                            {
                                                              tag: "video",
                                                              init: video => {
                                                                // video.element.loop = true;
                                                                video.element.controls = false;

                                                                video.element.onended = event => {
                                                                  this.player.unload();
                                                                  this.currentMedia = 0;
                                                                  main.render();
                                                                }
                                                              },
                                                              update: video => {

                                                                video.element.onclick = event => {
                                                                  this.player.toggle();
                                                                  main.render();
                                                                };

                                                                video.child = {
                                                                  tag: "source",
                                                                  update: async source => {
                                                                    if (!source.element.src.endsWith(file.filename)) {
                                                                      source.element.type = file.type;
                                                                      source.element.src = "/uploads/" + file.filename;
                                                                    }
                                                                  }
                                                                };
                                                              },
                                                              complete: video => {
                                                                if (this.currentMedia === mediaIndex) {
                                                                  return this.player.load(video.element);
                                                                }
                                                              }
                                                            },
                                                            {
                                                              class: "video-timeline",
                                                              child: {
                                                                class: "line",
                                                                update: line => {
                                                                  if (this.currentMedia === mediaIndex) {
                                                                    this.player.onframe = line.render;
                                                                    line.element.style.transform = `scaleX(${this.player.progress})`;
                                                                  }
                                                                }
                                                              },
                                                              init: timeline => {
                                                                const start = clientX => {
                                                                  update(clientX);
                                                                }
                                                                const update = clientX => {
                                                                  const box = timeline.element.getBoundingClientRect();
                                                                  const progress = (clientX - box.left)/box.width;
                                                                  this.player.set(progress);
                                                                  timeline.render();
                                                                }
                                                                const end = clientX => {
                                                                  update(clientX);
                                                                }
                                                                if ('ontouchstart' in window) {
                                                                  const ontouchmove = event => {
                                                                    update(event.touches[0].clientX);
                                                                  }
                                                                  const ontouchend = event => {
                                                                    end(event.touches[0].clientX);
                                                                    document.removeEventListener("touchmove", ontouchmove);
                                                                    document.removeEventListener("touchend", ontouchend);
                                                                  }
                                                                  timeline.element.ontouchstart = event => {
                                                                    start(event.touches[0].clientX);
                                                                    document.addEventListener("touchmove", ontouchmove);
                                                                    document.addEventListener("touchend", ontouchend);
                                                                  }
                                                                } else {
                                                                  const onmousemove = event => {
                                                                    update(event.clientX);
                                                                  }
                                                                  const onmouseup = event => {
                                                                    end(event.clientX);
                                                                    document.removeEventListener("mousemove", onmousemove);
                                                                    document.removeEventListener("mouseup", onmouseup);
                                                                  }
                                                                  timeline.element.onmousedown = event => {
                                                                    start(event.clientX);
                                                                    document.addEventListener("mousemove", onmousemove);
                                                                    document.addEventListener("mouseup", onmouseup);
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          ];
                                                        }
                                                      },
                                                      {
                                                        class: "video-button",
                                                        init: async button => {
                                                          button.element.onclick = event => {
                                                            event.preventDefault();
                                                            this.player.toggle();
                                                            button.render();
                                                          };
                                                        },
                                                        update: async button => {
                                                          if (this.currentMedia === mediaIndex) {
                                                            if (this.player.isPlaying) {
                                                              button.element.innerHTML = await this.fetchSvg("pause.svg");
                                                            } else {
                                                              button.element.innerHTML = await this.fetchSvg("play.svg");
                                                            }
                                                          }
                                                        }
                                                      }
                                                    ];
                                                  }
                                                }
                                              }
                                            })
                                          },
                                          {
                                            class: "video-frame"
                                          },
                                          {
                                            class: "thumbs-frame",
                                            children: medias.map((media, mediaIndex) => {
                                              return {
                                                class: "thumb",
                                                init: async thumb => {
                                                  // const file = this.files.find(file => media.file && media.file.includes(file.id));
                                                  const fileId = media.file && media.file[0];
                                                  const file = fileId && this.filesDirectory[fileId];
                                                  if (file && file.type.startsWith("image")) {
                                                    thumb.child = {
                                                      tag: "img",
                                                      init: img => {
                                                        const size = file.sizes.find(size => size.key === "thumb");
                                                        img.element.src = "/uploads/" + size.filename;
                                                        img.element.draggable = false;
                                                      }
                                                    };
                                                  } else if (file && file.type.startsWith("video")) {
                                                    thumb.children = [
                                                      {
                                                        tag: "video",
                                                        init: video => {
                                                          video.child = {
                                                            tag: "source",
                                                            init: source => {
                                                              source.element.type = file.type;
                                                              source.element.src = "/uploads/" + file.filename;
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
                                                    ];
                                                  }
                                                },
                                                update: thumb => {
                                                  thumb.element.classList.toggle("active", this.currentMedia === mediaIndex);
                                                  thumb.element.onclick = async event => {
                                                    if (this.currentMedia !== mediaIndex) {
                                                      this.currentMedia = mediaIndex;

                                                      this.player.unload(); // -> player.video = null

                                                      await main.render(); // -> load video

                                                      if (this.player.video) {
                                                        this.player.play();
                                                        await main.render(); // -> render controls
                                                      }
                                                    }
                                                  }

                                                }
                                              }
                                            })
                                          }

                                        ];
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
                        class: "left-nav",
                        init: async nav => {
                          // nav.element.innerHTML = await fetch("images/arrowL.svg").then(response => response.text());
                          nav.element.innerHTML = await this.fetchSvg("arrowL.svg");
                        },
                        update: nav => {
                          nav.element.onclick = event => {
                            this.player.stop();
                            this.nextSlide--;
                            this.renderContent();
                          }
                          nav.element.onmousedown = event => {
                            body.element.classList.add("stretch");
                          }
                          nav.element.onmouseup = event => {
                            body.element.classList.remove("stretch");
                          }
                        }
                      },
                      {
                        class: "right-nav",
                        init: async nav => {
                          // nav.element.innerHTML = await fetch("images/arrowR.svg").then(response => response.text());
                          nav.element.innerHTML = await this.fetchSvg("arrowR.svg");
                        },
                        update: nav => {
                          nav.element.onclick = event => {
                            this.player.stop();
                            this.nextSlide++;
                            this.renderContent();
                          }
                          nav.element.onmousedown = event => {
                            body.element.classList.add("stretch");
                          }
                          nav.element.onmouseup = event => {
                            body.element.classList.remove("stretch");
                          }
                        }
                      }
                    ];
                  }
                },
                {
                  class: "pagination",
                  // child: {
                  //   class: "pagination",
                    update: pagination => {
                      pagination.children = this.stories.map((story, index) => {
                        return {
                          class: "pagination-thumb",
                          update: thumb => {

                            // const n = this.stories.length;
                            //
                            // let x = ((index - this.nextSlide)%n + n)%n - 6;

                            let x = index - this.nextSlide;

                            while (x < -6) {
                              x += this.stories.length;
                            }
                            while (x > this.stories.length - 7) {
                              x -= this.stories.length;
                            }

                            // thumb.element.classList.toggle("index-0", x === -4 || x === -5 || x === -6);
                            // thumb.element.classList.toggle("index-1", x === -3);
                            // thumb.element.classList.toggle("index-2", x === -2);
                            // thumb.element.classList.toggle("index-3", x === -1);
                            // thumb.element.classList.toggle("index-4", x === 0);
                            // thumb.element.classList.toggle("index-5", x === 1);
                            // thumb.element.classList.toggle("index-6", x === 2);
                            // thumb.element.classList.toggle("index-7", x === 3);
                            // thumb.element.classList.toggle("index-8", x === 4 || x === 5 || x === 6);

                            thumb.element.classList.toggle("index-0", x === -6);
                            thumb.element.classList.toggle("index-1", x === -5);
                            thumb.element.classList.toggle("index-2", x === -4);
                            thumb.element.classList.toggle("index-3", x === -3);
                            thumb.element.classList.toggle("index-4", x === -2);
                            thumb.element.classList.toggle("index-5", x === -1);
                            thumb.element.classList.toggle("index-6", x === 0);
                            thumb.element.classList.toggle("index-7", x === 1);
                            thumb.element.classList.toggle("index-8", x === 2);
                            thumb.element.classList.toggle("index-9", x === 3);
                            thumb.element.classList.toggle("index-10", x === 4);
                            thumb.element.classList.toggle("index-11", x === 5);
                            thumb.element.classList.toggle("index-12", x === 6);

                            // thumb.element.style.transform = `translate(${50+x*10}%, 0)`;
                            thumb.element.classList.toggle("hidden", x > 6);
                            thumb.element.classList.toggle("current", x === 0);

                            thumb.element.onclick = event => {
                              this.player.stop();
                              this.nextSlide = index;
                              this.renderContent();
                            }

                            if (x <= 4) {
                              thumb.child = {
                                tag: "img",
                                init: img => {
                                  img.element.draggable = false;

                                  const media = story.medias && story.medias[0];
                                  if (media) {
                                    // const file = this.files.find(file => media.file && media.file.includes(file.id));

                                    const fileId = media.file && media.file[0];
                                    const file = fileId && this.filesDirectory[fileId];

                                    if (file) {
                                      img.element.src = "/uploads/" + file.filename;
                                    }
                                  }
                                }
                              }
                            }
                          }

                        }
                      });
                    }
                  // }
                }
              ]
            }
          ];

      }
    };

  }


}
