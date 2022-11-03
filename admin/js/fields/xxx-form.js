
KarmaFieldsAlpha.field.form = class extends KarmaFieldsAlpha.field.group {

	constructor(...args) {
		super(...args);

		const bufferPath = this.resource.bufferPath || ["data", this.resource.driver || this.resource.key || "nodriver"];
		this.buffer = new KarmaFieldsAlpha.Buffer(...bufferPath);


	}


	// async dispatch(event, parent) {
	//
	// 	switch (event.action) {
	//
	//
	// 		case "get": {
	// 			let value = this.buffer.get(...event.path);
	// 			if (value) {
	//
	// 				event.data = KarmaFieldsAlpha.Type.toArray(value);
	// 			} else {
	// 				const path = [...event.path];
	// 				await super.dispatch(event);
	//
	// 			}
	// 			break;
	//
	// 		}
	//
	// 		case "set": {
	// 			// if (event.backup === "pack") debugger;
	// 			const newValue = KarmaFieldsAlpha.Type.toArray(event.data);
	//
	// 			let currentValue = this.buffer.get(...event.path);
	//
	//
	// 			if (!currentValue) {
	//
	// 				let request = await super.dispatch({
	// 					action: "get",
	// 					path: [...event.path]
	// 				});
	//
	// 				currentValue = KarmaFieldsAlpha.Type.toArray(request.data);
	//
	// 			}
	//
	// 			if (KarmaFieldsAlpha.DeepObject.differ(newValue, currentValue)) {
	//
	// 				if (event.autosave) {
	//
	// 					await super.dispatch(event);
	//
	// 				} else {
	//
	// 					this.buffer.set(currentValue, ...event.path); // -> todo get ride of this
	// 					this.buffer.backup(newValue, ...event.path);
	// 					this.buffer.set(newValue, ...event.path);
	//
	// 				}
	//
	// 			}
	//
	// 			break;
	// 		}
	//
	// 		// case "modified": {
	// 		// 	const delta = this.grid.buffer.get(...event.path);
	// 		// 	if (delta) {
	// 		// 		event.data = await this.dispatch({
	// 		// 			action: "compare",
	// 		// 			data: delta
	// 		// 		}).then(request => KarmaFieldsAlpha.Type.toBoolean(request.data));
	// 		// 	} else {
	// 		// 		event.data = false;
	// 		// 	}
	// 		// 	break;
	// 		// }
	//
	// 		case "modified": {
	// 			const delta = this.buffer.get(...event.path);
	//
	// 			if (event.data) {
	// 				event.data = KarmaFieldsAlpha.DeepObject.differ(event.data, delta);
	// 			} else if (delta) {
	// 				event.data = delta;
	// 				await super.dispatch(event);
	// 				// event.data = await this.dispatch({
	// 				// 	action: "compare",
	// 				// 	data: delta
	// 				// }).then(request => KarmaFieldsAlpha.Type.toBoolean(request.data));
	// 			}
	// 			break;
	// 		}
	//
	//
	//
	//
	//
	// 		case "submit":
	// 			// await this.submit();
	// 			// for (let listener of this.listeners) {
	// 			// 	await listener();
	// 			// }
	// 			await super.dispatch({
	// 				action: "send",
	// 				data: this.buffer.get()
	// 			});
	//
	// 			this.buffer.empty(); // backup or not?
	// 			break;
	//
	// 		case "send":
	// 			event.action = "set";
	// 			await super.dispatch(event);
	// 			break;
	//
	// 		// case "backup": {
	// 		// 	event.data = event.data || this.buffer.get(...event.path);
	// 		// 	await super.dispatch(event);
	// 		// 	break;
	// 		// }
	//
	// 		default:
	// 			await super.dispatch(event);
	// 			break;
	//
	// 	}
	//
	//
	//
	// 	return event;
	// }



	async request(subject, content = {}, ...path) {

		switch (subject) {

			case "get": {

				let value = this.buffer.get(...path);

				if (value) {

					return KarmaFieldsAlpha.Type.toArray(value);

				} else {

					return super.request(subject, content, ...path); // -> extends group

				}

				break;
			}

			case "set": {

				const newValue = KarmaFieldsAlpha.Type.toArray(content.data);

				let currentValue = this.buffer.get(...path);

				if (!currentValue) {

					const response = await super.request("get", {}, ...path); // -> extends group

					currentValue = KarmaFieldsAlpha.Type.toArray(response);

				}

				if (KarmaFieldsAlpha.DeepObject.differ(newValue, currentValue)) {

					if (content.autosave) {

						this.buffer.change(newValue, currentValue, ...path);

						await super.request(subject, content, ...path); // -> extends group



					} else {

						// this.buffer.set(currentValue, ...event.path); // -> todo get ride of this
						// this.buffer.backup(newValue, ...event.path);
						// this.buffer.set(newValue, ...event.path);


						this.buffer.change(newValue, currentValue, ...path);

					}

				}

				break;
			}

			case "modified": {

				const delta = this.buffer.get(...path);

				if (content.data) {

					return KarmaFieldsAlpha.DeepObject.differ(content.data, delta);

				} else if (delta) {

					return super.request(subject, {data: delta}, ...path);

				}

				return false;
			}





			case "submit": {
				const delta = this.buffer.get(...path);
				await this.parent.request("send", {data: delta});
				this.buffer.remove();
				await this.render();
				break;
			}

			// case "send":
			// 	event.action = "set";
			// 	await super.dispatch(event);
			// 	break;

			default:
				return super.request(subject, content, ...path); // -> extends group

		}

	}


	async send() {
		let delta = this.buffer.get();
		const key = this.getKey();
		if (key) {
			delta = {[key]: delta};
		}
		await this.parent.request("send", {data: delta});
		this.buffer.remove();
	}

};
