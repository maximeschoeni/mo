
KarmaFieldsAlpha.fields.table.grid = class extends KarmaFieldsAlpha.fields.table.tableContent {

  constructor(...params) {
    super(...params);

    // this.grid = new KarmaFieldsAlpha.Grid();
    // this.fields = new KarmaFieldsAlpha.Grid();
    this.ta = this.createTA();

    this.ta.oninput = async event => {

      let data = this.ta.value.split(/[\r\n]/).map(row => row.split("\t"));

      await this.importSelection(data, this.selection);

      switch (event.inputType) {

        case "insertFromPaste":
        case "deleteByCut":

        case "deleteContentBackward":
        case "deleteContentForward":
        case "deleteContent":
          this.ta.blur();

      }

      this.table.render();
    }

  }

  // override setValue
	setValue(type, value, ...path) {

    if (value.constructor === KarmaFieldsAlpha.PastedString) {

      const data = value[0].split(/[\r\n]/).map(row => row.split("\t"));

      const field = this.getChild(...path);
      const point = this.fields.find(field);

      this.importSelection(data, point);

    } else {

      super.setValue(null, value, ...path);

    }

  }


  // not used
  async selectRow(rowId) {
    const ids = await this.getIds();
    let index = ids.indexOf(rowId);
    if (index > -1) {
      this.growSelection({x: 0, y: index, width: this.grid.width, height: 1});
    }
  }

  async getSelectedIds() {
    if (KarmaFieldsAlpha.Nav.hasParam("id")) {
      return [KarmaFieldsAlpha.Nav.getParam("id")];
    } else if (this.selection && this.selection.width === this.grid.width) {
      const ids = await this.getIds();
      return ids.slice(this.selection.y, this.selection.y + this.selection.height);
    }
    return [];
  }

  async importSelection(data, selection) {

    const r = new KarmaFieldsAlpha.Rect();

    const {x, y, width, height} = {...r, ...selection};

    let ids = await this.getIds();

    // for (let j = 0; j < Math.max(height, data.length); j++) {
    //   const rowField = this.getChild(ids[j+y]);
    //   if (rowField) {
    //     for (let i = 0; i < Math.max(width, data[j%data.length].length); i++) {
    //       const cellField = rowField.children[i+x];
    //       if (cellField) {
    //         await cellField.write();
    //       }
    //     }
    //   }
    // }
    //
    // if (data.length > ids.length-y) {
    //   await this.add(data.length-(ids.length-y), false); // -> will backup
    //   ids = await this.getIds();
    // } else {
    //   KarmaFieldsAlpha.History.backup();
    //   KarmaFieldsAlpha.History.id = null;
    // }




    if (KarmaFieldsAlpha.History.id !== selection) {

      KarmaFieldsAlpha.History.id = selection;

      for (let j = 0; j < Math.max(height, data.length); j++) {
        const rowField = this.getChild(ids[j+y]);
        if (rowField) {
          for (let i = 0; i < Math.max(width, data[j%data.length].length); i++) {
            const cellField = rowField.children[i+x];
            if (cellField) {
              await cellField.write();
            }
          }
        }
      }

      KarmaFieldsAlpha.History.backup();

    }

    for (let j = 0; j < Math.max(height, data.length); j++) {
      const rowField = this.getChild(ids[j+y]);
      if (rowField) {
        for (let i = 0; i < Math.max(width, data[j%data.length].length); i++) {
          const cellField = rowField.children[i+x];
          if (cellField) {
            const value = data[j%data.length][i%data[j%data.length].length];

            // console.log(value, cellField.getPath(), i, x);
            await cellField.importValue(value);
            await cellField.render();
          }
        }
      }

    }

  }

  registerTable(element) {

    this.endSelection();

    this.grid = new KarmaFieldsAlpha.Grid();
    this.fields = new KarmaFieldsAlpha.Grid();

    element.onmouseup = event => {
      if (this.selection) {
        if (this.selection.width === 1 && this.selection.height === 1) {
          this.endSelection();
        }
        this.table.renderFooter();
      }
    }

  }


  registerCell(field, element, col, row) {

    this.grid.set(col, row, element);
    this.fields.set(col, row, field);

    element.onmousedown = event => {
      if (this.selection) {
        this.endSelection();
      }
    }

    element.onmousemove = event => {
      if (event.buttons === 1) {
  			this.growSelection({x: col, y:row, width: 1, height: 1});
  		}
		}

  }

	registerIndex(element, row) {

    element.onmousedown = event => {
      event.preventDefault();
			this.toggleSelection({x: 0, y: row, width: this.grid.width, height: 1});
      this.table.renderFooter();
		}

		element.onmousemove = event => {
      if (event.buttons === 1) {
  			this.growSelection({x: 0, y: row, width: this.grid.width, height: 1});
      }
		}
  }

	registerHeader(element, col) {

    element.onmousedown = event => {
      event.preventDefault();
			this.toggleSelection({x: col, y: 0, width: 1, height: this.grid.height});
      this.table.renderFooter();
		}

		element.onmousemove = event => {
      if (event.buttons === 1) {
  			this.growSelection({x: col, y: 0, width: 1, height: this.grid.height});
      }
		}
  }

	registerHeaderIndex(element) {

    element.onmousedown = event => {
      event.preventDefault();
			this.toggleSelection({x:0, y:0, width:this.grid.width, height:this.grid.height});
      this.table.renderFooter();
		}

		element.onmousemove = event => {
      if (event.buttons === 1) {
  			this.growSelection({x: 0, y :0, width: this.grid.width, height: this.grid.height});
      }
		}
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

    if (this.selection.width*this.selection.height > 1) {
      this.paint(this.selection);
    // }
    //
    //
    // if (this.selection.width > 1 || this.selection.height > 1) {
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

	}

	toggleSelection(r) {

		if (this.selection && KarmaFieldsAlpha.Rect.equals(r, this.selection || {})) {
      this.endSelection();
		} else {
      this.endSelection();
			this.growSelection(r);
		}


	}


  createTA() {

    const ta = document.createElement("textarea");
    ta.id = "karma-table-"+this.resource.driver;
    ta.className = "karma-grid-ta";
    document.body.appendChild(ta);

    ta.onfocusout = event => {
      this.endSelection();
      this.table.renderFooter();
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

  find(item) {
    for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				if (this.table[i][j] === item) {
					return {x: i, y: j};
				}
			}
		}
  }

}
