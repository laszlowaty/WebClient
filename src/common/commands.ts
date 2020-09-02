export type TPhrase = {
  type: 'cmd' | 'phrase',
  phrase: string,
  aliasPhrase?: string,   
  next?: TCommandTree,
}

export type TWord = {
  type: 'word',
  next?: TCommandTree,
}

export type TFreeText = {
  type: 'free',
}

export type TCommandTree = Array<TPhrase|TWord|TFreeText>;

const testCommandTree: TCommandTree = [
  { type: 'cmd', phrase: 'north' },
  { type: 'cmd', phrase: 'south' },
  { type: 'cmd', phrase: 'west' },
  { type: 'cmd', phrase: 'east' },
  { type: 'cmd', phrase: 'down' },
  { type: 'cmd', phrase: 'up' },
  {
    type: 'cmd',
    phrase: 'examine',
    next: [
      { type: 'phrase', phrase: 'cialo' },
      { type: 'phrase', phrase: '2.cialo' },
      { type: 'free' },
    ],
  },
  {
    type: 'cmd',
    phrase: 'eat',
    next: [
      { type: 'phrase', phrase: 'racja' },
      { type: 'phrase', phrase: '2.racja' },
      { type: 'phrase', phrase: '3.racja' },
    ],
  },
  {
    type: 'cmd',
    phrase: 'exits',
  },
  {
    type: 'cmd',
    phrase: 'estimate',
    next: [
      { type: 'phrase', phrase: 'test' },
    ]
  },
  {
    type: 'cmd',
    phrase: 'enter',
    next: [
      { type: 'phrase', phrase: 'portal' },
    ]
  },
  {
    type: 'cmd',
    phrase: 'scan',
    next: [
      { type: 'word' },
    ],
  },
];

export {
  testCommandTree,
}