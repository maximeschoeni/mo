
KarmaFieldsAlpha.Relations = class {

	static register(...path) {
		KarmaFieldsAlpha.DeepObject.assign(this.relations, true, ...path);
	}

	static get(...path) {
		return KarmaFieldsAlpha.DeepObject.get(this.relations, ...path);
	}

}

KarmaFieldsAlpha.Relations.relations = {};
