/**
 * build (V7.5)
 */

KarmaFieldsAlpha.buildChildren1 = function(args) {
	if (args.children || args.child) {
		const children = args.children || [args.child];
		let i = 0;
		let child = args.element.firstElementChild;
		const promises = [];
		while (i < children.length || child) {
			let next = child && child.nextElementSibling;

			// children[i].renderSelf = (clean) => {
			// 	KarmaFieldsAlpha.build(children[i], args.element, child, clean);
			// }

			promises.push(KarmaFieldsAlpha.build(children[i], args.element, child, args.clean));
			i++;
			child = next;
		}
		return Promise.all(promises);
	}
}


// KarmaFieldsAlpha.buildChildren = async function(children, element, childElement, clean) {
// 	if (children.length > 0 || childElement) {
// 		const child = children.shift();
// 		const next = childElement && childElement.nextElementSibling;
// 		await this.build(child, element, childElement, clean);
// 		await this.buildChildren(children, element, next, clean);
// 	}
// }


KarmaFieldsAlpha.build = async function(args, parent, element, clean) {
	if (args) {
		args.render = function() {
			KarmaFieldsAlpha.buildChildren1(args);
			// if (args.children || args.child) {
			// 	return KarmaFieldsAlpha.buildChildren(args.children || [args.child], args.element, args.element.firstElementChild, args.clean);
			// }
		}
		args.clean = clean;

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
				args.init(args);
			}
		} else {
			args.element = element;
		}


		if (args.update) {
			await args.update(args);
		}
		await args.render();
		if (args.complete) {
			args.complete(args);
		}
	} else if (element) {
		parent.removeChild(element);
	}
	return args;
};
