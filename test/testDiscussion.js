/* eslint-env node, mocha */
import assert from "assert";
import Discussion from "../xfdcloser-src/Models/Discussion";
import Venue from "../xfdcloser-src/Venue";
import { mw } from "../globals";

describe("Discussion", function() {
	it("exists", function() {
		assert.ok(Discussion);
	});
	it("cannot be instantiated without configuration", function() {
		assert.throws(() => new Discussion());
	});
	describe("without pages:", function() {
		let discussion;
		beforeEach(function() {
			discussion = new Discussion({
				id: "123",
				venue: Venue.Afd(),
				discussionPageName: "Wikipedia:Articles for deletion/Foo",
				sectionHeader: "Foo",
				sectionNumber: "1",
				firstCommentDate: new Date(2020, 5, 1),
				isRelisted: false,
			});
		});

		it("does not show quick links", function() {
			assert.strictEqual(discussion.showQuickClose, false);
		});
	});
	describe("with pages:", function() {
		let discussion;
		beforeEach(function() {
			discussion = new Discussion({
				id: "123",
				venue: Venue.Afd(),
				pages: [
					mw.Title.newFromText("Foo"),
					mw.Title.newFromText("Bar"),
				],
				discussionPageName: "Wikipedia:Articles for deletion/Foo",
				sectionHeader: "Foo",
				sectionNumber: "1",
				firstCommentDate: new Date(2020, 5, 1),
				isRelisted: false,
			});
		});

		it("does show quick links", function() {
			assert.strictEqual(discussion.showQuickClose, true);
		});

		it("does not show buttons initially", function() {
			assert.strictEqual(discussion.showButtons, false);
		});

		it("initally has a loading status that is shown", function() {
			assert.strictEqual(discussion.showStatus, true, "initially shows status");
			assert.strictEqual(discussion.status, "Loading...", "initial status is loading");
		});

		it("blanks and hides status when ready", function() {
			discussion.setStatusReady();
			assert.strictEqual(discussion.showStatus, false, "does not show status");
			assert.strictEqual(discussion.status, "", "status is blank");
		});

		it("shows buttons when ready", function() {
			discussion.setStatusReady();
			assert.strictEqual(discussion.showButtons, true);
		});

		it("hides buttons when window is opened", function() {
			discussion.setStatusReady();
			discussion.setWindowOpened("close");
			assert.strictEqual(discussion.showButtons, false);
		});

		it("sets and shows status based on window open type", function() {
			discussion.setStatusReady();
			discussion.setWindowOpened("close");
			assert.strictEqual(discussion.status, "Closing discussion...");
			discussion.setWindowOpened("relist");
			assert.strictEqual(discussion.status, "Relisting discussion...");
			assert.strictEqual(discussion.showStatus, true);
		});

		it("shows buttons when window is closed without data", function() {
			discussion.setStatusReady();
			discussion.setWindowOpened("close");
			discussion.setClosedWindowData();
			assert.strictEqual(discussion.showButtons, true);
		});

		it("shows aborted status messsage after aborting close", function() {
			discussion.setStatusReady();
			discussion.setWindowOpened("close");
			discussion.setClosedWindowData({aborted: true});
			assert.strictEqual(discussion.showStatus, true);
			assert.strictEqual(discussion.status.toLowerCase().includes("aborted") && discussion.status.includes("close"), true);
		});

		it("shows aborted status messsage after aborting relist", function() {
			discussion.setStatusReady();
			discussion.setWindowOpened("relist");
			discussion.setClosedWindowData({aborted: true});
			assert.strictEqual(discussion.showStatus, true);
			assert.strictEqual(discussion.status.toLowerCase().includes("aborted") && discussion.status.includes("relist"), true);
		});
	});
	describe("with over 50 pages for non-admin:", function() {
		let discussion;
		beforeEach(function() {
			discussion = new Discussion({
				id: "123",
				venue: Venue.Afd(),
				pages: new Array(51).map((_, index) => mw.Title.newFromText("T"+index)),
				discussionPageName: "Wikipedia:Articles for deletion/Foo",
				sectionHeader: "Foo",
				sectionNumber: "1",
				firstCommentDate: new Date(2020, 5, 1),
				isRelisted: false,
				userIsSysop: false
			});
		});

		it("does not show buttons initially", function() {
			assert.strictEqual(discussion.showButtons, false);
		});

		it("initally has a loading status that is shown", function() {
			assert.strictEqual(discussion.showStatus, true, "initially shows status");
			assert.strictEqual(discussion.status, "Loading...", "initial status is loading");
		});

		it("Shows too many pages status when ready", function() {
			discussion.setStatusReady();
			assert.strictEqual(discussion.showStatus, true, "does show status");
			assert.strictEqual(discussion.status, "[XFDcloser: Too many pages for non-admin]", "too many pages status");
		});

		it("does not show buttons when ready", function() {
			discussion.setStatusReady();
			assert.strictEqual(discussion.showButtons, false);
		});
	});
	describe("with over 50 pages for admin:", function() {
		let discussion;
		beforeEach(function() {
			discussion = new Discussion({
				id: "123",
				venue: Venue.Afd(),
				pages: new Array(51).map((_, index) => mw.Title.newFromText("T"+index)),
				discussionPageName: "Wikipedia:Articles for deletion/Foo",
				sectionHeader: "Foo",
				sectionNumber: "1",
				firstCommentDate: new Date(2020, 5, 1),
				isRelisted: false,
				userIsSysop: true
			});
		});

		it("does not show buttons initially", function() {
			assert.strictEqual(discussion.showButtons, false);
		});

		it("initally has a loading status that is shown", function() {
			assert.strictEqual(discussion.showStatus, true, "initially shows status");
			assert.strictEqual(discussion.status, "Loading...", "initial status is loading");
		});

		it("blanks and hides status when ready", function() {
			discussion.setStatusReady();
			assert.strictEqual(discussion.showStatus, false, "does not show status");
			assert.strictEqual(discussion.status, "", "status is blank");
		});

		it("shows buttons when ready", function() {
			discussion.setStatusReady();
			assert.strictEqual(discussion.showButtons, true);
		});
	});
	describe("URL update after closing:", function() {
		let originalHash;
		
		beforeEach(function() {
			originalHash = window.location.hash;
		});

		afterEach(function() {
			// Restore original hash or clear it completely if it was empty
			if (originalHash) {
				window.history.replaceState(null, "", originalHash);
			} else {
				// In test environment, just clear the hash without constructing full URL
				window.location.hash = "";
			}
		});

		describe("for CFD (venue without individual subpages):", function() {
			let discussion;
			beforeEach(function() {
				discussion = new Discussion({
					id: "123",
					venue: Venue.Cfd(),
					pages: [mw.Title.newFromText("Category:Foo")],
					discussionPageName: "Wikipedia:Categories for discussion/Log/2020 June 1",
					sectionHeader: "Category:Foo",
					sectionNumber: "1",
					firstCommentDate: new Date(2020, 5, 1),
					isRelisted: false,
				});
				// Simulate opening the window first (which sets this.type)
				discussion.setWindowOpened("close");
			});

			it("updates URL with section hash on successful close", function() {
				discussion.setClosedWindowData({success: true, result: "keep"});
				assert.strictEqual(window.location.hash, "#Category:Foo");
			});

			it("does not update URL when cancelled", function() {
				const hashBeforeCancel = window.location.hash;
				discussion.setClosedWindowData();
				assert.strictEqual(window.location.hash, hashBeforeCancel);
			});

			it("does not update URL when aborted", function() {
				const hashBeforeAbort = window.location.hash;
				discussion.setClosedWindowData({aborted: true});
				assert.strictEqual(window.location.hash, hashBeforeAbort);
			});
		});

		describe("for AFD (venue with individual subpages):", function() {
			let discussion;
			beforeEach(function() {
				discussion = new Discussion({
					id: "123",
					venue: Venue.Afd(),
					pages: [mw.Title.newFromText("Foo")],
					discussionPageName: "Wikipedia:Articles for deletion/Foo",
					sectionHeader: "Foo",
					sectionNumber: "1",
					firstCommentDate: new Date(2020, 5, 1),
					isRelisted: false,
				});
				// Simulate opening the window first (which sets this.type)
				discussion.setWindowOpened("close");
			});

			it("does not update URL on successful close (has individual subpages)", function() {
				const hashBeforeClose = window.location.hash;
				discussion.setClosedWindowData({success: true, result: "keep"});
				assert.strictEqual(window.location.hash, hashBeforeClose);
			});
		});
	});
});