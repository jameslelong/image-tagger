<template>
  <canvas
    id="editor-canvas" ref="editor-canvas"
    @mousedown="beginSelection" @mouseup="endSelection" @mousemove="dragSelection">
  </canvas>
</template>

<script src="./editor-canvas.ts"></script>
<style lang="scss">
@import "./editor-canvas.scss";
</style>
