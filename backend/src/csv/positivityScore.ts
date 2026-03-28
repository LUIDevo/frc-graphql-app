import Sentiment from "sentiment";

const customWords = {
  // Positive words
  great: 4,
  excellent: 5,
  amazing: 5,
  fantastic: 5,
  awesome: 4,
  perfect: 5,
  reliable: 4,
  fast: 3,
  accurate: 3,
  consistent: 4,
  efficient: 3,
  smooth: 2,
  solid: 2,
  responsive: 1,
  powerful: 3,
  strong: 2,
  decent: 1, // a bit mild but mostly positive
  good: 2,
  impressive: 4,
  clean: 3,

  // Negative words
  bad: -4,
  terrible: -5,
  awful: -5,
  slow: -3,
  inaccurate: -4,
  unreliable: -4,
  inconsistent: -4,
  inefficient: -4,
  buggy: -4,
  laggy: -3,
  crash: -5,
  fail: -2,
  failed: -2,
  poor: -3,
  weak: -3,
  unstable: -4,
  glitch: -3,
  glitched: -3,
  confusing: -3,
  rough: -3,
  flawed: -4,
  slowish: -2,
  broken: -5,
  error: -5,
  useless: -5,
  slowly: -3,
  incomplete: -4,
};
const sentiment = new Sentiment();
sentiment.registerLanguage("en", {
  labels: customWords,
});

export function getPositivityScore(comment: string): number {
  let score = sentiment.analyze(comment).score;
  if (score == 0) {
    console.error("HERE LOOK LOOK LOOK PROBLEM", comment);
  }
  return score;
}
