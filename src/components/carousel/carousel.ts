import { Component, Vue } from "vue-property-decorator";

@Component
export default class Carousel extends Vue {
  public isHighlighted = false;
  public readonly gallery = new Array<string>(); // todo - this will be an array of selections

  // https://codepen.io/raffo1234/pen/bZQXwZ

  // Image Upload
  setHighlight(value: boolean): void {
    this.isHighlighted = value;
  }

  onDrop(e: DragEvent): void {
    // todo -whats the t ype
    e.stopPropagation();
    e.preventDefault();

    this.setHighlight(false);
    const files = e.dataTransfer?.files;

    if (files && files.length > 0 ){
      for (const file of files) {
        console.log(file);
        this.createImage(file); 
      }
    }
    
  }

  onChange(): void {
    console.log('hey');
  }

  createImage(file: File): void {
    if (!file.type.match("image.*")) {
      // todo - toaster alert that some of the images uploaded are invalid.
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target && e.target.result && typeof e.target.result === "string") {
        this.gallery.push(e.target.result);
      }
    };

    reader.readAsDataURL(file);
  }
}