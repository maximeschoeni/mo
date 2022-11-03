
KarmaFieldsAlpha.field.collection.modal = class extends KarmaFieldsAlpha.field {

  async request(subject, content, ...path) {

    switch (subject) {

      case "close": {
        return this.parent.request("unselect");
      }

      case "state": {

        const ids = await this.parent.request("selectedIds");

        if (ids.length === 1) {

          return this.parent.request("state", {}, ids[0], ...path);

        } else if (ids.length > 1) {

          const response = {
            values: [],
            multi: true
          };

          for (id of ids) {

            const state = await this.parent.request("state", {}, id, ...path);

            response.values.push(state.value);

            if (response.value === undefined || KarmaFieldsAlpha.DeepObject.equal(response.value, state.value)) {

              response.value = state.value;

            } else {

              response.value = null;

            }

            response.alike = response.value !== null;
            response.modified = Boolean(response.modified || state.modified);

          }

          return response;

        } else {

          return {};

        }

      }

      default: {
        const [id] = await this.parent.request("selectedIds");

        if (id) {

          path = [id, ...path];

        }

        return this.parent.request(subject, content, ...path);
      }

    }

  }

}
