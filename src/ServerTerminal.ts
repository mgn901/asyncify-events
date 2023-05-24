import { IMessage } from './IMessage';
import ReceiveTerminal, { IReceiveTerminalOptions } from './ReceiveTerminal';
import SendTerminal, { ISendTerminalOptions } from './SendTerminal';

export type IServerTerminalOptions<
  TParams extends any[], TReturns extends any,
> = Pick<
ISendTerminalOptions<[TReturns]> & IReceiveTerminalOptions<TParams, TReturns>,
'channel' | 'messageListenerAdder' | 'messageListenerRemover' | 'paramsProcessor' | 'sendMessageFunction'
>;

export default class ServerTerminal<TParams extends any[], TReturns extends any> {
  private readonly sendTerminal: SendTerminal<[TReturns]>;

  private readonly receiveTerminal: ReceiveTerminal<TParams>;

  private readonly paramsProcessor?: (...params: TParams) => TReturns;

  public constructor(options: IServerTerminalOptions<TParams, TReturns>) {
    this.sendTerminal = new SendTerminal({
      channel: options.channel,
      sendMessageFunction: options.sendMessageFunction,
    });
    this.receiveTerminal = new ReceiveTerminal<TParams>({
      channel: options.channel,
      messageListenerAdder: options.messageListenerAdder,
      messageListenerRemover: options.messageListenerRemover,
      messageProcessor: this.messageProcessor,
    });
    this.paramsProcessor = options.paramsProcessor;
  }

  private messageProcessor = async (message: IMessage<TParams>): Promise<void> => {
    if (!this.paramsProcessor) {
      return;
    }
    const returns = await this.paramsProcessor(...message.params);
    this.sendTerminal.sendMessage({
      id: message.id,
      channel: message.channel,
      type: message.type,
      params: [returns],
    });
  };

  public terminate = () => {
    this.receiveTerminal.terminate();
  };
}
