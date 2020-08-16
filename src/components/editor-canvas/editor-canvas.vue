<template>
  <section id="editor-canvas">
    <canvas
      ref="editor-canvas"
      v-on:mousedown="mouseDown"
      v-on:mouseup="mouseUp"
      v-on:mousemove="mouseMove"
      v-on:wheel="mouseWheel"
    >
    </canvas>
  </section>
</template>

<script src="./editor-canvas.ts"></script>
<style lang="scss">
@import "./editor-canvas.scss";
</style>
