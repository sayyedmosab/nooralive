export interface IProviderSetting {
  enabled?: boolean;
  baseUrl?: string;
}

export type ProviderInfo = {
  staticModels: any[];
  name: string;
  getApiKeyLink?: string;
  labelForGetApiKey?: string;
  icon?: string;
};
