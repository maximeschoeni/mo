// https://github.com/tinymce/tinymce-dist/blob/master/tinymce.js

// /Applications/MAMP/htdocs/wordpress/wp-includes/js/tinymce/plugins/link/plugin.min.js
// /Applications/MAMP/htdocs/wordpress/wp-admin/js/editor.js


// https://make.wordpress.org/core/2017/05/20/editor-api-changes-in-4-8/

KarmaFieldsAlpha.fields.editor = class extends KarmaFieldsAlpha.fields.field {

	build() {

		return {
			class: "editor-container",
			children: [
				{
					tag: "textarea",
					init: textarea => {
						textarea.element.id = "xxx";
						textarea.element.value = "Hjlzljzl";
					}
				}
			],


			init: node => {
				node.element.id = this.getId();
				// this.element.editable = true;

				// tinyMCE.init({
				// 	target: node.element,
				// 	hidden_input: false,
				// 	// inline: true
				// 	menubar: false,
				// 	toolbar: 'styleselect | bold italic | undo redo',
				// 	// content_css: 'wordpress',
				// 	// contextmenu: false,
				// 	// toolbar: true,
				// 	skin: false,
				// 	plugins: ["link"]
				//
				//
				// }).then(editors => {
				//
				//
				// });




			},
			complete: node => {
				// setTimeout(() => {
				// 	// wp.editor.getDefaultSettings = () => {
				// 	// 	return {
			  //   //     tinymce: {
			  //   //       wpautop: true,
			  //   //       plugins : 'charmap colorpicker compat3x directionality fullscreen hr image lists media paste tabfocus textcolor wordpress wpautoresize wpdialogs wpeditimage wpemoji wpgallery wplink wptextpattern wpview',
			  //   //       toolbar1: 'bold italic underline strikethrough | bullist numlist | blockquote hr wp_more | alignleft aligncenter alignright | link unlink | fullscreen | wp_adv',
			  //   //       toolbar2: 'formatselect alignjustify forecolor | pastetext removeformat charmap | outdent indent | undo redo | wp_help'
			  //   //     },
			  //   //     quicktags: true,
			  //   //     mediaButtons: true,
			  //   //   }
				// 	// };
				// 	// wp.oldEditor.remove("content");
				// 	console.log(window.wp.editor.getDefaultSettings);
				//
				// 	wp.editor.remove("textarea_xxx");
				//
					wp.editor.initialize(
			      "xxx",
						{
							tinymce: {

							}
						}
			      // {
			      //   tinymce: {
			      //     wpautop: true,
			      //     plugins : 'charmap colorpicker compat3x directionality fullscreen hr image lists media paste tabfocus textcolor wordpress wpautoresize wpdialogs wpeditimage wpemoji wpgallery wplink wptextpattern wpview',
			      //     toolbar1: 'bold italic underline strikethrough | bullist numlist | blockquote hr wp_more | alignleft aligncenter alignright | link unlink | fullscreen | wp_adv',
			      //     toolbar2: 'formatselect alignjustify forecolor | pastetext removeformat charmap | outdent indent | undo redo | wp_help'
			      //   },
			      //   quicktags: true,
			      //   mediaButtons: true,
			      // }
			    );
					this.complete = null;
				//
				// }, 2000);

			}
		};

	}
}
