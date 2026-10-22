import type { HabitIcon } from "@habit/core";

import { PHOSPHOR_ICON_GROUPS } from "@/components/habit-icon";

/**
 * Words that a person types for an icon, besides the words of its name. "water" finds the drop,
 * "gym" the barbell. Only for names in the catalog.
 */
const SYNONYMS: Record<string, readonly string[]> = {
  drop: ["water", "hydrate", "drink"],
  "drop-half": ["water", "hydration"],
  pill: ["vitamin", "vitamins", "medicine", "meds", "supplement", "supplements"],
  heartbeat: ["cardio", "pulse"],
  heart: ["love", "health", "kindness"],
  tooth: ["teeth", "floss", "brush", "dentist"],
  eye: ["eyes", "vision"],
  brain: ["mind", "focus", "think"],
  "hand-soap": ["wash", "hands", "hygiene"],
  scales: ["weight", "weigh"],
  ruler: ["measure", "posture"],
  barbell: ["gym", "workout", "weights", "lift", "lifting", "strength", "training", "exercise"],
  "person-simple-walk": ["walk", "walking", "steps"],
  "person-simple-run": ["run", "running", "jog", "jogging", "cardio"],
  "person-simple-bike": ["cycle", "cycling"],
  "person-simple-swim": ["swimming", "pool"],
  "person-simple-tai-chi": ["stretch", "stretching", "mobility"],
  "person-simple-hike": ["hiking"],
  footprints: ["steps"],
  timer: ["minutes", "pomodoro"],
  "flower-lotus": ["meditate", "meditation", "yoga", "calm", "breathe"],
  "hands-praying": ["pray", "prayer", "gratitude", "thanks"],
  leaf: ["vegan", "vegetarian", "nature"],
  plant: ["plants", "garden", "gardening"],
  wind: ["breathe", "breathing", "air"],
  smiley: ["mood", "happy", "feeling", "feelings"],
  "moon-stars": ["sleep", "night", "bedtime"],
  moon: ["sleep", "night"],
  bed: ["sleep", "nap", "rest", "bedtime"],
  sun: ["morning", "sunlight", "outside", "daylight"],
  "sun-horizon": ["sunrise", "wake", "early"],
  alarm: ["wake", "early"],
  coffee: ["caffeine", "espresso", "latte", "tea"],
  wine: ["alcohol", "drinks", "drinking"],
  "beer-bottle": ["alcohol"],
  "beer-stein": ["alcohol"],
  martini: ["alcohol", "cocktail"],
  "cooking-pot": ["cook", "cooking", "meal", "dinner"],
  "fork-knife": ["eat", "eating", "meal", "lunch", "dinner", "breakfast", "fasting"],
  "bowl-food": ["salad", "meal"],
  carrot: ["vegetables", "veggies"],
  "orange-slice": ["fruit", "fruits"],
  cake: ["sugar", "dessert", "sweets"],
  cookie: ["sugar", "sweets", "snack", "snacks"],
  "ice-cream": ["sugar", "dessert"],
  hamburger: ["junk", "burger"],
  popcorn: ["snack", "movie", "movies"],
  cigarette: ["smoke", "smoking", "nicotine", "tobacco", "cigarettes"],
  "cigarette-slash": ["smoke", "smoking"],
  "device-mobile-slash": ["phone", "screen", "detox", "social"],
  "game-controller": ["games", "gaming"],
  television: ["tv", "series", "screen"],
  "book-open": ["read", "reading", "books"],
  book: ["read", "reading"],
  books: ["read", "study", "library"],
  notebook: ["journal", "diary", "notes", "write", "writing"],
  notepad: ["notes", "list"],
  pencil: ["write", "writing", "draw", "sketch"],
  "pen-nib": ["write", "writing", "calligraphy"],
  translate: [
    "language",
    "languages",
    "spanish",
    "french",
    "german",
    "english",
    "italian",
    "japanese",
    "vocabulary",
  ],
  "graduation-cap": ["study", "course", "school", "learn", "learning"],
  student: ["study", "class"],
  lightbulb: ["idea", "ideas"],
  code: ["coding", "programming"],
  "terminal-window": ["coding", "programming"],
  laptop: ["work", "computer"],
  briefcase: ["work", "job"],
  microphone: ["sing", "singing", "podcast", "speak"],
  globe: ["travel", "world"],
  newspaper: ["news"],
  "paint-brush": ["paint", "painting", "art"],
  palette: ["art", "drawing", "paint"],
  "music-note": ["music", "song"],
  "music-notes": ["music", "practice"],
  guitar: ["music", "practice"],
  "piano-keys": ["piano", "music", "practice"],
  headphones: ["podcast", "listen", "music", "audiobook"],
  camera: ["photo", "photos", "photography"],
  needle: ["sew", "sewing", "knit", "knitting"],
  broom: ["clean", "cleaning", "tidy", "chores"],
  house: ["home", "chores"],
  bathtub: ["bath"],
  shower: ["cold"],
  "t-shirt": ["laundry", "clothes"],
  "washing-machine": ["laundry"],
  trash: ["garbage", "declutter"],
  dog: ["pet", "walk"],
  cat: ["pet"],
  "paw-print": ["pet", "pets"],
  car: ["drive", "driving"],
  wallet: ["money", "spend", "spending", "budget"],
  coins: ["money", "save", "savings"],
  "piggy-bank": ["save", "savings", "money"],
  money: ["cash", "spend"],
  "credit-card": ["spend", "spending", "shopping"],
  receipt: ["expenses", "spending", "budget"],
  "chart-line-up": ["invest", "investing"],
  users: ["friends", "family", "social", "people"],
  "hand-waving": ["hello", "social", "meet"],
  "phone-call": ["call", "family", "parents", "mom", "dad"],
  "chat-circle": ["talk", "chat", "message"],
  envelope: ["email", "mail", "letter", "inbox"],
  gift: ["give", "kindness"],
  handshake: ["network", "networking"],
  fire: ["energy"],
  lightning: ["energy"],
  snowflake: ["cold", "ice", "plunge"],
  target: ["focus"],
  "check-circle": ["done", "task"],
  "list-checks": ["todo", "tasks"],
  calendar: ["plan", "planning", "schedule"],
  "calendar-check": ["plan", "review"],
};

