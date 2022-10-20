KarmaFieldsAlpha.Segment = class {

	constructor(index, length) {
		this.index = index || 0;
		this.length = length || 0;
	}

	static from(object = {}) {
		return new this(object.index, object.length);
	}

	union(index, length) {
		const union = new KarmaFieldsAlpha.Segment();
		union.index = Math.min(this.index, index);
		union.length = Math.max(this.index + this.length, index + length) - union.index;
		return union;
	}

	equals(index, length) {
		return this.index === index && this.length === length;
	}

	contains(index) {
		return this.length !== 0 && index >= this.index && index < this.index + this.length;
	}





	static union(s1, s2) {
		let index = Math.min(s1.index, s2.index);
		let length = Math.max(s1.index + s1.length, s2.index + s2.length) - index;
    return {
			index: index,
			length: length
		};
	}

	static equals(s1, s2) {
		return this.compare(s1, s2);
		// return s1 && s2 && s1.index === s2.index && s1.length === s2.length;
	}

	static contains(segment, index) {
		return this.contain(segment, index);
		// if (segment) {
		// 	return index >= segment.index && index < segment.index + segment.length;
		// }
		// return false;
	}

	static compare(s1, s2) {
		return s1 && s2 && s1.index === s2.index && s1.length === s2.length;
	}

	static contain(segment, index) {
		if (segment) {
			return index >= segment.index && index < segment.index + segment.length;
		}
		return false;
	}

	static fromArrays(array, slice) {
		const first = array.indexOf(slice[0]);
		const last = array.lastIndexOf(slice[slice.length - 1]);

		if (first > -1 && last > -1) {
			return {index: first, length: last - first + 1};
		}
	}


}
