<template>
  <div id="app" @drop.prevent.stop="onDropEvent" @dragover.prevent.stop>
    <main class="app-main">
      <VideoPlayer :video-url="videoUrl" :subtitles-url="subtitlesUrl" />
      <SubtitleViewer />
    </main>
    <aside class="app-aside">
      <SubtitleTracklistViewer />
    </aside>
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

.app-aside {
  flex: 1 0.001%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}
</style>
