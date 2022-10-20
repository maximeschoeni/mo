const {db} = require(ROOT+"/db.js");

exports.options = class {

  async get(id) {

    const data = await db.read();
    return data.options[id] || {};

  }

  async query(query) {

    const data = await db.read();

    if (query.id) {
      return data.options[query.id] || {};
    }

    return data.options || {};
  }


}
