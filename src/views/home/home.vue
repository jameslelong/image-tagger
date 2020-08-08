<template>
  <main id="container">
    <section id="home">
      <carousel v-bind:images="images" v-bind:selectedImage="selectedImage" v-on:image-selected="selectImage"></carousel>
      <div id="primary-area">
        <div id="editor-column">
          <editor-canvas v-bind:selectedImage="selectedImage" v-bind:selectedTag="selectedTag"></editor-canvas>
          <image-upload v-on:image-uploaded="createImage"></image-upload>
        </div>
        <settings-column v-bind:tags="tags"  v-bind:selectedTag="selectedTag" v-bind:images="images" v-bind:selectedImage="selectedImage" v-on:tag-selected="selectTag"></settings-column>
      </div>
    </section>

    <section id="screen-size-alert">
      <p>This screen size is not supported</p>
    </section>
  </main>
</template>

<script src="./home.ts"></script>
<style lang="scss">
@import "./home.scss";
</style>
