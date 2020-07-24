import { Selection } from "types/selection";

export class ImageTag {
  public selections: Array<Selection> = new Array<Selection>();
  public name: string;

  constructor(name: string) {
    this.name = name;
  }
}
export class Image {
  public readonly id: number;
  public readonly encodedImage: string;
  public readonly tags = new Array<ImageTag>();
  
  constructor(encodedImage: string, id: number) {
    this.id = id;
    this.encodedImage = encodedImage;
  }
}