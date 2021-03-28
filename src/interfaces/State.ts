import Caption from "./Caption";
import TimeEvent from "./TimeEvent";

export default interface State {
  cues: Caption[];
  currentCue: Caption;
  currentTimeEvent: TimeEvent;
  isInEditMode: boolean;
  cuesHasBeenChanged: boolean;
}
