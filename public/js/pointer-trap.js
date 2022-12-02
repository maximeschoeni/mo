


// Usage:

// new PointerTrap(element);
//
// element.oncatch = (trap, event) => {
// 	console.log(trap.diffX, trap.diffY);
// }
//
// element.onrelease = (trap, event) => {
// 	console.log(trap.swipeRight, trap.swipeFail);
// }



// var input = document.createElement("textarea");
// input.style.position = "absolute";
// input.style.zIndex = 10000;
// input.style.top = 0;
// input.style.width = "500px";
// input.style.height = "300px";
//
// document.addEventListener("DOMContentLoaded", event => {
// 	document.body.appendChild(input);
// });



class PointerTrap {

	constructor(element, threshold = 5) {

		this.element = element;
		this.threshold = threshold;

		if ("ontouchstart" in window) {

			const ontouchmove = event => {
				console.log("touchmove");
				const x = event.touches[0].clientX;
				const y = event.touches[0].clientY;
				this.move(event, x, y);
			}

			const ontouchend = event => {
				console.log("touchend");
				this.release(event);
				document.removeEventListener("touchmove", ontouchmove);
				document.removeEventListener("touchend", ontouchend);
			}

			element.ontouchstart = event => {
				console.log("touchstart");
				const x = event.touches[0].clientX;
				const y = event.touches[0].clientY;
				this.start(event, x, y);
				document.addEventListener("touchmove", ontouchmove);
				document.addEventListener("touchend", ontouchend);

			}

		} else {

			const onmousemove = event => {
				console.log("mousemove");
				const x = event.clientX;
				const y = event.clientY;
				this.move(event, x, y);
			}

			const onmouseup = event => {
				console.log("mouseup");
				const x = event.clientX;
				const y = event.clientY;
				this.release(event, x, y);
				document.removeEventListener("mousemove", onmousemove);
				document.removeEventListener("mouseup", onmouseup);
			}

			element.onmousedown = event => {
				console.log("mousedown");
				const x = event.clientX;
				const y = event.clientY;
				this.start(event, x, y);
				document.addEventListener("mousemove", onmousemove);
				document.addEventListener("mouseup", onmouseup);

			}

		}

		// const onpointermove = event => {
		// 	const x = event.clientX;
		// 	const y = event.clientY;
		// 	this.move(event, x, y);
		// }
		//
		// const onpointerup = event => {
		// 	const x = event.clientX;
		// 	const y = event.clientY;
		// 	this.release(event, x, y);
		//
		//
		//
		// 	document.removeEventListener("pointermove", onpointermove);
		// 	document.removeEventListener("pointerup", onpointerup);
		// }
		//
		// element.onpointerdown = event => {
		//
		// 	const x = event.clientX;
		// 	const y = event.clientY;
		// 	this.start(event, x, y);
		// 	document.addEventListener("pointermove", onpointermove);
		// 	document.addEventListener("pointerup", onpointerup);
		//
		// }

	}

	start(event, x, y) {
		this.x = x;
		this.y = y;
		this.originX = x;
		this.originY = y;

		this.maxDX = 0;
		this.maxDY = 0;
		this.minDX = 0;
		this.minDY = 0;

		this.time = Date.now();
		this.tX = x;
		this.tY = y;

		this.box = this.element.getBoundingClientRect();

		this.map = {
			x: (x - this.box.left)/this.box.width,
			y: (y - this.box.top)/this.box.height
		};


		if (this.element.onstart) {
			this.element.onstart(this, event);
		}
	}

	move(event, x, y) {

		const now = Date.now();
		if (now > this.time + 200) {
			this.time = now;
			this.tDeltaX = x - this.tX;
			this.tDeltaY = y - this.tY;
			this.tX = x;
			this.tY = y;
		}


		this.deltaX = x - this.x;
		this.deltaY = y - this.y;
		this.x = x;
		this.y = y;
		this.diffX = x - this.originX;
		this.diffY = y - this.originY;
		this.maxDX = Math.max(this.diffX, this.maxDX || 0);
		this.maxDY = Math.max(this.diffY, this.maxDY || 0);
		this.minDX = Math.min(this.diffX, this.minDX || 0);
		this.minDY = Math.min(this.diffY, this.minDY || 0);



		this.map = {
			x: (x - this.box.left)/this.box.width,
			y: (y - this.box.top)/this.box.height
		};


		if (this.element.oncatch) {
			this.element.oncatch(this, event);
		}
	}

	release(event) {

		this.swipeRight = (this.maxDX > -this.minDX && this.maxDX > this.maxDY && this.maxDX > -this.minDY && this.diffX > this.maxDX-this.threshold);
		this.swipeLeft = (this.minDX < -this.maxDX && this.minDX < this.minDY && this.minDX < -this.maxDY && this.diffX < this.minDX+this.threshold);
		this.swipeDown = (this.maxDY > -this.minDY && this.maxDY > this.maxDX && this.maxDY > -this.minDX && this.diffY > this.maxDY-this.threshold);
		this.swipeUp = (this.minDY < -this.maxDY && this.minDY < this.minDX && this.minDY < -this.maxDX && this.diffY < this.minDY+this.threshold);
		this.click = (this.maxDX < this.threshold && this.minDX > -this.threshold && this.maxDY < this.threshold && this.minDY > -this.threshold);
		this.swipeFail = !this.swipeRight && !this.swipeLeft && !this.swipeDown && !this.swipeUp && !this.click;

		if (this.element.onrelease) {
			this.element.onrelease(this, event);
		}

	}

}
