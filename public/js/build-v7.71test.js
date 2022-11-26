/**
 * build (V7.6)
 */

// window.buildChildren = function(children, element, clean) {
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
// 		element.removeChild(child);
// 		child = next;
// 	}
// 	return Promise.all(promises);
// }


window.build = async function(args, parent, element, clean) {
	if (args) {
		// args.render = (clean) => this.build(args, parent, args.element, clean);

		args.render = async clean => {
			if (args.children || args.child) {
				const element = args.element;
				const children = args.children || [args.child];
				let i = 0;
				let child = element.firstElementChild;
				const promises = [];
				while (i < children.length) {
					const promise = this.build(children[i], element, child, clean);
					promises.push(promise);
					i++;
					child = child && child.nextElementSibling;
				}
				while (child) {
					let next = child && child.nextElementSibling;
					element.removeChild(child);
					child = next;
				}
				return Promise.all(promises);
			}
		};

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
		// if (args.children || args.child) {
		// 	await this.buildChildren(args.children || [args.child], args.element, args.clean);
		// }
		await args.render();

		if (args.ready) {
			await args.ready(args);
		}
		if (args.complete) {
			args.complete(args);
		}
	} else {
		console.error("missing args parameter");
	}
};
