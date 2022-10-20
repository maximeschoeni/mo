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

    this.data = data;

    const content = JSON.stringify(this.data, null, "  ");

    await fs.writeFile(ROOT+"/db.json", content);

  }

}
