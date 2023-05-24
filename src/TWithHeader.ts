export type TWithHeader<T extends Record<any, any>> = T & { id: number, type: 'asyncify-events', channel: string };
