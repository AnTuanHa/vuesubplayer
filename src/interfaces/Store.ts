import State from "./State";

export default interface Store {
  state: State;
  updateCues(cues: VTTCue[]): void;
  updateCurrentCue(cue: VTTCue): void;
  updateCurrentTime(time: number): void;
}
