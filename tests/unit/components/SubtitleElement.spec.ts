import chai, { expect } from "chai";
import { mount } from "@vue/test-utils";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import SubtitleElement from "@/components/SubtitleElement.vue";
import { StoreKey } from "@/symbols";

chai.use(sinonChai);

const createStore = (initialState = {}, functions = {}) => {
  return {
    state: {
      currentCue: {
        id: "1",
        startTime: 0.5,
        endTime: 2.5,
        text: "Hello world",
        voice: "",
        oldOffset: 0
      },
      isInEditMode: false,
      ...initialState
    },
    ...functions
  };
};

const createWrapper = (
  component: typeof SubtitleElement,
  options = {},
  storeState = {},
  storeFunctions = {}
) => {
  const store = createStore(storeState, storeFunctions);
  return mount(component, {
    global: {
      provide: {
        [StoreKey as symbol]: store
      }
    },
    props: {
      cue: store.state.currentCue
    },
    ...options
  });
};

describe("SubtitleElement.vue", () => {
  describe("Active class", () => {
    it("should be enabled if the current subtitle is the same as the subtitle element", () => {
      const wrapper = createWrapper(SubtitleElement);

      expect(wrapper.classes("active")).to.be.true;
    });

    it("should be disabled if the current subtitle is different from the subtitle element", async () => {
      const wrapper = createWrapper(SubtitleElement);
      await wrapper.setProps({
        cue: {
          id: "2",
          startTime: 3,
          endTime: 4,
          text: "Not currently playing subtitle",
          voice: "",
          oldOffset: 0
        }
      });

      expect(wrapper.classes("active")).to.be.false;
    });
  });

  describe("Edit mode disabled", () => {
    it("should render the subtitle's text", () => {
      const wrapper = createWrapper(SubtitleElement);

      expect(wrapper.text()).to.include("Hello world");
    });

    it("should emit event when clicked", async () => {
      const updateCurrentTimeEvent = sinon.spy();
      const wrapper = createWrapper(
        SubtitleElement,
        {},
        {},
        { updateCurrentTimeEvent }
      );
      const elementWrapper = wrapper.find('[data-test="subtitleTextBox"]');

      await elementWrapper.trigger("click");

      expect(updateCurrentTimeEvent).to.have.been.called;
    });

    describe("Start Time", () => {
      it("label should not be visible", () => {
        const wrapper = createWrapper(SubtitleElement);

        expect(wrapper.find('[data-test="startTimeLabel"]').isVisible()).to.be
          .false;
      });

      it("input box should not be visible", () => {
        const wrapper = createWrapper(SubtitleElement);

        expect(wrapper.find('[data-test="startTimeInputBox"]').isVisible()).to
          .be.false;
      });
    });

    describe("End Time", () => {
      it("label should not be visible", () => {
        const wrapper = createWrapper(SubtitleElement);

        expect(wrapper.find('[data-test="endTimeLabel"]').isVisible()).to.be
          .false;
      });

      it("input box should not be visible", () => {
        const wrapper = createWrapper(SubtitleElement);

        expect(wrapper.find('[data-test="endTimeInputBox"]').isVisible()).to.be
          .false;
      });
    });
  });

  describe("Edit mode enabled", () => {
    /* Note: it is currently impossible to test HTML elements using the contenteditable property
     * The element.isContentEditable property is undefined, hence, sending any keyboard events will not work
     * See: https://github.com/jsdom/jsdom/issues/1670 for more details
     */
    xit("should change the subtitle's text on user input", async () => {
      const updateCueTextInCuesList = sinon.spy();
      const wrapper = createWrapper(
        SubtitleElement,
        {},
        { isInEditMode: true },
        { updateCueTextInCuesList }
      );
      const elementWrapper = wrapper.find('[data-test="subtitleTextBox"]');

      await elementWrapper.trigger("click");
      await elementWrapper.trigger("keydown", { key: "a" });
      await elementWrapper.trigger("keydown", { key: "b" });
      await elementWrapper.trigger("keydown", { key: "b" });

      expect(elementWrapper.text()).to.equal("Hello worldabc");
      expect(updateCueTextInCuesList).to.have.been.calledWith(
        "1",
        "Hello worldabc"
      );
    });

    it("should render the subtitle's text", () => {
      const wrapper = createWrapper(
        SubtitleElement,
        {},
        { isInEditMode: true },
        {}
      );

      expect(wrapper.text()).to.include("Hello world");
    });

    it("should not emit event when clicked", async () => {
      const updateCurrentTimeEvent = sinon.spy();
      const wrapper = createWrapper(
        SubtitleElement,
        {},
        { isInEditMode: true },
        { updateCurrentTimeEvent }
      );
      const elementWrapper = wrapper.find('[data-test="subtitleTextBox"]');

      await elementWrapper.trigger("click");

      expect(updateCurrentTimeEvent).to.not.have.been.called;
    });

    describe("Start Time", () => {
      it("label should be visible", () => {
        const wrapper = createWrapper(
          SubtitleElement,
          {},
          { isInEditMode: true },
          {}
        );

        expect(wrapper.find('[data-test="startTimeLabel"]').isVisible()).to.be
          .true;
      });

      it("input box should be visible", () => {
        const wrapper = createWrapper(
          SubtitleElement,
          {},
          { isInEditMode: true },
          {}
        );

        expect(wrapper.find('[data-test="startTimeInputBox"]').isVisible()).to
          .be.true;
      });

      it("should render the subtitle's initial start time in the input box", () => {
        const wrapper = createWrapper(
          SubtitleElement,
          {},
          { isInEditMode: true },
          {}
        );
        const inputElement = wrapper.find('[data-test="startTimeInputBox"]')
          .element as HTMLInputElement;

        expect(inputElement.value).to.equal("0.5");
      });

      it("should change the subtitle's start time on user input", async () => {
        const updateCueStartTimeInCuesList = sinon.spy();
        const wrapper = createWrapper(
          SubtitleElement,
          {},
          { isInEditMode: true },
          { updateCueStartTimeInCuesList }
        );
        const inputElementWrapper = wrapper.find(
          '[data-test="startTimeInputBox"]'
        );
        const inputElement = inputElementWrapper.element as HTMLInputElement;

        await inputElementWrapper.setValue("1.23");

        expect(inputElement.value).to.equal("1.23");
        expect(updateCueStartTimeInCuesList).to.have.been.calledWith("1", 1.23);
      });
    });

    describe("End Time", () => {
      it("label should be visible", () => {
        const wrapper = createWrapper(
          SubtitleElement,
          {},
          { isInEditMode: true },
          {}
        );

        expect(wrapper.find('[data-test="endTimeLabel"]').isVisible()).to.be
          .true;
      });

      it("input box should be visible", () => {
        const wrapper = createWrapper(
          SubtitleElement,
          {},
          { isInEditMode: true },
          {}
        );

        expect(wrapper.find('[data-test="endTimeInputBox"]').isVisible()).to.be
          .true;
      });

      it("should render the subtitle's initial end time in the input box", () => {
        const wrapper = createWrapper(
          SubtitleElement,
          {},
          { isInEditMode: true },
          {}
        );
        const inputElement = wrapper.find('[data-test="endTimeInputBox"]')
          .element as HTMLInputElement;

        expect(inputElement.value).to.equal("2.5");
      });

      it("should change the subtitle's end time on user input", async () => {
        const updateCueEndTimeInCuesList = sinon.spy();
        const wrapper = createWrapper(
          SubtitleElement,
          {},
          { isInEditMode: true },
          { updateCueEndTimeInCuesList }
        );
        const inputElementWrapper = wrapper.find(
          '[data-test="endTimeInputBox"]'
        );
        const inputElement = inputElementWrapper.element as HTMLInputElement;

        await inputElementWrapper.setValue("3.23");

        expect(inputElement.value).to.equal("3.23");
        expect(updateCueEndTimeInCuesList).to.have.been.calledWith("1", 3.23);
      });
    });
  });
});
