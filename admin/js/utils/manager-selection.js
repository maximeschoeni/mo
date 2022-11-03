

KarmaFieldsAlpha.SelectionManager = class {

  constructor(container) {


    this.container = container;
    this.children = [...container.children];
    this.box = this.container.getBoundingClientRect();

    this.colCount = this.container.colCount || 1;
    this.rowCount = this.container.rowCount || 0;

    this.colHeader = this.container.colHeader || 0;
    this.colFooter = this.container.colFooter || 0;
    this.rowHeader = this.container.rowHeader || 0;
    this.rowFooter = this.container.rowFooter || 0;

    this.width = this.rowHeader + this.colCount + this.rowFooter;
    this.height = this.colHeader + this.rowCount + this.colFooter;

    // compat
    // if (!this.children.findLastIndex) {
    //   this.children.findLastIndex = callback => {
    //     for (let i = this.children.length - 1; i >= 0; i--) {
    //       if (callback(this.children[i], i, this.children)) {
    //         return i;
    //       }
    //     }
    //   }
    // }

  }

  select(event, col, row) {



    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    const x = this.mouseX - this.box.x;
    const y = this.mouseY - this.box.y;

    const index = this.findIndex(x, y);

    this.tie = {
      index: this.getRow(index),
      length: 1
    };


    Object.freeze(this.tie);

    if (this.selection) { // this.selection should be frozen
      if (event.shiftKey) {
        this.tie = this.selection;
      } else {
        this.sliceSegment(this.selection).forEach(element => element.classList.remove("selected"));
        this.selection = null;
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

      if (this.selection) {

        this.sliceSegment(this.selection).forEach(element => element.classList.replace("selecting", "selected"));

        if (this.onSelect) {

          // const hasChange = Boolean(!this.selection || !KarmaFieldsAlpha.Segment.compare(this.segment, this.selection));

          this.onSelect(this.selection, true); // compat

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

      this.growSelection({
        index: this.getRow(index),
        length: 1
      });

    }

    // const element = this.findElement(x, y);
    //
    //
    //
    // if (element && element.multiSelectable) {
    //
    //   this.growSelection({
    //     index: element.rowIndex,
    //     length: 1
    //   });
    //
    // }

  }


  getCol(index) {

    return (index%this.width) - this.rowHeader;

  }

  getRow(index) {

    return Math.floor(index/this.width) - this.colHeader;

  }

  getIndex(col, row) {

    return (row + this.colHeader)*this.width + col + this.rowHeader;

  }

  // use box not segment
  slice(col, row, width, height) {

    // return this.children.filter(element => element.multiSelectable && KarmaFieldsAlpha.Rect.contain(box, element.colIndex, element.rowIndex));

    const elements = [];

    for (let j = 0; j < height; j++) {

      for (let i = 0; i < width; i++) {

        const index = this.getIndex(i + col, j + row);
        const element = this.children[index];

        if (element) {

          elements.push(element);

        }

      }

    }

    return elements;
  }

  sliceRect(box) {

    return this.slice(box.x, box.y, box.width, box.height);

  }

  sliceSegment(segment) {

    return this.slice(0, segment.index, this.width, segment.length);

  }

  // sliceElements(segment) {
  //
  //   const elements = [];
  //
  //   for (let j = 0; j < segment.length; j++) {
  //
  //     for (let i = 0; i < this.colCount; i++) {
  //
  //       const index = this.getIndex(i, j + segment.index);
  //       const element = this.children[index];
  //
  //       elements.push(element);
  //     }
  //
  //   }
  //
  //   return elements;
  // }

  // getElementIndex(index) {
  //   // for (let i = 0; i < this.children.length; i++) {
  //   //   if (this.children[i].row === index) {
  //   //     return i;
  //   //   }
  //   // }
  //   return this.children.findIndex(element => element.row === index);
  // }
  //
  // getElementLastIndex(index) {
  //   // for (let i = this.children.length - 1; i >= 0; i--) {
  //   //   if (this.children[i].row === index) {
  //   //     return i;
  //   //   }
  //   // }
  //   return this.children.findLastIndex(element => element.row === index);
  // }


  // mapElements(segment) {
  //   const index = this.getElementIndex(segment.index);
  //   const lastIndex = this.getElementLastIndex(segment.index + segment.length);
  //
  //   return {
  //     index: index,
  //     length: lastIndex - index + 1,
  //   };
  //
  // }
  //
  // findIndex(section) {
  //   return this.children.findIndex(s);
  // }

  // findIndex(x, y) {
  //
  //   for (let j = this.colHeader; j < this.rowCount; j++) {
  //
  //     for (let i = this.rowHeader; i < this.colCount; i++) {
  //
  //       const index = j*this.width + i;
  //       const element = this.children[index];
  //       const box = this.getElementBox(element);
  //
  //       if (KarmaFieldsAlpha.Rect.contain(box, x, y)) {
  //         return index;
  //       }
  //
  //     }
  //
  //   }
  //
  //   return -1;
  // }

  findIndex(x, y) {

    for (let j = 0; j < this.rowCount; j++) {

      for (let i = 0; i < this.colCount; i++) {

        const index = this.getIndex(i, j);

        const element = this.children[index];

        if (y >= element.offsetTop && y < element.offsetTop + element.clientHeight) {

          if (x >= element.offsetLeft && x < element.offsetLeft + element.clientWidth) {

            return index;

          }

        } else {

          break;

        }

      }

    }

    return -1;
  }

  findElementIndex(x, y) {

    for (let j = 0; j < this.height; j++) {

      for (let i = 0; i < this.width; i++) {

        const index = j*this.width + i;
        const element = this.children[index];

        if (y >= element.offsetTop && y < element.offsetTop + element.clientHeight) {

          if (x >= element.offsetLeft && x < element.offsetLeft + element.clientWidth) {

            return index;

          }

        } else {

          break;

        }

      }

    }

    return -1;
  }

  // findElement(x, y) {
  //
  //   // for (let element of this.children) {
  //   //
  //   //   if (KarmaFieldsAlpha.Rect.contain(this.getElementBox(element), x, y)) {
  //   //
  //   //     return element;
  //   //
  //   //   }
  //   //
  //   // }
  //
  //   return this.children[this.findIndex(x, y)];
  //
  // }

  getBox(rowIndex, rowLength = 1) {

    const elementIndex = this.getIndex(0, rowIndex);
    const lastElementIndex = this.getIndex(0, rowIndex + rowLength) - 1;

    const first = this.children[elementIndex];
    const last = this.children[lastElementIndex];

    if (first && last) {

      return {
        x: first.offsetLeft,
        y: first.offsetTop,
        width: last.offsetLeft + last.clientWidth - first.offsetLeft,
        height: last.offsetTop + last.clientHeight - first.offsetTop
      };

    }

  }

  // getElementBox(element) {
  //
  //   return {
  //     x: element.offsetLeft,
  //     y: element.offsetTop,
  //     width: element.clientWidth,
  //     height: element.clientHeight
  //   };
  //
  // }
  //
  // getElementsBox(elements) {
  //
  //   if (elements.length) {
  //
  //     const first = elements[0];
  //     const last = elements[elements.length-1];
  //
  //     return {
  //       x: first.offsetLeft,
  //       y: first.offsetTop,
  //       width: last.offsetLeft + last.clientWidth - first.offsetLeft,
  //       height: last.offsetTop + last.clientHeight - first.offsetTop
  //     };
  //
  //   }
  //
  // }

  // getBox(index, length = 1) {
  //
  //   const elements = this.sliceElements({
  //     index: index,
  //     length: length
  //   });
  //
  //   return this.getElementsBox(elements);
  // }


  growSelection(segment) {

    const union = KarmaFieldsAlpha.Segment.union(this.tie, segment);

    if (!this.selection || !KarmaFieldsAlpha.Segment.compare(union, this.selection)) {

      if (this.selection) {

        this.sliceSegment(this.selection).forEach(element => element.classList.remove("selecting"));

      }

      this.selection = union;

      Object.freeze(this.selection);

      this.sliceSegment(this.selection).forEach(element => element.classList.add("selecting"));

    }

  }

  clear(segment = this.selection) {

    if (segment) {

      this.sliceSegment(segment).forEach(element => element.classList.remove("selected"));

    }

  }




}
