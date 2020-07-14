import { Component, Vue } from "vue-property-decorator";

class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(toAdd: Vector2): void {
    // Add vector 2 to the vector 2's class. 
    this.x += toAdd.x;
    this.y += toAdd.y;
  }
  // todo - function that manages addition/subtraciton of two vector2's;
}

class Selection {
  // todo - you shouldn't be able to set a and b directly.
  public a: Vector2;
  public b: Vector2; 

  private _absHeight?: number;
  private _absWidth?: number;  

  get absHeight(): number {
    return Math.abs(this.a.x - this.b.x);
  }

  get absWidth(): number {
    return Math.abs(this.a.y - this.b.y);
  }

  private _relHeight?: number;
  private _relWidth?: number;

  get relHeight(): number {
    return this.a.x > this.b.x ? -this.absHeight : this.absHeight;
  }

  get relWidth(): number {
    return this.a.y > this.b.y ? -this.absWidth : this.absWidth;
  }

  // todo - C&D are the two other points, these vectors are generated from the height/width
  // todo - the names c/d may be a little confusing when trying to actuall get the data.
  private _c?: Vector2;
  private _d?: Vector2;

  get c(): Vector2 {
    const x = this.a.x + this.relHeight;
    const y = this.a.y;
    return new Vector2(x, y);
  }

  get d(): Vector2 {
    const x = this.b.x - this.relHeight;
    const y = this.b.y;
    return new Vector2(x, y);
  }

  constructor(pos: Vector2) {
    this.a = this.b = pos;
  }

  public setb(pos: Vector2): void {
    this.b = pos;
  }

  public moveRelative(offset: Vector2): void {
    this.a.add(offset);
    this.b.add(offset);
  }
}

// @Component needed?
@Component
export default class EditorCanvas extends Vue {
  // https://class-component.vuejs.org/
  public editorCanvas?: HTMLCanvasElement;
  public editorContext?: CanvasRenderingContext2D

  public startTimestamp?: number;
  public newSelection?: Selection;
  public activeSelection?: Selection;
  public selections: Array<Selection> = new Array<Selection>();

  private previousMousePosition?: Vector2;

  mounted(): void {
    this.editorCanvas = this.$refs["editor-canvas"] as HTMLCanvasElement;
    this.editorContext = this.editorCanvas.getContext("2d") as CanvasRenderingContext2D;

    // todo - needs to scale dynamically
    this.editorCanvas.height = 500;
    this.editorCanvas.width = 500;

    // Begin Animation
    window.requestAnimationFrame(this.animationStep);
  }

  isWithin(a: Vector2, b: Vector2, c: Vector2): boolean {
    const withinX = (a.x < b.x && a.x > c.x) || (a.x > b.x && a.x < c.x);
    const withinY = (a.y < b.y && a.y > c.y) || (a.y > b.y && a.y < c.y);

    return withinX && withinY;
  }

  beginSelection(e: MouseEvent): void {
    if (!this.editorContext|| !this.editorCanvas) return;
    
    const mousePos: Vector2 = this.getMousePos(this.editorCanvas, e);
    
    // todo - Check if selection is within the safe zone around a point, or within
    for (const selection of this.selections) {
      // todo - START HERE - the logic of 'active selection' will need to change to allow for mouth movement to be bound to a point.
      // todo - ALSO - this vector math is very verbose, would be nice to be able to do it cleaner without affecting the original class value.
      if (this.isWithin(mousePos, this.offsetPoint(selection.a, -5), this.offsetPoint(selection.a, 5))) {
        console.log("Within A");
      } else if (this.isWithin(mousePos, this.offsetPoint(selection.b, -5), this.offsetPoint(selection.b, 5))) {
        console.log("Within B");
      } else if (this.isWithin(mousePos, this.offsetPoint(selection.c, -5), this.offsetPoint(selection.c, 5))) {
        console.log("Within C");
      } else if (this.isWithin(mousePos, this.offsetPoint(selection.d, -5), this.offsetPoint(selection.d, 5))) {
        console.log("Within D");
      } else if (this.isWithin(mousePos, selection.a, selection.b)) {
        // within center, but not a corner deadzone.
        this.activeSelection = selection;
      }
    }

    if (this.activeSelection === undefined) {
      this.activeSelection = this.newSelection = new Selection(mousePos);
    }
  }

  dragSelection(e: MouseEvent): void {
    if (!this.activeSelection || !this.editorCanvas) return;

    const mousePos = this.getMousePos(this.editorCanvas, e);
    if (this.newSelection !== undefined) {
      // Set end point of new selection
      this.activeSelection.setb(mousePos);
    } else if (this.previousMousePosition !== undefined) {
      // Move position of existing
      const offset: Vector2 = new Vector2(mousePos.x - this.previousMousePosition.x, mousePos.y - this.previousMousePosition.y);
      this.activeSelection.moveRelative(offset);
    }

    this.previousMousePosition = mousePos;
  }

  endSelection(e: MouseEvent): void {
    if (!this.activeSelection) return;

    if (this.newSelection !== undefined) {
      this.selections.push(this.newSelection);
    }
    
    this.previousMousePosition = this.activeSelection = this.newSelection = undefined;
  }

  animationStep(timestamp: number): void {
    if (this.startTimestamp === undefined) {
      this.startTimestamp = timestamp;
    }
    const elapsed = timestamp - this.startTimestamp;
    
    // Redraw canvas
    if (this.editorContext && this.editorCanvas) {
      this.editorContext.clearRect(0, 0, this.editorCanvas.width, this.editorCanvas.height);
      if (this.newSelection) {
        this.drawRectangle(this.newSelection);
      }
      for (const selection of this.selections) {
        this.drawRectangle(selection);
      }
    }

    window.requestAnimationFrame(this.animationStep);
  }

  drawRectangle(selection: Selection): void {
    if (!this.editorContext || !this.editorCanvas) return;

    // Animate/Draw Here
    this.editorContext.strokeRect(selection.a.x, selection.a.y, selection.relHeight, selection.relWidth);

    // draw points, a,b,c,d - todo - proper debugger mode
    this.editorContext.fillRect(selection.a.x - 3, selection.a.y - 3, 6, 6);
    this.editorContext.fillRect(selection.b.x - 3, selection.b.y - 3, 6, 6);
    this.editorContext.fillRect(selection.c.x - 3, selection.c.y - 3, 6, 6);
    this.editorContext.fillRect(selection.d.x - 3, selection.d.y - 3, 6, 6);

    this.editorContext.fillText('a', selection.a.x - 8, selection.a.y - 3);
    this.editorContext.fillText('b', selection.b.x - 8, selection.b.y - 3);
    this.editorContext.fillText('c', selection.c.x - 8, selection.c.y - 3);
    this.editorContext.fillText('d', selection.d.x - 8, selection.d.y - 3);
  }

  offsetPoint(pos: Vector2, offset: number): Vector2 {
    return new Vector2(pos.x + offset, pos.y + offset);
  }

  getMousePos(canvas: HTMLCanvasElement, e: MouseEvent): Vector2 {
    // https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas - relative mouse position
    const rect = canvas.getBoundingClientRect();
    return new Vector2(e.clientX - rect.left, e.clientY - rect.top);
  }
}