export interface Question {
  id: number;
  type: 'multiple' | 'short' | 'truefalse';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

const BASE_URL = 'https://router-api.0g.ai/v1';
const OG_ENDPOINT = `${BASE_URL}/chat/completions`;

// ⚠️ keep this configurable (some 0G setups require different models)
const MODEL = 'glm-5.2';

async function callAI(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 1000
): Promise<string> {
  const apiKey = import.meta.env.VITE_0G_API_KEY;

  if (!apiKey) {
    console.warn('Missing VITE_0G_API_KEY');
    throw new Error('API key missing');
  }

  try {
    const response = await fetch(OG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    const rawText = await response.text();

    if (!response.ok) {
      console.error('0G API error response:', rawText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = JSON.parse(rawText);

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty AI response');
    }

    return content;
  } catch (error) {
    console.error('AI call failed:', error);
    throw error; // 🚨 IMPORTANT: don’t silently fallback while debugging
  }
}

function generateFallbackContent(prompt: string): string {
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

const VOICE_SYSTEM_PROMPT = `You are the AI inside StudyProof, a study companion for students. Your job is to take complex lecture material and make it genuinely understandable.

Voice rules:
- Warm, encouraging, and clear — like a smart older sibling who's good at explaining things
- Never condescending, never robotic, never corporate
- Use plain language by default — only use technical terms when necessary, and always explain them immediately
- Short paragraphs, lots of breathing room
- For simple explanations, lean fully into analogy and everyday examples
- Be playful and encouraging — studying should feel achievable, not punishing
- Phrases to use: "okay so basically...", "here's the thing about...", "think of it like...", "the key thing to remember is..."
- Phrases to NEVER use: "it is important to note that...", "in summary...", "as mentioned previously...", "this document discusses..."`;

export async function generateSummary(pdfContent: string, fileName: string): Promise<string> {
  return callAI(
    VOICE_SYSTEM_PROMPT,
    `A student uploaded a document named "${fileName}". Here's the content:

"""
${pdfContent.slice(0, 4000)}
"""

Write a clear, friendly summary. Use these guidelines:
- Write like a smart friend explaining it, not a textbook
- Short paragraphs with breathing room
- Start with "okay so basically..."
- Use headings like "### Key Topic:" for main sections
- End with a one-line "bottom line:" takeaway
- Be encouraging and warm
- Use markdown formatting. Keep it under 500 words.`,
    1000
  );
}

export async function generateSimpleExplanation(pdfContent: string, fileName: string): Promise<string> {
  return callAI(
    VOICE_SYSTEM_PROMPT,
    `Explain this document to a curious 10-year-old. The document "${fileName}" contains:

"""
${pdfContent.slice(0, 4000)}
"""

Explain it as simply as possible:
- Use everyday analogies (bikes, video games, cooking, sports)
- Start with "so what's this really about?"
- Use **bold** for section headers
- Keep each section short and punchy
- Make the reader go "oh, THAT'S what that means"
- Fun and encouraging tone throughout
- Use markdown. Keep it under 400 words.`,
    1000
  );
}

export async function generateQuestions(
  pdfContent: string,
  fileName: string
): Promise<Question[]> {
  const response = await callAI(
    VOICE_SYSTEM_PROMPT,
    `Create 6 practice questions for "${fileName}".

Return ONLY valid JSON array of questions.

Content:
"""
${pdfContent.slice(0, 3000)}
"""`,
    1000
  );

  try {
    const parsed = JSON.parse(response);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    throw new Error('Response is not an array');
  } catch (e) {
    console.error('Failed to parse AI JSON:', e);
    return getDefaultQuestions(fileName);
  }
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
      explanation: 'Building a strong foundation makes everything else easier — just like building blocks!'
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
      question: 'Which approach helps most when studying complex material?',
      options: ['Reading once and moving on', 'Breaking it into smaller chunks', 'Memorizing every word', 'Skipping the hard parts'],
      answer: 'Breaking it into smaller chunks',
      explanation: 'Taking it step by step helps your brain process and retain information better.'
    },
    {
      id: 5,
      type: 'truefalse',
      question: 'You need to be a genius to understand complex academic material.',
      answer: 'False',
      explanation: 'Not at all! You just need clear explanations and practice. Anyone can learn this.'
    },
    {
      id: 6,
      type: 'short',
      question: "How would you explain the main concept to a friend who hasn't read this?",
      answer: 'The main concept is about understanding the fundamentals and building up from there.',
      explanation: "If you can explain it simply to someone else, you truly understand it!"
    }
  ];
}
