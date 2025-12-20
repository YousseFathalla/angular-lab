import { Directive, OnDestroy, input, model, numberAttribute } from '@angular/core';

@Directive({
  selector: '[NgDebounce]',
  host: {
    '(input)': 'handleInput($event)',
  },
})

export class NgDebounce implements OnDestroy {
  private debounceTimer?: ReturnType<typeof setTimeout>;

  readonly NgDebounce = input(0, { transform: numberAttribute });
  readonly debounceValue = model<string>();

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    clearTimeout(this.debounceTimer);

    if (!value || !this.NgDebounce()) {
      this.debounceValue.set(value);
    } else {
      this.debounceTimer = setTimeout(
        () => this.debounceValue.set(value),
        this.NgDebounce()
      );
    }
  }
  ngOnDestroy() {
    clearTimeout(this.debounceTimer);
  }
}


