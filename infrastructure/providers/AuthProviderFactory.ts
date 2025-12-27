// src/infrastructure/providers/AuthProviderFactory.ts

import { AuthService } from '../../application/services/AuthService';
import { Turn14AuthProvider } from './Turn14AuthProvider';

/**
 * INFRASTRUCTURE: Factory para crear instancia única de AuthService
 * 
 * Singleton para evitar múltiples tokens en memoria.
 */
class AuthProviderFactory {
  private static instance: AuthService | null = null;

  static getInstance(): AuthService {
    if (!this.instance) {
      const provider = new Turn14AuthProvider();
      this.instance = new AuthService(provider);
    }
    return this.instance;
  }
}

export const authService = AuthProviderFactory.getInstance();