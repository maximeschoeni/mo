
KarmaFieldsAlpha.field.layout.medias.description = class extends KarmaFieldsAlpha.field {

  build() {
    return {
      class: "karma-field karma-field-container media-description display-flex",
      update: async container => {

        const selection = await this.parent.request("selection");
        const filetype = await this.parent.request("state", {}, "filetype");
        const uniqueFileType = KarmaFieldsAlpha.Type.toString(filetype.value);

        container.children = [
          {
            class: "karma-field-frame",
            children: [
              {
                // -> multiple attachments/folders
                update: frame => {

                  frame.element.classList.toggle("hidden", !selection || selection.length <= 1);
                  if (selection && selection.length > 1) {
                    frame.child = {
                      tag: "span",
                      class: "dashicons dashicons-format-gallery",
                      init: span => {
                        span.element.style = "font-size:10em;text-align:left;height:auto;width:auto;";
                      }
                    }
                  }
                }
              },
              {
                // -> 1 attachment
                update: async frame => {
                  frame.element.classList.toggle("hidden", !selection || selection.length !== 1 || uniqueFileType !== "file");
                  if (selection && selection.length === 1 && uniqueFileType === "file") {
                    const type = await this.getString("type");
                    frame.children = [
                      {
                        tag: "figure",
                        class: "image",
                        update: figure => {
                          if (type.startsWith("image")) {
                            figure.child = {
                              tag: "img",
                              init: img => {
                                img.element.sizes = "40em";
                              },
                              update: async img => {
                                const filename = await this.parent.request("get", {}, "filename").then(response => KarmaFieldsAlpha.Type.toString(response));
                                const src = KarmaFieldsAlpha.uploadURL+"/"+filename;
                                const sizes = await this.getArray("sizes");
                                const sources = sizes.filter(size => size.width).map(size => `${KarmaFieldsAlpha.uploadURL}/${encodeURI(size.filename)} ${size.width}w`);
                                const srcset = [...new Set(sources)].join(",");

                                img.element.src = src;
                                img.element.srcset = srcset;
                              }
                            }
                          } else {
                            figure.children = [];
                          }
                        }
                      },
                      {
                        tag: "figure",
                        class: "video",
                        update: figure => {
                          if (type.startsWith("video")) {
                            figure.child = {
                              tag: "video",
                              child: {
                                tag: "source",
                                update: async source => {
                                  const filename = await this.parent.request("get", {}, "filename").then(response => KarmaFieldsAlpha.Type.toString(response));
                                  source.element.src = KarmaFieldsAlpha.uploadURL+"/"+filename;
                                  source.element.type = type;
                                }
                              },
                              update: async video => {
                                video.element.setAttribute("controls", "1");
                              }
                            }
                          } else {
                            figure.children = [];
                          }
                        }
                      }
                    ];
                  }
                }
              },
              {
                // -> 1 folder
                update: frame => {
                  frame.element.classList.toggle("hidden", !selection || selection.length !== 1 || uniqueFileType !== "folder");
                  if (selection && selection.length === 1 && uniqueFileType === "folder") {
                    frame.child = {
                      tag: "span",
                      class: "dashicons dashicons-category",
                      init: span => {
                        span.element.style = "font-size:8em;height:auto;width:auto;"
                      }
                    }
                  }
                }
              }
              // {
              //   // -> no selection
              //   update: frame => {
              //     frame.element.classList.toggle("hidden", Boolean(selection));
              //     if (!selection) {
              //       frame.child = {
              //         tag: "span",
              //         class: "dashicons dashicons-open-folder",
              //         init: span => {
              //           span.element.style = "font-size:8em;height:auto;width:auto;"
              //         }
              //       }
              //     }
              //   }
              // }
            ]
          },
          {
            class: "karma-field-frame",
            children: [
              {
                // -> multiple attachments/folders
                update: frame => {
                  frame.element.classList.toggle("hidden", !selection || selection.length <= 1);
                  if (selection && selection.length > 1) {
                    frame.children = [
                      {
                        tag: "label",
                        update: span => {
                          span.element.innerHTML = `${selection.length} items selected`;
                        }
                      }
                    ];
                  }
                }
              },
              {
                // -> 1 attachment
                class: "karma-field karma-field-container display-block",
                update: frame => {
                  frame.element.classList.toggle("hidden", !selection || selection.length !== 1 || uniqueFileType !== "file");
                  if (selection && selection.length === 1 && uniqueFileType === "file") {
                    frame.children = [
                      {
                        class: "filename",
                        children: [
                          {
                            tag: "label",
                            init: label => {
                              label.element.innerHTML = "Filename";
                            }
                          },
                          {
                            class: "value",
                            child: {
                              tag: "a",
                              update: async a => {
                                const name = await this.getString("name");
                                const filename = await this.getString("filename");
                                a.element.innerHTML = name;
                                a.element.href = KarmaFieldsAlpha.uploadURL+"/"+filename;
                              }
                            }
                          }
                        ]
                      },
                      {
                        children: [
                          {
                            tag: "label",
                            init: label => {
                              label.element.innerHTML = "Size";
                            }
                          },
                          {
                            update: async node => {
                              const size = await this.getNumber("size");
                              node.element.innerHTML = `${(size/1000).toFixed()} KB`;
                            }
                          }
                        ]
                      },
                      {
                        children: [
                          {
                            tag: "label",
                            init: label => {
                              label.element.innerHTML = "Dimensions";
                            }
                          },
                          {
                            update: async node => {
                              node.element.innerHTML = `${await this.getString("width")} x ${await this.getString("height")} pixels`;
                            }
                          }
                        ]
                      },
                      {
                        children: [
                          {
                            tag: "label",
                            init: label => {
                              label.element.innerHTML = "Uploaded on";
                            }
                          },
                          {
                            update: async node => {
                              const value = await this.getString("date");
                              const date = new Date(value || null);

                              node.element.innerHTML = new Intl.DateTimeFormat(KarmaFieldsAlpha.locale, {
                                year: "numeric",
                                month: "long",
                                day: "2-digit"
                              }).format(date);
                            }
                          }
                        ]
                      }
                    ]
                  }
                }
              },
              {
                // -> 1 folder
                class: "one-folder",
                update: async frame => {
                  frame.element.classList.toggle("hidden", !selection || selection.length !== 1 || uniqueFileType !== "folder");
                  if (selection && selection.length === 1 && uniqueFileType === "folder") {
                    frame.children = [
                      this.createChild({
                        id: "open-folder",
                        type: "button",
                        title: "Open",
                        action: "open-folder"
                      }).build()
                    ];

                  }
                }
              }
              // {
              //   // -> no selection
              //   update: frame => {
              //     frame.element.classList.toggle("hidden", Boolean(selection));
              //     if (!selection) {
              //       frame.children = [
              //         this.createChild({
              //           id: "breadcrumb",
              //           type: "breadcrumb",
              //           title: "Path"
              //         })
              //       ]
              //     }
              //   }
              // }
            ]
          }
        ];


      }
    }
  }

}

KarmaFieldsAlpha.field.layout.medias.mediaDescription = class extends KarmaFieldsAlpha.field.layout.medias.description {}
