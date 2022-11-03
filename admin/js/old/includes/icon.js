KarmaFieldsAlpha.includes.icon = function(args) {
  return {
    class: "karma-icon",
    render: null,
    update: function(icon) {
      if (this.element._src !== args.file) {
        KarmaFieldsAlpha.getAsset(args.file).then(function(result) {
          icon.element.innerHTML = result;
        });
        this.element._src = args.file;
      }
    }
  };
}
