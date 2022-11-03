
KarmaFieldsAlpha.CellManager = class extends KarmaFieldsAlpha.SelectionManager {

  // constructor(container) {
  //
  //   this.container = container;
  //   // this.containerWidth = width;
  //   // this.containerHeight = height;
  //   // this.colOffset = colOffset;
  //   // this.rowOffset = rowOffset;
  //
  //   this.children = [...this.container.children];
  //   this.box = container.getBoundingClientRect();
  //
  // }

  select(event, col, row, cellSelectable) {

    if (cellSelectable) {

      this.tie = {x: col, y: row, width: 1, height: 1};

      Object.freeze(this.tie);

      this.startCellsSelection(event.shiftKey);

      const update = () => {

        const x = this.mouseX - this.box.x;
        const y = this.mouseY - this.box.y;

        const element = this.findElement(x, y);

        if (element && element.multiSelectable) { // = not headers

          this.growCells({
            x: element.colIndex,
            y: element.rowIndex,
            width: 1,
            height: 1
          });

        }

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

      const element = this.findElement(x, y);

      if (element) {

        this.growCells({
          x: element.colIndex,
          y: 0,
          width: 1,
          height: this.container.rowCount
        });

      }

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

  // use box not segment
  sliceCells(box) {

    return this.children.filter(element => element.multiSelectable && KarmaFieldsAlpha.Rect.contain(box, element.colIndex, element.rowIndex));

  }

  growCells(rectangle) {

    // let union = KarmaFieldsAlpha.Rect.union(this.tie, rectangle);
    //
    // if (this.cellSelection) {
    //
    //   this.sliceCells(this.cellSelection).forEach(element => element.classList.remove("selecting-cell"));
    //
    // }
    //
    // this.cellSelection = union;
    //
    // Object.freeze(this.cellSelection);
    //
    // this.sliceCells(this.cellSelection).forEach(element => element.classList.add("selecting-cell"));

    const union = KarmaFieldsAlpha.Rect.union(this.tie, rectangle);

    if (!this.cellSelection || !KarmaFieldsAlpha.Rect.compare(union, this.cellSelection)) {

      if (this.cellSelection) {

        this.sliceCells(this.cellSelection).forEach(element => element.classList.remove("selecting-cell"));

      }

      this.cellSelection = union;

      Object.freeze(this.cellSelection);

      this.sliceCells(this.cellSelection).forEach(element => element.classList.add("selecting-cell"));

    }

  }

  startCellsSelection(shiftKey) {

    if (this.cellSelection) {

      if (shiftKey) {

        this.tie = this.cellSelection;

      } else {

        this.sliceCells(this.cellSelection).forEach(element => element.classList.remove("selecting-cell"));
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

      this.sliceCells(rectangle).forEach(element => element.classList.remove("selecting-cell"));

    }

  }

}
