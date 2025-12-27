// scripts/test-auth.ts

import { authService } from '../infrastructure/providers/AuthProviderFactory';

async function testAuth() {
  try {
    // Obtener token
    const token = await authService.getToken();
    console.log('Token expira:', token.expiresAt.toLocaleString());
    
    // Obtener header de autorización
    const header = await authService.getAuthorizationHeader();
    console.log('Authorization:', header.substring(0, 30) + '...');
    
    // Probar con API real
    const testResponse = await fetch('https://api.turn14.com/v1/brands', {
      headers: { 'Authorization': header }
    });
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log(`API OK - ${data.data.length} marcas`);
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAuth();
