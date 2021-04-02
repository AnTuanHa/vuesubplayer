<template>
  <div class="subtitle-tracklist-viewer">
    <SubtitleElement
      v-for="cue in cues"
      :key="cue.id"
      :cue="cue"
      data-test="subtitle"
    >
    </SubtitleElement>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from "vue";
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

    const cues = computed(() => store.state.cues);
    return {
      cues
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
