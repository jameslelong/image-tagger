<template>
  <section id="home">
    <carousel v-bind:images="images" v-bind:selectedImage="selectedImage" v-on:image-selected="selectImage"></carousel>
    <editor-canvas v-bind:selectedImage="selectedImage"></editor-canvas>
    <image-upload v-on:image-uploaded="createImage"></image-upload>
  </section>
</template>

<script src="./home.ts"></script>
<style lang="scss">
@import "./home.scss";
</style>
