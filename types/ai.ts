import type { Message } from 'ai'

export interface AIMessage extends Message {
  function_call?: {
    name: string;
    arguments: string;
  };
}
