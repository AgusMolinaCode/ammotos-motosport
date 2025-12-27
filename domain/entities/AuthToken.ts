/**
 * DOMAIN ENTITY: Representa un token de autenticación
 * 
 * Esta entidad es pura - no sabe de OAuth2, Turn14, ni HTTP.
 * Solo define QUÉ es un token y sus reglas de negocio.
 */
export class AuthToken {
  constructor(
    public readonly value: string,
    public readonly expiresAt: Date,
    public readonly type: string = 'Bearer'
  ) {
    if (!value || value.trim().length === 0) {
      throw new Error('Token value cannot be empty');
    }
    
    if (expiresAt <= new Date()) {
      throw new Error('Token expiration date must be in the future');
    }
  }

  /**
   * Verifica si el token está expirado o cerca de expirar
   * @param bufferMinutes - Minutos de anticipación para considerar "por expirar"
   */
  isExpiringSoon(bufferMinutes: number = 5): boolean {
    const now = new Date();
    const bufferMs = bufferMinutes * 60 * 1000;
    const expirationWithBuffer = new Date(this.expiresAt.getTime() - bufferMs);
    
    return now >= expirationWithBuffer;
  }

  /**
   * Verifica si el token está completamente expirado
   */
  isExpired(): boolean {
    return new Date() >= this.expiresAt;
  }

  /**
   * Header de autorización listo para usar
   */
  toAuthorizationHeader(): string {
    return `${this.type} ${this.value}`;
  }
}