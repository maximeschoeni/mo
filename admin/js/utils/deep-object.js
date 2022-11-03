//
// var deepObject = {
//   gateway: [
//     {
//       spectacles: [
//         {
//           id: [
//               "49028x2022-12-16 17:13:00"
//           ],
//           spectacle_id: [
//               "49028"
//           ],
//           title: [
//               "Teresa Vittucci (AT/CH)"
//           ],
//           spectacle_date: [
//               "2022-12-16 17:13:00"
//           ],
//           date: [
//               "2022-12-16"
//           ],
//           hour: [
//               "17:13"
//           ],
//           count: [
//               "3/50"
//           ],
//           trash: [
//               "0"
//           ]
//         }
//       ]
//     }
//   ]
// }
//
// var deepObject = {
//   a: [
//     {
//       b: [
//         {
//           c: ["x"]
//         }
//       ],
//       d: ["f"]
//     }
//   ]
// };
//


KarmaFieldsAlpha.DeepObject = class {


  // static getNEW(object, key, ...path) {
  //   if (key !== undefined) {
  // 		if (object) {
  // 			return object && this.getNEW(object[key], ...path);
  // 		}
  // 	} else {
  // 		return object;
  // 	}
  // };

  static get(object, key, ...path) {
    if (key !== undefined) {
  		if (object) {
  			return object && this.get(object[key], ...path);
  		}
  	} else {
  		return object;
  	}
  };

  // static assignNEW(object, value, key, ...path) {
  //   if (object && key !== undefined) {
  //     if (!object[key]) {
  //       object[key] = Array.isArray(object) ? {} : [];
  //     }
  //     if (path.length > 0) {
  //       this.assignNEW(object[key], value, ...path);
  //     } else {
  //       object[key] = value;
  //     }
  //   }
  // }


  static assign(object, value, key, ...path) {
    if (key !== undefined) {
      if (path.length > 0) {
        if (!object[key]) {
          // object[key] = {}; // (typeof path[0] === "number") ? [] : {};
          // object[key] = Array.isArray(object) ? {} : [];
          // object[key] = typeof path[0] === "number" ? [] : {};
          object[key] = {};
        }
        this.assign(object[key], value, ...path);
      } else {
        object[key] = value;
      }
    }
    // else {
    //   Object.assign(object, value);
    // }
  }

  static remove(object, key, ...path) {
    if (key !== undefined && object) {
      if (path.length > 0) {
        this.remove(object[key], ...path);
      } else {
        if (Array.isArray(object)) {
          object.splice(key, 1);
        } else if (object) {
          delete object[key];
        }
      }
    }
  }

  static has(object, key, ...path) {
    if (key !== undefined) {
      if (path.length > 0 && object[key]) {
        return this.has(object[key], ...path);
      } else {
        return object[key] !== undefined;
      }
    }
    return false;
  };

  // static merge(object1, object2) {
  // 	for (var i in object2) {
  // 		if (typeof object2[i] === "object" && !Array.isArray(object2[i])) {
  // 			if (object2[i]) {
  //
  //         if (!object1[i] || typeof object1[i] !== "object") {
  // 					object1[i] = {};
  // 				}
  // 				// if (!object1[i] || typeof object1[i] !== "object") {
  // 				// 	object1[i] = Array.isArray(object2[i]) ? [] : {};
  // 				// }
  // 				this.merge(object1[i], object2[i]);
  // 			} else if (object1[i] !== undefined) { // object2[i] -> null
  //         delete object1[i];
  //   		}
  //     } else {
  // 			object1[i] = object2[i];
  // 		}
  // 	}
  // }

  // static merge(object1, object2) {
  // 	for (var i in object2) {
  //     if (object2[i] === null) {
  //       delete object1[i];
  //     } else if (object2[i].constructor === Object) {
  //       if (!object1[i] || object1[i].constructor !== Object) {
	// 				object1[i] = {};
	// 			}
	// 			this.merge(object1[i], object2[i]);
  //     } else {
  // 			object1[i] = object2[i];
  // 		}
  // 	}
  // }

  // static merge(object1, object2) {
  // 	for (var i in object2) {
  //     if (object2[i] === null) {
  //       delete object1[i];
  //     } else if (typeof object2[i] === "object") {
  //       if (!object1[i] || typeof object1[i] !== "object") {
	// 				object1[i] = new object2[i].constructor();
	// 			}
	// 			this.merge(object1[i], object2[i]);
  //     } else if (object2[i] !== undefined) {
  // 			object1[i] = object2[i];
  // 		}
  // 	}
  // }

  // static merge2(object1, object2) {
  //   if (object2 === null) {
  //
  //   }
  //   if (object2.constructor === Object) {
  //     if (object1.constructor !== Object) {
  //       object1 = {};
  //     }
  //     for (var i in object2) {
  //       if (object2[i] === null) {
  //         delete object1[i];
  //       }
  //     }
  //   }
  //

  // static mergeNEW(object1, object2) {
  // 	for (var i in object2) {
  //     if (object2[i] === null) {
  //       delete object1[i];
  //     } else if (object2[i].constructor === Object) {
  //       if (!object1[i] || typeof object1[i] !== "object") {
	// 				object1[i] = {};
	// 			}
	// 			this.merge(object1[i], object2[i]);
  //     } else if (object2[i] !== undefined) {
  // 			object1[i] = object2[i];
  // 		}
  // 	}
  // }

  // static merge(object1, object2) {
  // 	for (let i in object2) {
  //     if (object2[i] === null) {
  //       delete object1[i];
  //     } else if (object2[i].constructor === Object) {
  //       if (!object1[i] || typeof object1[i] !== "object") {
	// 				object1[i] = {};
	// 			}
	// 			this.merge(object1[i], object2[i]);
  //     } else if (object2[i] !== undefined) {
  // 			object1[i] = object2[i];
  // 		}
  // 	}
  // }

  static isDeep(object) {
    return object && object.constructor === Object && !Object.isFrozen(object);
  }

  static merge(object1, object2) {
  	for (let i in object2) {
      if (object2[i] === null) {
        delete object1[i];
      } else if (this.isDeep(object1[i]) && this.isDeep(object2[i])) {
				this.merge(object1[i], object2[i]);
      } else if (object2[i] !== undefined) {
  			object1[i] = object2[i];
  		}
  	}
  }

  // static clone(...objects) {
  //   const result = {};
  //   objects.forEach(object => {
  //     this.merge(result, object);
  //   });
  //   return result;
  // }
  //
  // static cloneArray(...objects) {
  //   const result = [];
  //   objects.forEach(object => {
  //     this.merge(result, object);
  //   });
  //   return result;
  // }

  static clone(object) {
    return this.map(object, object => object);
  }

  // static isDifferent(object1, object2) {
  //   this.some(object1, (sub1, ...path) => {
  //     return (typeof object === "string") && object !== this.get(object2, ...path);
  //   });
  // }

  // static forEachBKP(object, callback, ...path) {
  //   if (object && typeof object === "object" && !Array.isArray(object)) {
  //     for (let i in object) {
  //       this.forEach(object[i], callback, ...path, i);
  //     }
  //   } else if (object !== undefined) {
  //     callback(object, ...path);
  //   }
  // }

  // static forEachNEW(object, callback, ...path) {
  //   if (object && object.constructor === Object) {
  //     for (let key in object) {
  //       object[key].forEach((object, index) => {
  //         this.forEach(object, callback, ...path, key, index);
  //       });
  //     }
  //   } else {
  //     callback(object, ...path);
  //   }
  // }

  // static forEach(array, callback, ...path) {
  //   array.forEach((object, index) => {
  //     if (object && object.constructor === Object) {
  //       for (let key in object) {
  //         this.forEach(object[key], callback, ...path, index, key);
  //       }
  //     } else {
  //       callback(object, ...path);
  //     }
  //   });
  // }

  static forEach(object, callback, ...path) {
    if (Array.isArray(object)) {
      object.forEach((object, index) => {
        this.forEach(object, callback, ...path, index)
      });
    } else if (object && typeof object === "object") {
      Object.entries(object).forEach(([key, value]) => {
        this.forEach(value, callback, ...path, key)
      });
    } else {
      callback(object, ...path);
    }
  }

  // static map(object, callback, ...path) {
  //   let result = {};
  //   if (object && typeof object === "object" && !Array.isArray(object)) {
  //     for (let i in object) {
  //       result[i] = this.map(object[i], callback, ...path, i);
  //     }
  //   } else if (object !== undefined) {
  //     result = callback(object, ...path);
  //   }
  //   return result;
  // }

  // static map(array, callback, ...path) {
  //   return array.map((object, index) => {
  //     if (object && typeof object === "object") {
  //       let result = {};
  //       for (let key in object) {
  //         result[key] = this.map(object[key], callback, ...path, index, key);
  //       }
  //       return result;
  //     } else {
  //       return callback(object, ...path);
  //     }
  //   });
  // }

  static map(object, callback, ...path) {
    if (Array.isArray(object)) {
      return object.map((object, index) => this.map(object, callback, ...path, index));
    } else if (object && typeof object === "object") {
      let result = {};
      for (let key in object) {
        result[key] = this.map(object[key], callback, ...path, key);
      }
      return result;
    } else {
      return callback(object, ...path);
    }
  }



  // static someBKP(object, callback, ...path) {
  //   if (object && typeof object === "object" && !Array.isArray(object)) {
  //     for (let i in object) {
  //       if (this.some(object[i], callback, ...path, i)) {
  //         return true;
  //       }
  //     }
  //   } else if (object !== undefined && callback(object, ...path)) {
  //     return true;
  //   }
  //   return false;
  // }
  //
  // static some(array, callback, ...path) {
  //   return array.some((object, index) => {
  //     if (object && typeof object === "object") {
  //       for (let key in object) {
  //         if (this.some(object[key], callback, ...path, index, key)) {
  //           return true;
  //         }
  //       }
  //     } else {
  //       return callback(object, ...path);
  //     }
  //   });
  // }

  static some(object, callback, ...path) {
    if (Array.isArray(object)) {
      return object.some((object, index) => this.some(object, callback, ...path, index));
    } else if (object && typeof object === "object") {
      return Object.some(object).some(([key, value]) => this.some(value, callback, ...path, key));
    } else {
      return callback(object, ...path);
    }
  }



  // static async someAsync(object, callback, ...path) {
  //   if (object && typeof object === "object" && !Array.isArray(object)) {
  //     for (let i in object) {
  //       if (await this.someAsync(object[i], callback, ...path, i)) {
  //         return true;
  //       }
  //     }
  //   } else if (object !== undefined && await callback(object, ...path)) {
  //     return true;
  //   }
  //   return false;
  // }

  // static everyBKP(object, callback, ...path) {
  //   // if (object && typeof object === "object" && object.constructor !== Array) {
  //   if (object && object.constructor === Object) {
  //     for (let i in object) {
  //       if (!this.every(object[i], callback, ...path, i)) {
  //         return false;
  //       }
  //     }
  //   } else if (object === undefined || !callback(object, ...path)) {
  //     return false;
  //   }
  //   return true;
  // }


  // static everyNEW(object, callback, ...path) {
  //   if (object && object.constructor === Object) {
  //     for (let key in object) {
  //       if (!object[key].every((object, index) => this.everyNEW(object, callback, ...path, key, index))) {
  //         return false;
  //       }
  //     }
  //   } else if (object === undefined || !callback(object, ...path)) {
  //     return false;
  //   }
  //   return true;
  // }

  // static every(array, callback, ...path) {
  //   return array.every((object, index) => {
  //     if (object && object.constructor === Object) {
  //       for (let key in object) {
  //         if (!this.every(object[key], callback, ...path, index, key)) {
  //           return false;
  //         }
  //       }
  //       return true;
  //     } else {
  //       return callback(object, ...path, index);
  //     }
  //   });
  // }

  static every(object, callback, ...path) {
    if (Array.isArray(object)) {
      return object.every((object, index) => this.every(object, callback, ...path, index));
    } else if (object && object.constructor === Object) {
      return Object.entries(object).every(([key, value]) => this.every(value, callback, ...path, key));
    } else {
      return callback(object, ...path);
    }
  }



  // static filterBKP(object, callback, ...path) {
  //   let output;
  //   if (object && typeof object === "object" && !Array.isArray(object)) {
  //     for (let i in object) {
  //       if (this.filter(object[i], callback, ...path, i) !== undefined) {
  //         if (!output) {
  //           // output = {};
  //           output = Array.isArray(object) ? [] : {};
  //         }
  //         output[i] = object[i];
  //       }
  //     }
  //   } else if (object !== undefined && callback(object, ...path)) {
  //     output = object;
  //   }
  //   return output;
  // }

  // static filter(array, callback, ...path) {
  //   return array.filter((object, index) => {
  //     if (object && typeof object === "object") {
  //       let count = 0;
  //       let output = {};
  //       for (let key in object) {
  //         output.key = this.filter(object[key], callback, ...path, index, key);
  //         count += output.key.length;
  //       }
  //       return count > 0 && output;
  //     } else {
  //       return callback(object, ...path)
  //     }
  //   });
  // }

  // var obj = {
  //   a: ["x", "y"],
  //   b: [7]
  // }
  //
  // filter(obj, (item, ...path) => {
  //   return typeof item === "string";
  // });

  static filter(object, callback) {
    if (Array.isArray(object)) {
      return object.filter(object => this.filter(object, callback) !== undefined);
    } else if (object && typeof object === "object") {
      let output = undefined;
      for (let key in object) {
        const child = this.filter(object[key], callback);
        if (child !== undefined) {
          if (!output) {
            output = {};
          }
          output[key] = child;
        }
      }
      return output;
    } else if (callback(object)) {
      return object;
    }
  }

  static differ(object, original) {
		// if (Array.isArray(object) && original) {
    //   return object.length !== original.length || object.some((item, index) => this.differ(item, original[index]));
		// } else if (typeof object === "object" && original) {
    //   return this.some(object, (item, ...path) => this.differ(item, this.get(original, ...path)));
		// } else {
		// 	return object !== original;
		// }
    return !this.equal(object, original);
	}

  // static equalBKP(o1, o2) {
	// 	if (Array.isArray(o1)) {
  //     return Array.isArray(o2) && o1.length === o2.length && o1.every((item, index) => this.equal(item, o2[index]));
	// 	} else if (o1 && typeof o1 === "object") {
  //     return typeof o2 === "object" && this.every(o1, (item, ...path) => this.equal(item, this.get(o2, ...path)));
	// 	} else {
	// 		return o1 === o2;
	// 	}
	// }

  // static equalNEW(o1, o2) {
  //   if (o1 && typeof o1 === "object") {
  //     return typeof o2 === "object" && this.every(o1, (item, ...path) => this.equal(item, this.get(o2, ...path)));
	// 	} else {
	// 		return o1 === o2;
	// 	}
	// }

  // static equal(array1, array2) {
  //   return array1.length === array2.length && this.every(array1, (object1, ...path) => {
  //     return object1 === this.get(array2, ...path);
  //   });
	// }

  // static equalBKP(object1, object2) {
  //   return this.every(object1, (value, ...path) => value === this.get(object2, ...path));
	// }

  static equal(object1, object2) {
  	// if (Array.isArray(object1) && Array.isArray(object2) && object1.length === object2.length) {
    //   return object1.every((item, index) => this.equal(item, object2[index]));
		// } else if (object1 && object1.constructor === Object && object2 && object2.constructor === Object) {
    //   for (let key in object1) {
    //     if (!this.equal(object1[key], object2[key])) {
    //       return false;
    //     }
    //   }
    //   return true;
		// } else {
		// 	return object1 == object2;
		// }

    // {} must equals undefined:

    if (Array.isArray(object1) && Array.isArray(object2) && object1.length === object2.length) {
      return object1.every((item, index) => this.equal(item, object2[index]));
		} else if (object1 && object1.constructor === Object) {
      for (let key in object1) {
        if (!object2 || object2.constructor !== Object || !this.equal(object1[key], object2[key])) {
          return false;
        }
      }
      return true;
		} else {
			return object1 == object2;
		}
	}


  // deprec
  static sanitize(array) {
    array.forEach((object, index) => {
      if (object && typeof object === "object") {
        for (let key in object) {
          if (!Array.isArray(object[key])) {
            object[key] = [object[key]];
          }
          this.sanitize(object[key]);
        }
      }
    });
  }


  static create(value, ...path) {
    if (path.length) {
      const object = {};
      KarmaFieldsAlpha.DeepObject.assign(object, value, ...path);
      return object;
		}
    return value;
  }

  static isEmpty(object) {
    // if (Array.isArray(object)) {
    //   return object.every(item => this.isEmpty(item));
		// } else if (object && object.constructor === Object) {
    //   for (let key in object) {
    //     if (this.isEmpty(object[key])) {
    //       return false;
    //     }
    //   }
    //   return true;
		// } else {
		// 	return Boolean(object);
		// }

    // {a: []} is not considered as empty!

    if (object && object.constructor === Object) {
      for (let key in object) {
        if (!this.isEmpty(object[key])) {
          return false;
        }
      }
      return true;
		} else {
			return object === undefined;
		}
  }

  // no more used
  static mask(delta, object) {
    if (delta.constructor === Object) {
      const mask = {};
      for (let key in delta) {
        if (object && object.constructor === Object && object[key] !== undefined) {
          mask[key] = this.mask(delta[key], object[key]);
        }
      }
      return mask;
		} else {
			return object;
		}
  }





  // static clean(object, ...path) {
  //   const cleanObject = this.filter(object, item => item === undefined || item === null, ...path);
  //   this.assign();
  // }
  //
  // static differ(object, original) {
	// 	if (object.constructor === Array) {
  //     return !(object.length === 1 && object[0] === original || original.constructor === Array && object.length === original.length && !object.some((item, index) => this.differ(item, original[index])));
	// 	} else if (typeof object === "object" && original) {
  //     return this.some(object, (item, ...path) => this.differ(item, this.get(original, ...path)));
	// 	} else {
	// 		return !(object === original || original.constructor === Array && original.length === 1 && object === original[0]);
	// 	}
	// }

  // static equalX(o1, o2) {
	// 	if (o1.constructor === Array) {
  //     return o1.length === 1 && o1[0] === o2 || o2.constructor === Array && o1.length === o2.length && o1.every((item, index) => this.equal(item, o2[index]));
	// 	} else if (typeof o1 === "object" && o2) {
  //     return this.every(o1, (item, ...path) => this.equal(item, this.get(o2, ...path)));
	// 	} else {
	// 		return o1 === o2 || o2.constructor === Array && o2.length === 1 && o1 === o2[0];
	// 	}
	// }


  getObject() {
    return this.object || {};
  }

  setObject(object) {
    this.object = object;
  }

  empty() { //
    // this.object = {};
    this.remove();
  }

  get(...path) {
    if (path.length) {
      return this.getObject();
    } else {
      return this.constructor.get(this.getObject(), ...path);
    }
  }

  set(value, ...path) {
    let object;
    if (path.length) {
      object = this.getObject();
      this.constructor.assign(object, value, ...path);
    } else {
      object = value;
    }
    this.setObject(object);
  }

  remove(...path) {
    // const object = this.getObject();
    // this.constructor.remove(object, ...path);
    // this.setObject(object);
    let object;
    if (path.length) {
      object = this.getObject();
      this.constructor.remove(object, ...path);
    } else {
      object = {};
    }
    this.setObject(object);
  }

  has(...path) {
    return this.constructor.has(this.getObject(), ...path);
  }

  // merge(value) {
  //   const object = this.getObject();
  //   this.constructor.merge(object, value);
  //   this.setObject(object);
  // }

  merge(value, ...path) {
    const object = this.get(...path) || {};
    this.constructor.merge(object, value);
    this.set(object, ...path);
  }

  // merge(value, ...path) {
  //   if (path.length) {
  //     const object = this.get(...path) || {};
  //     this.constructor.merge(object, value);
  //     this.set(object, ...path);
  //   } else {
  //     const object = this.getObject();
  //     this.constructor.merge(object, value);
  //     this.setObject(object);
  //   }
  // }



  some(callback, ...path) {
    return this.constructor.some(this.getObject(), callback, ...path);
  }

  // someAsync(callback, ...path) {
  //   return this.constructor.someAsync(this.getObject(), callback, ...path);
  // }

  forEach(callback, ...path) {
    this.constructor.forEach(this.getObject(), callback, ...path);
  }

  map(callback, ...path) {
    return this.constructor.map(this.getObject(), callback, ...path);
  }

  filter(callback, ...path) {
    return this.constructor.filter(this.getObject(), callback, ...path);
  }

  clone() {
    return this.constructor.clone(this.getObject());
  }

  equal(value, ...path) {
    return this.constructor.equal(this.get(...path), value);
  }

}
