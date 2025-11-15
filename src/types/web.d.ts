/**
 * Web API type declarations for client-side code
 */

declare global {
  function btoa(data: string): string;
  function atob(data: string): string;

  interface CryptoKey {}

  class TextEncoder {
    constructor(encoding?: string);
    encode(input?: string): Uint8Array;
    encodeInto(input: string, output: Uint8Array): TextEncoderEncodeIntoResult;
  }

  class TextDecoder {
    constructor(label?: string, options?: TextDecoderOptions);
    decode(input?: Uint8Array, options?: TextDecodeOptions): string;
    readonly encoding: string;
    readonly fatal: boolean;
    readonly ignoreBOM: boolean;
  }

  interface TextDecoderOptions {
    fatal?: boolean;
    ignoreBOM?: boolean;
  }

  interface TextDecodeOptions {
    stream?: boolean;
  }

  interface TextEncoderEncodeIntoResult {
    read: number;
    written: number;
  }
}

export {};