export const SUBSCRIPTION_CONFIG = {
  FREE: {
    maxFullAdaptiveTests: 1,
    maxTopicTests: 3,
    maxStudyModules: 2,
    questionsPerAdaptiveTest: 10,
    questionsPerTopicTest: 5,
    allowedTracks: 1, // Can only sample one exam
  },
  PRO: {
    maxFullAdaptiveTests: Infinity,
    maxTopicTests: Infinity,
    maxStudyModules: Infinity,
    questionsPerAdaptiveTest: 50, // Standard exam length
    questionsPerTopicTest: 15,
    allowedTracks: 1, // Unlimited generation, but locked to a single purchased exam
  },
  ALL_ACCESS: {
    maxFullAdaptiveTests: Infinity,
    maxTopicTests: Infinity,
    maxStudyModules: Infinity,
    questionsPerAdaptiveTest: 50,
    questionsPerTopicTest: 15,
    allowedTracks: Infinity, // Unlocks everything
  }
};