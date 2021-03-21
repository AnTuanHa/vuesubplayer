<template>
  <div class="subtitle-tracklist-viewer">
    <SubtitleElement v-for="cue in store.state.cues" :key="cue.id" :cue="cue">
    </SubtitleElement>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { StoreKey } from "@/symbols";

import SubtitleElement from "./SubtitleElement.vue";

export default defineComponent({
  name: "SubtitleTracklistViewer",

  components: {
    SubtitleElement
  },

  setup() {
    const store = inject(StoreKey);
    if (!store) {
      throw new Error(`Could not resolve ${StoreKey.description}`);
    }

    return {
      store
    };
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.subtitle-tracklist-viewer {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: black;
  color: #444444;
}
</style>
