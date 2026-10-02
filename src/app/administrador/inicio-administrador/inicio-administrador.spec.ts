import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { InicioAdministrador } from './inicio-administrador';
import { of } from 'rxjs';
import { AdminApiService } from '../services/admin-api.service';

describe('InicioAdministrador', () => {
  let component: InicioAdministrador;
  let fixture: ComponentFixture<InicioAdministrador>;
  let mockAdminApi: jasmine.SpyObj<AdminApiService>;

  beforeEach(async () => {
    mockAdminApi = jasmine.createSpyObj('AdminApiService', ['list']);
    mockAdminApi.list.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [InicioAdministrador],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AdminApiService, useValue: mockAdminApi }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
