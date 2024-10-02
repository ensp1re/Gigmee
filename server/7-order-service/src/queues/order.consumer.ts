import { Channel, ConsumeMessage, Replies } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '@order/queues/connection';
import { config } from '@order/config';
import { winstonLogger } from '@ensp1re/gigme-shared';
import { updateOrderReview } from '@order/services/order.service';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'orderServiceConsumer', 'debug');

export const consumerReviewFanoutMessages = async (channel: Channel | null = null): Promise<void> => {
  try {
    if (!channel) {
      log.debug('Channel is undefined, creating a new connection...');
      channel = (await createConnection()) as Channel;
      if (!channel) {
        throw new Error('Failed to create a channel');
      }
    }

    const exchangeName = 'gigme-review';
    const queueName = 'order-review-queue';

    log.debug(`Asserting exchange: ${exchangeName}`);
    await channel.assertExchange(exchangeName, 'fanout');

    log.debug(`Asserting queue: ${queueName}`);
    const gigmeQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });

    log.debug(`Binding queue: ${gigmeQueue.queue} to exchange: ${exchangeName}`);
    await channel.bindQueue(gigmeQueue.queue, exchangeName, '');

    log.debug(`Starting to consume messages from queue: ${gigmeQueue.queue}`);
    channel.consume(gigmeQueue.queue, async (msg: ConsumeMessage | null) => {
      if (msg) {
        await updateOrderReview(JSON.parse(msg.content.toString()));
        channel?.ack(msg);
        log.debug(`Message acknowledged: ${msg.content.toString()}`);
      }
    });
  } catch (error) {
    log.error('OrderService consumer consumerReviewFanoutMessages() method:', error);
  }
};
