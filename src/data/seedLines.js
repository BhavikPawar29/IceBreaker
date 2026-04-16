export const storageKey = "sketchline-community-board-v2";

const seedLines = [
  {
    id: "seed-1",
    author: "Miles",
    category: "observational",
    text: "You look like someone who has a very strong opinion about the best coffee order in the city.",
    score: 32,
    createdAt: "2026-04-15T18:21:00.000Z",
  },
  {
    id: "seed-2",
    author: "Arun",
    category: "playful",
    text: "Quick question: are you naturally this easy to notice, or is today a special occasion?",
    score: 24,
    createdAt: "2026-04-14T17:30:00.000Z",
  },
  {
    id: "seed-3",
    author: "Noah",
    category: "low-pressure",
    text: "I was going to send a clever opener, but honestly your vibe seems more like honest conversation than gimmicks.",
    score: 19,
    createdAt: "2026-04-13T13:15:00.000Z",
  },
  {
    id: "seed-4",
    author: "Dev",
    category: "confident",
    text: "You seem like the kind of person who makes every room feel less boring. I had to test that theory.",
    score: 15,
    createdAt: "2026-04-12T10:45:00.000Z",
  },
  {
    id: "seed-5",
    author: "Eli",
    category: "playful",
    text: "Tell me I am wrong, but you definitely have a playlist that is better than most people's personalities.",
    score: 11,
    createdAt: "2026-04-11T09:12:00.000Z",
  },
];

export const defaultBoardState = {
  lines: seedLines,
  votes: {},
};
