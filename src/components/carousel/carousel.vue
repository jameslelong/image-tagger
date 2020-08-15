<template>
  <section id="carousel">
    <div class="carousel-button-wrap carousel-left">
      <button class="carousel-button" v-on:click="prev()">
        <i class="fas fa-arrow-left fa-xs"></i>
      </button>
    </div>
    <div id="carousel-main">
      <div id="carousel-main-inner" ref="carousel-main-inner">
        <button
          class="carousel-image-button"
          v-for="image in images"
          v-bind:key="image.id"
          v-bind:class="{ selected: selectedImage.id === image.id }"
        >
          <img :src="image.encodedImage" />
          <div class="image-select" v-on:click="selectImage(image)"></div>
          <div class="image-overlay">
            <button class="image-delete" v-on:click="deleteImage(image)">
              <i class="fas fa-trash fa-xs"></i>
            </button>
            <div class="image-active-tags">
              <span
                class="tag-id"
                v-for="group in image.selectionGroup"
                v-bind:key="group.linkedTag.id"
                >{{ group.linkedTag.id }}</span
              >
            </div>
          </div>
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
