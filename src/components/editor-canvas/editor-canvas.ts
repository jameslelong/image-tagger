import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { EditorImage, EditorImageTag } from "types/image";

import { Selection, SelectionPoint } from "types/selection";
import Vector2 from "types/vector2";

@Component
export default class EditorCanvas extends Vue {
  @Prop(EditorImage) readonly selectedImage?: EditorImage;
  public canvasImage?: HTMLImageElement;

  private readonly OFFSET_VALUE: number = 10;
  
  public editorCanvas?: HTMLCanvasElement;
  public editorContext?: CanvasRenderingContext2D;

  public startTimestamp?: number;
  public newSelection?: Selection;
  public activeSelection?: Selection;
  public activePoints: Array<SelectionPoint> = new Array<SelectionPoint>();

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

  @Watch('selectedImage')
  onSelectedImageChanged(image: EditorImage) {
    if (!this.editorContext) return;

    this.canvasImage = new Image();
    this.canvasImage.src = image.encodedImage;
  }

  isWithin(a: Vector2, b: Vector2, c: Vector2): boolean {
    const withinX = (a.x < b.x && a.x > c.x) || (a.x > b.x && a.x < c.x);
    const withinY = (a.y < b.y && a.y > c.y) || (a.y > b.y && a.y < c.y);

    return withinX && withinY;
  }

  beginSelection(e: MouseEvent): void {
    if (!this.editorContext|| !this.editorCanvas || !this.selectedImage?.encodedImage) return;
    
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
    if (!this.activeSelection || !this.selectedImage) return;

    if (this.newSelection) {
      this.createNewSelection(this.newSelection);
    }

    this.activePoints = new Array<SelectionPoint>();
    this.previousMousePos = this.activeSelection = this.newSelection = undefined;
  }

  /**
   * Add selection to selected images tag array by specific tag name
   * @param selection
   */
  createNewSelection(selection: Selection) {
    if (!this.selectedImage) return;

    // todo - prompt for user to select tag from existing tag list before firing this function?
    // todo - should I just pass a ref to the tag itself? Instead of searching for it?
    const devTagName = "tag-name";
    let foundTag = this.selectedImage.tags.find(tag => tag.name === devTagName);

    if (!foundTag) {
      // Create Tag
      const newTag = new EditorImageTag(devTagName);
      const tagIndex = this.selectedImage.tags.push(newTag);
      foundTag = this.selectedImage.tags[tagIndex - 1];
    }

    foundTag.selections.push(selection);
  }
  
  checkSelectionAnchors(mousePos: Vector2): { foundPoints: Array<SelectionPoint>, foundSelection: Selection } | void {
    if (!this.editorContext|| !this.editorCanvas || !this.selectedImage) return;

    const foundPoints = new Array<SelectionPoint>();
    let foundSelection: Selection | undefined;

    for (const tag of this.selectedImage.tags) {
      for (const selection of tag.selections) {
        for (let i = 0, j = 3; i <= j; i++) {
          const currPoint = selection.genericPointGet(i);
          const nextPoint = selection.genericPointGet((i + 1) % 4);

          // Check Point
          if (this.isWithin(mousePos, this.offsetVectorByNumber(currPoint, -this.OFFSET_VALUE), this.offsetVectorByNumber(currPoint, this.OFFSET_VALUE))) {
            foundPoints.push(i);

            // Set cursor style - accounts for when points are flipped
            if (selection.a.x < selection.c.x === selection.a.y < selection.c.y) {
              this.editorCanvas.style.cursor = currPoint.x === nextPoint.x ? "nesw-resize" : "nwse-resize";
            } else {
              this.editorCanvas.style.cursor = currPoint.x === nextPoint.x ? "nwse-resize" : "nesw-resize";
            }
          }
        }

        // Check Whole Selection
        let aOffset: Vector2;
        let cOffset: Vector2;
        // Offset 'a', 'c' values depending on their relative position to each other.
        if (selection.a.x < selection.c.x && selection.a.y < selection.c.y) {
          aOffset = this.offsetVectorByNumber(selection.a, this.OFFSET_VALUE / 2);
          cOffset = this.offsetVectorByNumber(selection.c, -this.OFFSET_VALUE / 2);
        } else {
          aOffset = this.offsetVectorByNumber(selection.a, -this.OFFSET_VALUE / 2);
          cOffset = this.offsetVectorByNumber(selection.c, this.OFFSET_VALUE / 2);
        }
        
        if (foundPoints.length === 0, this.isWithin(mousePos, aOffset, cOffset)) {
          foundPoints.push(SelectionPoint.a, SelectionPoint.c);
          this.editorCanvas.style.cursor = "move";
        }

        if (foundPoints.length > 0) {
          foundSelection = selection;
          break;
        }
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
    if (this.editorContext && this.editorCanvas && this.selectedImage) {

      // Clear Canvas
      this.editorContext.clearRect(0, 0, this.editorCanvas.width, this.editorCanvas.height);

      // Draw image
      this.drawImage();

      // Draw new selection rectangle
      if (this.newSelection) {
        this.drawRectangle(this.newSelection);
      }
      
      // Draw selected image's selection rectangles
      for (const tag of this.selectedImage.tags) {
        for (const selection of tag.selections) {
          this.drawRectangle(selection);
        }
      }
    }

    window.requestAnimationFrame(this.animationStep);
  }

  drawImage(): void {
    if (!this.editorContext || !this.canvasImage) return;

    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    // todo - scale images, center, etc...
    this.editorContext.drawImage(this.canvasImage, 0, 0);
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

  offsetVectorByNumber(pos: Vector2, offset: number): Vector2 {
    return new Vector2(pos.x + offset, pos.y + offset);
  }

  getMousePos(canvas: HTMLCanvasElement, e: MouseEvent): Vector2 {
    // https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas - relative mouse position
    const rect = canvas.getBoundingClientRect();
    return new Vector2(e.clientX - rect.left, e.clientY - rect.top);
  }
}