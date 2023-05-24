import ClientTerminalTerminated from './ClientTerminalTerminated';
import { IMessage } from './IMessage';
import ReceiveTerminal, { IReceiveTerminalOptions } from './ReceiveTerminal';
import SendTerminal, { ISendTerminalOptions } from './SendTerminal';
import generateID from './generateID';

interface TTask<T, U> {
  body: T;
  resolve: (value: U | PromiseLike<U>) => void;
  reject: (reason?: any) => void;
}

export type IClientTerminalOptions<
  TParams extends any[], TReturns extends any,
> = Pick<
ISendTerminalOptions<TParams> & IReceiveTerminalOptions<[TReturns]>,
'channel' | 'messageListenerAdder' | 'messageListenerRemover' | 'sendMessageFunction'
>;

export default class ClientTerminal<TParams extends any[], TReturns extends any> {
  private readonly channel: string;

  private readonly sendTerminal: SendTerminal<TParams>;

  private readonly receiveTerminal: ReceiveTerminal<[TReturns]>;

  private readonly tasks: TTask<IMessage<TParams>, TReturns>[];

  public constructor(options: IClientTerminalOptions<TParams, TReturns>) {
    this.channel = options.channel;
    this.sendTerminal = new SendTerminal<TParams>(options);
    this.receiveTerminal = new ReceiveTerminal<[TReturns]>({
      channel: options.channel,
      messageListenerAdder: options.messageListenerAdder,
      messageListenerRemover: options.messageListenerRemover,
      messageProcessor: this.messageProcessor,
    });
    this.tasks = [];
  }

  public request = (...params: TParams) => new Promise<TReturns>((resolve, reject) => {
    const message: IMessage<TParams> = {
      id: generateID(),
      channel: this.channel,
      type: 'asyncify-events',
      params,
    };
    const task = { body: message, resolve, reject };
    this.tasks.push(task);
    this.sendTerminal.sendMessage(message);
  });

  private messageProcessor = (message: IMessage<[TReturns]>): void => {
    const predicate = (task: TTask<IMessage<TParams>, TReturns>) => task.body.id === message.id;
    const task = this.tasks.find(predicate);
    const taskIdx = this.tasks.findIndex(predicate);
    task?.resolve(...message.params);
    if (taskIdx !== -1) {
      this.tasks.splice(taskIdx, 1);
    }
  };

  public terminate = (): void => {
    this.receiveTerminal.terminate();
    this.tasks.forEach((task) => {
      const exception = new ClientTerminalTerminated();
      task.reject(exception);
    });
  };
}
