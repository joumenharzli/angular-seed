import * as Source from '../app/app.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { HttpModule } from '@angular/http';
import * as _ from 'lodash';

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

  it('lodash should work', (() => {
    expect(_.slice([1, 2, 3, 4], 1, 2)).toEqual([2]);
  }));

  it('should render title in a h1 tag', (() => {
    let fixture = TestBed.createComponent(Source.AppComponent);
    fixture.detectChanges();
    let compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Hello Angular');
  }));
});
