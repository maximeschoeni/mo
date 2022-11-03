
KarmaFieldsAlpha.field.header = class extends KarmaFieldsAlpha.field.group {

  constructor(resource) {

    const defaultResource = {
      id: "header",
      display: "flex",
      children: [
        "title",
        "count",
        "pagination",
        "close"
      ]
    };

    super({
      ...defaultResource,
      ...resource
    });

  }

  static title = class extends KarmaFieldsAlpha.field.text {

    constructor(resource) {

      const defaultResource = {
        id: "title",
        tag: "h1",
        style: "flex-grow:1",
        class: "ellipsis",
        value: "Table"
      };

      super({...defaultResource, ...resource});

    }

  }

  static count = {
    id: "count",
    type: "text",
    style: "justify-content:center;white-space: nowrap;",
    value: ["replace", "# elements", "#", ["request", "count", "string"]],
    dynamic: true
  }

  static options = {
    id: "options",
    type: "button",
    title: "Options",
    action: "toggle-options"
  }

  static close = {
    id: "close",
    type: "button",
    text: "×",
    title: "Close Table",
    action: "close"
  }

  static pagination = class extends KarmaFieldsAlpha.field.group {

    constructor(resource) {

      const defaultResource = {
        id: "pagination",
        type: "group",
        display: "flex",
        style: "flex: 0 1 auto;min-width:0",
        hidden: ["==", ["request", "numpage", "number"], 1],
        children: [
          "firstpage",
          "prevpage",
          "currentpage",
          "nextpage",
          "lastpage"
        ]
      }

      super({
        ...defaultResource,
        ...resource
      });
    }

    static firstpage = {
      id: "firstpage",
  		type: "button",
      action: "firstpage",
      title: "First Page",
      text: "«",
      disabled: ["==", ["request", "page", "number"], 1]
    }

    static prevpage = {
      id: "prevpage",
  		type: "button",
      action: "prevpage",
      title: "Previous Page",
      text: "‹",
      disabled: ["==", ["request", "page", "number"], 1]
    }

    static currentpage = {
      id: "currentpage",
  		type: "text",
      style: "min-width: 4em;text-align: right;",
      value: ["replace", "# / #", "#", ["request", "page", "string"], ["request", "numpage", "string"]]
    }

  	static nextpage = {
      id: "nextpage",
  		type: "button",
      action: "nextpage",
      title: "Next Page",
      text: "›",
      disabled: ["request", "lastpage", "boolean"]
    }

  	static lastpage = {
      id: "lastpage",
  		type: "button",
      action: "tolastpage",
      title: "Last Page",
      text: "»",
      disabled: ["request", "lastpage", "boolean"]
    }

  }

}
