<template>
  <section id="image-upload">
    <div
      id="image-upload-inner"
      ref="image-upload"
      v-bind:class="{ highlight: isHighlighted }"
      @dragover.prevent
      @dragover="setHighlight(true)"
      @dragleave="setHighlight(false)"
      @drop="onDrop"
    >
      <form id="upload-form">
        <label id="upload-label" class="default-button" for="upload-input"
          >Upload Images</label
        >
        <input
          id="upload-input"
          type="file"
          multiple
          accept="image/*"
          @change="onChange"
        />
      </form>
      <p id="secondary-text">Or drag images here</p>
    </div>
  </section>
</template>

<script src="./image-upload.ts"></script>
<style lang="scss">
@import "./image-upload.scss";
</style>
