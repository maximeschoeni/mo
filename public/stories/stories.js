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

  // static getCountryFile(story) {
  //   const id = story.country && story.country[0];
  //   if (id) {
  //     return this.filesDirectory[id]
  //   }
  // }

  // static getSport(story) {
  //   // const sportId = story.sport && story.sport[0];
  //   // if (sportId) {
  //   //   return fetch(`/get/sports/${sportId}`).then(response => response.json());
  //   // }
  //
  //   const sportId = story.sport && story.sport[0];
  //   const sport = sportId && this.sports.find(sport => sport.id === sportId);
  //   if (sport) {
  //     return this.translateObject(sport, "name");
  //   }
  //
  //   return "";
  // }

  static screensaverStop() {
    this.screensaving = false;
    if (this.screensaverTimer) {
      clearTimeout(this.screensaverTimer);
    }
    this.screensaverTimer = setTimeout(() => {
      this.screensaving = true;
      this.render();
    }, 60*1000);
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
        if (a.medal < b.medal) return -1;
        else if (a.medal > b.medal) return 1;
        else return 0;
      });
      game.medalGroups = game.medals.reduce((object, medal) => {
        object[medal.medal] ||= {medal: medal.medal, num: 0, disciplines: []};
        object[medal.medal].num++;
        // object[medal.medal].disciplines.push(medal.discipline);
        object[medal.medal].disciplines.push(this.translateObject(medal, "discipline"));
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

        addEventListener("popstate", event => {
          div.render(true);
        });

        this.gameGroups = await fetch(`/query/gameGroups`).then(response => response.json());

        const [season, date1, date2] = location.hash.slice(1).split("-");
        const seasonId = season === "summer" ? "1" : "2";

        this.gameGroup = this.gameGroups && this.gameGroups.find(group => group.season === seasonId && group.date1 === date1 && group.date2 === date2);

        if (this.gameGroup) {

          div.element.classList.add(season);
          this.date1 = date1;
          this.date2 = date2;

          this.stories = await fetch(`/query/stories?gameGroup=${this.gameGroup.id}`).then(response => response.json());

          if (this.stories.length < 10) {

            this.stories = [0,1,2,3,4,5,6,7,8,9].map(index => this.stories[index%this.stories.length]);

          }

          console.log(this.stories);

          this.files = await fetch(`/query/files`).then(response => response.json());

          this.filesDirectory = Object.fromEntries(this.files.map(file => [file.id, file]));

          console.log(this.files);

          this.games = await fetch(`/query/games`).then(response => response.json());

          console.log(this.games);

          this.sports = await fetch(`/query/sports`).then(response => response.json());

          console.log(this.sports);

          this.countries = await fetch(`/query/countries`).then(response => response.json());

          console.log(this.countries);

          this.options = await fetch(`/get/options/stories`).then(response => response.json());


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
                screensaver.element.onclick = event => {
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
                                img.element.src = "/uploads/" + file.filename;
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
                      child: {
                        update: language => {
                          language.element.textContent = this.language === "en" ? "Français" : "English";
                          language.element.onclick = event => {
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
                        class: "slideshow",
                        update: slideshow => {
                          // let currentSlide = 0;
                          // let nextSlide = 0;

                          slideshow.children = this.stories.map((story, index) => {
                            return {
                              class: "slide",
                              update: slide => {
                                const medias = story.medias || [];
                                let currentMedia = 0;

                                let x = index - this.nextSlide;

                                while (x < -1) {
                                  x += this.stories.length;
                                }
                                while (x > this.stories.length - 2) {
                                  x -= this.stories.length;
                                }

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
                                        const media = medias[currentMedia];
                                        const fileId = media.file && media.file[0];
                                        const file = fileId && this.filesDirectory[fileId];
                                        main.element.classList.toggle("video-media", Boolean(file && file.type.startsWith("video")));

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
                                                            div.element.classList.toggle("active", currentMedia === mediaIndex);
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
                                                              const countryId = story.country && story.country[0];
                                                              const country = countryId && this.countries.find(country => country.id === countryId);
                                                              const fileId = country && country.image;
                                                              const file = fileId && this.filesDirectory[fileId];
                                                              console.log(countryId, country, fileId, file);
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
                                                                      img.element.src = "/images/Olympic_Rings_black.svg";
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
                                                                              update: div => {
                                                                                // div.element.innerHTML = game.medals.map(medal => medal.discipline || "").join(", ");
                                                                                div.element.innerHTML = Object.values(game.medalGroups).map(group => {
                                                                                  return `${group.num} ${this.translate(this.medals[group.medal])} - ${group.disciplines.join(", ")}`
                                                                                }).join("; ");
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
                                                          button.element.innerHTML = await fetch("/images/arrowClose.svg").then(response => response.text());
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
                                                  div.element.classList.toggle("active", currentMedia === mediaIndex);
                                                  const fileId = media.file && media.file[0];
                                                  const file = fileId && this.filesDirectory[fileId];

                                                  // const file = this.files.find(file => media.file && media.file.includes(file.id));
                                                  if (file && file.type.startsWith("image")) {
                                                    div.children = [
                                                      {
                                                        tag: "img",
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
                                                    div.child = {
                                                      tag: "video",
                                                      init: video => {
                                                        video.element.controls = true;
                                                      },
                                                      child: {
                                                        tag: "source",
                                                        update: source => {
                                                          if (!source.element.src.endsWith(file.filename)) {
                                                            source.element.type = file.type;
                                                            source.element.src = "/uploads/" + file.filename;
                                                          }

                                                        }
                                                      }
                                                    };
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
                                                      }
                                                    };
                                                  } else if (file && file.type.startsWith("video")) {
                                                    thumb.child = {
                                                      tag: "video",
                                                      child: {
                                                        tag: "source",
                                                        init: source => {
                                                          source.element.type = file.type;
                                                          source.element.src = "/uploads/" + file.filename;
                                                        }
                                                      }
                                                    };
                                                  }
                                                },
                                                update: thumb => {
                                                  thumb.element.classList.toggle("active", currentMedia === mediaIndex);
                                                  thumb.element.onclick = event => {
                                                    currentMedia = mediaIndex;
                                                    // const file = this.files.find(file => media.file && media.file.includes(file.id));
                                                    // main.element.classList.toggle("video-media", file.type.startsWith("video"));
                                                    main.render();
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
                          nav.element.innerHTML = await fetch("/images/arrowL.svg").then(response => response.text());
                        },
                        update: nav => {
                          nav.element.onclick = event => {
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
                          nav.element.innerHTML = await fetch("/images/arrowR.svg").then(response => response.text());
                        },
                        update: nav => {
                          nav.element.onclick = event => {
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
                            let x = index - this.nextSlide;

                            while (x < -4) {
                              x += this.stories.length;
                            }
                            while (x > this.stories.length - 5) {
                              x -= this.stories.length;
                            }

                            thumb.element.classList.toggle("index-0", x === -4);
                            thumb.element.classList.toggle("index-1", x === -3);
                            thumb.element.classList.toggle("index-2", x === -2);
                            thumb.element.classList.toggle("index-3", x === -1);
                            thumb.element.classList.toggle("index-4", x === 0);
                            thumb.element.classList.toggle("index-5", x === 1);
                            thumb.element.classList.toggle("index-6", x === 2);
                            thumb.element.classList.toggle("index-7", x === 3);
                            thumb.element.classList.toggle("index-8", x === 4);

                            // thumb.element.style.transform = `translate(${50+x*10}%, 0)`;
                            thumb.element.classList.toggle("hidden", x > 4);
                            thumb.element.classList.toggle("current", x === 0);

                            thumb.element.onclick = event => {
                              this.nextSlide = index;
                              this.renderContent();
                            }

                            if (x <= 4) {
                              thumb.child = {
                                tag: "img",
                                init: img => {
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
                      // a.element.onclick = event => {
                      //   location.href = a.element.href;
                      //   stories.render(true);
                      // }
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
