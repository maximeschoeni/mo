if (!window.KarmaFieldsAlpha) {
	K = KarmaFieldsAlpha = {};

}
// KarmaFieldsAlpha.customfields = {};

KarmaFieldsAlpha.fields = {};
// KarmaFieldsAlpha.fieldsOptions = {};

// KarmaFieldsAlpha.filters = {};
// KarmaFieldsAlpha.tables = {};
// KarmaFieldsAlpha.managers = {};
// KarmaFieldsAlpha.selectors = {};
// KarmaFieldsAlpha.utils = {};
// KarmaFieldsAlpha.includes = {};
// KarmaFieldsAlpha.events = {};
// KarmaFieldsAlpha.assets = {};
// KarmaFieldsAlpha.fetchCache = {};
// KarmaFieldsAlpha.Loading = function(){}; // create loading instance
// KarmaFieldsAlpha.wm = {};
//
// KarmaFieldsAlpha.storage = { //Window.sessionStorage || {
// 	values: {},
// 	getItem: function(key) {
// 		return this.values[key];
// 	},
// 	setItem: function(key, value) {
// 		this.values[key] = value;
// 	},
// 	removeItem: function(key) {
// 		this.values[key] = undefined;
// 	}
// };
//
// KarmaFieldsAlpha.getAsset = function(url) {
// 	if (!KarmaFieldsAlpha.assets[url]) {
// 		KarmaFieldsAlpha.assets[url] = fetch(url).then(function(response) {
// 			return response.text();
// 		});
// 	}
// 	return KarmaFieldsAlpha.assets[url];
// }

// KarmaFieldsAlpha.getIcon = function(url) {
// 	KarmaFieldsAlpha.getAsset(url).then(function(result) {
// 		requestAnimationFrame(function() {
// 			element.innerHTML = result;
// 		});
// 	})
// };


// window.addEventListener("keydown", function(event) {
// 	if (event.metaKey && event.key === "c" && KarmaFieldsAlpha.events.onCopy) {
// 		KarmaFieldsAlpha.events.onCopy(event);
// 	}
// 	if (event.metaKey && event.key === "v" && KarmaFieldsAlpha.events.onPast) {
// 		KarmaFieldsAlpha.events.onPast(event);
// 	}
// 	if (event.metaKey && event.key === "a" && KarmaFieldsAlpha.events.onSelectAll) {
// 		KarmaFieldsAlpha.events.onSelectAll(event);
// 	}
// 	if (event.metaKey && event.key === "s" && KarmaFieldsAlpha.events.onSave) {
// 		KarmaFieldsAlpha.events.onSave(event);
// 	}
// 	if (event.metaKey && !event.shiftKey && event.key === "z" && KarmaFieldsAlpha.events.onUndo) {
// 		KarmaFieldsAlpha.events.onUndo(event);
// 	}
// 	if (event.metaKey && event.shiftKey && event.key === "z" && KarmaFieldsAlpha.events.onRedo) {
// 		KarmaFieldsAlpha.events.onRedo(event);
// 	}
// 	if (event.key === "Backspace" && KarmaFieldsAlpha.events.onDelete) {
// 		KarmaFieldsAlpha.events.onDelete(event);
// 	}
// 	if (event.key === "+" && KarmaFieldsAlpha.events.onAdd) {
// 		KarmaFieldsAlpha.events.onAdd(event);
// 	}
//
// 	if (event.key === "ArrowUp" && KarmaFieldsAlpha.events.onArrowUp) {
// 		KarmaFieldsAlpha.events.onArrowUp(event);
// 	}
// 	if (event.key === "ArrowDown" && KarmaFieldsAlpha.events.onArrowDown) {
// 		KarmaFieldsAlpha.events.onArrowDown(event);
// 	}
// 	if (event.key === "ArrowLeft" && KarmaFieldsAlpha.events.onArrowLeft) {
// 		KarmaFieldsAlpha.events.onArrowLeft(event);
// 	}
// 	if (event.key === "ArrowRight" && KarmaFieldsAlpha.events.onArrowRight) {
// 		KarmaFieldsAlpha.events.onArrowRight(event);
// 	}
//
// 	KarmaFieldsAlpha.events.unload
// 	if (event.key === "Backspace" && KarmaFieldsAlpha.events.onUnload) {
// 		KarmaFieldsAlpha.events.onDelete(event);
// 	}
//
//
// 	// console.log(event.key);
// });

// document.addEventListener("mouseup", function() {
//   if (KarmaFieldsAlpha.events.onClick) {
//     KarmaFieldsAlpha.events.onClick();
//   }
// });
//
// window.addEventListener("beforeunload", function() {
// 	if (KarmaFieldsAlpha.events.onUnload) {
// 		KarmaFieldsAlpha.events.onUnload();
// 	}
// });




