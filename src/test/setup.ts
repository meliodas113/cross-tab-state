// test/setupTests.ts
class MockBroadcastChannel {
  static channels: Record<string, MockBroadcastChannel[]> = {};
  name: string;
  onmessage: ((event: { data: any }) => void) | null = null;

  constructor(name: string) {
    this.name = name;
    if (!MockBroadcastChannel.channels[name]) {
      MockBroadcastChannel.channels[name] = [];
    }
    MockBroadcastChannel.channels[name].push(this);
  }

  postMessage(message: any) {
    for (const bc of MockBroadcastChannel.channels[this.name]) {
      if (bc !== this && bc.onmessage) {
        bc.onmessage({ data: message });
      }
    }
  }

  close() {
    MockBroadcastChannel.channels[this.name] = MockBroadcastChannel.channels[
      this.name
    ].filter((bc) => bc !== this);
  }
}

(global as any).BroadcastChannel = MockBroadcastChannel;
