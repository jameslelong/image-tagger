import { Component, Vue, Prop } from "vue-property-decorator";
import { Image } from "types/image";

@Component
export default class Carousel extends Vue {
    @Prop() readonly images?: Array<Image>;
}