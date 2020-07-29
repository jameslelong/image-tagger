import { Component, Vue, Prop } from "vue-property-decorator";
import { Tag } from "types/tag";

@Component
export default class ImageUpload extends Vue {
  @Prop(Array) readonly tags?: Array<Tag>;

  private tagUID = 0;
  public tagNameInput = "";

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
}