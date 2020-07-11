import { Component, Vue } from "vue-property-decorator";

class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // todo - function that manages addition/subtraciton of two vector2's;
}

class Selection {
  public a: Vector2;
  public b: Vector2;
  
  constructor(pos: Vector2) {
    this.a = this.b = pos;
  }

  public setSecondary(pos: Vector2) {
    this.b = pos;
  }

  public moveRelative(offset: Vector2): void {
    this.a.x += offset.x;
    this.a.y += offset.y;
    this.b.x += offset.x;
    this.b.y += offset.y;
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
      // todo - check selection is in either of the four corners (within 10px?), calculate x/y top left and bottom right of deadzone.


      // Check selection is within centre but not within deadzone
      if (this.isWithin(mousePos, selection.a, selection.b)) {
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
      this.activeSelection.setSecondary(mousePos);
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
    // todo - no point to update if the mouse isn't active?

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

    // calculate the height and width of the selection based on start and end points.
    let height: number = Math.abs(selection.a.x - selection.b.x);
    let width: number = Math.abs(selection.a.y - selection.b.y);  
    // inverse the absolute number based on current mouse position compared to start position.
    if (selection.a.x > selection.b.x) height =- height;
    if (selection.a.y > selection.b.y) width =- width;  

    // Animate/Draw Here
    this.editorContext.strokeRect(selection.a.x, selection.a.y, height, width);
  }

  getMousePos(canvas: HTMLCanvasElement, e: MouseEvent): Vector2 {
    // https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas - relative mouse position
    const rect = canvas.getBoundingClientRect();
    return new Vector2(e.clientX - rect.left, e.clientY - rect.top);
  }
}