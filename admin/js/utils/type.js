
KarmaFieldsAlpha.Type = class {

  static getType(value) {
    if (Array.isArray(value)) {
      return "array";
    } else if (value === null) {
      return "null";
    } else {
      return typeof value;
    }
  }

  static toArray(value) {
    if (value === undefined || value === null) {
      value = [];
    } else if (!Array.isArray(value)) {
      value = [value];
    }
    return value;
  }


  static toString(value) {
    if (Array.isArray(value)) {
      value = value[0];
    }
    if (value === undefined || value === null) {
      value = "";
    }
    return value.toString();
  }

  static toNumber(value) {
    if (Array.isArray(value)) {
      value = value[0];
    }
    if (isNaN(value)) {
      value = 0;
    }
    return Number(value);
  }

  static toBoolean(value) {
    if (Array.isArray(value)) {
      value = value[0];
    }
    return Boolean(value);
  }

  static toObject(value) {
    if (Array.isArray(value)) {
      value = value[0];
    }
    return value || {};
  }


  static convert(value, type) {

    switch (type) {
      case "array":
        return this.toArray(value);

      case "string":
        return this.toString(value);

      case "number":
        return this.toNumber(value);

      case "boolean":
        return this.toBoolean(value);

      case "object":
        return this.toObject(value);

    }

    return value;

  }

}
