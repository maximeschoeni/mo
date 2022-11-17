class VideoPlayer {

  unload() {
    this.stop();
    this.progress = 0;
    this.video = null;
  }

  load(video) {
    return new Promise((resolve, reject) => {
      if (video !== this.video) {
        this.stop();
        this.progress = 0;
        this.video = video;
        this.video.currentTime = 0;

        if (this.video.readyState === 4) {
          resolve();
        } else {
          this.video.onloadeddata = event => {
            resolve();
          }
          this.video.load();
        }
      } else {
        resolve();
      }
    });
  }

  play() {
    if (this.video && !this.isPlaying) {
      this.isPlaying = true;
      this.video.play();
      const onframe = () => {
        if (this.isPlaying) {
          this.progress = this.video.currentTime/this.video.duration || 0;
          requestAnimationFrame(() => {
            onframe();
          });
          if (this.onframe) {
            this.onframe();
          }
        }
      }
      onframe();
    }
  }

  stop() {
    if (this.video) {
      this.video.pause();
      this.isPlaying = false;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  set(progress) {
    if (this.video) {
      this.progress = progress;
      if (this.video.duration) {
        this.video.currentTime = this.video.duration*this.progress;
      }
    }
  }

}
