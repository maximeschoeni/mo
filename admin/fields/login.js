
KarmaFieldsAlpha.field.login = class extends KarmaFieldsAlpha.field.form {

  // constructor(resource) {
  //
  //   super({
  //     driver: "users",
  //     ...resource
  //   });
  //
  // }

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

      case "regen-files": {

        const form = new KarmaFieldsAlpha.field.layout.medias({
          driver: "files"
        });

        const buffer = new KarmaFieldsAlpha.Buffer("notice");
        const results = await form.query({});
        const files = results.filter(file => {
          return file.filetype === "file" && (file.type === "image/jpeg" || file.type === "image/png");
        });

        for (let i = 0; i < files.length; i++) {

          buffer.set(`Loading... (${i}/${files.length})`, "regen-files");
          await this.render();
          await form.regen(files[i].id);

        }

        buffer.set(`Complete!`, "regen-files");
        await this.render();

        break;

      }

      case "notice": {
        const buffer = new KarmaFieldsAlpha.Buffer("notice");
        console.log(buffer.get(), content.key);
        return buffer.get(content.key);
      }

      case "logout": {
        await KarmaFieldsAlpha.Gateway.post(`logout`);
        await this.render();
        break;
      }

      default:
        return super.request(subject, content, ...path)

    }

  }

  setCookie(name, value, days) {
  	var expires = "";
  	if (days) {
  		var date = new Date();
  		date.setTime(date.getTime() + (days*24*60*60*1000));
  		expires = "; expires=" + date.toUTCString();
  	}
  	document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }

  getCookie(name) {
  	var nameEQ = name + "=";
  	var ca = document.cookie.split(';');
  	for(var i=0;i < ca.length;i++) {
  		var c = ca[i];
  		while (c.charAt(0)==' ') c = c.substring(1,c.length);
  		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  	}
  	return null;
  }

  eraseCookie(name) {
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${location.hostname};Expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  }


  build() {
    return {
      class: "app",
      update: app => {
        this.render = app.render;

        const name = this.getCookie("name");
        const token = this.getCookie("token");

        app.element.classList.toggle("hidden", Boolean(!name || !token));

        if (name && token) {
          app.child = this.createChild({
            type: "layout",
            ...this.resource.layout
          }).build();
        } else {
          location.href = "login.html";
        }

        // app.children = [
        //   // {
        //   //   class: "login",
        //   //   update: node => {
        //   //
        //   //     node.element.classList.toggle("hidden", Boolean(name && token));
        //   //     if (!name || !token) {
        //   //       node.child = this.createChild({
        //   //         type: "group",
        //   //         children: [
        //   //           {
        //   //             type: "input",
        //   //             key: "name",
        //   //             label: "Username"
        //   //           },
        //   //           {
        //   //             type: "input",
        //   //             key: "password",
        //   //             label: "Password",
        //   //             input: {type: "password"}
        //   //           },
        //   //           {
        //   //             type: "separator",
        //   //             style: "height: 1em"
        //   //           },
        //   //           {
        //   //             type: "button",
        //   //             title: "Login",
        //   //             action: "submit"
        //   //           }
        //   //         ]
        //   //       }).build();
        //   //     }
        //   //   }
        //   // },
        //   // {
        //   //   class: "layout",
        //   //   update: layout => {
        //   //     layout.element.classList.toggle("hidden", Boolean(!name || !token));
        //   //     if (name && token) {
        //   //       layout.child = this.createChild({
        //   //         type: "layout",
        //   //         ...this.resource.layout
        //   //       }).build();
        //   //     }
        //   //   }
        //   // }
        // ];
      }
    };
  }

}
