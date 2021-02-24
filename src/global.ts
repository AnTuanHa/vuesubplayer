import { reactive, readonly } from "vue";

interface State {
  cues: TextTrackCue[];
  currentText: string;
}

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
