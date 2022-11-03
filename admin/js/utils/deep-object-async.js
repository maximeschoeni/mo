
KarmaFieldsAlpha.DeepObjectAsync = class extends KarmaFieldsAlpha.DeepObject {

  static async some(object, callback, ...path) {
    // if (object && typeof object === "object" && !Array.isArray(object)) {
    if (object && object.constructor === Object) {
      for (let i in object) {
        if (await this.some(object[i], callback, ...path, i)) {
          return true;
        }
      }
    } else if (object !== undefined && await callback(object, ...path)) {
      return true;
    }
    return false;
  }

  static async every(object, callback, ...path) {
    if (object && object.constructor === Object) {
      for (let i in object) {
        if (!await this.every(object[i], callback, ...path, i)) {
          return false;
        }
      }
    } else if (object === undefined || !await callback(object, ...path)) {
      return false;
    }
    return true;
  }



}
