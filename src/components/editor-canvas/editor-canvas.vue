<template>
  <section id="editor-canvas">
    <!-- Controls -->
    <div id="editor-controls">
      <!-- Zoom -->
      <div id="zoom-control-group">
        <button v-on:click="staticZoom(true)"><i class="fas fa-plus fa-xs"></i></button>
        <button v-on:click="staticZoom(false)"><i class="fas fa-minus fa-xs"></i></button>
      </div>
    </div>
    <!-- Canvas -->
    <canvas ref="editor-canvas">
    </canvas>
  </section>
</template>

<script src="./editor-canvas.ts"></script>
<style lang="scss">
@import "./editor-canvas.scss";
</style>
