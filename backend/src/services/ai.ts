import OpenAI from 'openai';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import {
  ImagePromptResponse,
  parsePromptResponse,
  buildGeneratorPrompt,
  buildOptimizerPrompt,
  buildImageToPromptPrompt,
  GEMINI_RESPONSE_SCHEMA,
  OPENROUTER_SYSTEM_INSTRUCTION,
  SYSTEM_INSTRUCTION,
  GenerateOptions,
  OptimizeOptions,
  ExpandOptions,
  ImageToPromptOptions
} from './aiUtils';

export type AIProvider = 'openrouter' | 'gemini' | 'template';

export interface AiContext {
  provider?: string;
  apiKey?: string;
  model?: string;
}

// ─── Core Utilities & Settings ────────────────────────────────────────────────

function isValidProvider(p?: string): p is AIProvider {
  return p === 'openrouter' || p === 'gemini' || p === 'template';
}

function getProvider(ctx?: AiContext): AIProvider {
  if (isValidProvider(ctx?.provider) && ctx?.apiKey) {
    return ctx.provider;
  }
  if (ctx?.provider === 'template') return 'template';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.OPENROUTER_API_KEY) return 'openrouter';
  return 'template';
}

function getModel(provider: AIProvider, ctx?: AiContext): string {
  if (ctx?.model) return ctx.model;
  switch (provider) {
    case 'openrouter':
      return process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';
    case 'gemini':
      return process.env.GEMINI_MODEL || 'gemma-4-31b-it'; // Updated to use the new Gemma 3 model available in this environment
    default:
      return '';
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (retries <= 0) throw e;
    console.warn(`Request failed, retrying... (${retries} left)`);
    return withRetry(fn, retries - 1);
  }
}

// ─── Provider Implementations ─────────────────────────────────────────────────

interface ProviderImplementation {
  generate(options: GenerateOptions, ctx?: AiContext): Promise<ImagePromptResponse>;
  optimize(options: OptimizeOptions, ctx?: AiContext): Promise<ImagePromptResponse>;
  imageToPrompt(options: ImageToPromptOptions, ctx?: AiContext): Promise<ImagePromptResponse>;
  expand(options: ExpandOptions, ctx?: AiContext): Promise<string>;
}

// 1. Template
const templateProvider: ProviderImplementation = {
  async generate(options) {
    return parsePromptResponse(JSON.stringify({
      title: "Template Fallback",
      optimizedPrompt: buildGeneratorPrompt(options).substring(0, 150) + "...\n\n[HINWEIS: Bitte API-Key in den Einstellungen hinterlegen]",
      negativePrompt: "ugly, blurry, bad anatomy",
      styleTags: ["template", "placeholder"],
      cameraSuggestions: ["standard lens"],
      lightingSuggestions: ["studio lighting"],
      improvementNotes: ["Dies ist ein lokales Template (Fallback). Hinterlege einen API-Key unter Einstellungen für echte KI-Generierung!"],
      isTemplate: true
    }));
  },
  async optimize(options) {
    return this.generate(options as any);
  },
  async imageToPrompt() {
    return this.generate({} as any);
  },
  async expand(options) {
    return `[TEMPLATE LOKAL]\n\nNutze folgende Anweisungen präzise:\n${options.draft}\n\n[Bitte API Key hinterlegen]`;
  }
};

// 2. OpenRouter
function getOpenRouterClient(ctx?: AiContext) {
  return new OpenAI({
    apiKey: ctx?.apiKey || process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://promptcraft.pro',
      'X-Title': 'PromptCraft Pro',
    },
  });
}

async function openrouterStructuredCall(userPrompt: string, ctx?: AiContext): Promise<ImagePromptResponse> {
  const client = getOpenRouterClient(ctx);
  const model = getModel('openrouter', ctx);

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: OPENROUTER_SYSTEM_INSTRUCTION },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1500,
    temperature: 0.7,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenRouter: Empty response received');
  }
  return parsePromptResponse(content);
}

