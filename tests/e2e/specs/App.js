import SrtSubtitles from "@/utils/SrtSubtitles";

const { expect } = require("chai");
const path = require("path");

Cypress.Commands.add("upload_file", (selector, fileUrl, type = "") => {
  return cy
    .fixture(fileUrl, "base64")
    .then(Cypress.Blob.base64StringToBlob)
    .then(blob => {
      const nameSegments = fileUrl.split("/");
      const name = nameSegments[nameSegments.length - 1];
      const testFile = new File([blob], name, { type });
      const event = {
        dataTransfer: {
          files: [testFile]
        }
      };
      return cy.get(selector).trigger("drop", event);
    });
});

const videoUrl = "testvideo.mkv";
const engAssSubtitleUrl = "testvideo.en.ass";
const engSrtSubtitleUrl = "testvideo.en.srt";

describe("App", () => {
  describe("As a user", () => {
    beforeEach(() => {
      cy.visit("/");
    });

    it("the user should see a drag and drop area to load the supported video and subtitle files into the webpage", () => {
      cy.contains("Drag and drop");
    });

    describe("the user should be able to drag and drop a supported video file format by the user's browser into the webpage", () => {
      beforeEach(() => {
        cy.upload_file("#app", videoUrl);
      });

      it("and load the video", () => {
        cy.get("video").should("be.visible");
      });

      it("and play the video", () => {
        // clicking the video itself does not work
        cy.get("video").then($video => {
          const element = $video.get(0);
          element.muted = true;
          element.play();
        });
        cy.get("video").should($video => {
          const element = $video.get(0);
          expect(element.paused).to.be.false;
        });
      });
    });

    describe("the user should be able to drag and drop an", () => {
      beforeEach(() => {
        cy.upload_file("#app", videoUrl);
      });

      it(".ass subtitle file into the webpage and load the subtitles into the video player", () => {
        cy.upload_file("#app", engAssSubtitleUrl);

        cy.get("track").should("have.attr", "src");
        cy.get("video").should($video => {
          const element = $video.get(0);
          expect(element.textTracks[0].cues.length).to.not.be.equal(0);
        });
      });

      it(".srt subtitle file into the webpage and load the subtitles into the video player", () => {
        cy.upload_file("#app", engSrtSubtitleUrl);

        cy.get("track").should("have.attr", "src");
        cy.get("video").should($video => {
          const element = $video.get(0);
          expect(element.textTracks[0].cues.length).to.not.be.equal(0);
        });
      });
    });

    describe("after loading a video and subtitles into the webpage", () => {
      beforeEach(() => {
        cy.upload_file("#app", videoUrl);
        cy.upload_file("#app", engSrtSubtitleUrl);
      });

      it("the user should be able to view the currently playing subtitle on top of the video", () => {
        cy.get("video").should($video => {
          const element = $video.get(0);
          element.muted = true;
          element.currentTime = 5;
        });

        cy.get(".subtitle-viewer").should($div => {
          expect($div.text()).to.not.be.empty;
        });
      });

      it("clicking on one of the subtitles in the tracklist sidebar should jump to the subtitle's timestamp in the video player", () => {
        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .click();
        cy.get("video").then($video => {
          const element = $video.get(0);
          element.muted = true;
        });
        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .find(".start-time")
          .find("input")
          .then($input => {
            const value = $input.val();
            cy.get("video")
              .its("0.currentTime")
              .should("be.at.least", Number(value));
          });
        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .find(".end-time")
          .find("input")
          .then($input => {
            const value = $input.val();
            cy.get("video")
              .its("0.currentTime")
              .should("be.at.most", Number(value));
          });
      });

      it("after editing a subtitle's text, the currently playing subtitle text on top of the video should also be updated", () => {
        const newText = "E2E Test Text";

        cy.get(".edit-subtitles-button").click(); // Enter edit mode
        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .find(".subtitle")
          .contains(newText)
          .should("not.exist");
        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .find(".subtitle")
          .type(newText);
        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .find(".subtitle")
          .contains(newText);
        cy.get(".edit-subtitles-button").click(); // Exit edit mode

        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .click();
        cy.get("video").then($video => {
          const element = $video.get(0);
          element.muted = true;
        });
        cy.get(".subtitle-viewer").contains(newText);
      });

      it("after editing a subtitle's timestamp, clicking on the subtitle in the tracklist sidebar should jump to the updated subtitle's timestamp in the video player", () => {
        const newStartTime = 1.23;
        const newEndTime = 4.56;

        cy.get(".edit-subtitles-button").click(); // Enter edit mode
        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .find(".start-time")
          .find("input")
          .clear()
          .type(`{del}${newStartTime}`)
          .should("have.value", `${newStartTime}`);
        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .find(".end-time")
          .find("input")
          .clear()
          .type(`{del}${newEndTime}`)
          .should("have.value", `${newEndTime}`);
        cy.get(".edit-subtitles-button").click(); // Exit edit mode

        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .click();
        cy.get("video").then($video => {
          const element = $video.get(0);
          element.muted = true;
        });
        cy.get("video")
          .its("0.currentTime")
          .should("be.at.least", Number(newStartTime));
        cy.get("video")
          .its("0.currentTime")
          .should("be.at.most", Number(newEndTime));
      });
    });

    describe("after loading a subtitles file into the webpage", () => {
      beforeEach(() => {
        cy.upload_file("#app", engSrtSubtitleUrl);
      });

      it("the user should be able to view a sidebar containing the subtitles as a tracklist", () => {
        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .its("length")
          .should("not.be.equal", 0);
      });

      it("the user should be able to see an 'Edit Subtitles' button", () => {
        cy.upload_file("#app", engSrtSubtitleUrl);
        cy.contains("Edit Subtitles");
      });

      it("the user should be able to see an 'Download Subtitles' button", () => {
        cy.upload_file("#app", engSrtSubtitleUrl);
        cy.contains("Download Subtitles");
      });

      it("after clicking the 'Download Subtitles' button, the edited subtitles should be downloaded to the user's computer with the .srt file format", () => {
        const downloadsFolder = Cypress.config("downloadsFolder");
        const newText = "E2E Test Text";
        const newStartTime = 1.24;
        const newEndTime = 4.56;

        // Ensure downloads folder is empty before running this test
        cy.task("deleteFolder", downloadsFolder);

        cy.get(".edit-subtitles-button").click(); // Enter edit mode

        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .find(".subtitle")
          .contains(newText)
          .should("not.exist");
        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .find(".subtitle")
          .type(newText);
        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .find(".subtitle")
          .contains(newText);

        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .find(".start-time")
          .find("input")
          .clear()
          .type(`{del}${newStartTime}`)
          .should("have.value", `${newStartTime}`);
        cy.get(".subtitle-tracklist-viewer")
          .find(".subtitle-element")
          .first()
          .find(".end-time")
          .find("input")
          .clear()
          .type(`{del}${newEndTime}`)
          .should("have.value", `${newEndTime}`);

        cy.get(".edit-subtitles-button").click(); // Exit edit mode
        cy.get(".download-subtitles-button").click();

        const filename = path.join(downloadsFolder, engSrtSubtitleUrl);
        cy.readFile(filename, { timeout: 15000 }).then(text => {
          expect(text).to.contain(newText);
          const captions = SrtSubtitles.convertSrtToCaptions(text);
          expect(captions).to.not.be.empty;
          expect(captions[0].text).to.contain(newText);
          expect(captions[0].startTime).to.be.equal(newStartTime);
          expect(captions[0].endTime).to.be.equal(newEndTime);
        });
      });

      describe("after clicking the 'Edit Subtitles' button, the user should be able to", () => {
        beforeEach(() => {
          cy.get(".edit-subtitles-button").click();
        });

        it("edit any subtitle's text in the sidebar", () => {
          const newText = "E2E Test Text";
          cy.get(".subtitle-tracklist-viewer")
            .find(".subtitle-element")
            .first()
            .find(".subtitle")
            .contains(newText)
            .should("not.exist");
          cy.get(".subtitle-tracklist-viewer")
            .find(".subtitle-element")
            .first()
            .find(".subtitle")
            .type(newText);
          cy.get(".subtitle-tracklist-viewer")
            .find(".subtitle-element")
            .first()
            .find(".subtitle")
            .contains(newText);
        });

        it("edit any subtitle's start time in the sidebar", () => {
          cy.get(".subtitle-tracklist-viewer")
            .find(".subtitle-element")
            .first()
            .find(".start-time")
            .find("input")
            .then($input => {
              const value = parseFloat($input.val());
              cy.wrap($input)
                .clear()
                .type(`{del}${value + 1}`)
                .then(() => {
                  const value2 = parseFloat($input.val());
                  expect(value2).to.be.equal(value + 1);
                });
            });
        });

        it("edit any subtitle's end time in the sidebar", () => {
          cy.get(".subtitle-tracklist-viewer")
            .find(".subtitle-element")
            .first()
            .find(".end-time")
            .find("input")
            .then($input => {
              const value = parseFloat($input.val());
              cy.wrap($input)
                .clear()
                .type(`{del}${value + 1}`)
                .then(() => {
                  const value2 = parseFloat($input.val());
                  expect(value2).to.be.equal(value + 1);
                });
            });
        });

        it("see an input box to offset all subtitles at once", () => {
          cy.get(".offset-input").should("exist");
        });

        it("edit the input box to offset all subtitles at once", () => {
          const startTimes = [];
          const endTimes = [];
          cy.get(".subtitle-tracklist-viewer")
            .find(".subtitle-element")
            .find(".start-time")
            .find("input")
            .each($input => {
              const value = parseFloat($input.val());
              startTimes.push(value);
            });
          cy.get(".subtitle-tracklist-viewer")
            .find(".subtitle-element")
            .find(".end-time")
            .find("input")
            .each($input => {
              const value = parseFloat($input.val());
              endTimes.push(value);
            });

          cy.get(".offset-input")
            .clear()
            .type("-1");

          cy.get(".subtitle-tracklist-viewer")
            .find(".subtitle-element")
            .find(".start-time")
            .find("input")
            .each(($input, index) => {
              const value = parseFloat($input.val());
              expect(value).to.be.equal(startTimes[index] - 1);
            });
          cy.get(".subtitle-tracklist-viewer")
            .find(".subtitle-element")
            .find(".end-time")
            .find("input")
            .each(($input, index) => {
              const value = parseFloat($input.val());
              expect(value).to.be.equal(endTimes[index] - 1);
            });
        });

        it("see a 'Quit' button to exit edit mode", () => {
          cy.contains("Quit");
        });

        it("click the 'Quit' button and exit edit mode", () => {
          cy.get(".edit-subtitles-button").click();
          cy.contains("Edit Subtitles");
        });
      });
    });
  });
});
