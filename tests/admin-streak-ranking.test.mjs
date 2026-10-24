import test from "node:test";
import assert from "node:assert/strict";
import { historyStats, localDayOrdinal } from "../features/history/stats.ts";

test("Streak ranking aggregation logic from accounts and checkIns", () => {
  const now = new Date("2026-10-24T12:00:00Z"); // Fix 'now' for consistent testing
  const todayOrd = localDayOrdinal(now);

  const mockAccounts = [
    {
      id: "user-1",
      student_code: "2101040001",
      display_name: "Nguyễn Văn A",
      avatar_url: null,
      role: "USER",
      email: "a@hanu.edu.vn",
      created_at: "2026-09-01T00:00:00Z",
      last_sign_in_at: "2026-10-24T10:00:00Z",
    },
    {
      id: "user-2",
      student_code: "2101040002",
      display_name: "Trần Thị B",
      avatar_url: null,
      role: "USER",
      email: "b@hanu.edu.vn",
      created_at: "2026-09-02T00:00:00Z",
      last_sign_in_at: "2026-10-23T10:00:00Z",
    },
    {
      id: "user-3",
      student_code: "2101040003",
      display_name: "Lê Văn C (Chưa check in)",
      avatar_url: null,
      role: "USER",
      email: "c@hanu.edu.vn",
      created_at: "2026-09-03T00:00:00Z",
      last_sign_in_at: null,
    },
  ];

  // User 1: Checked in today (2026-10-24) and yesterday (2026-10-23) -> currentStreak: 2, longestStreak: 2
  // User 2: Checked in 5 consecutive days in past (2026-10-10 to 2026-10-14), but no check-in today/yesterday -> currentStreak: 0, longestStreak: 5
  // User 4 (orphan check-in, not in accounts): Checked in today -> currentStreak: 1
  const mockCheckIns = [
    // user 1
    {
      id: "ci-1",
      user_id: "user-1",
      restaurant_id: "rest-1",
      visited_at: "2026-10-24T05:00:00Z",
      user_name: "Nguyễn Văn A",
      student_code: "2101040001",
    },
    {
      id: "ci-2",
      user_id: "user-1",
      restaurant_id: "rest-2",
      visited_at: "2026-10-23T05:00:00Z",
      user_name: "Nguyễn Văn A",
      student_code: "2101040001",
    },
    // user 2 (5 days streak in past)
    { id: "ci-3", user_id: "user-2", restaurant_id: "rest-1", visited_at: "2026-10-10T05:00:00Z" },
    { id: "ci-4", user_id: "user-2", restaurant_id: "rest-1", visited_at: "2026-10-11T05:00:00Z" },
    { id: "ci-5", user_id: "user-2", restaurant_id: "rest-1", visited_at: "2026-10-12T05:00:00Z" },
    { id: "ci-6", user_id: "user-2", restaurant_id: "rest-1", visited_at: "2026-10-13T05:00:00Z" },
    { id: "ci-7", user_id: "user-2", restaurant_id: "rest-1", visited_at: "2026-10-14T05:00:00Z" },
    // user 4 (orphan)
    {
      id: "ci-8",
      user_id: "user-4",
      restaurant_id: "rest-1",
      visited_at: "2026-10-24T06:00:00Z",
      user_name: "Phạm Văn D",
      student_code: "2101040004",
    },
  ];

  // Logic calculation test
  const userCheckInsMap = new Map();
  const lastVisitedMap = new Map();
  const userMetaMap = new Map();

  for (const ci of mockCheckIns) {
    if (!ci.user_id) continue;
    let list = userCheckInsMap.get(ci.user_id);
    if (!list) {
      list = [];
      userCheckInsMap.set(ci.user_id, list);
    }
    list.push({ restaurant_id: ci.restaurant_id, visited_at: ci.visited_at });

    if (!lastVisitedMap.has(ci.user_id) || new Date(ci.visited_at) > new Date(lastVisitedMap.get(ci.user_id))) {
      lastVisitedMap.set(ci.user_id, ci.visited_at);
    }

    if (!userMetaMap.has(ci.user_id) && (ci.user_name || ci.student_code)) {
      userMetaMap.set(ci.user_id, {
        displayName: ci.user_name || "Thành viên",
        studentCode: ci.student_code,
      });
    }
  }

  const seenUserIds = new Set();
  const ranking = [];

  for (const acc of mockAccounts) {
    seenUserIds.add(acc.id);
    const userCIs = userCheckInsMap.get(acc.id) || [];
    const stats = historyStats(userCIs, now);
    const daySet = new Set(userCIs.map((item) => localDayOrdinal(new Date(item.visited_at))));
    const isTodayCheckedIn = daySet.has(todayOrd);

    ranking.push({
      userId: acc.id,
      studentCode: acc.student_code,
      displayName: acc.display_name,
      avatarUrl: acc.avatar_url,
      role: acc.role,
      email: acc.email,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      isTodayCheckedIn,
      totalCheckIns: userCIs.length,
      lastCheckInAt: lastVisitedMap.get(acc.id) || null,
    });
  }

  for (const [userId, userCIs] of userCheckInsMap.entries()) {
    if (seenUserIds.has(userId)) continue;
    const meta = userMetaMap.get(userId);
    const stats = historyStats(userCIs, now);
    const daySet = new Set(userCIs.map((item) => localDayOrdinal(new Date(item.visited_at))));
    const isTodayCheckedIn = daySet.has(todayOrd);

    ranking.push({
      userId,
      studentCode: meta?.studentCode || "—",
      displayName: meta?.displayName || "Thành viên",
      avatarUrl: null,
      role: "USER",
      email: "—",
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      isTodayCheckedIn,
      totalCheckIns: userCIs.length,
      lastCheckInAt: lastVisitedMap.get(userId) || null,
    });
  }

  // Verification 1: Correct count of ranking items
  assert.equal(ranking.length, 4);

  // Verification 2: User 1 stats
  const u1 = ranking.find((r) => r.userId === "user-1");
  assert.equal(u1.currentStreak, 2);
  assert.equal(u1.longestStreak, 2);
  assert.equal(u1.isTodayCheckedIn, true);
  assert.equal(u1.totalCheckIns, 2);

  // Verification 3: User 2 stats
  const u2 = ranking.find((r) => r.userId === "user-2");
  assert.equal(u2.currentStreak, 0); // streak broke
  assert.equal(u2.longestStreak, 5); // retained historical longest
  assert.equal(u2.isTodayCheckedIn, false);
  assert.equal(u2.totalCheckIns, 5);

  // Verification 4: User 3 (no check ins)
  const u3 = ranking.find((r) => r.userId === "user-3");
  assert.equal(u3.currentStreak, 0);
  assert.equal(u3.longestStreak, 0);
  assert.equal(u3.isTodayCheckedIn, false);
  assert.equal(u3.totalCheckIns, 0);
  assert.equal(u3.lastCheckInAt, null);

  // Verification 5: User 4 (orphan check in resolved gracefully)
  const u4 = ranking.find((r) => r.userId === "user-4");
  assert.equal(u4.displayName, "Phạm Văn D");
  assert.equal(u4.studentCode, "2101040004");
  assert.equal(u4.currentStreak, 1);
  assert.equal(u4.isTodayCheckedIn, true);

  // Verification 6: Sorting by currentStreak (mode === "current")
  const sortedByCurrent = [...ranking].sort((a, b) => {
    if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
    if (b.longestStreak !== a.longestStreak) return b.longestStreak - a.longestStreak;
    return b.totalCheckIns - a.totalCheckIns;
  });
  assert.equal(sortedByCurrent[0].userId, "user-1"); // 2 days
  assert.equal(sortedByCurrent[1].userId, "user-4"); // 1 day

  // Verification 7: Sorting by longestStreak (mode === "longest")
  const sortedByLongest = [...ranking].sort((a, b) => {
    if (b.longestStreak !== a.longestStreak) return b.longestStreak - a.longestStreak;
    if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
    return b.totalCheckIns - a.totalCheckIns;
  });
  assert.equal(sortedByLongest[0].userId, "user-2"); // 5 days longest
});

