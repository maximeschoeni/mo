KarmaFieldsAlpha.utils.rect = function(left, top, width, height) {
	var rect = {
		left: left || 0,
		top: top || 0,
		width: width || 0,
		height: height || 0,
		contains: function(x, y) {
			return x >= this.left && x < this.left+this.width && y >= this.top && y < this.top+this.height;
		},
		intersect: function(rect) {
			var left = Math.max(rect.left, this.left);
			var top = Math.max(rect.top, this.top);
			var right = Math.min(rect.left + rect.width, this.left + this.width);
			var bottom = Math.min(rect.top + rect.height, this.top + this.height);
			return KarmaFieldsAlpha.utils.rect(left, top, right - left, bottom - top);
		},
		union: function(rect) {
			var left = Math.min(rect.left, this.left);
			var top = Math.min(rect.top, this.top);
			var right = Math.max(rect.left + rect.width, this.left + this.width);
			var bottom = Math.max(rect.top + rect.height, this.top + this.height);
			return KarmaFieldsAlpha.utils.rect(left, top, right - left, bottom - top);
		},
		set: function(left, top, width, height) {
			this.left = left || 0;
			this.top = top || 0;
			this.width = width || 0;
			this.height = height || 0;
		},
		isEmpty: function() {
			return this.width <= 0 || this.height <= 0;
		},
		equals: function(rect) {
			return rect.left === this.left && rect.top === this.top && rect.width === this.width && rect.height === this.height;
		},
		clone: function() {
			return KarmaFieldsAlpha.utils.rect(this.left, this.top, this.width, this.height);
		}
	};
	return rect;
};
