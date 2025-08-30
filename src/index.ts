export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export const VERSION = '0.0.1';

export type Operation = 'add' | 'multiply';

export interface Calculator {
  operation: Operation;
  execute(a: number, b: number): number;
}
