

const {db} = require(ROOT+"/db.js");


exports.torches = class {

  async get(id) {

    const data = await db.read();

    let rows = data.torches && data.torches.content || [];

    return rows.find(row => row.id === id);
  }

  filter(rows, filters, data) {

    rows = rows.filter(row => !row.trash);

    for (let key in filters) {

      switch (key) {

        case "id":
        case "game":
          rows = rows.filter(row => row[key] === filters[key]);
          break;

        case "ids": {
          const ids = filters.ids.split(",");
          rows = rows.filter(row => ids.includes(row.id));
          break;
        }

      }

    }

    return rows;
  }

  async sort(rows, orderby, data) {

    switch (orderby) {

      case "game":
      default:
        const games = data.games && data.games.content || [];
        const directory = Object.fromEntries(games.map(game => [game.id, game]));
        rows.sort((a, b) => {
          if (directory[a.game].year < directory[b.game].year) return -1;
          else if (directory[a.game].year > directory[b.game].year) return 1;
          else if (directory[a.game].city < directory[b.game].city) return -1;
          else if (directory[a.game].city > directory[b.game].city) return 1;
          else return 0;
        });
        break;

    }

    return rows;
  }

  async query(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.torches && data.torches.content || [];

    this.sort(rows, orderby, data);
    rows = this.filter(rows, filters, data);

    if (ppp) {
      const offset = (Number(page || 1) - 1)*Number(ppp);
      rows = rows.slice(offset, offset + ppp);
    }

    if (order === "desc") {
      rows.reverse();
    }

    return rows;
  }

  async count(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.torches && data.torches.content || [];

    rows = this.filter(rows, filters);

    return rows.length;
  }

  async update(body, id) {

    const data = await db.read();

    const row = data.torches && data.torches.content && data.torches.content.find(row => row.id === id);

    if (row) {

      for (let key in body) {

        switch (key) {

          case "trash":
            // -> as boolean
            row.trash = Boolean(Number(body[key].toString()));
            break;

          case "game":
          case "image":
          case "relay":
          case "design":
          case "doyouknow":
            // -> as string array
            row[key] = body[key];
            break;

          default:
            break;

        }

      }


      await db.write(data);

    }

  }

  async add(body) {

    const data = await db.read();

    if (!data.torches) {
      data.torches = {};
      data.torches.lastId = 0;
      data.torches.content = [];
    }

    const id = ++data.torches.lastId;

    data.torches.content.push({
      id: id.toString(),
      trash: true,
      date: new Date().toISOString(),
      ...body
    });

    await db.write(data);

    return id;
  }

}