const openrouterProvider: ProviderImplementation = {
  async generate(options, ctx) {
    return openrouterStructuredCall(buildGeneratorPrompt(options), ctx);
  },
  async optimize(options, ctx) {
    return openrouterStructuredCall(buildOptimizerPrompt(options.prompt, options.style), ctx);
  },
  async imageToPrompt({ imageBase64, instructions }, ctx) {
    const client = getOpenRouterClient(ctx);
    const model = getModel('openrouter', ctx);

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: OPENROUTER_SYSTEM_INSTRUCTION },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            { type: 'text', text: buildImageToPromptPrompt(instructions) },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenRouter: Empty response received');
    }
    return parsePromptResponse(content);
  },
  async expand(options, ctx) {
    const client = getOpenRouterClient(ctx);
    const model = getModel('openrouter', ctx);
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are a senior AI prompt architect specializing in transforming fragmented user input into high-quality, production-ready system prompts.
	Your task is to analyze the provided bullet points, modular inputs, or draft instructions and synthesize them into a single, coherent, and professionally structured system 				 prompt.

Requirements:
- Ensure clarity, precision, and completeness
- Eliminate redundancy and ambiguity
- Apply consistent terminology and logical structure
- Elevate tone to an authoritative, expert level
- Preserve all relevant intent while improving formulation
- Optimize for direct usability in AI systems (no further editing required)

Output constraints:
- Return ONLY the finalized system prompt
- Do NOT include explanations, commentary, or meta text
- Do NOT reference the transformation process
- Do NOT add conversational elements

The result must read as a clean, deployment-ready instruction set suitable for high-performance AI usage.`,
        },
        { role: 'user', content: options.draft },
      ],
      max_tokens: 8000,
      temperature: 0.7,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenRouter: Empty response received');
    }
    return content;
  }
};

// 3. Gemini
async function executeWithGeminiFallback<T>(
  ctx: AiContext | undefined,
  operation: (modelOverride?: string) => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (err: any) {
    const is503 = err?.status === 503 || (err?.message && (err.message.includes('503') || err.message.includes('unavailable')));
    const isCustomModel = ctx?.model && ctx.model !== 'gemma-4-31b-it';
    if ((is503 || err?.status === 404) && isCustomModel) {
      console.warn(`Gemini model ${ctx.model} unavailable. Falling back to gemma-4-31b-it.`);
      return await operation('gemma-4-31b-it');
    }
    throw err;
  }
}

function getGeminiInstance(ctx?: AiContext, modelOverride?: string) {
  const genAI = new GoogleGenerativeAI(ctx?.apiKey || process.env.GEMINI_API_KEY!);
  const modelName = modelOverride || getModel('gemini', ctx);
  const isGemma = modelName.toLowerCase().includes('gemma');

  const config: any = {
    model: modelName,
    systemInstruction: isGemma ? undefined : (SYSTEM_INSTRUCTION || undefined),
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
  };

  if (!isGemma) {
    config.generationConfig = {
      responseMimeType: 'application/json',
      responseSchema: GEMINI_RESPONSE_SCHEMA,
    };
  }

  return genAI.getGenerativeModel(config);
}

function wrapPrompt(prompt: string, modelName: string): string {
  if (modelName.toLowerCase().includes('gemma')) {
    return `${SYSTEM_INSTRUCTION}\n\nUSER PROMPT:\n${prompt}`;
  }
  return prompt;
}

const geminiProvider: ProviderImplementation = {
  async generate(options, ctx) {
    return executeWithGeminiFallback(ctx, async (modelOverride) => {
      const modelName = modelOverride || getModel('gemini', ctx);
      const model = getGeminiInstance(ctx, modelOverride);
      const result = await model.generateContent(wrapPrompt(buildGeneratorPrompt(options), modelName));
      return parsePromptResponse(result.response.text());
    });
  },
  async optimize(options, ctx) {
    return executeWithGeminiFallback(ctx, async (modelOverride) => {
      const modelName = modelOverride || getModel('gemini', ctx);
      const model = getGeminiInstance(ctx, modelOverride);
      const result = await model.generateContent(wrapPrompt(buildOptimizerPrompt(options.prompt, options.style), modelName));
      return parsePromptResponse(result.response.text());
    });
  },
  async imageToPrompt({ imageBase64, instructions }, ctx) {
    return executeWithGeminiFallback(ctx, async (modelOverride) => {
      const modelName = modelOverride || getModel('gemini', ctx);
      const model = getGeminiInstance(ctx, modelOverride);
      const result = await model.generateContent([
        wrapPrompt(buildImageToPromptPrompt(instructions), modelName),
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
      ]);
      return parsePromptResponse(result.response.text());
    });
  },
  async expand(options, ctx) {
    return executeWithGeminiFallback(ctx, async (modelOverride) => {
      // For expand, we don't need the JSON config
      const genAI = new GoogleGenerativeAI(ctx?.apiKey || process.env.GEMINI_API_KEY!);
      const modelName = modelOverride || getModel('gemini', ctx);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(
        `You are a senior AI prompt architect specializing in converting fragmented, modular, or bullet-point-based user input into high-quality, production-ready system prompts.

Objective:
Analyze the provided draft and synthesize it into a single, coherent, and professionally structured system prompt that is clear, complete, and directly deployable.

Input:
${options.draft}

Process:
- Extract all relevant intent, constraints, and requirements from the draft
- Resolve ambiguities and eliminate redundancies
- Normalize terminology and enforce consistent structure
- Infer and complete missing logical elements where necessary without altering intent
- Organize content into a logical, hierarchical instruction set

Quality Standards:
- Clarity: unambiguous, precise wording
- Completeness: no missing operational details
- Consistency: uniform terminology and structure
- Authority: expert-level, directive tone
- Usability: immediately usable in AI systems without modification

Output Constraints:
- Return ONLY the finalized system prompt
- Do NOT include explanations, commentary, or meta information
- Do NOT reference the transformation process
- Do NOT include conversational language

The output must read as a clean, authoritative, and deployment-ready system prompt.`
      );
      return result.response.text() || templateProvider.expand(options);
    });
  }
};

const providers: Record<AIProvider, ProviderImplementation> = {
  gemini: geminiProvider,
  openrouter: openrouterProvider,
  template: templateProvider,
};

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generatePrompt(options: GenerateOptions, ctx?: AiContext): Promise<ImagePromptResponse & { provider: AIProvider }> {
  const providerKey = getProvider(ctx);
  const impl = providers[providerKey];
  const result = await withRetry(() => impl.generate(options, ctx));
  return { ...result, provider: providerKey };
}

export async function optimizePrompt(options: OptimizeOptions, ctx?: AiContext): Promise<ImagePromptResponse & { provider: AIProvider }> {
  const providerKey = getProvider(ctx);
  const impl = providers[providerKey];
  const result = await withRetry(() => impl.optimize(options, ctx));
  return { ...result, provider: providerKey };
}

export async function imageToPrompt(options: ImageToPromptOptions, ctx?: AiContext): Promise<ImagePromptResponse & { provider: AIProvider }> {
  const providerKey = getProvider(ctx);
  const impl = providers[providerKey];
  const result = await withRetry(() => impl.imageToPrompt(options, ctx));
  return { ...result, provider: providerKey };
}

export async function expandTextPrompt(options: ExpandOptions, ctx?: AiContext): Promise<{ prompt: string; provider: AIProvider }> {
  const providerKey = getProvider(ctx);
  const impl = providers[providerKey];
  const prompt = await withRetry(() => impl.expand(options, ctx));
  return { prompt, provider: providerKey };
}
