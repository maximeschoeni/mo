

const {db} = require(ROOT+"/db.js");


exports.sports = class {

  async get(id) {

    const data = await db.read();

    let rows = data.sports && data.sports.content || [];

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
  //         case "name":
  //         case "name-en":
  //           // -> string
  //           if (row[key] !== filters[key]) {
  //             return false;
  //           }
  //           break;
  //
  //         case "search": {
  //           const search = filters.search.normalize().replace(/\p{Diacritic}/gu, "");
  //           return row["name"].normalize().replace(/\p{Diacritic}/gu, "").match(new RegExp(search))
  //             || row["name-en"].normalize().replace(/\p{Diacritic}/gu, "").match(new RegExp(search));
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
        case "name":
          rows = rows.filter(row => row[key] === filters[key]);
          break;

        case "ids": {
          const ids = filters.ids.split(",");
          rows = rows.filter(row => ids.includes(row.id));
          break;
        }

        default:
          break;

      }

    }

    return rows;
  }

  async sort(rows, orderby) {

    switch (orderby) {

      case "name":
      case "name-en":
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

    let rows = data.sports && data.sports.content || [];

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

    return rows;
  }

  async count(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.sports && data.sports.content || [];

    rows = this.filter(rows, filters);

    return rows.length;
  }

  async update(body, id) {

    const data = await db.read();

    const row = data.sports && data.sports.content && data.sports.content.find(row => row.id === id);

    if (row) {

      for (let key in body) {

        switch (key) {

          case "trash":
            // -> as boolean
            row.trash = Boolean(Number(body[key].toString()));
            break;

          case "id":
            break;

          case "name":
          case "name-en":
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

    if (!data.sports) {
      data.sports = {};
      data.sports.lastId = 0;
      data.sports.content = [];
    }

    const id = ++data.sports.lastId;

    data.sports.content.push({
      id: id.toString(),
      trash: true,
      date: new Date().toISOString(),
      ...body
    });

    await db.write(data);

    return id;
  }

}
