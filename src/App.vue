<template>
  <div id="app" @drop.prevent.stop="onDropEvent" @dragover.prevent.stop>
    <div
      v-show="!videoUrl && !subtitlesUrl"
      class="video-subtitles-missing hint"
    >
      Drag and drop a video file supported by your browser and subtitles file
      (.srt, .ass) on this page
    </div>
    <div v-show="!videoUrl && subtitlesUrl" class="video-missing hint">
      Drag and drop a video file supported by your browser on this page
    </div>
    <div v-show="videoUrl && !subtitlesUrl" class="subtitles-missing hint">
      Drag and drop a subtitles file (.srt, .ass) on this page
    </div>
    <div v-show="loadVideoError" class="video-load-error hint">
      {{ loadVideoError }}
    </div>
    <div v-show="videoUrl && !loadVideoError" class="app-main">
      <VideoPlayer
        :video-url="videoUrl"
        :subtitles-url="subtitlesUrl"
        @on-video-error="onVideoError"
      />
      <SubtitleViewer />
    </div>
    <div v-show="subtitlesUrl" class="app-aside">
      <SubtitleTracklistViewer />
    </div>
    <div v-show="subtitlesUrl" class="controls">
      <div
        class="edit-subtitles-button unselectable"
        @click="Store.toggleEditMode()"
      >
        {{ Store.state.isInEditMode ? "Quit" : "Edit Subtitles" }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, provide, ref } from "vue";
import { StoreKey } from "./symbols";
import Store from "./Store";
import SubtitleParser from "./utils/subtitle-parser";

import SubtitleViewer from "./components/SubtitleViewer.vue";
import SubtitleTracklistViewer from "./components/SubtitleTracklistViewer.vue";
import VideoPlayer from "./components/VideoPlayer.vue";

const isSubtitleFile = function(file: File) {
  return /\.(srt|ass)$/.test(file.name);
};

export default defineComponent({
  name: "App",

  components: {
    SubtitleViewer,
    SubtitleTracklistViewer,
    VideoPlayer
  },

  setup() {
    provide(StoreKey, Store);

    const subtitlesUrl = ref("");
    const videoUrl = ref("");
    const loadVideoError = ref("");

    const loadSubtitleFile = (file: File) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        const vtt = SubtitleParser.toVtt(reader.result as string);
        if (!vtt) {
          return;
        }
        subtitlesUrl.value = `data:text/vtt;charset=utf-8,${encodeURIComponent(
          vtt
        )}`;
      };
      return;
    };

    const loadVideoFile = (file: File) => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl.value);
      }
      videoUrl.value = URL.createObjectURL(file);
      loadVideoError.value = "";
    };

    return {
      Store,
      subtitlesUrl,
      videoUrl,
      loadVideoError,
      onDropEvent: (e: DragEvent) => {
        if (!e.dataTransfer) {
          return;
        }
        [...e.dataTransfer.files].forEach(file => {
          isSubtitleFile(file) ? loadSubtitleFile(file) : loadVideoFile(file);
        });
      },
      onVideoError: (message: string) => {
        loadVideoError.value = message;
      }
    };
  }
});
</script>

<style>
html,
body {
  margin: 0;
  height: 100vh;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: grid;
  grid-template-areas:
    "video video subtitles"
    "video video subtitles"
    "video video subtitles"
    "video video controls";
  grid-template-rows: 95.4% 1% 0% 3.6%;
  grid-template-columns: 87% 0 13%;
  position: relative;
  background-color: black;
}

.app-main {
  grid-area: video;
  position: relative;
}

.app-aside {
  grid-area: subtitles;
  position: relative;
}

.controls {
  grid-area: controls;
  width: 100%;
  height: 100%;
}

.video-subtitles-missing {
  grid-area: video;
}

.video-missing {
  grid-area: video;
}

.subtitles-missing {
  grid-area: subtitles;
}

.video-load-error {
  grid-area: video;
}

.hint {
  color: white;
  font-size: 24px;
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600px;
  text-align: center;
}

.edit-subtitles-button {
  padding: 0.2rem;
  font-size: 1.5vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  background-color: black;
  color: #444444;
  height: 100%;
}

.edit-subtitles-button:hover {
  background-color: #102027;
  color: white;
}

.unselectable {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
