import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { EditorImage, SelectionGroup } from "types/image";
import { Selection, SelectionPoint } from "types/selection";
import { Tag } from "types/tag";
import Vector2 from "types/vector2";

@Component
export default class EditorCanvas extends Vue {
  @Prop(EditorImage) readonly selectedImage?: EditorImage;
  @Prop(Tag) readonly selectedTag?: Tag;

  private readonly OFFSET_VALUE: number = 10;
  private selectionUID = 0;

  private previousMousePos?: Vector2;
  private scale = 1;
  private imageOffsetValue = new Vector2(0, 0);

  public editorCanvas?: HTMLCanvasElement;
  public editorContext?: CanvasRenderingContext2D;
  public canvasImage?: HTMLImageElement;

  public startTimestamp?: number;
  public newSelection?: Selection;
  public activeSelection?: Selection;
  public activePoints: Array<SelectionPoint> = new Array<SelectionPoint>();

  private isMouseDown = false;
  private isControlDown = false;

  mounted(): void {
    this.editorCanvas = this.$refs["editor-canvas"] as HTMLCanvasElement;
    this.editorContext = this.editorCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;

    // Begin Animation
    window.requestAnimationFrame(this.animationStep);

    // Resize Event
    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas);

    // Leave Page Event
    window.addEventListener("beforeunload", event => {
      this.onControlUp();
    });

