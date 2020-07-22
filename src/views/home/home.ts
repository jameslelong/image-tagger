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
  public selectedImage: Image = new Image('', 0); // todo - allow for nullable objects to be used as props? Otherwise I have to do this :(

  private imageId = 0; // todo - this is just a temporary way to give an id to an image, it works but perhaps find a more graceful solution

  createImage(encodedImage: string) {
    const newImage = new Image(encodedImage, this.imageId++);
    this.images.push(newImage);
  
    // replace the placeholder featured image with new image
    if (this.selectedImage.encodedImage === "") {
      this.selectImage(newImage);
    }
  }

  selectImage(image: Image) {
    this.selectedImage = image;
  }
}
