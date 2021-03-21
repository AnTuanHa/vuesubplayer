import { reactive, readonly } from "vue";
import State from "./interfaces/State";
import { Origin } from "./interfaces/TimeEvent";
import TimeEvent from "./interfaces/TimeEvent";

const state: State = reactive({
  cues: [],
  currentCue: {} as VTTCue,
  currentTimeEvent: {} as TimeEvent,
  isInEditMode: false
});

const updateCues = function(cues: VTTCue[]) {
  state.cues = cues;
};

const updateCurrentCue = function(cue: VTTCue) {
  state.currentCue = cue;
};

const updateCurrentTimeEvent = function(time: number, origin: Origin) {
  state.currentTimeEvent = {
    time,
    origin
  };
};

const toggleEditMode = function() {
  state.isInEditMode = state.isInEditMode ? false : true;
};

export default {
  state: readonly(state),
  updateCues,
  updateCurrentCue,
  updateCurrentTimeEvent,
  toggleEditMode
};
