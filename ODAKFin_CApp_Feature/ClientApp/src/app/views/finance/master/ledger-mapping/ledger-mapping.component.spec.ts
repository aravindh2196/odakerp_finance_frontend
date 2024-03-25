import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgerMappingComponent } from './ledger-mapping.component';

describe('LedgerMappingComponent', () => {
  let component: LedgerMappingComponent;
  let fixture: ComponentFixture<LedgerMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LedgerMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgerMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
