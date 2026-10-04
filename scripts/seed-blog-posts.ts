/** Publish three original HANU Hungry guides through an ADMIN session. */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const posts = [
  {
    slug: "an-gi-quanh-hanu-tim-quan-theo-mon-va-gia",
    title: "Ăn gì quanh HANU? Tìm quán theo món và mức giá",
    excerpt: "Cách dùng dữ liệu khảo sát trên HANU Hungry để chọn quán, lọc món và đọc giá một cách thực tế.",
    seo_title: "Ăn gì quanh HANU? Tìm quán ăn theo món và giá | HANU Hungry",
    seo_description: "Hướng dẫn tìm quán ăn quanh Đại học Hà Nội theo tên món, loại quán và mức giá trên HANU Hungry, với dữ liệu khảo sát thực tế.",
    content: [
      "Bữa trưa giữa hai tiết học thường không có nhiều thời gian để cân nhắc. HANU Hungry gom thông tin quán và thực đơn do nhóm sinh viên khảo sát để bạn bắt đầu từ điều mình muốn ăn: tên món, tên quán, loại quán hoặc khoảng tiền dự kiến. Đây là điểm khởi đầu để tham khảo, không thay cho việc xác nhận giá tại quán vào ngày bạn ghé.",
      "## Bắt đầu bằng tên món",
      "Nhập món bạn đang thèm vào ô tìm kiếm, chẳng hạn bún, cơm hoặc cà phê. Công cụ tìm kiếm hỗ trợ cả cách gõ có dấu và không dấu. Nếu đã biết tên quán, bạn có thể dùng ngay tên đó. Kết quả chỉ hiển thị quán đang hoạt động trong dữ liệu; mở trang chi tiết để xem thực đơn và các ghi chú được khảo sát.",
      "## Kết hợp danh mục và mức giá",
      "Danh mục giúp thu hẹp lựa chọn khi bạn mới biết mình muốn đồ uống, món chính hay đồ ăn vặt. Bộ lọc giá dùng giá số mà nhóm có thể chuẩn hóa chắc chắn từ bảng nguồn. Một món chưa rõ giá sẽ không bị coi là 0 đồng và không tự lọt vào bộ lọc. Giá hiển thị vẫn giữ cách ghi trong khảo sát, ví dụ giá theo size hoặc theo đơn vị, để bạn đọc đúng ngữ cảnh.",
      "## Chốt lựa chọn bằng trang quán",
      "Sau khi tìm được quán phù hợp, hãy xem khu vực, địa chỉ hoặc Plus Code nếu nguồn có ghi. Nút Google Maps chỉ xuất hiện khi có dữ liệu vị trí; ứng dụng không đoán tọa độ và không tính khoảng cách từ bạn đến quán. Nếu thông tin còn thiếu, trang sẽ báo đang cập nhật. Khi đã ăn xong, bạn có thể bấm “Đã ăn” để lưu lần ghé vào lịch sử của riêng mình.",
    ].join("\n\n"),
  },
  {
    slug: "doc-gia-thuc-don-va-du-lieu-thieu-quanh-hanu",
    title: "Đọc giá thực đơn quanh HANU khi dữ liệu chưa đầy đủ",
    excerpt: "Giá theo size, theo đơn vị và giá còn thiếu cần được hiểu khác nhau; đây là cách HANU Hungry xử lý chúng.",
    seo_title: "Cách đọc giá thực đơn quanh HANU | HANU Hungry",
    seo_description: "Hiểu giá theo size, giá theo đơn vị và giá chưa có dữ liệu trong bảng khảo sát quán ăn quanh HANU.",
    content: [
      "Một bảng khảo sát thực tế hiếm khi có mọi ô thông tin được điền giống nhau. Có món ghi một mức giá, có món ghi nhiều size, có dòng chỉ ghi đơn vị, và có món chưa có giá. HANU Hungry giữ lại chữ gốc để bạn biết người khảo sát đã thấy gì, đồng thời chỉ chuẩn hóa con số khi cách hiểu đủ rõ.",
      "## Giá hiển thị và giá dùng để lọc",
      "Ở trang chi tiết, giá món được trình bày theo ghi chép gốc. Một khoảng giá hoặc giá S/M/L có thể cho bạn biết các lựa chọn tại quán, nhưng không nên hiểu mọi phần ăn đều có cùng mức giá. Khi dùng bộ lọc “Giá tối đa”, hệ thống dựa vào giá số đã chuẩn hóa của món; giá chưa biết không bị biến thành 0 đồng.",
      "## Phân biệt món chính với phụ phí",
      "Bảng nguồn đôi khi có phần cộng thêm hoặc món ăn kèm miễn phí. Một dòng “+5,000” là phụ phí, không phải giá trọn vẹn của một bữa. Tương tự, món kèm miễn phí không có nghĩa quán bán một bữa ăn 0 đồng. Vì vậy những dòng này vẫn được giữ trong thực đơn để bạn tham khảo, nhưng không được dùng làm mức giá thấp nhất của quán.",
      "## Khi chưa thấy giá hoặc địa chỉ",
      "Nếu dữ liệu chưa có, website nói rõ “Chưa có dữ liệu giá” hoặc “Chưa có dữ liệu vị trí”. Đó là lời nhắc để kiểm tra trực tiếp với quán, không phải lỗi hiển thị. Bạn có thể gửi góp ý qua trang Liên hệ nếu thấy thông tin cần cập nhật. Cách ghi rõ phần chưa biết giúp mọi người chọn món với kỳ vọng thực tế hơn.",
    ].join("\n\n"),
  },
  {
    slug: "gacha-va-lich-su-da-an-cho-sinh-vien-hanu",
    title: "Đổi gió bữa ăn với Gacha và lịch sử Đã ăn",
    excerpt: "Khi chưa biết chọn quán nào, hãy thử Gacha; sau bữa ăn, lưu check-in để nhìn lại những nơi bạn đã ghé.",
    seo_title: "Gacha ăn gì và lịch sử Đã ăn quanh HANU | HANU Hungry",
    seo_description: "Tìm gợi ý quán hoặc món ngẫu nhiên từ dữ liệu thật và dùng check-in để lưu lịch sử ăn uống cá nhân trên HANU Hungry.",
    content: [
      "Có những ngày danh sách món quen thuộc đều không tạo cảm hứng. Gacha trên HANU Hungry đưa ra một quán hoặc món ngẫu nhiên từ dữ liệu đang có, giúp bạn bắt đầu khám phá mà không phải lướt quá lâu. Gợi ý này là điểm mở đầu: hãy đọc trang quán để xem thực đơn, ghi chú và vị trí trước khi quyết định.",
      "## Gacha lấy dữ liệu ở đâu?",
      "Lựa chọn được lấy từ quán và món đang hoạt động trong database khảo sát, không phải danh sách mẫu cài sẵn trong giao diện. Nếu ảnh, mô tả hoặc giá của lựa chọn còn thiếu, website sẽ hiển thị trạng thái cập nhật tương ứng. Bạn có thể chuyển giữa chế độ chọn quán và chọn món rồi bấm chọn lại để xem gợi ý khác.",
      "## Chỉ bấm Đã ăn sau khi ghé quán",
      "Mở một trang chi tiết chỉ có nghĩa bạn đang tìm hiểu. Lần ghé chỉ được lưu khi bạn chủ động bấm “Đã ăn”; bạn có thể chọn món đã ăn nếu thực đơn có sẵn, hoặc chỉ lưu quán. Lịch sử này thuộc tài khoản của bạn và có thể xóa nếu ghi nhầm.",
      "## Nhìn lại một tuần ăn uống",
      "Trang lịch sử tổng hợp số lần đã ăn, số quán đã ghé trong tuần và chuỗi ngày có check-in. Các số liệu dựa trên hành động bạn đã lưu, không cộng từ lượt xem trang. Nếu muốn chia sẻ trải nghiệm, bạn có thể viết đánh giá ở trang quán; chỉ bạn được sửa hoặc xóa đánh giá của mình.",
    ].join("\n\n"),
  },
] as const;

