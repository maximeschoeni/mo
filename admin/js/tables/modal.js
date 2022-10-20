
KarmaFieldsAlpha.field.layout.modal = class extends KarmaFieldsAlpha.field.container {

  static header = class extends KarmaFieldsAlpha.field.group {

    constructor(resource) {

      const defaultResource = {
        id: "header",
        display: "flex",
        children: [
          "title",
          "separator",
          "prev",
          "next",
          "close"
        ]
      };


      super({...defaultResource, ...resource});
    }

    static title = class extends KarmaFieldsAlpha.field.text {

      constructor(resource, ...args) {
        const defaultResource = {
          id: "title",
          tag: "h1",
          style: "flex-grow:1",
          class: "ellipsis",
          value: "Single"
        };

        super({...defaultResource, ...resource});
      }

    }

    static prev = {
      id: "prev",
      type: "button",
      action: "prev",
      title: "Previous Item",
      text: "‹"
    }

    static next = {
      id: "next",
      type: "button",
      action: "next",
      title: "Next Item",
      text: "›"
    }

    static close = {
      id: "close",
      type: "button",
      title: "Close Modal",
      text: "×",
      action: "close"
    }

  }

}
