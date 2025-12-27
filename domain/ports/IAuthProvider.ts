// src/domain/ports/IAuthProvider.ts

import { AuthToken } from '../entities/AuthToken';

/**
 * DOMAIN PORT: Contrato para proveedores de autenticación
 * 
 * Define QUÉ necesitamos de un proveedor de auth, pero NO CÓMO lo hace.
 * Cualquier implementación (OAuth2, API Key, JWT) debe cumplir este contrato.
 */
export interface IAuthProvider {
  /**
   * Obtiene un token válido (genera nuevo si es necesario)
   */
  getValidToken(): Promise<AuthToken>;
  
  /**
   * Fuerza la generación de un nuevo token
   */
  refreshToken(): Promise<AuthToken>;
}
