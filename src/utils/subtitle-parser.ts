import Caption from "@/interfaces/Caption";

const convertAssToCaptions = (text: string) => {
  /* Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
   *
   * We are searching for lines that look like:
   * Dialogue: 0,0:00:05.30,0:00:13.04,Default,,0,0,0,,{\pos(796,1018)}My first line\N
   * Dialogue: 0,0:00:13.04,0:00:15.24,Default,,0,0,0,,{\pos(756,1018)}My second line\N
   * Dialogue: 0,0:00:19.58,0:00:22.38,Default,,0,0,0,,{\pos(556,1018)}My third line\N
   * Dialogue: 0,0:00:25.42,0:00:29.06,Default,,0,0,0,,{\pos(676,1018)}My fourth line\N
   */
  const reAss = new RegExp(
    "(\\d+:\\d\\d:\\d\\d.\\d\\d)," + // Start
    "(\\d+:\\d\\d:\\d\\d.\\d\\d)," + // End
    "([^,]*)," + // Style
    "([^,]*)," + // Name
    "(?:[^,]*,){4}" + // MarginL, MarginR, MarginV, Effect
      "(.*)$", // Text
    "i" // case-insensitive mode
  );

  // H:MM:SS.MM
  // Hour:Minutes:Seconds.Milliseconds
  const reTime = /(\d+):(\d\d):(\d\d).(\d\d)/;
  const reStyle = /\{[^}]+\}/g;

  const getSeconds = (timeStr: string) => {
    const match = timeStr.match(reTime);
    if (!match) {
      return 0;
    }
    return (
      Math.round(
        parseInt(match[1], 10) * 60 * 60 * 1000 + // Hours to milliseconds
        parseInt(match[2], 10) * 60 * 1000 + // Minutes to milliseconds
        parseInt(match[3], 10) * 1000 + // Seconds to milliseconds
          parseInt(match[4], 10) * 10 // Milliseconds (only 2 decimals in this format)
      ) / 1000 // To seconds
    );
  };

  const lines = text.split(/[\n\r]+/g);
  const captions: Caption[] = [];
  lines.forEach((line, index) => {
    const match = line.match(reAss);
    if (match) {
      captions.push({
        id: `${index + 1}`,
        startTime: getSeconds(match[1]),
        endTime: getSeconds(match[2]),
        text: match[5].replace(reStyle, "").replace(/\\N/g, "\n"),
        voice: match[3] && match[4] ? match[3] + " " + match[4] : ""
      });
    }
  });

  return captions.length ? captions : null;
};

const convertSrtToCaptions = (text: string) => {
  // HH:MM:SS,MMM
  // Hours:Minutes:Seconds,Milliseconds
  const reTime = /(\d\d):(\d\d):(\d\d),(\d\d\d)/;

  if (!reTime.test(text)) {
    return null;
  }

  const getSeconds = (timeStr: string) => {
    const match = timeStr.match(reTime);
    if (!match) {
      return 0;
    }
    return (
      Math.round(
        parseInt(match[1], 10) * 60 * 60 * 1000 + // Hours to milliseconds
        parseInt(match[2], 10) * 60 * 1000 + // Minutes to milliseconds
        parseInt(match[3], 10) * 1000 + // Seconds to milliseconds
          parseInt(match[4], 10) // Milliseconds
      ) / 1000 // To seconds
    );
  };

  const captions: Caption[] = [];
  const entries = text.split(/\n[\r\n]+/g);
  entries.forEach(entry => {
    const lines = entry.split(/\n+/g);
    /* Proper SRT files have entries that look like:
     * 1
     * 00:00:12,137 --> 00:00:13,680
     * My first line
     *
     * 2
     * 00:00:14,597 --> 00:00:16,933
     * My second line
     * My third line
     *
     * That is, each caption should have 3 or more lines
     */
    if (lines.length >= 3) {
      const timestamps = lines[1].split(/\s*-->\s*/);
      captions.push({
        id: lines[0],
        startTime: getSeconds(timestamps[0]),
        endTime: getSeconds(timestamps[1]),
        text: lines
          .slice(2)
          .join("\n")
          .replace(/\{\\an[0-9]{1,2}\}/g, ""),
        voice: ""
      });
    }
  });

  return captions.length ? captions : null;
};

// For the format of WEBVTT, see: https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
const formatVtt = (captions: Caption[]) => {
  if (!captions) {
    return null;
  }

  const padWithZeros = (num: number, digits: number) =>
    ("0000" + num).slice(-digits);

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

  const lines = captions.map((caption: Caption) => {
    return [
      caption.id,
      formatTime(caption.startTime) + " --> " + formatTime(caption.endTime),
      (caption.voice ? "<v " + caption.voice + ">" : "") + caption.text
    ].join("\n");
  });

  return "WEBVTT\n\n" + lines.join("\n\n");
};

const toVtt = (text: string) => {
  if (text.indexOf("WEBVTT") === 0) {
    return text;
  }

  const parsed = convertAssToCaptions(text) || convertSrtToCaptions(text);
  if (parsed) {
    return formatVtt(parsed);
  }

  return text;
};

export default {
  convertAssToCaptions,
  convertSrtToCaptions,
  formatVtt,
  toVtt
};
