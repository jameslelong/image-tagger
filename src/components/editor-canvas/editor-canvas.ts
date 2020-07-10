import { Component, Vue } from "vue-property-decorator";

class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Selection {
  public startPoint: Vector2;
  public endPoint: Vector2;

  constructor(startX: number, startY: number) {
    this.startPoint = this.endPoint = new Vector2(startX, startY);
  }

  public setEndPoint(endX: number, endY: number) {
    this.endPoint = new Vector2(endX, endY);
  }
}

// @Component needed?
@Component
export default class EditorCanvas extends Vue {
  // https://class-component.vuejs.org/
  public editorCanvas?: HTMLCanvasElement;
  public editorContext?: CanvasRenderingContext2D

  public startTimestamp?: number;
  public activeSelection?: Selection;
  public selections: Array<Selection> = new Array<Selection>();

  mounted(): void {
    this.editorCanvas = this.$refs["editor-canvas"] as HTMLCanvasElement;
    this.editorContext = this.editorCanvas.getContext("2d") as CanvasRenderingContext2D;

    // todo - needs to scale dynamically
    this.editorCanvas.height = 500;
    this.editorCanvas.width = 500;

    // Begin Animation
    window.requestAnimationFrame(this.animationStep);
  }

  beginSelection(e: MouseEvent): void {
    if (!this.editorContext|| !this.editorCanvas) return;
    
    const mousePos = this.getMousePos(this.editorCanvas, e);
    this.activeSelection = new Selection(mousePos.x, mousePos.y);
  }

  dragSelection(e: MouseEvent): void {
    if (!this.activeSelection || !this.editorCanvas) return;

    const mousePos = this.getMousePos(this.editorCanvas, e);
    this.activeSelection.setEndPoint(mousePos.x, mousePos.y);
  }

  endSelection(e: MouseEvent): void {
    if (!this.activeSelection) return;

    this.selections.push(this.activeSelection);

    this.activeSelection = undefined;

    // todo - capture start and end points. save rect.
  }

  animationStep(timestamp: number): void {
    // todo - no point to update if the mouse isn't active?

    if (this.startTimestamp === undefined) {
      this.startTimestamp = timestamp;
    }
    const elapsed = timestamp - this.startTimestamp;

    // clear canvas
    if (this.editorContext && this.editorCanvas) {
      this.editorContext.clearRect(0, 0, this.editorCanvas.width, this.editorCanvas.height);
      if (this.activeSelection) {
        this.drawRectangle(this.activeSelection);
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
    let height: number = Math.abs(selection.startPoint.x - selection.endPoint.x);
    let width: number = Math.abs(selection.startPoint.y - selection.endPoint.y);  
    // inverse the absolute number based on current mouse position compared to start position.
    if (selection.startPoint.x > selection.endPoint.x) height =- height;
    if (selection.startPoint.y > selection.endPoint.y) width =- width;  

    // Animate/Draw Here
    this.editorContext.strokeRect(selection.startPoint.x, selection.startPoint.y, height, width);
  }

  getMousePos(canvas: HTMLCanvasElement, e: MouseEvent): Vector2 {
    // https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas - relative mouse position
    const rect = canvas.getBoundingClientRect();
    return new Vector2(e.clientX - rect.left, e.clientY - rect.top);
  }
}