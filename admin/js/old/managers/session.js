
KarmaFieldsAlpha.Storage = class {

	static get(path) {
		return localStorage.getItem(path);
	}

	static set(path, value) {
		localStorage.setItem(path, value);
	}

	static remove(path) {
		localStorage.removeItem(path);
	}

	static getEntries(prefix) {
		const flatObject = {};
		for (let i = 0; i < localStorage.length; i++) {
			let path = localStorage.key(i);
			if (!prefix || path.startsWith(prefix)) {
				flatObject[path.slice(prefix.length)] = localStorage.getItem(path);
			}
		}
		return flatObject;
	}

	static hasEntry(prefix) {
		for (let i = 0; i < localStorage.length; i++) {
			let path = localStorage.key(i);
			if (!prefix || path.startsWith(prefix)) {
				return true;
			}
		}
		return false;
	}

	static empty(prefix) {
		for (let i = 0; i < localStorage.length; i++) {
			let path = localStorage.key(i);
			if (!prefix || path.startsWith(prefix)) {
				localStorage.removeItem(path);
			}
		}
	}

	// copy(entries) {
	// 	for (let path in entries) {
	// 		if (entries[path] === null) {
	// 			localStorage.removeItem(path);
	// 		} else if (entries[path] !== undefined) {
	// 			localStorage.setItem(path, entries[path]);
	// 		}
	// 	}
	// }

}
