



KarmaFieldsAlpha.fields.table.title = class {

  getField() {
    // if (!this.field) {
    //   this.field = new KarmaFieldsAlpha.fields.table.tableFilters({
    //     children: [
    //       {
    //         type: "text",
    //         tag: "h1",
    //         value: this.table.resource.title
    //       }
    //     ]
    //   }, this.table);
    // }
    // return this.field;
    if (!this.field) {
      this.field = new KarmaFieldsAlpha.fields.text({
        type: "text",
        tag: "h1",
        value: this.table.resource.title
      }, new KarmaFieldsAlpha.fields.table.tableFilters({}));
    }
    return this.field;
  }

  build() {
    // return {
    //   tag: "h1",
    //   init: h1 => {
    //     h1.element.textContent = this.table.resource.title || "Table";
    //   }
    // };
    // return this.getField().build();

    return {
      class: "table-header-title header-item",
      child: this.getField().build()
    };
  }
}

KarmaFieldsAlpha.fields.table.close = class {
  build() {
    return {
      class: "header-item",
      child: {
        tag: "button",
        class: "karma-button",
        init: button => {
          button.element.title = this.resource.title || "Close Table";
          button.element.innerHTML = '<span class="button-content">×</span>';
          button.element.onclick = async () => {
            button.element.classList.add("loading");
            KarmaFieldsAlpha.Nav.backup();
            KarmaFieldsAlpha.Nav.empty();
            await this.table.editParam();
            button.element.classList.remove("loading");
          }
        }
      }
    };
  }
}

KarmaFieldsAlpha.fields.table.pagination = class {
  build() {
    return {
      class: "table-pagination header-item",
      update: async container => {

        // container.element.classList.add("hidden");
        const count = await this.table.getCount();
        const ppp = parseInt(this.table.getPpp());
        // if (count > ppp) {
        //   container.element.classList.remove("hidden");
        // }
        container.element.classList.toggle("hidden", count <= ppp);
      },
      children: ["firstPage", "prevPage", "currentPage", "nextPage", "lastPage"].map(resource => this.table.getButton(resource).build())
    };
  }
}

KarmaFieldsAlpha.fields.table.firstPage = class {

  build() {
    return {
      tag: "button",
      class: "karma-button",
      init: (button) => {
        button.element.title = this.resource.title || "First Page";
        button.element.innerHTML = '<span class="button-content">«</span>';
      },
      update: async button => {
        button.element.classList.add("loading");

        const count = await this.table.getCount();
        const page = this.table.getPage();
        const ppp = this.table.getPpp();

        button.element.classList.remove("loading");

        // button.element.classList.toggle("hidden", ppp < 1 || page === 1);
        button.element.disabled = page === 1;
        button.element.onclick = async (event) => {
          if (page > 0) {
            button.element.classList.add("loading");
            KarmaFieldsAlpha.Nav.backup();
            KarmaFieldsAlpha.Nav.setParam("page", 1);
            await this.table.editParam();
            // await this.table.render();
            button.element.blur();
            button.element.classList.remove("loading");
          }
        }
      }
    }
  }
}

KarmaFieldsAlpha.fields.table.prevPage = class {
  build() {
    return {
      tag: "button",
      class: "karma-button",
      init: (button) => {
        button.element.title = this.resource.title || "Previous Page";
        button.element.innerHTML = '<span class="button-content">‹</span>';
      },
      update: async button => {
        button.element.classList.add("loading");

        const count = await this.table.getCount();
        const page = this.table.getPage();
        const ppp = this.table.getPpp();

        button.element.classList.remove("loading");

        button.element.disabled = (page === 1);
        button.element.onclick = async (event) => {
          if (page > 0) {
            button.element.classList.add("loading");
            KarmaFieldsAlpha.Nav.backup();
            KarmaFieldsAlpha.Nav.setParam("page", page-1);
            await this.table.editParam();
            button.element.blur();
            button.element.classList.remove("loading");
          }
        }
      }
    }
  }
}

