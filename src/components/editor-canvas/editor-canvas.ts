import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { EditorImage, SelectionGroup } from "types/image";
import { Selection, SelectionPoint } from "types/selection";
import { Tag } from 'types/tag';
import Vector2 from "types/vector2";

@Component
export default class EditorCanvas extends Vue {
  @Prop(EditorImage) readonly selectedImage?: EditorImage;
  @Prop(Tag) readonly selectedTag?: Tag;

  private readonly OFFSET_VALUE: number = 10;

  public editorCanvas?: HTMLCanvasElement;
  public editorContext?: CanvasRenderingContext2D;
  public canvasImage?: HTMLImageElement;

  public startTimestamp?: number;
  public newSelection?: Selection;
  public activeSelection?: Selection;
  public activePoints: Array<SelectionPoint> = new Array<SelectionPoint>();

  private previousMousePos?: Vector2;
  private imageOffsetValue = new Vector2(0,0);

  mounted(): void {
    this.editorCanvas = this.$refs["editor-canvas"] as HTMLCanvasElement;
    this.editorContext = this.editorCanvas.getContext("2d") as CanvasRenderingContext2D;

    // Begin Animation
    window.requestAnimationFrame(this.animationStep);
    
    // Resize Event
    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas);
  }

  @Watch('selectedImage')
  onSelectedImageChanged(image: EditorImage) {
    if (!this.editorContext) return;

    this.canvasImage = new Image();
    this.canvasImage.src = image.encodedImage;
  }

  mouseDown(e: MouseEvent): void {
    // Todo - this is getting a bit overboard, all these checks are going to become too much
    if (!this.editorContext|| !this.editorCanvas || !this.selectedImage?.encodedImage || !this.selectedTag || this.selectedTag.name === "") return;
    
    const mousePos: Vector2 = this.getRelativeMousePos(this.editorCanvas, e);
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

    const mousePos = this.getRelativeMousePos(this.editorCanvas, e);

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

  mouseUp(e: MouseEvent): void {
    if (!this.activeSelection) return;

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
    if (!this.selectedImage || !this.selectedTag) return;

    let selectionBasedTag = this.selectedImage.selectionGroup.find(group => group.linkedTag.id === this.selectedTag?.id); // todo - why do I have to do the conditonal check here on the selectedTag?

    if (!selectionBasedTag) {
      const newSelectionTag = new SelectionGroup(this.selectedTag);
      const tagIndex = this.selectedImage.selectionGroup.push(newSelectionTag);
      selectionBasedTag = this.selectedImage.selectionGroup[tagIndex - 1];
    }

    selectionBasedTag.selections.push(selection);
  }
  
  checkSelectionAnchors(mousePos: Vector2): { foundPoints: Array<SelectionPoint>, foundSelection: Selection } | void {
    if (!this.editorContext|| !this.editorCanvas || !this.selectedImage) return;

    const foundPoints = new Array<SelectionPoint>();
    let foundSelection: Selection | undefined;

    for (const tag of this.selectedImage.selectionGroup) {
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
      this.editorCanvas.style.cursor = "crosshair";
    }
  }
  
  isWithin(a: Vector2, b: Vector2, c: Vector2): boolean {
    const isWithinX = (a.x < b.x && a.x > c.x) || (a.x > b.x && a.x < c.x);
    const isWithinY = (a.y < b.y && a.y > c.y) || (a.y > b.y && a.y < c.y);

    return isWithinX && isWithinY;
  }

  offsetVectorByNumber(pos: Vector2, offset: number): Vector2 {
    return new Vector2(pos.x + offset, pos.y + offset);
  }

  offsetVectorByVector(pos: Vector2, offset: Vector2): Vector2 {
    return new Vector2(pos.x + offset.x, pos.y + offset.y);
  }


  /**
   * Returns Mouse Position Vector2 relative to the canvasImage's top left point position.
   * @param canvas
   * @param e 
   */
  getRelativeMousePos(canvas: HTMLCanvasElement, e: MouseEvent): Vector2 {
    // https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas - relative mouse position

    const rect = canvas.getBoundingClientRect();
    const mousePosX = (e.clientX - rect.left) - this.imageOffsetValue.x;
    const mousePosY = (e.clientY - rect.top) - this.imageOffsetValue.y;
  
    return new Vector2(mousePosX, mousePosY);
  }

  animationStep(timestamp: number): void {
    if (this.startTimestamp === undefined) {
      this.startTimestamp = timestamp;
    }
    const elapsed = timestamp - this.startTimestamp;
    
    // Draw canvas
    if (this.editorCanvas && this.editorContext && this.selectedImage && this.selectedTag) {

      // Clear Canvas
      this.editorContext.clearRect(0, 0, this.editorCanvas.width, this.editorCanvas.height);

      // Draw image
      this.drawImage();

      // Draw new selection rectangle
      if (this.newSelection) {
        this.drawRectangle(this.newSelection, this.selectedTag.name);
      }
      
      // Draw selected image's selection rectangles
      for (const group of this.selectedImage.selectionGroup) {
        for (const selection of group.selections) {
          this.drawRectangle(selection, group.linkedTag.name);
        }
      }
    }

    window.requestAnimationFrame(this.animationStep);
  }

  resizeCanvas(): void {
    if (!this.editorCanvas?.parentElement || !this.editorContext) return;

    this.editorCanvas.height = this.editorCanvas.parentElement.clientHeight;
    this.editorCanvas.width = this.editorCanvas.parentElement.clientWidth;
    // this.editorCanvas.parentElement.clientWidth;
  }

  /**
   * Handles drawing the canvasImage in the center of the canvas
   */
  drawImage(): void {
    if (!this.editorContext || !this.editorCanvas || !this.canvasImage) return;

    this.imageOffsetValue.x = (this.editorCanvas.width / 2) - (this.canvasImage.width / 2);
    this.imageOffsetValue.y = (this.editorCanvas.height / 2) - (this.canvasImage.height / 2);

    this.editorContext.drawImage(this.canvasImage, this.imageOffsetValue.x, this.imageOffsetValue.y);
  }

  drawRectangle(selection: Selection, groupName: string): void {
    if (!this.editorContext || !this.editorCanvas) return;

    const relativeA = this.offsetVectorByVector(selection.a, this.imageOffsetValue);
    const relativeB = this.offsetVectorByVector(selection.b, this.imageOffsetValue);
    const relativeC = this.offsetVectorByVector(selection.c, this.imageOffsetValue);
    const relativeD = this.offsetVectorByVector(selection.d, this.imageOffsetValue);

    // Animate/Draw Here
    // Stroke
    this.editorContext.strokeStyle = "#FF0000";
    this.editorContext.strokeRect(relativeA.x, relativeA.y, selection.relHeight, selection.relWidth);

    // Anchors
    this.editorContext.fillStyle = "#FF0000";
    this.editorContext.fillRect(relativeA.x - 3, relativeA.y - 3, 6, 6);
    this.editorContext.fillRect(relativeB.x - 3, relativeB.y - 3, 6, 6);
    this.editorContext.fillRect(relativeC.x - 3, relativeC.y - 3, 6, 6);
    this.editorContext.fillRect(relativeD.x - 3, relativeD.y - 3, 6, 6);

    // Text
    this.editorContext.font = "20px roboto";
    this.editorContext.fillText(groupName, relativeA.x + 5, relativeA.y + 20);
  }
}