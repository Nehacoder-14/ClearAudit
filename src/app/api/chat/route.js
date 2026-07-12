import { NextResponse } from 'next/server';
import { getContracts, getAlerts, getChatMessages, saveChatMessage } from '@/lib/db';
import { chatWithPortfolio } from '@/lib/ai';

export async function POST(request) {
  try {
    const { messages, sessionId = 'default' } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, error: 'Invalid or missing messages array' }, { status: 400 });
    }

    // Fetch context
    const contracts = await getContracts();
    const alerts = await getAlerts();

    // Get conversation history from session memory
    const history = await getChatMessages(sessionId);
    
    // Add current user message
    const lastUserMsg = messages[messages.length - 1];
    await saveChatMessage(sessionId, { role: 'user', content: lastUserMsg.content });

    // Combine history with latest message for LLM context
    const fullMessages = [...history, lastUserMsg];

    // Get grounded assistant response
    const replyContent = await chatWithPortfolio(fullMessages, contracts, alerts);

    // Save assistant message to memory
    await saveChatMessage(sessionId, { role: 'assistant', content: replyContent });

    return NextResponse.json({
      success: true,
      response: replyContent
    });

  } catch (e) {
    console.error("Chat API failed:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// Clean chat session history
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || 'default';
    
    const { clearChats } = require('@/lib/db');
    await clearChats(sessionId);

    return NextResponse.json({ success: true, message: `Cleared conversation memory for session ${sessionId}` });
  } catch (e) {
    console.error("Clear Chat API failed:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
