<template>
    <section id="settings-column">
        <div id="momento-container">
            <button class="momento-button">Undo</button>
            <button class="momento-button">Redo</button>
        </div>
        <div id="tag-container">
            <h2>Tags</h2>
            <form id="tag-create-form" v-on:submit.prevent="createTag">
                <input placeholder="Name" v-model="tagNameInput">
                <button type="submit">+</button>
            </form>
            <ul id="tag-list">
                <li class="tag-list-item" v-for="tag in tags" :key="tag.id">
                    <div class="tag-meta">
                        <span class="tag-id">{{ tag.id }}</span>
                        <span class="tag-name">{{ tag.name }}</span>
                    </div>
                    <!-- todo - Redo Styles -->
                    <button class="tag-select" v-on:click="selectTag(tag)">+</button>
                    <button class="tag-delete" v-on:click="deleteTag(tag)">X</button>
                </li>
            </ul>
        </div>    
    </section>
</template>


<script src="./settings-column.ts"></script>
<style lang="scss">
@import "./settings-column.scss";
</style>