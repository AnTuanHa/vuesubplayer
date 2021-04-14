import { expect } from "chai";
import { mount } from "@vue/test-utils";

import VideoPlayer from "@/components/VideoPlayer.vue";
import { StoreKey } from "@/symbols";

describe("VideoPlayer.vue", () => {
  it("should be visible if videoUrl has been given", () => {
    const state = {};
    const wrapper = mount(VideoPlayer, {
      global: {
        provide: {
          [StoreKey as symbol]: { state }
        }
      },
      props: {
        videoUrl: "myVideoUrl",
        subtitleUrl: "mySubtitleUrl"
      }
    });

    expect(wrapper.find("video").isVisible()).to.be.true;
  });

  it("should not be visible if videoUrl has not been given", () => {
    const state = {};
    const wrapper = mount(VideoPlayer, {
      global: {
        provide: {
          [StoreKey as symbol]: { state }
        }
      },
      props: {
        videoUrl: "",
        subtitleUrl: ""
      }
    });

    expect(wrapper.find("video").isVisible()).to.be.false;
  });
});
