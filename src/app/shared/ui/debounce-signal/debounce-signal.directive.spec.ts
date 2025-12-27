import { TestBed } from "@angular/core/testing";
import { DebounceSignalDirective } from './debounce-signal.directive';
import { describe, it, expect } from 'vitest';

describe('DebounceSignalDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DebounceSignalDirective]
    })
  })
  it('should create an instance', () => {
    const directive = TestBed.inject(DebounceSignalDirective);
    expect(directive).toBeTruthy();
  });
});
