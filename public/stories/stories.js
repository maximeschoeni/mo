class Stories {

  static language;

  static words = {};
  static stories = [];
  static files = [];
  static countryFiles = [];

  static nextSlide = 0;
  // static showInfo = false;

  static screensaving = true;
  static currentScreenSaverIndex = 0;

  static seasons = {
    "1": "Summer",
    "2": "Winter"
  };

  static medals = {
    "1": "Gold",
    "2": "Silver",
    "3": "Bronze"
  }

  static player = new VideoPlayer();

  static svgCache = {};

  static async fetchSvg(name) {
    if (!this.svgCache[name]) {
      this.svgCache[name] = fetch(`images/${name}`).then(response => response.text());
    }
    return this.svgCache[name];
  }

  static screensaverStop() {
    this.screensaving = false;
    const timeout = Number(this.options && this.options.screensavertimeout && this.options.screensavertimeout[0] || 3600);
    if (this.screensaverTimer) {
      clearTimeout(this.screensaverTimer);
    }
    this.screensaverTimer = setTimeout(() => {
      this.screensaving = true;
      this.render();
    }, timeout*1000);
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

  static async groupGames(story) {
    const items = story.games || [];
    const object = items.reduce((games, item) => {
      if (item.game && item.game[0]) {
        const gameId = item.game[0];
        const game = this.games.find(game => game.id === gameId);
        games[gameId] ||= {medals: [], ...game};
        if (item.medal) {
          games[gameId].medals.push(item);
        }
      }
      return games;
    }, {});

    const games = Object.values(object);

    games.forEach(game => {
      game.medals.sort((a, b) => {
        if (a.name < b.name) return -1;
        else if (a.name > b.name) return 1;

        if (a.medal < b.medal) return -1;
        else if (a.medal > b.medal) return 1;
        else return 0;
      });
      game.medalGroups = game.medals.reduce((object, medal) => {
        object[medal.name || ""] ||= {name: medal.name || "", medals: {}};
        object[medal.name || ""].medals[medal.medal] ||= {medal: medal.medal, num: 0, disciplines: []};
        object[medal.name || ""].medals[medal.medal].num++;
        // object[medal.medal].disciplines.push(medal.discipline);
        object[medal.name || ""].medals[medal.medal].disciplines.push(this.translateObject(medal, "discipline"));
        return object;
      }, {});
    });

    games.sort((a, b) => {
      if (a.year < b.year) return -1;
      else if (a.year > b.year) return 1;
      else return 0;
    });

    return games;
  }

  static build() {

    return {
      class: "stories",
      init: async div => {
        this.render = div.render;



        this.gameGroups = await fetch(`/query/gameGroups`).then(response => response.json());

        // const screensaverFileIds = this.gameGroups.reduce((ids, group) => [...ids, ...(group.images || [])], []);


        const [season, date1, date2] = location.hash.slice(1).split("-");
        const seasonId = season === "summer" ? "1" : "2";

        this.gameGroup = this.gameGroups && this.gameGroups.find(group => group.season === seasonId && group.date1 === date1 && group.date2 === date2);

        if (this.gameGroup) {

          div.element.classList.add(season);
          this.date1 = date1;
          this.date2 = date2;

          const stories = await fetch(`/query/stories?gameGroup=${this.gameGroup.id}`).then(response => response.json());

          this.stories = [];

          while (stories.length && this.stories.length < 13) {

            this.stories = [...this.stories, ...stories];

          }

          this.games = await fetch(`/query/games`).then(response => response.json());

          this.sports = await fetch(`/query/sports`).then(response => response.json());

          this.sportsDirectory = Object.fromEntries(this.sports.map(sport => [sport.id, sport]));


          this.countries = await fetch(`/query/countries`).then(response => response.json());

          this.countriesDirectory = Object.fromEntries(this.countries.map(country => [country.id, country]));

          this.options = await fetch(`/get/options/stories`).then(response => response.json());

          this.files = await fetch(`/query/files`).then(response => response.json());

          this.filesDirectory = Object.fromEntries(this.files.filter(file => file && file.id).map(file => [file.id, file]));

          this.mainOptions = await fetch(`/get/options/main`).then(response => response.json()) || {};

          if (this.mainOptions.pointerthresold && this.mainOptions.pointerthresold[0]) {
            this.pointerThresold = Number(this.mainOptions.pointerthresold[0]);
          }

        }

      },
      update: stories => {
        if (this.gameGroup) {
          stories.children = [
            {
              class: "screensaver",
              update: async screensaver => {
                let currentLanguage = "fr";
                let currentIndex = 0;
                const fileIds = this.gameGroup.images || [];
                const files = fileIds.map(fileId => this.filesDirectory[fileId]);

                screensaver.element.classList.toggle("show", Boolean(this.screensaving));
                screensaver.element.onpointerdown = event => {
                  // this.screensaving = false;
                  event.preventDefault();
                  this.screensaverStop();
                  this.render();
                };
                screensaver.children = [
                  {
                    class: "slides",
                    update: slides => {

                      if (this.screensaving) {
                        currentIndex++;
                        if (currentIndex >= files.length) {
                          currentIndex = 0;
                        }
                        slides.children = files.map((file, index) => {
                          return {
                            class: "slide",
                            child: {
                              tag: "img",
                              init: img => {
                                img.element.draggable = false;
                                const size = file.sizes.find(size => size.key === "full-screen") || file;
                                img.element.src = "/uploads/" + size.filename;
                              }
                            },
                            update: slide => {
                              const z = (files.length + currentIndex - index)%files.length;
                              slide.element.style.zIndex = z;
                              slide.element.classList.toggle("top", z === files.length-1);
                            }
                          };
                        });
                        setTimeout(() => {
                          slides.render();
                        }, 3000);
                      }
                    }
                  },
                  {
                    class: "text",
                    update: text => {
                      if (this.screensaving) {
                        currentLanguage = currentLanguage === "en" ? "fr" : "en";
                        text.children = ["en", "fr"].map(language => {
                          return {
                            class: "content",
                            update: content => {
                              content.element.classList.toggle("show", language === currentLanguage);
                              const suffix = language === "en" ? "-en" : "";
                              content.children = [
                                {
                                  class: "title",
                                  update: div => {
                                    div.element.innerHTML = this.options["title"+suffix] || "?";
                                  }
                                },
                                {
                                  class: "dates",
                                  update: div => {
                                    div.element.innerHTML = `${this.date1} - ${this.date2}`;
                                  }
                                },
                                {
                                  class: "screensaverline",
                                  update: div => {
                                    div.element.innerHTML = this.options["screensaverline"+suffix] || "?";
                                  }
                                }
                              ]

                            }
                          }
                        });

                        setTimeout(() => {
                          text.render();
                        }, 8000);
                      }
                    }
                  }
                ];
              }
            },
            {
              class: "content",
              update: content => {
                this.renderContent = content.render;
                content.element.onmousedown = event => {
                  this.screensaverStop();
                };
                content.element.ontouchdown = event => {
                  this.screensaverStop();
                };


              },
              children: [
                {
                  class: "header",
                  children: [
                    {
                      class: "title",
                      children: [
                        {
                          class: "big",
                          update: div => {
                            div.element.innerHTML = this.date1;
                          }
                        },
                        {
                          class: "small",
                          update: div => {
                            div.element.innerHTML = `${this.date1} - ${this.date2}`;
                          }
                        },
                        {
                          class: "big",
                          update: div => {
                            div.element.innerHTML = this.date2;
                          }
                        }
                      ]
                    },
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
                                                          init: div => {
                                                            new PointerTrap(div.element, this.pointerThresold);
                                                            div.element.oncatch = (trap, event) => {
                                                              event.preventDefault();
                                                              div.element.scrollTop -= trap.deltaY;
                                                            }
                                                          },
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
                                                          button.element.onpointerdown = event => {
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
                                                          children: (story.country || []).map(countryId => this.countriesDirectory[countryId]).filter(country => country).map(country => {
                                                            return {
                                                              tag: "img",
                                                              init: async img => {
                                                                img.element.draggable = false;
                                                                const file = country.image && this.filesDirectory[country.image];
                                                                if (file) {
                                                                  const size = file.sizes.find(size => size.key === "stories-country") || file;
                                                                  img.element.src = "/uploads/" + size.filename;
                                                                }
                                                              }
                                                            };
                                                          })
                                                        },
                                                        {
                                                          class: "toggle-button",
                                                          init: button => {
                                                            button.element.onpointerdown = event => {
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
                                                              update: label => {
                                                                label.element.textContent = this.translate("Sport");
                                                              }
                                                            },
                                                            {
                                                              class: "value",
                                                              update: async value => {
                                                                value.element.textContent = (story.sport || []).map(sportId => this.sportsDirectory[sportId]).filter(sport => sport).map(sport => this.translateObject(sport, "name")).join(", ");
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
                                                                label.element.textContent = this.translate("Nicknames");
                                                              }
                                                            },
                                                            {
                                                              class: "value",
                                                              update: value => {
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
                                                                    class: "medals-list",
                                                                    init: div => {
                                                                      new PointerTrap(div.element, this.pointerThresold);
                                                                      div.element.oncatch = (trap, event) => {
                                                                        event.preventDefault();
                                                                        div.element.scrollTop -= trap.deltaY;
                                                                      }
                                                                    },
                                                                    update: async ul => {
                                                                      const games = await this.groupGames(story);
                                                                      ul.children = games.map(game => {
                                                                        return {
                                                                          tag: "li",
                                                                          children: [
                                                                            {
                                                                              class: "medals",
                                                                              update: medals => {
                                                                                medals.element.classList.toggle("hidden", game.medals.length === 0);
                                                                              },
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
                                                                              update: div => {
                                                                                div.element.innerHTML = `${this.translateObject(game, "city")}, ${game.year}`;
                                                                              }
                                                                            },
                                                                            {
                                                                              class: "disciplines",
                                                                              tag: "ul",
                                                                              update: ul => {
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
                                                                  // {
                                                                  //   class: "scroller",
                                                                  //   init: div => {
                                                                  //     new PointerTrap(div.element, this.pointerThresold);
                                                                  //     div.element.onmousedown = event => {
                                                                  //       console.log("onmousedown");
                                                                  //     }
                                                                  //     div.element.oncatch = (trap, event) => {
                                                                  //       event.preventDefault();
                                                                  //       div.element.previousElementSibling.scrollTop -= trap.deltaY;
                                                                  //     }
                                                                  //   },
                                                                  // },
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
                                                        init: async button => {
                                                          button.element.innerHTML = await this.fetchSvg("arrowClose.svg");
                                                          button.element.onpointerdown = event => {
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
                                                          const size = file.sizes.find(size => size.key === "stories-media") || file;
                                                          if (!img.element.src.endsWith(size.filename)) {
                                                            img.element.src = "/uploads/" + size.filename;
                                                          }
                                                        }
                                                      },
                                                      {
                                                        class: "caption",
                                                        update: caption => {
                                                          caption.element.classList.toggle("hidden", !media.caption);
                                                        },
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
                                                                video.element.controls = false;

                                                                video.element.onended = event => {
                                                                  this.player.unload();
                                                                  this.currentMedia = 0;
                                                                  main.render();
                                                                }
                                                              },
                                                              update: video => {

                                                                video.element.onpointerdown = event => {
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
                                                          button.element.onpointerdown = event => {
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
                                                        const size = file.sizes.find(size => size.key === "stories-thumb") || file;
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
                                                  thumb.element.onpointerdown = async event => {
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
                          nav.element.onpointerdown = event => {
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
                          nav.element.innerHTML = await this.fetchSvg("arrowR.svg");
                        },
                        update: nav => {
                          nav.element.onpointerdown = event => {
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
                  update: pagination => {
                    pagination.children = this.stories.map((story, index) => {
                      return {
                        class: "pagination-thumb",
                        update: thumb => {

                          let x = index - this.nextSlide;

                          while (x < -6) {
                            x += this.stories.length;
                          }
                          while (x > this.stories.length - 7) {
                            x -= this.stories.length;
                          }

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

                          thumb.element.onpointerdown = event => {
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

                                  const fileId = media.file && media.file[0];
                                  const file = fileId && this.filesDirectory[fileId];

                                  if (file) {
                                    const size = file.sizes.find(size => size.key === "stories-thumb") || file;
                                    img.element.src = "/uploads/" + size.filename;
                                  }
                                }
                              }
                            }
                          }
                        }

                      }
                    });
                  }
                },
                {
                  class: "footer-animation",
                  update: animation => {
                    animation.children = [];
                    for (let i = 0; i < 20; i++) {
                      animation.children.push({
                        class: "line"
                      });
                    }
                  }
                }
              ]
            }
          ];
        } else {
          stories.children = [
            {
              tag: "ul",
              class: "stories-index",
              children: (this.gameGroups || []).map(group => {
                return {
                  tag: "li",
                  child: {
                    tag: "a",
                    init: a => {
                      a.element.textContent = `${this.seasons[group.season]} ${group.date1} ${group.date2}`;
                      const seasons = {
                        1: "summer",
                        2: "winter"
                      };
                      a.element.href = `#${seasons[group.season]}-${group.date1}-${group.date2}`;
                    }
                  }
                }
              })
            }
          ]
        }
      }
    };

  }


}

addEventListener("popstate", event => {
  Stories.render(true);
});
