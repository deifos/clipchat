'use client';

import { Message } from 'ai';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  return (
    <ScrollArea className="h-full px-2">
      <div className="pb-2 pt-2">
      <div className="flex flex-col gap-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3 text-sm px-2',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role !== 'user' && (
              <Avatar className="h-8 w-8 ring-2 ring-border bg-background">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                'rounded-lg px-3 py-2 max-w-[80%]',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <div className="whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
            {message.role === 'user' && (
              <Avatar className="h-8 w-8 ring-2 ring-border bg-background">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      </div>
    </ScrollArea>
  );
}
