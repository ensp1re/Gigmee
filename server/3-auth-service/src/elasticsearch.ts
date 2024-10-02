import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@auth/config';
import { ISellerGig, winstonLogger } from '@ensp1re/gigme-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authElasticSearchServer', 'debug');

const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}` || 'http://localhost:9200',
});

async function checkConnection(): Promise<void> {
  let isConnected = false;
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      log.info(`AuthService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Connection to Elasticsearch failed. Retrying...');
      log.log('error', 'AuthService checkConnection() method:', error);
    }
  }
}

// create index for ElasticSearch & Kibana to search a logs
async function existIndex(indexName: string): Promise<boolean> {
  const result: boolean = await elasticSearchClient.indices.exists({index: indexName});
  return result;
}

async function createIndex(indexName: string): Promise<void> {
  try {
    const result: boolean = await existIndex(indexName);
    if (result) {
      log.info(`Index ${indexName} already exist`);
    } else {
      await elasticSearchClient.indices.create({index: indexName});
      await elasticSearchClient.indices.refresh({index: indexName});
      log.info(`Created index ${indexName}`);
    }
  } catch (error) {
    log.error('An error occured while creating the index...');
    log.log('error', 'AuthService createIndex() method:', error);
  }
}

async function getGigById(index: string, indexId: string): Promise<ISellerGig> {
  try {
    const result: GetResponse = await elasticSearchClient.get({
      index,
      id: indexId
    });
    return result._source as ISellerGig;
  } catch (error) {
    log.error('An error occured while getting the index...');
    log.log('error', 'AuthService getGigById() method:', error);
    return {} as ISellerGig;
  }
}

export {elasticSearchClient, checkConnection, createIndex, getGigById};