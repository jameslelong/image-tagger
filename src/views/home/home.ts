import { Component, Vue } from "vue-property-decorator";

import Carousel from "components/carousel/carousel.vue";
import EditorCanvas from "components/editor-canvas/editor-canvas.vue";

@Component({
  components: {
    Carousel,
    EditorCanvas
  }
})
export default class Home extends Vue {}
