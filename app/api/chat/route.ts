import { Message, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { SYSTEM_PROMPT } from '@/lib/system-prompt';
import { tools } from '@/lib/tools';

/**
 * Chat API endpoint using Vercel AI SDK with Google's Generative AI
 * 
 * This endpoint processes chat messages and returns AI responses.
 * It uses the Vercel AI SDK for easier model switching in the future.
 */

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Initialize the Google model
const geminiModel = google('gemini-2.0-flash-exp');

/**
 * Handle POST requests to the chat endpoint
 */
export async function POST(req: Request) {
  try {
    // Parse the incoming request
    const { messages } = await req.json();
    console.log('📨 Received chat request:', 
      messages.map((m: Message) => ({ role: m.role, content: m.content?.substring(0, 50) }))
    );
    
    try {
      // Add system prompt if not already present
      const systemPromptIncluded = messages.some((m: Message) => m.role === 'system');
      const messagesWithSystem = systemPromptIncluded ? messages : [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ];
      
      console.log('🤖 Using Vercel AI SDK with Google Generative AI');
      
      // Generate response using the Vercel AI SDK with tools
      // Note: The SDK automatically uses API keys from environment variables
      const result = streamText({
        model: geminiModel,
        messages: messagesWithSystem,
        temperature: 0.7,
        maxTokens: 1000,
        tools, // Add the tools from lib/tools.ts
        experimental_toolCallStreaming: true, // Enable streaming tool calls
        maxSteps: 5, // Allow up to 5 tool calls in a single response
      });
      
      // Return the streaming response
      return result.toDataStreamResponse();
    } catch (aiError) {
      console.error('🔴 AI API error:', aiError);
      console.log('Falling back to mock responses');
      return handleMockResponse(messages);
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// This function is no longer needed as we're using the SDK's built-in streaming response

// Mock AI responses that handle common queries and aspect ratio changes
async function handleMockResponse(messages: Message[]) {
  const lastMessage = messages[messages.length - 1].content;
  console.log("🤖 Last message (mock mode):", lastMessage);
  
  // Default response if no patterns match
  let responseText = "I'm your video editing assistant. How can I help you today?";
  
  const lowerCaseMessage = lastMessage.toLowerCase();
  
  // Check for questions about tools and capabilities
  if (lowerCaseMessage.includes("what tools") || 
      lowerCaseMessage.includes("what can you do") || 
      lowerCaseMessage.includes("help with") || 
      lowerCaseMessage.includes("capabilities") || 
      lowerCaseMessage.includes("features")) {
    responseText = `I can help you with several video editing tasks! My main features include:

1. Changing aspect ratios for different platforms (16:9, 9:16, 1:1, 4:3, 21:9)
2. Recommending the best aspect ratio for specific platforms like YouTube, TikTok, or Instagram
3. Providing guidance on video editing best practices
4. Suggesting improvements for your videos

Just let me know what you'd like help with!`;
  }
  // Check for questions about creating images
  else if (lowerCaseMessage.includes("create images") || 
           lowerCaseMessage.includes("generate image") || 
           lowerCaseMessage.includes("make image")) {
    responseText = "I'm specialized in video editing and aspect ratio management, not image creation. I can help you optimize your existing video content, but I can't generate or create new images. Would you like help with your video instead?";
  }
  // Check for greetings
  else if ((lowerCaseMessage === "hi" || 
            lowerCaseMessage === "hello" || 
            lowerCaseMessage === "hey") || 
            lowerCaseMessage.startsWith("hi ") || 
            lowerCaseMessage.startsWith("hello ") || 
            lowerCaseMessage.startsWith("hey ")) {
    const greetings = [
      "Hello! Ready to work on your video project today?",
      "Hi there! How can I assist with your video editing?",
      "Hey! What kind of video are you working on today?",
      "Hello! I'm your AI video assistant. What would you like to do with your video?",
      "Hi! Looking to optimize your video for a specific platform?",
    ];
    responseText = greetings[Math.floor(Math.random() * greetings.length)];
  }
  // Check for aspect ratio change requests
  else if (lowerCaseMessage.includes("aspect ratio")) {
    responseText = "I can help you change the aspect ratio. Would you like to change it to 16:9, 9:16, 1:1, or something else?";
  } else if (lowerCaseMessage.includes("16:9")) {
    responseText = "I've changed the aspect ratio to 16:9, which is perfect for YouTube and most widescreen videos.";
  } else if (lowerCaseMessage.includes("9:16")) {
    responseText = "I've changed the aspect ratio to 9:16, which is ideal for TikTok, Instagram Reels, and other vertical video platforms.";
  } else if (lowerCaseMessage.includes("1:1")) {
    responseText = "I've changed the aspect ratio to 1:1 (square), which works well for Instagram posts and other square formats.";
  } 
  // Platform-specific requests
  else if (lowerCaseMessage.includes("youtube")) {
    responseText = "For YouTube, I recommend the 16:9 aspect ratio. I've updated it for you!";
  } else if (lowerCaseMessage.includes("tiktok") || lowerCaseMessage.includes("reels")) {
    responseText = "For TikTok and Reels, I recommend the 9:16 aspect ratio. I've updated it for you!";
  } else if (lowerCaseMessage.includes("instagram") && !lowerCaseMessage.includes("reels")) {
    responseText = "For Instagram posts, I recommend the 1:1 (square) aspect ratio. I've updated it for you!";
  }
  
  console.log("✨ Mock response:", responseText);

  // Return the response in the mock format
  return new Response(
    JSON.stringify({ 
      role: "assistant", 
      content: responseText,
      id: `chatcmpl-${Date.now()}`
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
