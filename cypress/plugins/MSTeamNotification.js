Object.defineProperty(exports, "__esModule", { value: true });
const postmanRequest = require("postman-request");
const { systemLog } = require("../support/utilities/utilities");
class MSTeamNotification {
    constructor(argWebhookUrl, argMessage) {
        this.webhookUrl = null;
        this.message = {
            title: null,
            content: null,
            dte: null,
        };
        this.defaultTitle = "MSTeam Notification\n";
        this.webhookUrl = argWebhookUrl;
        if (argMessage) {
            this.setMessage(argMessage);
        }
    }
    sendMessage(argMessage) {
        if (argMessage) {
            this.setMessage(argMessage);
            this.sendMessage();
        }
        else {
            if (this.message) {
                systemLog(JSON.stringify(this.message));
                postmanRequest.post({
                    url: this.webhookUrl,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: this.getMessage() }),
                }, (err, httpResponse, body) => {
                    if (err) {
                        throw Error(`unable to send MSTeam Notification /n err /n ${err} /n body /n ${body}`);
                    } else {
                        systemLog(`MSTeam message OK`);
                    }
                });
            }
            else {
                throw Error("No message provided for MSTeam Notification");
            }
        }
    }
    setMessage(argMessage) {
        (typeof (argMessage) === "string")
            ? this.message.content = argMessage
            : this.message.content = argMessage.content
                ? argMessage.content : "Error!/nPlease contact Test Automation Team.";
        this.message.title = argMessage.title ? argMessage.title : this.defaultTitle;
        this.message.dte = new Date().toString();
    }
    getMessage() {
        const messageFooter = `[Generated at ${this.message.dte}.\nRegards,\nAutomation Team.]`;
        return `${this.message.title}\n${this.message.content}\n\n${messageFooter}`;
    }
}
exports.MSTeamNotification = MSTeamNotification;