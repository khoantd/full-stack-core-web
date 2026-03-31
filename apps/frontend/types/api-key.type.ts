export interface ApiKey {
  _id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface CreatedApiKey extends ApiKey {
  plainKey: string; // only present on creation response
}

export interface CreateApiKeyRequest {
  name: string;
  expiresAt?: string;
}
