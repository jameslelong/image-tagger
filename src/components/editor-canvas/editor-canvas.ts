import { Component, Vue } from "vue-property-decorator";

enum SelectionPoint {
  a,
  b,
  c,
  d
}

class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Selection {
  // todo - you shouldn't be able to set a and b directly.
  private _a: Vector2;
  private _b: Vector2;
  private _c: Vector2;
  private _d: Vector2;

  // these four points won't be very D.R.Y. or will they?
  get a(): Vector2 {
    return this._a;
  }

  // todo - when using setter, update related points, so A will update B/D but not C, etc, set their values by the rel height
  set a(pos: Vector2) {
    this._a = pos;

    this._b = new Vector2(pos.x, this.c.y);
    this._d = new Vector2(this.c.x, pos.y);
  }

  get b(): Vector2 {
    return this._b;
  }

  set b(pos: Vector2) {
    this._b = pos;

    this._a = new Vector2(this.d.x, pos.y);
    this._c = new Vector2(pos.x, this.d.y);
  }

  get c(): Vector2 {
    return this._c;
  }

  set c(pos: Vector2) {
    this._c = pos;

    this._b = new Vector2(pos.x, this.a.y);
    this._d = new Vector2(this.a.x, pos.y);
  }

  get d(): Vector2 {
    return this._d;
  }

  set d(pos: Vector2) {
    this._d = pos;

    this._a = new Vector2(this.b.x, pos.y);
    this._c = new Vector2(pos.x, this.b.y);
  }

  private _absHeight?: number;
  private _absWidth?: number;  

  get absHeight(): number {
    return Math.abs(this.a.x - this.c.x);
  }

  get absWidth(): number {
    return Math.abs(this.a.y - this.c.y);
  }

  private _relHeight?: number;
  private _relWidth?: number;

  get relHeight(): number {
    return this.a.x > this.c.x ? -this.absHeight : this.absHeight;
  }

  get relWidth(): number {
    return this.a.y > this.c.y ? -this.absWidth : this.absWidth;
  }

  constructor(pos: Vector2) {
    this._a = this._b = this._c = this._d = pos;
  }

  public moveSelection(offset: Vector2): void {
    this.a = new Vector2(this.a.x + offset.x, this.a.y += offset.y);
    this.c = new Vector2(this.c.x + offset.x, this.c.y += offset.y);
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
  public activePoints: Array<SelectionPoint> = new Array<SelectionPoint>();
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

    console.log(this.activePoints);

    // todo - allow for select multiple active points, this means I can update either all points, or just 2 or just 1.

    // todo - this is working well, but is not very D.R.Y., need to refactor, should go through all notes and update things, lil bit of cleaning. 
    for (const selection of this.selections) {
      if (this.isWithin(mousePos, this.offsetPoint(selection.a, -10), this.offsetPoint(selection.a, 10))) {
        this.activePoints.push(SelectionPoint.a);
      } else if (this.isWithin(mousePos, this.offsetPoint(selection.b, -10), this.offsetPoint(selection.b, 10))) {
        this.activePoints.push(SelectionPoint.b);
      } else if (this.isWithin(mousePos, this.offsetPoint(selection.c, -10), this.offsetPoint(selection.c, 10))) {
        this.activePoints.push(SelectionPoint.c);
      } else if (this.isWithin(mousePos, this.offsetPoint(selection.d, -10), this.offsetPoint(selection.d, 10))) {
        this.activePoints.push(SelectionPoint.d);
      } else if (this.isWithin(mousePos, selection.a, selection.c)) {
        this.activePoints.push(SelectionPoint.a, SelectionPoint.c);
      }

      if (this.activePoints.length > 0) {
        this.activeSelection = selection;
        break;
      }
    }

    if (this.activeSelection === undefined && this.activePoints.length === 0) {
      this.activeSelection = this.newSelection = new Selection(mousePos);
      this.activePoints.push(SelectionPoint.c);
    }
  }

  dragSelection(e: MouseEvent): void {
    if (!this.activeSelection || !this.editorCanvas) return;

    const mousePos = this.getMousePos(this.editorCanvas, e);

    if (this.activePoints.length === 1) {
      // only one point selected
      if (this.activePoints.includes(SelectionPoint.a)) {
        this.activeSelection.a = mousePos;
      }
      
      if (this.activePoints.includes(SelectionPoint.b)) {
        this.activeSelection.b = mousePos;
      }
      
      if (this.activePoints.includes(SelectionPoint.c)) {
        this.activeSelection.c = mousePos;
      }
      
      if (this.activePoints.includes(SelectionPoint.d)) {
        this.activeSelection.d = mousePos;
      }
    } else if (this.previousMousePosition !== undefined) {
      // todo - move multiple poitns at once, this does sort of work but seems to be conflicting with getters as the shape sort of changes as you drag it. See if I can get this working with getters.
      const offset: Vector2 = new Vector2(mousePos.x - this.previousMousePosition.x, mousePos.y - this.previousMousePosition.y);
      this.activeSelection.moveSelection(offset);
    }

    this.previousMousePosition = mousePos;
  }

  endSelection(e: MouseEvent): void {
    if (!this.activeSelection) return;

    if (this.newSelection !== undefined) {
      this.selections.push(this.newSelection);
    }

    this.activePoints = new Array<SelectionPoint>();
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
    this.editorContext.beginPath();
    this.editorContext.moveTo(selection.a.x, selection.a.y);
    this.editorContext.moveTo(selection.b.x, selection.b.y);
    this.editorContext.moveTo(selection.c.x, selection.c.y);
    this.editorContext.moveTo(selection.d.x, selection.d.y);
    this.editorContext.closePath();

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