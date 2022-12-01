class Screensaver {

  constructor(timeout) {

    this.timeout = timeout || 10;

  }

  stop() {

    this.active = false;

    if (this.timer) {

      clearTimeout(this.timer);

    }

    this.timer = setTimeout(() => {

      this.active = true;

      if (this.onStart) {

        this.onStart();

      }

    }, this.timeout*1000);

  }



}
