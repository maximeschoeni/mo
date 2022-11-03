
// require KarmaFieldsAlpha.fields.table

KarmaFieldsAlpha.fields.table.Pagination = class {

  static buildBasicButton(name, title) {
    return {
      tag: "button",
      class: "karma-button footer-item",
      init: (button) => {
        button.element.title = title;
      },
      children: [
        {
          tag: "span",
          class: "button-content",
          init: content => {
            content.element.innerHTML = name;
          }
        },
        {
          class: "karma-field-spinner"
        }
      ]
    }
  }


  static buildFirstPageButton(field, name, title) {
    return {
      tag: "button",
      class: "karma-button footer-item",
      init: (button) => {
        button.element.title = title || "First Page";
      },
      children: [
        {
          tag: "span",
          class: "button-content",
          init: content => {
            content.element.innerHTML = name || "«";
          }
        },
        {
          class: "karma-field-spinner"
        }
      ],
      update: button => {
        const count = field.getCount();
        const page = field.getPage();
        const ppp = field.getPpp();

        // button.element.classList.toggle("hidden", ppp < 1 || page === 1);
        button.element.disabled = page === 1;
        button.element.onclick = async (event) => {
          if (page > 0) {
            button.element.classList.add("loading");
            KarmaFieldsAlpha.Nav.backup();
            KarmaFieldsAlpha.Nav.setParam("page", 1);
            await field.editParam();
            // await field.render();
            button.element.blur();
            button.element.classList.remove("loading");
          }
        }
      }
    }
  }


  static buildPrevPageButton(field, name, title) {
    return {
      tag: "button",
      class: "karma-button footer-item",
      init: (button) => {
        button.element.title = title || "Previous Page";
      },
      children: [
        {
          tag: "span",
          class: "button-content",
          init: content => {
            content.element.innerHTML = name || "‹";
          }
        },
        {
          class: "karma-field-spinner"
        }
      ],
      update: button => {
        const count = field.getCount();
        const page = field.getPage();
        const ppp = field.getPpp();

        // button.element.classList.toggle("hidden", ppp < 1 || page === 1);
        button.element.disabled = (page === 1);
        button.element.onclick = async (event) => {
          if (page > 0) {
            button.element.classList.add("loading");
            KarmaFieldsAlpha.Nav.backup();
            KarmaFieldsAlpha.Nav.setParam("page", page-1);
            await field.editParam();
            // await field.render();
            button.element.blur();
            button.element.classList.remove("loading");
          }
        }
      }
    }
  }


  static buildNextPageButton(field, name, title) {
    return {
      tag: "button",
      class: "karma-button footer-item",
      init: (button) => {
        button.element.title = title || "Next Page";
      },
      children: [
        {
          tag: "span",
          class: "button-content",
          init: content => {
            content.element.innerHTML = name || "›";
          }
        },
        {
          class: "karma-field-spinner"
        }
      ],
      update: button => {
        const count = field.getCount();
        const page = field.getPage();
        const ppp = field.getPpp();
        const numPage = Math.ceil(count/ppp);

        // button.element.classList.toggle("hidden", ppp < 1 || page >= numPage);
        button.element.disabled = page >= numPage;

        button.element.onclick = async (event) => {
          if (page < numPage) {
            button.element.classList.add("loading");
            KarmaFieldsAlpha.Nav.backup();
            KarmaFieldsAlpha.Nav.setParam("page", page+1);
            // field.setParam("page", page+1);
            await field.editParam();
            // await field.render();
            button.element.blur();
            button.element.classList.remove("loading");
          }
        }
      }
    }
  }


  static buildLastPageButton(field, name, title) {
    return {
      tag: "button",
      class: "karma-button footer-item",
      init: (button) => {
        button.element.title = title || "Last Page";
      },
      children: [
        {
          tag: "span",
          class: "button-content",
          init: content => {
            content.element.innerHTML = name || "»";
          }
        },
        {
          class: "karma-field-spinner"
        }
      ],
      update: button => {
        const count = field.getCount();
        const page = field.getPage();
        const ppp = field.getPpp();
        const numPage = Math.ceil(count/ppp);

        // button.element.classList.toggle("hidden", ppp < 1 || page >= numPage);
        button.element.disabled = page >= numPage;

        button.element.onclick = async (event) => {
          if (page < numPage) {
            button.element.classList.add("loading");

            KarmaFieldsAlpha.Nav.backup();
            KarmaFieldsAlpha.Nav.setParam("page", numPage);
            // field.setParam("page", numPage);
            await field.editParam();
            // await field.render();
            button.element.blur();
            button.element.classList.remove("loading");
          }
        }
      }
    }
  }


  static buildCurrentPageElement(field) {
    return {
      class: "current-page header-item",
      update: item => {
        const count = field.getCount();
        const page = field.getPage();
        const ppp = field.getPpp();
        const numPage = Math.ceil(count/ppp);

        item.element.classList.toggle("hidden", ppp < 1 || count < ppp);
        item.element.textContent = count && page+" / "+numPage || "";
      }
    };
  }


  // static buildPPPButton(field) {
  //
  //   const options = [
  //     {key: 100, value: "100 items/page"},
  //     {key: 200, value: "200 items/page"},
  //     {key: 500, value: "500 items/page"},
  //     {key: 0, value: "all"}
  //   ];
  //
  //   return {
  //     class: "ppp-selector footer-item",
  //     init: item => {
  //       item.element.tabIndex = "-1"; // for safari
  //     },
  //     children: [
  //       {
  //         tag: "button",
  //         class: "karma-button current-page footer-item",
  //         update: item => {
  //           let num = field.getCount();
  //           item.element.textContent = num ? num + " items" : "";
  //         }
  //       },
  //       {
  //         class: "ppp-selector-options",
  //         child: {
  //           tag: "ul",
  //           children: options.map(item => {
  //             return {
  //               tag: "li",
  //               child: {
  //                 tag: "button",
  //                 class: "karma-button footer-item",
  //                 init: (button) => {
  //                   button.element.title = item.value;
  //                 },
  //                 children: [
  //                   {
  //                     tag: "span",
  //                     class: "button-content",
  //                     init: content => {
  //                       content.element.innerHTML = item.value;
  //                     }
  //                   },
  //                   {
  //                     class: "karma-field-spinner"
  //                   }
  //                 ],
  //                 update: button => {
  //                   const ppp = field.getPpp();
  //                   button.element.classList.toggle("active", ppp == item.key);
  //                   button.element.onclick = async (event) => {
  //                     // field.setParam("ppp", item.key);
  //                     // field.setParam("page", 1);
  //                     button.element.classList.add("loading");
  //                     KarmaFieldsAlpha.History.backup();
  //                     KarmaFieldsAlpha.History.setParams({
  //                       page: 1,
  //                       ppp: item.key
  //                     });
  //                     await field.editParam();
  //                     // await field.render();
  //                     button.element.classList.remove("loading");
  //                     document.activeElement.blur(); // for safari
  //                   }
  //                 }
  //               }
  //             };
  //           })
  //         }
  //       }
  //     ]
  //   }
  // }

  // static buildItemsTotal(field) {
  //
  //
  //   return {
  //     class: "total-items header-item",
  //     init: item => {
  //       item.element.tabIndex = "-1"; // for safari
  //     },
  //     update: async item => {
  //       item.element.classList.toggle("hidden", !!this.editPpp);
  //
  //       item.element.classList.add("loading");
  //
  //       await (field.queryPromise || field.query());
  //
  //       item.element.classList.remove("loading");
  //
  //     },
  //     child: {
  //       tag: "a",
  //       update: a => {
  //         if (!field.queriedIds || !field.queriedIds.length) {
  //           a.element.textContent = "";
  //         } else {
  //           // const num = field.getCount() + (field.ids.getValue() || []).length;
  //           const num = field.getCount() + field.getExtraIds().length;
  //           a.element.textContent = num + " elements";
  //           a.element.style.cursor = "pointer";
  //           a.element.onclick = event => {
  //             this.editPpp = true;
  //             field.renderHeader();
  //           }
  //         }
  //       }
  //     }
  //
  //   }
  //
  // }

  static buildItemsTotal(field) {


    return {
      class: "total-items header-item",
      init: item => {
        this.renderItemTotal = item.render;
        item.element.tabIndex = "-1"; // for safari
      },
      update: async item => {


        item.element.classList.add("loading");

        await (field.queryPromise || field.query());

        item.element.classList.remove("loading");

      },
      children: [
        {
          tag: "a",
          update: a => {
            a.element.classList.toggle("hidden", !!this.editPpp);
            if (!field.queriedIds || !field.queriedIds.length) {
              a.element.textContent = "";
            } else {
              // const num = field.getCount() + (field.ids.getValue() || []).length;
              const num = field.getCount() + field.getExtraIds().length;
              a.element.textContent = num + " elements";
              a.element.onclick = event => {
                this.editPpp = true;
                field.renderHeader();
              }
            }
          }
        },
        {
          class: "set-ppp",
          // init: item => {
          //   item.element.tabIndex = "-1"; // for safari
          // },
          children: [
            {
              tag: "label",
              init: label => {
                label.element.textContent = "Number of items per page";
              }
            },
            {
              tag: "input",
              init: input => {
                input.element.type = "text";
                input.element.style = "width:60px";
              },
              update: input => {
                // input.element.value = KarmaFieldsAlpha.History.getParam("ppp");
                input.element.value = field.getPpp();
                input.element.oninput = event => {
                  //KarmaFieldsAlpha.History.setParam("ppp", input.element.value);
                  // field.options.setValue("ppp", input.element.value);
                  field.setPpp(input.element.value);
                  this.renderItemTotal();
                }
              }
            },
            {
              tag: "button",
              class: "karma-button",
              init: button => {
                button.element.onclick = async event => {
                  this.editPpp = false;
                  button.element.classList.add("loading");
                  KarmaFieldsAlpha.Nav.setParam("page", 1);
                  KarmaFieldsAlpha.Nav.setParam("ppp", field.getPpp());
                  await field.render();
                  button.element.classList.remove("loading");
                }

              },
              // update: button => {
              //   button.element.disabled = KarmaFieldsAlpha.History.getParam("ppp") === field.getPpp();
              // },
              children: [
                {
                  tag: "span",
                  class: "button-content",
                  init: content => {
                    content.element.textContent = "Set";
                  }
                }
              ]
            }
          ],
          update: async item => {
            item.element.classList.toggle("hidden", !this.editPpp);
          }
        }
      ]

    }

  }

  // static buildSetPpp(field) {
  //
  //
  //   return {
  //
  //
  //   }
  //
  // }


  static buildPrevModalButton(field, name, title) {
    return {
      tag: "button",
      class: "karma-button",
      init: (button) => {
        button.element.title = title || "Previous";
      },
      children: [
        {
          tag: "span",
          class: "button-content",
          init: content => {
            content.element.innerHTML = name || "‹";
          }
        }
      ],
      update: button => {
        // const ids = field.getCurrentIds();
        const ids = field.queriedIds;
        let id = KarmaFieldsAlpha.Nav.getParam("id");
        let index = ids && ids.indexOf(id) || -1;
        button.element.disabled = index < 1;

        button.element.onclick = async (event) => {
          if (index > 0) {
            id = ids[index-1];
            button.element.classList.add("loading");
            KarmaFieldsAlpha.Nav.backup();
            KarmaFieldsAlpha.Nav.setParam("id", id);
            await field.editParam();
            // await field.renderModal();
            // await field.renderFooter();
            button.element.classList.remove("loading");
          }
        }
      }
    };
  }


  static buildNextModalButton(field, name, title) {
    return {
      tag: "button",
      class: "karma-button",
      init: (button) => {
        button.element.title = title || "Next";
      },
      children: [
        {
          tag: "span",
          class: "button-content",
          init: content => {
            content.element.innerHTML = name || "›";
          }
        }
      ],
      update: button => {
        // const ids = field.getCurrentIds();
        const ids = field.queriedIds;
        let id = KarmaFieldsAlpha.Nav.getParam("id");
        let index = ids && ids.indexOf(id) || -1;
        button.element.disabled = index === -1 || index >= ids.length - 1;

        button.element.onclick = async (event) => {
          if (index > -1 && index < ids.length - 1) {
            id = ids[index+1];
            button.element.classList.add("loading");
            KarmaFieldsAlpha.Nav.backup();
            KarmaFieldsAlpha.Nav.setParam("id", id);
            await field.editParam();
            // await field.renderModal();
            // await field.renderFooter();
            button.element.classList.remove("loading");
          }
        }
      }
    };
  }


  static buildCloseModalButton(field, name, title) {
    return {
      tag: "button",
      class: "karma-button",
      // child: new KarmaFieldsAlpha.fields.icon({
      //   type: "icon",
      //   value: "no-alt.svg"
      // }).build(),
      children: [
        {
          tag: "span",
          class: "button-content",
          init: content => {
            content.element.innerHTML = name || "×";
          }
        }
      ],
      init: button => {
        button.element.title = title || "Close";
        button.element.onclick = async () => {
          button.element.classList.add("loading");
          KarmaFieldsAlpha.Nav.backup();
          KarmaFieldsAlpha.Nav.setParam("id", null);
          await field.editParam();
          button.element.classList.remove("loading");
        }
      }
    }
  }

  static buildCloseTableButton(field, name, title) {
    return {
      tag: "button",
      class: "karma-button",
      children: [
        {
          tag: "span",
          class: "button-content",
          init: content => {
            content.element.innerHTML = name || "×";
          }
        }
      ],
      init: button => {
        button.element.title = title || "Close";
        button.element.onclick = async () => {
          button.element.classList.add("loading");
          KarmaFieldsAlpha.Nav.backup();
          KarmaFieldsAlpha.Nav.setParamString("");
          await field.editParam();
          button.element.classList.remove("loading");
        }
      }
    }
  }

}
