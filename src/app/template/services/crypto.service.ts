import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  
  async hashSHA512(text: string): Promise<string> {

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const hashBuffer = await crypto.subtle.digest('SHA-512', data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }

  
  async verifySHA512(text: string, hash: string): Promise<boolean> {
    const textHash = await this.hashSHA512(text);
    return textHash === hash.toLowerCase();
  }
}
