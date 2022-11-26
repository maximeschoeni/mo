


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



class PointerTrap {

	constructor(element) {

		this.element = element;

		this.slideThreshold = 0.8;
		this.pointMax = 5;

		// if ("ontouchstart" in window) {
		//
		// 	const ontouchmove = event => {
		// 		const x = event.touches[0].clientX;
		// 		const y = event.touches[0].clientY;
		// 		this.move(event, x, y);
		// 	}
		//
		// 	const ontouchend = event => {
		// 		const x = event.touches[0].clientX;
		// 		const y = event.touches[0].clientY;
		// 		this.release(event, x, y);
		// 		document.removeEventListener("ontouchmove", ontouchmove);
		// 		document.removeEventListener("ontouchend", ontouchend);
		// 	}
		//
		// 	element.ontouchstart = event => {
		// 		this.originX = event.touches[0].clientX;
		// 		this.originY = event.touches[0].clientY;
		// 		document.addEventListener("ontouchmove", ontouchmove);
		// 		document.addEventListener("ontouchend", ontouchend);
		// 	}
		//
		// } else {
		//
		// 	const onmousemove = event => {
		// 		const x = event.clientX;
		// 		const y = event.clientY;
		// 		this.move(event, x, y);
		// 	}
		//
		// 	const onmouseup = event => {
		// 		const x = event.clientX;
		// 		const y = event.clientY;
		// 		this.release(event, x, y);
		// 		document.removeEventListener("mousemove", onmousemove);
		// 		document.removeEventListener("mouseup", onmouseup);
		// 	}
		//
		// 	element.onmousedown = event => {
		//
		// 		this.originX = event.clientX;
		// 		this.originY = event.clientY;
		// 		document.addEventListener("mousemove", onmousemove);
		// 		document.addEventListener("mouseup", onmouseup);
		//
		// 	}
		//
		// }

		const onpointermove = event => {
			const x = event.clientX;
			const y = event.clientY;
			this.move(event, x, y);
		}

		const onpointerup = event => {
			const x = event.clientX;
			const y = event.clientY;
			this.release(event, x, y);
			document.removeEventListener("pointermove", onpointermove);
			document.removeEventListener("pointerup", onpointerup);
		}

		element.onpointerdown = event => {

			const x = event.clientX;
			const y = event.clientY;
			this.start(event, x, y);
			document.addEventListener("pointermove", onpointermove);
			document.addEventListener("pointerup", onpointerup);

		}

	}

	start(event, x, y) {
		this.x = x;
		this.y = y;
		this.originX = x;
		this.originY = y;

		this.time = Date.now();
		this.tX = x;
		this.tY = y;

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
		this.maxDX = Math.max(this.diffX, this.maxDX || 0);
		this.maxDY = Math.max(this.diffY, this.maxDY || 0);
		this.minDX = Math.min(this.diffX, this.minDX || 0);
		this.minDY = Math.min(this.diffY, this.minDY || 0);
		this.diffX = x - this.originX;
		this.diffY = y - this.originY;


		if (this.element.oncatch) {
			this.element.oncatch(this, event);
		}
	}

	release(event, x, y) {
		this.move(event, x, y);

		if (this.maxDX > -this.minDX && this.maxDX > this.maxDY && this.maxDX > -this.minDY && this.diffX > this.maxDX*this.slideThreshold) {
			this.swipeRight = true;
		} else if (this.minDX < -this.maxDX && this.minDX < this.minDY && this.minDX < -this.maxDY && this.deltaX < 0 && this.diffX < this.minDX*this.slideThreshold) {
			this.swipeLeft = true;
		} else if (this.maxDY > -this.minDY && this.maxDY > this.maxDX && this.maxDY > -this.minDX && this.deltaY > 0 && this.diffY > this.maxDY*this.slideThreshold) {
			this.swipeDown = true;
		} else if (this.minDY < -this.maxDY && this.minDY < this.minDX && this.minDY < -this.maxDX && this.deltaY < 0 && this.diffY < this.minDY*this.slideThreshold) {
			this.swipeUp = true;
		} else if (this.maxDX < this.pointMax && this.minDX > -this.pointMax && this.maxDY < this.pointMax && this.minDY > -this.pointMax) {
			this.click = true;
		} else if (this.onCancel) {
			this.swipeFail = true;
		}

		if (this.element.onrelease) {
			this.element.onrelease(this, event);
		}

	}

}
