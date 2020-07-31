<template>
  <section id="home">
    <carousel v-bind:images="images" v-bind:selectedImage="selectedImage" v-on:image-selected="selectImage"></carousel>
    <div id="primary-area">
      <div id="editor-column">
        <editor-canvas v-bind:selectedImage="selectedImage" v-bind:selectedTag="selectedTag"></editor-canvas>
        <image-upload v-on:image-uploaded="createImage"></image-upload>
      </div>
      <settings-column v-bind:tags="tags"  v-bind:selectedTag="selectedTag" v-bind:selectedImage="selectedImage" v-on:tag-selected="selectTag"></settings-column>
    </div>
  </section>
</template>

<script src="./home.ts"></script>
<style lang="scss">
@import "./home.scss";
</style>
