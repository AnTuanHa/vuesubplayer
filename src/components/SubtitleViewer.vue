<template>
  <div class="subtitle-viewer">
    {{ store.state.currentCue.text }}
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { StoreKey } from "@/symbols";

// todo: if line has \n newlines, should add more divs/p

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
