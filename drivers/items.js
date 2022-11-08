const {db} = require(ROOT+"/db.js");

exports.items = class {

  async getRows() {

    const data = await db.read();

    return data.items && data.items.content || [];

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

    let rows = await this.getRows();



    rows = rows.filter(row => {

      if (row.trash) {
        return false;
      }

      return true;
    });

    rows.sort((a, b) => {
      const value1 = a.order || 0;
      const value2 = b.order || 0;
      if (value1 < value2) return -1;
      else if (value1 > value2) return 1;
      return 0;
    });

    return rows;
  }


}
