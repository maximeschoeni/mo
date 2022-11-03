
KarmaFieldsAlpha.field.array = class extends KarmaFieldsAlpha.field {

  constructor(resource) {
    super(resource);

    // this.clipboard = new KarmaFieldsAlpha.Clipboard();
    this.clipboard = this.createChild("clipboard");

    // compat
    if (this.resource.add_button_name) {
      this.resource.footer = {
        children: [
          {
            type: "add",
            title: this.resource.add_button_name
          }
        ]
      }
    }

	}

  async onRenderControls() {
    // noop
  }

  // async getDefault() {
  // }

  getKeys() {

    // let keys = new Set();
    //
    // for (let resource of this.resource.children) {
    //
    //   keys = new Set(...keys, ...this.createChild(resource).getKeys());
    //
    // }
    //
    // return keys;

    return this.createChild({
      type: "arrayRow",
      children: this.resource.children
    }).getKeys();

  }

  async exportRows(index = 0, length = 9999) {

    const object = {};
		const values = await this.getValue();

    const array = [];

    for (let i = 0; i < Math.min(values.length - index, length); i++) {

      const rowField = this.createChild({
        type: "arrayRow",
        key: (index+i).toString(),
        children: this.resource.children
      });

      const row = await rowField.export();

      array.push(row);

    }

    return array;

  }

  async importRows(array = [], index = 0, length = 99999) {

    let key = this.getKey();
    const values = await this.getValue();
    const clone = values.slice();

    clone.splice(index, Math.min(length, values.length - index), ...array.map(row => {}));

    await this.setValue(clone);

    if (array.length) {

      for (let i = 0; i < array.length; i++) {

        const row = array[i];

        const rowField = this.createChild({
          type: "arrayRow",
          key: (i+index).toString(),
          children: this.resource.children
        });

        await rowField.import(row);

      }

    }

	}





  async export(keys = []) {

    const object = {};
		// const values = await this.getValue();
    //
    // const array = [];
    //
    // for (let i = 0; i < values.length; i++) {
    //
    //   const rowField = this.createChild({
    //     type: "arrayRow",
    //     key: i.toString(),
    //     children: this.resource.children
    //   });
    //
    //   const row = await rowField.export(keys);
    //
    //   array.push(row);
    //
    // }

    const array = await this.exportRows();

    let key = this.getKey();

    if (key) {

      object[key] = JSON.stringify(array);

    } else {

      // const keys = this.getKeys();
      const columns = this.getColumns(array);

      for (key in columns) {

        object[key] = JSON.stringify(columns[key]);

      }

    }

    return object;
	}

  async import(object, index = 0, length = 0) {

    let key = this.getKey();
    let array;

    if (key) {

      if (object[key]) {

        array = JSON.parse(object[key]);

      }

    } else {

      const keys = this.getKeys();
      const columns = {};

      for (key of keys) {

        if (object[key]) {

          columns[key] = JSON.parse(object[key]);

        }

      }

      array = this.getRows(columns);

    }

    await this.importRows(array);

    // if (array && array.length) {
    //
    //   for (let i = 0; i < Math.max(length, array.length); i++) {
    //
    //     const row = array[i%array.length];
    //
    //     const rowField = this.createChild({
    //       type: "arrayRow",
    //       key: (i+index).toString(),
    //       children: this.resource.children
    //     });
    //
    //     await rowField.import(row);
    //
    //   }
    //
    // } else {
    //
    //   const array = await this.getValue();
    //
    //   const clone = array.slice();
    //   clone.splice(index, length);
    //
    //   await this.setValue(clone);
    //
    // }

	}


  // async export(keys = [], index = 0, length = 9999) {
  //
	// 	const array = await this.getValue();
  //   const object = {};
  //   const suffix = this.getKey() || "array";
  //
  //   // for (let index in array) {
  //   for (let i = 0; i < Math.min(array.length, length); i++) {
  //
  //     const rowField = this.createChild({
  //       type: "arrayRow",
  //       key: (index+i).toString(),
  //       children: this.resource.children
  //     });
  //
  //     const row = await rowField.export(keys);
  //
  //     for (let key in row) {
  //
  //       object[`${suffix}-${i}-${key}`] = row[key];
  //
  //     }
  //
  //   }
  //
  //   return object;
	// }
  //
  // async import(object, index = 0, length = 0) {
  //
  //   const key = this.getKey();
  //   const defaults = await this.getEmptyRow();
  //
  //   for (let key in object) {
  //
  //     // if (defaults[key] !== undefined) {
  //
  //     const matches = key.match(/^(.*?)-(\d+)-(.+)$/);
  //
  //     if (matches && matches[1] === (key || "array") && defaults[matches[3]] !== undefined) {
  //
  //       const i = matches[2];
  //       const subKey = matches[3];
  //
  //       const rowField = this.createChild({
  //         type: "arrayRow",
  //         key: (index + i),
  //         children: this.resource.children
  //       });
  //
  //       await rowField.import({[subKey]: object[key]});
  //
  //     }
  //
  //   }
  //
  // }


	// async import(object) {
  //
	// 	const key = this.getKey();
  //   let suffix = "";
  //
  //   if (key) {
  //     suffix = key+"-";
  //   }
  //
  //   for (let key in object) {
  //
  //     const matches = key.match(/^(.*?)-(\d+)-(.+)$/);
  //
  //     if (matches) {
  //       const index = matches[2];
  //       const subKey = matches[3];
  //
  //       const rowField = this.createChild({
  //         type: "arrayRow",
  //         key: index,
  //         children: this.resource.children
  //       }, index.toString());
  //
  //       await rowField.import({[subKey]: object[key]});
  //
  //     }
  //
  //   }
  //
	// }

  // -> return object of arrays;
  // getColumns(rows) {
  //
  //   const columns = {};
  //
  //   for (let i = 0; i < rows.length; i++) {
  //     for (let key in rows[i]) {
  //       if (!columns[key]) {
  //         columns[key] = [];
  //       }
  //       columns[key][i] = rows[i][key];
  //     }
  //   }
  //
  //   return columns;
  // }

  getColumns(rows) {

    const keys = this.getKeys();
    const columns = {};

    for (let key of keys) {
      columns[key] = [];
    }

    for (let i = 0; i < rows.length; i++) {
      for (let key in rows[i]) {
        columns[key][i] = rows[i][key];
      }
    }

    return columns;
  }

  // -> return array of objects;
  getRows(columns) {

    const rows = [];

    for (let key in columns) {

      for (let i = 0; i < columns[key].length; i++) {
        if (!rows[i]) {
          rows[i] = {};
        }
        rows[i][key] = columns[key][i];
      }

    }

    return rows;
  }



  // async getEmptyRow() {
  //
  //   const row = this.createChild({
  //     ...this.resource,
  //     type: "arrayRow"
  //   });
  //
  //   return row.getDefault();
  //
  // }

  async getValue(...path) {

    let key = this.getKey();

    if (key) {

      const response = await this.parent.request("get", {}, key);

      return KarmaFieldsAlpha.Type.toArray(response);

    } else {

      // const defaults = await this.getEmptyRow();
      //
      //
      // const array = [];
      //
      // for (let key in defaults) {
      //
      //   const response = await this.parent.request("get", null, key);
      //   const column = KarmaFieldsAlpha.Type.toArray(response);
      //
      //   column.forEach((value, index) => {
      //     if (!array[index]) {
      //       array[index] = {};
      //     }
      //     array[index][key] = value;
      //   });
      //
      // }
      //
      // return array;


      const keys = this.getKeys();
      const columns = {};

      for (key of keys) {

        const response = await this.parent.request("get", null, key);
        columns[key] = KarmaFieldsAlpha.Type.toArray(response);

      }

      return this.getRows(columns);

    }

  }

  async setValue(value) {

    let key = this.getKey();

    if (key) {

      await this.parent.request("set", {
        data: value
      }, key);

    } else {

      // const keys = {};
      //
      // for (let i = 0; i < value.length; i++) {
      //   for (let key in value[i]) {
      //     if (!keys[key]) {
      //       keys[key] = [];
      //     }
      //     keys[key][i] = value[i][key];
      //   }
      // }
      //
      // for (let key in keys) {
      //
      //   await this.parent.request("set", {data: keys[key]}, key);
      //
      // }

      const columns = this.getColumns(value);
      // const keys = this.getKeys();

      for (key in columns) {

        await this.parent.request("set", {data: columns[key]}, key);

      }

    }
  }

  // async getColumn(key) {
  //
  //   // const event = this.createEvent({
  //   //   action: "get",
  //   //   type: "array",
  //   //   path: [key]
  //   // });
  //   //
  //   // await super.dispatch(event);
  //   //
  //   // return event.getArray();
  //
  //   const request = await super.dispatch({
  //     action: "get",
  //     type: "array",
  //     path: [key]
  //   });
  //
  //   return request.data;
  // }
  //
  // async setColumn(column, key) {
  //
  //   // const event = this.createEvent({
  //   //   action: "set",
  //   //   type: "array",
  //   //   path: [key]
  //   // });
  //   //
  //   // event.setValue(column);
  //   //
  //   // await super.dispatch(event);
  //
  //   await super.dispatch({
  //     action: "set",
  //     type: "array",
  //     path: [key],
  //     data: column
  //   });
  // }


  // async dispatch(event) {
  //
  //
  //   switch (event.action) {
  //
  //     case "get": {
  //         const [index, key] = event.path;
  //
  //         if (this.resource.key) {
  //
  //           const array = await super.dispatch({
  //             action: "get",
  //             type: "array"
  //           }).then(request => KarmaFieldsAlpha.Type.toArray(request.data));
  //
  //           if (array[index]) {
  //             event.data = array[index][key];
  //           }
  //
  //         } else {
  //
  //           // let column = await this.getColumn(key);
  //
  //           const column = await super.dispatch({
  //             action: "get",
  //             type: "array",
  //             path: [key]
  //           }).then(request => KarmaFieldsAlpha.Type.toArray(request.data));
  //
  //           event.data = column[index];
  //         }
  //       break;
  //     }
  //
  //     case "set": {
  //
  //       const [index, key] = event.path;
  //
  //       if (this.resource.key) {
  //
  //         const array = await super.dispatch({
  //           action: "get",
  //           type: "array"
  //         }).then(request => KarmaFieldsAlpha.Type.toArray(request.data));
  //
  //         const clone = KarmaFieldsAlpha.DeepObject.clone(array);
  //
  //         if (!clone[index]) {
  //           clone[index] = {};
  //         }
  //
  //         clone[index][key] = event.data
  //
  //         // await this.setValue(clone);
  //         await super.dispatch({
  //           action: "set",
  //           data: clone
  //         });
  //
  //       } else {
  //
  //         // let column = await this.getColumn(key);
  //         const column = await super.dispatch({
  //           action: "get",
  //           type: "array",
  //           path: [key]
  //         }).then(request => KarmaFieldsAlpha.Type.toArray(request.data));
  //
  //         const clone = KarmaFieldsAlpha.DeepObject.clone(column);
  //         //
  //         // const value = KarmaFieldsAlpha.Type.convert(event.data, event.type || "object");
  //
  //         // if (Array.isArray(event.data)) {
  //         //   console.error("impossible!");
  //         // }
  //
  //
  //         const value = KarmaFieldsAlpha.Type.toObject(event.data); // -> compat:
  //
  //         clone[index] = value;
  //
  //         await super.dispatch({
  //           action: "set",
  //           path: [key],
  //           data: clone
  //         });
  //
  //       }
  //
  //       break;
  //     }
  //
  //
  //     case "add":
  //       KarmaFieldsAlpha.History.save();
  //
  //       await this.add();
  //       await this.render();
  //       break;
  //
  //     case "delete":
  //       KarmaFieldsAlpha.History.save();
  //       await this.delete(event.path[0]);
  //       await this.render();
  //       break;
  //
  //     // case "edit":
  //     //   await this.render();
  //     //   break;
  //
  //     default:
  //       super.dispatch(event);
  //       break;
  //
  //   }
  //
  //
  //
  //   return event;
  // }

  async request(subject, content = {}, ...path) {


    switch (subject) {

      case "state": {
        const [index, subkey] = path;
        const key = this.getKey();

        if (key) {

          const state = await this.parent.request("state", {}, key);

          if (state.multi) {

            return {
              ...state,
              values: state.values.map(value => value && value[index] && value[index][subkey])
            };

          } else if (state.value && state.value[index]) {

            return {
              ...state,
              value: state.value[index][subkey]
            };

          }

        } else {

          // const response = await this.parent.request("get", undefined, subkey);
          // const column = KarmaFieldsAlpha.Type.toArray(response);
          //
          // return column[index];


          const state = await this.parent.request("state", {}, subkey);

          if (state.multi) {

            return {
              ...state,
              values: state.values.map(value => KarmaFieldsAlpha.Type.toArray(value)[index])
            };

          } else {

            return {
              ...state,
              value: KarmaFieldsAlpha.Type.toArray(state.value)[index]
            };

          }

        }

        break;
      }



      case "get": {
        const [index, subkey] = path;
        const key = this.getKey();

        if (key) {

          // const array = await super.dispatch({
          //   action: "get",
          //   type: "array"
          // }).then(request => KarmaFieldsAlpha.Type.toArray(request.data));

          const response = await this.parent.request("get", undefined, key);
          const array = KarmaFieldsAlpha.Type.toArray(response);

          if (array[index]) {
            return array[index][subkey];
          }

        } else {

          // let column = await this.getColumn(key);

          // const column = await super.dispatch({
          //   action: "get",
          //   type: "array",
          //   path: [key]
          // }).then(request => KarmaFieldsAlpha.Type.toArray(request.data));

          const response = await this.parent.request("get", undefined, subkey);
          const column = KarmaFieldsAlpha.Type.toArray(response);

          return column[index];
        }
        break;
      }

      case "set": {

        const [index, subkey] = path;
        const key = this.getKey();

        if (key) {

          // const array = await super.dispatch({
          //   action: "get",
          //   type: "array"
          // }).then(request => KarmaFieldsAlpha.Type.toArray(request.data));

          const response = await this.parent.request("get", undefined, key);
          const array = KarmaFieldsAlpha.Type.toArray(response);

          const clone = KarmaFieldsAlpha.DeepObject.clone(array);

          if (!clone[index]) {
            clone[index] = {};
          }

          clone[index][subkey] = content.data;

          // await this.setValue(clone);
          // await super.dispatch({
          //   action: "set",
          //   data: clone
          // });

          await this.parent.request("set", {data: clone}, key);

        } else {

          // let column = await this.getColumn(key);
          // const column = await super.dispatch({
          //   action: "get",
          //   type: "array",
          //   path: [key]
          // }).then(request => KarmaFieldsAlpha.Type.toArray(request.data));

          const response = await this.parent.request("get", null, subkey);
          const column = KarmaFieldsAlpha.Type.toArray(response);

          const clone = KarmaFieldsAlpha.DeepObject.clone(column);
          //
          // const value = KarmaFieldsAlpha.Type.convert(event.data, event.type || "object");

          // if (Array.isArray(event.data)) {
          //   console.error("impossible!");
          // }


          const value = KarmaFieldsAlpha.Type.toObject(content.data); // -> compat:

          clone[index] = value;

          // await super.dispatch({
          //   action: "set",
          //   path: [key],
          //   data: clone
          // });

          await this.parent.request("set", {data: clone}, subkey);

        }

        break;
      }


      case "add":
        KarmaFieldsAlpha.History.save();

        await this.add();
        // await this.render();
        await this.parent.request("render");
        break;

      case "delete":

        KarmaFieldsAlpha.History.save();
        await this.delete(path[0]);
        // await this.render();
        await this.parent.request("render");
        break;

      // case "edit":
      //   await this.render();
      //   break;

      case "modified":
      default: {
        const [index, subkey] = path;
        const key = this.getKey();
        return this.parent.request(subject, content, key || subkey);
      }

    }


  }

  // async backup(value) {
  //
  //   if (this.resource.key) {
  //
  //     await super.dispatch(this.createEvent({
  //       action: "backup"
  //     }));
  //
  //   } else {
  //
  //     // const keys = this.resource.columns.filter(column => column.field.key).map(column => column.field.key);
  //     const keys = this.resource.children.filter(column => column.key).map(column => column.key);
  //
  //     for (let key in keys) {
  //       await super.dispatch(this.createEvent({
  //         action: "backup",
  //         path: [key]
  //       }));
  // 		}
  //
  //   }
  // }


  // createRow() {
  //   // return new KarmaFieldsAlpha.field.arrayRow({
  //   //   children: this.resource.columns.map(column => column.field)
  //   // });
  //   return this.createField({
  //     type: "arrayRow",
  //     children: this.resource.children
  //     // children: this.resource.columns.map(column => column.field)
  //   });
  // }


  async swap(index, length, target) {
    // await this.backup();
    // await this.save("array-swap");
    let values = await this.getValue();
    values = KarmaFieldsAlpha.DeepObject.clone(values || []);
    values.splice(target, 0, ...values.splice(index, length));

		await this.setValue(values);
    // await this.edit();
  }

  async add() {

    const array = await this.getValue();
    // const clone = KarmaFieldsAlpha.DeepObject.clone(array);
    const clone = array.slice();

    const defaults = await this.createChild({
      ...this.resource,
      type: "arrayRow"
    }).getDefault();

    clone.push(defaults);

    await this.setValue(clone);

    // await super.dispatch({
    //   action: "set",
    //   data: clone
    // });
  }

  async delete(index) {
    const values = await this.getValue();
    const clone = KarmaFieldsAlpha.DeepObject.clone(values);
    clone.splice(index, 1);

    await this.setValue(clone);

    // await super.dispatch({
    //   action: "set",
    //   data: clone
    // });
  }

  async insert(data, index, length) {
    const values = await this.getValue();
    const clone = KarmaFieldsAlpha.DeepObject.clone(values);

    clone.splice(index, length, ...data);

    await this.setValue(clone);

    // await super.dispatch({
    //   action: "set",
    //   data: clone
    // });

  }


  build() {
    return {
      class: "array",
      children: [
        this.clipboard.build(),
        {
          class: "array-body",
          init: table => {


          },
          update: async table => {

            const values = await this.getValue() || [];

            const hasHeader = this.resource.children.some(column => column.header || column.label); // header is deprecated

            this.render = table.render;

            this.clipboard.onBlur = event => {

              if (this.selection) {

                const sortManager = new KarmaFieldsAlpha.SortManager(table.element, this.resource.children.length, values.length, 0, hasHeader ? 1 : 0);

                sortManager.clear(this.selection);

                this.selection = null;

              }

            }

            this.clipboard.onInput = async value => {

              // const dataArray = KarmaFieldsAlpha.Clipboard.parse(value);
              // const array = KarmaFieldsAlpha.Clipboard.toJson(dataArray);
              //
              // if (this.selection) {
              //
              //   KarmaFieldsAlpha.History.save();
              //   // await this.insert(array, this.selection.index, this.selection.length);
              //   await this.import(array[0]);
              //   this.selection = null;
              //   await this.parent.request("render");
              //
              // }



              // const dataArray = KarmaFieldsAlpha.Clipboard.parse(value);
              // const jsonData = KarmaFieldsAlpha.Clipboard.toJson(dataArray);
              // const object = jsonData[0] || {};

              const array = JSON.parse(value || "[]");

              if (this.selection) {

                KarmaFieldsAlpha.History.save();
                await this.importRows(array, this.selection.index, this.selection.length);
                this.selection = null;
                await this.parent.request("render");

              }

            }

            table.element.classList.toggle("empty", values.length === 0);


            table.children = [
              ...this.resource.children.filter(column => values.length && hasHeader).map(column => {
                return {
                  class: "th",
                  init: th => {
                    th.element.textContent = column.header || column.label || "";
                  }
                };
              }),
              ...values.reduce((array, item, index) => {

                const row = this.createChild({
                  ...this.resource,
                  key: index,
                  type: "arrayRow"
                }, index.toString());

                row.index = index;

                return [
                  ...array,
                  ...this.resource.children.map((column, colIndex) => {

                    const field = row.createChild(column, colIndex.toString());

                    return {
                      class: "td array-cell karma-field-frame",
                      init: td => {
                        // const field = row.createChild(column, colIndex);
                        if (field.resource.style) {
                          td.element.style = field.resource.style;
                        }
                        if (field.resource.class) {
                          td.element.classList.add(field.resource.class);
                        }
                      },
                      update: td => {

                        this.selection = null;
                        td.element.classList.remove("selected");
                        td.element.onmousedown = async event => {

                          if (event.target !== td.element) {
                             return;
                          }

                          if (event.buttons === 1) {

                            const sortManager = new KarmaFieldsAlpha.SortManager(table.element, this.resource.children.length, values.length, 0, hasHeader ? 1 : 0);

                            sortManager.segment = this.selection;

                            sortManager.onSelect = async (segment, hasChange) => {

                              this.selection = segment;

                              const array = await this.exportRows(segment.index, segment.length);



                              // const selecteditems = values.slice(segment.index, segment.index + segment.length);
                              // const dataArray = KarmaFieldsAlpha.Clipboard.toDataArray([object]);
                              // const value = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
                              const value = JSON.stringify(array);



                              this.clipboard.output(value);
                              this.clipboard.focus();

                              await this.onRenderControls();


                            }

                            sortManager.onSort = async (index, length, target) => {

                              await this.swap(index, length, target);

                              sortManager.clear();

                              await this.parent.request("render");

                            }

                            // if (this.selection && KarmaFieldsAlpha.Segment.contains(this.selection, index)) {

                            sortManager.sort(event, colIndex, index);



                            // } else {
                            //
                            //   await sortManager.select(event, colIndex, index);
                            //
                            // }

                            // if (this.selection && KarmaFieldsAlpha.Segment.contains(this.selection, index)) {
                            //
                            //   const headerElements = hasHeader ? [...table.element.children].slice(0, this.resource.children.length) : [];
                            //
                            //   const sorter = new KarmaFieldsAlpha.Sorter(event, this.selection, index, headerElements);
                            //
                            //   await sorter.sort();
                            //
                            //   if (sorter.selection.index !== sorter.index) {
                            //
                            //     KarmaFieldsAlpha.History.save();
                            //
                            //     await this.swap(sorter.index, this.selection.length, this.selection.index);
                            //
                            //     sorter.selection.kill();
                            //
                            //     // await this.dispatch({action: "render"});
                            //     await this.parent.request("render");
                            //
                            //   }
                            //
                            // } else {
                            //
                            //   const elements = [...table.element.children].slice(hasHeader ? this.resource.children.length : 0);
                            //
                            //   this.selection = new KarmaFieldsAlpha.Selection(event, table.element, elements, this.resource.children.length, values.length, colIndex, index, this.selection);
                            //
                            //   await this.selection.select();
                            //
                            //   const selecteditems = values.slice(this.selection.index, this.selection.index + this.selection.length);
                            //
                            //   this.clipboard.setJson(selecteditems);
                            //
                            //   if (this.renderControls) {
                            //     await this.renderControls();
                            //   }
                            //
                            // }

                          }

                        };

                        td.child = field.build();
                      }
                    };
                  })
                ];
              }, [])

            ];

            // table.element.style.gridTemplateColumns = [
            //   this.resource.index && this.resource.index.width || "5em",
            //   ...this.resource.children.map(column => column.width || "1fr")
            //   this.resource.delete && this.resource.delete.width || "auto"
            // ].join(" ");

            const row = this.createField({type: "arrayRow"});

            table.element.style.gridTemplateColumns = this.resource.children.map(column => row.createField(column).resource.width || "1fr").join(" ");

          }
        },
        {
          class: "array-footer",
          child: {
            class: "array-footer-content",
            init: footer => {
              footer.element.onmousedown = event => {
                event.preventDefault(); // -> prevent losing focus on selected items
              }
            },
            update: footer => {
              if (this.resource.footer !== false) {
                footer.child = this.createChild({
                  type: "footer",
                  ...this.resource.footer
                }, "footer").build();
              }
            }
          }
        }
      ]
    };
  }

  static footer = class extends KarmaFieldsAlpha.field.group {

    constructor(resource) {

      super({
        ...{
          display: "flex",
          children: [
            "add"
          ]
        },
        ...resource
      });

    }

    static add = {
      type: "button",
      id: "add",
      action: "add",
      // title: "Add Row"
      title: "+"
    }

  }


  static arrayRow = class extends KarmaFieldsAlpha.field {

    // async dispatch(event) {
    //
    //   switch (event.action) {
    //
    //     case "index":
    //       event.data = this.index;
    //       break;
    //
    //     default:
    //       await super.dispatch(event);
    //       break;
    //   }
    //
    //   return event;
    // }

    async request(subject, content, ...path) {

      switch (subject) {

        case "index":
          return this.index;

        default:
          return this.parent.request(subject, content, this.getKey(), ...path);
          break;
      }

    }

    getKeys() {

  		let keys = new Set();

      for (let resource of this.resource.children) {

        const child = this.createChild(resource);
        keys = new Set([...keys, ...child.getKeys()]);

      }

  		return keys;
  	}

    async getDefault() {

  		let defaults = {};

  		for (let index in this.resource.children) {

  			const child = this.createChild(this.resource.children[index]);

  			defaults = {
  				...defaults,
  				...await child.getDefault()
  			};

  		}

  		return defaults;
  	}

    async export(keys = []) {

      let object = {};

      for (let resource of this.resource.children) {

        const child = this.createChild(resource);

        object = {
          ...object,
          ...await child.export(keys)
        };

      }

      return object;
    }

    async import(object) {

      for (let resource of this.resource.children) {

        const child = this.createChild(resource);

        await child.import(object);

      }

    }

    // async export(keys = []) {
    //
    //   let row = {};
    //
    //   for (let index in this.resource.children) {
    //
    //     const field = this.createChild(this.resource.children[index]);
    //     const values = await field.export(keys);
    //     row = {...row, ...values};
    //
    //   }
    //
    //   return row;
    // }
    //
    // async import(object) {
    //
    //   for (let index in this.resource.children) {
    //
    //     const field = this.createChild(this.resource.children[index]);
    //     await field.import(object);
    //
    //   }
    //
    // }

    static index = class extends KarmaFieldsAlpha.field {

      constructor(resource) {
        super({
          width: "5em",
          class: "array-index",
          ...resource
        });
      }

      build() {
        return {
          tag: "span",
          update: async td => {
            // td.element.textContent = this.parent.index+1;
            // td.element.textContent = await this.dispatch({action: "index"}).then(request => request.data+1);
            const index = await this.request("index");
            td.element.textContent = index+1;
          }
        };
      }

    }

    static delete = {
      type: "button",
      action: "delete",
      title: "Delete",
      dashicon: "no-alt",
      class: "array-delete",
      width: "auto"
    }

  }

}
