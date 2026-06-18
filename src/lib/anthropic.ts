import Anthropic from "@anthropic-ai/sdk";

// Client is instantiated once and reused across requests (server-side only)
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
