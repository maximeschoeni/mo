KarmaFieldsAlpha.Transfer = {}
KarmaFieldsAlpha.Transfer.cache = {};
KarmaFieldsAlpha.Transfer.createQuery = function(path, params) {
	var file = path.join("/");
	return this.addQueryArgs(file, params);
}
KarmaFieldsAlpha.Transfer.addQueryArgs = function(file, params) {
	if (params) {
		var serial = this.serialize(params);
		if (serial) {
			file += "?"+serial;
		}
	}
	return file;
}
KarmaFieldsAlpha.Transfer.serialize = function(object) {
	var params = [];
	object = this.flaten(object);
	for (var key in object) {
		if (object[key]) {
			params.push(encodeURI(key) + "=" + encodeURIComponent(object[key]));
		}
	}
	return params.join("&");
}
KarmaFieldsAlpha.Transfer.flaten = function(object, parentKey, results) {
	results = results || {};
	for (var key in object) {
		if (object[key]) {
			var path = key;
			if (parentKey) {
				path = parentKey+"/"+key;
			}
			if (typeof object[key] === "object") {
				this.flaten(object[key], path, results);
			} else {
				results[path] = object[key];
			}
		}
	}
	return results;
}
// KarmaFieldsAlpha.Transfer.clean = function(object) {
// 	var params = {};
// 	for (var key in object) {
// 		if (object[key]) {
// 			params[key] = object[key];
// 		}
// 	}
// 	return params;
// }
// KarmaFieldsAlpha.Transfer.query = function(driver, params) {
// 	// var file = KarmaFieldsAlpha.restURL+"/query/"+driver;
// 	// var serial = this.serialize(params);
// 	// if (serial) {
// 	// 	file += "?"+serial;
// 	// }
//
// 	var file = this.createQuery([KarmaFieldsAlpha.restURL, "query", driver], params);
//
// 	// var file = KarmaFieldsAlpha.restURL+"/query/"+driver+"?p="+JSON.stringify(params);
// 	// console.log(file);
// 	return fetch(file, {
// 		cache: "default", // force-cache
// 		headers: {
//       'Content-Type': 'application/json',
//       'X-WP-Nonce': KarmaFieldsAlpha.nonce //wpApiSettings.nonce
//     },
// 	}).then(function(response) {
// 		return response.json();
// 	});
// };
KarmaFieldsAlpha.Transfer.update = function(driver, params) {
	var file = KarmaFieldsAlpha.restURL+"/update/"+driver;

	// var params = this.clean(params);
	return fetch(file, {
		method: "post",
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': KarmaFieldsAlpha.nonce //wpApiSettings.nonce
		},
		body: JSON.stringify(params),
		mode: "same-origin"
	}).then(function(response) {
		return response.json();
	});
};
KarmaFieldsAlpha.Transfer.add = function(driver, params) {
	var file = KarmaFieldsAlpha.restURL+"/add/"+driver
	return fetch(file, {
		method: "post",
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': KarmaFieldsAlpha.nonce //wpApiSettings.nonce
		},
		body: JSON.stringify(params),
		mode: "same-origin"
	}).then(function(response) {
		return response.json();
	});
};
KarmaFieldsAlpha.Transfer.get = function(driver, path, cache) {
	var file;
	if (cache && KarmaFieldsAlpha.cacheURL) {
		file = [KarmaFieldsAlpha.cacheURL, driver, path, cache].join("/");
	} else {
		file = [KarmaFieldsAlpha.restURL, "get", driver, path].join("/");
	}
	return fetch(file, {
		cache: "reload",
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': KarmaFieldsAlpha.nonce //wpApiSettings.nonce
		},
	}).then(function(response) {
		if (!cache || cache.slice(-5) === ".json") {
			return response.json();
		} else {
			return response.text();
		}
	});

	// if (!this.cache[file]) {
	// 	this.cache[file] = fetch(file, {
	// 		cache: "reload"
	// 	}).then(function(response) {
	// 		if (!cache || cache.slice(-5) === ".json") {
	// 			return response.json();
	// 		} else {
	// 			return response.text();
	// 		}
	// 	});
	// 	return this.cache[file];
	// }
};
KarmaFieldsAlpha.Transfer.fetch = function(driver, request, params) {
	let file = this.addQueryArgs(KarmaFieldsAlpha.restURL+"/fetch/"+driver+"/"+request, params);

	// cache unactivated !!
	// this.cache[file] = null;

	if (!this.cache[file]) {
		this.cache[file] = fetch(file, {
			cache: "default", // force-cache
			headers: {
	      'Content-Type': 'application/json',
	      'X-WP-Nonce': KarmaFieldsAlpha.nonce //wpApiSettings.nonce
	    },
		}).then(function(response) {
			return response.json();
		});
	}

	return this.cache[file];
};

KarmaFieldsAlpha.Transfer.queryJson = function(url) {
	return KarmaFieldsAlpha.assets[url] = fetch(url, {
		cache: "no-store" // force-cache
	}).then(function(response) {
		return response.json();
	});
}
// KarmaFieldsAlpha.Transfer.autoSave = function(driver, params) {
// 	var file = KarmaFieldsAlpha.restURL+"/autosave/"+driver;
//
// 	// console.log(params.output);
// 	// var params = this.clean(params);
// 	return fetch(file, {
// 		method: "post",
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'X-WP-Nonce': KarmaFieldsAlpha.nonce //wpApiSettings.nonce
// 		},
// 		body: JSON.stringify(params),
// 		mode: "same-origin"
// 	}).then(function(response) {
// 		return response.json();
// 	});
// };
//
// KarmaFieldsAlpha.Transfer.autoSave2 = function(driver, params) {
// 	var file = KarmaFieldsAlpha.restURL+"/autosave2/"+driver;
//
// 	// console.log(params.output);
// 	// var params = this.clean(params);
// 	return fetch(file, {
// 		method: "post",
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'X-WP-Nonce': KarmaFieldsAlpha.nonce //wpApiSettings.nonce
// 		},
// 		body: JSON.stringify(params),
// 		mode: "same-origin"
// 	}).then(function(response) {
// 		return response.json();
// 	});
// };
