

const {db} = require(ROOT+"/db.js");


exports.gameGroups = class {

  async get(id) {

    const data = await db.read();

    let rows = data.gameGroups && data.gameGroups.content || [];

    return rows.find(row => row.id === id);
  }

  // filter(rows, filters) {
  //
  //   return rows.filter(row => {
  //
  //     if (row.trash) {
  //       return false;
  //     }
  //
  //     for (let key in filters) {
  //
  //       switch (key) {
  //         case "trash":
  //           break;
  //
  //         case "ids": {
  //           const ids = filters.ids.split(",");
  //           if (!ids.includes(row.id)) {
  //             return false;
  //           }
  //           break;
  //         }
  //
  //         default:
  //           return true;
  //
  //       }
  //
  //     }
  //
  //     return true;
  //   });
  //
  // }

  filter(rows, filters) {

    rows = rows.filter(row => !row.trash);

    for (let key in filters) {

      switch (key) {

        case "id":
        case "season":
        case "date1":
        case "date2":
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

  async sort(rows, orderby) {

    switch (orderby) {

      default:
        rows.sort((a, b) => {
          if (a.date1 < a.date2) return -1;
          else if (a.date1 > a.date2) return 1;
          else if (a.season < a.season) return -1;
          else if (a.season > a.season) return 1;
          else return 0;
        });
        break;

    }

    return rows;
  }



  async query(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.gameGroups && data.gameGroups.content || [];

    rows = this.filter(rows, filters);

    if (ppp) {
      const offset = (Number(page || 1) - 1)*Number(ppp);
      rows = rows.slice(offset, offset + ppp);
    }

    await this.sort(rows, orderby);

    if (order === "desc") {
      rows.reverse();
    }

    rows.forEach(row => {
      switch (row.season) {
        case "1":
          row.name = `Summer ${row.date1}-${row.date2}`;
          break;

        case "2":
          row.name = `Winter ${row.date1}-${row.date2}`;
          break;
      }
    });

    return rows;
  }

  async count(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.gameGroups && data.gameGroups.content || [];

    rows = this.filter(rows, filters);

    return rows.length;
  }

  async update(body, id) {

    const data = await db.read();

    const row = data.gameGroups && data.gameGroups.content && data.gameGroups.content.find(row => row.id === id);

    if (row) {

      for (let key in body) {

        switch (key) {

          case "trash":
            // -> as boolean
            row.trash = Boolean(Number(body[key].toString()));
            break;

          case "date1":
          case "date2":
          case "season":
            // -> as string
            row[key] = body[key][0].toString();
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

    if (!data.gameGroups) {
      data.gameGroups = {};
      data.gameGroups.lastId = 0;
      data.gameGroups.content = [];
    }

    const id = ++data.gameGroups.lastId;

    data.gameGroups.content.push({
      id: id.toString(),
      trash: true,
      date: new Date().toISOString(),
      ...body
    });

    await db.write(data);

    return id;
  }

}
