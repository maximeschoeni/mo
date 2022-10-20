

KarmaFieldsAlpha.SortManager = class extends KarmaFieldsAlpha.SelectionManager {

  constructor(...args) {

    super(...args);

    this.headerElements = this.children.slice(0, this.width*this.offsetRow);
  }

  sort(event, col, row) {

    if (this.segment && KarmaFieldsAlpha.Segment.contains(this.segment, row)) {

      event.preventDefault();

      this.mouseX = event.clientX;
      this.mouseY = event.clientY;

      this.currentRect = this.getBox(row);
      this.offsetX = this.mouseX - this.box.left - this.currentRect.x;
      this.offsetY = this.mouseY - this.box.top - this.currentRect.y;
      this.index = this.segment.index;
      this.indexOffset = row - this.index;

      this.sliceElements(this.segment).forEach(element => element.classList.add("drag"));

      this.container.classList.add("dragging");
      this.container.style.height = `${this.container.clientHeight}px`;

      const mousemove = event => {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        this.updateOrder();
      }

      const scroll = event => {
        if (event.target.contains(this.container)) {
          this.box = this.container.getBoundingClientRect();
          this.updateOrder();
        }
      }

      const mouseup = event => {

        window.removeEventListener("mousemove", mousemove);
        window.removeEventListener("mouseup", mouseup);
        window.removeEventListener("scroll", scroll, true);

        this.sliceElements(this.segment).forEach(element => {
          element.classList.remove("drag");
          element.style.transform = "none";
        });

        this.container.classList.remove("dragging");
        this.container.style.height = "auto";

        if (this.onSort && this.segment && this.segment.index !== this.index) {
          this.onSort(this.index, this.segment.length, this.segment.index);
        }

      }

      window.addEventListener("mousemove", mousemove);
      window.addEventListener("mouseup", mouseup);
      window.addEventListener("scroll", scroll, true);

    } else {

      this.select(event, col, row);

    }

  }

  swap(index, length, target) {

    const elements = this.elements.splice(index*this.width, length*this.width);
    this.elements.splice(target*this.width, 0, ...elements);

    this.container.replaceChildren(...this.headerElements, ...this.elements);

  }

  checkBefore(movingBox) {

    if (this.segment && this.segment.index > 0) {

      const prev = this.getBox(this.segment.index + this.indexOffset - 1);
      const before = this.getBox(this.segment.index - 1);

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

    if (this.segment && this.segment.index + this.segment.length < this.height) {

      const next = this.getBox(this.segment.index + this.indexOffset + 1);
      const after = this.getBox(this.segment.index + this.segment.length);

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

    if (this.segment) {

      const deltaX = this.mouseX - this.box.left;
      const deltaY = this.mouseY - this.box.top;

      let current = this.getBox(this.segment.index + this.indexOffset);

      const movingBox = {
        x: deltaX - this.offsetX,
        y: deltaY - this.offsetY,
        width: current.width,
        height: current.height
      };

      if (this.checkBefore(movingBox)) {

        this.swap(this.segment.index, this.segment.length, this.segment.index - 1);

        this.segment.index--;

        current = this.getBox(this.segment.index + this.indexOffset);

      } else if (this.checkAfter(movingBox)) {

        this.swap(this.segment.index, this.segment.length, this.segment.index + 1);

        this.segment.index++;

        current = this.getBox(this.segment.index + this.indexOffset);

      }

      let offsetX = deltaX - this.offsetX - current.x;
      let offsetY = deltaY - this.offsetY - current.y;

      this.sliceElements(this.segment).forEach(element => element.style.transform = `translate(${offsetX}px, ${offsetY}px)`);

    }

  }




}
