import { Selection } from "types/selection";
import { Tag } from './tag';

export class SelectionGroup {
  public readonly linkedTag: Tag;
  public selections = new Array<Selection>();

  constructor(tag: Tag) {
    this.linkedTag = tag;
  }
}

export class EditorImage {
  public readonly id: number;
  public readonly encodedImage: string;
  public readonly selectionGroup = new Array<SelectionGroup>();
  
  constructor(id: number, encodedImage: string) {
    this.id = id;
    this.encodedImage = encodedImage;
  }
}