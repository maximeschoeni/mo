
KarmaFieldsAlpha.Store = class {

  constructor(driver, joins = []) {

    this.buffer = new KarmaFieldsAlpha.Buffer("gateway", driver);
    this.driver = driver;
    this.joins = joins;
    // this.promises = {};
    // this.ids = new Set();
    this.cache = new KarmaFieldsAlpha.Buffer("cache", driver);

    // this.cache = new KarmaFieldsAlpha.BufferMap("cache", driver);

  }

  static empty() {
    const buffer = new KarmaFieldsAlpha.Buffer("gateway");
    const cache = new KarmaFieldsAlpha.Buffer("cache");
    cache.remove();
    buffer.remove();
  }

  empty() {

    // console.trace();

    // this.constructor.cache[this.driver] = {};
    this.cache.remove();
    this.buffer.remove();
  }

  // get(context, key) {
  //   if (this.constructor.cache[this.driver] && this.constructor.cache[this.driver][context]) {
  //     return this.constructor.cache[this.driver][context][key];
  //   }
  //   this.cache.get(context, key);
  // }
  //
  // set(promise, context, key) {
  //   // if (!this.constructor.cache[this.driver]) {
  //   //   this.constructor.cache[this.driver] = {};
  //   // }
  //   // if (!this.constructor.cache[this.driver][context]) {
  //   //   this.constructor.cache[this.driver][context] = {};
  //   // }
  //   // this.constructor.cache[this.driver][context][key] = promise;
  //
  //   this.cache.set(promise, context, key);
  // }

  write(value, id, key) {

    const array = KarmaFieldsAlpha.Type.toArray(value);

    this.buffer.set(array, id, key);

    if (!this.trashBuffer.has(id, key)) {

      this.trashBuffer.set(array, id, key);

    }

  }

  get(id) {

    let promise = this.cache.get("get", id);

    if (!promise) {

      promise = KarmaFieldsAlpha.Gateway.get("get/"+this.driver+"/"+id).then(item => {

        if (item) {

          for (let key in item) {

            const value = KarmaFieldsAlpha.Type.toArray(item[key]);

            this.buffer.set(value, id, key);
          }

        }

        return item;
      });

      this.cache.set(promise, "get", id);
    }

    return promise;
  }

  count(paramString) {

    let promise = this.cache.get("count", paramString);

    if (!promise) {

      promise = KarmaFieldsAlpha.Gateway.get("count/"+this.driver, paramString);

      this.cache.set(promise, "count", paramString);
    }

    return promise;
  }

  query(paramString) {

    // if (!this.constructor.cache[this.driver]) {
    //   this.constructor.cache[this.driver] = {};
    // }

    let promise = this.cache.get("query", paramString);

    if (!promise) {

      let request = this.driver;

      if (paramString) {
        request += "?"+paramString;
      }

      promise = KarmaFieldsAlpha.Gateway.get("query/"+request).then(results => {

        // const ids = [];
        results = results.items || results || []; // -> compat

        for (let item of results) {

          const id = KarmaFieldsAlpha.Type.toString(item.id);

          for (let key in item) {

            const value = KarmaFieldsAlpha.Type.toArray(item[key]);

            this.buffer.set(value, id, key);
          }

          this.buffer.set(["0"], id, "trash"); // -> to be removed!

          // ids.push(item.id);
        }

        // return ids;

        return results;
      });

      this.cache.set(promise, "query", paramString);

    }

    return promise;
  }


  queryIds(paramString) {

    // if (typeof paramString === "object") {
    //   paramString = KarmaFieldsAlpha.Params.stringify(paramString);
    // }

    let promise = this.cache.get("ids", paramString);

    if (!promise) {
      promise = this.query(paramString).then(results => results.map(item => item.id.toString()));
      this.cache.set(promise, "ids", paramString);
    }

    return promise;
  }

  join(join, paramString) {

    let promise = this.cache.get("join", paramString, join);

    if (!promise) {

      // promise = this.queryIds(paramString).then(ids => {
      //   return KarmaFieldsAlpha.Gateway.get("join/"+join+"?ids="+ids.join(","));
      // }).then(relations => {
      //   for (let relation of relations) {
      //     const id = relation.id.toString();
      //     const key = relation.key;
      //     const values = this.buffer.get(id, key) || [];
      //
      //     this.buffer.set([...values, relation.value], id, key);
      //   }
      //   return relations;
      // });


      promise = this.queryIds(paramString).then(async ids => {
        const querySize = 50;
        let i = 0;
        while (i < ids.length) {
          const slice = ids.slice(i, i+querySize);
          await KarmaFieldsAlpha.Gateway.get("join/"+join+"?ids="+slice.join(",")).then(relations => {
            // const data = {};
            // for (let relation of relations) {
            //   const id = relation.id.toString();
            //   const key = relation.key;
            //
            //   data[id] ||= {}
            //   data[id][key] = [...data[id][key], relation.value]
            //
            // }
            // this.buffer.merge(data);

            for (let relation of relations) {
              const id = relation.id.toString();
              const key = relation.key;
              const values = this.buffer.get(id, key) || [];
              this.buffer.set([...values, relation.value], id, key);
            }
          });
          i += querySize;
        }
      });

      this.cache.set(promise, "join", paramString, join);

    }

    return promise;
  }

  join2(join, paramString, offset = 0, max = 9999999) {

    let promise = this.cache.get("join", paramString, join, offset);

    if (!promise) {

      promise = this.queryIds(paramString).then(ids => {
        const slice = ids.slice(offset, offset+max);
        return KarmaFieldsAlpha.Gateway.get("join/"+join+"?ids="+slice.join(","));
      }).then(relations => {
        const data = {};
        for (let relation of relations) {
          const id = relation.id.toString();
          const key = relation.key;
          data[id] ||= {};
          data[id][key] ||= [];
          data[id][key].push(relation.value);
        }
        this.buffer.merge(data);

        // for (let relation of relations) {
        //   const id = relation.id.toString();
        //   const key = relation.key;
        //   const values = this.buffer.get(id, key) || [];
        //
        //   this.buffer.set([...values, relation.value], id, key);
        // }
        return relations;
      });

      this.cache.set(promise, "join", paramString, join, offset);

    }

    return promise;
  }

  async getValue(id, ...path) {

    let value = this.buffer.get(id, ...path);

    if (!value) {

      // const queries = this.cache.get("ids") || {};

      const queries = this.cache.get("query") || {};

      for (let paramString in queries) {

        // const ids = await queries[paramString];
        const ids = await this.queryIds(paramString)

        if (ids.includes(id)) {

          value = this.buffer.get(id, ...path);

          if (!value) {

            for (let join of this.joins) {

              const max = 20;
              let i = 0;

              while (i < ids.length) {

                await this.join2(join, paramString, i, max);

                i += max;

                value = this.buffer.get(id, ...path);

                if (value) break;

              }

              if (value) break;

            }

          }

          if (value) break;

        }

      }

    }

    return value;
  }


  // async getValue(id, ...path) {
  //
  //   let value = this.buffer.get(id, ...path);
  //
  //   if (!value) {
  //
  //     // const queries = this.cache.get("ids") || {};
  //
  //     const queries = this.cache.get("query") || {};
  //
  //     for (let paramString in queries) {
  //
  //       // const ids = await queries[paramString];
  //       const ids = await this.queryIds(paramString)
  //
  //       if (ids.includes(id)) {
  //
  //         value = this.buffer.get(id, ...path);
  //
  //         if (!value) {
  //
  //           for (let join of this.joins) {
  //
  //             await this.join(join, paramString);
  //
  //           }
  //
  //           value = this.buffer.get(id, ...path);
  //
  //         }
  //
  //         if (value) {
  //
  //           break;
  //
  //         }
  //
  //       }
  //
  //     }
  //
  //   }
  //
  //   return value;
  // }



}
