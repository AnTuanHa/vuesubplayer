<template>
  <div class="subtitle-viewer">
    <div v-for="(line, index) in text" :key="index" data-test="line">
      {{ line }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from "vue";
import { StoreKey } from "@/symbols";

export default defineComponent({
  name: "SubtitleViewer",
  setup() {
    const store = inject(StoreKey);
    if (!store) {
      throw new Error(`Could not resolve ${StoreKey.description}`);
    }

    const text = computed(() => store.state.currentCue.text.split("\n"));

    return {
      text
    };
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.subtitle-viewer {
  font-size: 2.5vw;
  text-align: center;
  color: #ffffff;
  position: absolute;
  width: max-content;
  max-width: 82%;
  bottom: 10%;
  left: 50%;
  -webkit-transform: translate(-50%, 0%);
  transform: translate(-50%, 0%);
  z-index: 2;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 5px 25px;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
</style>
