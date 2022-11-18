


// element.ontouchstart = element.onmousedown = event => {
//
// 	const trap = new Trap(event);
//
// 	trap.onmove = event => {
// 		console.log(trap.diffX, trap.diffY);
// 	}
//
// 	trap.onrelease = event => {
// 		console.log(trap.swipeRight, trap.swipeFail);
// 	}
//
// }


new Trap(element);

element.oncatch = (event, trap) => {
	console.log(trap.diffX, trap.diffY);
}

element.onrelease = (event, trap) => {
	console.log(trap.swipeRight, trap.swipeFail);
}



class Trap {

	constructor(element) {

		this.element = element;

		if ('ontouchstart' in window) {

			const ontouchmove = event => {
				const x = event.touches[0].clientX;
				const y = event.touches[0].clientY;
				this.move(event, x, y);
			}

			const ontouchend = event => {
				const x = event.touches[0].clientX;
				const y = event.touches[0].clientY;
				this.release(event, x, y);
				document.removeEventListener("ontouchmove", ontouchmove);
				document.removeEventListener("ontouchend", ontouchend);
			}

			element.ontouchstart = event => {
				this.originX = event.touches[0].clientX;
				this.originY = event.touches[0].clientY;
				document.addEventListener("ontouchmove", ontouchmove);
				document.addEventListener("ontouchend", ontouchend);
			}

		} else {

			const onmousemove = event => {
				const x = event.clientX;
				const y = event.clientY;
				this.move(event, x, y);
			}

			const onmouseup = event => {
				const x = event.clientX;
				const y = event.clientY;
				this.release(event, x, y);
				document.removeEventListener("mousemove", onmousemove);
				document.removeEventListener("mouseup", onmouseup);
			}

			element.onmousedown = event => {

				this.originX = event.clientX;
				this.originY = event.clientY;
				document.addEventListener("mousemove", onmousemove);
				document.addEventListener("mouseup", onmouseup);

			}

		}

	}

	move(event, x, y) {
		this.x = x;
		this.y = y;
		this.deltaX = x - this.x;
		this.deltaY = y - this.y;
		this.maxDX = Math.max(this.deltaX, this.maxDX || 0);
		this.maxDY = Math.max(this.deltaY, this.maxDY || 0);
		this.minDX = Math.min(this.deltaX, this.minDX || 0);
		this.minDY = Math.min(this.deltaY, this.minDY || 0);
		this.diffX = x - this.originX;
		this.diffY = x - this.originY;

		if (this.element.oncatch) {
			this.element.oncatch(this, event);
		}
	}

	release(event, x, y) {
		this.move(event, x, y);

		if (this.maxDX > -this.minDX && this.maxDX > this.maxDY && this.maxDX > -this.minDY && this.deltaX > 0) {
			this.swipeRight = true;
		} else if (this.minDX < -this.maxDX && this.minDX < this.minDY && this.minDX < -this.maxDY && this.deltaX < 0) {
			this.swipeLeft = true;
		} else if (this.maxDY > -this.minDY && this.maxDY > this.maxDX && this.maxDY > -this.minDX && this.deltaY > 0) {
			this.swipeDown = true;
		} else if (this.minDY < -this.maxDY && this.minDY < this.minDX && this.minDY < -this.maxDX && this.deltaY < 0) {
			this.swipeUp = true;
		} else if (this.maxDX === 0 && this.minDX === 0 && this.maxDY === 0 && this.minDY === 0) {
			this.click = true;
		} else if (this.onCancel) {
			this.swipeFail = true;
		}

		if (this.element.onrelease) {
			this.element.onrelease(this, event);
		}

	}

}