    // Key Down Event
    window.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        this.endSelection();
      }

      if (event.key === "Control") {
        this.onControlUp();
      }
    });

    // Key Up Event
    window.addEventListener("keyup", event => {
      this.isControlDown = false;
      if (this.editorCanvas && !this.activeSelection) {
        this.editorCanvas.style.cursor = "default";
      }
    });
  }

  /**
   * Disables panning
   */
  onControlUp(): void {
    this.isControlDown = true;

    if (this.editorCanvas && !this.activeSelection) {
      this.editorCanvas.style.cursor = "move";
    }
  }

  @Watch("selectedImage")
  onSelectedImageChanged(image: EditorImage) {
    if (!this.editorContext) return;

    if (image) {
      this.canvasImage = new Image();
      this.canvasImage.src = image.encodedImage;

      this.canvasImage.onload = () => {
        this.centreScaleImage();
      };
    } else {
      this.clearCanvas();
    }
  }

  /**
   * Handles the mouse wheel event and zoom logic
   * @param e
   */
  mouseWheel(e: WheelEvent): void {
    if (!this.editorCanvas) return;

    e.preventDefault();

    const mousePos = this.getRelativeMousePos(this.editorCanvas, e);

    const val = this.scale + e.deltaY * -0.02;
    const previousScale = this.scale;

    // Scale within restrictions
    this.scale = Math.min(Math.max(0.125, val), 4);

    // Calculate difference of mouse position relative to image and scale
    const InsetPos = new Vector2(
      mousePos.x - this.imageOffsetValue.x,
      mousePos.y - this.imageOffsetValue.y
    );
    const offsetScaleDifference = new Vector2(
      InsetPos.x / previousScale - InsetPos.x / this.scale,
      InsetPos.y / previousScale - InsetPos.y / this.scale
    );

    // Update offset position by the difference of previous inset position and current inset position with scales applied.
    this.imageOffsetValue.x -= offsetScaleDifference.x * this.scale;
    this.imageOffsetValue.y -= offsetScaleDifference.y * this.scale;
  }

  /**
   * Handles whether a selection should be created or edited, or whether to pan.
   * @param e
   */
  mouseDown(e: MouseEvent): void {
    this.isMouseDown = true;

    if (this.isControlDown) return;
    if (
      !this.editorContext ||
      !this.editorCanvas ||
      !this.selectedImage?.encodedImage ||
      !this.selectedTag ||
      this.selectedTag.name === ""
    )
      return;

    const mousePos: Vector2 = this.getRelativeMousePos(this.editorCanvas, e);
    const scaledMousePos = new Vector2(
      Math.round((mousePos.x - this.imageOffsetValue.x) / this.scale),
      Math.round((mousePos.y - this.imageOffsetValue.y) / this.scale)
    );
    const selectionCheck = this.checkSelectionAnchors(scaledMousePos);

    if (selectionCheck) {
      this.activeSelection = selectionCheck.foundSelection;
      this.activePoints = selectionCheck.foundPoints;
    }

    // Create New Selection
    if (this.activeSelection === undefined && this.activePoints.length === 0) {
      this.activeSelection = this.newSelection = new Selection(
        this.selectionUID++,
        scaledMousePos
      );
      this.activePoints.push(SelectionPoint.c);
    }
  }

  /**
   * Handles point updating of selections and panning,
   * @param e
   */
  mouseMove(e: MouseEvent): void {
    if (!this.editorContext || !this.editorCanvas) return;

    const mousePos = this.getRelativeMousePos(this.editorCanvas, e);
    if (!this.previousMousePos) this.previousMousePos = mousePos;

    const mousePosOffset = new Vector2(
      mousePos.x - this.previousMousePos.x,
      mousePos.y - this.previousMousePos.y
    );

    if (this.isControlDown && !this.activeSelection) {
      // Pan Mode
      if (this.isMouseDown) {
        this.imageOffsetValue.x += mousePosOffset.x;
        this.imageOffsetValue.y += mousePosOffset.y;
      }
    } else {
      // Selection Handling
      const scaledMousePos = new Vector2(
        Math.round((mousePos.x - this.imageOffsetValue.x) / this.scale),
        Math.round((mousePos.y - this.imageOffsetValue.y) / this.scale)
      );
      if (!this.activeSelection) {
        this.checkSelectionAnchors(scaledMousePos);
      } else {
        const scaledPreviousMousePos = new Vector2(
          Math.round(
            (this.previousMousePos.x - this.imageOffsetValue.x) / this.scale
          ),
          Math.round(
            (this.previousMousePos.y - this.imageOffsetValue.y) / this.scale
          )
        );
        const scaledMousePosOffset = new Vector2(
          scaledMousePos.x - scaledPreviousMousePos.x,
          scaledMousePos.y - scaledPreviousMousePos.y
        );
        if (scaledPreviousMousePos && this.activePoints) {
          for (let i = 0, j = 3; i <= j; i++) {
            const point = this.activeSelection.genericPointGet(i);
            const newPointValue = new Vector2(
              point.x + scaledMousePosOffset.x,
              point.y + scaledMousePosOffset.y
            );

            if (this.activePoints.includes(i)) {
              this.activeSelection.genericPointSet(i, newPointValue);
            }
          }
        }
      }
    }

    this.previousMousePos = mousePos;
  }

  /**
   * Finalises creating a selection or ending panning
   * @param e
   */
  mouseUp(e: MouseEvent): void {
    this.isMouseDown = false;

    if (this.newSelection && this.activeSelection) {
      this.createNewSelection(this.newSelection);
    }

    this.endSelection();
  }

  /**
   * Clears active selections
   */
  endSelection(): void {
    if (this.activeSelection) {
      this.activePoints = new Array<SelectionPoint>();
    }

    this.previousMousePos = this.activeSelection = this.newSelection = undefined;
  }

  /**
   * Add selection to selected images tag array by specific tag name
   * @param selection
   */
  createNewSelection(selection: Selection) {
    if (!this.selectedImage || !this.selectedTag) return;

    let selectionBasedTag = this.selectedImage.selectionGroup.find(
      group => group.linkedTag.id === this.selectedTag?.id
    );

    if (!selectionBasedTag) {
      const newSelectionTag = new SelectionGroup(this.selectedTag);
      const tagIndex = this.selectedImage.selectionGroup.push(newSelectionTag);
      selectionBasedTag = this.selectedImage.selectionGroup[tagIndex - 1];
    }

    selectionBasedTag.selections.push(selection);
  }

  /**
   * Check mouse position against each selection and their anchors, returning matching points and selections
   * @param mousePos
   */
  checkSelectionAnchors(
    mousePos: Vector2
  ): { foundPoints: Array<SelectionPoint>; foundSelection: Selection } | void {
    if (!this.editorContext || !this.editorCanvas || !this.selectedImage)
      return;

    const foundPoints = new Array<SelectionPoint>();
    let foundSelection: Selection | undefined;

    for (const tag of this.selectedImage.selectionGroup) {
      for (const selection of tag.selections) {
        for (let i = 0, j = 3; i <= j; i++) {
          const currPoint = selection.genericPointGet(i);
          const nextPoint = selection.genericPointGet((i + 1) % 4);

          // Check mouse is withing point
          if (
            this.isWithin(
              mousePos,
              this.offsetVectorByNumber(currPoint, -this.OFFSET_VALUE),
              this.offsetVectorByNumber(currPoint, this.OFFSET_VALUE)
            )
          ) {
            foundPoints.push(i);

            // Set cursor style - accounts for when points are flipped
            if (
              selection.a.x < selection.c.x ===
              selection.a.y < selection.c.y
            ) {
              this.editorCanvas.style.cursor =
                currPoint.x === nextPoint.x ? "nesw-resize" : "nwse-resize";
            } else {
              this.editorCanvas.style.cursor =
                currPoint.x === nextPoint.x ? "nwse-resize" : "nesw-resize";
            }

            // Break out of loop if point is found.
            break;
          }
        }

        // Check Whole Selection
        let aOffset: Vector2;
        let cOffset: Vector2;
        // Offset 'a', 'c' values depending on their relative position to each other.
        if (selection.a.x < selection.c.x && selection.a.y < selection.c.y) {
          aOffset = this.offsetVectorByNumber(
            selection.a,
            this.OFFSET_VALUE / 2
          );
          cOffset = this.offsetVectorByNumber(
            selection.c,
            -this.OFFSET_VALUE / 2
          );
        } else {
          aOffset = this.offsetVectorByNumber(
            selection.a,
            -this.OFFSET_VALUE / 2
          );
          cOffset = this.offsetVectorByNumber(
            selection.c,
            this.OFFSET_VALUE / 2
          );
        }

        if (
          (foundPoints.length === 0, this.isWithin(mousePos, aOffset, cOffset))
        ) {
          foundPoints.push(SelectionPoint.a, SelectionPoint.c);
          this.editorCanvas.style.cursor = "move";
        }

        if (foundPoints.length > 0) {
          foundSelection = selection;
          break;
        }
      }
      if (foundSelection) {
        break;
      }
    }

    if (foundPoints.length > 0 && foundSelection) {
      return { foundPoints: foundPoints, foundSelection: foundSelection };
    } else {
      this.editorCanvas.style.cursor = "crosshair";
    }
  }

  /**
   * Check if point a is within point b and c
   * @param a
   * @param b
   * @param c
   */
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
    const mousePosX = e.clientX - rect.left;
    const mousePosY = e.clientY - rect.top;

    return new Vector2(mousePosX, mousePosY);
  }

  /**
   * Clear then draw the selection image and it's selections on the canvas
   * @param timestamp
   */
  animationStep(timestamp: number): void {
    if (this.startTimestamp === undefined) {
      this.startTimestamp = timestamp;
    }

    // Draw canvas
    if (this.editorCanvas && this.editorContext && this.selectedImage) {
      this.clearCanvas();

      // Draw image
      this.drawImage();

      // Draw new selection rectangle
      if (this.newSelection && this.selectedTag) {
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

  /**
   * Resize the canvas based on the height and width set by CSS
   */
  resizeCanvas(): void {
    if (!this.editorCanvas?.parentElement) return;

    this.editorCanvas.height = this.editorCanvas.parentElement.clientHeight;
    this.editorCanvas.width = this.editorCanvas.parentElement.clientWidth;

    this.centreScaleImage();
  }

  /**
   * Centers and scales image on canvas
   */
  centreScaleImage(): void {
    if (!this.canvasImage || !this.editorCanvas) return;

    // Scale image to fit canvas
    if (this.canvasImage.width > this.canvasImage.height) {
      this.scale =
        this.canvasImage.height > this.editorCanvas.height
          ? this.editorCanvas.height / this.canvasImage.height
          : 1;
    } else {
      this.scale =
        this.canvasImage.width > this.editorCanvas.width
          ? this.editorCanvas.width / this.canvasImage.width
          : 1;
    }

    // Centre image
    this.imageOffsetValue.x =
      this.editorCanvas.width / 2 - (this.canvasImage.width * this.scale) / 2;
    this.imageOffsetValue.y =
      this.editorCanvas.height / 2 - (this.canvasImage.height * this.scale) / 2;
  }

  /**
   * Handles drawing the canvasImage, taking into account scale and offset
   */
  drawImage(): void {
    if (!this.editorContext || !this.editorCanvas || !this.canvasImage) return;

    this.editorContext.drawImage(
      this.canvasImage,
      this.imageOffsetValue.x,
      this.imageOffsetValue.y,
      this.canvasImage.width * this.scale,
      this.canvasImage.height * this.scale
    );
  }

  drawRectangle(selection: Selection, groupName: string): void {
    if (!this.editorContext || !this.editorCanvas) return;

    const relativeA = this.offsetVectorByVector(
      new Vector2(selection.a.x * this.scale, selection.a.y * this.scale),
      this.imageOffsetValue
    );
    const relativeB = this.offsetVectorByVector(
      new Vector2(selection.b.x * this.scale, selection.b.y * this.scale),
      this.imageOffsetValue
    );
    const relativeC = this.offsetVectorByVector(
      new Vector2(selection.c.x * this.scale, selection.c.y * this.scale),
      this.imageOffsetValue
    );
    const relativeD = this.offsetVectorByVector(
      new Vector2(selection.d.x * this.scale, selection.d.y * this.scale),
      this.imageOffsetValue
    );

    const colorHex = selection.isHighlighted ? "#0000FF" : "#FF0000";

    // Animate/Draw Here
    // Stroke
    this.editorContext.strokeStyle = colorHex;
    this.editorContext.strokeRect(
      relativeA.x,
      relativeA.y,
      selection.relHeight * this.scale,
      selection.relWidth * this.scale
    );

    // Anchors
    this.editorContext.fillStyle = colorHex;
    this.editorContext.fillRect(relativeA.x - 3, relativeA.y - 3, 6, 6);
    this.editorContext.fillRect(relativeB.x - 3, relativeB.y - 3, 6, 6);
    this.editorContext.fillRect(relativeC.x - 3, relativeC.y - 3, 6, 6);
    this.editorContext.fillRect(relativeD.x - 3, relativeD.y - 3, 6, 6);

    // Text
    const topLeft = selection.findTopLeft();
    const relativeTopLeft = this.offsetVectorByVector(
      new Vector2(topLeft.x * this.scale, topLeft.y * this.scale),
      this.imageOffsetValue
    );

    this.editorContext.font = "16px roboto";
    this.editorContext.fillText(
      groupName,
      relativeTopLeft.x + 5,
      relativeTopLeft.y + 19
    );
  }

  clearCanvas(): void {
    if (!this.editorContext || !this.editorCanvas) return;

    this.editorContext.clearRect(
      0,
      0,
      this.editorCanvas.width,
      this.editorCanvas.height
    );
  }
}
