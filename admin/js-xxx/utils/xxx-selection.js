

KarmaFieldsAlpha.Selection = class {

  constructor(event, container, elements, width, height, col, row, selection) {

    if (selection) {
      this.index = selection.index;
      this.length = selection.length;
    }

    this.ground = new KarmaFieldsAlpha.Segment(row, 1);
    this.width = width;
    this.height = height;
    this.col = col;
    this.row = row;
    this.elements = elements;
    this.container = container;
    this.box = container.getBoundingClientRect();

    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    // if (container.style.position) {
    //
    // }

    if (window.getComputedStyle(container).getPropertyValue("position") !== "relative") {
      console.warn("container position not relative!!");
    }

    // var cs = ;




  }

  select() {

    return new Promise((resolve, reject) => {

      if (this.length) {

        this.sliceElements(this.index, this.length).forEach(element => element.classList.remove("selected"));

        this.length = 0;

      }

      const onMouseMove = event => {

        this.mouseX = event.clientX;
        this.mouseY = event.clientY;

        this.update();

      }

      const onMouseUp = event =>  {
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("scroll", scroll, true);

        this.mouseX = event.clientX;
        this.mouseY = event.clientY;

        this.update();

        this.sliceElements(this.index, this.length).forEach(element => element.classList.replace("selecting", "selected"));

        resolve(new KarmaFieldsAlpha.Segment(this.index, this.length));

      }

      const scroll = event => {
        if (event.target.contains(this.container)) {
          this.box = this.container.getBoundingClientRect();
          this.update();
        }
      }

      // onMouseMove(event);

      // this.growSelection(this.row);

      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("mousemove", onMouseMove);
      window.addEventListener("scroll", scroll, true);

    });

  }

  update() {

    const x = this.mouseX - this.box.x;
    const y = this.mouseY - this.box.y;

    const index = this.findIndex(x, y);

    if (index > -1) {

      this.growSelection(index, 1);

    }

  }

  sliceElements(index, length = 1) {

    const elements = [];

    for (let j = 0; j < length; j++) {

      for (let i = 0; i < this.width; i++) {

        elements.push(this.elements[(index + j)*this.width + i]);

      }

    }

    return elements;
  }

  getBox(index, length = 1) {

    const selectedElements = this.sliceElements(index, length);

    const first = selectedElements[0];
    const last = selectedElements[selectedElements.length-1];

    return new KarmaFieldsAlpha.Rect(first.offsetLeft, first.offsetTop, last.offsetLeft + last.clientWidth - first.offsetLeft, last.offsetTop + last.clientHeight - first.offsetTop);

  }

  findIndex(x, y) {

    for (let j = 0; j < this.height; j++) {

      const box = this.getBox(j);

      if (box.contains(x, y)) {

        return j;

      }

    }

    return -1;
  }

  growSelection(index, length = 1) {

    // if (!this.ground) {
    //
    //   this.ground = new KarmaFieldsAlpha.Segment(index, length); // -> when registering selected item
    //
    // }

    const union = this.ground.union(index, length);

    // this.updateSelection(union.index, union.length);

    if (union.index !== this.index || union.length !== this.length) {

      if (this.length) {

        this.sliceElements(this.index, this.length).forEach(element => element.classList.remove("selecting"));

      }

      this.index = union.index;
      this.length = union.length

      if (this.length) {

        this.sliceElements(this.index, this.length).forEach(element => element.classList.add("selecting"));

      }

    }

  }

  // updateSelection(index = 0, length = 0) {
  //
  //   if (index !== this.index || length !== this.length) {
  //
  //     if (this.length) {
  //
  //       this.sliceElements(this.index, this.length).forEach(element => element.classList.remove("selecting"));
  //
  //     }
  //
  //     this.index = index;
  //     this.length = length
  //
  //     if (this.length) {
  //
  //       this.sliceElements(this.index, this.length).forEach(element => element.classList.add("selecting"));
  //
  //     }
  //
  //   }
  //
  //   if (this.length) {
  //
  //     return this;
  //
  //   }
  //
  // }

  kill() {

    if (this.length) {

      this.sliceElements(this.index, this.length).forEach(element => element.classList.remove("selected"));

      this.length = 0;

    }

  }





}
