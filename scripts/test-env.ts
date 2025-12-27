// scripts/test-env.ts
import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar .env.local
const result = config({ path: resolve(process.cwd(), '.env.local') });

console.log('\n🔍 Debug de variables de entorno:\n');

if (result.error) {
  console.error('❌ Error cargando .env.local:', result.error);
} else {
  console.log('✅ .env.local cargado correctamente');
}

console.log('\n📋 Variables encontradas:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Presente' : '❌ Faltante');
console.log('TURN14_CLIENT_ID:', process.env.TURN14_CLIENT_ID ? `✅ ${process.env.TURN14_CLIENT_ID.substring(0, 10)}...` : '❌ Faltante');
console.log('TURN14_CLIENT_SECRET:', process.env.TURN14_CLIENT_SECRET ? `✅ ${process.env.TURN14_CLIENT_SECRET.substring(0, 10)}...` : '❌ Faltante');
console.log('TURN14_API_URL:', process.env.TURN14_API_URL || '❌ Faltante');
console.log('');