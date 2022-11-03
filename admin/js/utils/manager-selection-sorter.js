

KarmaFieldsAlpha.SortManager = class extends KarmaFieldsAlpha.SelectionManager {

  // constructor(...args) {
  //
  //   super(...args);
  //
  //   this.headerElements = this.children.slice(0, this.width*this.offsetRow);
  // }

  select(event, col, row) {

    if (this.selection && KarmaFieldsAlpha.Segment.contains(this.selection, row)) {

      event.preventDefault();

      this.mouseX = event.clientX;
      this.mouseY = event.clientY;

      this.currentRect = this.getBox(row);
      this.offsetX = this.mouseX - this.box.left - this.currentRect.x;
      this.offsetY = this.mouseY - this.box.top - this.currentRect.y;
      this.index = this.selection.index;
      this.indexOffset = row - this.index;

      this.sliceSegment(this.selection).forEach(element => element.classList.add("drag"));

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

        this.sliceSegment(this.selection).forEach(element => {
          element.classList.remove("drag");
          element.style.transform = "none";
        });

        this.container.classList.remove("dragging");
        this.container.style.height = "auto";

        if (this.onSort && this.selection && this.selection.index !== this.index) {
          this.onSort(this.index, this.selection.length, this.selection.index);
        }

      }

      window.addEventListener("mousemove", mousemove);
      window.addEventListener("mouseup", mouseup);
      window.addEventListener("scroll", scroll, true);

    } else {

      super.select(event, col, row);

    }

  }

  swap(index, length, target) {

    // const elements = this.elements.splice(index*this.width, length*this.width);
    // this.elements.splice(target*this.width, 0, ...elements);
    //
    // this.container.replaceChildren(...this.headerElements, ...this.elements);


    // const first = Math.min(index, target);
    // const last = Math.max(index, target);
    // const dir = target > index ? 1 : -1;
    //
    // const startIndex = this.children.findIndex(element => element.rowIndex === index);
    // const targetIndex = this.children.findIndex(element => element.rowIndex === target);
    // const elements = this.sliceSegment({
    //   index: index,
    //   length: length
    // });
    //
    // this.sliceSegment({
    //   index: first,
    //   length: last - first + length
    // }).forEach(element => {
    //   if (element.rowIndex >= index && element.rowIndex < index + length) {
    //     element.rowIndex += target - index;
    //   } else {
    //     element.rowIndex += -dir*length;
    //   }
    // });
    //
    // this.children.splice(startIndex, elements.length);
    // this.children.splice(targetIndex, 0, ...elements);
    //
    // this.container.replaceChildren(...this.children);



    const elements = this.children.splice((this.colHeader + index)*this.width, length*this.width);
    this.children.splice((this.colHeader + target)*this.width, 0, ...elements);

    this.container.replaceChildren(...this.children);

  }

  checkBefore(movingBox) {

    const beforeBox = this.getBox(this.selection.index - 1);

    if (beforeBox) {

      const prevBox = this.getBox(this.selection.index + this.indexOffset - 1);

      return KarmaFieldsAlpha.Rect.isBefore(movingBox, {
        x: prevBox.x + prevBox.width - beforeBox.width,
        y: prevBox.y + prevBox.height - beforeBox.height,
        width: beforeBox.width,
        height: beforeBox.height
      });

    }

    return false;


    // if (this.segment && this.segment.index > 0) {
    //
    //   const prevElements = this.sliceSegment({index: this.segment.index + this.indexOffset - 1, length: 1});
    //   const prevBox = this.getElementsBox(prevElements);
    //
    //   const beforeElements = this.sliceSegment({index: this.segment.index - 1, length: 1});
    //
    //   const prev = this.getBox(this.segment.index + this.indexOffset - 1);
    //   const before = this.getBox(this.segment.index - 1);
    //
    //   return KarmaFieldsAlpha.Rect.isBefore(movingBox, {
    //     x: prevBox.x + prevBox.width - before.width,
    //     y: prevBox.y + prevBox.height - before.height,
    //     width: before.width,
    //     height: before.height
    //   });
    //
    // }
    //
    // return false;
  }

  checkAfter(movingBox) {

    const afterBox = this.getBox(this.selection.index + this.selection.length);

    if (afterBox) {

      const nextBox = this.getBox(this.selection.index + this.indexOffset + 1);

      return KarmaFieldsAlpha.Rect.isAfter(movingBox, {
        x: nextBox.x,
        y: nextBox.y,
        width: afterBox.width,
        height: afterBox.height
      });

    }

    return false;

    // if (this.segment && this.segment.index + this.segment.length < this.height) {
    //
    //   const next = this.getBox(this.segment.index + this.indexOffset + 1);
    //   const after = this.getBox(this.segment.index + this.segment.length);
    //
    //   return KarmaFieldsAlpha.Rect.isAfter(movingBox, {
    //     x: next.x,
    //     y: next.y,
    //     width: after.width,
    //     height: after.height
    //   });
    //
    // }
    //
    // return false;
  }

  updateOrder() {

    if (this.selection) {

      const deltaX = this.mouseX - this.box.left;
      const deltaY = this.mouseY - this.box.top;

      let current = this.getBox(this.selection.index + this.indexOffset);

      const movingBox = {
        x: deltaX - this.offsetX,
        y: deltaY - this.offsetY,
        width: current.width,
        height: current.height
      };

      if (this.checkBefore(movingBox)) {

        this.swap(this.selection.index, this.selection.length, this.selection.index - 1);

        // this.segment.index--;
        this.selection = KarmaFieldsAlpha.Segment.offset(this.selection, -1); // this.selection is immutable

        current = this.getBox(this.selection.index + this.indexOffset);

      } else if (this.checkAfter(movingBox)) {

        this.swap(this.selection.index, this.selection.length, this.selection.index + 1);

        // this.segment.index++;
        this.selection = KarmaFieldsAlpha.Segment.offset(this.selection, 1); // this.selection is immutable

        current = this.getBox(this.selection.index + this.indexOffset);

      }

      let offsetX = deltaX - this.offsetX - current.x;
      let offsetY = deltaY - this.offsetY - current.y;

      this.sliceSegment(this.selection).forEach(element => element.style.transform = `translate(${offsetX}px, ${offsetY}px)`);

    }

  }




}
