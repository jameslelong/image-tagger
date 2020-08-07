import { Component, Vue, Prop } from "vue-property-decorator";
import { EditorImage, SelectionGroup } from "types/image";

@Component
export default class Carousel extends Vue {
  @Prop(Array) readonly images?: Array<EditorImage>;
  @Prop(EditorImage) readonly selectedImage?: EditorImage;

  public readonly imageWidth = 170 * 2;
  public carousel?: HTMLCanvasElement;
  public carouselOffset = 0;

  mounted(): void {
    this.carousel = this.$refs["carousel-main-inner"] as HTMLCanvasElement;  
  }

  selectImage(image: EditorImage): void {
    this.$emit('image-selected', image);
  }

  deleteImage(imageToDelete: EditorImage): void {
    if (!this.images || !this.selectedImage) return;

    // Remove tag from library
    const imageDeleteIndex = this.images.findIndex(image => image.id === imageToDelete.id);

    // If image to delete is selected, select the image before or after it
    if (imageToDelete.id === this.selectedImage.id) {
      
      if (this.images.length > 1) {
        if (imageDeleteIndex > 0) {
          this.selectImage(this.images[imageDeleteIndex - 1]);
        } else {
          this.selectImage(this.images[imageDeleteIndex + 1]);
        }
      } else {
        this.selectImage(new EditorImage(-1, '', ''));
      }
    }
    
    // Delete image by index
    this.images.splice(imageDeleteIndex, 1);
  }
  
  prev(): void {
    if (!this.carousel) return;

    if (this.carouselOffset < 0) {
      this.carouselOffset += this.imageWidth;
      this.carousel.style.left = `${this.carouselOffset}px`;  
    }
  }

  next(): void {
    if (!this.carousel) return;

    const carouselParent = this.carousel.parentElement;
    if (carouselParent) {
      const carouselInnerWidth = this.carousel.clientWidth;
      const carouselParentWidth = carouselParent.clientWidth;

      if (carouselInnerWidth > carouselParentWidth && carouselParentWidth - carouselInnerWidth < this.carouselOffset) {
        this.carouselOffset -= this.imageWidth;
        this.carousel.style.left = `${this.carouselOffset}px`;  
      }
    }
  }
}