
KarmaFieldsAlpha.fields.field = class Field {

  constructor(resource, parent, form) {
    this.parent = parent;
		this.children = [];
    this.childMap = {};
		this.resource = resource || {};
		// this.data = {}; // deprecated
    // this.delta = {}; // deprecated (moved to Form)
    // this.base = {}; // deprecated
		this.events = {}; // deprecated
    // this.loading = 0; // deprecated
    // this.history = {}; // deprecated
    // this.historyIndex = 0;
    // this.datatype = "string";  // deprecated
		this.fieldId = Field.fieldId++;

    // if (this.resource.value !== undefined) {
    //   this.setValue(this.resource.value);
    // }

    if (this.resource.script) {
      this.scriptFunction = new this.constructor.AsyncFunction("field", "node", this.resource.script);
    }

    this.initField();

    if (this.resource.children) {
  		for (let i = 0; i < this.resource.children.length; i++) {
  			this.createChild(this.resource.children[i]);
  		}
  	}

  }

  static getFieldClass(resource) {
    console.warn("Deprecated function getFieldClass. Use create");
    return new KarmaFieldsAlpha.fields[resource && resource.type || "group"];
  }

  static create(resource, parent, form) {
    return new KarmaFieldsAlpha.fields[resource && resource.type || "group"](resource, parent, form);
  }

  initField() {
	}

  getId() {
    return "karma-fields-"+this.fieldId;
  }

  // // used in array
  // getIndex() {
  //   return this.parent && this.parent.children.findIndex(field => field === this);
  // }
  //
  // // used in array
  // nextSibling() {
  //   return this.parent && this.parent.children[this.getIndex()+1];
  // }

  addChild(child) {
    this.children.push(child);
    if (child.resource.key) {
      this.childMap[child.resource.key] = child;
    }
    child.parent = this;
    // child.initField();  // -> ! rowField utilise initField pour ajouter un champs trash
  }

  addChildren(children) {
    children.forEach(child => {
      this.addChild(child);
    });
    // this.children = children;
    // for (let i = 0; i < children.length; i++) {
    //   children[i].parent = this;
    // }
  }

  createField(resource, parent) {
    console.warn("Deprecated function createField. Use createChild");
    return Field.create(resource, parent, this.form);
  }

  createChild(resource) {
    const child = Field.create(resource, this, this.form);
    this.addChild(child);
    return child;
  }




  // find(path) {
  //   if (this.resource.key === path) {
  //     return this;
  //   }
	// }

  getType() {
    // string
  }

  updateChildren() {
    // noop
  }

  getForm() {
    return this.parent && this.parent.getForm();
  }


  // -> for dropdown in filters
  // getSiblingValue(keys) {
  //   return this.parent && this.parent.getValue(keys);
  // }

  // getRelatedValue(key) {
  //   console.error("Deprecated function getRelatedValue");
  //   let descendant = this.getDescendant(key);
  //   if (descendant) {
  //     return descendant.fetchValue();
  //   } else if (this.parent) {
  //     return this.parent.getRelatedValue(key);
  //   }
  // }

  // getDescendant(key) {
  //   for (let i = 0; i < this.children.length; i++) {
  //     if (this.children[i].resource.key === key) {
  //       return this.children[i];
  //     } else if (!this.children[i].resource.key) {
  //       const descendant = this.children[i].getDescendant(key);
  //       if (descendant) {
  //         return descendant;
  //       }
  //     }
  //   }
  // }

  getDescendants() {
    const gen = function * (field) {
      if (field.children.length) {
        for (let child of field.children) {
          yield * gen(child);
        }
      } else if (field.resource.key) {
        yield field;
      }
    }
    return gen(this);
  }

  getDescendantKeys() {
    const gen = function * (field) {
      if (field.children.length) {
        for (let child of field.children) {
          yield * gen(child);
        }
      } else if (field.resource.key) {
        yield field.resource.key;
      }
    }
    return gen(this);
  }

  // getSibling(key) {
  //   return this.parent && this.getChild(key);
  // }

  // getFieldsByPath(keys) {
	// 	let key = keys.shift();
	// 	let fields = this.getDescendants(key);
	// 	if (keys.length > 0) {
	// 		fields = fields.reduce((acc, field) => {
  //       acc = acc.concat(field.getFieldsByPath(keys));
  //       return acc;
  //     }, []);
	// 	}
	// 	return fields;
	// }

  // //deprecated: use getChild
  // getDirectChild(key) {
  //   console.warn("Deprecated function getDirectChild. Use getChild");
  //   return this.getChild(key);
  // }

  find(key, ...path) {
		const child = key && this.getChild(key);
		return path.length && child && child.find(...path) || child;
	}

  getChild(key) {
    if (this.childMap[key]) {
      return this.childMap[key];
    }
    // for (let i = 0; i < this.children.length; i++) {
    //   if (this.children[i].resource.key === key) {
    //     return this.children[i];
    //   }
    // }
  }

  getClosest() {
    if (this.resource.key || !this.parent) {
      return this;
    } else {
      return this.parent.getClosest();
    }
  }

  getSibling(key) {
    return this.parent && this.parent.getClosest().find(key);
  }

  getPath() {
    let keys = this.parent && this.parent.getPath() || [];
    if (this.resource.key) {
      keys.push(this.resource.key);
    }
    return keys;
  }

  // join(path, key) {
  //   return (path && key && path+"/"+key) || path || key || "";
  // }

  join(...keys) {
    return keys.reduce((path, key) => path && key && path+"/"+key || path || key || "", "");
  }

  createPath(path) {
    return this.join(this.resource.key, path);
  }


  getKeyPath(keys = []) {
    console.warn("Deprecated getKeyPath");
    // if (!keys) {
    //   keys = [];
    // } else if (!Array.isArray(keys)) {
    //   keys = [keys];
    // }
    if (this.resource.key) {
      keys.unshift(this.resource.key);
    }
    return keys;
  }

  createPath(path) {
    // if (!keys) {
    //   keys = [];
    // } else if (!Array.isArray(keys)) {
    //   keys = [keys];
    // }

    if (this.resource.key) {
      if (path) {
        path = "/" + path;
      }
      path = this.resource.key + path;
    }
    return path;
  }

  // getKeyPath(keys) {
  //   return [this.resource.key||[], ...keys||[]];
  // }


  // triggerEvent(eventName, bubbleUp, target, ...params) {
  //   console.warn("Deprecated function triggerEvent");
  //
  //   if (this.events[eventName] && typeof this.events[eventName] === "function") {
  //     return this.events[eventName].call(this, target || this, ...params);
  //   } else if (bubbleUp && this.parent) {
  //     return this.parent.triggerEvent(eventName, true, target || this, ...params);
  //   }
  // }

  contains(field) {
    return field && (field.parent === this || this.contains(field.parent));
  }

  triggerUp(eventName, ...params) {
    if (this.parent) {
      return this.parent.bubble(eventName, ...params);
    }
  }

  bubble(eventName, ...params) {
    if (this.events[eventName] && typeof this.events[eventName] === "function") {
      return this.events[eventName].call(this, ...params);
    }
    return this.triggerUp(eventName, ...params);
    // else if (this.parent) {
    //   return this.parent.bubble(eventName, ...params);
    // }
  }

  // triggerDown(eventName, ...params) {
  //   console.error("Deprecated function triggerDown");
  //
  // }


  try(eventName, ...params) {
    if (this[eventName] && typeof this[eventName] === "function") {
      // console.error("Deprecated function try");
      return this[eventName](...params);
    }
  }

  bubbleUp(callback, ...params) {
    if (this[callback]) {
      return this[callback](...params);
    } else {
      return this.parent && this.parent.bubbleUp(callback, ...params);
    }
  }


  // // not used
  // updateDependency() {
  //   console.error("Deprecated function updateDependency");
  // }

  // async getModifiedValue() {
  //   // const path = this.getPath();
  //   // const rawValue = this.read();
  //   // if (rawValue !== undefined && rawValue !== this.originalValue) {
  //   //   return this.parse(rawValue);
  //   // }
  //
  //   debugger;
  //
  //   const deltaValue = this.getDeltaValue();
  //   if (deltaValue !== undefined) {
  //     const baseValue = await this.getRawBaseValue();
  //     if (deltaValue !== baseValue) {
  //       return this.parse(deltaValue);
  //     }
  //   }
  // }

  // getModifiedValue() {
  //   return this.parent && this.parent.getModifiedValue();
  // }
  // hasModifiedValue() {
  //   return this.parent && this.parent.hasModifiedValue();
  // }
  //
  // // maybe deprecated -> use setValue
  // updateOriginal() {
  //   console.error("Deprecated function updateOriginal");
  // }




  // getValue() {
  //   // console.warn("Deprecated function getValue");
  //   let value;
  //   let rawValue = this.read();
  //   if (rawValue === undefined) {
  //     rawValue = this.originalValue;
  //   }
  //   if (rawValue === undefined) {
  //     value = this.getDefault();
  //   } else {
  //     value = this.parse(rawValue);
  //   }
  //
  //   return value;
  // }



  // clearValue() {
  //   console.warn("Deprecated function clearValue");
  // }
  //
  // // depreacated
  // hasValue() {
  //   console.warn("Deprecated function hasValue");
  //   return this.read(this.getPath()) !== undefined;
  // }
  //
  // readPath(path) {
  //   console.error("Deprecated function readPath");
  //   if (this.parent) {
  //     return this.parent.readPath(path);
  //   }
  // };
  //
  // read() {
  //   console.error("Deprecated function read");
  //   const path = this.getPath();
  //   return this.readPath(path);
  // };
  //
  // writePath(path, rawValue) {
  //   console.error("Deprecated function writePath");
  //   if (this.parent) {
  //     return this.parent.writePath(path, rawValue);
  //   }
  // };
  //
  // write(rawValue) {
  //   console.error("Deprecated function write");
  //   const path = this.getPath();
  //   this.parent.writePath(path, rawValue);
  // };
  //
  // async getFromPath(path) {
  //   console.error("Deprecated function getFromPath");
  //
  //   const value = await KarmaFieldsAlpha.Form.get(this.resource.driver || "nodriver", path);
  //
  //
  //   if (this.parent) {
  //     return this.parent.getFromPath(path);
  //   }
  // };
  //
  // get() {
  //   console.error("Deprecated function get");
  //   const path = this.getPath();
  //   return path.length && this.parent && this.parent.getFromPath(path) || Promise.resolve();
  // };
  //
  // initValue(value, updateField) {
  //   console.error("Deprecated initValue");
  //
  //   if (value !== undefined) {
  //     value = this.convert(value);
  //
  //     // this.setDeltaValue(value);
  //     this.setOriginal(value);
  //
  //     this.modified = false;
  //
  //     if (updateField) {
  //       this.try("onModified", false);
  //       this.try("onSet", value);
  //     }
  //   }
  // }

  // async getDefault() {
  //   if (this.resource.default !== undefined) {
  //     return this.resource.default;
  //   }
  //   return this.getEmpty();
  // }

  async fill(value) {
    console.error("Deprecated");
    if (value === undefined) {
      value = await this.getDefault();
    }
    if (value !== undefined) {
      return this.setValue(value);
    }
  }


  // called when a row is first created
  async setDefault() {
    console.error("deprecated setDefault");
    await Promise.all(this.children.map(child => child.setDefault()));
  }

  initValue(value, ...path) {
    console.error("deprecated initValue");
    if (this.resource.key) {
      path = [this.resource.key, ...path];
    }
    if (path.length && this.parent) {
      return this.parent.initValue(value, ...path);
    }
  }

  getDefault() {
    return this.resource.default || "";
    // const object = {};
    // for (let child of this.children) {
    //   const childDefault = await child.getDefault();
    //   if (child.resource.key) {
    //     object[child.resource.key] = childDefault;
    //   } else {
    //     Object.assign(childDefault);
    //   }
    // }
    // return object;
  }


  //
  // async validate(value) {
  //   return value;
  // }

  // async load(promise) {
  //   console.error("Deprecated load");
  //
  //   this.try("onLoad", true);
  //   const result = await promise;
  //   this.try("onLoad", false);
  //   return result;
  // }
  //
  // updateChangeValue(value) {
  //   console.error("Deprecated function updateChangeValue");
  // }
  //
  // setValueAsync(value, updateSelf, noBubble) {
  //   console.warn("Deprecated function setValueAsync.");
  //
  //   if (updateSelf) {
  //     this.updateValue(value);
  //   } else {
  //     this.changeValue(value, noBubble);
  //   }
  //
  // }
  //
  // saveValue(value, updateSelf, noBubble) {
  //   console.warn("Deprecated function saveValue.");
  //
  //   if (updateSelf || noBubble) {
  //     console.error("Deprecated function saveValue.");
  //   }
  //
  //   this.changeValue(value);
  //
  // }




  // async changeValue(value) {
  //   console.error("Deprecated changeValue");
  //   // no validation
  //   this.setValue(value);
  //   // const originalValue = this.getOriginal();
  //
  //   // this.modified = value !== originalValue;
  //   this.modified = this.isModified();
  //
  //   // this.try("onModified", value === originalValue);
  //   // await this.load(this.bubble("change", this, value));
  //   await this.bubble("change", this, value);
  // }



  // async updateValue(value) {
  //   console.error("Deprecated updateValue");
  //   // value = await this.load(this.validate(value));
  //   // value = await this.validate(value);
  //
  //   this.setValue(value);
  //   // const originalValue = this.getOriginal();
  //   //
  //   // this.modified = value === originalValue;
  //
  //   this.modified = this.isModified();
  //
  //   // this.try("onSet", value);
  //   // this.try("onModified", value === originalValue);
  // }


  // async getValueAsync() {
  //   console.error("Deprecated getValueAsync");
  //   return this.getDeltaValue() ?? this.getOriginal() ?? this.fetchValue() ?? this.getDefault();
  // }
  //
  //
  //
  // getOriginal() {
  //   console.error("Deprecated getOriginal");
  //
  //   return this.getFormOriginal();
  // }
  //
  //
  // setOriginal(value) {
  //   console.error("Deprecated setOriginal");
  //   this.setFormOriginal(value);
  // }

  // recursiveGetOriginal(keys) {
  //   keys = this.getKeyPath(keys, true);
  //   return this.parent && this.parent.recursiveGetOriginal(keys);
  // }

  // getFormOriginal(keys) {
  //   console.error("Deprecated getFormOriginal");
  //   keys = this.getKeyPath(keys, true);
  //   return this.parent && this.parent.getFormOriginal(keys);
  // }
  //
  // setFormOriginal(value, keys) {
  //   console.error("Deprecated setFormOriginal");
  //   keys = this.getKeyPath(keys);
  //   this.parent && this.parent.setFormOriginal(value, keys);
  // }
  //
  //
  //
  // async downloadValue() {
  //   console.error("DEprecated downloadValue");
  //   return this.getRemoteValue()
  // }


  // recursiveGetRemote(keys) {
  //   keys = this.getKeyPath(keys, true);
  //   return this.parent && this.parent.recursiveGetRemote(keys);
  // }
  // getRemote() {
  //   return this.recursiveGetRemote();
  // }

  // getRemoteValue(keys, driver) {
  //   console.error("DEprecated getRemoteValue");
  //   keys = this.getKeyPath(keys, true);
  //   return this.parent && this.parent.getRemoteValue(keys, driver);
  // }
  //
  // getRawValue() {
  //   console.error("Deprecated function getRawValue");
  // }
  //
  // async update() {
  //   console.error("Deprecated function update");
  //   let value = await this.getValue() ?? this.resource.value ?? await this.getDefault();
  //
  //   // let originalValue = this.getFormOriginal() ?? await this.downloadValue();
  //   //
  //   // let deltaValue = this.getDeltaValue();
  //   //
  //   // let value = deltaValue ?? originalValue ?? this.resource.value ?? await this.getDefault();
  //
  //   // if (value === undefined) {
  //   //   value = await this.getDefault();
  //   // } else {
  //   //   value = await this.validate(value);
  //   // }
  //
  //   // not all field need to autoset value (like readonly)
  //   // if (value !== originalValue) {
  //   //   this.setDeltaValue(value);
  //   //   // await this.edit();
  //   // }
  //
  //   // this.modified = value !== originalValue;
  //
  //   this.modified = this.isModified();
  //
  //   return value;
  // }


  isModified(...path) {
    // keys = this.getKeyPath(keys, true);
    if (this.resource.key) {
      path = [this.resource.key, ...path];
    }

    return this.parent && this.parent.isModified(...path);
  }

  fetchValue(expectedType, ...path) {
    // keys = this.getKeyPath(keys, true);
    if (this.resource.key) {
      path = [this.resource.key, ...path];
    }
    if (path.length && this.parent) {
      return this.parent.fetchValue(expectedType, ...path);
    }
  }

  async editValue(value) {
    await this.setValue(value);
    return this.edit();
  }

  getValue(...path) {
    // keys = this.getKeyPath(keys);
    if (this.resource.key) {
      path = [this.resource.key, ...path];
    }
    if (path.length && this.parent) {
      return this.parent.getValue(...path);
    }
  }

  // maybe async
  setValue(value, ...path) {
    // keys = this.getKeyPath(keys);
    if (this.resource.key) {
      path = [this.resource.key, ...path];
    }
    if (path.length && this.parent) {
      return this.parent.setValue(value, ...path);
    }
  }

  removeValue(...path) {
    // keys = this.getKeyPath(keys);
    if (this.resource.key) {
      path = [this.resource.key, ...path];
    }
    if (path.length && this.parent) {
      this.parent.removeValue(...path);
    }
  }

  /**
   * Write history current step. Used for every cell of a row before deleting row
   */
  write(...path) {
    // keys = this.getKeyPath(keys);
    if (this.resource.key) {
      path = [this.resource.key, ...path];
    }
    if (path.length && this.parent) {
      return this.parent.write(...path);
    }
  }


  /**
   * Like setValue() But without writing history
   */
  setDeltaValue(value, ...path) {
    if (this.resource.key) {
      path = [this.resource.key, ...path];
    }
    if (this.parent) {
      return this.parent.setDeltaValue(value, ...path);
    }
  }




  registerType(type, ...path) {
    // keys = this.getKeyPath(keys, true);
    if (this.resource.key) {
      path = [this.resource.key, ...path];
    }
    if (this.parent) {
      this.parent.registerType(type, ...path);
    }
  }

  registerValue(value, ...path) {
    // keys = this.getKeyPath(keys, true);
    if (this.resource.key) {
      path = [this.resource.key, ...path];
    }
    if (this.parent) {
      this.parent.registerValue(value, ...path);
    }
  }

  // editArray(array, keys) {
  //   this.setValue(array, keys);
  //   return this.edit();
  // }

  // = getDeltaArray
  // getArray(keys) {
  //   // return this.fetchArray(keys);
  //   // keys = this.getKeyPath(keys);
  //   // return this.parent && this.parent.getArray(keys, driver);
  //
  //   let value = this.getDeltaValue(keys);
  //   return value && JSON.parse(value) || [];
  // }

  // setArray(array, keys) {
  //   // keys = this.getKeyPath(keys);
  //   // return this.parent && this.parent.setArray(array, keys);
  //
  //   array = JSON.stringify(array);
  //   return this.setDeltaValue(array, keys);
  //   // return this.editArray(array, keys);
  //
  // }

  // removeArray(keys) {
  //   // keys = this.getKeyPath(keys);
  //   // return this.parent && this.parent.removeArray(array, keys);
  //
  //   this.removeDeltaValue(keys);
  // }


  // // experimental
  // getDeltaValue2() {
  //   const value = this.parent && this.parent.getDeltaValue2();
  //   if (value && this.resource.key) {
  //     return value[this.resource.key];
  //   }
  //   return value;
  // }
  // // experimental
  // setDeltaValue2(value) {
  //   const wrap = this.parent && this.parent.getDeltaValue2();
  //   if (this.resource.key) {
  //     value = {[this.resource.key]: value};
  //   }
  //   if (wrap) {
  //     Object.assign(wrap, value);
  //   } else {
  //     this.parent.setDeltaValue2(value);
  //   }
  // }




  // getClosest(type) {
  //   console.error("Deprecated function getClosest");
  //
  // }
  //
  // findAncestor(callback) {
  //   console.error("Deprecated function findAncestor");
  //
  // }
  //
  // getRoot() {
  //   console.error("Deprecated function getRoot");
  //
  // }
  //
  // // not used !!
  // fill() {
  //   console.error("Deprecated function fill");
  //   // this.initValue(this.getDefault());
  // }
  //
  // convert(value) {
  //   return value;
  // }
  //
  // stringify(value) {
  //   console.error("Deprecated function stringify");
  //   return value;
  // }
  //
  // parse(value) {
  //   console.error("Deprecated function parse");
  //   return value;
  // }

  getEmpty() {
    return "";
  }

  // convertTo(value, type) {
  //   console.error("Deprecated function findAncestor");
  //
  //   // return this.convert(value, this.resource.datatype || this.datatype, type);
  // }
  //
  // prepare(value) {
  //   if (Array.isArray(value)) {
  //     return value.shift();
  //   }
  //   return value;
  // }
  //
  // sanitize(value, context) {
  //   console.error("Deprecated function sanitize. Use validate");
  // }

  // ??
  build() {
    let field = this;
    if (this.render) {
      return {
        render: function() {
          field.render(this.element, field);
        }
      }
    } else {

      console.log(this);
    }
  }

  render() {
    // noop
  }

  // history API
  saveHistory() {
    this.backup();
  }
  backup(...path) {
    // keys = this.getKeyPath(keys);
    if (this.resource.key) {
      path = [this.resource.key, ...path];
    }
    if (this.parent) {
      return this.parent.backup(...path);
    }
  }



  // query API
  // queryOptions(driver, params) {
  //   console.error("Deprecated function queryOptions. Use ??");
  //   return KarmaFieldsAlpha.Form.fetch(driver, "querykey", params);
  // }
  //
  // queryKey(driver, path) {
  //   console.error("Deprecated function queryOptions. Use ??");
  //   return KarmaFieldsAlpha.Form.get(driver, path);
  // }


  init(element) {
    console.warn("deprecated Field::init");
    // this.triggerEvent("init", 1, this, element);
    this.bubble("init", this, element);
  }


  // option API
  // hasOptions() {
  //   console.warn("Deprecated function hasOptions.");
  //   return this.data.options !== undefined;
  // }
  // getOptions() {
  //   console.warn("Deprecated function getOptions.");
  //   return this.data.options || [];
  // }
  // setOptions(options) {
  //   console.warn("Deprecated function setOptions.");
  //   this.data.options = options;
  //   this.triggerEvent("options");
  // }

  getRemoteOptions(queryString, driver) {
    console.error("Deprecated getRemoteOptions");
    return this.parent && this.parent.getRemoteOptions(queryString, driver) || [];

    // this.promiseOptions = KarmaFieldsAlpha.Form.fetch2(driver, queryString).then(function(results) {
    //   field.setOptions(results.items || results || []);
    //   field.endLoad();
    //   field.try("onOptions", field.getOptions(), queryString);
    //   return field.getOptions();
    // });
  }


  // getDriver() {
  //   console.error("Deprecated function getDriver.");
  //   // return this.parent && this.parent.getDriver();
  // }


  // !! this method is specifique for dropdown
  async fetchOptions(driver) {
    // const field = this;
    // const queryString = this.getOptionsParamString();
    // return this.fetch(queryString).then(function(options) {
    //   return options.items || options || [];
    //   //return field.prepareOptions(options.items || options || []);
    // });

    if (this.resource.options) {
      return this.resource.options;
    }

    if (!driver) {
      driver = this.getDriver();
    }

    let queryString = await this.getOptionsParamString();

    if (!driver) {
      // return [{key: "", name:"error: no driver"}];
      console.error("error: no driver");
    }

    // if (!queryString) {
    //   return [{key: "", name:"error: no queryString"}];
    // }
    if (queryString) {
      queryString = "?"+queryString
    }

    const options = await KarmaFieldsAlpha.Gateway.getOptions(driver+queryString);

    return options.items || options || [];
  }

  getDriver() {
    return this.resource.driver || this.parent && this.parent.getDriver();
  }


  prepareOptions(options) {
    return options;
  }

  // async getOptionsParams(params) {
  //   if (!params) {
  //     params = {key: this.resource.key};
  //   }
  //   if (this.resource.params) {
  //     Object.assign(params, this.resource.params);
  //   }
  //
  //
  //   if (this.resource.args) {
  //     console.warn("deprecated args property");
  //     Object.assign(params, this.resource.args);
  //   }
  //
  //   // Object.assign(params, this.triggerUp("optionparams", this, this.resource.optionparamlist));
  //   const dependencies = this.resource.optionparamlist || this.resource.dependencies;
  //   if (dependencies) {
  //     Promise.all(dependencies.map(key => this.getRelatedValue(key))).reduce((acc, value, index) => {
  //       acc[key] = ;
  //       return acc;
  //     }, params);
  //   }
  //
  //
  //   return params;
  // }

  async getOptionsParamString(args) {

    if (this.resource.options) {

      return "resource";

    } else {

      const params = new URLSearchParams({...args, ...this.resource.params});

      // if (this.resource.key) {
      //   params.set("key", this.resource.key);
      // }

      const dependencies = this.resource.optionparamlist || this.resource.dependencies;
      if (dependencies) {
        dependencies.forEach(key => {
          const value = this.parent && this.parent.getValue(null, key);
          // const value = KarmaFieldsAlpha.History.getParam(key);
          if (value) {
            params.set(key, value);
          }
        });
      }

      if (this.resource.dependency) {
        const value = this.parent && await this.parent.fetchValue(null, this.resource.dependency);
        if (value) {
          params.set(this.resource.dependency, value);
        }
      }

      if (this.resource.filters) {
        // if (typeof this.resource.filters === "string") {
        //
        // }
        this.resource.filters.forEach(filter => {
          if (KarmaFieldsAlpha.Nav.hasParam(filter)) {
            params.set(filter, KarmaFieldsAlpha.Nav.getParam(filter));
          }
        });
      }

      return params.toString();
    }
    // console.warn("Deprecated function fetchOptions.");
    // params = await this.getOptionsParams(params);
    // let queryString = KarmaFieldsAlpha.Form.encodeParams(params);
    // const driver = this.getDriver();
    // if (driver && queryString) {
    //   return driver+"/deprecated"+queryString;
    // }
    // return KarmaFieldsAlpha.Form.encodeParams(params);
  }

  // clearOptions() {
  //   console.error("Deprecated function clearOptions.");
  //   // this.promiseOptions = undefined;
  //
  // }

  // async
  addRemoteItem(num, driver) {
    return this.parent && this.parent.addRemoteItem(num, driver) || [];
  }

  //
  // // loading API
  // startLoad() {
  //   console.error("Deprecated function startLoad.");
  //
	// 	this.loading++;
	// 	// this.triggerEvent("load", true, this, this.loading > 0);
  //   this.try("onLoad", this.loading > 0);
	// }
  //
	// endLoad() {
  //   console.error("Deprecated function endLoad.");
  //
	// 	this.loading--;
	// 	// this.triggerEvent("load", true, this, this.loading > 0);
  //   this.try("onLoad", this.loading > 0);
	// }

  // import/export API
  async exportValue() {
    // const path = this.getPath();
    // let value = this.read(path);
    // value = this.parse(value || "");
    // return Promise.resolve(value);

    return this.fetchValue();
  }

  async importValue(value) {
    // this.setValue(value, context);
    // return this.saveValue(value, true, true);
    return this.setValue(value);
  }



  // changeState(state) {
	// 	this.try("onState", state);
	// }

  // updateState(state) {
	// 	// this.try("onState", this.getState());
  //   this.try("onState", state);
	// }

  // reset() {
  //   console.error("Deprecated function reset.");
	// 	this.originalValue = undefined;
	// }

  getState() {
    return this.parent && this.parent.getState() || this.state || "";
  }

  edit(hard) {
    return this.parent && this.parent.edit(hard);
  }

  // ??
  editFull() {
    console.warn("deprecated editFull");
    return this.parent && this.parent.editFull();
  }

  submit() {
    return this.parent && this.parent.submit();
  }


  getDelta() {
    console.error("Deprecated getDelta");
    return this.delta || this.parent && this.parent.getDelta();
  }






  // getParam(key) {
  //   return this.getParamsObject().get(key);
  // }
  //
  // setParam(key, value) {
  //   const params = this.getParamsObject();
  //
  //   if (value && params.get(key) !== value || !value && params.has(key)) {
  //   // if (params.get(key) != value) {
  //     if (value) {
  //       params.set(key, value);
  //     } else {
  //       params.delete(key);
  //     }
  //     params.sort();
  //     this.setParamString(params.toString());
  //   }
  //
  //
  //   // const params = this.getParamsObject();
  //   // let paramString = params.toString();
  //   // params.set(key, value);
  //   // params.sort();
  //   // if (params.toString() !== paramString) {
  //   //   this.setParamString(params.toString(), replace);
  //   //   this.editParam();
  //   // }
  //   // this.setParams({[key]: value}, replace);
  // }
  //
  // removeParam(key) {
  //   const params = this.getParamsObject();
  //   if (params.has(key)) {
  //     params.delete(key);
  //     this.setParamString(params.toString());
  //   }
  // }
  //
  // setParams(params) {
  //   const paramsObject = this.getParamsObject();
  //   let paramString = paramsObject.toString();
  //   for (let key in params) {
  //     const value = params[key];
  //     if (value) {
  //       paramsObject.set(key, value);
  //     } else {
  //       paramsObject.delete(key);
  //     }
  //     // paramsObject.set(key, params[key]);
  //   }
  //   paramsObject.sort();
  //   if (paramsObject.toString() !== paramString) {
  //     this.setParamString(paramsObject.toString());
  //     // await this.editParam();
  //   }
  // }
  //
  // editParam(clean) {
  //   return this.parent && this.parent.editParam(clean);
  // }
  //
  // getParamsObject() {
  //   return new URLSearchParams(this.getParamString());
  // }
  //
  // getParamString() {
  //   return location.hash.slice(1);
  // }
  //
  // setParamString(paramString) {
  //   history.replaceState(null, null, "#"+paramString);
  //
  //   // if (replace) {
  //   //   history.replaceState(null, null, "#"+paramString);
  //   // } else {
  //   //   history.pushState(null, null, "#"+paramString);
  //   // }
  // }


  editParam(clean) {
    return this.parent && this.parent.editParam(clean);
  }



  //
  //
  // getParam(key) {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.getParam(key);
  // }
  //
  // setParam(key, value) {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.setParam(key, value);
  // }
  //
  // removeParam(key) {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.removeParam(key);
  // }
  //
  // setParams(params) {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.setParams(params);
  // }
  //
  // getParamsObject() {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.getParamsObject();
  // }
  //
  // getParamString() {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.getParamString();
  // }
  //
  // setParamString(paramString) {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.setParamString(paramString);
  // }
  //


  // request(callback, path = "", ...args) {
  //
  //   path = this.createPath(path);
  //
  //   if (this[callback]) {
  //     return this[callback](path, ...args);
  //   } else if (this.parent) {
  //     return this.parent.request(callback, path, ...args);
  //   }
  // }



  // getOriginalValue(path) {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.getOriginalValue(path);
  // }
  //
  // removeOriginalValue(path) {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.removeOriginalValue(path);
  // }
  //
  // setOriginalValue(value, path) {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.setOriginalValue(value, path);
  // }
  //
  // getDeltaValue(path) {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.getDeltaValue(path);
  // }
  //
  // setDeltaValue(value, path) {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.setDeltaValue(value, path);
  // }
  //
  // removeDeltaValue(path) {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.removeDeltaValue(path);
  // }
  //
  // getDelta() {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.getDelta();
  // }
  //
  // emptyDelta() {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.emptyDelta();
  // }
  //
  // hasDelta() {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.hasDelta();
  // }
  //
  // writeHistory(path, value) {
  //   console.error("DEPRECATED");
  //   return KarmaFieldsAlpha.History.writeHistory(path, value);
  // }


  async match(condition) {
		// const value = await this.getRelatedValue(condition.key);

		const val = await this.parent.fetchValue(null, condition.key);
		switch (condition.comparison) {
			case "<": return val < condition.value;
			case ">": return val > condition.value;
			case "<=": return val <= condition.value;
			case ">=": return val >= condition.value;
			case "!=": return val != condition.value;
			case "!==": return val !== condition.value;
			case "==": return val == condition.value;
			case "includes": return val.includes(condition.value);
			case "startsWith": return val.startsWith(condition.value);
			case "endsWidth": return val.endsWidth(condition.value);
			case "!": return !val;
      case "!!": return !!val;
			case "between": return val >= condition.value && val <= condition.value2;
			// case "null": return val === null || var === undefined;
			// case "notNull": return val === null || var === undefined;
			default: return val === condition.value;
		}
	}

  format(value, type) {
    if (type === "array") {
			if (typeof value === "object") {
				if (!Array.isArray(value)) {
					value = Object.values(value);
				}
			} else if (typeof value === "string") {
        // console.warn("Wrong type: converting string to array", type, value);
				value = [value];
			} else {
				value = [];
			}
		} else {
			if (Array.isArray(value)) {
        // console.warn("Wrong type: converting array to string", type, value);
				value = value[0];
			}
		}
    return value;
  }



};

KarmaFieldsAlpha.fields.field.fieldId = 1;

KarmaFieldsAlpha.fields.field.AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
