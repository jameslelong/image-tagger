<template>
    <section
        id="image-upload" ref="image-upload" v-bind:class="{ highlight: isHighlighted }"
        @dragover.prevent @dragover="setHighlight(true)" @dragleave="setHighlight(false)" @drop="onDrop">
        <form>
            <input id="upload-input" type="file" multiple accept="image/*" @change="onChange">
        </form>
    </section>
</template>


<script src="./image-upload.ts"></script>
<style lang="scss">
@import "./image-upload.scss";
</style>