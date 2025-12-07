import { readFileSync } from 'fs';
import { join } from 'path';

import { makeExecutableSchema } from '@graphql-tools/schema';

import { resolvers } from '../presentation/graphql/resolvers';

const schemaDir = join(__dirname, '../presentation/graphql/schema');

const commonTypeDefs = readFileSync(join(schemaDir, 'common.graphql'), 'utf-8');
const cardTypeDefs = readFileSync(join(schemaDir, 'card.graphql'), 'utf-8');
const cardDetailTypeDefs = readFileSync(
  join(schemaDir, 'cardDetail.graphql'),
  'utf-8'
);
const accessoryTypeDefs = readFileSync(
  join(schemaDir, 'accessory.graphql'),
  'utf-8'
);
const songTypeDefs = readFileSync(join(schemaDir, 'song.graphql'), 'utf-8');
const queryTypeDefs = readFileSync(join(schemaDir, 'query.graphql'), 'utf-8');

const typeDefs = [
  commonTypeDefs,
  cardTypeDefs,
  cardDetailTypeDefs,
  accessoryTypeDefs,
  songTypeDefs,
  queryTypeDefs,
];

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