KarmaFieldsAlpha.fields.table.nextPage = class {
  build() {
    return {
      tag: "button",
      class: "karma-button",
      init: (button) => {
        button.element.title = this.resource.title || "Next Page";
        button.element.innerHTML = '<span class="button-content">›</span>';
      },
      update: async button => {
        // const count = this.table.getCount();
        // const page = this.table.getPage();
        // const ppp = this.table.getPpp();
        // const numPage = Math.ceil(count/ppp);

        button.element.classList.add("loading");

        const count = await this.table.getCount();
        const page = this.table.getPage();
        const ppp = this.table.getPpp();
        const numPage = Math.ceil(count/ppp);

        button.element.classList.remove("loading");

        // button.element.classList.toggle("hidden", ppp < 1 || page >= numPage);
        button.element.disabled = page >= numPage;

        button.element.onclick = async (event) => {
          if (page < numPage) {
            button.element.classList.add("loading");
            KarmaFieldsAlpha.Nav.backup();
            KarmaFieldsAlpha.Nav.setParam("page", page+1);
            await this.table.editParam();
            button.element.blur();
            button.element.classList.remove("loading");
          }
        }
      }
    }
  }
}

KarmaFieldsAlpha.fields.table.lastPage = class {
  build() {
    return {
      tag: "button",
      class: "karma-button",
      init: (button) => {
        button.element.title = this.resource.title || "Last Page";
        button.element.innerHTML = '<span class="button-content">»</span>';
      },
      update: async button => {
        // const count = this.table.getCount();
        // const page = this.table.getPage();
        // const ppp = this.table.getPpp();
        // const numPage = Math.ceil(count/ppp);

        button.element.classList.add("loading");

        const count = await this.table.getCount();
        const page = this.table.getPage();
        const ppp = this.table.getPpp();
        const numPage = Math.ceil(count/ppp);

        button.element.classList.remove("loading");

        // button.element.classList.toggle("hidden", ppp < 1 || page >= numPage);
        button.element.disabled = page >= numPage;

        button.element.onclick = async (event) => {
          if (page < numPage) {
            button.element.classList.add("loading");

            KarmaFieldsAlpha.Nav.backup();
            KarmaFieldsAlpha.Nav.setParam("page", numPage);
            await this.table.editParam();
            button.element.blur();
            button.element.classList.remove("loading");
          }
        }
      }
    }
  }
}

KarmaFieldsAlpha.fields.table.currentPage = class {
  build() {
    return {
      class: "current-page header-item",
      update: async item => {
        // const count = this.table.getCount();
        // const page = this.table.getPage();
        // const ppp = this.table.getPpp();
        // const numPage = Math.ceil(count/ppp);

        item.element.classList.add("loading");

        const count = await this.table.getCount();
        const page = this.table.getPage();
        const ppp = this.table.getPpp();
        const numPage = Math.ceil(count/ppp);

        item.element.classList.remove("loading");


        // item.element.classList.toggle("hidden", ppp < 1 || count < ppp);
        item.element.textContent = count && page+" / "+numPage || "";
      }
    };
  }
}

