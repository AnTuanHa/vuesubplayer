export enum Origin {
  VideoPlayer,
  SubtitleElement
}

export default interface TimeEvent {
  time: number;
  origin: Origin;
}
