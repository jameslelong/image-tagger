import { Component, Vue } from "vue-property-decorator";

import Carousel from "components/carousel/carousel.vue";
import EditorCanvas from "components/editor-canvas/editor-canvas.vue";
import ImageUpload from "components/image-upload/image-upload.vue";

import { Image, Tag } from "types/image";

@Component({
  components: {
    Carousel,
    EditorCanvas,
    ImageUpload
  }
})
export default class Home extends Vue {
  public readonly images = new Array<Image>();
    
  createImage(encodedImage: string) {
    this.images.push(new Image(encodedImage));
  }
}
