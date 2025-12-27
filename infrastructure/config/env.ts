// src/infrastructure/config/env.ts

/**
 * INFRASTRUCTURE: Validación y acceso a variables de entorno
 * 
 * Centraliza el acceso a process.env y valida que existan.
 * Si falta algo, falla rápido al iniciar la app.
 */

interface EnvironmentConfig {
  database: {
    url: string;
  };
  turn14: {
    clientId: string;
    clientSecret: string;
    apiUrl: string;
  };
  nodeEnv: string;
}

class Environment {
  private static config: EnvironmentConfig | null = null;

  static load(): EnvironmentConfig {
    if (this.config) {
      return this.config;
    }

    const missing: string[] = [];
    
    const check = (key: string): string => {
      const value = process.env[key];
      if (!value) {
        missing.push(key);
        return '';
      }
      return value;
    };

    const config: EnvironmentConfig = {
      database: {
        url: check('DATABASE_URL')
      },
      turn14: {
        clientId: check('TURN14_CLIENT_ID'),
        clientSecret: check('TURN14_CLIENT_SECRET'),
        apiUrl: check('TURN14_API_URL')
      },
      nodeEnv: process.env.NODE_ENV || 'development'
    };

    if (missing.length > 0) {
      throw new Error(
        `Missing environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}`
      );
    }

    this.config = config;
    return config;
  }
}

export const env = Environment.load();