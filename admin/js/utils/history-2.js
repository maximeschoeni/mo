

KarmaFieldsAlpha.History = class {

	static buffer = new KarmaFieldsAlpha.Buffer();

	static save() {

		this.currentClip = {
			time: Date.now(),
			state: {}
		};

		// -> increase index and max
		let index = this.buffer.get("history", "index") || 0;
		index++;

		const next = this.buffer.get("history", "next") || {};

		this.buffer.set(index, "history", "index");
		this.buffer.set(index, "history", "max");

		// erase history forward
		if (this.buffer.has("history", index)) {
			this.buffer.remove("history", index);
		}

		this.buffer.set(next, "history", "next");

	}

	static complete() {

		if (this.currentClip) {

			const paramString = KarmaFieldsAlpha.Params.stringify(this.state.nav)

			history.pushState(this.state, "", `#${paramString}`);

		}

	}

	// static get(index, ...path) {
	// 	return this.buffer.get("history", index, ...path);
	// }
	//
	// static set(value, index, ...path) {
	// 	this.buffer.set(value, "history", index, ...path);
	// }
	//
	// static remove(...path) {
	// 	this.buffer.remove("history", ...path);
	// }
	//
	// static getIndex() {
	// 	return this.buffer.get("history", "index") || 0;
	// }
	//
	// static setIndex(index) {
	// 	return this.buffer.set(index, "history", "index");
	// }


	static backup(newValue, currentValue, tie, ...path) {





		let index = this.buffer.get("history", "index") || 0;

		// if (index === 0) {
		// 	index++;
		// }

		newValue = KarmaFieldsAlpha.DeepObject.clone(newValue); // -> todo: use freeze instead

		// this.buffer.set(newValue, index, ...path);
		this.buffer.set(newValue, "history", "next", ...path);

		// if (index > 0) {

			// const lastValue = this.get(index-1, ...path);
			const lastValue = this.buffer.get("history", index, ...path)

			if (lastValue === undefined) {

				if (currentValue === undefined) {
					currentValue = null;
				} else {
					currentValue = KarmaFieldsAlpha.DeepObject.clone(currentValue); // -> todo: use freeze instead
				}


				// this.set(currentValue, index, ...path);
				this.buffer.set(currentValue, "history", index, ...path);
			}

		// }




  }


	// static backup(...path) { // path = ["data", "driver", "id", "key"]
	// 	const value = this.buffer.get(...path) || null;
	// 	this.write(value, ...path);
	// }

	// static write(value, ...path) {
	// 	const index = this.buffer.get("history", "index") || 0;
	// 	this.buffer.set(value, "history", index, ...path);
	// }

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
