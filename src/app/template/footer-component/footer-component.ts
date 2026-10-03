import { Component } from '@angular/core';

@Component({
  selector: 'app-footer-component',
  standalone: false,
  templateUrl: './footer-component.html',
  styleUrl: './footer-component.css'
})
export class FooterComponent {
  readonly anio = new Date().getFullYear();
}
