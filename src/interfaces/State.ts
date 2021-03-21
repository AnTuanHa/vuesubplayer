import TimeEvent from "./TimeEvent";

export default interface State {
  cues: VTTCue[];
  currentCue: VTTCue;
  currentTimeEvent: TimeEvent;
  isInEditMode: boolean;
}
