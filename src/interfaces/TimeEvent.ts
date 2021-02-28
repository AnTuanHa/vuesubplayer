export enum Origin {
  VideoPlayer,
  SubtitleTracklistViewer
}

export default interface TimeEvent {
  time: number;
  origin: Origin;
}
