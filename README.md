# asyncify-events

A TypeScript library to make function call through message as async function.

WIP: Working on publish this library on npm.

## Example

### In the main thread

````typescript
import { ClientTerminal } from '@mgn901/asyncify-events';

const worker = new Worker('/path/to/worker.js');

// Asyncifies calling `sum` function in the worker thread.
const { request: sum, terminate } = new ClientTerminal<number[], number>({
  channel: 'sum',
  // ClientTerminal has an internal listener to respond to message events.
  // In the initialization, ClientTerminal passes the following function the listener so that ClientTerminal can respond to message events.
  messageListenerAdder: (onMessage) => { worker.addEventListener('message', onMessage) },
  messageListenerRemover: (onMessage) => { worker.removeEventListener('message', onMessage) },
  // Pass a function to send messages to the worker thread.
  sendMessageFunction: worker.postMessage,
});

(async () => {
  const result = await sum(1, 2);
  console.log(result); // => 3
})();
````

### In the worker thread

````typescript
import { ServerTerminal } from '@mgn901/asyncify-events';

const globalScope = self as DedicatedWorkerGlobalScope;

const sum = (...numbers: number[]): number => numbers.reduce((prev, next) => prev + next);

// Enables to call `sum` function from the main thread.
// Pass the `sum` function to `paramsProcessor` property so that ServerTerminal can execute the function when receiving messages.
const { terminate } = new ServerTerminal<number[], number>({
  channel: 'sum',
  paramsProcessor: sum,
  messageListenerAdder: (onMessage) => { globalScope.addEventLister('message', onMessage) },
  messageListenerRemover: (onMessage) => { globalScope.removeEventListener('message', onMessage) },
  sendMessageFunction: globalScope.postMessage,
});
````

## How it works?

See [JavaScriptのメッセージングをカプセル化する - mgn901 / めがね901](https://scrapbox.io/mgn901/JavaScriptのメッセージングをカプセル化する) (Japanese only at present)

## Author

[mgn901 / めがね901](https://scrapbox.io/mgn901/)
