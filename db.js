const fs = require('fs/promises');

exports.db = class {

  static async read() {

    if (!this.data) {

      const content = await fs.readFile(ROOT+"/db.json", {encoding: "utf8"});

      if (content) {

        this.data = JSON.parse(content);

      } else {

        this.data = {};

      }

    }

    return this.data;

  }

  static async write(data = {}) {

    // this.data = data;
    //
    // const content = JSON.stringify(this.data, null, "  ");
    //
    // await fs.writeFile(ROOT+"/db.json", content);

    this.save();

  }

  static save() {

    this.throttle(() => {
      if (this.data) {
        const content = JSON.stringify(this.data, null, "  ");
        fs.writeFile(ROOT+"/db.json", content);
      }
    }, 2000);

  }

  static throttle(callback, interval = 200) {
		if (this.throttleTimer) {
			clearTimeout(this.throttleTimer);
		}
		this.throttleTimer = setTimeout(callback, interval);
	}



  // static request(callback) {
  //
  //   this.promise = Promise.resolve(this.promise).then(async () => {
  //     let data = await this.read();
  //     data = callback(data);
  //     await this.write(data);
  //   });
  //
  //   return this.promise;
  //
  // }
  //
  // static requestRow(driver, id, callback) {
  //
  //   this.promise = Promise.resolve(this.promise).then(async () => {
  //     let data = await this.read();
  //
  //     await new Promise(resolve => {
  //       setTimeout(() => {
  //         resolve();
  //       }, 2000);
  //     });
  //
  //
  //     let row = data[driver] && data[driver].content && data[driver].content.find(row => row.id === id);
  //     callback(row);
  //     await this.write(data);
  //   });
  //
  //   return this.promise;
  //
  // }




}
