import { reactive, readonly } from "vue";
import State from "./interfaces/State";
import TimeEvent, { Origin } from "./interfaces/TimeEvent";
import Caption from "./interfaces/Caption";

const state: State = reactive({
  cues: [] as Caption[],
  currentCue: {
    id: "0",
    startTime: 0,
    endTime: 0,
    text: "",
    voice: "",
    oldOffset: 0
  } as Caption,
  currentTimeEvent: {
    time: 0,
    origin: Origin.VideoPlayer
  } as TimeEvent,
  isInEditMode: false,
  cuesHasBeenChanged: false
});

const setCuesHasBeenChanged = function(flag: boolean) {
  state.cuesHasBeenChanged = flag;
};

const setCuesList = function(cues: VTTCue[]) {
  state.cues = [];
  for (const cue of cues) {
    state.cues.push({
      id: cue.id,
      startTime: cue.startTime,
      endTime: cue.endTime,
      text: cue.text,
      voice: "",
      oldOffset: 0
    });
  }
};

const updateCueTextInCuesList = function(id: string, text: string) {
  const cue = state.cues.find(cue => cue.id === id);
  if (!cue) {
    return;
  }
  cue.text = text;
  setCuesHasBeenChanged(true);
};

const updateCueStartTimeInCuesList = function(id: string, startTime: number) {
  const cue = state.cues.find(cue => cue.id === id);
  if (!cue) {
    return;
  }
  cue.startTime = startTime;
  setCuesHasBeenChanged(true);
};

const updateCueEndTimeInCuesList = function(id: string, endTime: number) {
  const cue = state.cues.find(cue => cue.id === id);
  if (!cue) {
    return;
  }
  cue.endTime = endTime;
  setCuesHasBeenChanged(true);
};

const setCurrentCue = function(id: string) {
  const cue = state.cues.find(cue => cue.id === id);
  if (!cue) {
    return;
  }
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

const offsetAllSubtitles = function(offset: number) {
  for (const cue of state.cues) {
    cue.startTime += Number(offset) - cue.oldOffset;
    cue.endTime += Number(offset) - cue.oldOffset;
    cue.oldOffset = offset;
  }
  setCuesHasBeenChanged(true);
};

export default {
  state: readonly(state),
  setCuesHasBeenChanged,
  setCuesList,
  updateCueTextInCuesList,
  updateCueStartTimeInCuesList,
  updateCueEndTimeInCuesList,
  setCurrentCue,
  updateCurrentTimeEvent,
  toggleEditMode,
  offsetAllSubtitles
};
