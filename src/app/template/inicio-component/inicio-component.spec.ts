import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { InicioComponent } from './inicio-component';
import { FincaService } from '../../core/services/finca.service';

describe('InicioComponent', () => {
  let component: InicioComponent;
  let fixture: ComponentFixture<InicioComponent>;
  let mockFincaService: jasmine.SpyObj<FincaService>;

  beforeEach(async () => {
    mockFincaService = jasmine.createSpyObj('FincaService', ['getFincasConImagenes', 'getFincas']);
    mockFincaService.getFincasConImagenes.and.returnValue(of([]));
    mockFincaService.getFincas.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [InicioComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FincaService, useValue: mockFincaService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
