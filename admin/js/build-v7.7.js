/**
 * build (V7.6)
 */

// -> parallele
// KarmaFieldsAlpha.buildChildren = function(children, element, clean) {
// 	let i = 0;
// 	let child = element.firstElementChild;
// 	const promises = [];
// 	while (i < children.length) {
// 		const promise = this.build(children[i], element, child, clean);
// 		promises.push(promise);
// 		i++;
// 		child = child && child.nextElementSibling;
// 	}
// 	while (child) {
// 		let next = child && child.nextElementSibling;
//
// 		const event = new Event("remove");
// 		element.dispatchEvent(event);
//
// 		element.removeChild(child);
// 		child = next;
// 	}
// 	return Promise.all(promises);
// }


// -> serial
KarmaFieldsAlpha.buildChildren = async function(children, element, clean) {
	let i = 0;
	let child = element.firstElementChild;
	const promises = [];
	while (i < children.length) {
		await this.build(children[i], element, child, clean);
		i++;
		child = child && child.nextElementSibling;
	}
	while (child) {
		let next = child && child.nextElementSibling;
		element.removeChild(child);
		child = next;
	}
}



KarmaFieldsAlpha.build = async function(args, parent, element, clean) {
	// args.render = (clean) => this.build(args, parent, args.element, clean);
	args.render = async (clean) => {
		if (args.queue) {
			await args.queue;
		}
		args.queue = this.build(args, parent, args.element, clean);
		return args.queue;
	}
	if (!element || clean) {
		args.element = document.createElement(args.tag || "div");
		if (args.class) {
			args.element.className = args.class;
		}
		if (element) {
			parent.replaceChild(args.element, element);
		} else {
			parent.appendChild(args.element);
		}

		// if (args.remove) {
		// 	args.element.addEventListener("remove", args.remove);
		// }

		if (args.init) {
			await args.init(args);
		}
	} else {
		args.element = element;
		delete args.ready;
	}
	if (args.update) {
		await args.update(args);
	}
	if (args.children || args.child) {
		await this.buildChildren(args.children || [args.child], args.element, args.clean);
	}
	if (args.ready) {
		await args.ready(args);
	}
	if (args.complete) {
		await args.complete(args);
	}
};
