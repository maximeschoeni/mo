

KarmaFieldsAlpha.Sorter = class {

  constructor(event, selection, row, headerElements) {

    this.selection = selection;
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    this.element = event.currentTarget;
    this.currentRect = this.selection.getBox(row);
    this.offsetX = this.mouseX - this.selection.box.left - this.currentRect.x;
    this.offsetY = this.mouseY - this.selection.box.top - this.currentRect.y;
    this.index = this.selection.index;
    this.indexOffset = row - this.index;
    this.headerElements = headerElements || [];

    event.preventDefault();
  }

  sort() {

    return new Promise((resolve, reject) => {

      this.selection.sliceElements(this.selection.index, this.selection.length).forEach(element => element.classList.add("drag"));

      this.selection.container.classList.add("dragging");
      this.selection.container.style.height = `${this.selection.container.clientHeight}px`;

      const mousemove = event => {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        this.updateOrder();
      }

      const scroll = event => {
        if (event.target.contains(this.selection.container)) {
          this.selection.box = this.selection.container.getBoundingClientRect();
          this.updateOrder();
        }
      }

      const mouseup = event => {
        window.removeEventListener("mousemove", mousemove);
        window.removeEventListener("mouseup", mouseup);
        window.removeEventListener("scroll", scroll, true);

        this.selection.sliceElements(this.selection.index, this.selection.length).forEach(element => {
          element.classList.remove("drag");
          element.style.transform = "none";
        });

        this.selection.container.classList.remove("dragging");
        this.selection.container.style.height = "auto";

        resolve();



      }

      window.addEventListener("mousemove", mousemove);
      window.addEventListener("mouseup", mouseup);
      window.addEventListener("scroll", scroll, true);

    });

  }

  swap(index, length, target) {

    const elements = this.selection.elements.splice(index*this.selection.width, length*this.selection.width);
    this.selection.elements.splice(target*this.selection.width, 0, ...elements);

    this.selection.container.replaceChildren(...this.headerElements, ...this.selection.elements);

  }

  checkBefore(movingBox) {

    if (this.selection.index > 0) {

      const prev = this.selection.getBox(this.selection.index + this.indexOffset - 1);
      const before = this.selection.getBox(this.selection.index - 1);

      return KarmaFieldsAlpha.Rect.isBefore(movingBox, {
        x: prev.x + prev.width - before.width,
        y: prev.y + prev.height - before.height,
        width: before.width,
        height: before.height
      });

    }

    return false;
  }

  checkAfter(movingBox) {

    if (this.selection.index + this.selection.length < this.selection.height) {

      const next = this.selection.getBox(this.selection.index + this.indexOffset + 1);
      const after = this.selection.getBox(this.selection.index + this.selection.length);

      return KarmaFieldsAlpha.Rect.isAfter(movingBox, {
        x: next.x,
        y: next.y,
        width: after.width,
        height: after.height
      });

    }

    return false;
  }

  updateOrder() {

    const deltaX = this.mouseX - this.selection.box.left;
    const deltaY = this.mouseY - this.selection.box.top;

    let current = this.selection.getBox(this.selection.index + this.indexOffset);

    const movingBox = {
      x: deltaX - this.offsetX,
      y: deltaY - this.offsetY,
      width: current.width,
      height: current.height
    };

    if (this.checkBefore(movingBox)) {

      this.swap(this.selection.index, this.selection.length, this.selection.index - 1);

      this.selection.index--;

      current = this.selection.getBox(this.selection.index + this.indexOffset);

    } else if (this.checkAfter(movingBox)) {

      this.swap(this.selection.index, this.selection.length, this.selection.index + 1);

      this.selection.index++;

      current = this.selection.getBox(this.selection.index + this.indexOffset);

    }

    let offsetX = deltaX - this.offsetX - current.x;
    let offsetY = deltaY - this.offsetY - current.y;

    this.selection.sliceElements(this.selection.index, this.selection.length).forEach(element => element.style.transform = `translate(${offsetX}px, ${offsetY}px)`);

  }




}
