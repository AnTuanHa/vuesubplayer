<template>
  <div class="video-player">
    <video
      ref="videoElement"
      class="video-element"
      :src="videoUrl"
      crossorigin="anonymous"
      controls
      disablePictureInPicture
      disabled
      tabIndex="-1"
      @timeupdate="onTimeUpdate"
    >
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
import { defineComponent, inject, ref, watch } from "vue";
import { StoreKey } from "@/symbols";
import { Origin } from "@/interfaces/TimeEvent";

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
    const store = inject(StoreKey);
    if (!store) {
      throw new Error(`Could not resolve ${StoreKey.description}`);
    }
    const videoElement = ref<HTMLVideoElement>();

    watch(
      () => store.state.currentTimeEvent,
      newTimeEvent => {
        if (!videoElement.value) {
          return;
        }
        if (newTimeEvent.origin === Origin.SubtitleTracklistViewer) {
          videoElement.value.currentTime = newTimeEvent.time;
          videoElement.value.play();
        }
      }
    );

    return {
      videoElement,

      onCueChange: (e: Event) => {
        // Hide the built-in captions
        const element = e.target as HTMLTrackElement;
        element.track.mode = "hidden";
        if (!element.track.activeCues || !element.track.activeCues[0]) {
          return;
        }
        store.updateCurrentCue(element.track.activeCues[0] as VTTCue);
      },

      onCaptionsLoad: (e: Event) => {
        // Hide the built-in captions
        const element = e.target as HTMLTrackElement;
        element.track.mode = "hidden";
        if (!element.track.cues) {
          return;
        }
        const trackCues = [...element.track.cues];
        store.updateCues(trackCues as VTTCue[]);
      },

      onTimeUpdate: () => {
        if (!videoElement.value) {
          return;
        }
        store.updateCurrentTimeEvent(
          videoElement.value.currentTime,
          Origin.VideoPlayer
        );
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
