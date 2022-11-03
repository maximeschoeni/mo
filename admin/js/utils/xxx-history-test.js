

KarmaFieldsAlpha.History = class {

	static buffer = new KarmaFieldsAlpha.Buffer();

	static save() {

		history.pushState({}, null);

	}

	static get(...path) {
		const state = history.state || {};
		return KarmaFieldsAlpha.DeepObject.get(state, ...path);
	}

	static set(value, ...path) {
		const state = {...history.state};
		if (value) {
			KarmaFieldsAlpha.DeepObject.assign(state, value, ...path);
		} else {
			KarmaFieldsAlpha.DeepObject.remove(state, ...path);
		}
		history.replaceState(state, null);
	}

	static remove(...path) {
		this.set(null, ...path);
	}

	// static getIndex() {
	// 	return this.buffer.get("history", "index") || 0;
	// }

	// static setIndex(index) {
	// 	return this.buffer.set(index, "history", "index");
	// }

	// static tie(newValue, ...path) {
	//
	// 	let index = this.getIndex() || 0;
	//
	// 	const lastValue = this.get(index, ...path);
	//
	// 	if (KarmaFieldsAlpha.DeepObject.differ(newValue, lastValue)) {
	// 		this.save();
	// 	}
	//
	// }

	// static pack(newValue, currentValue, ...path) {
	//
	// 	const index = this.getIndex();
	// 	const lastValue = this.get(index-1, ...path);
	//
	// 	this.set(newValue, index, ...path);
	//
	// 	if (lastValue === undefined && index > 0) {
	// 		this.set(currentValue, index-1, ...path);
	// 	}
	//
  // }

	// static push(value, ...path) {
	// 	const index = this.getIndex();
	// 	this.set(value, index, ...path);
  // }

	static backup(newValue, currentValue, deprec, context, ...path) {

		// if (tie) {
		// 	this.save();
		// }

		// let index = this.getIndex();

		// if (index === 0) {
		// 	index++;
		// }

		newValue = KarmaFieldsAlpha.DeepObject.clone(newValue);

		// if (context === "nav") {
		//
		// 	const hash = KarmaFieldsAlpha.Nav.toString(newValue);
		//
		//
		// }

		this.set(newValue, index, ...path);

		if (index > 0) {

			const lastValue = this.get(index-1, ...path);

			if (lastValue === undefined) {

				if (currentValue === undefined) {
					currentValue = null;
				} else {
					currentValue = KarmaFieldsAlpha.DeepObject.clone(currentValue);
				}


				this.set(currentValue, index-1, ...path);
			}

		}


		// else if (KarmaFieldsAlpha.DeepObject.equal(newValue, lastValue)) {
		// 	// this.remove(index, ...path);
		// 	this.buffer.set(index-1, "history", "index");
		// 	this.buffer.set(index-1, "history", "max");
		// }





		// if (type === "break") {
		//
		// 	let index = this.getIndex();
		// 	const lastValue = this.get(index, ...path);
		//
		// 	if (KarmaFieldsAlpha.DeepObject.differ(newValue, lastValue)) {
		// 		this.break();
		// 		this.set(newValue, index+1, ...path);
		//
		// 		if (lastValue === undefined) {
		// 			this.set(null, index, ...path);
		// 		}
		// 	}
		//
		// } else {
		//
		// 	let index = this.getIndex();
		// 	const lastValue = this.get(index-1, ...path);
		//
		// 	if (KarmaFieldsAlpha.DeepObject.differ(newValue, lastValue)) {
		// 		this.set(newValue, index, ...path);
		//
		// 		if (lastValue === undefined && index > 0) {
		// 			this.set(null, index-1, ...path);
		// 		}
		// 	}
		//
		// }

  }


	// static backup(...path) { // path = ["data", "driver", "id", "key"]
	// 	const value = this.buffer.get(...path) || null;
	// 	this.write(value, ...path);
	// }

	static write(value, ...path) {
		const index = this.buffer.get("history", "index") || 0;
		this.buffer.set(value, "history", index, ...path);
	}

	static undo() {
		let index = this.buffer.get("history", "index") || 0;

		if (index > 0) {

			// decrement index and save
			index--;
			this.buffer.set(index, "history", "index");

			// rewind previous state
			const data = this.buffer.get("history", index, "data") || {};
			this.buffer.merge(data, "data");

      const nav = this.buffer.get("history", index, "nav") || {};
			KarmaFieldsAlpha.Nav.merge(nav);

			const state = this.buffer.get("history", index, "state") || {};
			this.buffer.merge(state, "state");

			KarmaFieldsAlpha.Nav.edit();

		}

	}

	static hasUndo() {
		const index = this.buffer.get("history", "index") || 0;
		return index > 0;
	}

  static redo() {
		let index = this.buffer.get("history", "index") || 0;
		let max = this.buffer.get("history", "max") || 0;

		if (index < max) {

			// increment index and save
			index++;
			this.buffer.set(index, "history", "index");

			// merge state in delta
			const data = this.buffer.get("history", index, "data") || {};
			this.buffer.merge(data, "data");
			// this.buffer.clean("data");

      const nav = this.buffer.get("history", index, "nav") || {};
			KarmaFieldsAlpha.Nav.merge(nav);

			// const ids = this.buffer.get("history", index, "ids") || [];
			// this.buffer.set(ids, "ids");
			//
			// const selection = this.buffer.get("history", index, "selection") || [];
			// this.buffer.set(selection, "selection");

			const state = this.buffer.get("history", index, "state") || {};
			this.buffer.merge(state, "state");

			KarmaFieldsAlpha.Nav.edit();

		}

	}

	static hasRedo() {
		const index = this.buffer.get("history", "index") || 0;
		const max = this.buffer.get("history", "max") || 0;

		return index < max;
	}

	static hasChange(...path) {
		const index = this.buffer.get("history", "index") || 0;
		return this.buffer.has("history", index, ...path);
	}

}


