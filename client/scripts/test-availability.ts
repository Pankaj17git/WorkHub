import { timeToMinutes, minutesToTime } from "../services/worker/availability.service";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  } else {
    console.log(`✔ Passed: ${message}`);
  }
}

function runTests() {
  console.log("=== Testing Availability Engine Helpers & Overlap Math ===");

  // 1. Time conversion
  assert(timeToMinutes("00:00") === 0, "00:00 should be 0 minutes");
  assert(timeToMinutes("09:30") === 570, "09:30 should be 570 minutes");
  assert(timeToMinutes("18:00") === 1080, "18:00 should be 1080 minutes");
  assert(minutesToTime(570) === "09:30", "570 minutes should format as 09:30");

  // 2. Overlap formula: existingStart < requestedEnd && existingEnd > requestedStart
  function isOverlap(
    exStart: string,
    exEnd: string,
    reqStart: string,
    reqEnd: string,
    bufferMins: number = 0
  ): boolean {
    const s1 = timeToMinutes(exStart) - bufferMins;
    const e1 = timeToMinutes(exEnd) + bufferMins;
    const s2 = timeToMinutes(reqStart);
    const e2 = timeToMinutes(reqEnd);
    return s1 < e2 && e1 > s2;
  }

  // Overlap test cases
  assert(isOverlap("10:00", "12:00", "11:00", "13:00"), "10-12 and 11-13 must overlap");
  assert(isOverlap("10:00", "12:00", "09:00", "11:00"), "10-12 and 09-11 must overlap");
  assert(isOverlap("10:00", "12:00", "10:15", "11:45"), "10-12 encloses 10:15-11:45");
  assert(isOverlap("10:00", "12:00", "08:00", "14:00"), "08-14 encloses 10-12");

  // Non-overlap test cases (without buffer)
  assert(!isOverlap("10:00", "12:00", "12:00", "14:00", 0), "10-12 and 12-14 back to back should not overlap without buffer");
  assert(!isOverlap("10:00", "12:00", "08:00", "10:00", 0), "08-10 and 10-12 back to back should not overlap without buffer");

  // Buffer test cases (30 minutes buffer)
  assert(isOverlap("10:00", "12:00", "12:15", "14:00", 30), "12:15 starts within 30 min buffer of 12:00 -> must overlap");
  assert(!isOverlap("10:00", "12:00", "12:45", "14:00", 30), "12:45 starts after 30 min buffer -> no overlap");

  console.log("=== All Availability Algorithm Tests Passed Successfully! ===");
}

runTests();
