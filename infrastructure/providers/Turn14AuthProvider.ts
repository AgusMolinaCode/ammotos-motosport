// src/infrastructure/providers/Turn14AuthProvider.ts

import { IAuthProvider } from '../../domain/ports/IAuthProvider';
import { AuthToken } from '../../domain/entities/AuthToken';
import { env } from '../config/env';

/**
 * INFRASTRUCTURE: Implementación OAuth2 para Turn14
 * 
 * Implementa IAuthProvider usando OAuth2 Client Credentials.
 * Maneja renovación automática del token.
 */
export class Turn14AuthProvider implements IAuthProvider {
  private currentToken: AuthToken | null = null;

  async getValidToken(): Promise<AuthToken> {
    if (!this.currentToken || this.currentToken.isExpiringSoon()) {
      this.currentToken = await this.generateToken();
    }
    
    return this.currentToken;
  }

  async refreshToken(): Promise<AuthToken> {
    this.currentToken = await this.generateToken();
    return this.currentToken;
  }

  private async generateToken(): Promise<AuthToken> {
    const response = await fetch(`${env.turn14.apiUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: env.turn14.clientId,
        client_secret: env.turn14.clientSecret,
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OAuth2 failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);
    
    return new AuthToken(data.access_token, expiresAt, data.token_type);
  }
}