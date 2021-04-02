import { expect } from "chai";
import { mount } from "@vue/test-utils";
import SubtitleTracklistViewer from "@/components/SubtitleTracklistViewer.vue";
import { StoreKey } from "@/symbols";

describe("SubtitleTracklistViewer.vue", () => {
  it("should render a list of subtitles in the tracklist", () => {
    const state = {
      cues: [
        {
          id: "1",
          startTime: 0,
          endTime: 0,
          text: "First subtitle",
          voice: "",
          oldOffset: 0
        },
        {
          id: "2",
          startTime: 0,
          endTime: 0,
          text: "Second subtitle",
          voice: "",
          oldOffset: 0
        },
        {
          id: "3",
          startTime: 0,
          endTime: 0,
          text: "Third subtitle",
          voice: "",
          oldOffset: 0
        }
      ],
      currentCue: {
        id: "2",
        startTime: 0,
        endTime: 0,
        text: "Second subtitle",
        voice: "",
        oldOffset: 0
      }
    };
    const wrapper = mount(SubtitleTracklistViewer, {
      global: {
        provide: {
          [StoreKey as symbol]: { state }
        }
      }
    });

    const elements = wrapper.findAll('[data-test="subtitle"]');
    expect(elements).to.have.length(3);
    expect(elements[0].text()).to.include("First subtitle");
    expect(elements[1].text()).to.include("Second subtitle");
    expect(elements[2].text()).to.include("Third subtitle");
  });
});
