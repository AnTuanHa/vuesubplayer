import { expect } from "chai";
import { mount } from "@vue/test-utils";
import SubtitleViewer from "@/components/SubtitleViewer.vue";
import { StoreKey } from "@/symbols";

describe("SubtitleViewer.vue", () => {
  it("should render the current subtitle's text", () => {
    const state = {
      currentCue: {
        text: "Hello world"
      }
    };
    const wrapper = mount(SubtitleViewer, {
      global: {
        provide: {
          [StoreKey as symbol]: { state }
        }
      }
    });

    expect(wrapper.text()).to.equal(state.currentCue.text);
  });

  it("should render the current subtitle text with newlines", () => {
    const state = {
      currentCue: {
        text: "Line 1\nLine 2\nLine 3"
      }
    };
    const wrapper = mount(SubtitleViewer, {
      global: {
        provide: {
          [StoreKey as symbol]: { state }
        }
      }
    });

    const lines = wrapper.findAll('[data-test="line"]');
    expect(lines).to.have.length(3);
    expect(lines[0].text()).to.equal("Line 1");
    expect(lines[1].text()).to.equal("Line 2");
    expect(lines[2].text()).to.equal("Line 3");
  });
});
