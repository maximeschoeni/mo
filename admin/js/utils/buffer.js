
KarmaFieldsAlpha.buffer = {};

KarmaFieldsAlpha.Buffer = class {

  // static empty(...path) {
  //   KarmaFieldsAlpha.DeepObject.remove(KarmaFieldsAlpha.buffer, ...path);
  // }

  constructor(...path) {
    this.path = path;
  }

  getObject() {
    // return KarmaFieldsAlpha.DeepObject.get(KarmaFieldsAlpha.buffer, ...this.path) || {};
    return KarmaFieldsAlpha.buffer || {};
  }

  setObject(object) {
    // return KarmaFieldsAlpha.DeepObject.assign(KarmaFieldsAlpha.buffer, object, ...this.path);
    KarmaFieldsAlpha.buffer = object;
  }

  empty() {

    // this.setObject({});
    this.remove();
    // KarmaFieldsAlpha.DeepObject.remove(KarmaFieldsAlpha.buffer, ...this.path);
  }

  get(...path) {
    let object = this.getObject();
    if (this.path.length || path.length) {
      return KarmaFieldsAlpha.DeepObject.get(object, ...this.path, ...path);
    } else {
      return object;
    }

    // return KarmaFieldsAlpha.DeepObject.get(this.getObject(), ...path);
  }

  set(value, ...path) {
    let object = this.getObject();
    if (this.path.length || path.length) {
      KarmaFieldsAlpha.DeepObject.assign(object, value, ...this.path, ...path);
    } else {
      object = value;
    }
    this.setObject(object);
  }

  remove(...path) {
    // let object = this.getObject();
    // KarmaFieldsAlpha.DeepObject.remove(object, ...path);
    // this.setObject(object);

    let object;
    if (this.path.length || path.length) {
      object = this.getObject();
      KarmaFieldsAlpha.DeepObject.remove(object, ...this.path, ...path);
    } else {
      object = {};
    }
    this.setObject(object);
  }

  has(...path) {
    let object = this.getObject();
    if (this.path.length || path.length) {
      return KarmaFieldsAlpha.DeepObject.has(object, ...this.path, ...path);
    } else {
      return true;
    }
  }

  merge(value, ...path) {
    const object = this.get(...path) || {};
    KarmaFieldsAlpha.DeepObject.merge(object, value);
    this.set(object, ...path);
  }

  clean(...path) {
    let object = this.get(...path) || {};
    object = KarmaFieldsAlpha.DeepObject.filter(object, item => item !== undefined && item !== null, ...path);
    this.set(object, ...path);
  }

  // setAndBackup(value, ...path) {
  //   KarmaFieldsAlpha.History.backup(value, this.get(...path), false, ...this.path, ...path);
  //   this.set(value, ...path);
  // }

  backup(value = null, ...path) {
    KarmaFieldsAlpha.History.backup(value, this.get(...path), false, ...this.path, ...path);
  }

  change(value, prevValue, ...path) {

    if (!prevValue) {

      prevValue = this.get(...path);

    }

    KarmaFieldsAlpha.History.backup(value, prevValue, false, ...this.path, ...path);

    if (value === null) {
      this.remove(...path);
    } else {
      this.set(value, ...path);
    }

  }

}
