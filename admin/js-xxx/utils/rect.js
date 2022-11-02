KarmaFieldsAlpha.Rect = class {

	constructor(x = 0, y = 0, width = 0, height = 0) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	static union(r1, r2) {
		let left = Math.min(r1.x, r2.x);
		let top = Math.min(r1.y, r2.y);
		let right = Math.max(r1.x + r1.width, r2.x + r2.width);
		let bottom = Math.max(r1.y + r1.height, r2.y + r2.height);
    return new this(left, top, right - left, bottom - top);
	}

	static equals(r1, r2) {
		return this.compare(r1, r2);
		// return r1.x === r2.x && r1.y === r2.y && r1.width === r2.width && r1.height === r2.height;
	}

	static compare(r1, r2) {
		return r1.x === r2.x && r1.y === r2.y && r1.width === r2.width && r1.height === r2.height;
	}

	static includes(r1, r2) {
		return r1.x >= r2.x && r1.y >= r2.y && r1.x+r1.width <= r2.x+r2.width && r1.y+r1.height <= r2.y+r2.height;
	}

	static contains(r, x, y) {
		return this.contain(r, x, y);
		// return r.width > 0 && r.height > 0 && x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;
	}
	static contain(r, x, y) {
		return r.width > 0 && r.height > 0 && x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;
	}

	static intersects(r1, r2) {
		return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x && r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;
	}

	static isBefore(r1, r2) {
		return r1.x < r2.x + r2.width/2 && r1.y < r2.y + r2.height/2 || r1.y + r1.height < r2.y + r2.height/2;
	}

	static isAfter(r1, r2) {
		return r1.x + r1.width > r2.x + r2.width/2 && r1.y + r1.height > r2.y + r2.height/2 || r1.y > r2.y + r2.height/2;
	}

	static fromElement(element) {
		return new this(element.offsetLeft, element.offsetTop, element.clientWidth, element.clientHeight);
	}

	static offset(r, x, y) {
		return new this(r.x + x, r.y + y, r.width, r.height);
	}

	// static getIndexes(r) {
	// 	const indexes = [];
	// 	for (let i = 0; i < r.height; i++) {
	// 		for (let j = 0; j < r.width; j++) {
	// 			const index = (r.y+i)*r.width + r.x + j;
	// 			indexes.push(index);
	// 		}
	// 	}
	// 	return indexes;
	// }

	offset(x, y) {
		return this.constructor.offset(this, x, y);
	}

	isBefore(r) {
		return this.constructor.isBefore(this, r);
	}

	isAfter(r) {
		return this.constructor.isAfter(this, r);
	}

	contains(x, y) {
		return this.constructor.contains(this, x, y);
	}

	union(r) {
		return this.constructor.union(this, r);
	}

	intersects(r) {
		return this.constructor.intersects(this, r);
	}

	equals(r) {
		return this.constructor.equals(r, this);
	}

  getArea() {
    return this.width*this.height;
  }

	includes(r) {
		return this.constructor.includes(r, this);
	}

}
