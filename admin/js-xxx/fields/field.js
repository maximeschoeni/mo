
KarmaFieldsAlpha.field = class {

  static fieldId = 0;
  static uniqueId = 1;

  constructor(resource = {}) {
		this.children = [];
    this.childMap = {};
		this.resource = resource || {};

		this.fieldId = KarmaFieldsAlpha.field.fieldId++;

    this.expressionCache = new KarmaFieldsAlpha.Buffer("expressions");

  }


  // static create(resource, parent) {
  //   return new KarmaFieldsAlpha.field[resource && resource.type || "group"](resource, parent);
  // }

  getKey() {
    return this.resource.key;
  }

  getLabel() {
    return this.resource.label;
  }

  getId() {
    return "karma-fields-"+this.fieldId;
  }

  getUniqueId() {
    return KarmaFieldsAlpha.field.uniqueId++;
  }

  addChild(child, id) {
    this.children.push(child);

    this.childMap[id || child.resource.id || child.resource.type] = child;

    child.parent = this;
  }

  createField(resource) {

    if (typeof resource === "string") {

      resource = {
        type: resource
      };

    }

    const constructor = this.constructor;

    const type = resource.type || "group";

    // if (KarmaFieldsAlpha.field[type]) {
    //   return new KarmaFieldsAlpha.field[type](resource);
    // }


    if (this.constructor[type] && typeof this.constructor[type] === "function") {
      return new this.constructor[type](resource);
    }

    if (this.constructor[type] && typeof this.constructor[type] === "object" && this.constructor[type].type !== type) {
      return this.createField({...this.constructor[type], ...resource, type: this.constructor[type].type});
    }

    if (this.parent) {
      return this.parent.createField(resource);
    }



    console.error("Field type does not exist", resource);

  }

  // createChild(resource, id) {
  //
  //   let child = this.childMap[id || resource.id || resource.type || resource];
  //
  //   if (!child) {
  //
  //     child = this.createField(resource);
  //
  //     this.children.push(child);
  //     this.childMap[id || resource.id || resource.type] = child;
  //     child.parent = this;
  //
  //
  //   }
  //
  //   return child;
  // }

  createChild(resource, id) {

    // let child = this.childMap[id || resource.id || resource.type || resource];
    //
    // if (!child) {

  
      const child = this.createField(resource);

      // this.children.push(child);
      // this.childMap[id || resource.id || resource.type] = child;
      child.parent = this;


    // }

    return child;
  }

  //
  // getDescendants() {
  //   const gen = function * (field) {
  //     for (let child of field.children) {
  //       if (child.resource.key !==  undefined) {
  //         yield child;
  //       } else {
  //         yield * gen(child);
  //       }
  //     }
  //   }
  //   return gen(this) || [];
  // }
  //
  // getResourceKeys(resource) {
  //   if (resource.key !== undefined) {
  //     return [resource.key];
  //   } else if (resource.children) {
  //     return resource.children.reduce((array, item) => {
  //       return [
  //         ...array,
  //         ...this.getResourceKeys(item)
  //       ];
  //     }, []);
  //   }
  //   return [];
  // }
  //
  // getKeyedResources(resource) {
  //
  //   if (!resource) {
  //     resource = this.resource;
  //   }
  //
  //   if (resource.children) {
  //
  //     return resource.children.reduce((array, child) => {
  //
  //       if (child.key !== undefined) {
  //
  //         return [...array, child];
  //
  //       } else {
  //
  //         return [
  //           ...array,
  //           ...this.getKeyedResources(child)
  //         ];
  //
  //       }
  //
  //     }, []);
  //
  //   }
  //
  //   return [];
  //
  //   // return KarmaFieldsAlpha.Resource.getSubResources(resource);
  //
  // }

  getChild(id, ...path) {
    let child = this.childMap[id];

    // if (path.length) {
    //   child = child || [...this.getDescendants()].find(child => child.resource.id === id);
    //   child = child && child.getChild(...path);
    // }

    return child;
  }

  // getRelativeParent() {
  //   if (this.resource.key !==  undefined || !this.parent) {
	// 		return this;
	// 	} else {
	// 		return this.parent.getRelativeParent();
	// 	}
  // }
  //
  // getPath() {
  //   let path = this.parent && this.parent.getPath() || [];
  //   if (this.resource.key !==  undefined) {
  //     path.push(this.resource.key);
  //   }
  //   return path;
  // }

  getDefault() {
    // return this.parse(this.resource.default || "");
    // return [];
    // return undefined;
  }

  render() {
    // noop
  }


  async isModified() {

    const key = this.getKey();
    return this.parent.request("modified", {}, key);

  }


  // async dispatch2(request, ...path) {
  //
  //   if (this.parent) {
  //
  //     const key = this.getKey();
  //
  //     if (key !== undefined) {
  //
  //       return this.parent.dispatch(request, key, ...path);
  //
  //     }
  //
  //     return this.parent.dispatch(request, ...path);
  //
  //   }
  //
  // }
  //
  //
  // async dispatch(event, parent, origin) {
  //   if (!event.path) {
  //     event.path = [];
  //   }
  //   // if (!event.trace) {
  //   //   event.trace = [];
  //   // }
  //   // event.trace.push(this);
  //   const key = this.getKey();
  //
  //   if (key !== undefined) {
  //
  //     if (event.path[0] === "..") {
  //       event.path.shift();
  //     } else {
  //
  //
  //       event.path.unshift(key);
  //
  //     }
  //   }
  //   if (!event.field) {
  //     event.field = this;
  //   }
  //
  //   if (this.parent) {
  //
  //     // event.dispatcher = this;
  //     // event.relativeDispatcher.set(this.parent, this);
  //
  //
  //     event = await this.parent.dispatch(event, this, origin || this);
  //
  //
  //
  //   }
  //
  //   return event;
  // }

  request(subject, content, ...path) {
    if (this.parent) {
      return this.parent.request(subject, content, ...path);
    }
  }


  async parse(expression) {

    // const expressionKey = JSON.stringify(expression);
    //
    // let promise = this.cache.get(expressionKey);
    //
    // if (!promise) {
    //
    //   promise = KarmaFieldsAlpha.Expression.resolve(this, expression);
    //
    //   this.cache.set(promise, expressionKey);
    //
    // }
    //
    // return promise;

    return KarmaFieldsAlpha.Expression.resolve(this, expression);
  }

  async get(type, ...path) {
    const key = this.getKey();
    if (key) {
      path = [key, ...path];
    }
    const response = await this.request("get", {}, ...path);
    return KarmaFieldsAlpha.Type.convert(response, type);
  }

  async getString(...path) {
    return this.get("string", ...path);
  }

  async getNumber(...path) {
    return this.get("number", ...path);
  }

  async getArray(...path) {
    return this.get("array", ...path);
  }

  async getObject(...path) {
    return this.get("object", ...path);
  }

  // used for export cells
  async exportValue() {
    return "";
	}

  // used for import cells
	async importValue(value) {
    // noop
	}

  async export() {
    // noop
	}

	async import(object) {
    // noop
	}

  getKeys() {

    const key = this.getKey();
		let keys = new Set();

    if (key) {

      keys.add(key);

    }

    // else if (this.resource.children) {
    //
    //   for (let resource of this.resource.children) {
    //
  	// 		keys = new Set(...keys, ...this.createChild(resource).getKeys());
    //
  	// 	}
    //
    // }

		return keys;
  }


};
