
KarmaFieldsAlpha.fields.table.tableContent = class extends KarmaFieldsAlpha.fields.form {

  constructor(...params) {
    super(...params);

    this.extraOrders = {};


    // if (this.resource.autosave) {
    //   let onsave = () => {
    //
    //
    //     setTimeout(async () => {
    //       const modified = await this.isModified();
    //       console.log(modified);
    //       if (modified) {
    //         await this.save();
    //         await this.edit();
    //       }
    //       onsave();
    //     }, this.resource.saveinterval || 10000);
    //   }
    //   onsave();
    // }

  }


  // getMask(id, key) {
	// 	// if (key  === "trash") {
	// 	// 	return "1";
	// 	// }
  //
  //   switch (key) {
  //     case "trash": return "1";
  //     case "extra": return "1";
  //   }
	// }

  async edit() {
    await this.table.renderFooter();

    // await Promise.all(this.table.subsections.map(field => field.update && field.update())); // needed for arsenic (update spectacle data when checking présence)
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

  // async fetchValue(deprec, ...path) {
  //
  //   const [id, key] = path;
  //
  //   let value = super.fetchValue(null, ...path);
  //
  //   if (key === "trash" && !value) {
  //     value = ["1"];
  //   }
  //
  //   return value;
  // }

  async getIds() {
    const queriedIds = await this.getQueriedIds();

    const ids = queriedIds.filter(id => {
      const value = this.getDeltaValue(id, "trash"); // || this.buffer.get(id, "trash");
      return !value || value.toString() !== "1";
      // this.getDeltaValue(id, "trash") !== "1"
    });

    Object.keys(this.getDeltaValue() || {}).filter(id => {
      const value = this.getDeltaValue(id, "trash");
      return value && value.toString() === "0" && !ids.includes(id);
    }).reverse().forEach(id => {
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

  // async queryRelations() {
  //
  //   const driver = this.table.resource.driver || this.table.resource.key;
  //   const ids = await this.getQueriedIds();
	// 	const relations = await KarmaFieldsAlpha.Gateway.getRelations(driver, ids);
  //
  //   const groups = relations.reduce((group, item) => {
	// 		if (!item.id) {
	// 			console.error("item does not have id");
	// 		}
	// 		if (!group[item.id]) {
	// 			group[item.id] = {};
	// 		}
	// 		for (let key in item) {
	// 			if (key !== "id") {
	// 				if (!group[item.id][key]) {
	// 					group[item.id][key] = [];
	// 				}
	// 				group[item.id][key].push(item[key]);
	// 			}
	// 		}
	// 		return group;
	// 	}, {});
  //
	// 	for (let id in groups) {
	// 		for (let key in groups[id]) {
  //       this.buffer.set(groups[id][key], id.toString(), key);
	// 		}
	// 	}
  //
	// }


  // mouseover(event, col, row) {
  //   if (event.buttons === 1) {
  //     let width = 1;
  //     let height = 1;
  //     if (col === undefined) {
  //       col = 0;
  //       width = this.manager.grid.width;
  //     }
  //     if (row === undefined) {
  //       row = 0;
  //       height = this.manager.grid.height;
  //     }
  //     this.manager.growSelection({x: colIndex, y: 0, width: 1, height: this.manager.grid.height});
  //   }
  // }









  async queryRelations(...keys) {

    const driver = this.table.resource.driver || this.table.resource.key;
    const ids = await this.getQueriedIds();
		const relations = await KarmaFieldsAlpha.Gateway.getRelations(driver, ids, keys);

    if (relations.length) {
      const groups = relations.reduce((group, item) => {
  			if (!item.id) {
  				console.error("item does not have id");
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
            // group[item.id][key].sort();
  				}
  			}
  			return group;
  		}, {});

      for (let id of ids) {
  			for (let key of keys) {
          this.buffer.set(groups[id] && groups[id][key] || [], id.toString(), key);
  			}
  		}
    }

	}

  async queryTable() {
    const paramString = this.table.getParamString();
    const driver = this.table.resource.driver || this.table.resource.key;
    const results = await KarmaFieldsAlpha.Gateway.getTable(driver, paramString);

		// (results.items || results || []).forEach(row => {
    //   this.buffer.set(row, row.id.toString());
		// });
    for (let item of results.items || results || []) {

      for (let key in item) {
        // const keyPath = item.id+"/"+key;
        // this.valuePromises[keyPath] = Promise.resolve(item[key]);

        this.buffer.set([item[key]], item.id.toString(), key);
      }

      this.buffer.set(["0"], item.id.toString(), "trash");
    }
    return results;
  }

  async getRemoteTable() {
    if (!this.tablePromise) {
      this.tablePromise = this.queryTable();
    }
    return this.tablePromise;
  }




  // async getRemoteTable() {
  //   if (!this.tablePromise) {
  //     const paramString = this.table.getParamString();
  //     const driver = this.table.resource.driver || this.table.resource.key;
  //     this.tablePromise = KarmaFieldsAlpha.Gateway.getTable(driver, paramString);
  //
  //     const results = await this.tablePromise;
  //
  //     for (let item of results.items || results || []) {
  //       for (let key in item) {
  //         const keyPath = item.id+"/"+key;
  //         this.valuePromises[keyPath] = Promise.resolve(item[key]);
  //       }
  //     }
  //   }
  //   return this.tablePromise;
  // }

  async getRemoteRelations(key) {
    if (!this.relationPromises) {
  		this.relationPromises = {};
    }
    if (!this.relationPromises[key]) {
  		this.relationPromises[key] = this.queryRelations(key);
    }
    return this.relationPromises[key];
  }

  async getRemoteValue(id, key) {
    await this.getRemoteTable();

    // let value;
    //
    // if (key === "trash") {
    //   value = this.buffer.get(id) && "0" || "1";
    // } else {
    //   value = this.buffer.get(id, key);
    // }

    let value = this.buffer.get(id, key);

    if (!value && key === "trash") {
      value = ["1"];
    }

    if (!value) {
      await this.getRemoteRelations(key);
      value = await super.getRemoteValue(id, key);
    }

    return value;
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


  // // override getOriginal from Form
  // // -> make save button not highlight when canceling add item...
  // getOriginal(...path) {
  //   // const original = super.getOriginal(...path);
  //   // const [id, key] = path;
  //   // if (key === "trash" && original === undefined) {
  //   //   return "1";
  //   // }
  //   // return original;
  //
  //   const [id, key] = path;
  //
  //   if (key === "trash") {
  //     return super.getOriginal(id) && "0" || "1";
  //   }
  //
  //   return super.getOriginal(...path);
  // }

  reset() {
    super.reset();
    this.tablePromise = null;
    this.relationPromises = {};
  }

  async add(num) {

    const ids = await KarmaFieldsAlpha.Gateway.add(this.resource.driver, {num: num || 1});

    for (let id of ids) {

      for (let field of this.table.getRow(id).getDescendants()) {

        const path = field.getPath();

        this.buffer.set([], ...path);
        // this.setDeltaValue(await field.getDefault(), ...path);
        this.writeHistory([], ...path);

      }

      // this.writeHistory(["1"], id, "trash");
      this.writeHistory(["1"], id, "trash");
      this.buffer.set(["1"], id, "trash");

    }

    KarmaFieldsAlpha.History.backup();
    KarmaFieldsAlpha.History.id = null;

    for (let id of ids) {

      // await this.write(id);

      for (let field of this.table.getRow(id).getDescendants()) {

        const value = await field.getDefault();
        await field.setValue(null, value);

      }

      await this.setValue(null, ["0"], id, "trash");

    }

    return ids;
  }

  async remove() {
    let ids = await this.getSelectedIds();

    if (ids.length) {

      for (let id of ids) {

        this.writeHistory("0", id, "trash");

        for (let field of this.table.getRow(id).getDescendants()) {

          await field.write();

        }

      }

      KarmaFieldsAlpha.History.backup();
      KarmaFieldsAlpha.History.id = null;

      for (let id of ids) {

        await this.setValue(null, ["1"], id, "trash");

        for (let field of this.table.getRow(id).getDescendants()) {

          // this.writeHistory(null, ...field.getPath());
          await field.removeValue();

        }

      }

    }
  }

  async duplicate() {
    let ids = await this.getSelectedIds();

    if (ids.length) {
      const cloneIds = await this.add(ids.length);

      for (let i = 0; i < ids.length; i++) {
        let id = ids[i];
        let cloneId = cloneIds[i];

        // replace default values of clone by originals
        // KarmaFieldsAlpha.DeepObject.forEach(this.content.getDeltaValue(cloneId), (value, key) => {
        //   if (key) {
        //     this.content.setValue(null, this.content.getValue(id, key), cloneId, key);
        //   }
        // });

        for (let field of this.table.getRow(id).getDescendants()) {

          const path = field.getPath().slice(1);
          const value = await field.fetchValue();
          this.setValue(null, value, cloneId, ...path);

        }

        const contentIds = await this.getIds();

        let index = contentIds.indexOf(ids[ids.length-1]);
        this.setOrder(cloneId, index+1);

      }

    }
  }


  async getSelectedIds() {
    return [];
  }

  // async save() {
  //
  //   await super.save();
  //
  //   this.tablePromise = null;
  //   this.relationPromises = {};
  //
  //
	// }

  hasIndex() {
    return this.table.resource.index || this.table.resource.index === undefined;
  }



  getIndexWidth() {
    return this.table.resource.index && this.table.resource.index.width || "50px";
  }

  getColumns() {
    return this.table.resource.columns || [];
  }

  hasHeader() {
    return true;
  }



  * rowIndexGenerator(ids) {
    let index = 0;


    // for (let id of ids) {
    while (ids) {

      let id = ids[index%ids.length];

      if (this.getValue(id, "trash") !== "1") {

        index++;

        const page = parseInt(this.table.getPage());
        const ppp = parseInt(this.table.getPpp());

        yield (page - 1)*ppp + index;

      } else {

        yield "+";

      }

    }


	}



  // buildHeaderCell(column) {
  //   return {
  //     class: "th karma-field",
  //     update: th => {
  //       th.children = [
  //         {
  //           tag: "a",
  //           class: "header-cell-title",
  //           init: a => {
  //             a.element.textContent = column.title;
  //           }
  //         }
  //       ];
  //       if (column.sortable) {
  //         th.children.push(this.table.getButton("orderLink").build(column));
  //       }
  //     }
  //   };
  // }

  // buildIndexCell(rowIndex) {
  //   return {
  //     class: "th table-row-index karma-field",
  //     update: th => {
  //       if (rowIndex < 0) {
  //         th.element.textContent = "+";
  //       } else {
  //         let page = parseInt(this.table.getPage());
  //         let ppp = parseInt(this.table.getPpp());
  //         th.element.textContent = (page - 1)*ppp + rowIndex + 1;
  //       }
  //     }
  //   };
  // }

  buildGrid() {
    return {
      class: "table grid",
      init: async grid => {
        if (this.table.resource.style) {
					grid.element.style = this.table.resource.style;
				}
        this.registerTable(grid.element);
        console.log("registerTable");
      },
      update: async grid => {



        let ids = await this.getIds();

        if (ids.length) {

          // const rowIndexGenerator = this.rowIndexGenerator(ids);


          grid.element.classList.add("filled"); // -> draw table borders

          grid.children = [
            {
              class: "th table-header-index karma-field",
              init: th => {
                th.element.textContent = this.table.resource.index && this.table.resource.index.title || "#";
                this.registerHeaderIndex(th.element);
              }
            },
            ...this.getColumns().map((column, colIndex) => {
              return {
                class: "th karma-field",
                init: th => {
                  this.registerHeader(th.element, colIndex);
                  if (column.style) {
                    th.element.style = column.style;
                  }
                },
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
              }
            }),
            ...ids.reduce((children, id, rowIndex) => {
              return [
                ...children,
                {
                  class: "th table-row-index karma-field",
                  init: th => {

                    this.registerIndex(th.element, rowIndex);
                  },
                  update: th => {
                    // th.element.textContent = rowIndexGenerator.next().value;

                    const page = parseInt(this.table.getPage());
                    const ppp = parseInt(this.table.getPpp());

                    th.element.textContent = (page - 1)*ppp + rowIndex + 1;
                  }
                },
                ...this.table.getRow(id).children.map((field, colIndex) => {
                  return {
                    class: "td table-cell",
                    init: td => {
                      if (this.table.resource.columns[colIndex].style) {
                        td.element.style = this.table.resource.columns[colIndex].style;
                      }
                      this.registerCell(field, td.element, colIndex, rowIndex);
                    },
                    update: td => {

                    },
                    child: field.build()
                  };
                })
              ];
            }, [])
          ];

          grid.element.style.gridTemplateColumns = [this.getIndexWidth(), ...this.getColumns().map(column => column.width || "auto")].join(" ");


        } else {

          grid.children = [];

          grid.element.classList.remove("filled");

        }


      },
      complete: grid => {

        // grid.element.classList.remove("loading");
        // grid.element.classList.add("ready");

        // this.table.select.registerTable(grid.element, this.getColumns().length, this.children.length, this.hasIndex(), this.hasHeader());
        // this.table.select.registerTable(grid.element);




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


  registerTable(element) {}

  registerCell(field, element, col, row) {}

	registerIndex(element, row) {}

	registerHeader(element, col) {}

	registerHeaderIndex(element) {}




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
