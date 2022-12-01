
KarmaFieldsAlpha.field.layout = class extends KarmaFieldsAlpha.field.layout {

  async request(subject, content, ...path) {

    switch (subject) {

      case "switch-language": {

        const language = KarmaFieldsAlpha.Type.toString(content);
        const current = KarmaFieldsAlpha.Nav.get("language");

        if (language !== current) {

          KarmaFieldsAlpha.History.save();
          KarmaFieldsAlpha.Nav.change(language, current, "language");

        }

        await this.render();
        break;
      }

      case "language": {
        return KarmaFieldsAlpha.Nav.get("language") || "fr";
      }

      case "regen-all": {

        console.log("regen-all");
        break;

      }

      default:
        return super.request(subject, content, ...path);

    }

  }

}
