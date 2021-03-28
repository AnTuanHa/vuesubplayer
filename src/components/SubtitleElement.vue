<template>
  <div
    ref="htmlElement"
    class="subtitle-element"
    :class="{ active: isActive(cue) }"
    @click="onClick(cue)"
  >
    <div
      class="subtitle"
      :class="{ editable: store.state.isInEditMode }"
      :contenteditable="store.state.isInEditMode"
      @input="updateCueText"
    >
      {{ cue.text }}
    </div>
    <div v-show="store.state.isInEditMode" class="start-time">
      <div class="start-time-label">Start Time</div>
      <input
        title="Starting time for the subtitle"
        :value="cue.startTime"
        class="start-time-input"
        type="number"
        step="0.1"
        @input="updateStartTime($event.target.value)"
      />
    </div>
    <div v-show="store.state.isInEditMode" class="end-time">
      <div class="end-time-label">End Time</div>
      <input
        title="Ending time for the subtitle"
        :value="cue.endTime"
        class="end-time-input"
        type="number"
        step="0.1"
        @input="updateEndTime($event.target.value)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, inject, watch, PropType } from "vue";
import { StoreKey } from "@/symbols";
import { Origin } from "@/interfaces/TimeEvent";
import Caption from "@/interfaces/Caption";

export default defineComponent({
  name: "SubtitleElement",

  props: {
    cue: {
      type: Object as PropType<Caption>,
      default: {}
    }
  },

  setup(props) {
    const store = inject(StoreKey);
    if (!store) {
      throw new Error(`Could not resolve ${StoreKey.description}`);
    }
    const htmlElement = ref<HTMLElement>();

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
      store,
      htmlElement,
      onClick: function(cue: Caption) {
        if (store.state.isInEditMode) {
          return;
        }

        // Add a small delta so that the tracklist selects the correct caption
        // if the user clicks on a subtitle that is timed too close to another one
        store.updateCurrentTimeEvent(
          cue.startTime + 0.0001,
          Origin.SubtitleElement
        );
      },
      isActive: function(cue: Caption): boolean {
        return store.state.currentCue.id === cue.id;
      },
      updateCueText: function(event: InputEvent) {
        const element = event.target as HTMLElement;
        store.updateCueTextInCuesList(props.cue.id, element.innerText);

        if (store.state.currentCue.id !== props.cue.id) {
          return;
        }
        store.setCurrentCue(props.cue.id);
      },
      updateStartTime: function(time: number) {
        store.updateCueStartTimeInCuesList(props.cue.id, time);
      },
      updateEndTime: function(time: number) {
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
