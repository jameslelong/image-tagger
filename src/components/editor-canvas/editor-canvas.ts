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
    const selectionCheck = this.checkSelectionAnchors(mousePos);

    if (selectionCheck) {
      this.activeSelection = selectionCheck.foundSelection;
      this.activePoints = selectionCheck.foundPoints; 
    }

    // Create New Selection
    if (this.activeSelection === undefined && this.activePoints.length === 0) {
      this.activeSelection = this.newSelection = new Selection(mousePos);
      this.activePoints.push(SelectionPoint.c);
    }
  }

  mouseMove(e: MouseEvent): void {
    if (!this.editorContext|| !this.editorCanvas) return;

    const mousePos = this.getMousePos(this.editorCanvas, e);

    if (!this.activeSelection) {
      this.checkSelectionAnchors(mousePos);
    } else {
      if (this.previousMousePos && this.activePoints) {
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
  }

  endSelection(e: MouseEvent): void {
    if (!this.activeSelection) return;

    if (this.newSelection !== undefined) {
      this.selections.push(this.newSelection);
    }

    this.activePoints = new Array<SelectionPoint>();
    this.previousMousePos = this.activeSelection = this.newSelection = undefined;
  }

  
  checkSelectionAnchors(mousePos: Vector2): { foundPoints: Array<SelectionPoint>, foundSelection: Selection } | void {
    if (!this.editorContext|| !this.editorCanvas) return;

    const foundPoints = new Array<SelectionPoint>();
    let foundSelection: Selection | undefined;

    for (const selection of this.selections) {
      // Loop each point of selection in loop
      for (let i = 0, j = 3; i <= j; i++) {
        // Check Point
        if (this.isWithin(mousePos, this.offsetPoint(selection.genericPointGet(i), -this.offsetValue), this.offsetPoint(selection.genericPointGet(i), this.offsetValue))) {
          foundPoints.push(i);
          this.editorCanvas.style.cursor = "nesw-resize"; // bottom left to top right
          //this.editorCanvas.style.cursor = "nwse-resize"; // bottom right to top left - todo - how to figure out which icon to display?
          break;
        }

        // Check Edge - Using modulo to wrap number, so 'd' wraps to 'a' on final loop. 
        // BUG - Appear to be able to select both an Edge & Whole Selection if I am close enough to a edge. This will be fixed by offsets I imagine, but it shouldn't be happening regardless?
        if (this.isWithin(mousePos, this.offsetPoint(selection.genericPointGet(i), -this.offsetValue), this.offsetPoint(selection.genericPointGet((i + 1) % 4), this.offsetValue))) {
          foundPoints.push(i, (i + 1) % 4);
          this.editorCanvas.style.cursor = "ew-resize";
          // this.editorCanvas.style.cursor = "ns-resize"; // todo - how to figure out which icon to display?
          break;
        }

      }

      // todo - When offsetting these vectors for the safe zone, I need to a ccount for if a/b are top/bottom or bottom/top.
      // Check Whole Selection
      if (foundPoints.length === 0, this.isWithin(mousePos, selection.a, selection.c)) {
        foundPoints.push(SelectionPoint.a, SelectionPoint.c);
        this.editorCanvas.style.cursor = "move";
      }

      if (foundPoints.length > 0) {
        foundSelection = selection;
        break;
      }
    }

    if (foundPoints.length > 0 && foundSelection) {
      return { foundPoints: foundPoints, foundSelection: foundSelection };
    } else {
      this.editorCanvas.style.cursor = "default";
    }
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