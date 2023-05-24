export interface IMessage<TParams extends any[]> {
  id: number;
  channel: string;
  type: 'asyncify-events';
  params: TParams;
}
