<template>
    <section id="carousel">
        <!-- todo - carousel of all images, left and right selection, also click and drag(?) -->
        <!-- todo - when dragging (if I add it) on release snap carousel to the closest lock point
        related to where the left/rigth button would have scrolled to. -->
        <!-- TODO - Add Upload image area here temporarily -->
        <div 
            id="image-upload" ref="image-upload" v-bind:class="{ highlight: isHighlighted }"
            @dragover.prevent @dragover="setHighlight(true)" @dragleave="setHighlight(false)" @drop="onDrop">
            <form>
                <input id="upload-input" type="file" multiple accept="image/*" @change="onChange()">
                <label id="upload-label" for="upload-input">Select some files</label>
            </form>
        </div>
        <div class="gallery">
            <img v-for="image in gallery" :key="image" :src="image" class="gallery-image">
        </div>
    </section>
</template>

<script src="./carousel.ts"></script>
<style lang="scss">
@import "./carousel.scss";
</style>