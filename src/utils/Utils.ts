import { Collection, MessageAttachment } from "discord.js";

export default module.exports = {
    formatAttachmentsURL(
        attachments: Collection<String, MessageAttachment>
    ) {
        let content: string = "";
        for (const file of attachments.values()) {
            content += file.url + "\n";
        }
        return content;
    }
}
