
KarmaFieldsAlpha.Delta = class {

	constructor() {
		this.suffix = "karma/";

	}

	getValue(path) {
		let value = localStorage.getItem(this.suffix+path);
		return value;
	}

	setValue(value, path) { // overrided with async by arrays
		if (KarmaFieldsAlpha.Gateway.original[path] !== value && value !== undefined && value !== null) {
			localStorage.setItem(this.suffix+path, value);
		} else {
			localStorage.removeItem(this.suffix+path);
		}
	}

	removeValue(path) {
		localStorage.removeItem(this.suffix+path);
	}

	getObject() {
		const flatObject = {};
		for (let i = 0; i < localStorage.length; i++) {
			let path = localStorage.key(i);
			if (path.startsWith(this.suffix)) {
				flatObject[path.slice(this.suffix.length)] = localStorage.getItem(path);
			}
		}
		return flatObject;
	}

	has() {
		for (let i = 0; i < localStorage.length; i++) {
			let path = localStorage.key(i);
			if (path.startsWith(this.suffix)) {
				return true;
			}
		}
		return false;
	}

	empty() {
		console.log("empty", localStorage.length);

		// for (let i = 0; i < localStorage.length; i++) {
		// 	let path = localStorage.key(i);
		// 	if (path.startsWith(this.suffix)) {
		// 		console.log("removeItem", path);
		// 		localStorage.removeItem(path);
		// 	}
		// }

		for (let i = localStorage.length - 1; i >= 0; i--) {
			let path = localStorage.key(i);
			console.log("removeItem", path, i, path.startsWith(this.suffix));
			if (path.startsWith(this.suffix)) {
				localStorage.removeItem(path);
			}
		}

	}

}
