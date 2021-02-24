<template>
  <div class="video-player">
    <video class="video-element" :src="videoUrl" crossorigin controls>
      <track
        kind="subtitles"
        :src="subtitlesUrl"
        default
        @cuechange="onCueChange"
        @load="onCaptionsLoad"
      />
      Your browser does not support the video tag
    </video>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import Store from "@/interfaces/Store";

export default defineComponent({
  name: "VideoPlayer",

  props: {
    videoUrl: {
      type: String,
      default: ""
    },
    subtitlesUrl: {
      type: String,
      default: ""
    }
  },

  setup() {
    const store = inject("Store") as Store;

    return {
      onCueChange: (e: Event) => {
        // Hide the built-in captions
        const element = e.target as HTMLTrackElement;
        element.track.mode = "hidden";
        if (!element.track.activeCues || !element.track.activeCues[0]) {
          return;
        }
        store.updateCurrentText((element.track.activeCues[0] as VTTCue).text);
      },

      onCaptionsLoad: (e: Event) => {
        // Hide the built-in captions
        const element = e.target as HTMLTrackElement;
        element.track.mode = "hidden";
        if (!element.track.cues) {
          return;
        }
        store.updateCues([...element.track.cues]);
      }
    };
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.video-player {
  height: 100vh;
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.video-element {
  width: 100%;
}

/* Hide browser's built-in subtitles */
.video-player ::cue {
  visibility: hidden;
  color: transparent;
}

.video-player ::-webkit-media-controls-toggle-closed-captions-button,
.video-player ::-webkit-media-text-track-container {
  display: none;
}
</style>
