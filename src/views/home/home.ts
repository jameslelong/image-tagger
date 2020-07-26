import { Component, Vue } from "vue-property-decorator";

import Carousel from "components/carousel/carousel.vue";
import SettingsColumn from "components/settings-column/settings-column.vue";
import EditorCanvas from "components/editor-canvas/editor-canvas.vue";
import ImageUpload from "components/image-upload/image-upload.vue";

import { EditorImage } from "types/image";
import { Tag } from "types/tag";

@Component({
  components: {
    Carousel,
    SettingsColumn,
    EditorCanvas,
    ImageUpload
  }
})
export default class Home extends Vue {
  public readonly images = new Array<EditorImage>();
  public selectedImage: EditorImage = new EditorImage('', 0);
  public tags: Array<Tag> = new Array<Tag>();

  private imageUID = 0;

  createImage(encodedImage: string) {
    const newImage = new EditorImage(encodedImage, this.imageUID++);
    this.images.push(newImage);
  
    // replace the placeholder featured image with new image
    if (this.selectedImage.encodedImage === "") {
      this.selectImage(newImage);
    }
  }

  selectImage(image: EditorImage) {
    this.selectedImage = image;
  }
}
