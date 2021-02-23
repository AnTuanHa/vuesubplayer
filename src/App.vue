<template>
  <div id="app" @drop.prevent.stop="onDropEvent" @dragover.prevent.stop>
    <main class="app-main">
      <VideoPlayer :video-url="videoUrl" :subtitles-url="subtitlesUrl" />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import VideoPlayer from "./components/VideoPlayer.vue";

const isSubtitleFile = function(file: File) {
  return /\.(srt|ass)$/.test(file.name);
};

export default defineComponent({
  name: "App",

  components: {
    VideoPlayer
  },

  setup() {
    const subtitlesUrl = ref("");
    const videoUrl = ref("");

    const loadSubtitleFile = (file: File) => {
      // todo: add load subtitles
      return;
    };

    const loadVideoFile = (file: File) => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl.value);
      }
      videoUrl.value = URL.createObjectURL(file);
    };

    return {
      subtitlesUrl,
      videoUrl,
      onDropEvent: (e: DragEvent) => {
        if (!e.dataTransfer) {
          return;
        }
        [...e.dataTransfer.files].forEach(file => {
          isSubtitleFile(file) ? loadSubtitleFile(file) : loadVideoFile(file);
        });
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
  display: flex;
  flex-flow: row nowrap;
  position: relative;
  background-color: black;
}

.app-main {
  flex: 1 80vw;
  position: relative;
}
</style>