/** A short list of emoji that suit habits, with the words that find them. */
export const HABIT_EMOJI: readonly { emoji: string; words: readonly string[] }[] = [
  { emoji: "💧", words: ["water", "drink", "hydrate"] },
  { emoji: "📚", words: ["read", "reading", "books", "study"] },
  { emoji: "🧘", words: ["meditate", "meditation", "yoga", "calm"] },
  { emoji: "🏋️", words: ["gym", "weights", "workout", "strength"] },
  { emoji: "🏃", words: ["run", "running", "cardio"] },
  { emoji: "🚶", words: ["walk", "walking", "steps"] },
  { emoji: "🚴", words: ["bike", "cycling"] },
  { emoji: "🏊", words: ["swim", "swimming"] },
  { emoji: "🧗", words: ["climb", "climbing"] },
  { emoji: "🤸", words: ["stretch", "mobility"] },
  { emoji: "😴", words: ["sleep", "rest", "nap"] },
  { emoji: "⏰", words: ["wake", "early", "alarm"] },
  { emoji: "🌞", words: ["sun", "morning", "outside"] },
  { emoji: "🌙", words: ["night", "evening"] },
  { emoji: "🙂", words: ["mood", "happy", "feeling"] },
  { emoji: "🙏", words: ["gratitude", "pray", "thanks"] },
  { emoji: "📝", words: ["journal", "write", "notes"] },
  { emoji: "🗣️", words: ["language", "speak", "talk"] },
  { emoji: "💻", words: ["code", "coding", "work"] },
  { emoji: "🎸", words: ["guitar", "music"] },
  { emoji: "🎹", words: ["piano", "music"] },
  { emoji: "🎨", words: ["art", "paint", "draw"] },
  { emoji: "📷", words: ["photo", "camera"] },
  { emoji: "💊", words: ["vitamins", "medicine", "pills"] },
  { emoji: "🪥", words: ["teeth", "brush", "floss"] },
  { emoji: "🧴", words: ["skincare", "lotion"] },
  { emoji: "🚿", words: ["shower", "cold"] },
  { emoji: "🥗", words: ["salad", "healthy", "food"] },
  { emoji: "🍎", words: ["fruit", "apple"] },
  { emoji: "🥦", words: ["vegetables", "veggies"] },
  { emoji: "🍳", words: ["cook", "cooking", "breakfast"] },
  { emoji: "☕", words: ["coffee", "caffeine"] },
  { emoji: "🍵", words: ["tea"] },
  { emoji: "🍷", words: ["wine", "alcohol"] },
  { emoji: "🍺", words: ["beer", "alcohol"] },
  { emoji: "🍬", words: ["sugar", "sweets", "candy"] },
  { emoji: "🚭", words: ["smoking", "cigarettes"] },
  { emoji: "📵", words: ["phone", "screen", "social"] },
  { emoji: "🎮", words: ["games", "gaming"] },
  { emoji: "📺", words: ["tv", "series"] },
  { emoji: "🧹", words: ["clean", "chores", "tidy"] },
  { emoji: "🧺", words: ["laundry"] },
  { emoji: "🌱", words: ["plants", "garden", "grow"] },
  { emoji: "🐕", words: ["dog", "walk", "pet"] },
  { emoji: "💰", words: ["money", "save", "budget"] },
  { emoji: "📞", words: ["call", "family", "friends"] },
  { emoji: "❤️", words: ["love", "heart", "kindness"] },
  { emoji: "🧠", words: ["learn", "mind", "brain"] },
  { emoji: "🎯", words: ["focus", "target"] },
  { emoji: "✅", words: ["done", "check", "task"] },
];

