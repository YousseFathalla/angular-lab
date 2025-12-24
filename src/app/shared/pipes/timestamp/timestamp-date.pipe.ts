import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({ name: 'timestampDate' })
export class TimestampDatePipe implements PipeTransform {
  /**
   * Transforms a Firestore Timestamp object into a JavaScript Date object.
   * @param value The Firestore Timestamp or a value that might be null/undefined.
   * @returns A JavaScript Date object, or null if the input is invalid.
   */
  transform(value: unknown): Date | null {
    // Guard against null or undefined values
    if (!value) {
      return null;
    }

    // Check if the value is a valid Firestore Timestamp object by looking for the toDate method
    if (value instanceof Timestamp) {
      return value.toDate();
    }

    // Check if the value is already a Date object
    if (value instanceof Date) {
      return value;
    }

    // If it's neither a Timestamp nor a Date, log a warning in development
    console.warn(
      'TimestampDatePipe received a value that was not a Firestore Timestamp or Date:',
      value
    );
    return null;
  }
}
