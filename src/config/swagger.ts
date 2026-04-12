import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Link Like Essentials API',
      version: '1.0.0',
      description:
        'Link! Like! ラブライブ! カードデータを提供する REST API。\n\nGraphQL API は `/graphql` (Apollo Sandbox) でも利用可能です。',
    },
    servers: [
      {
        url: '/api',
        description: 'REST API',
      },
    ],
    components: {
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'NOT_FOUND' },
                message: {
                  type: 'string',
                  example: 'リソースが見つかりません',
                },
              },
              required: ['code', 'message'],
            },
          },
        },
        PageInfo: {
          type: 'object',
          properties: {
            hasNextPage: { type: 'boolean' },
            hasPreviousPage: { type: 'boolean' },
            startCursor: { type: 'string', nullable: true },
            endCursor: { type: 'string', nullable: true },
          },
          required: ['hasNextPage', 'hasPreviousPage'],
        },
        Card: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            cardName: { type: 'string' },
            characterName: { type: 'string' },
            rarity: {
              type: 'string',
              enum: ['UR', 'SR', 'R', 'DR', 'BR', 'LR'],
              nullable: true,
            },
            limited: { type: 'string', nullable: true },
            styleType: {
              type: 'string',
              enum: ['CHEERLEADER', 'TRICKSTER', 'PERFORMER', 'MOODMAKER'],
              nullable: true,
            },
            cardUrl: { type: 'string', nullable: true },
            releaseDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CardConnection: {
          type: 'object',
          properties: {
            edges: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  node: { $ref: '#/components/schemas/Card' },
                  cursor: { type: 'string' },
                },
              },
            },
            pageInfo: { $ref: '#/components/schemas/PageInfo' },
            totalCount: { type: 'integer' },
          },
        },
        Song: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            songName: { type: 'string' },
            category: { type: 'string', nullable: true },
            attribute: { type: 'string', nullable: true },
            centerCharacter: { type: 'string', nullable: true },
            releaseDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LiveGrandPrix: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            eventName: { type: 'string' },
            yearTerm: { type: 'string', nullable: true },
            startDate: { type: 'string', format: 'date-time', nullable: true },
            endDate: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        GradeChallenge: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            termName: { type: 'string', nullable: true },
            startDate: { type: 'string', format: 'date-time', nullable: true },
            endDate: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        EffectKeywordGroup: {
          type: 'object',
          properties: {
            groupName: { type: 'string' },
            keywords: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        TraitAnalysisBatchRequest: {
          type: 'object',
          required: ['cardIds'],
          properties: {
            cardIds: {
              type: 'array',
              items: { type: 'integer' },
              description: 'カードIDの配列',
            },
          },
        },
        TraitAnalysisBatchResponse: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  cardId: { type: 'integer' },
                  heartCollectAnalysis: {
                    type: 'object',
                    nullable: true,
                    description: 'ハートコレクト分析データ',
                  },
                  unDrawAnalysis: {
                    type: 'object',
                    nullable: true,
                    description: 'アンドロー分析データ',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/presentation/rest/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