//
// KarmaFieldsAlpha.attachmentPromises = {};
// KarmaFieldsAlpha.getImageSrc = function(id, callback) {
// 	if (!KarmaFieldsAlpha.attachmentPromises[id]) {
// 		KarmaFieldsAlpha.attachmentPromises[id] = new Promise(function(resolve, reject) {
// 			Ajax.get(KarmaFieldsAlpha.ajax_url, {
// 				action: "karma_multimedia_get_image_src",
// 				id: id
// 			}, function(results) {
// 				resolve(results);
// 			});
// 		});
// 	}
// 	if (callback) {
// 		KarmaFieldsAlpha.attachmentPromises[id].then(callback);
// 	}
// 	return KarmaFieldsAlpha.attachmentPromises[id];
// }


// KarmaFieldsAlpha.save = function(post, data) {
// 	return fetch(KarmaFieldsAlpha.rest+"/update/post/"+post.id, {
// 		method: "post",
// 		headers: {"Content-Type": "application/json"},
// 		body: JSON.stringify(data),
// 		mode: 'same-origin'
// 	}).then(function(result) {
// 		return result.json();
// 	});
// };
// KarmaFieldsAlpha.get = function(key, postURI) {
// 	return fetch(KarmaFieldsAlpha.cache+"/"+postURI+"/"+key);
// };




//
// KarmaFieldsAlpha.terms = {
// 	promises: {},
// 	getPromise: function(taxonomy) {
// 		if (!this.promises[taxonomy]) {
// 			this.promises[taxonomy] = new Promise(function(resolve, reject) {
// 				Ajax.get(KarmaFieldsAlpha.ajax_url, {
// 					action: "karma_field_get_terms",
// 					taxonomy: taxonomy
// 				}, function(results) {
// 					if (results.terms) {
// 						resolve(results.terms);
// 					} else {
// 						reject(results.error);
// 					}
// 				});
// 			});
// 		}
// 		return this.promises[taxonomy];
// 	}
// };


// KarmaFieldsAlpha.createImageUploader = function() {
// 	var manager = {
// 		addFrame: null,
// 		imageId: null,
// 		open: function () {
// 			if (!this.addFrame) {
// 				var args = {
// 					title: "Select file",
// 					button: {
// 						text: "Use this file"
// 					},
// 					library: {
//             type: manager.mimeType || null //'application/font-woff'
//         	},
// 					multiple: false
// 				};
// 				// if (manager.mimeType) {
// 				// 	args["library"] = {
//         //     type: manager.mimeType
//         // 	}
// 				// }
// 				this.addFrame = wp.media(args);
// 				this.addFrame.on("select", function() {
// 					if (manager.onSelect) {
// 						manager.onSelect(manager.addFrame.state().get("selection").toJSON().map(function(attachment) {
// 							return attachment;
// 						}));
// 					}
// 				});
// 				this.addFrame.on("open", function() {
// 					var selection = manager.addFrame.state().get("selection");
// 					if (manager.imageId) {
// 						selection.add(wp.media.attachment(manager.imageId));
// 					}
// 				});
// 			}
// 			this.addFrame.open();
// 		}
// 	}
// 	return manager;
// }
// KarmaFieldsAlpha.createGalleryUploader = function() {
// 	var manager = {
// 		frame: null,
// 		imageIds: null,
// 		mimeTypes: ["image"],
// 		open: function () {
// 			if (!this.frame) {
// 				// enable video
// 				wp.media.controller.GalleryAdd = wp.media.controller.GalleryAdd.extend({
// 					initialize: function() {
// 						if ( ! this.get('library') ) {
// 							this.set( 'library', wp.media.query(manager.mimeTypes ? { type: manager.mimeTypes } : null) );
// 						}
// 						wp.media.controller.Library.prototype.initialize.apply( this, arguments );
// 					}
// 				});
// 				wp.media.controller.GalleryEdit = wp.media.controller.GalleryEdit.extend({
// 					activate: function() {
// 						var library = this.get('library');
// 						if (manager.mimeTypes) {
// 							library.props.set( 'type', manager.mimeTypes );
// 						}
// 						this.get('library').observe( wp.Uploader.queue );
// 						this.frame.on( 'content:render:browse', this.gallerySettings, this );
// 						wp.media.controller.Library.prototype.activate.apply( this, arguments );
// 					}
// 				});
// 				wp.media.view.Settings.Gallery = wp.media.view.Settings.Gallery.extend({
// 					render: function() {
// 						return this;
// 					}
// 				});
// 				if (this.imageIds && this.imageIds.length) {
// 					this.frame = wp.media.gallery.edit('[gallery ids="'+this.imageIds.join(",")+'"]');
// 				} else {
// 					this.frame = wp.media({
// 						frame: "post",
// 						state: "gallery-edit",
// 						type: this.mimeTypes,
// 						editing: true,
// 						multiple: true  // Set to true to allow multiple files to be selected
// 					});
// 				}
// 				this.frame.on("update",function(items) {
// 					var attachments = items.map(function(item){
// 						return item.attributes;
// 					});
// 					manager.imageIds = attachments.map(function(attachment) {
// 						return attachment.id;
// 					});
// 					if (manager.onChange) {
// 						manager.onChange(attachments);
// 					}
// 				});
// 			}
// 			this.frame.open();
// 		}
// 	}
// 	return manager;
// }
