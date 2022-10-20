const {db} = require(ROOT+"/db.js");

exports.games = class {

  async getRows() {

    const data = await db.read();

    return data.games && data.games.content || [];

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

    // if (query.gameGroup) {
    //   rows = rows.filter(row => row.gameGroup === query.gameGroup);
    // }

    return rows;
  }


}
