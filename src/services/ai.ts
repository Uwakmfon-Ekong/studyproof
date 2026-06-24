export interface Question {
  id: number;
  type: 'multiple' | 'short' | 'truefalse';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

const AI_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

async function callAI(prompt: string, maxTokens: number = 2000): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    return generateEnhancedMock(prompt);
  }

  try {
    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || generateEnhancedMock(prompt);
  } catch (error) {
    console.error('AI call failed:', error);
    return generateEnhancedMock(prompt);
  }
}

function generateEnhancedMock(prompt: string): string {
  const docMatch = prompt.match(/document named "([^"]+)"/i);
  const docName = docMatch ? docMatch[1] : 'your lecture';

  if (prompt.includes('summary') && !prompt.includes('10-year-old')) {
    return `## Main Concepts

Okay so basically, ${docName} covers some important stuff. Let me break it down for you.

### Key Topic 1: The Foundation

Here's the thing about this document - it starts with the basics and builds up. Think of it like learning to walk before you run. The key concepts here form the foundation for everything else.

### Key Topic 2: How It All Connects

The cool part is how these ideas link together. It's not just random information - there's a logic to it. Once you see the pattern, the whole thing makes way more sense.

### Key Topic 3: Why It Matters

This is where it gets practical. The document shows you how to actually use these concepts, not just memorize them. That's the difference between knowing something and understanding it.

**Bottom line:** Read through this once, then come back to the parts that didn't click. You've got this.`;
  }

  if (prompt.includes('10-year-old') || prompt.includes('simply')) {
    return `**So what's this really about?**

Imagine you're trying to explain ${docName} to a curious kid. Here's how it goes:

Picture a big puzzle. This document is like the picture on the puzzle box - it shows you what the final image looks like when all the pieces fit together.

**The main idea in kid terms:**

Think of it like learning to ride a bike. At first it seems scary and complicated. But once someone breaks it down - "push the pedals, keep your balance, look ahead" - suddenly it makes sense.

**Why should you care?**

Because understanding this stuff is like having a secret key. Once you get it, a whole bunch of other things suddenly make sense too. It's like leveling up in a video game - new areas unlock.

**Remember:** You don't need to be a genius to get this. You just need someone to explain it the right way!`;
  }

  return '';
}

export async function generateSummary(pdfContent: string, fileName: string): Promise<string> {
  const prompt = `You are a friendly study companion. A student uploaded a document named "${fileName}" with this content:

"""
${pdfContent.slice(0, 4000)}
"""

Write a clear, friendly summary of this document. Use these guidelines:
- Write like a smart friend explaining it, not a textbook
- Use short paragraphs with breathing room
- Start with "Okay so basically..."
- Use headings like "### Key Topic 1:" for main sections
- End with a "Bottom line:" takeaway
- Be encouraging and warm
- No jargon without explaining it

Format with markdown. Keep it under 500 words.`;

  return callAI(prompt, 1500);
}

export async function generateSimpleExplanation(pdfContent: string, fileName: string): Promise<string> {
  const prompt = `You are explaining a document to a curious 10-year-old. The document "${fileName}" contains:

"""
${pdfContent.slice(0, 4000)}
"""

Explain this in the simplest way possible:
- Use everyday analogies (like riding a bike, video games, cooking)
- Start with "So what's this really about?"
- Use **bold** for section headers
- Keep each section short and punchy
- Make the reader go "oh, THAT'S what that means"
- Be fun and encouraging, never condescending

Format with markdown. Keep it under 400 words.`;

  return callAI(prompt, 1200);
}

export async function generateQuestions(pdfContent: string, fileName: string): Promise<Question[]> {
  const prompt = `You are creating practice questions for a student who just studied "${fileName}". The content is:

"""
${pdfContent.slice(0, 3000)}
"""

Generate 6 practice questions in this exact JSON format (no markdown, just pure JSON):
[
  {
    "id": 1,
    "type": "multiple",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A",
    "explanation": "Brief friendly explanation of why this is correct"
  },
  {
    "id": 2,
    "type": "truefalse",
    "question": "Statement to evaluate?",
    "answer": "True",
    "explanation": "Why this is true/false"
  },
  {
    "id": 3,
    "type": "short",
    "question": "Open-ended question?",
    "answer": "Key points the answer should cover",
    "explanation": "What a good answer includes"
  }
]

Mix multiple choice, true/false, and short answer. Make questions that test understanding, not memorization. Be encouraging in explanations.`;

  const response = await callAI(prompt, 2000);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse questions:', e);
  }

  return getDefaultQuestions(fileName);
}

function getDefaultQuestions(fileName: string): Question[] {
  return [
    {
      id: 1,
      type: 'multiple',
      question: `What is the main purpose of ${fileName}?`,
      options: ['To confuse students', 'To explain key concepts clearly', 'To test memorization', 'To replace lectures'],
      answer: 'To explain key concepts clearly',
      explanation: 'The document is designed to help you understand the material in a clear, approachable way.'
    },
    {
      id: 2,
      type: 'truefalse',
      question: 'Understanding the foundation concepts helps with learning advanced topics.',
      answer: 'True',
      explanation: 'Building a strong foundation makes everything else easier to understand - just like building blocks!'
    },
    {
      id: 3,
      type: 'short',
      question: 'In your own words, what is the most important takeaway from this document?',
      answer: 'The key is understanding the core concepts and how they connect to each other.',
      explanation: 'A good answer shows you grasped the main ideas, not just memorized details.'
    },
    {
      id: 4,
      type: 'multiple',
      question: 'Which approach helps most when studying this material?',
      options: ['Reading once and moving on', 'Breaking it into smaller chunks', 'Memorizing every word', 'Skipping the hard parts'],
      answer: 'Breaking it into smaller chunks',
      explanation: 'Taking it step by step helps your brain process and retain information better.'
    },
    {
      id: 5,
      type: 'truefalse',
      question: 'You need to be a genius to understand this material.',
      answer: 'False',
      explanation: 'Not at all! You just need clear explanations and practice. Anyone can learn this.'
    },
    {
      id: 6,
      type: 'short',
      question: "How would you explain the main concept to a friend who hasn't read this?",
      answer: 'The main concept is about understanding the fundamentals and building up from there.',
      explanation: 'If you can explain it simply to someone else, you truly understand it!'
    }
  ];
}
