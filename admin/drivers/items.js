

const {db} = require(ROOT+"/db.js");

exports.items = class {

  async get(id) {

    const data = await db.read();

    let rows = data.items && data.items.content || [];

    return rows.find(row => row.id === id);
  }

  filter(rows, filters) {

    return rows.filter(row => {

      if (row.trash) {
        return false;
      }

      for (let key in filters) {

        switch (key) {
          case "trash":
            break;

          case "ids": {
            const ids = filters.ids.split(",");
            if (!ids.includes(row.id)) {
              return false;
            }
            break;
          }

          case "id":
          case "name":
          case "title":
          case "content":
            // -> string
            if (row[key] !== filters[key]) {
              return false;
            }
            break;

          default:
            // -> array
            if (!row[key] || !row.includes[filters[key]]) {
              return false;
            }
            break;

        }

      }

      return true;
    });

  }

  async sort(rows, orderby) {

    switch (orderby) {

      case "category":
        // rows.sort((a, b) => {
        //   if (a[orderby] && (!b[orderby] || a[orderby][0] > b[orderby][0])) {
        //     return 1;
        //   } else if (b[orderby] && (!a[orderby] || a[orderby][0] < b[orderby][0])) {
        //     return -1;
        //   } else {
        //     return 0;
        //   }
        // });
        break;

      case "name":
      case "title":
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

    let rows = data.items && data.items.content || [];

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

    // rows.forEach(row => delete row.trash);

    return rows;
  }

  async count(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.items && data.items.content || [];

    rows = this.filter(rows, filters);

    return rows.length;
  }

  async update(body, id) {

    const data = await db.read();

    const row = data.items && data.items.content && data.items.content.find(row => row.id === id);

    if (row) {

      // for (let id in body) {

        // const row = data.items.content.find(row => row.id === id) || {};

        for (let key in body) {

          switch (key) {

            case "trash":
              // -> as boolean
              row.trash = Boolean(Number(body[key].toString()));
              break;

            case "id":
              break;

            case "name":
            case "title":
            case "content":
              // -> as string
              row[key] = body[key][0].toString();
              break;

            case "medias":
              row[key] = body[key];
              break;

            default:
              // -> as array
              row[key] = body[key].map(value => value.toString());
              break;

          }

        }


      await db.write(data);

    }

  }

  async add(body) {

    const data = await db.read();

    if (!data.items) {
      data.items = {};
      data.items.lastId = 0;
      data.items.content = [];
    }

    const id = ++data.items.lastId;

    data.items.content.push({
      id: id.toString(),
      trash: true,
      date: new Date().toISOString(),
      ...body
    });

    await db.write(data);

    return id;
  }

}
