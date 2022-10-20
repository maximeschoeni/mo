
const fs = require('fs/promises');
const path = require('path');
// const im = require('imagemagick');
const {db} = require(ROOT+"/db.js");
const sharp = require('sharp');
const mime = require('mime-types');
const sizeOf = require('image-size');
const sanitize = require("sanitize-filename");


exports.files = class {

  async get(id) {

    const data = await db.read();

    let rows = data.files && data.files.content || [];

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

          case "parent":
            if ((row.parent || "0") !== filters.parent) {
              return false;
            }
            break;

          case "search":
            if (row.filename !== filters.search || row.filename.localeCompare(filters.search, 'fr', { sensitivity: 'base' }) !== 0) {
              return false;
            }
            break;

          case "id":
          case "name":
          case "caption":
          case "type":
          case "url":

            if (row[key] !== filters[key]) {
              return false;
            }
            break;

          default:

            // if (!row[key] || !row.includes[filters[key]]) {
            //   return false;
            // }
            break;

        }

      }

      return true;
    });

  }

  async sort(rows, orderby) {

    switch (orderby) {

      case "name":
        rows.sort(function (a, b) {
          if (a.filetype < b.filetype) {
            return 1;
          } else if (a.filetype > b.filetype) {
            return -1;
          } else {
            return (a[orderby] || "").localeCompare(b[orderby] || "");
          }
        });
        break;

    }

    return rows;
  }



  async query(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.files && data.files.content || [];

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

    return rows.map(row => {
      return {
        name: "",
        filename: "",
        parent: "0",
        date: "",
        type: "",
        size: 0,
        width: 0,
        height: 0,
        ...row

      };

    });
  }

  async count(query) {

    const data = await db.read();

    const {orderby, order, page, ppp, ...filters} = query;

    let rows = data.files && data.files.content || [];

    rows = this.filter(rows, filters);

    return rows.length;
  }

  async update(body, id) {

    const data = await db.read();

    const row = data.files && data.files.content && data.files.content.find(row => row.id === id);

    if (row) {

      // for (let id in body) {



        for (let key in body) {

          switch (key) {

            case "trash":
              // -> as boolean
              row.trash = Boolean(Number(body[key][0]));
              break;

            case "name":
            case "filename":
            case "filetype":
            case "parent":
            case "date":
            case "caption":
            case "type":
              // -> as string
              row[key] = body[key][0].toString();
              break;

            case "size":
            case "width":
            case "height":
              // -> as number
              row[key] = Number(body[key][0] || 0);
              break;

            case "thumb":
            case "tile":
            case "medium":
            case "big":
              // -> as object
              row[key] = body[key][0];
              break;

            case "sizes":
              // -> as array
              row[key] = body[key];
              break;

            default:
              break;

          }

        }

      // }

      await db.write(data);

    }

  }

  async add(body) {

    const data = await db.read();

    if (!data.files) {
      data.files = {};
      data.files.lastId = 0;
      data.files.content = [];
    }

    const id = ++data.files.lastId;

    const file = {
      id: id.toString(),
      trash: true,
      ...body
    };

    data.files.content.push(file);

    await db.write(data);



    return file.id;
  }


  // async findPathname(name, parent) {
  //
  //   parent = (parent || 0).toString();
  //
  //   if (parent !== "0") {
  //
  //     let files = await this.query({
  //       id: parent // = folder
  //     });
  //
  //     if (files.length) {
  //
  //       name = files[0].name + "/" + name;
  //
  //     }
  //
  //   }
  //
  //   return name;
  //
  // }

  async findOriginalName(name) { // name = full path

    let files = await this.query({
      name: name
    });

    if (files.length) {

      const extension = path.extname(name);
      // const dir = path.dirname(name);
      let basename = path.basename(name, extension);

      const matches = basename.match(/.*(-(\d+))$/);

      if (matches) {
        basename = basename.slice(-matches[1].length);
        basename += "-" + (Number(matches[0]) + 1).toString();
      } else {
        basename += "-1";
      }

      name = await this.findOriginalName(basename + extension);

    }

    return name;
  }

  // async resize(name, width, height) {
  //
  //   const extension = path.extname(name);
  //   let basename = path.basename(name, extension);
  //   // const dir = path.dirname(name);
  //   const size = {};
  //
  //   if (width && height) {
  //
  //     basename += "-"+width.toString()+"x"+height.toString();
  //     size.width = width;
  //     size.height = height;
  //
  //   } else if (width) {
  //
  //     basename += "-"+width.toString()+"w";
  //     size.width = width;
  //
  //   } else if (height) {
  //
  //     basename += "-"+height.toString()+"h";
  //     size.height = height;
  //
  //   } else {
  //
  //     return name;
  //
  //   }
  //
  //   const resizedName = basename + extension;
  //
  //   const newFileInfo = await sharp("./uploads/" + name).resize(size).toFile("./uploads/" + resizedName);
  //
  //   return resizedName;
  // }


  async createSize(fileId, name, size) {

    const file = await this.get(fileId);
    const extension = path.extname(file.name);
    const dimensions = sizeOf(ROOT+"/uploads/" + file.name);

    // if (size.width && size.width < dimensions.width || size.height && size.height < dimensions.height) {

      const resizedName = path.basename(file.name, extension) + "-" + name + extension;
      const newFileInfo = await sharp(ROOT+"/uploads/" + file.name).resize(size).toFile(ROOT+"/uploads/" + resizedName);

      return {
        key: name,
        filename: resizedName,
        width: size.width,
        height: size.height
      };

    // } else {
    //
    //   return {
    //     key: name,
    //     filename: file.name,
    //     width: dimensions.width,
    //     height: dimensions.height
    //   };
    //
    // }

  }


  async upload(file, body) {
    const total = Number(body.chunks);
    const index = Number(body.chunk);
    const size = Number(body.chunkSize);

    const handle = await fs.open(ROOT+"/temp/" + body.name, "a");

    await handle.write(file.data, 0);

    await handle.close();

    if (index + 1 >= total) {

      // let name = await this.findPathname(body.name, body.parent || "0");
      let name = sanitize(body.name);
      name = await this.findOriginalName(name);

      await fs.rename(ROOT+"/temp/" + body.name, ROOT+"/uploads/" + name);

      // const filename = path.basename(name);
      const type = mime.lookup(name);
      const date = new Date().toISOString();

      let fileId = body.id;

      if (fileId) {

        await this.update({
          name: [name],
          filename: [name],
          type: [type],
          size: [file.size + size*(total - 1)],
        }, fileId);

      } else {

        fileId = await this.add({
          name: name,
          filename: name,
          type: type,
          size: file.size + size*(total - 1),
          filetype: "file",
          date: date,
          parent: body.parent || "0",
          trash: false
        });

      }

      if (type === "image/jpeg" || type === "image/png") {

        const dimensions = sizeOf(ROOT+"/uploads/" + name);

        await this.update({
          width: [dimensions.width],
          height: [dimensions.height],
            // thumb: [thumb],
            // sizes: [thumb, tile, medium, big]
        }, fileId);

        await this.regen(fileId);

      }

      return fileId;
    }

    return true;
  }


  async regen(id) {

    const file = await this.get(id);

    const thumb = await this.createSize(id, "thumb", {width: 160, height: 160});
    const tile = await this.createSize(id, "tile", {height: 100});
    // const medium = await this.createSize(id, "medium", {width: Math.min(960, file.width)});
    // const big = await this.createSize(id, "big", {width: Math.min(1920, file.width)});
    const medium = await this.createSize(id, "medium", {width: 960});
    const big = await this.createSize(id, "big", {width: 1920});

    await this.update({
      thumb: [thumb],
      sizes: [thumb, tile, medium, big]
    }, id);

  }

}
