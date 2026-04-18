export const SUBSCRIPTION_CONFIG = {
  FREE: {
    maxFullAdaptiveTests: 2,
    maxTopicTests: 3,
    maxStudyModules: 2,
    questionsPerAdaptiveTest: 5,
    questionsPerTopicTest: 5,
    allowedTracks: 1,
  },
  PRO: {
    maxFullAdaptiveTests: Infinity,
    maxTopicTests: Infinity,
    maxStudyModules: Infinity,
    questionsPerAdaptiveTest: 30,
    questionsPerTopicTest: 10,
    allowedTracks: 1,
  },
  ALL_ACCESS: {
    maxFullAdaptiveTests: Infinity,
    maxTopicTests: Infinity,
    maxStudyModules: Infinity,
    questionsPerAdaptiveTest: 30,
    questionsPerTopicTest: 10,
    allowedTracks: Infinity,
  }
};
// How long (in seconds) the user must wait on each question before 
// the Next/Submit button becomes active. Set to 0 to disable the delay.
export const MIN_QUESTION_VIEW_SECONDS = 10;