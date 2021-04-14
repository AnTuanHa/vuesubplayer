<template>
  <div class="video-player">
    <video
      v-show="videoUrl"
      ref="videoElement"
      class="video-element"
      :src="videoUrl ? videoUrl : null"
      crossorigin="anonymous"
      controls
      disablePictureInPicture
      disabled
      tabIndex="-1"
      @error="onVideoError"
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

  setup(_, { emit }) {
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
        if (newTimeEvent.origin === Origin.VideoPlayer) {
          return;
        }
        videoElement.value.currentTime = newTimeEvent.time;
        videoElement.value.play();
      }
    );

    // Update videoElement's text track cues with our internal cues list when it has been changed
    watch(
      () => store.state.cuesHasBeenChanged,
      cuesHasBeenChanged => {
        if (
          !cuesHasBeenChanged ||
          !videoElement.value ||
          videoElement.value.textTracks.length < 1
        ) {
          return;
        }
        const firstTextTrack = videoElement.value.textTracks[0];
        if (!firstTextTrack.cues) {
          return;
        }
        for (const trackCue of firstTextTrack.cues) {
          const cue = store.state.cues.find(cue => cue.id === trackCue.id);
          if (!cue) {
            continue;
          }
          trackCue.startTime = cue.startTime;
          trackCue.endTime = cue.endTime;
        }
        store.setCuesHasBeenChanged(false);
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
        const firstActiveCue = element.track.activeCues[0];
        if (!firstActiveCue) {
          return;
        }
        store.setCurrentCue(firstActiveCue.id);
      },

      onCaptionsLoad: (e: Event) => {
        // Hide the built-in captions
        const element = e.target as HTMLTrackElement;
        element.track.mode = "hidden";
        if (!element.track.cues) {
          return;
        }
        const trackCues = [...element.track.cues];
        store.setCuesList(trackCues as VTTCue[]);
      },

      onVideoError: () => {
        if (!videoElement.value || !videoElement.value.error) {
          return;
        }
        emit(
          "onVideoError",
          `Error code ${videoElement.value.error.code}. ${videoElement.value.error.message}`
        );
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
  position: relative;
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
