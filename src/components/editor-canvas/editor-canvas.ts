import { Component, Vue } from "vue-property-decorator";
import { Selection, SelectionPoint } from "@/types/selection";
import Vector2 from "@/types/vector2";

@Component({})
export default class EditorCanvas extends Vue {
  // https://class-component.vuejs.org/
  public editorCanvas?: HTMLCanvasElement;
  public editorContext?: CanvasRenderingContext2D

  public startTimestamp?: number;
  public newSelection?: Selection;
  public activeSelection?: Selection;
  public activePoints: Array<SelectionPoint> = new Array<SelectionPoint>();
  public selections: Array<Selection> = new Array<Selection>();

  private readonly offsetValue: number = 10;
  private previousMousePos?: Vector2;

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

    // todo - Start Here
    // Better safezone handling (change deadzone to safezone)
    // Checks need to done mouse move (need to update dragSelection function), so I can display a icon.

    for (const selection of this.selections) {
      // note - looping over an enum gives double the values there is due to it storing strings and numbers, this solutions of statically looping numbers is more ideal as it allows me to avoid do unneccessary loops with isNan() checks.
      for (let i = 0, j = 3; i <= j; i++) {
        
        // Check individual point
        if (this.isWithin(mousePos, this.offsetPoint(selection.genericPointGet(i), -this.offsetValue), this.offsetPoint(selection.genericPointGet(i), this.offsetValue))) {
          this.activePoints.push(i);
          break;
        }

        // todo - check edge, need to make sure edge doesn't overlay corner.
        // Check between 2 points, using modulo to wrap number, so d wraps to a on final loop.
        // if (this.isWithin(mousePos, this.offsetPoint(selection.genericPointGet(i), -this.offsetValue), this.offsetPoint(selection.genericPointGet((i + 1) % 4), this.offsetValue))) {
        //   this.activePoints.push(i, (i + 1) % 4);
        //   break;
        // }

      }

      // todo - When offsetting this position, I need to a ccount for if a/b are top/bottom or bottom/top.
      if (this.activePoints.length === 0, this.isWithin(mousePos, selection.a, selection.c)) {
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

    if (this.previousMousePos !== undefined) {
      const offset: Vector2 = new Vector2(mousePos.x - this.previousMousePos.x, mousePos.y - this.previousMousePos.y);
      for (let i = 0, j = 3; i <= j; i++) {
        const point = this.activeSelection.genericPointGet(i);
        const offsetPos = new Vector2(point.x + offset.x, point.y + offset.y);
  
        if (this.activePoints.includes(i)) {
          this.activeSelection.genericPointSet(i, offsetPos);
        }  
      }
    }

    this.previousMousePos = mousePos;
  }

  endSelection(e: MouseEvent): void {
    if (!this.activeSelection) return;

    if (this.newSelection !== undefined) {
      this.selections.push(this.newSelection);
    }

    this.activePoints = new Array<SelectionPoint>();
    this.previousMousePos = this.activeSelection = this.newSelection = undefined;
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