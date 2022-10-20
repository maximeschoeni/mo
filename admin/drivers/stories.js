

const {db} = require(ROOT+"/db.js");

const {sports} = require(ROOT+"/admin/drivers/sports");
const {countries} = require(ROOT+"/admin/drivers/countries");

exports.stories = class {

  async get(id) {

    const data = await db.read();

    let rows = data.stories && data.stories.content || [];

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
  //         case "title":
  //
  //           // -> string
  //           if (row[key] !== filters[key]) {
  //             return false;
  //           }
  //           break;
  //
  //         case "country":
  //         case "sport":
  //           // -> array
  //           if (!row[key] || !row.includes[filters[key]]) {
  //             return false;
  //           }
  //           break;
  //
  //         default:
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

        case "ids": {
          const ids = filters.ids.split(",");
          rows = rows.filter(row => ids.includes(row.id));
          break;
        }

        case "id":
        case "firstname":
        case "lastname":
        case "title":
          rows = rows.filter(row => row[key] === filters[key]);
          break;

        case "country":
        case "sport":
        case "season":
        case "gameGroup":
          // -> array
          rows = rows.filter(row => row[key] && row[key].includes(filters[key]));
          break;

        case "search": {
          const search = filters.search.replace(/\p{Diacritic}/gu, "").toLowerCase();
          const searchReg = new RegExp(search);
          rows = rows.filter(row => {
            return row.firstname && row.firstname.replace(/\p{Diacritic}/gu, "").toLowerCase().match(searchReg)
              || row.lastname && row.lastname.replace(/\p{Diacritic}/gu, "").toLowerCase().match(searchReg)
              || row.nicknames && row.nicknames.replace(/\p{Diacritic}/gu, "").toLowerCase().match(searchReg)
              || row.title && row.title.replace(/\p{Diacritic}/gu, "").toLowerCase().match(searchReg);
          });
        }

        default:
          break;

      }

    }

    return rows;
  }



  async sort(rows, orderby) {

    switch (orderby) {

      // case "category":
      //   // rows.sort((a, b) => {
      //   //   if (a[orderby] && (!b[orderby] || a[orderby][0] > b[orderby][0])) {
      //   //     return 1;
      //   //   } else if (b[orderby] && (!a[orderby] || a[orderby][0] < b[orderby][0])) {
      //   //     return -1;
      //   //   } else {
      //   //     return 0;
      //   //   }
      //   // });
      //   break;

      // case "country": {
      //   const driver = new countries();
      //   const results = await driver.query({});
      //   const object = Object.fromEntries(results.map(item => [item.id, item.name]));
      //
      //   rows.sort(async (a, b) => {
      //     const countryIdA = a.country[0];
      //     const countryIdB = b.country[0];
      //     return object[countryIdA].localeCompare(object[countryIdB]);
      //   });
      //   break;
      // }

      case "country": {
        const driver = new countries();
        const results = await driver.query({});
        const object = Object.fromEntries(results.map(item => [item.id, item.name]));
        rows.sort((a, b) => {
          return object[a[orderby][0]].localeCompare(object[b[orderby][0]]);
        });
        break;
      }

      case "sport": {
        const driver = new sports();
        const results = await driver.query({});
        const object = Object.fromEntries(results.map(item => [item.id, item.name]));
        rows.sort((a, b) => object[a[orderby][0]].localeCompare(object[b[orderby][0]]));
        break;
      }

      // case "country":
      // case "sport": {
      //   const data = await db.read();
      //   const rows = data[orderby] && data[orderby].content || [];
      //   const object = Object.fromEntries(rows.map(item => [item.id, item.name]));
      //   console.log(orderby, data, rows, object);
      //   rows.sort(async (a, b) => object[a[orderby][0]].localeCompare(object[b[orderby][0]]));
      //   break;
      // }

      case "lastname":
      case "firstname": {
        rows.sort((a, b) => {
          const value1 = a[orderby] || "";
          const value2 = b[orderby] || "";
          return value1.localeCompare(value2);
        });
      }

      default:

        break;




    }

    return rows;
  }



  async query(query) {

    // console.log(query);

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.stories && data.stories.content || [];

    rows = this.filter(rows, filters);

    if (ppp) {
      const offset = (Number(page || 1) - 1)*Number(ppp);
      rows = rows.slice(offset, offset + ppp);
    }

    if (orderby) {
      await this.sort(rows, orderby);
    }

    if (order === "desc") {
      rows.reverse();
    }

    return rows;
  }

  async count(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.stories && data.stories.content || [];

    rows = this.filter(rows, filters);

    return rows.length;
  }

  async update(body, id) {

    const data = await db.read();

    const row = data.stories && data.stories.content && data.stories.content.find(row => row.id === id);

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

            case "firstname":
            case "lastname":
            case "title":
            case "title-en":
            case "nicknames":
            case "nicknames-en":
            case "season":
            case "gameGroup":
              // -> as string
              row[key] = body[key][0].toString();
              break;

            case "country":
            case "sport":
            case "games":
            case "medias":
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

    if (!data.stories) {
      data.stories = {};
      data.stories.lastId = 0;
      data.stories.content = [];
    }

    const id = ++data.stories.lastId;

    data.stories.content.push({
      id: id.toString(),
      trash: true,
      date: new Date().toISOString(),
      ...body
    });

    await db.write(data);

    return id;
  }

}
