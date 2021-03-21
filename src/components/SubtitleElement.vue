<template>
  <div ref="htmlElement" class="subtitle-element">
    <div
      class="subtitle"
      :class="{ active: isActive(cue) }"
      @click="onClick(cue)"
    >
      <p>{{ cue.text }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, inject, watch } from "vue";
import { StoreKey } from "@/symbols";
import { Origin } from "@/interfaces/TimeEvent";

export default defineComponent({
  name: "SubtitleElement",

  props: {
    cue: {
      type: VTTCue,
      default: {}
    }
  },

  setup(props) {
    const store = inject(StoreKey);
    if (!store) {
      throw new Error(`Could not resolve ${StoreKey.description}`);
    }
    const htmlElement = ref<HTMLElement>();

    watch(
      () => store.state.currentCue,
      newCue => {
        if (!htmlElement.value) {
          return;
        }
        if (newCue.id !== props.cue.id) {
          return;
        }
        htmlElement.value.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    );

    return {
      store,
      htmlElement,
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

.subtitle {
  font-size: 0.9em;
  cursor: pointer;
  margin: 0;
  padding: 1em;
}

.subtitle:hover {
  background-color: #102027;
  color: white;
}

.active {
  background-color: #37474f;
  color: #ffffff;
}
</style>
