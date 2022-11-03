KarmaFieldsAlpha.Object = {};
// KarmaFieldsAlpha.Object.getValue = function(object, keys) {
// 	if (keys.length) {
// 		var key = keys.shift();
// 		if (key) {
// 			if (typeof object[key] === "object") {
// 				return this.getValue(object[key], keys);
// 			}
// 			return object[key];
// 		}
// 	}
// 	return object;
// };
// KarmaFieldsAlpha.Object.getValue = function(object, keys) {
// 	var key = keys[0];
// 	if (key !== undefined) {
// 		if (object[key] && typeof object[key] === "object") {
// 			return this.getValue(object[key], keys.slice(1));
// 		}
// 		return object[key]; //this.clone(object[key]);
// 	}
// 	return object;
// };
// KarmaFieldsAlpha.Object.getValue = function(object, keys) {
// 	var key = keys[0];
// 	if (key !== undefined) {
// 		if (object && typeof object === "object") {
// 			return this.getValue(object[key], keys.slice(1));
// 		}
// 	} else {
// 		return object;
// 	}
// };
KarmaFieldsAlpha.Object.getValue = function(object, keys) {
	if (keys.length) {
		var key = keys[0];
		if (object && typeof object === "object") {
			return this.getValue(object[key], keys.slice(1));
		}
	} else {
		return object;
	}
};

// KarmaFieldsAlpha.Object.empty = function(object, keys) {
// 	var key = keys[0];
// 	if (keys.length > 1 && object[key] && typeof object[key] === "object") {
// 		this.empty(object[key], keys.slice(1));
// 	} else if (key) {
// 		object[key] = {};
// 	}
// };
KarmaFieldsAlpha.Object.setValue = function(object, keys, value, under) {
	if (keys[1] !== undefined) {
		var key = keys[0];
		if (!object[key]) {
			object[key] = {};
		}
		this.setValue(object[key], keys.slice(1), value, under);
	// } else if (keys[0] !== undefined && value !== undefined && (!under || object[keys[0]] === undefined)) {
	// 	object[keys[0]] = value;
	} else if (keys[0] !== undefined) {
		if (under) {
			if (object[keys[0]] === undefined) {
				object[keys[0]] = value;
			}
		} else {
			if (value !== undefined) {
				object[keys[0]] = value;
			}
		}
	}
}
KarmaFieldsAlpha.Object.delete = function(object, keys) {
	this.setValue(object, keys, null);
}
// KarmaFieldsAlpha.Object.merge000 = function(object1, object2, soft) {
// 	for (var i in object2) {
// 		if (object2[i] && typeof object2[i] === "object" && !Array.isArray(object2[i])) {
// 			if (!object1[i]) {
// 				object1[i] = {};
// 			}
// 			this.merge(object1[i], object2[i], soft);
// 		} else if (object2[i] !== undefined && (!soft || object1[i] === undefined)) {
// 			object1[i] = this.clone(object2[i]);
// 		}
// 	}
// }
// KarmaFieldsAlpha.Object.merge = function(object1, object2) {
// 	for (var i in object2) {
// 		if (object2[i] && typeof object2[i] === "object") {
// 			if (!object1[i] || typeof object1[i] !== "object") {
// 				// object1[i] = new object2[i].constructor;
// 				object1[i] = this.getPrimitive(object2[i]);
// 				// if (Array.isArray(object2[i])) {
// 				// 	object1[i] = [];
// 				// } else {
// 				// 	object1[i] = {};
// 				// }
// 			}
// 			this.merge(object1[i], object2[i]);
// 		} else if (object2[i] !== undefined) {
// 			object1[i] = object2[i];
// 		}
// 	}
// }
KarmaFieldsAlpha.Object.merge = function(object1, object2) {
	for (var i in object2) {
		if (object2[i] !== undefined) {
			if (typeof object2[i] === "object") {
				if (Array.isArray(object2[i])) {
					object1[i] = object2[i].slice();
				} else {
					if (!object1[i] || typeof object1[i] !== "object") {
						object1[i] = {};
					}
					this.merge(object1[i], object2[i]);
				}
			} else {
				object1[i] = object2[i];
			}
		}
	}
}


KarmaFieldsAlpha.Object.add = function(...objects) {
	var result;
	while (objects.length) {
		var object = objects.shift();
		if (object && typeof object === "object") {
			if (!result || typeof result !== "object") {
				// result = new object.constructor;
				result = this.getPrimitive(object);
				// if (Array.isArray(object)) {
				// 	result = [];
				// } else {
				// 	result = {};
				// }
			}
			this.merge(result, object);
		} else {
			result = object;
		}
	}
	return result;
}

// KarmaFieldsAlpha.Object.clone = function(object) {
// 	var copie;
// 	if (Array.isArray(object)) {
// 		copie = object.slice();
// 	} else if (object && typeof object === "object") {
// 		copie = {};
// 		this.merge(copie, object);
// 	} else {
// 		copie = object;
// 	}
// 	return copie;
// };

KarmaFieldsAlpha.Object.getPrimitive = function(object) {
	if (Array.isArray(object)) {
		return [];
	} else {
		return {};
	}
}

