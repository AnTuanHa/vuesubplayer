<template>
  <div class="subtitle-tracklist-viewer">
    <div
      v-for="(cue, i) in store.state.cues"
      :key="cue.id"
      :ref="
        el => {
          if (el) divElements[i] = el;
        }
      "
      class="subtitle-tracklist-viewer-caption"
      :class="{ active: isActive(cue) }"
      @click="onClick(cue)"
    >
      <p>{{ cue.text }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, inject, watch, onBeforeUpdate } from "vue";
import { StoreKey } from "@/symbols";
import { Origin } from "@/interfaces/TimeEvent";

export default defineComponent({
  name: "SubtitleTracklistViewer",
  setup() {
    const store = inject(StoreKey);
    if (!store) {
      throw new Error(`Could not resolve ${StoreKey.description}`);
    }
    const divElements = ref([]);

    // make sure to reset the refs before each update
    onBeforeUpdate(() => {
      divElements.value = [];
    });

    watch(
      () => store.state.currentCue,
      newCue => {
        const index = store.state.cues.findIndex(cue => cue.id === newCue.id);
        if (index === -1) {
          return;
        }
        const el = (divElements.value as HTMLDivElement[])[index];
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    );

    return {
      store,
      divElements,
      onClick: function(cue: VTTCue) {
        // Add a small delta so that the tracklist selects the correct caption
        // if the user clicks on a subtitle that is timed too close to another one
        store.updateCurrentTimeEvent(
          cue.startTime + 0.0001,
          Origin.SubtitleTracklistViewer
        );
      },
      isActive: function(cue: VTTCue): boolean {
        return store.state.currentCue.id === cue.id;
      }
    };
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
p {
  font-size: 18px;
}

.subtitle-tracklist-viewer {
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: black;
  color: #444444;
}

.subtitle-tracklist-viewer-caption {
  font-size: 0.9em;
  cursor: pointer;
  margin: 0;
  padding: 1em;
}

.subtitle-tracklist-viewer-caption:hover {
  background-color: #102027;
  color: white;
}

.active {
  background-color: #37474f;
  color: #ffffff;
}
</style>
