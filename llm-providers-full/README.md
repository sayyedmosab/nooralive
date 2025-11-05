# Groq & OpenRouter LLM Providers – Full Experience Extraction

This folder contains full-featured TypeScript classes for using Groq and OpenRouter as LLM providers in your own Node.js/TypeScript app, including dynamic model listing and error handling.

## Files
- `base-provider.ts`: Abstract base class for providers
- `types.ts`: Model info type
- `model-types.ts`: Provider settings and info types
- `groq-provider.ts`: Groq provider implementation (with dynamic model listing)
- `openrouter-provider.ts`: OpenRouter provider implementation (with dynamic model listing)

## External Dependencies
Install these in your project:

```
npm install @ai-sdk/openai @openrouter/ai-sdk-provider
```

> Note: The `LanguageModelV1` type is imported from the `ai` package. You may need to adapt this to your own LLM interface if you do not use the same SDK.

## Environment Variables
Set your API keys as environment variables:
- `GROQ_API_KEY` for Groq
- `OPEN_ROUTER_API_KEY` for OpenRouter

## Usage Example
```ts
import GroqProvider from './groq-provider';
import OpenRouterProvider from './openrouter-provider';

const groq = new GroqProvider();
const openrouter = new OpenRouterProvider();

// List available models dynamically
const groqModels = await groq.getDynamicModels({ GROQ_API_KEY: process.env.GROQ_API_KEY! });
const openrouterModels = await openrouter.getDynamicModels({ OPEN_ROUTER_API_KEY: process.env.OPEN_ROUTER_API_KEY! });

// Instantiate a model
const groqModel = groq.getModelInstance({
  model: 'llama-3.1-8b-instant',
  serverEnv: process.env,
  apiKeys: { GROQ_API_KEY: process.env.GROQ_API_KEY! },
});

const openrouterModel = openrouter.getModelInstance({
  model: 'openai/gpt-4o',
  serverEnv: process.env,
  apiKeys: { OPEN_ROUTER_API_KEY: process.env.OPEN_ROUTER_API_KEY! },
});
```

## Integration Steps
1. Copy all files in this folder to your project.
2. Install the required npm packages.
3. Set your API keys in your environment.
4. Use the provider classes to list models and instantiate them as shown above.
5. (Optional) Adapt the types and base class to fit your app’s LLM abstraction if needed.

## Notes
- You can extend the base class to add more providers in the future.
- For UI integration, connect the `getDynamicModels` output to your model selection interface.
- If you use a different LLM interface, adapt the `getModelInstance` return type accordingly.
