declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

interface RequestWithMethod extends Request {
  method: string;
} 