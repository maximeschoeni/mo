const {db} = require(ROOT+"/db.js");

exports.torches = class {

  async getRows() {

    const data = await db.read();

    return data.torches && data.torches.content || [];

  }

  async get(id) {

    const rows = await this.getRows();
    return rows.find(row => row.id === id);

  }

  async find(key, value) {

    const rows = await this.getRows();
    return rows.find(row => row[key] === value);

  }

  async query(query) {

    let rows = await this.getRows()

    rows = rows.filter(row => !row.trash);

    return rows;
  }


}
