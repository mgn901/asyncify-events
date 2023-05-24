import { TFunction } from './TFunction';

export type TChannelFunctionMap<R = (any | Promise<any>)> = Record<string, TFunction<any[], R>>;
