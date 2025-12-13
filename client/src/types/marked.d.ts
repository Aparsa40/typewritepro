declare module 'marked' {
  export const marked: {
    parse(input: string, options?: any): string;
    setOptions(opts: any): void;
    lexer?: any;
    slugger?: any;
  };
  export class Slugger {
    constructor();
    slug(value: string): string;
  }
  export function parse(input: string, options?: any): string;
  export function setOptions(opts: any): void;
}
