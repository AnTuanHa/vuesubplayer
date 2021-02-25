import { reactive, readonly } from "vue";
import State from "./interfaces/State";

const state: State = reactive({
  cues: [],
  currentCue: {} as VTTCue,
  currentTime: 0.0
});

const updateCues = function(cues: VTTCue[]) {
  state.cues = cues;
};

const updateCurrentCue = function(cue: VTTCue) {
  state.currentCue = cue;
};

const updateCurrentTime = function(time: number) {
  state.currentTime = time;
};

export default {
  state: readonly(state),
  updateCues,
  updateCurrentCue,
  updateCurrentTime
};
