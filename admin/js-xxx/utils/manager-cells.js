
KarmaFieldsAlpha.CellManager = class {

  constructor(container, width, height, colOffset = 0, rowOffset = 0) {

    this.container = container;
    // this.col = col;
    // this.row = row;
    this.containerWidth = width;
    this.containerHeight = height;
    this.colOffset = colOffset;
    this.rowOffset = rowOffset;

    this.elements = [...this.container.children];
    this.box = container.getBoundingClientRect();

  }

  selectCells(event, col, row) {

    this.tie = {x: col, y: row, width: 1, height: 1};

    this.startSelection(event.shiftKey);

    // if (this.selection) {
    //
    //   if (event.shiftKey) {
    //
    //     this.tie = this.selection;
    //
    //   } else {
    //
    //     this.sliceElements(this.selection).forEach(element => element.classList.remove("selecting-cell"));
    //
    //   }
    //
    // }

    const update = () => {

      const x = this.mouseX - this.box.x;
      const y = this.mouseY - this.box.y;

      const box = this.findBox(x, y);

      if (box && box.y >= 0) { // = not headers

        this.growSelection(box);

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

      this.endSelection();

      // if (this.rectangle) {
      //
      //   if (this.onSelect
      //     && this.rectangle.width*this.rectangle.height > 1
      //     && (!this.selection || !KarmaFieldsAlpha.Rect.compare(this.selection, this.rectangle))) {
      //
      //     this.onSelect(this.rectangle);
      //
      //   }
      //
      // }

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

  }

  selectHeaders(event, col) {

    this.tie = {x: col, y: 0, width: 1, height: this.containerHeight};

    this.startSelection(event.shiftKey)

    const update = () => {

      const x = this.mouseX - this.box.x;
      const y = this.mouseY - this.box.y;

      const box = this.findBox(x, y);

      if (box) {

        this.growSelection({x: box.x, y: 0, width: box.width, height: this.containerHeight});

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

      this.endSelection();

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


  getElement(col, row) {

    const index = row*this.containerWidth + col;

    return this.elements[index];

  }

  sliceElements(box) {

    const elements = [];

    for (let j = box.y; j < box.y + box.height; j++) {

      for (let i = box.x; i < box.x + box.width; i++) {

        const element = this.getElement(i, j + this.rowOffset);

        if (element) {

          elements.push(element);

        }

      }

    }

    return elements;
  }

  getBox(col, row) {

    const element = this.getElement(col, row);

    return {x: element.offsetLeft, y: element.offsetTop, width: element.clientWidth, height: element.clientHeight};

  }

  findBox(x, y) {

    for (let i = 0; i < this.containerWidth + this.colOffset; i++) {

      for (let j = 0; j < this.containerHeight + this.rowOffset; j++) {

        const box = this.getBox(i, j);

        if (KarmaFieldsAlpha.Rect.contain(box, x, y)) {

          return {x: i, y: j - this.rowOffset, width: 1, height: 1};

        }

      }

    }

  }



  growSelection(rectangle) {

    let union = KarmaFieldsAlpha.Rect.union(this.tie, rectangle);

    if (this.rectangle) {

      this.sliceElements(this.rectangle).forEach(element => element.classList.remove("selecting-cell"));

    }

    this.rectangle = union;

    this.sliceElements(this.rectangle).forEach(element => element.classList.add("selecting-cell"));

  }

  startSelection(shiftKey) {

    if (this.selection) {

      if (shiftKey) {

        this.tie = this.selection;

      } else {

        this.sliceElements(this.selection).forEach(element => element.classList.remove("selecting-cell"));

      }

    }



  }

  endSelection() {

    // if (this.onSelect
    //   && this.rectangle
    //   && (!this.selection || !KarmaFieldsAlpha.Rect.compare(this.selection, this.rectangle))) {
    //
    //     if (this.rectangle.width*this.rectangle.height > 1) {
    //
    //       this.onSelect(this.rectangle);
    //
    //     } else {
    //
    //       this.clear(this.rectangle);
    //
    //     }
    //
    //
    //
    // }

    if (this.onSelect && this.rectangle) {

      this.onSelect(this.rectangle);

    }

  }

  clear(rectangle = this.selection) {

    if (rectangle) {

      this.sliceElements(rectangle).forEach(element => element.classList.remove("selecting-cell"));

    }

  }

}
