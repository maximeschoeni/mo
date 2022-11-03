

KarmaFieldsAlpha.DropManager = class extends KarmaFieldsAlpha.SelectionManager {

  constructor(container) {

    super(container);



  }

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

      this.target = -1;

      const mousemove = event => {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        this.update();
      }

      const scroll = event => {
        if (event.target.contains(this.container)) {
          this.box = this.container.getBoundingClientRect();
          this.update();
        }
      }

      const mouseup = event => {

        window.removeEventListener("mousemove", mousemove);
        window.removeEventListener("mouseup", mouseup);
        window.removeEventListener("scroll", scroll, true);

        // this.sliceSegment(this.segment).forEach(element => {
        //   element.classList.remove("drag");
        //   element.style.transform = "none";
        // });

        mousemove(event);

        this.container.classList.remove("dragging");
        this.container.style.height = "auto";

        this.complete();



      }

      window.addEventListener("mousemove", mousemove);
      window.addEventListener("mouseup", mouseup);
      window.addEventListener("scroll", scroll, true);

    } else {

      super.select(event, col, row);

    }

  }

  async complete() {

    // const x = this.mouseX - this.box.left;
    // const y = this.mouseY - this.box.top;
    //
    // let current = this.getBox(this.selection.index + this.indexOffset);
    //
    // const cX = x - this.offsetX + current.width/2;
    // const cY = y - this.offsetY + current.height/2;
    //
    // // const movingBox = {
    // //   x: deltaX - this.offsetX,
    // //   y: deltaY - this.offsetY,
    // //   width: current.width,
    // //   height: current.height
    // // };
    //
    //
    // const index = this.findIndex(cX, cY);
    //
    // const col = this.getCol(index);
    // const row = this.getRow(index);
    // // const colHeader = row < 0;
    // // const rowHeader = col < 0;
    // // const colFooter = row >= this.colCount;
    // // const rowFooter = col >= this.rowCount;
    //
    // let isValidTarget = false
    //
    // if (this.onValidateDrop) {
    //
    //   isValidTarget = await this.onCheck(col, row);
    //
    // }

    if (this.target > -1) {
      this.children[this.target].classList.remove("drop-active");
    }


    this.sliceSegment(this.selection).forEach(element => {
      element.classList.remove("drag");
      element.style.transform = "none";
    });

    if (this.target > -1 && this.getRow(this.target) !== this.selection.index + this.indexOffset) {
      const targetElement = this.children[this.target];
      const col = this.getCol(this.target);
      const row = this.getRow(this.target);
      if (targetElement.dropZone) {
        this.sliceSegment(this.selection).forEach(element => {
          // element.classList.add("hidden");

          const deltaX = targetElement.offsetLeft - element.offsetLeft;
          const deltaY = targetElement.offsetTop - element.offsetTop;

          element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });
        this.onDrop(col, row);
      }
    }



  }

  update() {

    if (this.selection) {

      const x = this.mouseX - this.box.left;
      const y = this.mouseY - this.box.top;

      // if (this.underIndex > -1) {
      //   this.sliceSegment({index: this.underIndex, length: 1}).forEach(element => element.classList.remove("drop-active"));
      // }
      //
      // this.underIndex = this.findIndex(x, y, this.dropzones);
      //
      // if (this.underIndex > -1) {
      //   this.sliceSegment({index: this.underIndex, length: 1}).forEach(element => element.classList.add("drop-active"));
      // }

      let current = this.getBox(this.selection.index + this.indexOffset);

      const movingBox = {
        x: x - this.offsetX,
        y: y - this.offsetY,
        width: current.width,
        height: current.height
      };

      const cX = movingBox.x + movingBox.width/2;
      const cY = movingBox.y + movingBox.height/2;

      const index = this.findElementIndex(cX, cY);

      if (this.target !== index) {
        if (this.target > -1) {
          this.children[this.target].classList.remove("drop-active");
        }
        this.target = index;
        const row = this.getRow(index);
        if (index > -1 && (row < this.selection.index || row >= this.selection.index + this.indexOffset)) {
          this.children[this.target].classList.add("drop-active");
        }
      }

      let offsetX = x - this.offsetX - current.x;
      let offsetY = y - this.offsetY - current.y;

      this.sliceSegment(this.selection).forEach(element => element.style.transform = `translate(${offsetX}px, ${offsetY}px)`);

    }

  }




}
