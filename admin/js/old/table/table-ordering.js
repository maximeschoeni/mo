
// KarmaFieldsAlpha.fields.tableOrdering = class TableOrdering extends KarmaFieldsAlpha.fields.container {
//
//   // constructor(resource, domain, parent) {
//   //   super(resource, domain, parent);
//   //
//   //
//   //
//   //   // this.addChildren(this.orderby, this.order);
//   //
//   // }
//
//   initField() {
//
//     this.orderby = this.createChild({
//       type: "field",
//       key: "orderby",
//       value: this.resource.orderby
//     });
//
//     this.order = this.createChild({
//       type: "field",
//       key: "order",
//       value: this.getDefaultOrder() || "asc"
//     });
//
// 	}
//
//   // getValue() {
//   //   return {
//   //     order: this.order.getValue(),
//   //     orderby: this.orderby.getValue()
//   //   };
//   // }
//   //
//   // setValue(value, context) {
//   //   this.orderby.setValue(value.orderby || this.resource.orderby || "", context);
//   //   this.order.setValue(value.order || this.getDefaultOrder(), context);
//   // }
//
//   getDefaultOrder() {
//     let column = this.resource.orderby && this.resource.columns.find(column => {
//       return column.field && column.field.key === this.resource.orderby;
//     });
//     return column && column.field.order || "asc";
//   }
//
//   reorder(column) {
//     if (this.orderby.getValue() === column.field.key) {
//       this.order.setValue(this.order.getValue() === "asc" ? "desc" : "asc");
//     } else {
//       this.order.setValue(column.order || "asc");
//       this.orderby.setValue(column.field.key);
//     }
//     // return this.triggerEvent("change", true).then(function() {
//     //   field.triggerEvent("render");
//     // });
//   }
//
//   build(column) {
//     const field = this;
//
//     return {
//       tag: "a",
//       class: "header-cell-order",
//       child: {
//         class: "karma-field-spinner"
//       },
//       update: a => {
//         const orderby = field.orderby.getValue();
//         const order = field.order.getValue();
//         a.element.onclick = async event => {
//           a.element.classList.add("loading");
//
//           this.reorder(column);
//           this.bubble("change");
//
//           .then(function() {
//             a.element.classList.remove("loading");
//           });
//         };
//         this.element.classList.toggle("asc", orderby === column.field.key && order === "asc");
//         this.element.classList.toggle("desc", orderby === column.field.key && order === "desc");
//       }
//     };
//   }
// }
