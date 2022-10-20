const {files} = require(ROOT+"/admin/drivers/files");
const {items} = require(ROOT+"/admin/drivers/items");
const {options} = require(ROOT+"/admin/drivers/options");
const {stories} = require(ROOT+"/admin/drivers/stories");
const {games} = require(ROOT+"/admin/drivers/games");
const {sports} = require(ROOT+"/admin/drivers/sports");
const {countries} = require(ROOT+"/admin/drivers/countries");
const {gameGroups} = require(ROOT+"/admin/drivers/game-groups");


// module.exports = {
//   files: files,
//   items: items,
//   options: options
// };

function getDriver(driver) {

  switch (driver) {

    case "files":
      return new files();

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

    const driver = getDriver(req.params.driver);
    await driver.update(req.body.data, req.params.id);
    res.json(true);

  }

  static async add(req, res) {

    const driver = getDriver(req.params.driver);
    const id = await driver.add(req.body.data);
    res.json(id);

  }

  static async upload(req, res) {

    const driver = new files();
    const id = await driver.upload(req.files.file, req.body);
    res.json(id);

  }

  static async regen(req, res) {
    const driver = new files();
    await driver.regen(req.params.id);
    res.json(true);

  }

}
