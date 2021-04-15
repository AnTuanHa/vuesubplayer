import { expect } from "chai";
import SrtSubtitles from "@/utils/SrtSubtitles";
import Caption from "@/interfaces/Caption";

const subtitlesFile = `1
00:00:04,021 --> 00:00:10,680
Hello world

2
00:00:10,680 --> 00:00:15,660
This is a test
with a new line

3
00:00:15,900 --> 00:00:18,949
This is the 3rd subtitle line`;

describe("SrtSubtitles", () => {
  it("should convert .srt subtitles to captions", () => {
    const captions = SrtSubtitles.convertSrtToCaptions(subtitlesFile);

    expect(captions).to.exist;

    expect(captions![0].text).to.be.equal("Hello world");
    expect(captions![1].text).to.be.equal("This is a test\nwith a new line");
    expect(captions![2].text).to.be.equal("This is the 3rd subtitle line");

    expect(captions![0].startTime).to.be.equal(4.021);
    expect(captions![1].startTime).to.be.equal(10.68);
    expect(captions![2].startTime).to.be.equal(15.9);

    expect(captions![0].endTime).to.be.equal(10.68);
    expect(captions![1].endTime).to.be.equal(15.66);
    expect(captions![2].endTime).to.be.equal(18.949);
  });

  it("should convert captions to .srt subtitle format", () => {
    const captions: Caption[] = [
      {
        id: "1",
        text: "Hello world",
        startTime: 4.021,
        endTime: 10.68,
        voice: "",
        oldOffset: 0
      },
      {
        id: "2",
        text: "This is a test\nwith a new line",
        startTime: 10.68,
        endTime: 15.66,
        voice: "",
        oldOffset: 0
      },
      {
        id: "3",
        text: "This is the 3rd subtitle line",
        startTime: 15.9,
        endTime: 18.949,
        voice: "",
        oldOffset: 0
      }
    ];
    const file = SrtSubtitles.convertCaptionsToSrt(captions);

    expect(file).to.be.equal(subtitlesFile);
  });
});
