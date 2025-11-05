import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReservaCheckoutResult, ReservaCheckoutService } from '../../template/services/reserva-checkout.service';
import { Factura } from '../../template/services/reserva.service';

@Component({
  selector: 'app-comprovante-reserva-usuario',
  standalone: false,
  templateUrl: './comprovante-reserva-usuario.html',
  styleUrl: './comprovante-reserva-usuario.css'
})
export class ComprovanteReservaUsuario implements OnInit {
  resultado: ReservaCheckoutResult | null = null;
  factura: Factura | null | undefined;
  fechaGeneracion = new Date();

  constructor(
    private readonly checkout: ReservaCheckoutService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const resultado = this.checkout.consumeResult();
    if (!resultado) {
      this.router.navigate(['/inicio']);
      return;
    }

    this.resultado = resultado;
    this.factura = resultado.factura ?? null;
  }

  irAMisReservas(): void {
    this.router.navigate(['/mi-cuenta']);
  }

  imprimir(): void {
    window.print();
  }

  formatoMoneda(valor: number | null | undefined): string {
    if (valor === undefined || valor === null) {
      return '—';
    }

    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
      valor
    );
  }

  esPagoExitoso(): boolean {
    const estado = this.resultado?.pago?.estado ?? '';
    return estado.toLowerCase() === 'pagado';
  }

}
