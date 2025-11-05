import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  /**
   * Genera un hash SHA-512 de una cadena de texto
   * @param text Texto a hashear
   * @returns Promise con el hash en formato hexadecimal
   */
  async hashSHA512(text: string): Promise<string> {
    // Convertir el texto a un ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // Generar el hash usando la Web Crypto API
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    
    // Convertir el ArrayBuffer a string hexadecimal
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }

  /**
   * Verifica si un texto coincide con un hash SHA-512
   * @param text Texto en claro
   * @param hash Hash SHA-512 a comparar
   * @returns Promise con true si coinciden, false en caso contrario
   */
  async verifySHA512(text: string, hash: string): Promise<boolean> {
    const textHash = await this.hashSHA512(text);
    return textHash === hash.toLowerCase();
  }
}
