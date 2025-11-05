# Groq & OpenRouter LLM Providers Extraction

This folder contains minimal, ready-to-integrate TypeScript classes for using Groq and OpenRouter as LLM providers in your own Node.js/TypeScript app.

## Files
- `base-provider.ts`: Abstract base class for providers
- `types.ts`: Model info type
- `model-types.ts`: Provider settings and info types
- `groq-provider.ts`: Groq provider implementation
- `openrouter-provider.ts`: OpenRouter provider implementation

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

const groqModel = groq.getModelInstance({
  model: 'llama3-70b-8192',
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
4. Use the provider classes to instantiate and use models as shown above.
5. (Optional) Adapt the types and base class to fit your app’s LLM abstraction if needed.

## Notes
- You can extend the base class to add more providers in the future.
- For dynamic model listing, see the `getDynamicModels` method in the original codebase.
- If you use a different LLM interface, adapt the `getModelInstance` return type accordingly.
