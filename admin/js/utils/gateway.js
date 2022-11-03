KarmaFieldsAlpha.Gateway = class {

	static get(queryString, params = "") {

		if (typeof params !== "string") {
			params = KarmaFieldsAlpha.Nav.toString(params);
		}

		if (params) {
			params = "?"+params;
		}

		return fetch(KarmaFieldsAlpha.restURL+"/"+queryString+params, {
			cache: "default", // force-cache
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": KarmaFieldsAlpha.nonce //wpApiSettings.nonce
			},
		}).then(response => {
			return response.json();
		}).catch(error => {
			console.log(queryString);
			console.trace();
			console.error(error);

		});
	}

	static post(queryString, data, params) {
		return fetch(KarmaFieldsAlpha.restURL+"/"+queryString, {
			method: "post",
			headers: {
				"Content-Type": "application/json",
				"X-WP-Nonce": KarmaFieldsAlpha.nonce //wpApiSettings.nonce
			},
			body: JSON.stringify({
				data: data || {},
				...params
			}),
			mode: "same-origin"
		}).then(function(response) {
			return response.json();
		});
	}

	// static getOptions(queryString) { // queryString = driver+"?"+queryString
	//
	// 	if (!this.optionPromises[queryString]) {
	// 		this.optionPromises[queryString] = this.get("fetch/"+queryString);
	// 	}
	//
	// 	return this.optionPromises[queryString];
	// }
	//
	// static clearOptions() {
	// 	this.optionPromises = {};
	// }

	static upload(file, params) {
	  let fileName = file.name.normalize();
	  const chunkSize = 1048576; // 1MB
		// const chunkSize = 65536; // 64KB
	  let chunkIndex = 0;
	  let chunkTotal = Math.ceil(file.size/chunkSize);
	  const fileReader = new FileReader();

	  return new Promise((resolve, reject) => {
	    const uploadNextPart = () => {
	      const start = chunkIndex*chunkSize;
	      const end = Math.min(start+chunkSize, file.size);
	      const filePart = file.slice(start, end);
	      fileReader.onload = function() {
	        const formData = new FormData();
	        formData.append("file", filePart);
	        formData.append("name", fileName);
	        formData.append("chunk", chunkIndex);
	        formData.append("chunks", chunkTotal);
					formData.append("chunkSize", chunkSize);
					if (params) {
						for (let key in params) {
							formData.append(key, params[key]);
						}
					}
	        return fetch(KarmaFieldsAlpha.restURL+"/upload", {
						headers: {
							// "Content-Type": "application/json",
							"X-WP-Nonce": KarmaFieldsAlpha.nonce //wpApiSettings.nonce
						},
	          method: "post",
	          body: formData,
	          mode: "same-origin"
	        }).then(response => response.json()).then(function(result) {
	          chunkIndex++;
	          if (chunkIndex < chunkTotal) {
	            uploadNextPart();
	          } else {
	            resolve(result);
	          }
	        });
	      }
	      fileReader.readAsBinaryString(filePart);
	    }
	    uploadNextPart();
	  });
	}

}

KarmaFieldsAlpha.Gateway.optionPromises = {};