KarmaFieldsAlpha.fields.table.total = class {

  build() {
    return {
      class: "total-items header-item",
      child: {
        update: async div => {
          const num = await this.table.getCount();
          div.element.textContent = num + " elements";
        }
      }
    }

  }

  buildX() {
    return {
      class: "total-items header-item",
      init: item => {
        this.renderItemTotal = item.render;
        item.element.tabIndex = "-1"; // for safari
      },
      update: async item => {
        // item.element.classList.add("loading");
        await this.table.getCount();
        // item.element.classList.remove("loading");
      },
      children: [
        {
          tag: "a",
          update: async a => {
            a.element.classList.toggle("hidden", !!this.editPpp);

            const num = await this.table.getCount(); //  + this.table.content.getExtraIds().length;
            a.element.textContent = num + " elements";
            a.element.onclick = event => {
              this.editPpp = true;
              this.table.renderHeader();
            }
          }
        },
        {
          class: "set-ppp",
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
                input.element.value = this.ppp || this.table.getPpp();
                input.element.oninput = event => {
                  this.ppp = input.element.value;
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
                  if (this.ppp !== this.table.getPpp()) {
                    button.element.classList.add("loading");
                    this.table.setPpp(this.ppp);
                    KarmaFieldsAlpha.Nav.setParam("page", 1);
                    KarmaFieldsAlpha.Nav.setParam("ppp", this.ppp);
                    this.ppp = null;
                    await this.table.editParam();

                    // await this.table.render();
                    button.element.classList.remove("loading");
                  }
                }
              },
              update: button => {
                button.element.disabled = !this.ppp || this.ppp === this.table.getPpp();
              },
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

}


KarmaFieldsAlpha.fields.table.prevModal = class {

  build() {
    return {
      tag: "button",
      class: "karma-button",
      init: button => {
        button.element.title = this.resource.title || "Previous";
        button.element.innerHTML = '<span class="button-content">‹</span>';
      },
      update: button => {
        const ids = this.table.content.ids || [];
        let id = KarmaFieldsAlpha.Nav.getParam("id");
        let index = ids.indexOf(id);
        button.element.disabled = index < 1;

        button.element.onclick = async (event) => {
          if (index > 0) {
            id = ids[index-1];
            button.element.classList.add("loading");
            KarmaFieldsAlpha.Nav.backup();
            KarmaFieldsAlpha.Nav.setParam("id", id);
            await this.table.editParam();
            button.element.classList.remove("loading");
          }
        }
      }
    };
  }
}

KarmaFieldsAlpha.fields.table.nextModal = class {

  build() {
    return {
      tag: "button",
      class: "karma-button",
      init: button => {
        button.element.title = this.resource.title || "Next";
        button.element.innerHTML = '<span class="button-content">›</span>';
      },
      update: button => {
        const ids = this.table.content.ids || [];
        let id = KarmaFieldsAlpha.Nav.getParam("id");
        let index = ids.indexOf(id);
        button.element.disabled = index === -1 || index >= ids.length - 1;

        button.element.onclick = async (event) => {
          if (index > -1 && index < ids.length - 1) {
            id = ids[index+1];
            button.element.classList.add("loading");
            KarmaFieldsAlpha.Nav.backup();
            KarmaFieldsAlpha.Nav.setParam("id", id);
            await this.table.editParam();
            button.element.classList.remove("loading");
          }
        }
      }
    };
  }
}

KarmaFieldsAlpha.fields.table.closeModal = class {

  build() {
    return {
      tag: "button",
      class: "karma-button",
      init: button => {
        button.element.title = this.resource.title || "Close Modal";
        button.element.innerHTML = '<span class="button-content">×</span>';
        button.element.onclick = async () => {
          button.element.classList.add("loading");
          KarmaFieldsAlpha.Nav.backup();
          KarmaFieldsAlpha.Nav.removeParam("id");
          await this.table.editParam();
          button.element.classList.remove("loading");
        }
      }
    }
  }
}


KarmaFieldsAlpha.fields.table.settings = class {
  build() {
    return {
      class: "header-item",
      child: {
        tag: "button",
        class: "karma-button",
        child: {
          init: span => {
            span.element.innerHTML = "Options";
          }
        },
        init: button => {
          button.element.title = this.resource.title || "Open options";
          // button.element.innerHTML = '<span class="button-content">Options</span>';
          button.element.onclick = async () => {
            this.parent.options.open = !this.parent.options.open;
            await this.parent.render();
          }
        }
      }
    };
  }
}

// KarmaFieldsAlpha.fields.table.closeTable = class {
//
//   build() {
//     return {
//       tag: "button",
//       class: "karma-button",
//       init: button => {
//         button.element.title = this.resource.title || "Close Table";
//         button.element.innerHTML = '<span class="button-content">×</span>';
//       },
//       init: button => {
//         button.element.onclick = async () => {
//           button.element.classList.add("loading");
//           KarmaFieldsAlpha.Nav.backup();
//           KarmaFieldsAlpha.Nav.setParamString("");
//           await this.table.editParam();
//           button.element.classList.remove("loading");
//         }
//       }
//     }
//   }
//
// }
