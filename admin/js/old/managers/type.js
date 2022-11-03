//
// KarmaFieldsAlpha.Type = class {
//
// 	static register(type, path) {
// 		this.types[path] = type;
// 	}
//
// 	static sanitize(value, path) {
// 		if (value && this.types[path] === "json") {
// 			value = JSON.stringify(value);
// 		}
// 		if (typeof value === "number") {
// 			value = value.toString();
// 		}
// 		return value;
// 	}
//
// 	static parse(value, path) {
// 		if (value && this.types[path] === "json") {
// 			return JSON.parse(value);
// 		}
// 		return value;
// 	}
//
// 	static sanitizeObject(flatObject) {
// 		const obj = {};
// 		for (let path in flatObject) {
// 			obj[path] = this.sanitize(flatObject[path], path);
// 		}
// 		return obj;
// 	}
//
// 	static parseObject(flatObject) {
// 		const obj = {};
// 		for (let path in flatObject) {
// 			obj[path] = this.parse(flatObject[path], path);
// 		}
// 		return obj;
// 	}
//
// }
//
// KarmaFieldsAlpha.Type.types = {};



KarmaFieldsAlpha.Type = class {

	static register(type, ...path) {
		// this.types[path] = type;
		KarmaFieldsAlpha.DeepObject.assign(this.types, type, ...path);
	}

	static get(...path) {
		return KarmaFieldsAlpha.DeepObject.get(this.types, ...path);
	}

	static sanitize(value, ...path) {

		if (value === undefined) {
			console.log(value, path);
 			console.error("Type error: cannot store undefined value");
 		}

		const type = KarmaFieldsAlpha.DeepObject.get(this.types, ...path);

		if (value && type === "json") {
			value = JSON.stringify(value);
		} else if (value && typeof value === "object") {
			for (let i in value) {
				value[i] = this.sanitize(value[i], ...path, i);
			}
		} else if (typeof value === "number") {
			console.log(value, path);
			console.error("Type error: cannot store value as Number");
		} else if (typeof value === "boolean") {
			console.log(value, path);
			console.error("Type error: cannot store value as Boolean");
		}
		return value;
	}

	static parse(value, ...path) {
		const type = KarmaFieldsAlpha.DeepObject.get(this.types, ...path);

		if (type === "json" && typeof value === "string") {
			try {
				return JSON.parse(value);
			} catch (error) {
				console.log(value, "/", type, "/", path);
				console.error("Type error: error parsing json");
			}
		} else if (value && typeof value === "object") {
			for (let i in value) {
				value[i] = this.parse(value[i], ...path, i);
			}
		} else if (typeof value === "number") {
			console.error("Type error: value should never be stored as Number");
		} else if (typeof value === "boolean") {
			console.error("Type error: value should never be stored as Boolean");
		}
		return value;
	}

	// static sanitizeObject(flatObject) {
	// 	console.warn("deprecated sanitizeObject");
	// 	const obj = {};
	// 	for (let path in flatObject) {
	// 		obj[path] = this.sanitize(flatObject[path], ...path.split("/"));
	// 	}
	// 	return obj;
	// }
	//
	// static parseObject(flatObject) {
	// 	console.warn("deprecated parseObject");
	// 	const obj = {};
	// 	for (let path in flatObject) {
	// 		obj[path] = this.parse(flatObject[path], ...path.split("/"));
	// 	}
	// 	return obj;
	// }

	static sanitizeObject(object, ...path) {
		console.error("deprecated: use Type::sanitize");
	  const result = {};
		for (let i in object) {
			const type = KarmaFieldsAlpha.DeepObject.get(this.types, ...path, i);
			const valueType = typeof object[i];

			if (type === "json" && valueType === "object") {
				result[i] = JSON.stringify(object[i]);
			} else if (object[i] && valueType === "object") {
	      result[i] = this.sanitizeObject(object[i], ...path, i);
	    } else if (valueType === "string") {
	      result[i] = object[i];
	    }
	  }
	  return result;
	}


	static parseObject(object, ...path) {
		console.error("deprecated: use Type::parse");
	  const result = {};
		for (let i in object) {
			const type = KarmaFieldsAlpha.DeepObject.get(this.types, ...path, i);
			const valueType = typeof object[i];

			if (type === "json" && valueType === "string") {
				result[i] = JSON.parse(object[i]);
			} else if (object[i] && valueType === "object") {
	      result[i] = this.parseObject(object[i], ...path, i);
	    } else if (valueType === "string") {
	      result[i] = object[i];
	    }
	  }
	  return result;
	}


}

KarmaFieldsAlpha.Type.types = {};
