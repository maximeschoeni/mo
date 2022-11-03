
KarmaFieldsAlpha.CellManager = class extends KarmaFieldsAlpha.SelectionManager {

  select(event, col, row, cellSelectable) {

    if (cellSelectable) {

      this.tie = {x: col, y: row, width: 1, height: 1};

      Object.freeze(this.tie);

      this.startCellsSelection(event.shiftKey);

      const update = () => {

        const x = this.mouseX - this.box.x;
        const y = this.mouseY - this.box.y;

        const index = this.findIndex(x, y);

        if (index > -1) {

          this.growCells({
            // x: index%this.width - this.rowHeader,
            // y: Math.floor(index/this.width) - this.colHeader,
            x: this.getCol(index),
            y: this.getRow(index),
            width: 1,
            height: 1
          });

        }

        // const element = this.findElement(x, y);
        //
        // if (element && element.multiSelectable) { // = not headers
        //
        //   this.growCells({
        //     x: element.colIndex,
        //     y: element.rowIndex,
        //     width: 1,
        //     height: 1
        //   });
        //
        // }

      }

      const onMouseMove = event => {

        this.mouseX = event.clientX;
        this.mouseY = event.clientY;

        update();

      }

      const onMouseUp = event =>  {

        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("scroll", scroll, true);

        onMouseMove(event);

        this.endCellsSelection();

      }

      const scroll = event => {
        if (event.target.contains(this.container)) {
          this.box = this.container.getBoundingClientRect();
          update();
        }
      }

      onMouseMove(event);

      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("mousemove", onMouseMove);
      window.addEventListener("scroll", scroll, true);

    } else {

      if (this.cellSelection) {

        this.clearCells(this.cellSelection);

        this.cellSelection = null;

      }

      super.select(event, col, row);

    }



  }

  selectHeaders(event, col) {

    this.tie = {x: col, y: 0, width: 1, height: this.container.rowCount};

    this.startCellsSelection(event.shiftKey)

    const update = () => {

      const x = this.mouseX - this.box.x;
      const y = this.mouseY - this.box.y;

      const index = this.findCol(x);

      if (index > -1) {

        this.growCells({
          x: index - this.rowHeader,
          y: 0,
          width: 1,
          height: this.rowCount
        });

      }


      // const element = this.findElement(x, y);
      //
      // if (element) {
      //
      //   this.growCells({
      //     x: element.colIndex,
      //     y: 0,
      //     width: 1,
      //     height: this.container.rowCount
      //   });
      //
      // }

    }

    const onMouseMove = event => {

      this.mouseX = event.clientX;
      this.mouseY = event.clientY;

      update();

    }

    const onMouseUp = event =>  {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", scroll, true);

      onMouseMove(event);

      this.endCellsSelection();

    }

    const scroll = event => {
      if (event.target.contains(this.container)) {
        this.box = this.container.getBoundingClientRect();
        update();
      }
    }

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", scroll, true);

  }

  findCol(x) {

    for (let i = this.rowHeader; i < this.colCount; i++) {

      const element = this.children[i];

      if (x >= element.offsetLeft && x < element.offsetLeft + element.clientWidth) {

        return i;

      }

    }

    return -1;
  }



  // // use box not segment
  // sliceRect(box) {
  //
  //   // return this.children.filter(element => element.multiSelectable && KarmaFieldsAlpha.Rect.contain(box, element.colIndex, element.rowIndex));
  //
  //   const elements = [];
  //
  //   for (let j = 0; j < box.height; j++) {
  //
  //     for (let i = 0; i < box.width; i++) {
  //
  //       const index = this.getIndex(i + box.x, j + box.y);
  //       const element = this.children[index];
  // 
  //       elements.push(element);
  //     }
  //
  //   }
  //
  //   return elements;
  // }

  growCells(rectangle) {

    // let union = KarmaFieldsAlpha.Rect.union(this.tie, rectangle);
    //
    // if (this.cellSelection) {
    //
    //   this.sliceRect(this.cellSelection).forEach(element => element.classList.remove("selecting-cell"));
    //
    // }
    //
    // this.cellSelection = union;
    //
    // Object.freeze(this.cellSelection);
    //
    // this.sliceRect(this.cellSelection).forEach(element => element.classList.add("selecting-cell"));

    const union = KarmaFieldsAlpha.Rect.union(this.tie, rectangle);

    if (!this.cellSelection || !KarmaFieldsAlpha.Rect.compare(union, this.cellSelection)) {

      if (this.cellSelection) {

        this.sliceRect(this.cellSelection).forEach(element => element.classList.remove("selecting-cell"));

      }

      this.cellSelection = union;

      Object.freeze(this.cellSelection);

      this.sliceRect(this.cellSelection).forEach(element => element.classList.add("selecting-cell"));

    }

  }

  startCellsSelection(shiftKey) {

    if (this.cellSelection) {

      if (shiftKey) {

        this.tie = this.cellSelection;

      } else {

        this.sliceRect(this.cellSelection).forEach(element => element.classList.remove("selecting-cell"));
        this.cellSelection = null;

      }

    }



  }

  endCellsSelection() {

    if (this.cellSelection) {

      if (this.onSelectCells && this.cellSelection.width*this.cellSelection.height > 1) {

        this.onSelectCells(this.cellSelection);

      } else {

        this.clearCells(this.cellSelection);

      }

    }

  }

  clearCells(rectangle) {

    if (rectangle) {

      this.sliceRect(rectangle).forEach(element => element.classList.remove("selecting-cell"));

    }

  }

}
