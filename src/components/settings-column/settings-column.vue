<template>
    <section id="settings-column">
        <!-- Tags -->
        <div id="tag-container">
            <div id="tag-header">
                <h2 class="settings-title">Tags</h2>
                <form id="tag-create-form" v-on:submit.prevent="createTag">
                    <input placeholder="Tag Name" v-model="tagNameInput">
                    <button type="submit">
                        <i class="fas fa-plus fa-xs"></i>
                    </button>
                </form>
            </div>
            <ul id="tag-list" class="tree-list">
                <li class="tag-list-item" v-for="tag in tags" v-bind:key="tag.id"> 
                    <!-- Tag Branch Controls -->
                    <div class="tag-list-item-inner" v-bind:class="{ selected: selectedTag.id === tag.id }">
                        <button class="tag-dropdown-button" v-on:click="toggleBranch(tag)" v-bind:class="{ active: isBranchEnabled(tag)}">
                            <i class="fas fa-caret-right fa-xs"></i>
                        </button>
                        <div class="tag-meta" v-on:click="selectTag(tag)">
                            <span class="tag-id">{{ tag.id }}</span>
                            <span class="tag-name">{{ tag.name }}</span>
                        </div>
                        <button class="tree-delete" v-on:click="deleteTag(tag)">
                            <i class="fas fa-times fa-xs"></i>
                        </button>
                    </div>
                    <!-- Nest Selection List -->
                    <ul class="selection-list tree-list" v-bind:class="{ active: isBranchEnabled(tag)}">
                        <li class="selection-list-item" v-for="selection of selectionsOfTag(tag)" v-bind:key="selection.id" v-on:mouseenter="highlightSelection(selection, true)" v-on:mouseleave="highlightSelection(selection, false)">
                            <span class="selection-meta">
                                x: {{ selection.a.x }}, y: {{ selection.a.y }}
                            </span>
                            <button class="tree-delete" v-on:click="deleteSelection(tag, selection)">
                                <i class="fas fa-times fa-xs"></i>
                            </button>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>

        <!-- Export -->
        <div id="export-container">
            <button id="download-button" class="default-button" v-on:click="download()">
                <i class="fas fa-download fa-sm"></i>
                <span>Download</span>
            </button>
        </div>
    </section>
</template>

<script src="./settings-column.ts"></script>
<style lang="scss">
@import "./settings-column.scss";
</style>