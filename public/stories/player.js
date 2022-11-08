class VideoPlayer {

  // register(video) {
  //   if (video !== this.video) {
  //     this.stop();
  //     this.currentTime = 0;
  //     this.progress = 0;
  //     this.video = video;
  //   }
  // }

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
  //
  //
  // build() {
  //   return {
  //     class: "media",
  //     update: async div => {
  //       div.element.classList.toggle("active", this.currentMedia === mediaIndex);
  //
  //       // const fileId = media.file && media.file[0];
  //       // const file = fileId && this.filesDirectory[fileId];
  //
  //       if (this.file.type.startsWith("image")) {
  //         div.children = [
  //           {
  //             tag: "img",
  //             init: img => {
  //               img.element.draggable = false;
  //             },
  //             update: img => {
  //               const size = file.sizes.find(size => size.key === "medium");
  //               if (!img.element.src.endsWith(size.filename)) {
  //                 img.element.src = "/uploads/" + size.filename;
  //               }
  //             }
  //           },
  //           {
  //             class: "caption",
  //             child: {
  //               update: caption => {
  //                 // caption.element.innerHTML = media.caption;
  //                 caption.element.innerHTML = this.translateObject(media, "caption");
  //               }
  //             }
  //           }
  //         ];
  //       } else if (this.file.type.startsWith("video")) {
  //         div.children = [
  //           {
  //             class: "video-container",
  //             update: container => {
  //               container.children = [
  //                 {
  //                   tag: "video",
  //                   init: video => {
  //                     video.element.loop = true;
  //                     video.element.controls = false;
  //                   },
  //                   update: video => {
  //                     video.element.onclick = event => {
  //                       this.player.toggle();
  //                       div.render();
  //                     };
  //                     video.child = {
  //                       tag: "source",
  //                       update: async source => {
  //                         if (!source.element.src.endsWith(this.file.filename)) {
  //                           source.element.type = this.file.type;
  //                           source.element.src = "/uploads/" + this.file.filename;
  //                         }
  //                       }
  //                     };
  //                   },
  //                   complete: video => {
  //                     if (this.currentMedia === mediaIndex) {
  //                       return this.load(video.element);
  //                     }
  //                   }
  //                 },
  //                 {
  //                   class: "video-timeline",
  //                   child: {
  //                     class: "line",
  //                     update: line => {
  //                       if (this.currentMedia === mediaIndex) {
  //                         // line.element.style.transform = `scaleX(${this.videoProgress})`;
  //                         this.player.onframe = progress => {
  //                           line.element.style.transform = `scaleX(${progress})`;
  //                         }
  //                       }
  //                     }
  //                   },
  //                   init: timeline => {
  //                     const start = clientX => {
  //                       // this.videoPlaying = false;
  //                       this.player.stop();
  //                       update(clientX);
  //                     }
  //                     const update = clientX => {
  //                       const box = timeline.element.getBoundingClientRect();
  //                       // this.videoProgress = (clientX - box.left)/box.width;
  //                       const progress = (clientX - box.left)/box.width;
  //                       this.player.set(progress);
  //                       // container.render();
  //                     }
  //                     const end = clientX => {
  //                       // this.videoPlaying = true;
  //                       this.player.play();
  //                       update(clientX);
  //                     }
  //                     const onmousemove = event => {
  //                       update(event.clientX);
  //                     }
  //                     const onmouseup = event => {
  //                       end(event.clientX);
  //                       document.removeEventListener("mousemove", onmousemove);
  //                       document.removeEventListener("mouseup", onmouseup);
  //                     }
  //                     timeline.element.onmousedown = event => {
  //                       start(event.clientX);
  //                       document.addEventListener("mousemove", onmousemove);
  //                       document.addEventListener("mouseup", onmouseup);
  //                     }
  //                     const ontouchmove = event => {
  //                       update(event.touches[0].clientX);
  //                     }
  //                     const ontouchend = event => {
  //                       end(event.touches[0].clientX);
  //                       document.removeEventListener("touchmove", ontouchmove);
  //                       document.removeEventListener("touchend", ontouchend);
  //                     }
  //                     timeline.element.ontouchstart = event => {
  //                       start(event.touches[0].clientX);
  //                       document.addEventListener("touchmove", ontouchmove);
  //                       document.addEventListener("touchend", ontouchend);
  //                     }
  //                   }
  //                 }
  //               ];
  //             }
  //           },
  //           {
  //             class: "video-button",
  //             init: async button => {
  //               button.element.onclick = event => {
  //                 event.preventDefault();
  //                 // this.videoPlaying = !this.videoPlaying;
  //
  //                 this.player.toggle();
  //
  //                 button.render();
  //               };
  //             },
  //             update: async button => {
  //               if (this.currentMedia === mediaIndex) {
  //
  //                 // this.player.onchange = () => {
  //                 //   button.render();
  //                 // }
  //                 // if (this.videoPlaying) {
  //                 //   button.element.innerHTML = await this.fetchSvg("pause.svg");
  //                 // } else {
  //                 //   button.element.innerHTML = await this.fetchSvg("play.svg");
  //                 // }
  //                 if (this.player.isPlaying) {
  //                   button.element.innerHTML = await this.fetchSvg("pause.svg");
  //                 } else {
  //                   button.element.innerHTML = await this.fetchSvg("play.svg");
  //                 }
  //               }
  //             }
  //           }
  //         ];
  //       }
  //     }
  //   };

}
