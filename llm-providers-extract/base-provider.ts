import type { LanguageModelV1 } from 'ai';
import type { ProviderInfo, ModelInfo } from './types';
import type { IProviderSetting } from './model-types';

export abstract class BaseProvider implements ProviderInfo {
  abstract name: string;
  abstract staticModels: ModelInfo[];
  abstract config: any;
  cachedDynamicModels?: {
    cacheId: string;
    models: ModelInfo[];
  };

  getApiKeyLink?: string;
  labelForGetApiKey?: string;
  icon?: string;

  getProviderBaseUrlAndKey(options: {
    apiKeys?: Record<string, string>;
    providerSettings?: IProviderSetting;
    serverEnv?: Record<string, string>;
    defaultBaseUrlKey: string;
    defaultApiTokenKey: string;
  }) {
    const { apiKeys, providerSettings, serverEnv, defaultBaseUrlKey, defaultApiTokenKey } = options;
    let apiKey = '';
    let baseUrl = '';
    if (providerSettings && providerSettings.baseUrl) baseUrl = providerSettings.baseUrl;
    if (serverEnv && defaultBaseUrlKey && serverEnv[defaultBaseUrlKey]) baseUrl = serverEnv[defaultBaseUrlKey];
    if (apiKeys && defaultApiTokenKey && apiKeys[defaultApiTokenKey]) apiKey = apiKeys[defaultApiTokenKey];
    if (serverEnv && defaultApiTokenKey && serverEnv[defaultApiTokenKey]) apiKey = serverEnv[defaultApiTokenKey];
    return { baseUrl, apiKey };
  }
}
