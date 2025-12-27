// src/application/services/AuthService.ts

import { IAuthProvider } from '../../domain/ports/IAuthProvider';
import { AuthToken } from '../../domain/entities/AuthToken';

/**
 * APPLICATION: Servicio de autenticación
 * 
 * Orquesta el acceso a tokens.
 * Usa IAuthProvider (no conoce detalles de OAuth2).
 */
export class AuthService {
  constructor(private readonly authProvider: IAuthProvider) {}

  /**
   * Obtiene un token válido para usar en requests
   */
  async getAuthorizationHeader(): Promise<string> {
    const token = await this.authProvider.getValidToken();
    return token.toAuthorizationHeader();
  }

  /**
   * Obtiene el token completo (útil para debugging)
   */
  async getToken(): Promise<AuthToken> {
    return this.authProvider.getValidToken();
  }

  /**
   * Fuerza renovación del token
   */
  async refreshToken(): Promise<AuthToken> {
    return this.authProvider.refreshToken();
  }
}