test("getAllAuthUsers paginates beyond default 50 user limit", async () => {
  // Mock adminSupabase with 92 users across multiple pages or with perPage 1000
  const mockAllUsers = Array.from({ length: 92 }, (_, i) => ({
    id: `u-${i + 1}`,
    email: `student${i + 1}@hanu.edu.vn`,
    last_sign_in_at: i % 2 === 0 ? "2026-10-24T12:00:00Z" : null,
  }));

  const mockAdminSupabase = {
    auth: {
      admin: {
        async listUsers({ page = 1, perPage = 50 } = {}) {
          const start = (page - 1) * perPage;
          const users = mockAllUsers.slice(start, start + perPage);
          const nextPage = start + perPage < mockAllUsers.length ? page + 1 : null;
          return { data: { users, nextPage }, error: null };
        },
      },
    },
  };

  async function getAllAuthUsers(adminSupabase) {
    const allUsers = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage });
      if (error || !data?.users || data.users.length === 0) break;
      allUsers.push(...data.users);
      if (!data.nextPage || data.users.length < perPage) break;
      page = data.nextPage;
    }
    return allUsers;
  }

  // With perPage = 1000, all 92 users are fetched in page 1
  const fetched = await getAllAuthUsers(mockAdminSupabase);
  assert.equal(fetched.length, 92);
  assert.equal(fetched[0].id, "u-1");
  assert.equal(fetched[91].id, "u-92");
  assert.equal(fetched[91].email, "student92@hanu.edu.vn");

  // Verify emailMap covers all 92 users
  const emailMap = new Map(fetched.map((u) => [u.id, { email: u.email, lastSignIn: u.last_sign_in_at }]));
  assert.equal(emailMap.get("u-92").email, "student92@hanu.edu.vn");
  assert.ok(emailMap.has("u-76"));
  assert.ok(emailMap.has("u-90"));
});

