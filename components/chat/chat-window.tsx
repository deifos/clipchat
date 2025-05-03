'use client';

import { useChatWithTools } from '@/hooks/use-chat-with-tools';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function ChatWindow() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, lastToolCall } = useChatWithTools();
  
  // Debug logging for messages
  useEffect(() => {
    console.log('ChatWindow received messages:', messages);
  }, [messages]);
  
  // Initialize with a welcome message
  const [showWelcome, setShowWelcome] = useState(true);
  
  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-muted/50 rounded-lg p-4">
      <div className="flex-1 overflow-hidden flex flex-col">
        {showWelcome && (
          <div className="bg-muted/30 p-4 mb-2 rounded border border-border">
            <h3 className="font-medium text-lg mb-2">Welcome to ClipChat AI Editor!</h3>
            <p>I'm your AI video editing assistant. I can help you:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Change aspect ratios for different platforms</li>
              <li>Edit video content and timing</li>
              <li>Provide editing suggestions</li>
              <li>Guide you through the video creation process</li>
            </ul>
            <p className="mt-2">Just mention a platform (like TikTok, YouTube, Instagram) and I'll automatically set the right aspect ratio!</p>
          </div>
        )}
        
        {/* Tool call notification */}
        {lastToolCall && (
          <div className="bg-blue-50 dark:bg-blue-950/30 text-xs p-3 mb-2 rounded border border-blue-200 dark:border-blue-800 flex items-center gap-2">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                className="h-3 w-3 text-blue-600 dark:text-blue-400"
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-300">Action:</span>{" "}
              <span className="text-blue-700 dark:text-blue-200">{lastToolCall}</span>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} />
        </div>
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
