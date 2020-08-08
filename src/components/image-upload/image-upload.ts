import { Component, Vue } from "vue-property-decorator";

@Component
export default class ImageUpload extends Vue {
  public isHighlighted = false;

  // Image Upload
  setHighlight(value: boolean): void {
    this.isHighlighted = value;
  }

  onDrop(e: DragEvent): void {
    e.stopPropagation();
    e.preventDefault();

    this.setHighlight(false);
    const files = e.dataTransfer?.files;

    if (files) {
      this.loopUpload(files);
    }
  }

  onChange(e: any): void {
    const files = e.target?.files;

    if (files) {
      this.loopUpload(files);
    }
  }

  loopUpload(files: FileList): void {
    if (files && files.length > 0 ){
      for (const file of files) {
        this.createImage(file); 
      }
    }
  }

  createImage(file: File): void {
    if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
      // todo - toaster alert that some of the images uploaded are invalid.
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target && e.target.result && typeof e.target.result === "string") {
        this.$emit('image-uploaded', file.name, e.target.result);
      }
    };

    reader.readAsDataURL(file);
  }
}