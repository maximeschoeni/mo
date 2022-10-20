/**
 * build (V7.5)
 */
KarmaFieldsAlpha.build = function(args, parent, element, clean) {
	if (args) {
		if (args.render === undefined) {
			args.render = function(clean) {
				if (this.children || this.child) {
					const children = this.children || [this.child];
					let i = 0;
					let child = this.element.firstElementChild;
					const promises = [];
					while (i < children.length || child) {
						let next = child && child.nextElementSibling;
						// if (children[i]) {
						// 	children[i].parent = this;
						// }
						KarmaFieldsAlpha.build(children[i], this.element, child, clean);
						i++;
						child = next;
					}
				}
				// let children = this.children || this.child && [this.child] || [];
				// let i = 0;
				// let child = this.element.firstElementChild;
				// while (i < children.length || child) {
				// 	let next = child && child.nextElementSibling;
				// 	if (children[i]) {
				// 		children[i].parent = this;
				// 	}
				// 	KarmaFieldsAlpha.build(children[i], this.element, child, clean);
				// 	i++;
				// 	child = next;
				// }
			};
		}

		// if (!element || clean || element.tagName !== (args.tag || "div")) {


		// if (!element || clean || args.clear || args.reflow && args.reflow(element)) {

		if (!element || clean || args.clear) {
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
			clean = true;
		} else {
			args.element = element;
		}

		if (args.update) {
			// if (args.class && args.class.indexOf("arsenic-container") > -1) {
			// 	console.log("update", args, typeof args.child);
			// }
			args.update(args);




		}
		if (args.render) {

			// if (args.class && args.class.indexOf("arsenic-container") > -1) {
			// 	console.log("render", args, typeof args.child);
			// }
			args.render(clean);
		}
	} else if (element) {
		parent.removeChild(element);
	}
	return args;
};
