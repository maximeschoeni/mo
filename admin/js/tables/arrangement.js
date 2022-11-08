
KarmaFieldsAlpha.field.layout.arrangement = class extends KarmaFieldsAlpha.field.layout.collection {

  async swap(index, length, target) {

    const ids = this.getIds();
    const clones = [...ids];
    const slice = clones.splice(index, length);
    clones.splice(target, 0, ...slice);

    for (let i in clones) {
      await this.setValue(i, clones[i], this.resource.orderby || "menu_order");
    }

    this.idsBuffer.set(clones);

  }

  build() {

    return {
      class: "karma-field-table-grid-container karma-field-frame karma-field-group arrangement",
      init: body => {
        body.element.tabIndex = -1;
      },
      update: body => {
        this.clipboard = this.createChild("clipboard");
        body.element.onfocus = async event => {
          const selection = this.selectionBuffer.get();
          if (selection) {
            KarmaFieldsAlpha.History.save();
            this.selectionBuffer.change(null);
            await this.parent.request("render");
          }
          this.clipboard.output("");
          this.clipboard.focus();
        }
        body.children = [
          this.clipboard.build(),
          {
            class: "table grid",
            init: async grid => {
              if (this.resource.style) {
                grid.element.style = this.resource.style;
              }
            },
            update: async grid => {

              const ids = this.getIds();
              const page = this.getPage();
              const ppp = this.getPpp();
              const offset = (page - 1)*ppp;
              const columns = this.getColumns();

              this.clipboard.onInput = async value => {
                const dataArray = KarmaFieldsAlpha.Clipboard.parse(value);
                const data = KarmaFieldsAlpha.Clipboard.toJson(dataArray);
                const selection = this.selectionBuffer.get() || {};

                if (selection.length || data.length) {
                  KarmaFieldsAlpha.History.save();
                  await this.import(data, selection.index, selection.length);
                  this.selectionBuffer.change(null);
                  await this.parent.request("render");
                }

              }

              const selection = this.selectionBuffer.get();

              grid.element.colCount = columns.length;
              grid.element.rowCount = ids.length;
              grid.element.colHeader = 0;
              grid.element.rowHeader = 0;


              if (ids.length) {
                grid.element.classList.add("filled"); // -> draw table borders
                grid.children = ids.reduce((children, id, rowIndex) => {

                  const row = this.createChild({
                    key: id,
                    type: "row",
                    children: this.resource.children || [],
                    index: offset + rowIndex + 1
                  });

                  const isSelected = selection && KarmaFieldsAlpha.Segment.contain(selection, rowIndex);

                  row.index = offset + rowIndex + 1;
                  row.isSelected = isSelected;
                  row.rowIndex = rowIndex;

                  return [
                    ...children,
                    ...columns.map((colId, colIndex) => {
                      const child = this.resource.children[colId];
                      const field = row.createChild(child);
                      return {
                        class: "td table-cell",
                        init: td => {
                          if (child.style) {
                            td.element.style = child.style;
                          }
                          td.element.tabIndex = -1;
                        },
                        update: td => {
                          td.element.classList.add("loading");
                          td.element.classList.toggle("selected", Boolean(isSelected));
                          td.element.rowIndex = rowIndex;
                          td.element.colIndex = colIndex;

                          td.element.onmousedown = async event => {

                            if (event.buttons === 1) {

                              const selectionManager = new KarmaFieldsAlpha.SortManager(grid.element);

                              const currentSelection = selectionManager.selection = this.selectionBuffer.get();

                              selectionManager.onSelect = async (selection) => {

                                if (!KarmaFieldsAlpha.Segment.compare(currentSelection, selection)) {
                                  KarmaFieldsAlpha.History.save();
                                  this.selectionBuffer.change(selection, currentSelection);
                                }

                                const jsonData = await this.export([], selection.index, selection.length);
                                const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
                                const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                                this.clipboard.output(value);
                                this.clipboard.focus();
                                await this.parent.request("render");

                              };

                              selectionManager.onSort = async (index, length, target) => {

                                KarmaFieldsAlpha.History.save();

                                await this.swap(index, length, target);
                                this.selectionBuffer.change({index: target, length: length}, currentSelection);

                                const jsonData = await this.export([], selection.index, selection.length);
                                const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
                                const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);

                                this.clipboard.output(value);
                                this.clipboard.focus();


                                await this.parent.request("render");

                              };

                              selectionManager.select(event, colIndex, rowIndex, field.resource.selectMode !== "row");

                            }

                          }

                        },
                        complete: td => {
                          td.element.classList.remove("loading");
                        },
                        child: field.build()
                      };
                    })
                  ];
                }, []);

                grid.element.style.gridTemplateColumns = columns.map(index => this.resource.children[index].width || "auto").join(" ");

              } else {
                grid.children = [];
                grid.element.classList.remove("filled");
              }
            },
            complete: async grid => {
              if (document.activeElement === document.body) {
                // const jsonData = await this.parent.request("export");
                const jsonData = await this.exportSelection();
                const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray(jsonData);
                const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                this.clipboard.output(value);
                this.clipboard.focus();
              }
            }
          }
        ];
      }
    }

  }


}
