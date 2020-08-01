import { Component, Vue, Prop } from "vue-property-decorator";
import { Tag } from "types/tag";
import { EditorImage } from '@/types/image';
import { Selection } from '@/types/selection';


@Component
export default class ImageUpload extends Vue {
  @Prop(Array) readonly tags?: Array<Tag>;
  @Prop(Tag) readonly selectedTag?: Tag;
  @Prop(Array) readonly images?: Array<EditorImage>;
  @Prop(EditorImage) readonly selectedImage?: EditorImage;

  private tagUID = 0;
  public tagNameInput = "";
  public activeBranches = new Array<number>();

  createTag(): void {
    if (!this.tagNameInput || !this.tags) return;

    // check that tag doesn't already exist
    if (this.tags.find(tag => this.tagNameInput.toLowerCase() === tag.name.toLowerCase())) {
      // todo - show little tooltip.
    } else {
      const tag = new Tag(this.tagUID++, this.tagNameInput);
      this.tags.push(tag);
    }

    this.tagNameInput = "";
  }

  selectTag(tagToSelect: Tag): void {
    this.$emit('tag-selected', tagToSelect);
  }

  deleteTag(tagToDelete: Tag): void {
    if (!this.tags || !this.images) return;

    // Remove tag from library
    const tagDeleteIndex = this.tags.findIndex(tag => tag.id === tagToDelete.id);
    this.tags.splice(tagDeleteIndex, 1);

    // Remove selection group linked to tag from all images
    this.images.forEach(image => {
      const groupDeleteIndex = image.selectionGroup.findIndex(group => group.linkedTag.id === tagToDelete.id);
      image.selectionGroup.splice(groupDeleteIndex, 1);
    });

  }

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
    // todo - confirm the performance of this
    const foundGroup = this.selectedImage?.selectionGroup.find(group => group.linkedTag.id === tag.id);
    return foundGroup?.selections;
  }
}