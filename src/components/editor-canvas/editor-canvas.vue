<template>

  <section id="editor-canvas">
    <canvas ref="editor-canvas" @mousedown="beginSelection" @mouseup="endSelection" @mousemove="mouseMove">
    </canvas>
  </section>
</template>

<script src="./editor-canvas.ts"></script>
<style lang="scss">
@import "./editor-canvas.scss";
</style>
