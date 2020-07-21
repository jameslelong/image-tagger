<template>
  <section id="home">
    <carousel v-bind:images="images"></carousel>
    <editor-canvas></editor-canvas>
    <image-upload v-on:image-uploaded="createImage"></image-upload>
  </section>
</template>

<script src="./home.ts"></script>
<style lang="scss">
@import "./home.scss";
</style>
