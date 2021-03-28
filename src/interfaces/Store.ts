import State from "./State";
import { Origin } from "./TimeEvent";

export default interface Store {
  state: State;
  setCuesHasBeenChanged(flag: boolean): void;
  setCuesList(cues: VTTCue[]): void;
  updateCueTextInCuesList(id: string, text: string): void;
  updateCueStartTimeInCuesList(id: string, startTime: number): void;
  updateCueEndTimeInCuesList(id: string, startTime: number): void;
  setCurrentCue(id: string): void;
  updateCurrentTimeEvent(time: number, origin: Origin): void;
  toggleEditMode(): void;
  offsetAllSubtitles(offset: number): void;
}
