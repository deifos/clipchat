'use client';

import { useChat } from '@ai-sdk/react';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';

export function ChatWindow() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col h-full bg-muted/50 rounded-lg p-4">
      <div className="flex-1 h-[calc(100vh-12rem)] min-h-0">
        <MessageList messages={messages} />
      </div>
      <MessageInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
