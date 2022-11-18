const {db} = require(ROOT+"/db.js");
const {items} = require("./items.js");

exports.files = class extends items {

  async getRows() {

    const data = await db.read();

    return data.files && data.files.content || [];

  }

  async query(query) {

    let rows = await this.getRows();

    rows = rows.filter(row => !row.trash && row.filetype === "file");

    if (query.folder) {
      const row = await this.find("name", query.folder);
      if (row) {
        query.parent = row.id;
      }
    }

    // if (query.ids) {
    //   const ids = query.ids.split(",");
    //   rows = rows.filter(row => ids.includes(row.id));
    //   rows = ids.map(id => rows.find(row => row.id === id));
    // }

    if (query.ids) {
      const directory = Object.fromEntries(rows.map(row => [row.id, row]));
      rows = query.ids.split(",").map(id => directory[id]);
    }



    if (query.parent) {
      rows = rows.filter(row => row.parent === query.parent);
    }

    return rows;
  }


}
