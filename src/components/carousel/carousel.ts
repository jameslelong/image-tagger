import { Component, Vue, Prop } from "vue-property-decorator";
import { EditorImage } from "types/image";

@Component
export default class Carousel extends Vue {
  @Prop(Array) readonly images?: Array<EditorImage>;
  @Prop(EditorImage) readonly selectedImage?: EditorImage;

  selectImage(image: EditorImage) {
    this.$emit('image-selected', image);
  }
}