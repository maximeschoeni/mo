// version nov 2020
function registerSwipe(element) {
	var manager = {
		element: element,
		init: function(x, y) {
			this.oX = x;
			this.oY = y;
			this.x = x;
			this.y = y;
			this.deltaX = 0;
			this.deltaY = 0;
			this.maxDX = 0;
			this.maxDY = 0;
			this.minDX = 0;
			this.minDY = 0;
		},
		update: function (x, y) {
			this.deltaX = x - this.x;
			this.deltaY = y - this.y;
			this.maxDX = Math.max(this.deltaX, this.maxDX);
			this.maxDY = Math.max(this.deltaY, this.maxDY);
			this.minDX = Math.min(this.deltaX, this.minDX);
			this.minDY = Math.min(this.deltaY, this.minDY);
			this.x = x;
			this.y = y;
		},
		start: function(event) {
			if (this.onStart) {
				this.onStart(event);
			}
		},
		move: function(event) {
			if (Math.abs(this.deltaX) > Math.abs(this.deltaY) && this.onMoveX) {
				this.onMoveX(this.mouseX, this.mouseY, event);
			} else if (Math.abs(this.deltaX) < Math.abs(this.deltaY) && this.onMoveY) {
				this.onMoveY(this.mouseX, this.mouseY, event);
			} else if (this.onCancelMove) {
				this.onNoMove(event);
			}
		},
		end: function (event) {
			if (this.maxDX > -this.minDX && this.maxDX > this.maxDY && this.maxDX > -this.minDY && this.deltaX > 0 && this.onSlideRight) {
				this.onSlideRight(event);
			} else if (this.minDX < -this.maxDX && this.minDX < this.minDY && this.minDX < -this.maxDY && this.deltaX < 0 && this.onSlideLeft) {
				this.onSlideLeft(event);
			} else if (this.maxDY > -this.minDY && this.maxDY > this.maxDX && this.maxDY > -this.minDX && this.deltaY > 0 && this.onSlideDown) {
				this.onSlideDown(event);
			} else if (this.minDY < -this.maxDY && this.minDY < this.minDX && this.minDY < -this.maxDX && this.deltaY < 0 && this.onSlideUp) {
				this.onSlideUp(event);
			} else if (this.maxDX === 0 && this.minDX === 0 && this.maxDY === 0 && this.minDY === 0 && this.onClick) {
				this.onClick(event);
			} else if (this.onCancel) {
				this.onCancel(event);
			} else {
			}
		},
		onTouchStart: function(event) {
			var x = event.touches[0].clientX;
			var y = event.touches[0].clientY;
			function onMove(event) {
				var x = event.touches[0].clientX;
				var y = event.touches[0].clientY;
				manager.update(x, y);
				manager.move(event);
			}
			function onEnd(event) {
				manager.end(event);
				document.removeEventListener("touchmove", onMove);
				document.removeEventListener("touchend", onEnd);
			}
			manager.init(x, y);
			manager.update(x, y);
			manager.start(event);
			// event.preventDefault();
			document.addEventListener("touchmove", onMove);
			document.addEventListener("touchend", onEnd);
		},

		onMouseDown: function(event) {
			// console.log("mousedown");
			var x = event.clientX;
			var y = event.clientY;
			function onMove(event) {
				// console.log("mousemove");
				var x = event.clientX;
				var y = event.clientY;
				manager.update(x, y);
				manager.move(event);
			}
			function onEnd(event) {
				// console.log("mouseup");
				manager.end(event);
				document.removeEventListener("mousemove", onMove);
				document.removeEventListener("mouseup", onEnd);
			}
			manager.init(x, y);
			manager.update(x, y);
			manager.start(event);
			// event.preventDefault();
			document.addEventListener("mousemove", onMove);
			document.addEventListener("mouseup", onEnd);
		},
		registerTouch: function() {
			element.addEventListener("touchstart", this.onTouchStart);
		},
		registerMouse: function() {
			element.addEventListener("mousedown", this.onMouseDown);
		}
	};
	return manager;
}
