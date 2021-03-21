import State from "./State";
import { Origin } from "./TimeEvent";

export default interface Store {
  state: State;
  updateCues(cues: VTTCue[]): void;
  updateCurrentCue(cue: VTTCue): void;
  updateCurrentTimeEvent(time: number, origin: Origin): void;
  toggleEditMode(): void;
}
