import { Component, Vue } from "vue-property-decorator";
import EditorCanvas from "components/editor-canvas/editor-canvas.vue";

@Component({
  components: {
    EditorCanvas
  }
})
export default class Home extends Vue {}
