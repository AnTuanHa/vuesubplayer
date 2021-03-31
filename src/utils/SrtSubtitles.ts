import Caption from "@/interfaces/Caption";

const padWithZeros = (num: number, digits: number) => {
  return ("0000" + num).slice(-digits);
};

const formatTime = (seconds: number) => {
  const date = new Date(2000, 0, 1, 0, 0, 0, Math.max(0, seconds) * 1000);
  return [
    padWithZeros(date.getHours(), 2),
    padWithZeros(date.getMinutes(), 2),
    padWithZeros(date.getSeconds(), 2) +
      "," +
      padWithZeros(date.getMilliseconds(), 3)
  ].join(":");
};

const getSeconds = (timeStr: string, timeRegex: RegExp) => {
  const match = timeStr.match(timeRegex);
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

const convertSrtToCaptions = (text: string) => {
  text = text.replace(/\r/g, "");

  // HH:MM:SS,MMM
  // Hours:Minutes:Seconds,Milliseconds
  const timeRegex = /(\d\d):(\d\d):(\d\d),(\d\d\d)/;

  if (!timeRegex.test(text)) {
    return null;
  }

  const captions: Caption[] = [];
  const entries = text.split(/\n[\n]+(?=[0-9]+\n)/g);
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
        startTime: getSeconds(timestamps[0], timeRegex),
        endTime: getSeconds(timestamps[1], timeRegex),
        text: lines
          .slice(2)
          .join("\n")
          .replace(/\{\\an[0-9]{1,2}\}/g, ""),
        voice: "",
        oldOffset: 0
      });
    }
  });

  return captions.length ? captions : null;
};

const convertCaptionsToSrt = (captions: readonly Caption[]) => {
  if (!captions) {
    return null;
  }

  const lines = captions.map((caption, index) => {
    const line = [];
    line.push(index + 1);
    line.push(
      `${formatTime(caption.startTime)} --> ${formatTime(caption.endTime)}`
    );
    if (caption.voice) {
      line.push(`(${caption.voice})${caption.text}`);
    } else {
      line.push(caption.text);
    }
    return line.join("\n");
  });

  return lines.join("\n\n");
};

export default {
  convertSrtToCaptions,
  convertCaptionsToSrt
};
