import Caption from "@/interfaces/Caption";

const getSeconds = (time: string, timeRegex: RegExp) => {
  const match = time.match(timeRegex);
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
    "Dialogue:\\s\\d," + // Format: Layer
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
  const timeRegex = /(\d+):(\d\d):(\d\d).(\d\d)/;
  const styleRegex = /\{[^}]+\}/g;

  const lines = text.split(/[\n\r]+/g);
  const captions: Caption[] = [];
  lines.forEach((line, index) => {
    const match = line.match(reAss);
    if (match) {
      captions.push({
        id: `${index + 1}`,
        startTime: getSeconds(match[1], timeRegex),
        endTime: getSeconds(match[2], timeRegex),
        text: match[5]
          .replace(styleRegex, "")
          .replace(/\\N/gi, "\n")
          .trim(),
        voice: match[3] && match[4] ? match[3] + " " + match[4] : "",
        oldOffset: 0
      });
    }
  });

  return captions.length ? captions : null;
};

export default {
  convertAssToCaptions
};
