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
  // todo - start here, assign selection to selected tag
  public readonly images = new Array<EditorImage>();
  public selectedImage: EditorImage = new EditorImage(-1, '', '');
  public readonly tags: Array<Tag> = new Array<Tag>();
  public selectedTag: Tag = new Tag(-1, '');

  private imageUID = 0;

  createImage(name: string, encodedImage: string) {
    // Check that image doesn't already exist in the library
    if (this.images.find(image => image.encodedImage === encodedImage)) return;

    const newImage = new EditorImage(this.imageUID++, name, encodedImage);
    this.images.push(newImage);
  
    // replace the placeholder featured image with new image
    if (this.selectedImage.encodedImage === "") {
      this.selectImage(newImage);
    }
  }

  selectTag(tag: Tag) {
    this.selectedTag = tag;
  }

  selectImage(image: EditorImage) {
    this.selectedImage = image;
  }
}
