import { existsSync } from "node:fs";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { INITIAL_ADMINS } from "./bootstrap-admins.ts";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const isExecute = process.argv.includes("--execute");

// Danh sách email admin được bảo vệ tuyệt đối
const PROTECTED_EMAILS = new Set(
  INITIAL_ADMINS.map((a) => a.email.toLowerCase())
);

// Thời điểm đợt tấn công diễn ra: từ ngày 01/11/2026
const ATTACK_START_DATE = new Date("2026-11-01T00:00:00Z");

interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
}

function evaluateAccountSpam(user: User): SpamCheckResult {
  const email = (user.email || "").toLowerCase().trim();
  const createdAt = new Date(user.created_at);

  // 1. Bảo vệ tuyệt đối Admin
  if (PROTECTED_EMAILS.has(email)) {
    return { isSpam: false };
  }

  // 2. Chỉ xét các tài khoản trong đợt tấn công ngày 01/11/2026 (tránh xóa nhầm sinh viên đăng ký trước đó)
  if (createdAt < ATTACK_START_DATE) {
    return { isSpam: false };
  }

  // 3. Email chứa prefix của kẻ tấn công (hoangxuanlam2007)
  if (email.includes("hoangxuanlam") || email.includes("tested_by_")) {
    return { isSpam: true, reason: "Email chứa prefix script bot (hoangxuanlam / tested_by_)" };
  }

  // 4. Domain rác @contact.me
  if (email.endsWith("@contact.me")) {
    return { isSpam: true, reason: "Domain thư rác tạm thời (@contact.me)" };
  }

  // 5. Domain giả mạo / typo
  if (
    email.endsWith("@gmaill.com") ||
    email.endsWith("@gmail.cpm") ||
    email.endsWith("@gaw.com") ||
    email.endsWith("@gmaw.cff")
  ) {
    return { isSpam: true, reason: "Domain giả mạo / typo bot (@gmail.cpm, @gaw.com, @gmaill.com...)" };
  }

  // 6. Các mẫu email bot tự sinh ngẫu nhiên trong đợt tấn công
  if (/^test_\d+@gmail\.com$/i.test(email)) {
    return { isSpam: true, reason: "Pattern bot test_MSSV@gmail.com" };
  }
  if (/^test\d+_\d+@gmail\.com$/i.test(email)) {
    return { isSpam: true, reason: "Pattern bot testTIMESTAMP_RANDOM@gmail.com" };
  }
  if (/^hanu_\d{6}@gmail\.com$/i.test(email)) {
    return { isSpam: true, reason: "Pattern bot hanu_RANDOM6DIGITS@gmail.com" };
  }
  if (email === "tewee@gmail.com") {
    return { isSpam: true, reason: "Tài khoản bot test tewee@gmail.com" };
  }

  return { isSpam: false };
}

async function fetchAllUsers(client: SupabaseClient): Promise<User[]> {
  const allUsers: User[] = [];
  const perPage = 1000;
  let page = 1;

  while (true) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(`Failed to list users on page ${page}: ${error.message}`);
    }
    allUsers.push(...data.users);
    if (data.users.length < perPage) {
      break;
    }
    page += 1;
  }

  return allUsers;
}

async function run() {
  console.log(`=======================================================`);
  console.log(` HANU HUNGRY - SCRIPT DỌN DẸP TÀI KHOẢN ẢO AN TOÀN `);
  console.log(` Mode: ${isExecute ? "🚨 EXECUTE (XÓA THẬT)" : "🛡️ DRY-RUN (CHỈ QUÉT KIỂM TRA)"}`);
  console.log(`=======================================================\n`);

  console.log("Đang tải toàn bộ danh sách tài khoản từ Supabase Auth...");
  const users = await fetchAllUsers(admin);
  console.log(`-> Tổng số tài khoản hiện có trong hệ thống: ${users.length}\n`);

  const spamUsers: { user: User; reason: string }[] = [];
  const legitimateUsers: User[] = [];

  for (const user of users) {
    const evaluation = evaluateAccountSpam(user);
    if (evaluation.isSpam) {
      spamUsers.push({ user, reason: evaluation.reason || "Spam pattern" });
    } else {
      legitimateUsers.push(user);
    }
  }

  console.log(`-------------------------------------------------------`);
  console.log(`KẾT QUẢ PHÂN TÍCH:`);
  console.log(`- Tài khoản hợp lệ giữ lại : ${legitimateUsers.length}`);
  console.log(`- Tài khoản ảo/rác phát hiện: ${spamUsers.length}`);
  console.log(`-------------------------------------------------------\n`);

  // Phân loại lý do
  const reasonCounts: Record<string, number> = {};
  for (const item of spamUsers) {
    reasonCounts[item.reason] = (reasonCounts[item.reason] || 0) + 1;
  }
  console.log("Thống kê chi tiết tài khoản ảo theo dấu hiệu nhận diện:");
  for (const [reason, count] of Object.entries(reasonCounts)) {
    console.log(`  + ${reason}: ${count} tài khoản`);
  }
  console.log("");

  // In mẫu 15 tài khoản spam đầu tiên
  console.log("Mẫu 15 tài khoản rác phát hiện:");
  spamUsers.slice(0, 15).forEach(({ user, reason }, idx) => {
    console.log(
      `  [${idx + 1}] Email: ${user.email} | MSSV: ${user.user_metadata?.student_code || "N/A"} | Tạo lúc: ${user.created_at} | Lý do: ${reason}`
    );
  });
  if (spamUsers.length > 15) {
    console.log(`  ... và còn ${spamUsers.length - 15} tài khoản rác tương tự khác.`);
  }
  console.log("");

  if (!isExecute) {
    console.log("--------------------------------------------------------------------------------");
    console.log("ℹ️ ĐÂY LÀ CHẾ ĐỘ KIỂM TRA (DRY-RUN). CHƯA CÓ TÀI KHOẢN NÀO BỊ XÓA.");
    console.log("Để thực sự xóa sạch các tài khoản rác trên, vui lòng chạy lệnh với cờ --execute:");
    console.log("  node --experimental-strip-types scripts/cleanup-fake-accounts.ts --execute");
    console.log("--------------------------------------------------------------------------------");
    return;
  }

  console.log(`🚨 Bắt đầu tiến hành xóa ${spamUsers.length} tài khoản rác khỏi hệ thống...`);
  let deletedCount = 0;
  let failCount = 0;

  for (let i = 0; i < spamUsers.length; i++) {
    const { user } = spamUsers[i];
    try {
      const { error } = await admin.auth.admin.deleteUser(user.id);
      if (error) {
        console.error(`[Xóa thất bại] ID: ${user.id} (${user.email}): ${error.message}`);
        failCount += 1;
      } else {
        deletedCount += 1;
        if (deletedCount % 50 === 0 || deletedCount === spamUsers.length) {
          console.log(`  -> Đã xóa ${deletedCount}/${spamUsers.length} tài khoản...`);
        }
      }
    } catch (err) {
      console.error(`[Lỗi ngoại lệ] ID: ${user.id}:`, err);
      failCount += 1;
    }
  }

  console.log(`\n=======================================================`);
  console.log(` KẾT THÚC DỌN DẸP:`);
  console.log(` - Thành công : ${deletedCount} tài khoản`);
  console.log(` - Thất bại   : ${failCount} tài khoản`);
  console.log(` - Số tài khoản còn lại trong DB: ${users.length - deletedCount}`);
  console.log(`=======================================================`);
}

run().catch((err) => {
  console.error("Lỗi khi chạy script dọn dẹp:", err);
  process.exit(1);
});
