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
  public activeBranch = -1;

  createTag() {
    if (!this.tagNameInput || !this.tags) return;

    const tag = new Tag(this.tagUID++, this.tagNameInput);
    this.tags.push(tag);

    this.tagNameInput = "";
  }

  selectTag(tagToSelect: Tag) {
    this.$emit('tag-selected', tagToSelect);
  }

  deleteTag(tagToDelete: Tag) {
    if (!this.tags) return;

    // todo - also need to delete linked tags.

    const deleteIndex = this.tags?.findIndex(tag => tag.id === tagToDelete.id);
    this.tags.splice(deleteIndex, 1);
  }

  toggleBranch(index: number) {
    this.activeBranch = this.activeBranch !== index ? index : -1 ;
    console.log(this.activeBranch);
  }

  selectionsOfTag(tag: Tag): Array<Selection> | undefined {
    // todo - confirm the performance of this
    const foundGroup = this.selectedImage?.selectionGroup.find(group => group.linkedTag.id === tag.id);
    return foundGroup?.selections;
  }
}