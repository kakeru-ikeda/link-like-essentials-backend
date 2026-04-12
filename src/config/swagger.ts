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
            characterName: {
              type: 'string',
              enum: [
                '日野下花帆',
                '村野さやか',
                '乙宗梢',
                '夕霧綴理',
                '大沢瑠璃乃',
                '藤島慈',
                '徒町小鈴',
                '百生吟子',
                '安養寺姫芽',
                '桂城泉',
                'セラス',
                '大賀美沙知',
              ],
            },
            rarity: {
              type: 'string',
              enum: ['UR', 'SR', 'R', 'DR', 'BR', 'LR'],
              nullable: true,
            },
            limited: {
              type: 'string',
              enum: [
                'PERMANENT',
                'LIMITED',
                'SPRING_LIMITED',
                'SUMMER_LIMITED',
                'AUTUMN_LIMITED',
                'WINTER_LIMITED',
                'BIRTHDAY_LIMITED',
                'LEG_LIMITED',
                'SHUFFLE_LIMITED',
                'BATTLE_LIMITED',
                'PARTY_LIMITED',
                'ACTIVITY_LIMITED',
                'BANGDREAM_LIMITED',
                'GRADUATE_LIMITED',
                'LOGIN_BONUS',
                'REWARD',
              ],
              nullable: true,
            },
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
    paths: {
      '/cards': {
        get: {
          summary: 'カード一覧取得',
          description: 'フィルター条件を指定してカードの一覧を取得します。',
          tags: ['Cards'],
          parameters: [
            {
              in: 'query',
              name: 'rarity',
              schema: {
                type: 'string',
                enum: ['UR', 'SR', 'R', 'DR', 'BR', 'LR'],
              },
              description: 'レアリティでフィルター',
            },
            {
              in: 'query',
              name: 'limited',
              schema: {
                type: 'string',
                enum: [
                  'PERMANENT',
                  'LIMITED',
                  'SPRING_LIMITED',
                  'SUMMER_LIMITED',
                  'AUTUMN_LIMITED',
                  'WINTER_LIMITED',
                  'BIRTHDAY_LIMITED',
                  'LEG_LIMITED',
                  'SHUFFLE_LIMITED',
                  'BATTLE_LIMITED',
                  'PARTY_LIMITED',
                  'ACTIVITY_LIMITED',
                  'BANGDREAM_LIMITED',
                  'GRADUATE_LIMITED',
                  'LOGIN_BONUS',
                  'REWARD',
                ],
              },
              description: '限定種別でフィルター',
            },
            {
              in: 'query',
              name: 'characterName',
              schema: {
                type: 'string',
                enum: [
                  '日野下花帆',
                  '村野さやか',
                  '乙宗梢',
                  '夕霧綴理',
                  '大沢瑠璃乃',
                  '藤島慈',
                  '徒町小鈴',
                  '百生吟子',
                  '安養寺姫芽',
                  '桂城泉',
                  'セラス',
                  '大賀美沙知',
                ],
              },
              description: 'キャラクター名でフィルター',
            },
            {
              in: 'query',
              name: 'styleType',
              schema: {
                type: 'string',
                enum: ['CHEERLEADER', 'TRICKSTER', 'PERFORMER', 'MOODMAKER'],
              },
              description: 'スタイルタイプでフィルター',
            },
            {
              in: 'query',
              name: 'cardName',
              schema: { type: 'string' },
              description: 'カード名でフィルター',
            },
            {
              in: 'query',
              name: 'skillEffectContains',
              schema: { type: 'string' },
              description: 'スキル効果テキストの部分一致',
            },
            {
              in: 'query',
              name: 'traitEffectContains',
              schema: { type: 'string' },
              description: '特性効果テキストの部分一致',
            },
            {
              in: 'query',
              name: 'specialAppealEffectContains',
              schema: { type: 'string' },
              description: 'スペシャルアピール効果テキストの部分一致',
            },
            {
              in: 'query',
              name: 'accessoryEffectContains',
              schema: { type: 'string' },
              description: 'アクセサリー効果テキストの部分一致',
            },
          ],
          responses: {
            '200': {
              description: 'カード一覧',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Card' },
                  },
                },
              },
            },
            '500': {
              description: 'サーバーエラー',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/cards/connection': {
        get: {
          summary: 'カード一覧（ページネーション）',
          description:
            'カーソルベースのページネーションでカード一覧を取得します。',
          tags: ['Cards'],
          parameters: [
            {
              in: 'query',
              name: 'first',
              schema: { type: 'integer', default: 20 },
              description: '取得件数',
            },
            {
              in: 'query',
              name: 'after',
              schema: { type: 'string' },
              description: 'ページネーションカーソル',
            },
            {
              in: 'query',
              name: 'rarity',
              schema: { type: 'string' },
              description: 'レアリティでフィルター',
            },
            {
              in: 'query',
              name: 'characterName',
              schema: {
                type: 'string',
                enum: [
                  '日野下花帆',
                  '村野さやか',
                  '乙宗梢',
                  '夕霧綴理',
                  '大沢瑠璃乃',
                  '藤島慈',
                  '徒町小鈴',
                  '百生吟子',
                  '安養寺姫芽',
                  '桂城泉',
                  'セラス',
                  '大賀美沙知',
                ],
              },
              description: 'キャラクター名でフィルター',
            },
          ],
          responses: {
            '200': {
              description: 'ページネーション付きカード一覧',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CardConnection' },
                },
              },
            },
          },
        },
      },
      '/cards/stats': {
        get: {
          summary: 'カード統計情報',
          description:
            'カードの統計情報（総数、レアリティ別、スタイル別、キャラクター別）を取得します。',
          tags: ['Cards'],
          responses: {
            '200': {
              description: '統計情報',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      totalCards: { type: 'integer' },
                      byRarity: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            rarity: { type: 'string' },
                            count: { type: 'integer' },
                          },
                        },
                      },
                      byStyleType: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            styleType: { type: 'string' },
                            count: { type: 'integer' },
                          },
                        },
                      },
                      byCharacter: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            characterName: { type: 'string' },
                            count: { type: 'integer' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/cards/{id}': {
        get: {
          summary: 'カード取得（ID指定）',
          description: 'IDを指定してカードを取得します。',
          tags: ['Cards'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'カードID',
            },
          ],
          responses: {
            '200': {
              description: 'カード情報',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Card' },
                },
              },
            },
            '404': {
              description: '見つかりません',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/cards/name/{cardName}/{characterName}': {
        get: {
          summary: 'カード取得（カード名・キャラクター名指定）',
          description:
            'カード名とキャラクター名の組み合わせでカードを取得します。',
          tags: ['Cards'],
          parameters: [
            {
              in: 'path',
              name: 'cardName',
              required: true,
              schema: { type: 'string' },
              description: 'カード名',
            },
            {
              in: 'path',
              name: 'characterName',
              required: true,
              schema: {
                type: 'string',
                enum: [
                  '日野下花帆',
                  '村野さやか',
                  '乙宗梢',
                  '夕霧綴理',
                  '大沢瑠璃乃',
                  '藤島慈',
                  '徒町小鈴',
                  '百生吟子',
                  '安養寺姫芽',
                  '桂城泉',
                  'セラス',
                  '大賀美沙知',
                ],
              },
              description: 'キャラクター名',
            },
          ],
          responses: {
            '200': {
              description: 'カード情報',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Card' },
                },
              },
            },
            '404': {
              description: '見つかりません',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/card-details/{cardId}': {
        get: {
          summary: 'カード詳細取得（カードID指定）',
          description: 'カードIDを指定してカード詳細情報を取得します。',
          tags: ['Cards'],
          parameters: [
            {
              in: 'path',
              name: 'cardId',
              required: true,
              schema: { type: 'integer' },
              description: 'カードID',
            },
          ],
          responses: {
            '200': {
              description: 'カード詳細情報',
              content: { 'application/json': { schema: { type: 'object' } } },
            },
            '404': {
              description: '見つかりません',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/accessories/{cardId}': {
        get: {
          summary: 'アクセサリー一覧取得（カードID指定）',
          description: 'カードIDを指定してアクセサリー一覧を取得します。',
          tags: ['Cards'],
          parameters: [
            {
              in: 'path',
              name: 'cardId',
              required: true,
              schema: { type: 'integer' },
              description: 'カードID',
            },
          ],
          responses: {
            '200': {
              description: 'アクセサリー一覧',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
      },
      '/effect-keywords/skill': {
        get: {
          summary: 'スキル効果キーワード一覧取得',
          description: 'スキル効果に関するキーワードグループ一覧を取得します。',
          tags: ['EffectKeywords'],
          responses: {
            '200': {
              description: 'スキル効果キーワードグループ一覧',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/EffectKeywordGroup' },
                  },
                },
              },
            },
          },
        },
      },
      '/effect-keywords/trait': {
        get: {
          summary: '特性効果キーワード一覧取得',
          description: '特性効果に関するキーワードグループ一覧を取得します。',
          tags: ['EffectKeywords'],
          responses: {
            '200': {
              description: '特性効果キーワードグループ一覧',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/EffectKeywordGroup' },
                  },
                },
              },
            },
          },
        },
      },
      '/grade-challenges': {
        get: {
          summary: 'グレードチャレンジ一覧取得',
          description:
            'フィルター条件を指定してグレードチャレンジイベント一覧を取得します。',
          tags: ['GradeChallenges'],
          parameters: [
            {
              in: 'query',
              name: 'termName',
              schema: { type: 'string' },
              description: 'ターム名でフィルター',
            },
          ],
          responses: {
            '200': {
              description: 'グレードチャレンジ一覧',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/GradeChallenge' },
                  },
                },
              },
            },
          },
        },
      },
      '/grade-challenges/ongoing': {
        get: {
          summary: '開催中のグレードチャレンジ取得',
          description: '現在開催中のグレードチャレンジイベントを取得します。',
          tags: ['GradeChallenges'],
          responses: {
            '200': {
              description: '開催中イベント一覧',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/GradeChallenge' },
                  },
                },
              },
            },
          },
        },
      },
      '/grade-challenges/stats': {
        get: {
          summary: 'グレードチャレンジ統計情報',
          description: 'グレードチャレンジイベントの統計情報を取得します。',
          tags: ['GradeChallenges'],
          responses: {
            '200': {
              description: '統計情報',
              content: { 'application/json': { schema: { type: 'object' } } },
            },
          },
        },
      },
      '/grade-challenges/{id}': {
        get: {
          summary: 'グレードチャレンジ取得（ID指定）',
          description: 'IDを指定してグレードチャレンジイベントを取得します。',
          tags: ['GradeChallenges'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'イベントID',
            },
          ],
          responses: {
            '200': {
              description: 'グレードチャレンジイベント情報',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GradeChallenge' },
                },
              },
            },
            '404': {
              description: '見つかりません',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/grade-challenges/title/{title}': {
        get: {
          summary: 'グレードチャレンジ取得（タイトル指定）',
          description:
            'タイトルを指定してグレードチャレンジイベントを取得します。',
          tags: ['GradeChallenges'],
          parameters: [
            {
              in: 'path',
              name: 'title',
              required: true,
              schema: { type: 'string' },
              description: 'タイトル',
            },
          ],
          responses: {
            '200': {
              description: 'グレードチャレンジイベント情報',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GradeChallenge' },
                },
              },
            },
            '404': {
              description: '見つかりません',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/live-grand-prix': {
        get: {
          summary: 'ライブグランプリ一覧取得',
          description:
            'フィルター条件を指定してライブグランプリイベント一覧を取得します。',
          tags: ['LiveGrandPrix'],
          parameters: [
            {
              in: 'query',
              name: 'yearTerm',
              schema: { type: 'string' },
              description: '年期でフィルター',
            },
          ],
          responses: {
            '200': {
              description: 'ライブグランプリ一覧',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/LiveGrandPrix' },
                  },
                },
              },
            },
          },
        },
      },
      '/live-grand-prix/ongoing': {
        get: {
          summary: '開催中のライブグランプリ取得',
          description: '現在開催中のライブグランプリイベントを取得します。',
          tags: ['LiveGrandPrix'],
          responses: {
            '200': {
              description: '開催中イベント一覧',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/LiveGrandPrix' },
                  },
                },
              },
            },
          },
        },
      },
      '/live-grand-prix/stats': {
        get: {
          summary: 'ライブグランプリ統計情報',
          description: 'ライブグランプリイベントの統計情報を取得します。',
          tags: ['LiveGrandPrix'],
          responses: {
            '200': {
              description: '統計情報',
              content: { 'application/json': { schema: { type: 'object' } } },
            },
          },
        },
      },
      '/live-grand-prix/{id}': {
        get: {
          summary: 'ライブグランプリ取得（ID指定）',
          description: 'IDを指定してライブグランプリイベントを取得します。',
          tags: ['LiveGrandPrix'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'イベントID',
            },
          ],
          responses: {
            '200': {
              description: 'ライブグランプリイベント情報',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LiveGrandPrix' },
                },
              },
            },
            '404': {
              description: '見つかりません',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/live-grand-prix/name/{eventName}': {
        get: {
          summary: 'ライブグランプリ取得（イベント名指定）',
          description:
            'イベント名を指定してライブグランプリイベントを取得します。',
          tags: ['LiveGrandPrix'],
          parameters: [
            {
              in: 'path',
              name: 'eventName',
              required: true,
              schema: { type: 'string' },
              description: 'イベント名',
            },
          ],
          responses: {
            '200': {
              description: 'ライブグランプリイベント情報',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LiveGrandPrix' },
                },
              },
            },
            '404': {
              description: '見つかりません',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/songs': {
        get: {
          summary: '楽曲一覧取得',
          description: 'フィルター条件を指定して楽曲の一覧を取得します。',
          tags: ['Songs'],
          parameters: [
            {
              in: 'query',
              name: 'category',
              schema: { type: 'string' },
              description: 'カテゴリでフィルター',
            },
            {
              in: 'query',
              name: 'attribute',
              schema: { type: 'string' },
              description: '属性でフィルター',
            },
            {
              in: 'query',
              name: 'centerCharacter',
              schema: { type: 'string' },
              description: 'センターキャラクターでフィルター',
            },
          ],
          responses: {
            '200': {
              description: '楽曲一覧',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Song' },
                  },
                },
              },
            },
          },
        },
      },
      '/songs/stats': {
        get: {
          summary: '楽曲統計情報',
          description: '楽曲の統計情報を取得します。',
          tags: ['Songs'],
          responses: {
            '200': {
              description: '統計情報',
              content: { 'application/json': { schema: { type: 'object' } } },
            },
          },
        },
      },
      '/songs/{id}': {
        get: {
          summary: '楽曲取得（ID指定）',
          description: 'IDを指定して楽曲を取得します。',
          tags: ['Songs'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: '楽曲ID',
            },
          ],
          responses: {
            '200': {
              description: '楽曲情報',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Song' },
                },
              },
            },
            '404': {
              description: '見つかりません',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/songs/name/{songName}': {
        get: {
          summary: '楽曲取得（楽曲名指定）',
          description: '楽曲名を指定して楽曲を取得します。',
          tags: ['Songs'],
          parameters: [
            {
              in: 'path',
              name: 'songName',
              required: true,
              schema: { type: 'string' },
              description: '楽曲名',
            },
          ],
          responses: {
            '200': {
              description: '楽曲情報',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Song' },
                },
              },
            },
            '404': {
              description: '見つかりません',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/trait-analysis/batch': {
        post: {
          summary: '特性分析バッチ取得',
          description:
            '複数のカードIDを指定してハートコレクト分析・アンドロー分析データをまとめて取得します。',
          tags: ['TraitAnalysis'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TraitAnalysisBatchRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'バッチ分析結果',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TraitAnalysisBatchResponse',
                  },
                },
              },
            },
            '400': {
              description: 'バリデーションエラー',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
