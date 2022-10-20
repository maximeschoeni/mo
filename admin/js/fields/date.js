
KarmaFieldsAlpha.field.date = class extends KarmaFieldsAlpha.field.input {

  constructor(resource) {

		super({
      format: "DD/MM/YYYY",
      output_format: "YYYY-MM-DD hh:mm:ss",
      export_format: "DD-MM-YYYY",
      ...resource
    });

	}

  getDefault() {
    let value = "";
    if (this.resource.default === "now") {
      value = moment().format(this.resource.output_format);
    } else if (this.resource.default) {
      const momentDate = moment(this.resource.default, [this.resource.format, this.resource.output_format]);
      if (momentDate.isValid()) {
        value = momentDate.format(this.resource.output_format);
      }
    }
    const key = this.getKey();
    return {[key]: value};
  }

  async exportValue() {

    const key = this.getKey();
    const response = await this.parent.request("get", {}, key);
    let value = KarmaFieldsAlpha.Type.toString(response);

    const momentDate = moment(value);

    if (momentDate.isValid()) {
      value = momentDate.format(this.resource.export_format);
    }

    return value;
  }

  async importValue(value) {

    const key = this.getKey();

    const momentDate = moment(value);

    if (momentDate.isValid()) {
      value = momentDate.format(this.resource.export_format || this.resource.format);
    }

    await this.parent.request("set", {data: value}, key);

  }

  async export(keys) {
    const key = this.getKey();
    const object = {};
    if (!keys.length || keys.includes(key)) {
      object[key] = await this.exportValue();
    }
    return object;
  }

  async import(object) {
    const key = this.getKey();
    if (object[key] !== undefined) {
      await this.importValue(object[key]);
    }
  }

  getMonthDays(monthDate) {
		var days = [];
		var lastDayPrevMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 0);
		var firstDayNextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
		var date = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1 - lastDayPrevMonth.getDay());
		var today = (new Date()).setHours(0, 0, 0, 0);

		while((date.getTime() < firstDayNextMonth.getTime()) || date.getDay() !== 1) {
			var day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			days.push({
				date: day,
        moment: moment(day),
				// sqlDate: this.format(day),
				isDayBefore: day.getTime() == lastDayPrevMonth.getTime(),
				isDayAfter: day.getTime() == firstDayNextMonth.getTime(),
				isOffset: day.getTime() <= lastDayPrevMonth.getTime() || day.getTime() >= firstDayNextMonth.getTime(),
				isToday: day.getTime() === today,
				isWeekend: day.getDay() === 0 || day.getDay() === 6
			});
			date.setDate(date.getDate() + 1);
		}
		return days;
	}

  createCalendar(date) {
    const days = this.getMonthDays(date);
    let rows = [];
    while(days.length) {
      rows.push(days.splice(0, 7));
    }
    return rows;
  }

  buildPopup(value) {
    return {
      class: "date-popup",
      init: popup => {
        // prevent input loosing focus
        popup.element.onmousedown = event => {
          event.preventDefault();
        };
      },
      update: container => {
        const days = this.getMonthDays(this.date);
        let rows = [];
        while(days.length) {
          rows.push(days.splice(0, 7));
        }
        container.child = {
          class: "calendar",
          children: [
            {
              tag: "ul",
              class: "calendar-nav",
              children: [
                {
                  tag: "li",
                  class: "prev-month calendar-arrow",
                  child: {
                    tag: "a",
                    init: a => {
                      a.element.innerHTML = "&lsaquo;";
                      a.element.onclick = event => {
                        this.date.setMonth(this.date.getMonth()-1);
                        container.render();
                      };
                    }
                  }
                },
                {
                  tag: "li",
                  class: "current-month",
                  update: li => {
                    // this.element.textContent = KarmaFieldsAlpha.Calendar.format(field.date, "%fullmonth% yyyy");
                    // this.element.textContent = wp.date.dateI18n(field.date, "F Y");
                    li.element.textContent = moment(this.date).format("MMMM YYYY");
                  }
                },
                {
                  tag: "li",
                  class: "next-month calendar-arrow",
                  child: {
                    tag: "a",
                    init: a => {
                      a.element.innerHTML = "&rsaquo;";
                      a.element.onclick = event => {
                        this.date.setMonth(this.date.getMonth()+1);
                        container.render();
                      };
                    }
                  }
                }
              ]
            },
            {
              tag: "ul",
              class: "calendar-days-title",
              children: rows[0].map(day => {
                return {
                  tag: "li",
                  update: li => {
                    // this.element.textContent = KarmaFieldsAlpha.Calendar.format(day.date, "%d2%");
                    // this.element.textContent = wp.date.dateI18n(day.date, "D").slice(0, 2);
                    li.element.textContent = day.moment.format("dd");
                  }
                };
              })
            },
            {
              class: "calendar-days",
              children: rows.map(row => {
                return {
                  tag: "ul",
                  class: "calendar-days-content",
                  children: row.map(day => {
                    return {
                      tag: "li",
                      children: [{
                        tag: "a",
                        update: a => {
                          // this.element.textContent = KarmaFieldsAlpha.Calendar.format(day.date, "#d");
                          // this.element.textContent = wp.date.dateI18n(day.date, "j");
                          a.element.textContent = day.moment.format("D");
                          a.element.onmouseup = async event => {
                            event.preventDefault();
                            // let sqlDate = KarmaFieldsAlpha.Calendar.format(day.date, field.resource.output_format);
                            // let sqlDate = wp.date.format(day.date, field.resource.output_format || "Y-m-d h:i:s");
                            let sqlDate = day.moment.format(this.resource.output_format);

                            this.date = null;
                            // this.backup();
                            // this.editValue(sqlDate);
                            // await this.setValue(sqlDate);
                            const key = this.getKey();
                            await this.parent.request("set", {data: sqlDate}, key);
                            this.render();
                          }
                        }
                      }],
                      update: li => {
                        // let sqlDate = wp.date.format(day.date, field.resource.output_format || "Y-m-d h:i:s");
                        let sqlDate = day.moment.format(this.resource.output_format);

                        li.element.classList.toggle("active", value === sqlDate);
                        li.element.classList.toggle("offset", day.isOffset);
                        li.element.classList.toggle("today", day.isToday);
                      }
                    };
                  })
                };
              })
            }
          ]
        };
      }
    };
  }

  buildDateContainer() {
    return {
      class: "karma-field karma-field-date",
      init: (container) => {
        container.element.setAttribute('tabindex', '-1');
      },
      update: async (container) => {
        this.render = container.render;

        const key = this.getKey();
        const response = await this.parent.request("get", {}, key);

        let value = KarmaFieldsAlpha.Type.toString(response);

        let mDate = moment(value);

        container.element.classList.add("loading");


        container.children = [
          {
            class: "date-popup-container open-down",
            update: popup => {
              popup.element.classList.toggle("open-left", popup.element.clientWidth - popup.element.offsetLeft < 280);
              popup.children = this.date && !this.resource.readonly && [this.buildPopup(value)] || [];
            }
          },
          {
            tag: "input",
            class: "text-input date karma-field-input",
            init: (input) => {
              input.element.type = "text";
              input.element.id = this.getId();
            },
            update: (input) => {


              if (this.resource.readonly) {
                input.element.readOnly = true;
              } else {
                input.element.onkeyup = async () => {

                  mDate = moment(input.element.value, this.resource.format);
                  if (input.element.value.length === 10 && mDate.isValid()) {
                    this.date = mDate.toDate();
                    var sqlDate = mDate.format(this.resource.output_format || "YYYY-MM-DD hh:mm:ss");
                    // await this.setValue(sqlDate);
                    await this.parent.request("set", {data: sqlDate}, key);
                    this.render();
                  }
                  // input.element.classList.toggle("valid-date", mDate.isValid());


                };
                input.element.onfocus = async () => {
                  if (!value) {
                    this.date = new Date();
                  } else {
                    this.date = mDate.toDate();
                  }
                  this.render();
                };
                input.element.onfocusout = async () => {
                  this.date = null;
                  if (!moment(input.element.value, this.resource.format).isValid()) {
                    await this.parent.request("set", {data: ""}, key);
                  }
                  this.render();
                };
              }


              // container.element.classList.toggle("modified", this.modified);



              if (mDate.isValid()) {
                input.element.value = mDate.format(this.resource.format);
              } else {
                input.element.value = value || "";
              }

              if (!this.date) {
                input.element.blur();
              }
            },
            complete: input => {
              container.element.classList.remove("loading");
            }
          }
        ]
      }
    };
  }

  // buildDateInput() {
  //   console.error("deprecated");
  //   return {
  //     tag: "input",
  //     class: "karma-field text-input date karma-field-input",
  //     init: input => {
  //       input.element.type = "text";
  //       input.element.id = this.getId();
  //       input.element.setAttribute('tabindex', '-1');
  //     },
  //     update: async input => {
  //       input.element.classList.add("loading");
  //
  //       let value = await this.fetchValue();
  //
  //       if (this.resource.readonly) {
  //         input.element.readOnly = true;
  //       } else {
  //         input.element.onkeyup = async () => {
  //           let inputDate = moment(input.element.value, this.format).toDate();
  //           if (inputDate) {
  //             this.date = inputDate;
  //             var sqlDate = moment(this.date).format(this.resource.output_format || "YYYY-MM-DD hh:mm:ss");
  //             await this.editValue(sqlDate);
  //             this.render();
  //           }
  //           input.element.classList.toggle("valid-date", inputDate);
  //         };
  //         input.element.onfocus = async () => {
  //
  //           if (this.isEmpty(value)) {
  //             this.date = new Date();
  //           } else {
  //             this.date = moment(value).toDate();
  //           }
  //           this.render();
  //         };
  //         input.element.onfocusout = async () => {
  //           this.date = null;
  //           if (!moment(input.element.value, this.format).isValid()) {
  //             await this.editValue("");
  //           }
  //           this.render();
  //         };
  //       }
  //
  //       input.element.classList.toggle("modified", this.isModified());
  //
  //       if (this.isEmpty(value)) {
  //         input.element.value = ""
  //       } else {
  //         let moment = moment(value);
  //         if (moment.isValid()) {
  //           input.element.value = moment(value).format(this.format);
  //         } else {
  //           input.element.value = value;
  //         }
  //
  //       }
  //
  //       if (!this.date) {
  //         input.element.blur();
  //       }
  //       input.element.classList.remove("loading");
  //     }
  //   }
  // }


  build() {
    // const field = this;
    // if (this.resource.readonly) {
    //   return this.buildDateInput();
    // } else {
    //   return this.buildDateContainer();
    // }

    return this.buildDateContainer();

  }

}
