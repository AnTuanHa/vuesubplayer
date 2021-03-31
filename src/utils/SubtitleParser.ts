import Caption from "@/interfaces/Caption";
import AssSubtitles from "./AssSubtitles";
import SrtSubtitles from "./SrtSubtitles";

const padWithZeros = (num: number, digits: number) => {
  return ("0000" + num).slice(-digits);
};

const formatTime = (seconds: number) => {
  const date = new Date(2000, 0, 1, 0, 0, 0, seconds * 1000);
  return [
    padWithZeros(date.getHours(), 2),
    padWithZeros(date.getMinutes(), 2),
    padWithZeros(date.getSeconds(), 2) +
      "." +
      padWithZeros(date.getMilliseconds(), 3)
  ].join(":");
};

// For the format of WEBVTT, see: https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
const convertCaptionsToVtt = (captions: Caption[]) => {
  if (!captions) {
    return null;
  }

  const lines = captions.map((caption: Caption) => {
    return [
      caption.id,
      formatTime(caption.startTime) + " --> " + formatTime(caption.endTime),
      (caption.voice ? "<v " + caption.voice + ">" : "") + caption.text
    ].join("\n");
  });

  return "WEBVTT\n\n" + lines.join("\n\n");
};

const sortCaptionsByTime = (captions: Caption[]) => {
  captions.sort((a, b) => {
    if (a.startTime === b.startTime) {
      if (a.endTime === b.endTime) {
        return 0;
      }
      return a.endTime > b.endTime ? 1 : -1;
    }
    return a.startTime > b.startTime ? 1 : -1;
  });
};

const isOverlapping = (leftCaption: Caption, rightCaption: Caption) => {
  const leftCaptionContainedInRightCaptionDuration =
    leftCaption.endTime - rightCaption.startTime;
  const rightCaptionDuration = rightCaption.endTime - rightCaption.startTime;
  return (
    leftCaptionContainedInRightCaptionDuration > 0.2 ||
    leftCaptionContainedInRightCaptionDuration / rightCaptionDuration > 0.3
  );
};

const mergeDuplicateCaptions = (captions: Caption[]) => {
  const duplicateCaptionIndices = [];
  for (let i = 0; i < captions.length - 1; i++) {
    const caption = captions[i];
    const nextCaption = captions[i + 1];
    if (
      caption.text === nextCaption.text &&
      isOverlapping(caption, nextCaption)
    ) {
      nextCaption.startTime = Math.min(
        caption.startTime,
        nextCaption.startTime
      );
      nextCaption.endTime = Math.max(caption.endTime, nextCaption.endTime);
      duplicateCaptionIndices.push(i);
    } else if (
      caption.startTime === nextCaption.startTime &&
      caption.endTime === nextCaption.endTime
    ) {
      nextCaption.text = caption.text + "\n" + nextCaption.text;
      duplicateCaptionIndices.push(i);
    }
  }

  for (let i = duplicateCaptionIndices.length - 1; i >= 0; i--)
    captions.splice(duplicateCaptionIndices[i], 1);
};

const convertFileToVtt = (text: string) => {
  if (text.indexOf("WEBVTT") === 0) {
    return text;
  }

  const captions =
    AssSubtitles.convertAssToCaptions(text) ||
    SrtSubtitles.convertSrtToCaptions(text);
  if (!captions) {
    return null;
  }
  sortCaptionsByTime(captions);
  mergeDuplicateCaptions(captions);

  return convertCaptionsToVtt(captions);
};

export default {
  convertFileToVtt
};
