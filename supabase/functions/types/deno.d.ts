declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export type Handler = (request: DenoRequest) => Response | Promise<Response>;
  export function serve(handler: Handler): void;

  export interface DenoRequest extends Omit<Request, 'headers' | 'formData'> {
    method: string;
    url: string;
    headers: DenoHeaders;
    formData(): Promise<DenoFormData>;
    json(): Promise<any>;
    cache: RequestCache;
    credentials: RequestCredentials;
    destination: RequestDestination;
    integrity: string;
    keepalive: boolean;
    mode: RequestMode;
    redirect: RequestRedirect;
    referrer: string;
    referrerPolicy: ReferrerPolicy;
    signal: AbortSignal;
  }

  export interface DenoHeaders extends Headers {
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;
    forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void;
    getSetCookie(): string[];
  }

  export interface DenoFormData {
    append(name: string, value: string | Blob, fileName?: string): void;
    delete(name: string): void;
    get(name: string): DenoFile | string | null;
    getAll(name: string): Array<DenoFile | string>;
    has(name: string): boolean;
    set(name: string, value: string | Blob, fileName?: string): void;
    forEach(callbackfn: (value: DenoFile | string, key: string, parent: FormData) => void, thisArg?: any): void;
    entries(): IterableIterator<[string, DenoFile | string]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<DenoFile | string>;
  }

  export interface Response {
    status: number;
    headers: DenoHeaders;
  }

  export interface DenoFile extends File {
    readonly lastModified: number;
    readonly webkitRelativePath: string;
    arrayBuffer(): Promise<ArrayBuffer>;
    slice(start?: number, end?: number, contentType?: string): Blob;
    stream(): ReadableStream;
    text(): Promise<string>;
  }
} 