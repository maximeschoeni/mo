

KarmaFieldsAlpha.Clipboard = class {

  // constructor() {
  //
  //   this.ta = document.createElement("textarea");
  //
  //   // document.body.appendChild(this.ta);
  //   this.constructor.container.appendChild(this.ta);
  //   // this.ta.className = "karma-fields-ta";
  //   // this.ta.style = "position:fixed;bottom:0;left:200px;z-index:999999999";
  //
  //   this.ta.oninput = async event => {
  //
  //     switch (event.inputType) {
  //
  //       case "deleteByCut":
  //       case "deleteContentBackward":
  //       case "deleteContentForward":
  //       case "deleteContent":
  //       case "insertFromPaste": {
  //
  //         if (this.onInput) {
  //           const dataArray = this.prepare(this.ta.value);
  //           this.onInput(dataArray)
  //         }
  //
  //         break;
  //       }
  //
  //       default: {
  //         break;
  //       }
  //
  //     }
  //
  //   }
  //
  // }
  //
  // setData(dataArray) {
  //   const value = this.constructor.unparse(dataArray);
  //   this.set(value);
  // }
  //
  // setJson(data) {
  //   const dataArray = this.constructor.toDataArray(data);
  //   this.setData(dataArray);
  // }
  //
  // set(value) {
  //   this.ta.value = value;
  //   this.ta.focus();
  //   this.ta.select();
  // }
  //
  // focus(value) {
  //   this.ta.focus();
  //   this.ta.select();
  // }
  //
  // prepare(string) {
  //   return this.constructor.parse(string);
  // }
  //
  //
  // static build() {
  //
  //   this.container = document.createElement("div");
  //   document.body.appendChild(this.container);
  //   this.container.className = "karma-fields-clipboard";
  //   // this.container.style = "position:fixed;bottom:100%;left:0;z-index:999999999";
  //   this.container.style = "position:fixed;top:0;left:0;z-index:999999999";
  // }

  static parse(string) {
    return Papa.parse(string, {
      delimiter: '\t'
    }).data;
  }

  static unparse(data) {
    return Papa.unparse(data, {
      delimiter: "\t",
      newline: "\n"
    });
  }

  static toJson(dataArray) {
    if (dataArray && dataArray.length) {
      const header = dataArray.shift();
      return dataArray.map(row => Object.fromEntries(header.map((key, index) => [key, row[index]])));
    }
    return [];
  }

  static toDataArray(data, headers = true) {
    if (data && data.length) {
      const keys = Object.keys(data[0]);
      const array = data.map(row => keys.map(key => row[key]))
      if (headers) {
        return [keys, ...array];
      } else {
        return array;
      }

    }
    return [];
  }

}

// KarmaFieldsAlpha.Clipboard.build();
