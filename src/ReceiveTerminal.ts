import { IMessage } from './IMessage';

export interface IReceiveTerminalOptions<TParams extends any[], TReturns extends any = void> {
  channel: ReceiveTerminal<TParams, TReturns>['channel'];
  paramsProcessor?: ReceiveTerminal<TParams, TReturns>['paramsProcessor'];
  messageProcessor?: ReceiveTerminal<TParams, TReturns>['messageProcessor'];
  messageListenerAdder: (onMessage: (message: IMessage<TParams>) => void) => void;
  messageListenerRemover: ReceiveTerminal<TParams, TReturns>['messageListenerRemover'];
}

export default class ReceiveTerminal<TParams extends any[], TReturns extends any = void> {
  private readonly channel: string;

  private readonly paramsProcessor?: (...params: TParams) => TReturns;

  private readonly messageProcessor?: (message: IMessage<TParams>) => TReturns;

  private readonly messageListenerRemover: (
    onMessage: (message: IMessage<TParams>) => void,
  ) => void;

  public constructor(options: IReceiveTerminalOptions<TParams, TReturns>) {
    this.channel = options.channel;
    this.paramsProcessor = options.paramsProcessor;
    this.messageProcessor = options.messageProcessor;
    this.messageListenerRemover = options.messageListenerRemover;
    options.messageListenerAdder(this.onMessage);
  }

  private onMessage = (message: IMessage<TParams>): void => {
    if (typeof message?.id !== 'number' || message?.type !== 'asyncify-events' || message?.channel !== this.channel) {
      return;
    }
    if (this.paramsProcessor) {
      this.paramsProcessor(...message.params);
    }
    if (this.messageProcessor) {
      this.messageProcessor(message);
    }
  };

  public terminate = () => {
    this.messageListenerRemover(this.onMessage);
  };
}
