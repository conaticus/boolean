import { Collection, MessageAttachment } from "discord.js";

import util from "../src/utils";
import { MockMessageAttachment } from "./mock.test";

const attachmentWithUrl = (url: string): MessageAttachment => {
    const mockMessageAtatchment = new MockMessageAttachment();
    mockMessageAtatchment.url = url;
    return mockMessageAtatchment;
};

it("should format attachment url", () => {
    const mockDataCollection = new Collection<string, MessageAttachment>();

    mockDataCollection.set(
        "1",
        attachmentWithUrl("https://example.com/file.png")
    );

    expect(util.formatAttachmentsURL(mockDataCollection)).toBe(
        "https://example.com/file.png\n"
    );

    mockDataCollection.set(
        "2",
        attachmentWithUrl("https://example.com/file2.png")
    );

    expect(util.formatAttachmentsURL(mockDataCollection)).toBe(
        "https://example.com/file.png\nhttps://example.com/file2.png\n"
    );
});
