import { Component, Vue, Prop } from "vue-property-decorator";

import JsonHandler from "services/json-handler";
import { Tag } from "types/tag";
import { EditorImage } from "types/image";
import { Selection } from "types/selection";

@Component
export default class ImageUpload extends Vue {
  @Prop(Array) readonly tags?: Array<Tag>;
  @Prop(Tag) readonly selectedTag?: Tag;
  @Prop(Array) readonly images?: Array<EditorImage>;
  @Prop(EditorImage) readonly selectedImage?: EditorImage;

  private readonly jsonHandler = new JsonHandler();

  private tagUID = 1;
  public tagNameInput = "";
  public activeBranches = new Array<number>();

  /**
   * Add tag to tag array, doesn't allow for duplicates
   */
  createTag(): void {
    if (!this.tagNameInput || !this.tags) return;

    // check that tag doesn't already exist
    if (
      this.tags.find(
        tag => this.tagNameInput.toLowerCase() === tag.name.toLowerCase()
      )
    ) {
      // todo - show little tooltip.
    } else {
      const tag = new Tag(this.tagUID++, this.tagNameInput);
      this.tags.push(tag);
    }

    this.tagNameInput = "";
  }

  selectTag(tagToSelect: Tag): void {
    this.$emit("tag-selected", tagToSelect);
  }

  /**
   * Remove tag from tags array, removing selections related to that tag from each image
   * @param tagToDelete
   */
  deleteTag(tagToDelete: Tag): void {
    if (!this.tags || !this.images) return;

    // Remove tag from tags array
    const tagDeleteIndex = this.tags.findIndex(
      tag => tag.id === tagToDelete.id
    );
    this.tags.splice(tagDeleteIndex, 1);

    // Remove selection group linked to tag from all images
    this.images.forEach(image => {
      const groupDeleteIndex = image.selectionGroup.findIndex(
        group => group.linkedTag.id === tagToDelete.id
      );
      image.selectionGroup.splice(groupDeleteIndex, 1);
    });

    // If selected tag is delete, delete it. Due to Vue Prop management, the tag needs to be replaced with a placeholder.
    if (tagToDelete.id === this.selectedTag?.id) {
      this.$emit("tag-selected", new Tag(-1, ""));
    }
  }

  /**
   * Delete selection from specific image
   * @param relatedTag
   * @param selectionToDelete
   */
  deleteSelection(relatedTag: Tag, selectionToDelete: Selection) {
    if (!this.selectedImage) return;

    const relatedGroupIndex = this.selectedImage.selectionGroup.findIndex(
      group => group.linkedTag.id === relatedTag.id
    );
    const relatedGroup = this.selectedImage.selectionGroup[relatedGroupIndex];

    if (relatedGroup) {
      const selectionDeleteIndex = relatedGroup.selections.findIndex(
        selection => selection.id === selectionToDelete.id
      );
      relatedGroup.selections.splice(selectionDeleteIndex, 1);

      // If the selection group is now empty, delete it.
      if (relatedGroup.selections.length < 1) {
        this.selectedImage.selectionGroup.splice(relatedGroupIndex, 1);
      }
    }
  }

  /**
   * Toggle branch of tree view
   * @param tag
   */
  toggleBranch(tag: Tag): void {
    const foundIndex = this.activeBranches.indexOf(tag.id);

    if (foundIndex >= 0) {
      this.activeBranches.splice(foundIndex, 1);
    } else {
      this.activeBranches.push(tag.id);
    }
  }

  isBranchEnabled(tag: Tag): boolean {
    return this.activeBranches.includes(tag.id);
  }

  selectionsOfTag(tag: Tag): Array<Selection> | undefined {
    const foundGroup = this.selectedImage?.selectionGroup.find(
      group => group.linkedTag.id === tag.id
    );
    return foundGroup?.selections;
  }

  highlightSelection(selection: Selection, isHighlighted: boolean): void {
    selection.isHighlighted = isHighlighted;
  }

  download(): void {
    if (!this.images) return;

    this.jsonHandler.output(this.images);
  }
}
