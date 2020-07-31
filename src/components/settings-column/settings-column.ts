import { Component, Vue, Prop } from "vue-property-decorator";
import { Tag } from "types/tag";
import { EditorImage } from '@/types/image';
import { Selection } from '@/types/selection';


@Component
export default class ImageUpload extends Vue {
  @Prop(Array) readonly tags?: Array<Tag>;
  @Prop(Tag) readonly selectedTag?: Tag;
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
    if (!this.tags) return;

    // todo - also need to delete linked tags.

    const deleteIndex = this.tags?.findIndex(tag => tag.id === tagToDelete.id);
    this.tags.splice(deleteIndex, 1);
  }

  toggleBranch(index: number): void {
    // this.activeBranch = this.activeBranch !== index ? index : -1 ;
    // console.log(this.activeBranch);
    const found = this.activeBranches.includes(index);

    if (found) {
      this.activeBranches.splice(index, 1);
    } else {
      this.activeBranches.push(index);
    }
  }

  isBranchEnabled(index: number): boolean {
    return this.activeBranches.includes(index);
  }

  selectionsOfTag(tag: Tag): Array<Selection> | undefined {
    // todo - confirm the performance of this
    const foundGroup = this.selectedImage?.selectionGroup.find(group => group.linkedTag.id === tag.id);
    return foundGroup?.selections;
  }
}