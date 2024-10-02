import { config } from '@gig/config';
import { winstonLogger } from '@ensp1re/gigme-shared';
import { Channel, ConsumeMessage, Replies } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '@gig/queues/connection';
import { seedData, updateGigReview } from '@gig/services/gig.service';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigServiceConsumer', 'debug');

const consumeGigDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'gigme-update-gig';
    const routingKey = 'update-gig';
    const queueName = 'gig-update-queue';
    await channel.assertExchange(exchangeName, 'direct');
    const gigmeQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(gigmeQueue.queue, exchangeName, routingKey);
    channel.consume(gigmeQueue.queue, async (msg: ConsumeMessage | null) => {
      const { gigReview } = JSON.parse(msg!.content.toString());
      await updateGigReview(JSON.parse(gigReview));
      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'GigService GigConsumer consumeGigDirectMessage() method error:', error);
  }
};

const consumeSeedDirectMessages = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
      if (!channel) {
        throw new Error('Failed to create a connection for the channel.');
      }
    }

    const exchangeName = 'gigme-seed-gig';
    const routingKey = 'receive-sellers';
    const queueName = 'seed-gig-queue';

    await channel.assertExchange(exchangeName, 'direct');
    const gigmeQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(gigmeQueue.queue, exchangeName, routingKey);

    channel.consume(gigmeQueue.queue, async (msg: ConsumeMessage | null) => {
      if (msg) {
        const { sellers, count } = JSON.parse(msg.content.toString());
        await seedData(sellers, count);
        channel.ack(msg);
      }
    });
  } catch (error) {
    log.log('error', 'GigService GigConsumer consumeSeedDirectMessages() method error:', error);
  }
};


export { consumeGigDirectMessage, consumeSeedDirectMessages };
