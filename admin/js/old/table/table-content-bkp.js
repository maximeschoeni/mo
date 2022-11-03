
KarmaFieldsAlpha.fields.table.tableContent = class extends KarmaFieldsAlpha.fields.form {

  constructor(...params) {
    super(...params);

    this.extraOrders = {};


  }


  getMask(id, key) {
		// if (key  === "trash") {
		// 	return "1";
		// }

    switch (key) {
      case "trash": return "1";
      case "extra": return "1";
    }
	}

  async edit() {
    await this.table.renderFooter();
  };

  // getExtraIds() {
  //   // const ids = [];
  //   // const delta = this.getDeltaValue();
  //   // for (let id in delta) {
  //   //   if (delta[id].extra) {
  //   //     ids.push(id);
  //   //   }
  //   // }
  //   // return ids;
  //   // const delta = this.getDeltaValue() || {};
  //   // return Object.entries(delta).filter(([id, row]) => row && row.extra !== undefined).map(([id, row]) => id);
  //   //
  //   //
  //   // const delta = this.getDeltaValue() || {};
  //   // return Object.entries(delta).filter(([id, row]) => row && row.extra !== "0").map(([id, row]) => id);
  //
  //
  //   return Object.keys(this.getDeltaValue() || {}).filter(id => this.getDeltaValue(id, "trash") === "0" && !this.ids.includes(id));
  // }

  getIds() {
    const queriedIds = await this.getQueriedIds();
    const ids = queriedIds.filter(id => this.getValue(id, "trash") !== "1");

    Object.keys(this.getDeltaValue() || {}).filter(id => this.getDeltaValue(id, "trash") === "0" && !ids.includes(id)).reverse().forEach(id => {
      ids.splice(this.getOrder(id), 0, id);
    });

    return ids;
  }

  getOrder(id) {
    return this.extraOrders && this.extraOrders[id] || 0;
  }

  setOrder(id, order) {
    if (!this.extraOrders) {
      this.extraOrders = {};
    }
    this.extraOrders[id] = order;
  }

  // updateIds() {
  //
  //   const extraIds = this.getExtraIds();
  //
  //   // extraIds.forEach(id => {
  //   //   this.registerValue("1", id, "trash");
  //   //   // KarmaFieldsAlpha.Gateway.setOriginal("1", this.resource.driver, id, "trash");
  //   // });
  //   this.ids = [
  //     ...extraIds.filter(id => !this.table.queriedIds.includes(id)),
  //     ...this.table.queriedIds
  //   ].filter(id => this.getValue(id, "trash") === "0"); // trash may be set in originals
  // }

  async getQueriedIds() {
    const results = await this.getRemoteTable();
    return (results.items || results || []).map(row => row.id);
  }

  async queryRelations() {

    const ids = await this.getQueriedIds();
		const key = "relations/"+this.table.resource.driver+"?ids="+ids.join(",");

		const relation = await this.get(key);

    const groups = relations.reduce((group, item) => {
			if (!item.id) {
				console.error("Gateway::addRelations, item does not have id");
			}
			if (!group[item.id]) {
				group[item.id] = {};
			}
			for (let key in item) {
				if (key !== "id") {
					if (!group[item.id][key]) {
						group[item.id][key] = [];
					}
					group[item.id][key].push(item[key]);
				}
			}
			return group;
		}, {});

		for (let id in groups) {
			for (let key in groups[id]) {
        this.buffer.set(groups[id][key], id.toString(), key);
			}
		}

	}

  async queryTable() {
    const key = "query/"+this.table.resource.driver+"?"+this.table.getParamString();
    const results = await this.get(key);
		(results.items || results || []).forEach(row => {
      this.buffer.set(row, id.toString(), key);
		});
  }

  async getRemoteTable() {
    if (!this.tablePromise) {
      this.tablePromise = this.queryTable();
    }
    return this.tablePromise;
  }

  async getRemoteRelations() {
    if (!this.relationPromise) {
  		this.relationPromise = this.queryRelations();
    }
    return this.relationPromise;
  }

  async getRemoteValue(...path) {
    await this.getRemoteTable();

    let value = this.buffer.get(...path);

    if (value === undefined) {
      await getRemoteRelations();
      value = await super.getRemoteValue();
    }

    return value;
  }

  resetTable() {
    this.content.tablePromise = null;
    this.content.relationPromise = null;
  }

  // async fetchValue(expectedType, ...path) {
  //
	// 	let value = this.getDeltaValue(...path);
  //
  //   await this.table.tablePromise;
  //
	// 	if (value === undefined) {
	// 		value = this.getOriginal(...path);
	// 		if (value === undefined) {
  //       value = await this.getRelationValue(...path);
  //     	if (value === undefined) {
  //         value = await KarmaFieldsAlpha.Gateway.getValue2(this.resource.driver, ...path);
	// 			}
	// 		}
	// 	}
  //
  //
	// 	value = this.format(value, expectedType);
  //
  //
  //
	// 	// value = KarmaFieldsAlpha.Type.parse(value, this.resource.driver, ...path);
  //
	// 	return value;
  // }


  // override getOriginal from Form
  // -> make save button not highlight when canceling add item...
  getOriginal(...path) {
    // const original = super.getOriginal(...path);
    // const [id, key] = path;
    // if (key === "trash" && original === undefined) {
    //   return "1";
    // }
    // return original;

    const [id, key] = path;

    if (key === "trash") {
      return super.getOriginal(id) && "0" || "1";
    }

    return super.getOriginal(...path);
  }

  hasIndex() {
    return this.table.resource.index || this.table.resource.index === undefined;
  }

  getIndexTitle() {
    return this.table.resource.index && this.table.resource.index.title || "#";
  }

  getIndexWidth() {
    return this.table.resource.index && this.table.resource.index.width || "auto";
  }

  getColumns() {
    return this.table.resource.columns || [];
  }

  hasHeader() {
    return true;
  }

  * rowIndexGenerator(ids) {
    let index = 0;

    if (this.getValue(ids[0], "trash") !== "1") {

      index++;

      const page = parseInt(this.table.getPage());
      const ppp = parseInt(this.table.getPpp());

      yield (page - 1)*ppp + rowIndex;

    }

    yield "+";

	}

  buildHeaderCell(column) {
    return {
      class: "th karma-field",
      update: th => {
        th.children = [
          {
            tag: "a",
            class: "header-cell-title",
            init: a => {
              a.element.textContent = column.title;
            }
          }
        ];
        if (column.sortable) {
          th.children.push(this.table.getButton("orderLink").build(column));
        }
      }
    };
  }

  buildIndexCell(rowIndex) {
    return {
      class: "th table-row-index karma-field",
      update: th => {
        if (rowIndex < 0) {
          th.element.textContent = "+";
        } else {
          let page = parseInt(this.table.getPage());
          let ppp = parseInt(this.table.getPpp());
          th.element.textContent = (page - 1)*ppp + rowIndex + 1;
        }
      }
    };
  }

  buildGrid() {
    return {
      class: "table grid",
      init: async grid => {
        if (this.table.resource.style) {
					grid.element.style = this.table.resource.style;
				}
      },
      update: async grid => {
        grid.children = [];

        // await new Promise(resolve => setTimeout(resolve, 1000000));

        // await (this.table.queryPromise || this.table.query());

        let ids = await this.getIds();
        // this.updateIds();
        // this.ids = this.table.queriedIds.filter(id => this.getValue(id, "trash") !== "1");
        //
        // // const extras = this.getExtra();
        //
        //
        // this.getExtraIds().forEach(id => {
        //   this.ids.splice(this.extraOrders[id] || 0, 0, id);
        // });
        //
        // for (let id in extraIds) {
        //
        //   if (this.getDeltaValue(id, "trash") !== "1") {
        //
        //   }
        //
        //     this.ids.splice(parseInt(extraIds[id].index) || 0, 0, id);
        // }


        // for (let id in extras) {
        //
        //   // const extra = KarmaFieldsAlpha.DeepObject.clone(extras[id], this.getDeltaValue(id));
        //
        //   if (this.getDeltaValue(id, "trash") !== "1") {
        //     this.ids.splice(parseInt(extras[id].index) || 0, 0, id);
        //   }
        // }

        // extraIds.forEach(id => {
        //   this.registerValue("1", id, "trash");
        //   // KarmaFieldsAlpha.Gateway.setOriginal("1", this.resource.driver, id, "trash");
        // });
        // this.ids = [
        //   ...extraIds.filter(id => !this.table.queriedIds.includes(id)),
        //   ...this.table.queriedIds
        // ].filter(id => this.getValue(id, "trash") === "0"); // trash may be set in originals


        const rows = ids.map(id => this.table.getRow(id));

        const rowIndexGenerator = this.rowIndexGenerator(ids);

        if (rows.length) {

          grid.element.classList.add("filled"); // -> draw table borders



          // table header index cell
          if (this.hasIndex() && this.hasHeader()) {
            grid.children.push({
              class: "th table-header-index karma-field",
              init: th => {
                th.element.textContent = this.getIndexTitle();
              }
            });
          }

          // table header cells
          if (this.hasHeader()) {
            this.getColumns().forEach((column, colIndex) => {
              grid.children.push(this.buildHeaderCell(column));
            });
          }

          // let index = 0;


          rows.forEach(rowField => {
            if (this.hasIndex()) {
              // let rowIndex = rowField.getValue("trash") !== "1" && ++index;
              grid.children.push({
                class: "th table-row-index karma-field",
                update: th => {
                  // th.element.textContent = rowIndex && (parseInt(this.table.getPage()) - 1)*parseInt(this.table.getPpp()) + rowIndex || "+";
                  th.element.textContent = this.rowIndexGenerator.next().value;
                }
              });
            }

            this.getColumns().forEach((column, colIndex) => {
              const cellField = rowField.children[colIndex];
              if (cellField) {
                grid.children.push(cellField.build());
              }
            });
          });

        }

        grid.element.style.gridTemplateColumns = (this.hasIndex() && this.hasHeader() && [this.getIndexWidth()] || []).concat(this.getColumns().map((column) => {
          return column.width || "1fr";
        })).join(" ");



      },
      complete: grid => {

        // grid.element.classList.remove("loading");
        // grid.element.classList.add("ready");

        this.table.select.registerTable(grid.element, this.getColumns().length, this.children.length, this.hasIndex(), this.hasHeader());
      }
    };

  }

  build() {
    return {
      class: "table-body",
      init: body => {
        this.render = body.render;
      },
      child: this.buildGrid(),
      // update: async body => {
      //
      //   body.element.classList.add("loading");
      //   await (this.table.queryPromise || this.table.query());
      //
      //   if (this.table.queriedIds && this.table.queriedIds.length || this.table.getExtraIds().length) {
      //     body.child = this.buildGrid();
      //   } else {
      //     body.child = null;
      //   }
      // },
      complete: () => {
        // this.table.renderFooter(); // -> double render footer about always !
      }
    }
  }




  // setValue(value, rowId, key) {
  //
  //   const field = this.find(rowId, key);
  //
  //   if (field.constructor === KarmaFieldsAlpha.fields.input) {
  //
  //     this.table.getSelectedRowIds().forEach(id => {
  //       super.setValue(value, id, key);
  //       if (id !== rowId) {
  //         this.find(id, key).render();
  //       }
  //     });
  //
  //   } else {
  //
  //     super.setValue(value, rowId, key);
  //
  //   }
  //
  // }
  //
  // backup(id, key) {
  //
	// 	const historyId = id+"/"+key;
  //
	// 	if (historyId !== this.historyId) {
  //
	// 		this.historyId = historyId;
  //
  //     this.table.getSelectedRowIds().forEach(id => {
  //       this.write(id, key);
  //     });
  //
	// 		KarmaFieldsAlpha.History.backup();
	// 	}
	// }




}
