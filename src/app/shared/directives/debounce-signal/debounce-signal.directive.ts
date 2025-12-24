import { Directive, OnDestroy, input, model, numberAttribute } from '@angular/core';
/**
 *  TODO:
 *  - rename to debounceSignal
 *  - check of we rename the model to be value
 *  - check if we can write this better
 */
@Directive({
  selector: '[debounceSignal]',
  host: {
    '(input)': 'handleInput($event)',
  },
})
export class DebounceSignalDirective implements OnDestroy {
  private debounceTimer!: ReturnType<typeof setTimeout>;
  readonly debounceSignal = input(0, { transform: numberAttribute });
  readonly value = model<string>();

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    clearTimeout(this.debounceTimer);

    if (!value || !this.debounceSignal()) {
      this.value.set(value);
    } else {
      this.debounceTimer = setTimeout(() => {
        this.value.set(value);
      }, this.debounceSignal());
    }
  }
  ngOnDestroy() {
    clearTimeout(this.debounceTimer);
  }
}