async function main() {
  if (process.argv.length !== 3 || process.argv[2] !== "--apply") {
    console.log("Pass --apply to publish the three editorial guides. Existing slugs are skipped.");
    return;
  }
  if (existsSync(resolve(".env.local"))) process.loadEnvFile(resolve(".env.local"));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const password = process.env.BOOTSTRAP_ADMIN_1_PASSWORD;
  if (!url || !key || !password) throw new Error("Runtime Supabase URL, publishable key and ADMIN password are required.");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: login, error: loginError } = await client.auth.signInWithPassword({ email: "linhphamhn342@gmail.com", password });
  if (loginError || !login.user) throw new Error("Could not authenticate bootstrap ADMIN.");
  const { data: profile, error: profileError } = await client.from("profiles").select("role").eq("id", login.user.id).single();
  if (profileError || profile?.role !== "ADMIN") throw new Error("Account is not ADMIN.");

  for (const post of posts) {
    const { data: existing, error: lookupError } = await client.from("blog_posts").select("id").eq("slug", post.slug).maybeSingle();
    if (lookupError) throw new Error(`Could not inspect article ${post.slug}.`);
    if (existing) { console.log(`already exists: ${post.slug}`); continue; }
    const { data: draft, error: insertError } = await client.from("blog_posts")
      .insert({ ...post, status: "draft", author_admin_id: login.user.id }).select("id").single();
    if (insertError || !draft) throw new Error(`Could not create article ${post.slug}.`);
    const { error: publishError } = await client.from("blog_posts")
      .update({ status: "published" }).eq("id", draft.id);
    if (publishError) throw new Error(`Article ${post.slug} was saved as a draft but could not be published.`);
    const { data: notifications, error: notificationError } = await client.from("notifications")
      .select("id").eq("blog_post_id", draft.id).eq("type", "BLOG_PUBLISHED");
    if (notificationError || notifications?.length !== 1) throw new Error(`Article ${post.slug} did not create exactly one global notification.`);
    console.log(`published with one notification: ${post.slug}`);
  }
  await client.auth.signOut();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Blog publication failed.");
  process.exitCode = 1;
});
