<template>
  <div class="subtitle-viewer">
    {{ store.state.currentCue.text }}
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { StoreKey } from "@/symbols";

export default defineComponent({
  name: "SubtitleViewer",
  setup() {
    const store = inject(StoreKey);
    if (!store) {
      throw new Error(`Could not resolve ${StoreKey.description}`);
    }
    return {
      store
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
  width: fit-content;
  bottom: 10%;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  z-index: 2;
  background-color: rgba(0, 0, 0, 0.7);
  white-space: pre;
  padding: 8px;
}
</style>
