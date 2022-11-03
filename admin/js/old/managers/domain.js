
KarmaFieldsAlpha.Domain = class {

	constructor() {
		this.index = 0;
		this.max = 0;
		this.data = {};
		this.entries = {};
		this.entries2 = {};
		// this.history = [];
		// this.historyIndex = 0;
	}

	update(id, state) {

		if (id !== this.id || state !== this.state) {
			// while (this.max > this.index) {
			// 	this.data[this.max] = {};
			// 	this.max--;
			// }

			// while (this.history.length > this.historyIndex) {
			// 	this.history.pop();
			// }

			for (let path in this.entries2) {
				if (this.entries2[path][this.index]) {
					this.entries2[path][this.index+1] = this.entries2[path][this.index];
				}
			}


			this.index++;
			this.max = this.index;
			this.data[this.index] = {};
			this.id = id;
			this.state = state;



		}
	}

	// updateState(field) {
	//
	//
	// 	if (id !== this.id || state !== this.state) {
	// 		// while (this.max > this.index) {
	// 		// 	this.data[this.max] = {};
	// 		// 	this.max--;
	// 		// }
	//
	// 		// while (this.history.length > this.historyIndex) {
	// 		// 	this.history.pop();
	// 		// }
	//
	//
	//
	// 		this.index++;
	// 		this.max = this.index;
	// 		this.data[this.index] = {};
	// 		this.id = id;
	// 		this.state = state;
	// 	}
	// }

	hasUndo() {
		return this.index > 0;
	}
	hasRedo() {
		return this.index < this.max;
	}
	countUndo() {
		return this.index;
	}
	countRedo() {
		return this.max -this.index;
	}

	setIndex(index) {
		while (this.index > index && this.hasUndo()) {
			this.undo();
		}
		while (this.index < index && this.hasRedo()) {
			this.redo();
		}
	}

	undo() {
		if (this.index > 0) {
			for (let path in this.data[this.index]) {
				let index = this.index-1;
				while (index > 0 && (!this.data[index] || this.data[index][path] === undefined)) {
					index--;
				}
				this.entries[path] = index;
			}
			this.index--;
			this.id = undefined;
			this.state = undefined;
		}




		// this.index = Math.max(this.index-1, 0);
		// this.id = undefined;
		// this.state = undefined;

		// this.historyIndex--;
		// let lastItem = this.history[this.historyIndex];
		// while (lastItem && lastItem.index > this.index) {
		// 	this.entries[lastItem.path] = lastItem.last;
		// 	this.historyIndex--;
		// 	lastItem = this.history[this.historyIndex];
		// }
	}

	redo(field) {

		if (this.index < this.max) {
			this.index++;
			for (let path in this.data[this.index]) {
				if (this.data[this.index] && this.data[this.index][path] !== undefined) {
					this.entries[path] = this.index;
				}
			}

			this.id = undefined;
			this.state = undefined;
		}

		// this.index = Math.min(this.index+1, this.max);
		// this.id = undefined;
		// this.state = undefined;
		//
		// this.historyIndex++;
		// let nextItem = this.history[this.historyIndex];
		// while (nextItem && nextItem.index <= this.index) {
		// 	this.entries[lastItem.path] = lastItem.index;
		// 	this.historyIndex++;
		// 	lastItem = this.history[this.historyIndex];
		// }
	}

	read(field) {
		console.warn("DEPRECATED read. Use readPath");
		let path = field.getPath().join("/");
		return this.readPath(path);

		// if (path && this.data[path]) {
		// 	while (this.data[path][index] === undefined && index > 0) {
	  //     index--;
	  //   }
	  //   return this.data[path][index];
		// }
  }

	readPath(path) {
		const index = this.entries[path] || 0;
		return this.data[index] && this.data[index][path];
		// let index = this.index;
		//
		// if (path && this.data[path]) {
		// 	while (this.data[path][index] === undefined && index > 0) {
	  //     index--;
	  //   }
	  //   return this.data[path][index];
		// }
  }

	write(field, rawValue) {
		console.warn("DEPRECATED write. Use writePath");
		let path = field.getPath().join("/");

		this.writePath(path, rawValue);
  }

	writePath(path, rawValue) {
		if (!this.data[this.index]) {
			this.data[this.index] = {};
		}
		this.data[this.index][path] = rawValue;
		this.entries[path] = this.index;

		if (!this.entries2[path]) {
			this.entries2[path] = {};
		}
		this.entries2[path][this.index] = this.index;


		// if (!this.data[path]) {
		// 	this.data[path] = {};
		// }
		// this.data[path][this.index] = rawValue;
		//
		// this.history.push({
		// 	path: path,
		// 	last: this.entries[path] || 0,
		// 	index: this.index
		// });
		// this.historyIndex = this.history.length;
		//
		// this.entries[path] = this.index;
		// this.history.push({
		// 	path: path,
		// 	index: this.index
		// });

		// if (!this.history[this.index]) {
		// 	this.history[this.index] = {
		// 		keys: [];
		// 	}
		// }
		// this.history[this.index].keys.push(path);




		// this.clear();

		// -> missing: erase upwards changes
    // while (field.historyMin < this.index) {
    //   this.data[path][field.historyMin] = undefined;
    //   field.historyMin++;
    // }


  }



	// clear() {
	// 	while (this.max > this.index) {
	// 		for (let path in this.data) {
	// 			if (this.data[path][this.max] !== undefined) {
	// 				this.data[path][this.max] = undefined;
	// 			}
	// 		}
	// 		this.max--;
  //   }
	// }



};
