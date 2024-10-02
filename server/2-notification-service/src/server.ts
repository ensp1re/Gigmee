import http from 'http';

import { Application } from 'express';
import { winstonLogger } from '@ensp1re/gigme-shared';
import 'express-async-errors';
import { Logger } from 'winston';
import { config } from '@notifications/config';
import { healthRouter } from '@notifications/routes';
import { checkConnection } from '@notifications/elasticsearch';
import { Channel } from 'amqplib';
import {createConnection} from '@notifications/queues/connection';
import { consumeAuthEmailMessages, consumeOrderEmailMessages } from '@notifications/queues/email.consumer';

const SERVER_PORT = 4001;

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug');


export function start(app: Application): void {
    startServer(app);
    app.use('', healthRouter());
    startQueues();
    startElasticSearch();
}

async function startQueues(): Promise<void> {
    const emailChannel: Channel = await createConnection() as Channel;
    await consumeAuthEmailMessages(emailChannel);
    await consumeOrderEmailMessages(emailChannel);


    // const verificationLink = `${config.CLIENT_URL}/config_email?v_token=`;
    // const messageDetails: IEmailMessageDetails = {
    //     receiverEmail: `${config.SENDER_EMAIL}`,
    //     verifyLink: verificationLink,
    //     template: 'verifyEmail',
    // };
    // await emailChannel.assertExchange('gigme-email-notification', 'direct');
    // const message1 = JSON.stringify(messageDetails);
    // emailChannel.publish('gigme-email-notification', 'auth-email', Buffer.from(message1));

    // await emailChannel.assertExchange('gigme-order-notification', 'direct');
    // const message2 = JSON.stringify({name: 'gigme', server: 'order'});
    // emailChannel.publish('gigme-order-notification', 'auth-order', Buffer.from(message2));
}

function startElasticSearch() : void {
    checkConnection();
}

function startServer(app: Application): void {
    try {
        const httpServer: http.Server = new http.Server(app);
        log.info(`worker with process id of ${process.pid} on NotificationServer sever has started`);
        httpServer.listen(SERVER_PORT, () => {
            log.info(`NotificationServer is running on port ${SERVER_PORT}`);
        });
    } catch (error) {
        log.log('error', 'NotificationService startServer() method:', error);
    }
}