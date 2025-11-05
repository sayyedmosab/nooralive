import { BaseProvider } from './base-provider';
import type { ModelInfo } from './types';
import type { IProviderSetting } from './model-types';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default class GroqProvider extends BaseProvider {
  name = 'Groq';
  getApiKeyLink = 'https://console.groq.com/keys';
  labelForGetApiKey = 'Get Groq API Key';
  icon = 'i-ph:lightning';

  config = {
    apiTokenKey: 'GROQ_API_KEY',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'llama3-70b-8192',
      label: 'Llama 3 70B',
      provider: 'Groq',
      maxTokenAllowed: 8192,
    },
    {
      name: 'mixtral-8x7b-32768',
      label: 'Mixtral 8x7B',
      provider: 'Groq',
      maxTokenAllowed: 32768,
    },
  ];

  getModelInstance(options: {
    model: string;
    serverEnv: Record<string, string>;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSettings?.[this.name],
      serverEnv,
      defaultBaseUrlKey: '',
      defaultApiTokenKey: 'GROQ_API_KEY',
    });
    if (!apiKey) throw new Error(`Missing API key for Groq provider`);
    const openai = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey,
    });
    return openai(model);
  }
}
