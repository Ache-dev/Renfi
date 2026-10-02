import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { FincasRelevantesComponent } from './fincas-relevantes-component';
import { FincaService } from '../../core/services/finca.service';

describe('FincasRelevantesComponent', () => {
  let component: FincasRelevantesComponent;
  let fixture: ComponentFixture<FincasRelevantesComponent>;
  let mockFincaService: jasmine.SpyObj<FincaService>;

  beforeEach(async () => {
    mockFincaService = jasmine.createSpyObj('FincaService', ['getFincasConImagenes']);
    mockFincaService.getFincasConImagenes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [FincasRelevantesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FincaService, useValue: mockFincaService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FincasRelevantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
