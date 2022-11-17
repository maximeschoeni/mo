const {files} = require(ROOT+"/admin/drivers/files");
const {users} = require(ROOT+"/admin/drivers/users");
const {items} = require(ROOT+"/admin/drivers/items");
const {options} = require(ROOT+"/admin/drivers/options");
const {stories} = require(ROOT+"/admin/drivers/stories");
const {games} = require(ROOT+"/admin/drivers/games");
const {sports} = require(ROOT+"/admin/drivers/sports");
const {countries} = require(ROOT+"/admin/drivers/countries");
const {gameGroups} = require(ROOT+"/admin/drivers/game-groups");
const {torches} = require(ROOT+"/admin/drivers/torches");

// module.exports = {
//   files: files,
//   items: items,
//   options: options
// };

function getDriver(driver) {

  switch (driver) {

    case "files":
      return new files();

    case "users":
      return new users();

    case "items":
      return new items();

    case "options":
      return new options();

    case "stories":
      return new stories();

    case "games":
      return new games();

    case "sports":
      return new sports();

    case "countries":
      return new countries();

    case "gameGroups":
      return new gameGroups();

    case "torches":
      return new torches();


    default:
      console.error("Missing driver: ", driver);

  }

}


exports.adminDrivers = class {

  static async get(req, res) {

    const driver = getDriver(req.params.driver);
    const results = await driver.get(req.params.id);
    res.json(results);

  }

  static async query(req, res) {

    const driver = getDriver(req.params.driver);
    const results = await driver.query(req.query);
    res.json(results);

  }

  static async count(req, res) {

    const driver = getDriver(req.params.driver);
    const results = await driver.count(req.query);
    res.json(results);

  }

  static async update(req, res) {

    if (await (new users()).check(req.cookies)) {
      const driver = getDriver(req.params.driver);
      await driver.update(req.body.data, req.params.id);
      res.json(true);
    } else {
      res.json(false);
    }

  }

  static async add(req, res) {

    if (await (new users()).check(req.cookies)) {
      const driver = getDriver(req.params.driver);
      const id = await driver.add(req.body.data);
      res.json(id);
    } else {
      res.json(false);
    }

  }

  static async upload(req, res) {

    if (await (new users()).check(req.cookies)) {
      const driver = new files();
      const id = await driver.upload(req.files.file, req.body);
      res.json(id);
    } else {
      res.json(false);
    }

  }

  static async regen(req, res) {

    if (await (new users()).check(req.cookies)) {
      const driver = new files();
      await driver.regen(req.params.id);
      res.json(true);
    } else {
      res.json(false);
    }

  }

  static async login(req, res) {
    const driver = new users();
    const hash = await driver.login(req.body);

    if (hash) {
      res
        .status(201)
        .cookie('token', hash, {
          expires: new Date(Date.now() + 10*365*24*60*60*1000)
        })
        .cookie('name', req.body.name, {
          expires: new Date(Date.now() + 10*365*24*60*60*1000)
        })
        .redirect(301, '/admin/index.html');
    } else {
      res.redirect(301, '/admin/login.html');
    }

  }

  static async logout(req, res) {
    // const driver = new users();
    // if (await driver.check(req.cookies)) {
    //   await driver.logout(req.cookies);
    //   res
    //     .clearCookie("name")
    //     .clearCookie("token")
    //     .json(true);
    // } else {
    //   res
    //     .clearCookie("name")
    //     .clearCookie("token")
    //     .json(false);
    // }

    res
      .clearCookie("name")
      .clearCookie("token")
      .json(true);
  }

}
