
const {files} = require(ROOT+"/drivers/files.js");
const {items} = require(ROOT+"/drivers/items.js");
const {options} = require(ROOT+"/drivers/options");
const {stories} = require(ROOT+"/drivers/stories");
const {games} = require(ROOT+"/drivers/games");
const {sports} = require(ROOT+"/drivers/sports");
const {countries} = require(ROOT+"/drivers/countries");
const {gameGroups} = require(ROOT+"/drivers/game-groups");
const {torches} = require(ROOT+"/drivers/torches");


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

    case "torches":
      return new torches();

    default:
      console.error("Missing driver: ", driver);

  }

}

exports.drivers = class {

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

}
