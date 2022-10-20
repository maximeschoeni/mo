

const {db} = require(ROOT+"/db.js");

exports.options = class {

  async get(id) {

    const data = await db.read();

    return data.options && data.options[id] || {};

  }


  async query(query) {

    const results = [];

    if (query.ids) {

      for (let id of query.ids.split(",")) {

        const row = await this.get(id);

        results.push({id: id, ...row});

      }

    }

    if (query.id) {

      const row = await this.get(query.id);

      results.push({id: query.id, ...row});

    }

    return results;
  }

  async count(query) {

    const results = await this.query(query);
    return results.length;

  }

  async update(body, id) {

    const data = await db.read();

    if (!data.options) {

      data.options = {};

    }

    const row = data.options[id] || {};

    data.options[id] = {...row, ...body};

    await db.write(data);


  }

  async add(body) {

  }

}
