

KarmaFieldsAlpha.SelectionManager = class {

  constructor(container, width, height, offsetCol = 0, offsetRow = 0) {

    this.container = container;
    this.width = width;
    this.height = height;
    this.offsetCol = offsetCol;
    this.offsetRow = offsetRow;

    this.children = [...container.children];
    this.elements = this.children.slice(this.width*offsetRow);
    this.box = this.container.getBoundingClientRect();

  }

  select(event, col, row) {

    this.tie = {index: row, length: 1};

    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    if (this.selection) {
      if (event.shiftKey) {
        this.tie = this.selection;
      } else {
        this.sliceElements(this.selection).forEach(element => element.classList.remove("selected"));
      }
    }

    const onMouseMove = event => {

      this.mouseX = event.clientX;
      this.mouseY = event.clientY;

      this.updateSelection();

    }

    const onMouseUp = event =>  {

      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", scroll, true);

      onMouseMove(event);

      if (this.segment) {

        this.sliceElements(this.segment).forEach(element => element.classList.replace("selecting", "selected"));

        // if (this.onSelect && (!this.selection || !KarmaFieldsAlpha.Segment.compare(this.selection, this.segment))) {
        if (this.onSelect && this.segment) {

          const hasChange = Boolean(!this.selection || !KarmaFieldsAlpha.Segment.compare(this.segment, this.selection));

          this.onSelect(this.segment, hasChange);

        }

      }

    }

    const scroll = event => {
      if (event.target.contains(this.container)) {
        this.box = this.container.getBoundingClientRect();
        this.updateSelection();
      }
    }

    onMouseMove(event);

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", scroll, true);

  }

  updateSelection() {

    const x = this.mouseX - this.box.x;
    const y = this.mouseY - this.box.y;

    const index = this.findIndex(x, y);

    if (index > -1) {

      this.growSelection({index: index, length: 1});

    }

  }

  sliceElements(segment) {

    const elements = [];

    for (let j = 0; j < segment.length; j++) {

      for (let i = 0; i < this.width; i++) {

        elements.push(this.elements[(segment.index + j)*this.width + i]);

      }

    }

    return elements;
  }

  getBox(index, length = 1) {

    const selectedElements = this.sliceElements({index: index, length: length});

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

  growSelection(segment) {

    const union = KarmaFieldsAlpha.Segment.union(this.tie, segment);

    if (!this.segment || !KarmaFieldsAlpha.Segment.compare(union, this.segment)) {

      if (this.segment) {

        this.sliceElements(this.segment).forEach(element => element.classList.remove("selecting"));

      }

      this.segment = union;

      this.sliceElements(this.segment).forEach(element => element.classList.add("selecting"));

    }

  }

  clear(segment = this.segment) {

    if (segment) {

      this.sliceElements(segment).forEach(element => element.classList.remove("selected"));

    }

  }




}
