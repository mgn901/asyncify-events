import {
  afterAll, describe, expect, test,
} from '@jest/globals';
import { MessageChannel } from 'worker_threads';
import ClientTerminal, { IClientTerminalOptions } from './ClientTerminal';
import ServerTerminal, { IServerTerminalOptions } from './ServerTerminal';

describe('asyncifyEvents', () => {
  type ICTO = IClientTerminalOptions<[number, number], number>;
  type ISTO = IServerTerminalOptions<[number, number], number>;
  const messageChannel = new MessageChannel();
  const clientMessagePort = messageChannel.port1;
  const serverMessagePort = messageChannel.port2;
  const replyListenerAdder:ICTO['messageListenerAdder'] = (onReply) => {
    clientMessagePort.on('message', (message) => {
      onReply(message);
    });
  };
  const sendRequestFunction: ICTO['sendMessageFunction'] = (message) => {
    clientMessagePort.postMessage(message);
  };
  const requestListenerAdder: ISTO['messageListenerAdder'] = (onRequest) => {
    serverMessagePort.on('message', (message) => {
      onRequest(message);
    });
  };
  const sendReplyFunction: ISTO['sendMessageFunction'] = (message) => {
    serverMessagePort.postMessage(message);
  };
  const paramsProcessor: ISTO['paramsProcessor'] = (a: number, b: number) => a + b;

  test('ClientTerminal and ServerTerminal', async () => {
    const { request, terminate: terminateClient } = new ClientTerminal<[number, number], number>({
      channel: 'test0',
      messageListenerAdder: replyListenerAdder,
      messageListenerRemover: () => {},
      sendMessageFunction: sendRequestFunction,
    });

    const { terminate: terminateServer } = new ServerTerminal<[number, number], number>({
      channel: 'test0',
      paramsProcessor,
      messageListenerAdder: requestListenerAdder,
      messageListenerRemover: () => {},
      sendMessageFunction: sendReplyFunction,
    });
    const result = await request(1, 2);
    expect(result).toBe(3);
    terminateClient();
    terminateServer();
  });

  afterAll(() => {
    messageChannel.port1.close();
    messageChannel.port2.close();
  });
});
