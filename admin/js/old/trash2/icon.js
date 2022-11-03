KarmaFieldsAlpha.fields.icon = class extends KarmaFieldsAlpha.fields.field {

  loadFile(file) {
    if (!KarmaFieldsAlpha.fields.icon.files[file]) {
      KarmaFieldsAlpha.fields.icon.files[file] = fetch(KarmaFieldsAlpha.icons_url+"/"+file).then(function(response) {
        return response.text();
      });
    }
    return KarmaFieldsAlpha.fields.icon.files[file];
  }

  build() {
    return {
      class: "karma-icon",
      render: null,
      init: icon => {
        this.loadFile(this.resource.value).then(results => {
          icon.element.innerHTML = results;
        });
      }
    };
  }

};

KarmaFieldsAlpha.fields.icon.files = {};
KarmaFieldsAlpha.fields.icon.create = function(name) {
  const icon = new KarmaFieldsAlpha.fields.icon({
    type: "icon",
    value: name
  });
  return icon.build();
}

// KarmaFieldsAlpha.fields.icon = {};
// KarmaFieldsAlpha.fields.icon.files = {};
//
// KarmaFieldsAlpha.fields.icon.create = function(resource) {
//   let field = KarmaFieldsAlpha.Field(resource);
//   field.load = function(file) {
//     if (!KarmaFieldsAlpha.fields.icon.files[file]) {
//       KarmaFieldsAlpha.fields.icon.files[file] = fetch(KarmaFieldsAlpha.icons_url+"/"+file)).then(function() {
//         return response.json();
//       }).then(function(results) {
//         field.triggerEvent("change", true, field, results);
//         return results;
//       });
//     }
//     return KarmaFieldsAlpha.fields.icon.files[file];
//   }
//   field.setValue = function(value, context) {
//     if (value !== this.value) {
//       field.value = value;
//       field.load(file);
//     }
//   }
// }
// KarmaFieldsAlpha.fields.icon.build = function(field) {
//   return {
//     class: "karma-icon",
//     render: null,
//     init: function(icon) {
//       field.load(this.getValue());
//       field.events.change = function(curentField, results) {
//         icon.innerHTML = results;
//       }
//     }
//     // update: function() {
//     //   if (field.value !== field.originalValue) {
//     //     field.load(field.value);
//     //   }
//     // }
//   };
// }
