KarmaFieldsAlpha.SelectionManager = class {

  constructor(table) {
		this.grid = new KarmaFieldsAlpha.Grid();
    this.events = {};


    this.ta = document.createElement("textarea");
    this.ta.id = "karma-table-"+table.resource.driver;
    document.body.appendChild(this.ta);

    console.log(this.ta);
  }

  trigger(eventName, ...params) {
    if (this.events[eventName]) {
      this.events[eventName].call(this, ...params)
    }
  }

	// register(element) {
	// 	const manager = this;
  //
	// 	element.onmouseup = function(event) {
	// 		if (manager.selection) {
	// 			manager.trigger("select");
	// 		}
	// 	}
  // }

  registerTable(element, width, height, hasIndex, hasHeader) {


    this.grid = new KarmaFieldsAlpha.Grid();

    let child = element.firstChild;
    let i = 0;

    hasIndex = hasIndex && 1 || 0;
    hasHeader = hasHeader && 1 || 0;

    while (child) {

      const x = i%(width + hasIndex);
      const y = Math.floor(i/(width + hasIndex));

      if (x === 0 && y === 0 && hasIndex && hasHeader) {
        this.registerHeaderIndex(child);
      } else if (x === 0 && hasIndex) {
        this.registerIndex(child, y-hasHeader);
      } else if (y === 0 && hasHeader) {
        this.registerHeader(child, x-hasIndex);
      } else {
        this.registerCell(child, x-hasIndex, y-hasHeader);
      }

      i++;
      child = child.nextSibling;
    }

    element.onmouseup = event => {
      if (this.selection) {
        this.trigger("select");
      }
    }

  }

  registerCell(element, col, row) {
		// const manager = this;


    const x = col;
    const y = row;


    element.setAttribute('tabindex', '-1');

		this.grid.set(col, row, element);

    element.onmousedown = event => {
      if (event.target.draggable) {
        event.target.draggable = false;
      }
      // if (event.target !== element) {
      //   element.focus();
      //   event.preventDefault(); // -> prevent losing selection
      // }

      // if (event.shiftKey) {
      //   event.stopImmediatePropagation();
      //   event.stopPropagation();
      //   event.preventDefault(); // -> prevent open dropdown
      // }


    }

		element.onfocus = () => {
			// manager.startSelection(new KarmaFieldsAlpha.Rect(col, row, 1, 1));

			this.startSelection({x: col, y:row, width: 1, height: 1});
		}
		element.onfocusout = (event) => {

			this.endSelection();
		}

		element.onmousemove = (event) => {

			this.growSelection({x: col, y:row, width: 1, height: 1});
		}



    element.onkeydown = (event) => {
      if (event.metaKey && event.key === "c" && this.selection) {
        event.preventDefault();
        this.trigger("copy");
    	}
      if (event.metaKey && event.key === "x" && this.selection) {
        event.preventDefault();
        this.trigger("cut");
    	}
      if (event.metaKey && event.key === "v" && this.selection) {
        event.preventDefault();
        this.trigger("paste");
    	}
      if (event.key === "Backspace" && this.selection) {
        if (this.selection.width > 1 || this.selection.height > 1) {
          event.preventDefault();
          this.trigger("delete");
        }
    	}

      // if (event.key === "ArrowUp") {
      //   event.preventDefault();
      //   manager.setFocus({x:col, y: row-1});
    	// }
      // if (event.key === "ArrowDown") {
      //   event.preventDefault();
      //   manager.setFocus({x:col, y: row+1});
    	// }
      // if (event.key === "ArrowLeft") {
      //   if (this.selectionStart === 0 && this.selectionEnd === this.selectionStart) {
      //     event.preventDefault();
      //     manager.setFocus({x:col-1, y: row});
      //   }
    	// }
      // if (event.key === "ArrowRight") {
      //   if (this.selectionEnd === this.value.length && this.selectionEnd === this.selectionStart) {
      //     event.preventDefault();
      //     manager.setFocus({x:col+1, y: row});
      //   }
    	// }
    }

    // window.addEventListener("keydown", function(event) {
    // 	if (event.metaKey && event.key === "c" && KarmaFieldsAlpha.events.onCopy) {
    // 		KarmaFieldsAlpha.events.onCopy(event);
    // 	}
    // 	if (event.metaKey && event.key === "v" && KarmaFieldsAlpha.events.onPast) {
    // 		KarmaFieldsAlpha.events.onPast(event);
    // 	}
    // 	if (event.metaKey && event.key === "a" && KarmaFieldsAlpha.events.onSelectAll) {
    // 		KarmaFieldsAlpha.events.onSelectAll(event);
    // 	}
    // 	if (event.metaKey && event.key === "s" && KarmaFieldsAlpha.events.onSave) {
    // 		KarmaFieldsAlpha.events.onSave(event);
    // 	}
    // 	if (event.metaKey && !event.shiftKey && event.key === "z" && KarmaFieldsAlpha.events.onUndo) {
    // 		KarmaFieldsAlpha.events.onUndo(event);
    // 	}
    // 	if (event.metaKey && event.shiftKey && event.key === "z" && KarmaFieldsAlpha.events.onRedo) {
    // 		KarmaFieldsAlpha.events.onRedo(event);
    // 	}
    // 	if (event.key === "Backspace" && KarmaFieldsAlpha.events.onDelete) {
    // 		KarmaFieldsAlpha.events.onDelete(event);
    // 	}
    // 	if (event.key === "+" && KarmaFieldsAlpha.events.onAdd) {
    // 		KarmaFieldsAlpha.events.onAdd(event);
    // 	}
    //
    // 	if (event.key === "ArrowUp" && KarmaFieldsAlpha.events.onArrowUp) {
    // 		KarmaFieldsAlpha.events.onArrowUp(event);
    // 	}
    // 	if (event.key === "ArrowDown" && KarmaFieldsAlpha.events.onArrowDown) {
    // 		KarmaFieldsAlpha.events.onArrowDown(event);
    // 	}
    // 	if (event.key === "ArrowLeft" && KarmaFieldsAlpha.events.onArrowLeft) {
    // 		KarmaFieldsAlpha.events.onArrowLeft(event);
    // 	}
    // 	if (event.key === "ArrowRight" && KarmaFieldsAlpha.events.onArrowRight) {
    // 		KarmaFieldsAlpha.events.onArrowRight(event);
    // 	}
    //
    // 	KarmaFieldsAlpha.events.unload
    // 	if (event.key === "Backspace" && KarmaFieldsAlpha.events.onUnload) {
    // 		KarmaFieldsAlpha.events.onDelete(event);
    // 	}
    //
    //
    // 	// console.log(event.key);
    // });

  }





	registerIndex(element, row) {
		const manager = this;

		element.onmousedown = function(element) {
			element.preventDefault();
			manager.toggleSelection({x: 0, y: row, width: manager.grid.width, height: 1});
		}
		element.onmousemove = function() {
			manager.growSelection({x: 0, y: row, width: manager.grid.width, height: 1});
		}
  }

	registerHeader(element, col) {
		const manager = this;

		element.onmousedown = function(element) {
			element.preventDefault();
			manager.toggleSelection({x: col, y: 0, width: 1, height: manager.grid.height});
		}
		element.onmousemove = function() {
			manager.growSelection({x: col, y: 0, width: 1, height: manager.grid.height});
		}
  }

	registerHeaderIndex(element) {
		const manager = this;

		element.onmousedown = function(element) {
			element.preventDefault();
			manager.toggleSelection({x:0, y:0, width:manager.grid.width, height:manager.grid.height});
		}
		element.onmousemove = function() {
			manager.growSelection({x:0, y:0, width:manager.grid.width, height:manager.grid.height});
		}
  }


	startSelection(r) {

		if (this.selection) {
			this.unpaint(this.selection);
		}
		this.focusRect = r;
		this.selection = r;
		this.paint(this.selection);
		this.trigger("select");
	}

	growSelection(r) {

		if (this.focusRect && event.buttons === 1) {

			if (this.selection) {
				this.unpaint(this.selection);
			}
			this.selection = KarmaFieldsAlpha.Rect.union(this.focusRect, r);
			this.paint(this.selection);
		}
	}

	endSelection() {
		if (this.selection) {
			this.unpaint(this.selection);
		}
		this.selection = null;
		this.focusRect = null;
		this.trigger("select");
	}

	toggleSelection(r) {
		if (this.selection && KarmaFieldsAlpha.Rect.equals(r, this.selection)) {
			this.removeFocus();
		} else {
			this.setFocus(r);
			this.growSelection(r);
		}
	}

	setFocus(r) {
		let element = this.grid.get(r.x, r.y);
		if (element) {
			element.focus();
		}
	}

	removeFocus() {
		if (this.focusRect) {
			this.grid.get(this.focusRect.x, this.focusRect.y).blur();
		}
	}

	paint(rect) {
		// console.log("paint", rect);
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
		// console.log("unpaint", rect);
		for (let i = rect.x; i < rect.x + rect.width; i++) {
			for (let j = rect.y; j < rect.y + rect.height; j++) {
				let element = this.grid.get(i, j);
				if (element) {
					element.classList.remove("selected");
				}
			}
		}
	}


  // -> ordering
  // getRow(index) {
  //   let row = [];
  //   this.map.forEach(function(value, key) {
  //     if (value.row === index) {
  //       row.push(key);
  //     }
  //   });
  //   return row;
  // }



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
		return new KarmaFieldsAlpha.Rect(left, top, right - left, bottom - top);
	}

	static equals(r1, r2) {
		return r1.x === r2.x && r1.y === r2.y && r1.width === r2.width && r1.height === r2.height;
	}

	// static union(p1, p2) {
	// 	let left = Math.min(p1.x, p2.x);
	// 	let top = Math.min(p1.y, p2.y);
	// 	let right = Math.max(p1.x + (p1.width || 1), p2.x + (p2.width || 1));
	// 	let bottom = Math.max(p1.y + (p1.height || 1), p2.y + (p2.height || 1));
	// 	return new KarmaFieldsAlpha.Rect(left, top, right - left, bottom - top);
	// }

}

KarmaFieldsAlpha.Grid = class {

	constructor() {
		this.table = {};
		this.width = 0;
		this.height = 0;
	}

	set(x, y, element) {
		if (!this.table[x]) {
			this.table[x] = {};
		}
		this.table[x][y] = element;
		this.width = Math.max(x+1, this.width);
		this.height = Math.max(y+1, this.height);
	}

	get(x, y) {
		if (this.table[x]) {
			return this.table[x][y];
		}
	}

  getByPoint(px, py) {
    for (let x = 0; x < this.table.width; x++) {
      for (let y = 0; y < this.table.height; y++) {
        const element = this.get(x, y);
        const box = element.getBoundingClientRect();
        if (px > box.left && px <= box.right && py > box.top && py <= box.bottom) {
          return element;
        }
      }
    }
  }

}
