
/**
 * Media Player
 *
 * @since mars2019 v2
 * @since dec2019 v3
 * @since sept2021 v4:
 *   -> use promise
 */
function createMediaPlayer() {

	var timerID;
	var sleepTimerId;

	var player = {};
  player.items = [];
	player.offset = 0;
	player.cyclic = true;
	player.scalar = true;
	player.duration = 400;
	player.easing = "easeInOutSine";
	player.timerDuration = 5000;
	player.sleepTimerDuration = 0;
	player.x = 0;
	player.width = 0;
	player.pivot = 0.5;
	player.stateX = 0;

	player.addSlide = function(item) {
		// item.x = this.items.length;
		item.width = item.width || 1
		item.offset = item.offset || item.x || this.width;
		this.width += item.width;
		this.items.push(item);
	};
	player.reset = function() {
		this.width = 0;
		this.x = 0;
		this.items = [];
	}
	player.getCurrent = function(offset) {
		return this.items[this.getCurrentIndex(offset)];
	};
  player.getCurrentIndex = function(offset) {
		return Math.round(this.getSlideAt(this.x+(offset||0)));
	};
	player.getFirst = function() {
		return this.items[0];
	};
	player.getLast = function() {
		return this.items[this.items.length-1];
	};
	player.setCurrent = function(item) {
		var index = this.items.indexOf(item);
		if (index > -1) {
			this.x = this.items[index].offset;
		}
	};
	player.truncate = function(value, length) {
		return (value/length-Math.floor(value/length))*length;
	};
	player.cycle = function(value) {
		value = this.truncate(value, this.width);
		if (value > this.width*this.pivot) {
			return value - this.width;
		}
		return value;
	};
	player.getXAt = function(index) {
		return index*this.width/this.items.length;
	};
	player.getSlideAt = function(x) {
		return this.truncate(Math.round(x*this.items.length/this.width), this.items.length);
	};
	player.renderSlide = function(slide, index) {
		var x = slide.offset-(this.x + this.offset);
		if (this.cyclic) {
			x = this.cycle(x);
		}
		// if (x+(slide.width||1) >= 0 && x <= 1 && this.onRenderSlide) {
		// 	this.onRenderSlide.call(this, slide, x);
		// }
    this.onRenderSlide.call(this, slide, x);
	};
	player.render = function() {
		for (var i = 0; i < this.items.length; i++) {
			this.renderSlide(this.items[i], i);
		}
	};
	player.init = function() {
		this.render();
		if (player.onComplete) {
			player.onComplete.call(this);
		}
	};
	player.shift = function(offset, constrain) {
		if (!this.cyclic && constrain) {
			offset = Math.min(offset, this.getLast().offset-this.x);
			offset = Math.max(offset, -this.x);
		}
		this.offset = offset;
		player.render();
	};
	player.cancel = function() {
		return this.change(this.x);
	};
	player.change = function(x) {
		return new Promise(function(resolve, reject) {
			player.offset = (player.x || 0) + (player.offset || 0) - x;
			player.x = x;
			TinyAnimate.animate(player.offset, 0, player.duration, function(value) {
				player.offset = value;
				player.render();
			}, player.easing, function() {
				if (player.onComplete) {
					player.onComplete.call(player);
				}
				resolve();
			});
		});
	};
	player.next = function() {
		var x = (this.x || 0) + 1;
		if (this.scalar) {
			x = Math.round(x);
		}
		if (!this.cyclic) {
			x = Math.min(x, this.getLast().offset);
		}
		return this.change(x);
	};
	player.prev = function(callback) {
		var x = (this.x || 0) - 1;
		if (this.scalar) {
			x = Math.round(x);
		}
		if (!this.cyclic) {
			x = Math.max(x, 0);
		}
		return this.change(x);
	};

	player.sleep = function() {
		this.pause();
		if (this.sleepTimerDuration) {
			sleepTimerId = setTimeout(function() {
				player.play();
			}, this.sleepTimerDuration);
		}
	};
	player.play = function() {
		this.pause();
		timerID = setTimeout(function() {
			if (player.onPlay) {
				player.onPlay();
			}
			player.play();
		}, this.timerDuration);
	};
	player.pause = function() {
		if (timerID) {
			clearTimeout(timerID);
			timerID = null;
		}
		if (sleepTimerId) {
			clearTimeout(sleepTimerId);
			sleepTimerId = null;
		}
	}
	return player;
}
