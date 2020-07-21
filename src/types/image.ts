import { Selection } from "types/selection";
import Vector2 from './vector2';

export class Tag {
  public selection?: Selection;
  public name?: string; // todo - name? Will need to come from a list of tags. defined by the user.

  constructor(pos: Vector2) {
    this.selection = new Selection(pos);
  }
}

export class Image {
  public readonly encodedImage: string;
  public readonly tags = new Array<Tag>();

  constructor(encodedImage: string) {
    this.encodedImage = encodedImage;
  }
}