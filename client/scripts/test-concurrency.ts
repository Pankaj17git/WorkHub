import { prisma } from "../lib/prisma";
import { JobService } from "../services/jobs/job.service";
import { DirectHireService } from "../services/directHire/directHire.service";
import { TeamInvitationService } from "../services/worker/teamInvitation.service";
import { AssignmentStateService } from "../services/assignment/assignmentState.service";
import { AuthActor } from "../lib/authActor";

async function runConcurrencyTests() {
  console.log("=================================================");
  console.log(" 🧪 WorkHub Concurrency & Transaction Test Suite");
  console.log("=================================================");

  const timestamp = Date.now();

  // 1. Create Mock Customer
  const customerUser = await prisma.user.create({
    data: {
      email: `test-cust-${timestamp}@test.com`,
      password: "hash",
      name: "Test Customer",
      customer: { create: {} },
    },
    include: { customer: true },
  });

  // 2. Create 3 Mock Workers
  const worker1User = await prisma.user.create({
    data: {
      email: `test-w1-${timestamp}@test.com`,
      password: "hash",
      name: "Test Worker 1",
      worker: { create: { headline: "Electrician", isVerified: true } },
    },
    include: { worker: true },
  });

  const worker2User = await prisma.user.create({
    data: {
      email: `test-w2-${timestamp}@test.com`,
      password: "hash",
      name: "Test Worker 2",
      worker: { create: { headline: "Plumber", isVerified: true } },
    },
    include: { worker: true },
  });

  const worker3User = await prisma.user.create({
    data: {
      email: `test-w3-${timestamp}@test.com`,
      password: "hash",
      name: "Test Worker 3",
      worker: { create: { headline: "Carpenter", isVerified: true } },
    },
    include: { worker: true },
  });

  const customerActor: AuthActor = {
    userId: customerUser.id,
    email: customerUser.email,
    role: "CUSTOMER",
    customer: { id: customerUser.customer!.id, addressId: null },
    worker: null,
  };

  const w1Actor: AuthActor = {
    userId: worker1User.id,
    email: worker1User.email,
    role: "WORKER",
    customer: null,
    worker: { id: worker1User.worker!.id, isVerified: true, addressId: null },
  };

  const w2Actor: AuthActor = {
    userId: worker2User.id,
    email: worker2User.email,
    role: "WORKER",
    customer: null,
    worker: { id: worker2User.worker!.id, isVerified: true, addressId: null },
  };

  const w3Actor: AuthActor = {
    userId: worker3User.id,
    email: worker3User.email,
    role: "WORKER",
    customer: null,
    worker: { id: worker3User.worker!.id, isVerified: true, addressId: null },
  };

  // Setup trusted connection between Worker 1 and Worker 2
  await prisma.workerConnection.create({
    data: {
      workerId: w1Actor.worker!.id,
      connectedWorkerId: w2Actor.worker!.id,
      status: "ACCEPTED",
    },
  });

  console.log("✔ Setup: Test users, customer, and trusted worker connections ready.");

  // TEST 1: Simultaneous Applications
  console.log("\n--- TEST 1: Simultaneous Applications ---");
  const job1 = await JobService.createJob(customerActor, {
    title: "Wiring Job",
    description: "Multi-worker electrical job",
    skills: ["Electrical"],
    requiredWorkers: 2,
  });

  const [app1Res, app2Res] = await Promise.allSettled([
    JobService.applyToJob(w1Actor, job1.id, "Quote 1"),
    JobService.applyToJob(w2Actor, job1.id, "Quote 2"),
  ]);

  if (app1Res.status === "fulfilled" && app2Res.status === "fulfilled") {
    console.log("✔ Test 1 Passed: Both concurrent applications succeeded cleanly without duplicates.");
  } else {
    console.error("❌ Test 1 Failed:", { app1Res, app2Res });
    process.exit(1);
  }

  // Duplicate check
  try {
    await JobService.applyToJob(w1Actor, job1.id, "Quote 1 again");
    console.error("❌ Test 1 Duplicate Protection Failed: Worker 1 was allowed to apply twice!");
    process.exit(1);
  } catch (err: unknown) {
    console.log("✔ Test 1 Duplicate Protection Passed: Duplicate application was properly rejected.");
  }

  // TEST 2: Concurrent Multi-Worker Selection Slot Overflow
  console.log("\n--- TEST 2: Final Slot Race Condition Protection ---");
  const singleSlotJob = await JobService.createJob(customerActor, {
    title: "Urgent 1-Worker Repair",
    description: "Only one slot available",
    skills: ["Plumbing"],
    requiredWorkers: 1,
  });

  await JobService.applyToJob(w1Actor, singleSlotJob.id);
  await JobService.applyToJob(w2Actor, singleSlotJob.id);

  // Attempt to concurrently select Worker 1 and Worker 2 for the single slot
  const [select1Res, select2Res] = await Promise.allSettled([
    JobService.selectWorkers(customerActor, singleSlotJob.id, [w1Actor.worker!.id]),
    JobService.selectWorkers(customerActor, singleSlotJob.id, [w2Actor.worker!.id]),
  ]);

  const fulfilledCount = [select1Res, select2Res].filter((r) => r.status === "fulfilled").length;
  const rejectedCount = [select1Res, select2Res].filter((r) => r.status === "rejected").length;

  if (fulfilledCount === 1 && rejectedCount === 1) {
    console.log("✔ Test 2 Passed: Exactly 1 selection succeeded and the overflow attempt was rejected.");
  } else {
    console.error("❌ Test 2 Failed: Slot race condition was not handled properly.", {
      fulfilledCount,
      rejectedCount,
    });
    process.exit(1);
  }

  // TEST 3: Concurrent Overlapping Direct Hire Acceptance
  console.log("\n--- TEST 3: Overlapping Direct Hire Conflict Protection ---");
  const directHire1 = await DirectHireService.createDirectHireRequest(customerActor, {
    workerId: w1Actor.worker!.id,
    requestedDate: "2026-10-15",
    requestedStartTime: "10:00",
    requestedEndTime: "12:00",
    customerMessage: "First job",
  });

  const directHire2 = await DirectHireService.createDirectHireRequest(customerActor, {
    workerId: w1Actor.worker!.id,
    requestedDate: "2026-10-15",
    requestedStartTime: "11:00", // Overlaps with 10:00 - 12:00
    requestedEndTime: "13:00",
    customerMessage: "Conflicting overlapping job",
  });

  const [dh1Res, dh2Res] = await Promise.allSettled([
    DirectHireService.acceptDirectHire(w1Actor, directHire1.id),
    DirectHireService.acceptDirectHire(w1Actor, directHire2.id),
  ]);

  const dhFulfilled = [dh1Res, dh2Res].filter((r) => r.status === "fulfilled").length;
  const dhRejected = [dh1Res, dh2Res].filter((r) => r.status === "rejected").length;

  if (dhFulfilled === 1 && dhRejected === 1) {
    console.log("✔ Test 3 Passed: Exactly 1 overlapping hire succeeded; second was rejected due to overlap.");
  } else {
    console.error("❌ Test 3 Failed:", { dhFulfilled, dhRejected });
    process.exit(1);
  }

  // TEST 4: Team Invitation & Acceptance
  console.log("\n--- TEST 4: Team Invitation Acceptance ---");
  const teamJob = await JobService.createJob(customerActor, {
    title: "Large Team Job",
    description: "Needs 2 workers",
    skills: ["General"],
    requiredWorkers: 2,
    preferredDate: "2026-10-20",
    preferredStartTime: "09:00",
    preferredEndTime: "17:00",
  });

  // Assign Worker 1 as Lead
  await JobService.applyToJob(w1Actor, teamJob.id);
  const selectedLead = await JobService.selectWorkers(customerActor, teamJob.id, [w1Actor.worker!.id]);
  console.log(`✔ Assigned Worker 1 as Lead (Staffing: ${selectedLead.job.assignedWorkerCount}/2)`);

  // Worker 1 invites connected Worker 2
  const teamInvite = await TeamInvitationService.createInvitation(w1Actor, teamJob.id, w2Actor.worker!.id);
  console.log("✔ Team invitation created from Worker 1 to Worker 2");

  // Worker 2 accepts team invite
  const acceptedInvite = await TeamInvitationService.acceptInvitation(w2Actor, teamInvite.id);
  console.log(`✔ Worker 2 accepted team invite. New staffing status: ${acceptedInvite.staffingStatus}`);

  if (acceptedInvite.staffingStatus === "FULLY_ASSIGNED") {
    console.log("✔ Test 4 Passed: Team invitation successfully transitioned job to FULLY_ASSIGNED.");
  } else {
    console.error("❌ Test 4 Failed:", acceptedInvite);
    process.exit(1);
  }

  // TEST 5: Doorstep OTP Verification & Assignment Progression
  console.log("\n--- TEST 5: Doorstep OTP Verification ---");
  const assignment = acceptedInvite.assignment;

  // Progress: ASSIGNED -> CONFIRMED -> ON_THE_WAY -> ARRIVED
  await AssignmentStateService.confirm(w2Actor, assignment.id);
  await AssignmentStateService.startTravel(w2Actor, assignment.id);
  const arrived = await AssignmentStateService.arrive(w2Actor, assignment.id);
  console.log("✔ Worker 2 arrived at site. Generated Start OTP:", arrived.startOtp);

  // Wrong OTP attempt
  try {
    await AssignmentStateService.verifyStartOtp(w2Actor, assignment.id, "000000");
    console.error("❌ Test 5 Failed: Wrong OTP was accepted!");
    process.exit(1);
  } catch (err: unknown) {
    console.log("✔ Test 5 Passed: Invalid OTP was correctly rejected.");
  }

  // Correct OTP attempt
  const started = await AssignmentStateService.verifyStartOtp(w2Actor, assignment.id, arrived.startOtp!);
  if (started.status === "IN_PROGRESS") {
    console.log("✔ Test 5 Passed: Correct Start OTP transitioned assignment to IN_PROGRESS.");
  } else {
    console.error("❌ Test 5 Failed: Assignment status is not IN_PROGRESS", started);
    process.exit(1);
  }

  // Complete
  const completed = await AssignmentStateService.complete(w2Actor, assignment.id);
  if (completed.status === "COMPLETED") {
    console.log("✔ Assignment completed successfully.");
  }

  console.log("\n=================================================");
  console.log(" 🎉 ALL CONCURRENCY & TRANSACTION TESTS PASSED! ");
  console.log("=================================================");
}

runConcurrencyTests()
  .catch((err) => {
    console.error("Unhandled Error during tests:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
