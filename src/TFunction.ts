export type TFunction<P extends any[] = any[], R = any | Promise<any>> = (...args: P) => R;
