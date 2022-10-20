class Screen {


  constructor() {

    this.language = "fr";


    this.dictionaryEN = {
      "Titre d’usage": "Working title",
      "Auteur/ Intervenant": "Author/ Speaker",
      "Dénomination": "Denomination",
      "Mot-clé Jeux": "Keyword Games",
      "Matériaux/ technique": "Materials/ technique",
      "Dimensions et poids": "Dimensions and weight",
      "Notes": "Notes"
    };



//     this.loremIpsum = `Lorem ipsum dolor sit amet. Tempora eligendi ex harum sapiente aut dicta rerum? Est harum soluta ut illo voluptate et blanditiis omnis. Sed itaque tempora et distinctio repellat sit voluptatem voluptas vel optio galisum ut necessitatibus officia rem modi nulla ea aspernatur impedit. At odio quisquam aut porro doloremque a distinctio dicta est amet doloribus aut dignissimos facere et exercitationem iste.
//
// A quos pariatur aut distinctio dolorum qui rerum recusandae est magni saepe et corporis blanditiis est doloremque sunt. 33 culpa alias sed blanditiis eius qui temporibus sunt. Qui quod quae ut nulla impedit et asperiores vitae in reiciendis molestiae. Neque fugit et vitae nobis et molestiae doloribus qui sunt inventore 33 architecto voluptatem?
//
// Qui suscipit debitis est optio sunt et natus officia est quasi perferendis qui aperiam corporis vel vero temporibus. Eum nulla cupiditate et labore galisum id officiis perferendis qui cumque cumque et dolor voluptatum. Et rerum officia et dolorum obcaecati sit amet delectus et distinctio dolorem eos quod voluptatem.`;
//
//
//     this.testMedias = [
//       {
//         id: 1,
//         width: 1400,
//         height: 930,
//         src: "images/free-wheely.jpg",
//         small: "images/small/free-wheely.jpg",
//       },
//       {
//         id: 2,
//         width: 1400,
//         height: 933,
//         src: "images/dumbo.jpg",
//         small: "images/small/dumbo.jpg",
//       },
//       {
//         id: 3,
//         width: 1048,
//         height: 1399,
//         src: "images/bird-reynolds.jpg",
//         small: "images/small/bird-reynolds.jpg",
//       },
//       {
//         id: 4,
//         width: 1400,
//         height: 1400,
//         src: "images/abba.jpg",
//         small: "images/small/abba.jpg",
//       },
//       {
//         id: 5,
//         width: 933,
//         height: 1400,
//         src: "images/peter-fox.jpg",
//         small: "images/small/peter-fox.jpg",
//       },
//       {
//         id: 6,
//         width: 1400,
//         height: 875,
//         src: "images/steve-turtle.jpg",
//         small: "images/small/steve-turtle.jpg"
//       },
//       {
//         id: 7,
//         src: "video/clouds.mp4",
//         type: "video"
//       }
//     ];

    // this.images = this.medias.slice(0, 6);

    // this.images = Database.medias.map(image => {
    //   const noinvs = image.noinv.split(/[,\r\n]/g).map(noinv => noinv.trim()).filter(noinv => noinv);
    //   return {
    //     ...image,
    //     noinvs: noinvs,
    //     id: noinvs[0]
    //   };
    // });
    //
    //
    //
    // this.imagesEN = Database.mediasEN.map(image => {
    //   const noinvs = image.noinv.split(/[,\r\n]/g).map(noinv => noinv.trim()).filter(noinv => noinv);
    //   return {
    //     ...image,
    //     noinvs: noinvs,
    //     id: noinvs[0]
    //   };
    // });

    // console.log(JSON.stringify(this.imagesEN));

    // this.medias = this.images.reduce((array, item) => {
    //   return [...array, item.noinvs.map(noinv => {
    //     return {...item, id: noinv};
    //   })];
    // }, []);

    // console.log(this.medias);


    this.screenId = location.hash.slice(1) || "1";



  }

  translate(word) {
    if (this.language === "en" && this.dictionaryEN[word]) {
      return this.dictionaryEN[word];
    }
    return word;
  }



  // getTranslatedImage(index) {
  //
  //   if (this.language === "fr") {
  //     return this.images[index];
  //   } else {
  //     return this.imagesEN[index];
  //   }
  // }

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
        // const fileIds = this.items.reduce((array, item) => [...array, ...item.images], []);
        // this.files = await fetch("/query/files?parent=").then(response => response.json());

        // console.log(this.items);
        // const fileIds = this.items.reduce((array, item) => [...array, ...item.images], []);
        // this.files = await fetch("/query/items?ids="+fileIds.join(",")).then(response => response.json());


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
                  mediaId: slide.id
                });
                this.currentSlide = slide;
                slideshow.render();
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
                // tag: "ul",
                class: "viewer",
                // children: this.images.map((image, index) => {
                children: this.items.map((item, index) => {

                  // image = this.getTranslatedImage(index);

                  let mediaId = item.images[0];

                  return {
                    class: "slide",
                    init: slide => {
                      this.player.addSlide({
                        element: slide.element,
                        render: slide.render,
                        id: item.id
                      });
                    },
                    update: slide => {
                      const active = Boolean(this.currentSlide && this.currentSlide.id === item.id);
                      slide.element.classList.toggle("active", active);
                      slide.children = [
                        {
                          class: "media",
                          children: [
                            {
                              tag: "figure",
                              class: "image",
                              // update: figure => {
                              //   // figure.element.onclick = event => {
                              //   //   figure.element.parentNode.classList.toggle("full");
                              //   //   this.onPop({
                              //   //     screenId: this.screenId,
                              //   //     mediaId: media.id
                              //   //   });
                              //   // };
                              // },
                              child: {
                                tag: "img",
                                init: img => {
                                  img.element.draggable = false;
                                },
                                update: async img => {
                                  const file = await fetch("/get/files/"+mediaId).then(response => response.json());
                                  const src = "/uploads/" + file.filename;
                                  img.element.src = src;
                                  img.element.onmousedown = event => {
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
                                      document.addEventListener("mouseup", onMouseUp);
                                      document.addEventListener("mousemove", onMouseMove);
                                    }, 200);
                                  }
                                }
                              }
                            }
                          ]
                        },
                        {
                          class: "details",
                          update: details => {
                            // image = this.getTranslatedImage(index);

                            details.children = [
                              {
                                class: "details-header",
                                children: [
                                  {
                                    class: "button fr",
                                    init: button => {
                                      button.element.innerHTML = "Fr";
                                      button.element.onclick = event => {
                                        this.language = "fr";
                                        details.render();
                                      }
                                    },
                                    update: button => {
                                      button.element.classList.toggle("active", !this.language || this.language === "fr");
                                    }
                                  },
                                  {
                                    class: "button en",
                                    init: button => {
                                      button.element.innerHTML = "En";
                                      button.element.onclick = event => {
                                        this.language = "en";
                                        details.render();
                                      }
                                    },
                                    update: button => {
                                      button.element.classList.toggle("active", this.language === "en");
                                    }
                                  },
                                  {
                                    class: "button close",
                                    init: button => {
                                      button.element.innerHTML = "╳";
                                      button.element.onclick = event => {
                                        this.stopScreensaver();
                                        this.onPop({ // -> depop
                                          screenId: this.screenId
                                        });
                                        this.currentSlide = null;
                                        slideshow.render();
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
                                    update: title => {
                                      title.element.innerHTML = item["jeux"+this.getSuffix()];
                                    }
                                  },
                                  {
                                    class: "content",
                                    children: [

                                      // {
                                      //   class: "title",
                                      //   update: node => {
                                      //     node.element.classList.toggle("hidden", !image.titre);
                                      //   },
                                      //   children: [
                                      //     {
                                      //       tag: "h3",
                                      //       update: content => {
                                      //         content.element.innerHTML = this.translate("Titre d’usage");
                                      //       }
                                      //     },
                                      //     {
                                      //       class: "text",
                                      //       update: content => {
                                      //         content.element.innerHTML = image.titre;
                                      //       }
                                      //     }
                                      //   ]
                                      // },
                                      // {
                                      //   class: "auteur",
                                      //   update: node => {
                                      //     node.element.classList.toggle("hidden", !image.titre);
                                      //   },
                                      //   children: [
                                      //     {
                                      //       tag: "h3",
                                      //       update: content => {
                                      //         content.element.innerHTML = this.translate("Auteur/ Intervenant");
                                      //       }
                                      //     },
                                      //     {
                                      //       class: "text",
                                      //       update: content => {
                                      //         content.element.innerHTML = image.auteur;
                                      //       }
                                      //     }
                                      //   ]
                                      // },
                                      // {
                                      //   class: "denomination",
                                      //   update: node => {
                                      //     node.element.classList.toggle("hidden", !image.titre);
                                      //   },
                                      //   children: [
                                      //     {
                                      //       tag: "h3",
                                      //       update: content => {
                                      //         content.element.innerHTML = this.translate("Dénomination");
                                      //       }
                                      //     },
                                      //     {
                                      //       class: "text",
                                      //       update: content => {
                                      //         content.element.innerHTML = image.denom;
                                      //       }
                                      //     }
                                      //   ]
                                      // },
                                      // {
                                      //   class: "jeux",
                                      //   update: node => {
                                      //     node.element.classList.toggle("hidden", !image.titre);
                                      //   },
                                      //   children: [
                                      //     {
                                      //       tag: "h3",
                                      //       update: content => {
                                      //         content.element.innerHTML = this.translate("Mot-clé Jeux");
                                      //       }
                                      //     },
                                      //     {
                                      //       class: "text",
                                      //       update: content => {
                                      //         content.element.innerHTML = image.jeux;
                                      //       }
                                      //     }
                                      //   ]
                                      // },
                                      // {
                                      //   class: "dimension",
                                      //   update: node => {
                                      //     node.element.classList.toggle("hidden", !image.titre);
                                      //   },
                                      //   children: [
                                      //     {
                                      //       tag: "h3",
                                      //       update: content => {
                                      //         content.element.style.display = image.dimension ? "block" : "none";
                                      //         content.element.innerHTML = this.translate("Dimensions et poids");
                                      //       }
                                      //     },
                                      //     {
                                      //       class: "text",
                                      //       update: content => {
                                      //         content.element.style.display = image.dimension ? "block" : "none";
                                      //         content.element.innerHTML = image.dimension;
                                      //       }
                                      //     }
                                      //   ]
                                      // },
                                      // {
                                      //   class: "technique",
                                      //   update: node => {
                                      //     node.element.classList.toggle("hidden", !image.titre);
                                      //   },
                                      //   children: [
                                      //     {
                                      //       tag: "h3",
                                      //       update: content => {
                                      //         content.element.style.display = image.technique ? "block" : "none";
                                      //         content.element.innerHTML = this.translate("Matériaux/ technique");
                                      //       }
                                      //     },
                                      //     {
                                      //       class: "text",
                                      //       update: content => {
                                      //         content.element.style.display = image.technique ? "block" : "none";
                                      //         content.element.innerHTML = image.technique;
                                      //       }
                                      //     }
                                      //   ]
                                      // },
                                      {
                                        class: "notes",
                                        update: node => {
                                          // node.element.classList.toggle("hidden", !image.titre);
                                        },
                                        children: [
                                          // {
                                          //   tag: "h3",
                                          //   update: content => {
                                          //     content.element.innerHTML = this.translate("Notes");
                                          //   }
                                          // },
                                          {
                                            class: "text",
                                            update: content => {
                                              content.element.innerHTML = item["note"+this.getSuffix()];
                                            }
                                          }
                                        ]
                                      }
                                      // {
                                      //   tag: "h3",
                                      //   update: content => {
                                      //     content.element.innerHTML = "Test video";
                                      //   }
                                      // },
                                      // {
                                      //   tag: "video",
                                      //   update: video => {
                                      //     video.element.controls = true;
                                      //     video.element.onplay = event => {
                                      //       this.onPop({
                                      //         screenId: this.screenId,
                                      //         mediaId: 7,
                                      //         currentTime: video.element.currentTime
                                      //       });
                                      //     };
                                      //     video.element.onpause = event => {
                                      //       const slide = this.player.getCurrent();
                                      //       // this.onPop(this.screenId, slide.id);
                                      //       this.onPop({
                                      //         screenId: this.screenId,
                                      //         mediaId: 7,
                                      //         currentTime: video.element.currentTime,
                                      //         playing: false
                                      //       });
                                      //     };
                                      //   },
                                      //   child: {
                                      //     tag: "source",
                                      //     init: source => {
                                      //       source.element.src = "video/clouds.mp4";
                                      //       source.element.type = "video/mp4";
                                      //     }
                                      //   }
                                      // }
                                      // {
                                      //   class: "text",
                                      //   update: content => {
                                      //     content.element.innerHTML = this.loremIpsum;
                                      //   }
                                      // },
                                      // {
                                      //   tag: "img",
                                      //   update: img => {
                                      //     img.element.src = "images/free-wheely.jpg";
                                      //     img.element.onclick = event => {
                                      //       this.onPop({
                                      //         screenId: this.screenId,
                                      //         mediaId: 1
                                      //       });
                                      //     }
                                      //   }
                                      // },
                                      // {
                                      //   class: "text",
                                      //   update: content => {
                                      //     content.element.innerHTML = this.loremIpsum;
                                      //   }
                                      // }
                                    ]
                                  },
                                  {
                                    class: "gallery",
                                    children: item.images.map(fileId => {
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
                                                    update: img => {
                                                      img.element.src = "/uploads/"+file.filename;
                                                      img.element.onclick = event => {
                                                        if (mediaId === fileId) {
                                                          mediaId = item.images[0];
                                                          this.onPop({
                                                            screenId: this.screenId,
                                                            mediaId: mediaId
                                                          });
                                                        } else {
                                                          mediaId = fileId;
                                                          this.onPop({
                                                            screenId: this.screenId,
                                                            mediaId: mediaId
                                                          });
                                                        }
                                                        slide.render();
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
                                                  figure.child = {
                                                    tag: "video",
                                                    update: video => {
                                                      video.element.controls = true;
                                                      video.element.onplay = event => {
                                                        this.onPop({
                                                          screenId: this.screenId,
                                                          mediaId: fileId,
                                                          currentTime: video.element.currentTime
                                                        });
                                                      };
                                                      video.element.onpause = event => {
                                                        const slide = this.player.getCurrent();
                                                        this.onPop({
                                                          screenId: this.screenId,
                                                          mediaId: fileId,
                                                          currentTime: video.element.currentTime,
                                                          playing: false
                                                        });
                                                      };
                                                    },
                                                    child: {
                                                      tag: "source",
                                                      init: source => {
                                                        source.element.src = "/uploads/"+file.filename;;
                                                        source.element.type = file.type;
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          ];
                                        }
                                      }
                                    })
                                  }
                                ]
                              }
                            ];
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
            slideshow.element.classList.toggle("hidden", Boolean(this.screensaving));
          },
          complete: slideshow => {
            this.player.init();
          }
        }
      ]
    }
  }

}
