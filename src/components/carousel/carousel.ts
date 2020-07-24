import { Component, Vue, Prop } from "vue-property-decorator";
import { EditorImage } from "types/image";

@Component
export default class Carousel extends Vue {
  @Prop() readonly images?: Array<EditorImage>;
  @Prop() readonly selectedImage?: EditorImage;

  selectImage(image: EditorImage) {
    this.$emit('image-selected', image);
  }
}