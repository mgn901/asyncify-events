import { IMessage } from './IMessage';
import generateID from './generateID';

export interface ISendTerminalOptions<TParams extends any[]> {
  channel: SendTerminal<TParams>['channel'];
  sendMessageFunction: SendTerminal<TParams>['sendMessageFunction'];
}

export default class SendTerminal<TParams extends any[]> {
  private readonly channel: string;

  private readonly sendMessageFunction: (message: IMessage<TParams>) => void;

  public constructor(options: ISendTerminalOptions<TParams>) {
    this.channel = options.channel;
    this.sendMessageFunction = options.sendMessageFunction;
  }

  public sendParams = (...params: TParams): IMessage<TParams> => {
    const messageWithHeader: IMessage<TParams> = {
      id: generateID(),
      channel: this.channel,
      type: 'asyncify-events',
      params,
    };
    this.sendMessageFunction(messageWithHeader);
    return messageWithHeader;
  };

  public sendMessage = (message: IMessage<TParams>): IMessage<TParams> => {
    this.sendMessageFunction(message);
    return message;
  };
}
