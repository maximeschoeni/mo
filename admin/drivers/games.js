

const {db} = require(ROOT+"/db.js");


exports.games = class {

  async get(id) {

    const data = await db.read();

    let rows = data.games && data.games.content || [];

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
  //         case "id":
  //         case "city":
  //         case "year":
  //           // -> string
  //           if (row[key] !== filters[key]) {
  //             return false;
  //           }
  //           break;
  //
  //         // case "search": {
  //         //   // const search = filters.search.normalize().replace(/\p{Diacritic}/gu, "");
  //         //   // return row["name"].normalize().replace(/\p{Diacritic}/gu, "").match(new RegExp(search))
  //         //   //   || row["name-en"].normalize().replace(/\p{Diacritic}/gu, "").match(new RegExp(search));
  //         //
  //         // }
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
        case "city":
        case "year":
        case "season":
          rows = rows.filter(row => row[key] === filters[key]);
          break;

        case "ids": {
          const ids = filters.ids.split(",");
          rows = rows.filter(row => ids.includes(row.id));
          break;
        }

        // case "search": {
        //   const search = filters.search.replace(/\p{Diacritic}/gu, "");
        //   const searchReg = new RegExp(search);
        //   rows = rows.filter(row => {
        //     return row["name"].replace(/\p{Diacritic}/gu, "").match(searchReg)
        //       || row["name-en"].replace(/\p{Diacritic}/gu, "").match(searchReg);
        //   });
        // }

        default:
          break;

      }

    }

    return rows;
  }

  async sort(rows, orderby) {

    switch (orderby) {

      case "year":
      case "city":
      case "season":
      default:
        rows.sort((a, b) => {
          const value1 = a[orderby] || "";
          const value2 = b[orderby] || "";
          return value1.localeCompare(value2);
        });
        break;

    }

    return rows;
  }



  async query(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.games && data.games.content || [];

    rows = this.filter(rows, filters);

    if (ppp) {
      const offset = (Number(page || 1) - 1)*Number(ppp);
      rows = rows.slice(offset, offset + ppp);
    }

    if (orderby) {
      this.sort(rows, orderby);
    }

    if (order === "desc") {
      rows.reverse();
    }

    return rows.map(row => ({name: `${row.city} ${row.year}`, ...row}));
  }

  async count(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.games && data.games.content || [];

    rows = this.filter(rows, filters);

    return rows.length;
  }

  async update(body, id) {

    const data = await db.read();

    const row = data.games && data.games.content && data.games.content.find(row => row.id === id);

    if (row) {

      for (let key in body) {

        switch (key) {

          case "trash":
            // -> as boolean
            row.trash = Boolean(Number(body[key].toString()));
            break;

          case "id":
            break;

          case "year":
          case "city":
          case "season":
            // -> as string
            row[key] = body[key][0].toString();
            break;

          default:
            // -> as array
            row[key] = body[key];
            break;

        }

      }


      await db.write(data);

    }

  }

  async add(body) {

    const data = await db.read();

    if (!data.games) {
      data.games = {};
      data.games.lastId = 0;
      data.games.content = [];
    }

    const id = ++data.games.lastId;

    data.games.content.push({
      id: id.toString(),
      trash: true,
      date: new Date().toISOString(),
      ...body
    });

    await db.write(data);

    return id;
  }

}
