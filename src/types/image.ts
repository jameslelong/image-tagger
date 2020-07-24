import { Selection } from "types/selection";

export class EditorImageTag {
  public selections: Array<Selection> = new Array<Selection>();
  public name: string;

  constructor(name: string) {
    this.name = name;
  }
}
export class EditorImage {
  public readonly id: number;
  public readonly encodedImage: string;
  public readonly tags = new Array<EditorImageTag>();
  
  constructor(encodedImage: string, id: number) {
    this.id = id;
    this.encodedImage = encodedImage;
  }
}