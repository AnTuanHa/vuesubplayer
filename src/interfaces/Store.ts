import State from "./State";

export default interface Store {
  state: State;
  updateCues(cues: TextTrackCue[]): void;
  updateCurrentText(text: string): void;
}
