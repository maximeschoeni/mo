KarmaFieldsAlpha.createField = function(resource) {
  let obj = KarmaFieldsAlpha.fields[resource && resource.type || "group"];
	let field;
	if (obj && obj.create) {
		field = obj.create(resource || {});
	} else {
		field = KarmaFieldsAlpha.Field(resource || {});
	}
	return field;
}

KarmaFieldsAlpha.FieldID = 1;

KarmaFieldsAlpha.Field = function(resource, parent, events) {



	let field = {
		parent: parent,
		directory: {},
		children: [],
		resource: resource || {},
		data: {},
		events: events || {},
		// events: resource || {},
		requests: {},
    loading: 0,

		fieldId: KarmaFieldsAlpha.FieldID++, // -> debug

		getId: function() {
			// let id = this.resource.key || this.resource.type || "group";
			// if (this.parent) {
			// 	id = this.parent.getId()+"-"+id
			// }
			// return id;
      return "karma-fields-"+this.fieldId;
		},

		// add: function(child) {
		// 	// let child = KarmaFieldsAlpha.Field();
		// 	if (child.resource.key) {
		// 		this.children.push(child);
		// 		this.directory[child.resource.key] = child;
		// 		child.parent = this;
		// 	} else {
		// 		console.log(child.resource);
		// 		console.error("No key!");
		// 	}
		// },
		addChild: function(child) {
			this.children.push(child);
			child.parent = this;
		},
    addChildren: function(children) {
			this.children = children;
      for (let i = 0; i < children.length; i++) {
        children[i].parent = this;
      }
		},
		createChild: function(resource) {
			let child = KarmaFieldsAlpha.createField(resource);
			this.addChild(child);
      return child;
		},

    // deprecated
		getResourceAttribute: function(attribute) {
			if (this.resource[attribute] !== undefined) {
				return this.resource[attribute];
			} else if (this.parent) {
				return this.parent.getResourceAttribute(attribute);
			}
		},

    // deprecated
    getAttribute: function(attribute) {
			if (this[attribute] !== undefined) {
				return this[attribute];
			} else if (this.parent) {
				return this.parent.getAttribute(attribute);
			}
		},

    // deprecated
		get: function(key) {
			return this.getDescendant(key);
		},

		getDescendant: function(key) {
			for (let i = 0; i < this.children.length; i++) {
				if (this.children[i].resource.key === key) {
					return this.children[i];
				} else if (!this.children[i].resource.key) {
					const child = this.children[i].getDescendant(key);
					if (child) {
						return child;
					}
				}
			}
		},

    // deprecated
		getByKeyPath: function(keys) {
			if (keys.length === 1) {
				return this.getDescendant(keys[0]);
			} else if (keys.length > 1) {
				keys.shift();
				return this.getByKeyPath(keys);
			}
		},

    // deprecated
		getByPath: function(path) {
			return this.getByKeyPath(path.split("/"));
		},

    // deprecated
		trigger: function(eventName, ...param) {
			if (this.events[eventName] && typeof this.events[eventName] === "function") {
				return this.events[eventName].call(this, ...param);
			} else if (this.parent) {
				return this.parent.trigger.call(this.parent, eventName, ...param);
			}
		},

		triggerEvent: function(eventName, bubbleUp, target, ...params) {
			if (this.events[eventName] && typeof this.events[eventName] === "function") {
				return this.events[eventName](target || this, ...params);
			} else if (bubbleUp && this.parent) {
				return this.parent.triggerEvent(eventName, true, target || this, ...params);
			}
		},


    fetch: function(targetField) {
      if (!targetField) {
        targetField = this;
      }
      let key = targetField.resource.option_key || targetField.resource.key;
      if (!key) {
        return Promise.reject("field has no key");
      } else if (this.resource.driver) {
        return KarmaFieldsAlpha.Form.fetch(this.resource.driver, "querykey", {
  				key: key,
          ...this.resource.args || {}
  			});
      } else if (this.parent) {
        return this.parent.fetch(targetField);
      } else {
        return Promise.reject("no parent and no driver found");
      }
    },
    // field.events.init = function(currentField) {
    //   if (currentField.resource.key) {
    //     KarmaFieldsAlpha.Form.get(field.resource.driver, field.resource.key+"/"+currentField.resource.key).then(function(results) {
    //       currentField.setValue(results, "set");
    //     });
    //   }
    // };


    // not tested yet!!
    init: function() {
      if (this.value === undefined) {
        return this.fetchKey(targetField);
      }
    },

    fetchKey: function(targetField, path) {
      if (!path) {
        path = [];
      }
      if (this.resource.key) {
        path.unshift(targetField.resource.key);
      }
      if (this.resource.driver && path.length) {
        // targetField.loading++;
        KarmaFieldsAlpha.Form.get(this.resource.driver, path.join("/")).then(function(results) {
          // targetField.loading--;
          targetField.setValue(results, "set");
        });
      } else if (this.parent) {
        return this.parent.fetchKey(targetField, path);
      }
    },

		// getModifiedValue: function() {
		// 	let value;
		// 	if (this.children.length) {
		// 		this.children.forEach(function(child) {
		// 			let childValue = child.getModifiedValue();
		// 			if (childValue !== undefined) {
		// 				if (!value) {
		// 					value = {};
		// 				}
		// 				if (child.resource.key) {
		// 					value[child.resource.key] = childValue;
		// 				} else {
		// 					Object.assign(value, childValue);
		// 				}
		// 				value[child.resource.key] = childValue;
		// 			}
		// 		});
		// 	} else {
		// 		if (this.value !== this.originalValue) {
		// 			return this.parse(this.value);
		// 		}
		// 	}
		// 	return value;
		// },
    getModifiedValue: function() {
      if (this.value !== this.originalValue) {
        return this.parse(this.value);
      }
		},
    updateOriginal: function() {
      this.originalValue = this.value;
		},
    isModified: function() {
      return this.originalValue === this.value;
    },

		getValue: function() {
      return this.parse(this.value);

			// let value;
			// if (this.children.length) {
			// 	value = {};
			// 	this.children.forEach(function(child) {
			// 		if (child.resource.key) {
			// 			value[child.resource.key] = child.getValue();
			// 		} else {
			// 			Object.assign(value, child.getValue());
			// 		}
			// 	});
			// } else {
			// 	value = this.parse(this.value);
			// }
			// return value;
		},
		hasValue: function() {
			// return this.children.length && this.children.some(function(child) {
			// 	return child.hasValue();
			// }) || this.value && true || false;
			// return false;

      return this.value !== undefined;
		},
		setValue: function(value, context) { // context = {'change' | 'set' | 'undo'}


			// if (!context) {
			// 	context = "change";
			// }
			// if (this.children.length) {
			// 	if (value && typeof value === "object") {
			// 		for (let key in value) {
			// 			const child = this.getDescendant(key);
			// 			if (child) {
			// 				child.setValue(value[key], context);
			// 			}
			// 		}
			// 	}
      //
			// } else {
      //
			// 	value = this.sanitize(value);
      //
			// 	this.isDifferent = this.value !== value;
      //
			// 	this.value = value;
      //
			// 	if (context === "set") {
			// 		this.originalValue = value;
			// 		this.history.save();
			// 		this.triggerEvent("render");
      //
			// 	}
			// 	if (context === "undo") {
			// 		// this.trigger("render");
			// 	}
			// 	if (context === "change" && value !== this.lastValue) {
			// 		this.triggerEvent("change", true);
			// 	}
      //
			// 	this.isModified = value !== this.originalValue;
			// 	this.lastValue = value;
			// 	this.triggerEvent("update");
      //
			// 	// }
			// }

      let response;

      if (value === undefined) {
        return;
      }

      if (!context) {
				context = "change";
			}

			value = this.sanitize(value);

			this.isDifferent = this.value !== value;
			this.value = value;

			if (context === "set") {
				this.originalValue = value;
				// this.history.save();
				this.triggerEvent("set", true); // -> will save history

			}
			if (context === "undo") {
				// this.trigger("render");
			}
			if (context === "change" && value !== this.lastValue) {
				response = this.triggerEvent("change", true);
			}

			this.isModified = value !== this.originalValue;
			this.lastValue = value;
			this.triggerEvent("update");

      return response;
		},
		getPath: function(fromField) {
			let keys = [];
			if (this.resource.key) {
				keys.push(this.resource.key);
			}
			if (this.parent && this.parent !== fromField) {
				keys.push(this.parent.getPath(fromField));
			}
			return keys.join("/");

			// let path = this.resource.key || "";
			// if (this.parent && this.parent !== fromField) {
			// 	path = this.parent.getPath()+"/"+path
			// }
			// return path;
		},
		getClosest: function(type) {
			if (this.resource.type === type) {
				return this;
			} else {
				return this.parent.getClosest(type);
			}
		},
		getRoot: function() {
			if (this.parent) {
				return this.parent.getRoot();
			} else {
				return this;
			}
		},
		sanitize: function(value) {

			let datatype = this.datatype || this.resource.datatype;

			switch (datatype) {
				case "object":
					if (!value || typeof value !== "object") {
						value = {};
					}
					break;

				case "array":
					if (!value) {
						value = [];
					} else if (!Array.isArray(value)) {
						// value = [JSON.parse(value)];
            value = [value];
					}
					break;

				case "number":
					if (!value || isNaN(value)) {
						value = 0;
					}
					break;

				case "boolean":
					// value = value && JSON.parse(value) === true || false;
          value = !!value;
					break;
			}

			if (typeof value !== "string") {
				value = JSON.stringify(value);
			}

			return value;
		},
		parse: function(value) {
			let datatype = this.datatype || this.resource.datatype;

			switch (datatype) {
				case "object":
					value = value && JSON.parse(value) || {};
					break;
				case "array":
					value = value && JSON.parse(value) || [];
					break;
				case "number":
					value = value && JSON.parse(value) || 0;
					break;
				case "boolean":
					value = value && JSON.parse(value) || false;
					break;
			}
			return value || "";
		},
    getDefault: function() {
      let value;
      switch (this.datatype || this.resource.datatype) {
        case "object":
					value = {};
					break;
				case "array":
					value = [];
					break;
				case "number":
					value = 0;
					break;
				case "boolean":
					value = false;
					break;
				default:
					value = "";
					break;
			}
      return value;
    },


		// build: function() {
		// 	let nodes = [];
		//
		// 	if (this.resource.label) {
		// 		nodes.push({
		// 			tag: "label",
		// 			init: function(label) {
		// 				this.element.htmlFor = field.getId();
		// 				this.element.textContent = field.resource.label;
		// 			}
		// 		});
		// 	}
		//
		// 	if (KarmaFieldsAlpha.fields[child.resource.type]) {
		// 		nodes = nodes.concat(builder(KarmaFieldsAlpha.fields[child.resource.type]));
		// 		nodes.push({
		// 			class: "karma-field-spinner"
		// 		});
		// 	}
		//
		// 	return nodes;
		//
		//
		// },

		build: function() {
			let obj = KarmaFieldsAlpha.fields[this.resource.type || "group"];
			if (typeof obj === "function") {
				return obj(this);
			} else {
				return obj.build(this);
			}
		},



		history: {
			undos: {},
			save: function() {
				let index = KarmaFieldsAlpha.History.getIndex(field);
				this.undos[index] = field.value;
			},
			go: function(index) {
				if (this.undos[index]) {
					field.setValue(this.undos[index], "undo");
				}
				field.children.forEach(function(child) {
					child.history.go(index);
				});
			},
			delete: function(index) {
				this.undos[index] = undefined;
				field.children.forEach(function(child) {
					child.history.delete(index);
				});
			}
		}
	}

	if (resource.value || resource.default) {
		field.setValue(resource.value || resource.default);
	}

	if (parent) {
		parent.children.push(field);
		// if (resource.key) {
		// 	parent.directory[resource.key] = field;
		// }
	}

	// if (resource.children) {
	// 	resource.children.forEach(function(childResource) {
	// 		KarmaFieldsAlpha.Field(childResource, field);
	// 	});
	// }

	if (resource.children) {
		for (let i = 0; i < resource.children.length; i++) {
			field.createChild(resource.children[i]);
		}
	}
	return field;
};
