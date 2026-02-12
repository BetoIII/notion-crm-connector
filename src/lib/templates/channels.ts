export type MessagingChannel = "sms" | "whatsapp";

export interface ChannelConfig {
  id: MessagingChannel;
  label: string;
  description: string;
  activityType: string;
  notionActivityType: string;
  generatePromptLine: (
    index: number,
    phone: string,
    contactName: string,
    message: string
  ) => string;
  clipboardInstructions: string;
}

export const CHANNELS: Record<MessagingChannel, ChannelConfig> = {
  sms: {
    id: "sms",
    label: "SMS / iMessage",
    description: "Send via iMessage through Claude Desktop",
    activityType: "SMS",
    notionActivityType: "Email",
    generatePromptLine: (idx, phone, name, message) =>
      `${idx}. Send an iMessage to ${phone} (${name}) with:\n"${message}"`,
    clipboardInstructions:
      'Paste into Claude Desktop after enabling the "Read and Send iMessages" connector',
  },
  whatsapp: {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Send via WhatsApp MCP through Claude Desktop",
    activityType: "WhatsApp",
    notionActivityType: "Email",
    generatePromptLine: (idx, phone, name, message) =>
      `${idx}. Use the WhatsApp MCP send_message tool to send a message to ${phone} (${name}) with:\n"${message}"`,
    clipboardInstructions:
      'Paste into Claude Desktop after enabling the "WhatsApp" MCP connector and ensuring the WhatsApp bridge is running',
  },
};
