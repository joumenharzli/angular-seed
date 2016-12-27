import * as Source from '../app/app.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { HttpModule } from '@angular/http';

describe('Component : AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.provideStore({}), 
        HttpModule
      ],
      declarations: [
        Source.AppComponent
      ],
    });
    TestBed.compileComponents();
  });

  it('should render title in a h1 tag', (() => {
    let fixture = TestBed.createComponent(Source.AppComponent);
    fixture.detectChanges();
    let compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Hello Angular');
  }));
});
