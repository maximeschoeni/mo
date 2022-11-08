

const {db} = require(ROOT+"/db.js");


exports.countries = class {

  async get(id) {

    const data = await db.read();

    let rows = data.countries && data.countries.content || [];

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
  //         case "id":
  //         case "name":
  //           // -> string
  //           if (row[key] !== filters[key]) {
  //             return false;
  //           }
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
  //
  //         default:
  //           // -> array
  //           if (!row[key] || !row.includes[filters[key]]) {
  //             return false;
  //           }
  //           break;
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

    rows.sort((a, b) => {
      return (a.name || "").localeCompare(b.name || "");
    });

    return rows;
  }



  async query(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.countries && data.countries.content || [];

    rows = this.filter(rows, filters);

    if (ppp) {
      const offset = (Number(page || 1) - 1)*Number(ppp);
      rows = rows.slice(offset, offset + ppp);
    }

    this.sort(rows, orderby);

    if (order === "desc") {
      rows.reverse();
    }

    rows.forEach(row => {
      if (row.image === "" || row.image === "0") {
        delete row.image;
      }
    });

    return rows;
  }

  async count(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.countries && data.countries.content || [];

    rows = this.filter(rows, filters);

    return rows.length;
  }

  async update(body, id) {

    const data = await db.read();

    const row = data.countries && data.countries.content && data.countries.content.find(row => row.id === id);

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
            // -> as string
            row[key] = body[key][0] || "";
            break;

          case "image":
            // -> as string
            if (body[key][0] && body[key][0] !== "0") {
              row[key] = body[key][0];
            } else if (row[key]) {
              delete row[key];
            }
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

    if (!data.countries) {
      data.countries = {};
      data.countries.lastId = 0;
      data.countries.content = [];
    }

    const id = ++data.countries.lastId;

    data.countries.content.push({
      id: id.toString(),
      trash: true,
      date: new Date().toISOString(),
      ...body
    });

    await db.write(data);

    return id;
  }

}