//
// KarmaFieldsAlpha.History = class {
//
// 	static buffer = new KarmaFieldsAlpha.Buffer("history");
// 	static dataBuffer = new KarmaFieldsAlpha.Buffer("data");
//
// 	static save() {
//
// 		// -> increase index and max
// 		let index = this.buffer.get("index") || 0;
// 		index++;
//
// 		this.buffer.set(index, "index");
// 		this.buffer.set(index, "max");
//
// 		// erase history forward
// 		if (this.buffer.has(index)) {
// 			this.buffer.remove(index);
// 		}
//
// 	}
//
// 	static backup(...path) {
// 		const value = this.dataBuffer.get(...path) || null;
// 		this.write(value, ...path);
// 	}
//
// 	static write(value, ...path) {
// 		const index = this.buffer.get("index") || 0;
// 		this.buffer.set(value, index, ...path);
// 	}
//
// 	static undo() {
// 		let index = this.buffer.get("index") || 0;
//
// 		if (index > 0) {
//
// 			// decrement index and save
// 			index--;
// 			this.buffer.set(index, "index");
//
// 			// rewind previous state
// 			const content = this.buffer.get(index, "data") || {};
// 			this.dataBuffer.merge(content);
//
//       const nav = this.buffer.get(index, "nav") || {};
// 			KarmaFieldsAlpha.Nav.merge(nav);
//
// 		}
//
// 	}
//
// 	static hasUndo() {
// 		const index = this.buffer.get("index") || 0;
// 		return index > 0;
// 	}
//
//   static redo() {
// 		let index = this.buffer.get("index") || 0;
// 		let max = this.buffer.get("max") || 0;
//
// 		if (index < max) {
//
// 			// increment index and save
// 			index++;
// 			this.buffer.set(index, "index");
//
// 			// merge state in delta
// 			const content = this.buffer.get(index, "table") || {};
// 			this.dataBuffer.merge(content);
//
//       const nav = this.buffer.get(index, "nav") || {};
// 			KarmaFieldsAlpha.Nav.merge(nav);
//
// 		}
//
// 	}
//
// 	static hasRedo() {
// 		const index = this.buffer.get("index") || 0;
// 		const max = this.buffer.get("max") || 0;
// 		return index < max;
// 	}
//
//
//
// }
