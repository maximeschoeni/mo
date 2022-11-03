KarmaFieldsAlpha.field.dropdownGroup = class extends KarmaFieldsAlpha.field.dropdown {

	// async exportValue() {
	// 	const key = this.getKey();
	// 	const value = await this.get("string");
	// 	const options = await this.fetchOptions();
	// 	const option = options.find(option => option.id === value);
	//
	// 	if (option) {
	// 		return option.name;
	// 	}
	//
	// 	return "";
	// }
	//
	// async importValue(value) {
	// 	const key = this.getKey();
	// 	const options = await this.fetchOptions();
	// 	const option = options.find(option => option.name === value);
	//
	// 	if (option) {
	// 		await this.parent.request("set", {data: option.id}, key);
	// 	}
	// }
	//
	// async export(keys = []) {
	//
	// 	const key = this.getKey();
	// 	const defaults = {};
	//
	// 	if (keys.length === 0 || keys.includes(key)) {
	//
	// 		const value = await this.getString();
	// 		const options = await this.fetchOptions();
	// 		const option = options.find(option => option.id === value);
	//
	// 		if (option) {
	// 			defaults[key] = option.name;
	// 		}
	//
	// 	}
	//
	// 	return defaults;
  // }
	//
	// async import(object) {
	//
	// 	const key = this.getKey();
	//
	// 	if (object[key]) {
	//
	// 		const options = await this.fetchOptions();
	// 		const option = options.find(option => option.name === object[key]);
	//
	// 		if (option) {
	// 			await this.parent.request("set", {data: option.id}, key);
	// 		} else {
	// 			const defaults = await this.getDefault();
	// 			console.log(defaults);
	// 			await this.parent.request("set", {data: defaults[key]}, key);
	// 		}
	//
	// 	}
	//
  // }
	//
	//
	// async getDefault() {
	//
	// 	const options = await this.fetchOptions();
	// 	const defaults = {};
	// 	const key = this.getKey();
	//
	// 	if (key) {
	//
	// 		if (this.resource.default !== undefined) {
	//
	// 			defaults[key] = await this.parse(this.resource.default);
	//
	// 		} else if (options.length > 0) {
	//
	// 			defaults[key] = options[0].id;
	//
	// 		}
	//
	// 	}
	//
	// 	return defaults;
	//
	// }


	// hasOptgroups(options) {
	// 	return options.some(function(item) {
	// 		return item.group;
	// 	});
	// }
	//
	// getOptgroups(options) {
	//
	// 	return options.reduce(function(obj, item) {
	// 		let group = obj.find(function(group) {
	// 			return group.name === (item.group || "default");
	// 		});
	// 		if (!group) {
	// 			group = {
	// 				name: item.group || "default",
	// 				children: []
	// 			};
	// 			obj.push(group);
	// 		}
	// 		group.children.push(item);
	// 		return obj;
	// 	}, []);
	// }
	//
	// buildOptions(options, value) {
	// 	const field = this;
	//
	// 	if (field.hasOptgroups(options)) {
	//
	// 		return field.getOptgroups(options).map(function(optgroup) {
	// 			return {
	// 				tag: "optgroup",
	// 				update: function() {
	// 					this.element.label = optgroup.name;
	// 					this.children = optgroup.children.map(function(option) {
	// 						return {
	// 							tag: "option",
	// 							update: function() {
	// 								if (option.count && field.resource.count) {
	// 									this.element.textContent = option.name + " ("+option.count+")";
	// 								} else {
	// 									this.element.textContent = option.name;
	// 								}
	// 								this.element.value = option.key;
	//
	// 								if (value === option.key) {
	// 									this.element.selected = true;
	// 								}
	// 							}
	// 						};
	// 					})
	// 				}
	// 			};
	// 		});
	//
	// 	} else {
	//
	// 		return options.map(option => {
	// 			return {
	// 				tag: "option",
	// 				update: node => {
	// 					node.element.textContent = option.name;
	// 					node.element.value = option.key;
	// 					if (value === option.key) {
	// 						node.element.selected = true;
	// 					}
	// 				}
	// 			};
	// 		});
	//
	// 	}
	// }
	//
	// async createDropdown(onChange) {
	//
	// 	const dropdown = document.createElement("select");
	//
	// 	const options = await this.fetchOptions();
	// 	let value = await this.getValue();
	//
	// 	options.forEach(option => {
	// 		dropdown.add(new Option(option.name, option.id, false, value === option.id));
	// 	});
	//
	// 	dropdown.onchange = async event => onChange(dropdown.value);
	//
	// 	return dropdown;
	//
	// }



	async fetchOptions() {

		let options = [];

		if (this.resource.options) {

			options = [
				...await this.parse(this.resource.options)
			];

		}

		if (this.resource.driver) {

			const form = new KarmaFieldsAlpha.field.form({
				driver: this.resource.driver,
				joins: this.resource.joins
			});

	    const results = await form.query(this.resource.params || {});

			options = [...options, ...results];

		} else if (this.resource.table) {

			const table = await this.request("table", {id: this.resource.table});

			const results = await table.query({...table.resource.params, ...this.resource.params});

			options = [...options, ...results];

		}

		const groups = [];

		for (let item of options) {

      let group = groups.find(group => group.id === item.group_id);

      if (!group) {

        group = {
         id: item.group_id,
         name: item.group_name,
         options: []
       };

       groups.push(group);

      }

      group.options.push({
        id: item.id,
        name: item[this.resource.nameField || "name"] || await form.getInitial(item.id, this.resource.nameField || "name")
      });

    }



		// for (let item of results) {
		// 	options.push({
		// 		id: item.id,
		// 		group_id: item.group_id,
		// 		group_name: item.group_name,
		// 		name: item[this.resource.nameField || "name"] || await form.getInitial(item.id, this.resource.nameField || "name")
		// 	});
		// }
		//
		//
		//
		// for (let option of options) {
    //   // const name = KarmaFieldsAlpha.Type.toString(await store.getValue(id, query.nameField));
    //   // const groupId = KarmaFieldsAlpha.Type.toString(await store.getValue(id, query.groupIdField));
		//
    //   let group = groups.find(group => group.id === option.group_id);
		//
    //   if (!group) {
		//
    //     group = {
    //      id: option.group_id,
    //      name: option.group_name,
    //      options: []
    //    };
		//
    //    groups.push(group);
		//
    //   }
		//
    //   group.options.push({
    //     id: option.id,
    //     name: option.name
    //   });
		//
    // }


		return groups;


		// const expressionKey = JSON.stringify(this.resource.options);
		//
    // let promise = this.expressionCache.get(expressionKey);
		//
    // if (!promise) {
		//
    //   promise = this.parse(this.resource.options) || [];;
		//
    //   this.expressionCache.set(promise, expressionKey);
		//
    // }
		//
    // return promise;

	}

	// async fetchGroupOptions() {
	//
	// 	const query = {
	// 		driver: "none",
	// 		paramString: "",
	// 		nameField: "name",
	// 		idField: "id",
	// 		groupNameField: "group_name",
	// 		groupIdField: "group_id",
	// 		...this.resource.query
	// 	};
	//
	//
  //   const store = new KarmaFieldsAlpha.Store(query.driver);
	//
  //   const ids = await store.queryIds(query.paramString);
  //   const groups = [];
	//
	// 	if (this.resource.emptyValue) {
	// 		groups.push({
	// 			id: "",
	// 			name: "",
	// 			options: [{id: "", name: "–"}]
	// 		});
	// 	}
	//
  //   for (let id of ids) {
  //     const name = KarmaFieldsAlpha.Type.toString(await store.getValue(id, query.nameField));
  //     const groupId = KarmaFieldsAlpha.Type.toString(await store.getValue(id, query.groupIdField));
	//
  //     let group = groups.find(group => group.id === groupId);
	//
  //     if (!group) {
	//
  //       group = {
  //        id: groupId,
  //        name: KarmaFieldsAlpha.Type.toString(await store.getValue(id, query.groupNameField)),
  //        options: []
  //      };
	//
  //      groups.push(group);
	//
  //     }
	//
  //     group.options.push({
  //       id: id,
  //       name: KarmaFieldsAlpha.Type.toString(await store.getValue(id, query.nameField))
  //     });
	//
  //   }
	//
	// 	return groups;
	//
	// }

	build() {

		return {
			tag: "select",
			class: "dropdown karma-field",
			init: dropdown => {
				// if (this.resource.label) {
				// 	this.id = "karma-fields-"+this.getUniqueId();
				// 	dropdown.element.id = this.id;
				// }
			},
			update: async dropdown => {
				dropdown.element.classList.add("loading");

				const key = this.getKey();
	
				const optGroups = await this.fetchOptions();
				const response = await this.parent.request("get", {}, key);
				const value = KarmaFieldsAlpha.Type.toString(response);


				// optGroups.forEach(group => {
				// 	const optGroupElement = document.createElement("optgroup");
				// 	optGroupElement.label = group.name;
				// 	group.options.forEach(option => {
				// 		const optionElement = document.createElement("option");
				// 		optionElement.value = option.id;
				// 		optionElement.textContent = option.name;
				// 		optGroupElement.appendChild(optionElement);
				// 	});
				// 	dropdown.element.appendChild(optGroupElement);
				// });


				if (document.activeElement !== dropdown.element) {

					dropdown.element.replaceChildren(...optGroups.map(group => {
						const optGroupElement = document.createElement("optgroup");
						optGroupElement.label = group.name;
						optGroupElement.replaceChildren(...group.options.map(option => {
							const optionElement = document.createElement("option");
							optionElement.value = option.id;
							optionElement.textContent = option.name;
							return optionElement;
						}));
						return optGroupElement;
					}));

					dropdown.element.value = value;

				}

				dropdown.element.onchange = async event => {

					dropdown.element.classList.add("editing");

					KarmaFieldsAlpha.History.save();

					await this.parent.request("set", {data: dropdown.element.value}, key);

					if (this.resource.onchange) {
						await this.parse(this.resource.onchange);
					}

					await this.parent.request("edit");

					dropdown.element.classList.remove("editing");
				}

				if (this.resource.disabled) {
					dropdown.element.disabled = Boolean(await this.parent.parse(this.resource.disabled));
				}

				dropdown.element.parentNode.classList.toggle("modified", await this.isModified());

				dropdown.element.classList.remove("loading");


			}

		};
	}

}
