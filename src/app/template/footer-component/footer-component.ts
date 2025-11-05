import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer-component',
  standalone: false,
  templateUrl: './footer-component.html',
  styleUrl: './footer-component.css'
})
export class FooterComponent {
  constructor(private router: Router) {}

  navegarSobreNosotros() {
    this.router.navigate(['/sobre-nosotros']);
  }

  ngAfterViewInit() {
    const btn = document.getElementById('escribenosBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        window.open('https://w.app/c2laje', '_blank');
      });
    }
  }
}
