<template>
    <section id="carousel">
        <!-- todo - carousel of all images, left and right selection, also click and drag(?) -->
        <!-- todo - when dragging (if I add it) on release snap carousel to the closest lock point
        related to where the left/rigth button would have scrolled to. -->
        <div class="gallery">
            <img v-for="image in images" :key="image" :src="image.encodedImage" class="gallery-image">
        </div>
    </section>
</template>

<script src="./carousel.ts"></script>
<style lang="scss">
@import "./carousel.scss";
</style>