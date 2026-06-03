import { MOCK_API_KEYS } from '@/lib/mockApiKeys';

export interface ValidateKeyPayload {
  valid: boolean;
  tenant?: string;
  shopLabel?: string;
  error?: string;
}

export async function postValidateMockApiKey(
  apiKey: string,
  platformSlug?: string
): Promise<
  | { ok: true; validation: ValidateKeyPayload }
  | { ok: false; userMessage: string; detail?: string }
> {
  const keyInfo = MOCK_API_KEYS[apiKey];
  
  if (!keyInfo) {
    return {
      ok: true,
      validation: { valid: false, error: 'API Key is invalid or not recognized.' }
    };
  }

  if (platformSlug && keyInfo.platform !== platformSlug) {
    return {
      ok: true,
      validation: { valid: false, error: `API Key belongs to ${keyInfo.platform}, not ${platformSlug}.` }
    };
  }

  return { 
    ok: true, 
    validation: { 
      valid: true, 
      tenant: keyInfo.tenant, 
      shopLabel: keyInfo.shopLabel 
    } 
  };
}
