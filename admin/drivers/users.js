

const {db} = require(ROOT+"/db.js");
const crypto = require("node:crypto");

exports.users = class {

  async get(id) {

    const data = await db.read();

    let rows = data.users && data.users.content || [];
    const row = rows.find(row => row.id === id) || {};

    return {
      id: id,
      name: row.name || ""
    }
  }

  async sort(rows, orderby) {

    switch (orderby) {

      case "name":
      default:
        rows.sort((a, b) => {
          const value1 = a.name || "";
          const value2 = b.name || "";
          return value1.localeCompare(value2);
        });
        break;

    }

    return rows;
  }

  filter(rows, filters) {

    rows = rows.filter(row => !row.trash);

    return rows;
  }

  async query(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.users && data.users.content || [];

    rows = this.filter(rows, filters);

    if (ppp) {
      const offset = (Number(page || 1) - 1)*Number(ppp);
      rows = rows.slice(offset, offset + ppp);
    }

    this.sort(rows, orderby);

    if (order === "desc") {
      rows.reverse();
    }

    return rows.map(row => {
      return {
        id: row.id,
        name: row.name
      };
    });
  }

  async count(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.users && data.users.content || [];

    rows = this.filter(rows, filters);

    return rows.length;
  }

  async update(body, id) {

    const data = await db.read();

    const row = data.users && data.users.content && data.users.content.find(row => row.id === id);

    if (row) {

      for (let key in body) {

        switch (key) {

          case "trash":
            // -> as boolean
            row.trash = Boolean(Number(body[key][0]));
            break;

          case "id":
            break;

          case "name":
            // -> as string
            row[key] = body[key].toString();
            break;

          case "password":
            row.password = crypto.createHash("sha256").update(body.password).digest("hex");
            break;

        }

      }


      await db.write(data);

    }

  }

  async add(body) {

    const data = await db.read();

    if (!data.users) {
      data.users = {};
      data.users.lastId = 0;
      data.users.content = [];
    }

    const id = ++data.users.lastId;

    data.users.content.push({
      id: id.toString(),
      trash: true,
      date: new Date().toISOString(),
      ...body
    });

    await db.write(data);

    return id.toString();
  }

  async login(body) {

    const data = await db.read();

    if (data.users && data.users.content && data.users.content.some(user => !user.trash)) {

      const name = body.name;
      const password = body.password;

      const row = data.users && data.users.content && data.users.content.find(row => row.name === name && !row.trash);

      if (row && password) {

        const hash = crypto.createHash("sha256").update(password).digest("hex");

        if (hash === row.password) {

          row.token = await new Promise((resolve, reject) => {
            crypto.randomBytes(48, (err, buffer) => {
              resolve(buffer.toString('hex'));
            });
          });

          await db.write(data);

          return row.token;

        }

      }

    } else { // -> first time login

      const id = await this.add({trash: false});

      await this.update(body, id);

      return this.login(body);

    }

  }

  async logout(body) {

    const data = await db.read();

    const row = data.users && data.users.content && data.users.content.find(row => row.name === body.name && !row.trash);

    if (row) {

      delete row.token;

      await db.write(data);

    }

  }

  async check(cookies) {

    const data = await db.read();

    const row = data.users && data.users.content && data.users.content.find(row => row.name === cookies.name && !row.trash);

    return row && row.token === cookies.token;

  }


}
