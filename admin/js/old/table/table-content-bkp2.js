
KarmaFieldsAlpha.fields.table.tableContent = class extends KarmaFieldsAlpha.fields.form {

  constructor(...params) {
    super(...params);

    this.extraOrders = {};

    this.manager = new this.constructor.SelectManager();

    this.manager.ta.oninput = async event => {

      let data = this.manager.ta.value.split(/[\r\n]/).map(row => row.split("\t"));

      await this.importSelection(data, event.inputType);

      switch (event.inputType) {

        case "insertFromPaste":
        case "deleteByCut":

        case "deleteContentBackward":
        case "deleteContentForward":
        case "deleteContent":
          ta.blur();

      }

      this.table.render();
    }

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

  async getIds() {
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

  async getSelectedIds() {
    if (KarmaFieldsAlpha.Nav.hasParam("id")) {
      return [KarmaFieldsAlpha.Nav.getParam("id")];
    } else if (this.manager.selection && this.manager.selection.width === this.manager.grid.width) {
      const ids = await this.getIds();
      return ids.slice(this.manager.selection.y, this.manager.selection.y + this.manager.selection.height);
    }
    return [];
  }

  async importSelection(data) {
    const selection = this.manager.selection;

    if (selection) {

      const x = selection.x;
      const y = selection.y;

      let ids = await this.getIds();

      for (let j = 0; j < Math.max(selection.height, data.length); j++) {
        const rowField = this.getChild(ids[j+y]);
        if (rowField) {
          for (let i = 0; i < Math.max(selection.width, data[j%data.length].length); i++) {
            const cellField = rowField.children[i+x];
            if (cellField) {
              await cellField.write();
            }
          }
        }
      }

      if (data.length > ids.length-y) {
        await this.table.add(data.length-(ids.length-y), false); // -> will backup
        ids = await this.getIds();
      } else if (id !== KarmaFieldsAlpha.History.id) {
        KarmaFieldsAlpha.History.backup();
        KarmaFieldsAlpha.History.id = id;
      }

      for (let j = 0; j < Math.max(selection.height, data.length); j++) {
        const rowField = this.getChild(ids[j+y]);
        for (let i = 0; i < Math.max(selection.width, data[j%data.length].length); i++) {
          const cellField = rowField.children[i+x];
          const value = data[j%data.length][i%data[j%data.length].length];
          await cellField.importValue(value);
          await cellField.render();
        }
      }

    }

  }

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

		(results.items || results || []).forEach(row => {
      this.buffer.set(row, row.id.toString());
		});
    return results;
  }

  async getRemoteTable() {
    if (!this.tablePromise) {
      this.tablePromise = this.queryTable();
    }
    return this.tablePromise;
  }

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

    let value = this.buffer.get(id, key);

    if (key === "trash") {
      value = this.buffer.get(id) && "0" || "1";
    }

    if (value === undefined) {
      await this.getRemoteRelations(key);

      value = await super.getRemoteValue(id, key);

    }

    return value;
  }

  resetTable() {
    this.content.tablePromise = null;
    this.content.relationPromises = {};
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

  async save() {

    await super.save();

    this.tablePromise = null;
    this.relationPromises = {};


	}

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

    for (let id of ids) {

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
      },
      update: async grid => {


        grid.element.onmouseup = event => {
          if (this.manager.selection) {
            if (this.manager.selection.width > 1 || this.manager.selection.height > 1) {
              //this.trigger("select");
            } else {
              this.manager.endSelection();
            }
          }
        }


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




        if (ids.length) {

          // const rows = ids.map(id => this.table.getRow(id));

          const rowIndexGenerator = this.rowIndexGenerator(ids);

          grid.element.classList.add("filled"); // -> draw table borders

          grid.children = [
            {
              class: "th table-header-index karma-field",
              init: th => {
                th.element.textContent = this.table.resource.index && this.table.resource.index.title || "#";
                this.registerHeaderIndex(th.element);
                // th.element.onmousemove = event => {
                //   if (event.buttons === 1) {
              	// 		this.manager.growSelection({x:0, y:0, width:this.manager.grid.width, height:this.manager.grid.height});
                //   }
            		// }
              }
            },
            ...this.getColumns().map((column, colIndex) => {
              return {
                class: "th karma-field",
                init: th => {
                  this.registerHeader(th.element, colIndex);
                  // th.element.onmousemove = event => this.mouseover(event, colIndex);
                  // th.element.onmousemove = event => {
                  //   if (event.buttons === 1) {
                	// 		this.manager.growSelection({x: colIndex, y: 0, width: 1, height: this.manager.grid.height});
                  //   }
              		// }
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
                    // this.table.select.registerIndex(th.element, rowIndex);
                    // th.element.onmousemove = event => {
                    //   if (event.buttons === 1) {
                  	// 		this.manager.growSelection({x: 0, y: rowIndex, width: this.manager.grid.width, height: 1});
                    //   }
                		// }
                    this.registerIndex(th.element, rowIndex);
                  },
                  update: th => {
                    th.element.textContent = rowIndexGenerator.next().value;
                  }
                },
                ...this.table.getRow(id).children.map((field, colIndex) => {
                  return {
                    class: "td table-cell",
                    update: td => {
                      this.registerCell(field, td.element, colIndex, rowIndex);
                      // this.table.select.registerCell(td.element, field, colIndex, rowIndex);
                      // this.manager.grid.set(colIndex, rowIndex, td.element);
                      // td.element.onmousemove = event => {
                      //   if (event.buttons === 1) {
                    	// 		this.manager.growSelection({x: colIndex, y:rowIndex, width: 1, height: 1});
                    	// 	}
                  		// }
                    },
                    child: field.build()
                  };
                })
              ];
            }, [])
          ];

          grid.element.style.gridTemplateColumns = [this.getIndexWidth(), ...this.getColumns().map(column => column.width || "auto")].join(" ");



          // // table header index cell
          // grid.children.push({
          //   class: "th table-header-index karma-field",
          //   init: th => {
          //     th.element.textContent = this.getIndexTitle();
          //   }
          // });
          //
          // // table header cells
          // this.getColumns().forEach((column, colIndex) => {
          //   grid.children.push(this.buildHeaderCell(column));
          // });
          //
          // // let index = 0;
          //
          //
          // rows.forEach(rowField => {
          //   grid.children.push({
          //     class: "th table-row-index karma-field",
          //     update: th => {
          //       // th.element.textContent = rowIndex && (parseInt(this.table.getPage()) - 1)*parseInt(this.table.getPpp()) + rowIndex || "+";
          //       th.element.textContent = this.rowIndexGenerator.next().value;
          //     }
          //   });
          //
          //   this.getColumns().forEach((column, colIndex) => {
          //     const cellField = rowField.children[colIndex];
          //     if (cellField) {
          //       grid.children.push(cellField.build());
          //     }
          //   });
          // });

        } else {

          grid.children = [];

          grid.element.classList.remove("filled");

        }

        // grid.element.style.gridTemplateColumns = (this.hasIndex() && this.hasHeader() && [this.getIndexWidth()] || []).concat(this.getColumns().map((column) => {
        //   return column.width || "1fr";
        // })).join(" ");




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


KarmaFieldsAlpha.fields.table.tableContent.SelectManager = class {

  constructor() {
		this.grid = new KarmaFieldsAlpha.Grid();
    this.fields = new KarmaFieldsAlpha.Grid();
    this.ta = this.createTA();
  }

	growSelection(r) {

		if (this.selection) {
			this.unpaint(this.selection);
		}

    if (this.focusRect) {
      this.selection = KarmaFieldsAlpha.Rect.union(this.focusRect, r);
    } else {
      this.focusRect = r;
      this.selection = r;
    }

		this.paint(this.selection);

    if (this.selection.width > 1 || this.selection.height > 1) {
      this.ta.focus();

      this.updateTA();

    }

	}

  endSelection() {
		if (this.selection) {
			this.unpaint(this.selection);
		}
		this.selection = null;
		this.focusRect = null;

    if (this.onSelect) {
      this.onSelect();
    }

	}

	toggleSelection(r) {
		if (this.selection && KarmaFieldsAlpha.Rect.equals(r, this.selection || {})) {
      this.endSelection();
		} else {
			this.growSelection(r);
		}
	}


  createTA() {

    const ta = document.createElement("textarea");
    ta.id = "karma-table-"+this.table.resource.driver;
    document.body.appendChild(ta);

    ta.onfocusout = event => {
      this.endSelection();
    }

    return ta;
  }

  async updateTA() {

    const data = [];

    for (let j = 0; j < this.selection.height; j++) {
      const dataRow = [];

      for (let i = 0; i < this.selection.width; i++) {

			  const field = this.fields.get(this.selection.x+i, this.selection.y+j);
        const value = await field.exportValue();

        dataRow.push(value);

      }

      data.push(dataRow);

    }

    this.ta.value = data.map(row => row.join("\t")).join("\n");
    this.ta.select();

  }

	paint(rect) {
		for (let i = rect.x; i < rect.x + rect.width; i++) {
			for (let j = rect.y; j < rect.y + rect.height; j++) {
				let element = this.grid.get(i, j);
				if (element) {
					element.classList.add("selected");
				}
			}
		}
	}

	unpaint(rect) {
		for (let i = rect.x; i < rect.x + rect.width; i++) {
			for (let j = rect.y; j < rect.y + rect.height; j++) {
				let element = this.grid.get(i, j);
				if (element) {
					element.classList.remove("selected");
				}
			}
		}
	}


}

KarmaFieldsAlpha.Rect = class {

	constructor(x, y, width, height) {
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 1;
		this.height = height || 1;
	}

	static union(r1, r2) {
		let left = Math.min(r1.x, r2.x);
		let top = Math.min(r1.y, r2.y);
		let right = Math.max(r1.x + r1.width, r2.x + r2.width);
		let bottom = Math.max(r1.y + r1.height, r2.y + r2.height);
    return new this(left, top, right - left, bottom - top);
	}

	static equals(r1, r2) {
		return r1.x === r2.x && r1.y === r2.y && r1.width === r2.width && r1.height === r2.height;
	}

}

KarmaFieldsAlpha.Grid = class {

	constructor() {
		this.table = {};
		this.width = 0;
		this.height = 0;
	}

	set(x, y, item) {
		if (!this.table[x]) {
			this.table[x] = {};
		}
		this.table[x][y] = item;
		this.width = Math.max(x+1, this.width);
		this.height = Math.max(y+1, this.height);
	}

	get(x, y) {
		if (this.table[x]) {
			return this.table[x][y];
		}
	}

}
