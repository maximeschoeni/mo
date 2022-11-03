// KarmaFieldsAlpha.cast = function(value, type) {
// 	if (type === "array") {
// 		if (!Array.isArray(value)) {
// 			if (value && typeof value === "object") {
// 				return Object.values(value);
// 			} else {
// 				return [];
// 			}
// 		}
// 	} else if (type === "object") {
// 		if (Array.isArray(value)) {
// 			return {...value};
// 		} else if (!value || typeof value !== "object") {
// 			return {};
// 		}
// 	} else if (type === "number") {
// 		if (isNaN(value)) {
// 			return 0;
// 		}
// 	} else if (type === "boolean") {
// 		if (typeof value !== "boolean") {
// 			return Boolean(value);
// 		}
// 	} else if (type === "string") {
// 		if (typeof value === "number") {
// 			return value.toString();
// 		} else if (typeof value !== "string") {
// 			return "";
// 		}
// 	}
// 	return value;
// }
//
//
// Array.prototype.toObject = function() {
// 	var obj = {};
// 	for (var i=0; i<this.length; i++){
// 		obj[i] = this[i];
// 	}
// 	return obj;
// }
// Array.prototype.toString = function() {
// 	return "";
// }
// Object.prototype.toArray = function() {
// 	return Object.values(this);
// }
// Object.prototype.toString = function() {
// 	return "";
// }
// Object.prototype.toNumber = function() {
// 	return 0;
// }
// Object.prototype.toBoolean = function() {
// 	return false;
// }
// String.prototype.toArray = function() {
// 	return [];
// }
// String.prototype.toObject = function() {
// 	return {};
// }
// String.prototype.toNumber = function() {
// 	return !isNaN(this) && parseInt(this) || 0;
// }
// String.prototype.toBoolean = function() {
// 	return Boolean(this);
// }
// Number.prototype.toArray = function() {
// 	return [];
// }
// Number.prototype.toObject = function() {
// 	return {};
// }
// Number.prototype.toBoolean = function() {
// 	return Boolean(this);
// }
// Boolean.prototype.toArray = function() {
// 	return [];
// }
// Boolean.prototype.toObject = function() {
// 	return {};
// }
