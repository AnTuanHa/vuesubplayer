import { reactive, readonly } from "vue";
import State from "./interfaces/State";

const state: State = reactive({
  cues: [],
  currentText: ""
});

const updateCues = function(cues: TextTrackCue[]) {
  state.cues = cues;
};

const updateCurrentText = function(text: string) {
  state.currentText = text;
};

export default {
  state: readonly(state),
  updateCues,
  updateCurrentText
};
