<template>
    <section id="carousel">
        <!-- todo - carousel of all images, left and right selection, also click and drag(?) -->
        <!-- todo - when dragging (if I add it) on release snap carousel to the closest lock point
        related to where the left/rigth button would have scrolled to. -->
        <div class="carousel-button-wrap carousel-left"> <!-- todo turn this entire wrap into the button? -->
            <button class="carousel-button" v-on:click="prev()">
                <i class="fas fa-arrow-left fa-xs"></i>
            </button>
        </div>
        <div id="carousel-main">
            <div id="carousel-main-inner" ref="carousel-main-inner">
                <button
                    class="carousel-image-button" v-for="image in images" v-bind:key="image.id" 
                    v-on:click="selectImage(image)" v-bind:class="{ selected: selectedImage.id === image.id }">
                    <img :src="image.encodedImage">
                    <div class="image-overlay"></div>
                </button>
            </div>
        </div>
        <div class="carousel-button-wrap carousel-right">
            <button class="carousel-button" v-on:click="next()">
                <i class="fas fa-arrow-right fa-xs"></i>
            </button>
        </div>
    </section>
</template>

<script src="./carousel.ts"></script>
<style lang="scss">
@import "./carousel.scss";
</style>