interface IconEntry {
  name: string;
  group: string;
  words: string[];
}

const ICONS: readonly IconEntry[] = PHOSPHOR_ICON_GROUPS.flatMap((group) =>
  group.names.map((name) => ({
    name,
    group: group.label,
    words: [...name.split("-"), group.label.toLowerCase(), ...(SYNONYMS[name] ?? [])],
  })),
);

function queryWords(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word !== "");
}

/** True when each word of the query starts a word of the entry. */
function matches(words: readonly string[], query: readonly string[]): boolean {
  return query.every((part) => words.some((word) => word.startsWith(part)));
}

/** The icon names whose words match the query, in the order of the catalog. All for no query. */
export function searchIcons(query: string): string[] {
  const parts = queryWords(query);
  return ICONS.filter((icon) => matches(icon.words, parts)).map((icon) => icon.name);
}

/** The emoji of the short list whose words match the query. */
export function searchEmoji(query: string): string[] {
  const parts = queryWords(query);
  if (parts.length === 0) return HABIT_EMOJI.map((entry) => entry.emoji);
  return HABIT_EMOJI.filter((entry) => matches(entry.words, parts)).map((entry) => entry.emoji);
}

const PICTOGRAPHIC = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;

/** The first emoji in the text, such as one that the person typed from the emoji keyboard. */
export function firstEmoji(text: string): string | undefined {
  const graphemes =
    typeof Intl.Segmenter === "function"
      ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), (s) =>
          s.segment.trim(),
        )
      : Array.from(text);
  return graphemes.find((grapheme) => PICTOGRAPHIC.test(grapheme));
}

/**
 * An icon for a name that the person typed, while they have not picked one: "Water" gets the drop,
 * "Reading" the open book. An exact word wins; else the longest word of an icon that starts a word
 * of the name ("vitamin" for "Vitamins"). Undefined when nothing fits.
 */
export function suggestIcon(name: string): HabitIcon | undefined {
  const parts = queryWords(name);
  if (parts.length === 0) return undefined;
  for (const icon of ICONS) {
    if (icon.words.some((word) => parts.includes(word) && word !== icon.group.toLowerCase())) {
      return { type: "phosphor", name: icon.name };
    }
  }
  let best: { name: string; length: number } | undefined;
  for (const icon of ICONS) {
    for (const word of icon.words) {
      if (word.length < 3 || word === icon.group.toLowerCase()) continue;
      if (parts.some((part) => part.startsWith(word)) && word.length > (best?.length ?? 0)) {
        best = { name: icon.name, length: word.length };
      }
    }
  }
  return best === undefined ? undefined : { type: "phosphor", name: best.name };
}
