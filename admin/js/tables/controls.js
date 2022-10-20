
KarmaFieldsAlpha.field.layout.controls = class extends KarmaFieldsAlpha.field.container {

  constructor(resource) {

    super({
      display: "flex",
      children: [
        "reload",
        "save",
        "add",
        "delete",
        "separator",
        "undo",
        "redo"
      ],
      ...resource
    });

  }



  static save = {
    id: "save",
		type: "button",
    action: "save",
    title: "Save",
    // disabled: "!modified",
    // disabled: ["!", ["request", "modified", "boolean"]],
    disabled: ["!", ["modified"]],
    primary: true
    // test: ["modified"]
  }

	static add = {
    id: "add",
		type: "button",
    action: "add",
    title: "Add"
  }

	static delete = {
    id: "delete",
		type: "button",
    action: "delete",
    title: "Delete",
    // disabled: "!selection"
    disabled: ["!", ["request", "selection", "string"]]
  }

	static undo = {
    id: "undo",
		type: "button",
    action: "undo",
    dashicon: "undo",
    // disabled: "!undo"
    disabled: ["!", ["request", "has-undo", "boolean"]]
  }

	static redo = {
    id: "redo",
		type: "button",
    action: "redo",
    dashicon: "redo",
    // disabled: "!redo"
    disabled: ["!", ["request", "has-redo", "boolean"]]
  }

  static separator = {
    id: "separator",
		type: "separator"
  }

  static reload = {
    id: "reload",
		type: "button",
    action: "reload",
    title: "Reload"
  }

  static insert = {
    id: "insert",
    type: "button",
    action: "insert",
    primary: true,
    title: "Insert",
    disabled: ["!", ["request", "selection", "object"]],
    hidden: ["empty", ["request", "pile", "array"]]
  }

}
