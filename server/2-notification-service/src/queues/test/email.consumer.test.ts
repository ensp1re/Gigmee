import * as connection from '@notifications/queues/connection';
import amqp from 'amqplib';
import { consumeAuthEmailMessages, consumeOrderEmailMessages } from '@notifications/queues/email.consumer';

jest.mock('@notifications/queues/connection');
jest.mock('amqplib');

describe('Email Consumer', () => {
  let channel: amqp.Channel;

  beforeEach(() => {
    jest.resetAllMocks();
    channel = {
      assertExchange: jest.fn(),
      publish: jest.fn(),
      assertQueue: jest.fn().mockReturnValue({ queue: '', messageCount: 0, consumerCount: 0}),
      bindQueue: jest.fn(),
      consume: jest.fn(),
    } as unknown as amqp.Channel;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('consumeAuthEmailMessages method', () => {
    it('should be called', async () => {
      (channel.assertQueue as jest.Mock).mockReturnValue({ queue: 'auth-email-queue', messageCount: 0, consumerCount: 0 });
      (connection.createConnection as jest.Mock).mockResolvedValue(channel as unknown as amqp.Channel);

      const connectionChannel: amqp.Channel | undefined = await connection.createConnection();
      await consumeAuthEmailMessages(connectionChannel!);

      expect(connectionChannel!.assertExchange).toHaveBeenCalledWith('gigme-email-notification', 'direct');
      expect(connectionChannel!.assertQueue).toHaveBeenCalledTimes(1);
      expect(connectionChannel!.consume).toHaveBeenCalledTimes(1);
      expect(connectionChannel!.bindQueue).toHaveBeenCalledWith('auth-email-queue', 'gigme-email-notification', 'auth-email');
    });
  });

  describe('consumeOrderEmailMessages method', () => {
    it('should be called', async () => {
      (channel.assertQueue as jest.Mock).mockReturnValue({ queue: 'order-email-queue', messageCount: 0, consumerCount: 0 });
      (connection.createConnection as jest.Mock).mockResolvedValue(channel as unknown as amqp.Channel);

      const connectionChannel: amqp.Channel | undefined = await connection.createConnection();
      await consumeOrderEmailMessages(connectionChannel!);

      expect(connectionChannel!.assertExchange).toHaveBeenCalledWith('gigme-order-notification', 'direct');
      expect(connectionChannel!.assertQueue).toHaveBeenCalledTimes(1);
      expect(connectionChannel!.consume).toHaveBeenCalledTimes(1);
      expect(connectionChannel!.bindQueue).toHaveBeenCalledWith('order-email-queue', 'gigme-order-notification', 'order-email');
    });
  });
});