KarmaFieldsAlpha.Object.clone = function(object) {
	if (object && typeof object === "object") {
		// var result;
		// if (Array.isArray(object)) {
		// 	result = [];
		// } else {
		// 	result = {};
		// }
		var result = this.getPrimitive(object);
		this.merge(result, object);
		return result;
	} else {
		return object;
	}
};
KarmaFieldsAlpha.Object.clean = function(object) {
	if (object && typeof object === "object") {
		var clone;
		if (Array.isArray(object)) {
			var array = object.filter(function(child) {
				child = KarmaFieldsAlpha.Object.clean(child);
				return child !== undefined && child !== null;
			});
			if (array.length) {
				clone = array;
			}
		} else {
			for (var i in object) {
				var child = this.clean(object[i]);
				if (child !== undefined && child !== null) {
					if (!clone) {
						clone = {};
					}
					clone[i] = child;
				}
			}
		}
		return clone;
	}
	return object;
}


// KarmaFieldsAlpha.Object.diff = function(obj1, obj2) {
//   var diff;
// 	if (obj2 === undefined) {
// 		diff = obj1;
// 	} else if (obj1 && obj2 && typeof obj1 === "object") {
// 		for (var i in obj1) {
// 			var sub = this.diff(obj1[i], obj2[i]);
//       if (sub !== null) {
// 				if (diff === null) {
// 					diff = {};
// 				}
//         diff[i] = sub;
//       }
// 		}
// 	} else if (obj1 !== obj2) {
// 		diff = obj2
// 	}
//   return diff;
// };
KarmaFieldsAlpha.Object.diff = function(obj1, obj2) {
	var diff;
	if (obj1 !== obj2) {
		if (obj1 === undefined) {
			diff = null;
		} else if (obj1 && obj2 && typeof obj1 === "object" && typeof obj2 === "object") {
			for (var i in obj1) {
				var child = this.diff(obj1[i], obj2[i]);
				if (child !== undefined) {
					if (!diff) {
						diff = {}; //new obj1.constructor; Never use array because it is filled with null value when exported to json
					}
					diff[i] = child;
				}
			}
		} else {
			diff = this.clone(obj1);
		}
	}
  return diff;
};

KarmaFieldsAlpha.Object.subtract = function(obj1, obj2) {
	var diff;
	if (obj1 !== obj2) {
		if (obj1 === undefined) {
			return null;
		} else if (obj1 && obj2 && typeof obj1 === "object" && typeof obj2 === "object") {
			for (var i in obj1) {
				var child = this.subtract(obj1[i], obj2[i]);
				if (child !== undefined) {
					if (!diff) {
						diff = {};
					}
					diff[i] = child;
				}
			}
			for (var j in obj2) {
				if (obj1[j] === undefined) {
					if (!diff) {
						diff = {};
					}
					diff[j] = null;
				}
			}
		} else {
			return this.clone(obj1);
		}
	}
  return diff;
};
KarmaFieldsAlpha.Object.unmerge = function(obj1, obj2) {
	return this.subtract(obj1, obj2);
}


KarmaFieldsAlpha.Object.contain = function(obj1, obj2) {
	if (obj1 && obj2 && typeof obj1 === "object" && typeof obj2 === "object") {
		for (var i in obj2) {
      if (!this.contain(obj1[i], obj2[i])) {
        return false;
      }
		}
		return true;
	} else {
		return obj1 === obj2;
	}
};

// KarmaFieldsAlpha.Object.differ = function(obj1, obj2) {
// 	return this.clean(obj1) !== this.clean(obj2);
// };


// deprecated
KarmaFieldsAlpha.Object.mask = function(obj, mask) {
  var result = {};
  for (var i in mask) {
    if (mask[i] && typeof mask[i] === "object" && !Array.isArray(mask[i])) {
      result[i] = this.mask(obj[i] || {}, mask[i]);
    } else {
      result[i] = this.clone(obj[i]);
    }
  }
  return result;
};

// KarmaFieldsAlpha.Object.clean = function(object) {
// 	var isNotEmpty;
// 	if (object && typeof object === "object") {
// 		for (var i in object) {
//
// 			if (object[i] !== undefined || typeof object[i] === "object") {
//
// 			}
// 		}
// 	}
//
// 	return object;
// };
KarmaFieldsAlpha.Object.isEmpty = function(object) {
	if (object && typeof object === "object") {
		for (var i in object) {
			if (!this.isEmpty(object[i])) {
				return false;
			}
		}
	} else if (object !== undefined) {
		return false;
	}
	return true;
};

// moved
// KarmaFieldsAlpha.Object.serialize = function(object) {
// 	var params = [];
// 	for (var key in object) {
//     params.push(key + "=" + encodeURIComponent(object[key]));
// 	}
// 	return params.join("&");
// }

// deprecated
KarmaFieldsAlpha.Object.forEach = function(object, callback, keys) {
	if (object && typeof object === "object") {
		for (var key in object) {
	    this.forEach(object[key], callback, (keys||[]).concat(key));
		}
	} else {
		callback(keys, object);
	}
}

// like contain but return true when obj2 is empty
KarmaFieldsAlpha.Object.compare = function(obj1, obj2) {
	// if (obj1 && obj2 && typeof obj1 === "object" && typeof obj2 === "object") {
	if (obj2 && typeof obj2 === "object") {
		for (var i in obj2) {
      if (!obj1 || typeof obj1 !== "object" || !this.compare(obj1[i], obj2[i])) {
        return false;
      }
		}
		return true;
	} else {
		return obj1 === obj2;
	}
};
