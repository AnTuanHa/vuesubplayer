<template>
  <div
    ref="htmlElement"
    class="subtitle-element"
    :class="{ active: isActive }"
    @click="onClick"
  >
    <div
      class="subtitle"
      :class="{ editable: isInEditMode }"
      :contenteditable="isInEditMode"
      data-test="subtitleTextBox"
      @input="updateCueText($event.target.innerText)"
    >
      {{ cue.text }}
    </div>
    <div v-show="isInEditMode" class="start-time">
      <div class="start-time-label" data-test="startTimeLabel">Start Time</div>
      <input
        title="Starting time for the subtitle"
        :value="cue.startTime"
        class="start-time-input"
        type="number"
        step="0.1"
        data-test="startTimeInputBox"
        @input="updateStartTime(Number($event.target.value))"
      />
    </div>
    <div v-show="isInEditMode" class="end-time">
      <div class="end-time-label" data-test="endTimeLabel">End Time</div>
      <input
        title="Ending time for the subtitle"
        :value="cue.endTime"
        class="end-time-input"
        type="number"
        step="0.1"
        data-test="endTimeInputBox"
        @input="updateEndTime(Number($event.target.value))"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ref, defineComponent, inject, watch, PropType } from "vue";
import { StoreKey } from "@/symbols";
import { Origin } from "@/interfaces/TimeEvent";
import Caption from "@/interfaces/Caption";

export default defineComponent({
  name: "SubtitleElement",

  props: {
    cue: {
      type: Object as PropType<Caption>,
      required: true
    }
  },

  setup(props) {
    const store = inject(StoreKey);
    if (!store) {
      throw new Error(`Could not resolve ${StoreKey.description}`);
    }
    const htmlElement = ref<HTMLElement>();

    const isInEditMode = computed(() => store.state.isInEditMode);
    const isActive = computed(() => store.state.currentCue.id === props.cue.id);

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
      htmlElement,
      isInEditMode,
      isActive,
      onClick: () => {
        if (isInEditMode.value) {
          return;
        }

        // Add a small delta so that the tracklist selects the correct caption
        // if the user clicks on a subtitle that is timed too close to another one
        store.updateCurrentTimeEvent(
          props.cue.startTime + 0.0001,
          Origin.SubtitleElement
        );
      },
      updateCueText: (text: string) => {
        store.updateCueTextInCuesList(props.cue.id, text);

        if (store.state.currentCue.id !== props.cue.id) {
          return;
        }
        store.setCurrentCue(props.cue.id);
      },
      updateStartTime: (time: number) => {
        store.updateCueStartTimeInCuesList(props.cue.id, time);
      },
      updateEndTime: (time: number) => {
        store.updateCueEndTimeInCuesList(props.cue.id, time);
      }
    };
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input {
  background-color: black;
  color: #444444;
}

.subtitle-element {
  cursor: pointer;
  margin: 0;
  padding: 1em;
  display: grid;
  grid-template-areas:
    "text text"
    "startTimeLabel endTimeLabel"
    "startTimeLabel endTimeInput";
  grid-template-rows: auto auto auto;
  grid-template-columns: auto auto;
}

.subtitle {
  font-size: 1vw;
  grid-area: text;
}

.subtitle-element:hover,
.subtitle-element:hover input {
  background-color: #102027;
  color: white;
}

.active,
.active input {
  background-color: #37474f;
  color: white;
}

.editable {
  border: 2px solid;
  border-radius: 5px;
}

.start-time-label {
  grid-area: startTimeLabel;
}

.start-time-input {
  grid-area: startTimeInput;
  width: 100%;
}

.end-time-label {
  grid-area: endTimeLabel;
}

.end-time-input {
  grid-area: endTimeInput;
  width: 100%;
}
</style>
