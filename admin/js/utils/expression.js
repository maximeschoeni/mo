
KarmaFieldsAlpha.Expression = class {


  static async resolve(field, expression) {

    if (Array.isArray(expression)) {

      const [key, ...params] = expression;

			switch (key) {

				case "+":
				case "-":
				case "*":
				case "/":
        case "%":
				case "&&":
				case "||":
        case "=":
				case "==":
        case "===":
				case "!=":
        case "!==":
				case "<":
				case ">":
				case "<=":
				case ">=":
        case "in":
        case "notin":
					return this.operate(field, ...expression);

        case "!":
          return !await this.resolve(field, params[0]);

				case "?":
					return await this.resolve(field, params[0]) ? await this.resolve(field, params[1]) : await this.resolve(field, params[2] || "");

        case "...":
					return this.concat(field, ...params);

        // -> compat
        case "param":
          return this.getParam(field, ...params);


        // case "boolean":
        //   return Boolean(await this.resolve(field, params[0]));
        //
        // case "number":
        //   return Number(await this.resolve(field, params[0]));
        //
        // case "string":
        //   return String(await this.resolve(field, params[0]));

				// case "join":
        //   return this.arrayFn(field, key, ...params);
        //
        // case "split":
        //   return this.arrayFn(field, key, ...params);
        //
				// case "toFixed":
        //   return this.numberFn(field, key, ...params);

				default:
          if (this[key]) {
            return this[key](field, ...params);
          } else {
            return expression;
          }

			}

    }

    return expression;

  }

  static async resolveAll(field, expressions) {

    const values = [];

    for (let item of expressions) {

      const value = await this.resolve(field, item);

      values.push(value);

    }

    return values;
  }

  static async replace(field, string, wildcard, ...replacements) {

    for (let i = 0; i < replacements.length; i++) {

      const matches = string.match(wildcard);

      if (matches) {
        const replacement = await this.resolve(field, replacements[i]);
        string = string.replace(wildcard, replacement);
      }

    }

    return string;

  }


  // static async compare(field, comparison, expression1, expression2) {
  //   const value1 = await this.resolve(field, expression1);
  //   const value2 = await this.resolve(field, expression2);
  //
  //   switch (comparison) {
  //
  //   }
  // }

  static async operate(field, operation, expression1, expression2) {
    const value1 = await this.resolve(field, expression1);
    const value2 = await this.resolve(field, expression2);

    if (Array.isArray(value1)) {

      if (Array.isArray(value2)) {

        switch (operation) {
          case "==":
          case "===": return KarmaFieldsAlpha.DeepObject.equal(value1, value2);
          case "!=":
          case "!==": return KarmaFieldsAlpha.DeepObject.differ(value1, value2);
          case "+": return [...value1, ...value2];
          case "-": return value1.filter(item => !value2.includes(item));
        }

      } else {

        switch (operation) {
          case "==": return value1.every(item => item == value2);
          case "===": return value1.every(item => item === value2);
          case "!=": return value1.some(item => item != value2);
          case "!==": return value1.some(item => item !== value2);
          case "+": return [...value1, value2];
          case "-": return value1.filter(item => item !== value2);
          case "in": return value2.includes(value1);
          case "notin": return !value2.includes(value1);
        }

      }

    } else {

      switch (operation) {
        case "=":
        case "==": return value1 == value2;
        case "===": return value1 === value2;
        case "!=": return value1 != value2;
        case "!==": return value1 !== value2;
        case ">": return value1 > value2;
        case "<": return value1 < value2;
        case ">=": return value1 >= value2;
        case "<=": return value1 <= value2;
        case "+": return Number(value1)+Number(value2);
        case "-": return Number(value1)-Number(value2);
        case "*": return Number(value1)*Number(value2);
        case "/": return Number(value1)/Number(value2);
        case "%": return Number(value1)%Number(value2);
        case "&&": return value1 && value2;
        case "||": return value1 || value2;

        // case "in": return value2.includes(value1);
      }

    }

    console.error("illegal operation", operation, value1, value2);

  }

  static async max(value1, value2) {
    value1 = await this.resolve(value1);
    value2 = await this.resolve(value2);
    return Math.max(Number(value1), Number(value2));
  }

  static async min(value1, value2) {
    value1 = await this.resolve(value1);
    value2 = await this.resolve(value2);
    return Math.min(Number(value1), Number(value2));
  }

  // static async logic(field, operation, expression1, expression2) {
  //   const value1 = await this.resolve(field, expression1);
  //   const value2 = expression2 ? await this.resolve(field, expression2) : "";
  //
  //   switch (operation) {
  //     case "&&": return value1 && value2;
  //     case "||": return value1 || value2;
  //   }
  // }

  // static async arrayFn(field, fn, expression, ...params) {
  //   const array = await this.resolve(field, expression);
  //   return array[fn](...params);
  // }
  //
  // static async stringFn(field, fn, expression, ...params) {
  //   const string = await this.resolve(field, expression);
  //   return string.toString()[fn](...params);
  // }
  //
  // static async numberFn(field, fn, expression, ...params) {
  //   const number = await this.resolve(field, expression);
  //   return Number(number)[fn](...params);
  // }

  static async js(field, value, fn, ...params) {
    params = await this.resolveAll(field, params);
    return value[fn](...params);
  }

  static async math(field, fn, ...params) {
    params = await this.resolveAll(field, params);
    return Math[fn](...params);
  }

  static async date(field, expression, option = {}, locale = null, noDate = null) {
    const value = await this.resolve(field, expression);
    if (value) {
      const date = new Date(value);
      return new Intl.DateTimeFormat(locale || KarmaFieldsAlpha.locale, option).format(date);
    } else {
      return noDate;
    }
  }

  static async moment(field, expression, formatExpression = "DD/MM/YYYY") {
    const value = await this.resolve(field, expression);
    const format = await this.resolve(field, formatExpression);
    return moment(value).format(format);
  }

  static async condition(field, expression1, expression2, expression3 = "") {
    const value1 = await this.resolve(field, expression1);
    if (value1) {
      return await this.resolve(field, expression2);
    } else {
      return await this.resolve(field, expression3);
    }
  }




  static async getArray(field, ...expressionPath) {

    // const path = await this.resolveAll(field, expressionPath);
    // const response = await field.parent.request("get", {}, ...path);
    // return KarmaFieldsAlpha.Type.toArray(response);

    return this.get(field, "array", ...expressionPath);

  }

  static async get(field, type, ...path) {

    // -> compat
    switch (type) {
      case "string":
      case "array":
      case "object":
      case "number":
      case "boolean":
        break;
      default:
        path = [type, ...path];
        type = "string";
        break;
    }

    path = await this.resolveAll(field, path);

    const response = await field.request("get", {}, ...path);

    return KarmaFieldsAlpha.Type.convert(response, type);

  }

  static async getIds(field) {
    return await field.parent.request("ids");
  }

  static async getDriver(field) {
    console.error("deprecated");
    // const request = await field.dispatch({
    //   action: "driver"
    // });
    // return request.data;
  }

  static async queryArray(field, expressionDriver, ...expressionPath) {
    console.error("Deprecated queryArray. Use query");



    // let driver = await this.resolve(field, expressionDriver);
    // const path = await this.resolveAll(field, expressionPath);
    //
    //
    // if (typeof driver === "string") {
    //   driver = KarmaFieldsAlpha.Nav.parse(driver);
    // }
    //
    // const paramString = KarmaFieldsAlpha.Nav.toString(driver.params);
    // const store = new KarmaFieldsAlpha.Store(driver.name, driver.joins);
    // const results = await store.query(paramString);
    //
    // if (path.length) {
    //
    //   let value = await store.getValue(...path);
    //   return KarmaFieldsAlpha.Type.toArray(value);
    //
    // }
    //
    // return results;


    // field.queriedArrayRequest = request; // -> for dropdown...



  }

  static async query(field, driver, paramString = "", joins = [], type = "array", ...path) {

    driver = await this.resolve(field, driver);
    paramString = await this.resolve(field, paramString);
    if (typeof paramString === "object") {
      KarmaFieldsAlpha.Params.stringify(paramString);
    }
    // const store = new KarmaFieldsAlpha.Store(driver, joins);
    // const results = await store.query(paramString);
    const form = new KarmaFieldsAlpha.field.form({
      driver: driver,
      joins: joins
    });

    const results = await form.query(paramString);

    if (path.length) {
      path = await this.resolveAll(field, path);
      const value = await form.getInitial(...path);
      return KarmaFieldsAlpha.Type.convert(value, type);
    }

    return results;
  }

  static async getOptions(field, driver, paramString = "", nameField = "name", joins = []) {

    driver = await this.resolve(field, driver);
    paramString = await this.resolve(field, paramString);

    if (typeof paramString === "object") {
      KarmaFieldsAlpha.Params.stringify(paramString);
    }

    // const store = new KarmaFieldsAlpha.Store(driver);
    //
    // const ids = await store.queryIds(paramString);

    const form = new KarmaFieldsAlpha.field.form({
      driver: driver,
      joins: joins
    });

    const results = await form.query(paramString);

    const options = [];

    // for (let id of ids) {
    //   options.push({
    //     id: id,
    //     name: KarmaFieldsAlpha.Type.toString(await form.getInitial(id, nameField))
    //   });
    // }

    for (let item of results) {
      options.push({
        id: item.id,
        name: KarmaFieldsAlpha.Type.toString(item[nameField] || await form.getInitial(item.id, nameField))
      });
    }

    return options;
  }

  // static async getGroupOptions(field, driver, paramString = "", nameField = "name", keyField = "id", groupNameField = "group_name", groupIdField = "group_id") {
  //
  //   driver = await this.resolve(field, driver);
  //   paramString = await this.resolve(field, paramString);
  //
  //   const store = new KarmaFieldsAlpha.Store(driver);
  //
  //   const ids = await store.queryIds(paramString);
  //   const groups = [];
  //
  //   for (let id of ids) {
  //     const name = KarmaFieldsAlpha.Type.toString(await store.getValue(id, nameField));
  //     const groupId = KarmaFieldsAlpha.Type.toString(await store.getValue(id, groupIdField));
  //
  //     let group = groups.find(group => group.id === groupId);
  //
  //     if (!group) {
  //
  //       group = {
  //        id: groupId,
  //        name: KarmaFieldsAlpha.Type.toString(await store.getValue(id, groupNameField)),
  //        options: []
  //      };
  //
  //      groups.push(group);
  //
  //     }
  //
  //     group.options.push({
  //       id: id,
  //       name: KarmaFieldsAlpha.Type.toString(await store.getValue(id, nameField))
  //     });
  //
  //   }
  //
  //   return groups;
  // }


  // static async getOptions(field, driver, paramString = "", nameField = "name") {
  //
  //   // driver = await this.resolve(field, driver);
  //
  //   const expressionKey = JSON.stringify(["getOptions", driver, paramString, nameField]);
  //
  //   const cache = new KarmaFieldsAlpha.Buffer("cache");
  //
  //   let promise = cache.get(driver, "expressions", expressionKey);
  //
  //   if (!promise) {
  //
  //     promise = new Promise(async (resolve, reject) => {
  //
  //       paramString = await this.resolve(field, paramString);
  //
  //       const store = new KarmaFieldsAlpha.Store(driver);
  //
  //       const ids = await store.queryIds(paramString);
  //       const options = [];
  //
  //       for (let id of ids) {
  //
  //         const array = await store.getValue(id, nameField);
  //         const value = KarmaFieldsAlpha.Type.toString(array);
  //
  //         options.push({
  //           id: id,
  //           name: value
  //         });
  //
  //       }
  //
  //       resolve(options);
  //     });
  //
  //     cache.set(promise, driver, "expressions", expressionKey);
  //
  //   }
  //
  //   return promise;
  // }

  static async getParam(field, expressionKey) {
    const key = await this.resolve(field, expressionKey);
    return KarmaFieldsAlpha.Nav.get(key);
  }

  static async params(field, ...keys) {
    keys = await this.resolveAll(field, keys);
    const params = Object.fromEntries(keys.map(key => [key, KarmaFieldsAlpha.Nav.get(key)]).filter(entry => entry[1]));
    return Object.entries(params).map(entry => entry.join("=")).join("&");
  }

  static async modified(field, ...expressionPath) {
    const path = await this.resolveAll(field, expressionPath);
    const response = await field.request("modified", {}, ...path);
    return KarmaFieldsAlpha.Type.toBoolean(response);
  }

  // static async dispatch(field, action, type = "string", params = {}) {
  //   action = await this.resolve(field, action);
  //   params = await this.resolve(field, params);
  //
  //   const request = await field.dispatch({
  //     action: action,
  //     ...params
  //   });
  //
  //   return KarmaFieldsAlpha.Type.convert(request.data, type);
  // }

  static async request(field, action, type = "string", params = {}, ...path) {
    action = await this.resolve(field, action);
    params = await this.resolve(field, params);
    path = await this.resolveAll(field, path);

    const response = await field.request(action, params, ...path);

    return KarmaFieldsAlpha.Type.convert(response, type);
  }

  static async set(field, value, ...path) {
    value = await this.resolve(field, value);
    path = await this.resolveAll(field, path);

    await field.request("set", {data: value}, ...path);

    // const array = KarmaFieldsAlpha.Type.toArray(value);
    //
    // const request = await field.request("get", {}, ...path);
    //
    // if (KarmaFieldsAlpha.DeepObject.differ(request.data, array)) {
    //
    //   await field.request("set", {
    //     data: array,
    //   }, ...path);
    //
    // }
    // await this.setArray(field, array, ...path);
  }

  static async setParam(field, value, key) {
    key = await this.resolve(field, key);
    value = await this.resolve(field, value);
    // KarmaFieldsAlpha.Nav.set(value, key);
    KarmaFieldsAlpha.Nav.change(value, undefined, key);
  }


  // static array(field, array) {
  //   return array;
  // }

  // static async map(field, expressionArray, expression) {
  //   const array = this.resolve(field, expressionArray);
  //   const output = [];
  //   for (let item of array) {
  //     output.push(await this.resolve(field, expression));
  //   }
  //   return output;
  //
  //
  //   Promise.all(array.map(item => this.resolve(field, [expressionitem])))
  //
  //
  // }

  static async map(field, array, replacement) {

    array = await this.resolve(field, array);

    const output = [];

    for (let value of array) {

      field.loopItem = value;

      const item = await this.object(field, replacement);

      output.push(item);

    }

    return output;
  }



  // compat
  static async loop(field, expression, wildcard, replacementExpression, glue = "") {

    // const array = await this.resolve(field, expression);
    //
    // const output = [];
    //
    // const replaceDeep = (expression, wildcard, replacement) => {
    //   if (Array.isArray(expression)) {
    //     return expression.map(item => replaceDeep(item, wildcard, replacement));
    //   } else if (expression === wildcard) {
    //     return replacement;
    //   } else {
    //     return expression;
    //   }
    // }
    //
    // for (let value of array) {
    //
    //   const replacement = replaceDeep(replacementExpression, wilcard, value);
    //
    //   const item = await this.resolve(field, replacement);
    //
    //   output.push(item);
    //
    // }
    //
    // return output.join(glue);

    const array = await this.map(field, expression, wildcard, replacementExpression);
    return array.join(glue);
  }

  static async concat(field, ...values) {
    // return values.reduce((array, item) => {
    //   const value = await this.resolve(field, item);
    //   if (Array.isArray(value)) {
    //     array.push(...value);
    //   } else {
    //     array.push(value);
    //   }
    //   return array;
    // }, []);

    values = await this.resolveAll(field, values);

    return values.reduce((array, value) => {
      if (Array.isArray(value)) {
        array.push(...value);
      } else {
        array.push(value);
      }
      return array;
    }, []);

    // return values.reduce((array, value) => Array.isArray(value) ? [...array, ...value] : [...array, value], []);

    // return Promise.all(values.map(item => this.resolve(field, item))).reduce((array, value) => {
    //   if (Array.isArray(value)) {
    //     array.push(...value);
    //   } else {
    //     array.push(value);
    //   }
    //   return array;
    // }, []);
  }

  static raw(field, ...value) {
    return value;
  }

  static async object(field, value) {
    if (value && value.constructor === Object) {
      const object = {};
      for (let i in value) {
        object[i] = await this.resolve(field, value[i]);
      }
      return object;
    }
    return this.resolve(field, value);
  }

  static async getChild(field, value, ...path) {
    value = await this.resolve(field, value);
    path = await this.resolveAll(field, path);
    return KarmaFieldsAlpha.DeepObject.get(value, ...path);
  }

  static async item(field, ...path) {
    path = await this.resolveAll(field, path);
    return KarmaFieldsAlpha.DeepObject.get(field.loopItem, ...path);
  }

  static async convert(field, value, type) {
    value = await this.resolve(field, value);
    return KarmaFieldsAlpha.Type.convert(value, type);
  }







  static async count(field, array) {
    array = await this.resolve(field, array);
    return array.length;
  }

  static async empty(field, array) {
    array = await this.resolve(field, array);
    return array.length === 0;
  }

  static async actives(field) {
    return await field.request("actives");
  }

  static async selection(field) {
    return await field.request("selection");
  }



  static async taxonomy(field, taxonomy) {
    // return this.resolve(field, [
		// 	"<ul>##</ul>",
		// 	"replace",
		// 	"##",
		// 	[
		// 		"loop",
    //     ["getArray", taxonomy],
		// 		"%%",
		// 		[
		// 			"<li><a hash=\"driver=taxonomy&taxonomy=##\">##</a></li>",
		// 			"replace",
		// 			"##",
    //       taxonomy
		// 			["query", "taxonomy?taxonomy=category", "%%", "name"]
		// 		]
		// 	]
		// ]);

    return this.resolve(field, [
      "replace",
			"<ul>#</ul>",
			"#",
			[
        "js",
				"join",
        [
          "map",
          ["get", "array", taxonomy],
          [
            "replace",
            "<li><a hash=\"driver=taxonomy&taxonomy=#\">#</a></li>",
            "#",
            ["item"],
            [
              "query",
              "taxonomy",
              ["replace", "taxonomy=#", "#", taxonomy],
              [],
              "string",
              ["item"],
              "name"
            ]
          ]
        ],
        ""
			]
		]);
  }


  static async geocoding(field, value) {
    const url = "https://www.mapquestapi.com/geocoding/v1/address?key=KEY&location="+value+",CH";
    const response = await fetch(url).then(response => response.json());

    if (response.results && response.results[0] && response.results[0].locations && response.results[0].locations.length) {
      const locations = response.results[0].locations;
      const location = locations.find(location => value.includes(location.adminArea5)) || locations[0];
      const latLng = location.latLng;
      return latLng.lat+", "+latLng.lng; // + " ("+response.results.length+"/"+response.results[0].locations.length+")";
    }
    return "?";
  }


}
