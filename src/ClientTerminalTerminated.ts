export default class ClientTerminalTerminated extends Error {
  public readonly name: string;

  public constructor(message?: string) {
    super(message);
    this.name = 'ClientTerminalTerminated';
  }
}
