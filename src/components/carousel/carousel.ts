import { Component, Vue, Prop } from "vue-property-decorator";
import { EditorImage } from "types/image";

@Component
export default class Carousel extends Vue {
  @Prop(Array) readonly images?: Array<EditorImage>;
  @Prop(EditorImage) readonly selectedImage?: EditorImage;

  public readonly imageWidth = 170;
  public carousel?: HTMLCanvasElement;
  public carouselOffset = 0;

  mounted(): void {
    this.carousel = this.$refs["carousel-main-inner"] as HTMLCanvasElement;  
  }

  selectImage(image: EditorImage) {
    this.$emit('image-selected', image);
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