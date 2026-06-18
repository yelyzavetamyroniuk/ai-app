export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  messages: Message[];
};
