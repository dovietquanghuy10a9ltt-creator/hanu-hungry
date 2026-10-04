# Bảo mật HANU Hungry

## Xác thực và hồ sơ

- Supabase Auth quản lý mật khẩu và phiên đăng nhập. Không có cột mật khẩu trong `profiles`; ứng dụng không lưu mật khẩu trong localStorage hoặc sessionStorage.
- Đăng ký nhận MSSV đúng 10 chữ số, email hợp lệ và mật khẩu tối thiểu 8 ký tự. Form kiểm tra ở trình duyệt để hỗ trợ người dùng; server action kiểm tra lại toàn bộ. Ràng buộc và trigger PostgreSQL là lớp bảo vệ cuối cùng cho MSSV, tính duy nhất và role mặc định `USER`.
- `display_name` khi tạo account lấy từ phần email trước `@`. Nó chỉ là tên hiển thị, không dùng để đăng nhập.
- Checkbox **Ghi nhớ đăng nhập** điều khiển thời hạn cookie phiên. Khi bỏ chọn, cookie phiên chỉ tồn tại trong phiên trình duyệt; mật khẩu không được lưu trên thiết bị bởi ứng dụng.
- Proxy làm mới phiên Supabase qua cookie. Route bảo vệ kiểm tra user server-side; layout `/admin` kiểm tra `profiles.role` server-side. Những kiểm tra này hỗ trợ RLS, không thay thế RLS.
- Logout gọi Supabase Auth `signOut` và xóa cookie tùy chọn phiên.

## Khôi phục và đổi mật khẩu

- Yêu cầu quên mật khẩu phải nhập email và MSSV thuộc cùng một account. Server action dùng `SUPABASE_SERVICE_ROLE_KEY` chỉ trên server để đối chiếu cặp thông tin, rồi mới gọi Supabase recovery. Phản hồi không xác nhận tài khoản có tồn tại hay không.
- Liên kết khôi phục đi qua `/auth/callback`, đổi mã/token thành phiên Supabase rồi chuyển tới `/reset-password`. User tự đặt mật khẩu mới; ứng dụng không gửi mật khẩu qua email.
- Callback chỉ nhận đường dẫn chuyển tiếp nội bộ để tránh open redirect. `APP_URL` phải trùng origin ứng dụng và nằm trong danh sách redirect cho phép của Supabase Auth. Ở production, `APP_URL` là bắt buộc.
- Đổi mật khẩu trong tài khoản yêu cầu mật khẩu hiện tại; server xác minh lại qua Supabase Auth trước khi cập nhật.
- Supabase Auth giới hạn tốc độ gửi email/đăng nhập. Trước khi public rộng rãi, nên thêm giới hạn tốc độ ở lớp edge cho server action khôi phục để ngăn lạm dụng truy vấn email/MSSV.

## Phân quyền và dữ liệu

- `profiles.role` chỉ có `USER` và `ADMIN`. Signup luôn nhận `USER`; metadata do người dùng gửi không quyết định role.
- Hai admin ban đầu được tạo bằng `scripts/bootstrap-admins.ts` dùng service role tại runtime. Script không đổi mật khẩu account đã tồn tại và từ chối MSSV xung đột.
- Service role key và mật khẩu bootstrap không được đặt dưới prefix `NEXT_PUBLIC_`, không xuất hiện trong client bundle, migration, seed, Git hoặc log. `.env.local` được Git ignore. Chỉ cung cấp secret qua biến môi trường an toàn.
- RLS PostgreSQL là lớp quyết định quyền cho các bảng public. Action server phải xác minh user/role và chỉ truy cập tài nguyên được phép. Không dùng `user_metadata` để ủy quyền.
- USER chỉ được sửa hồ sơ riêng qua các cột cho phép, review và check-in của mình. ADMIN quản lý nội dung quán/món/category/Blog và xem số liệu tổng hợp; ADMIN không có quyền quản trị danh tính người dùng.
- Không có route hoặc giao diện `/admin/users`. Không đưa Supabase Auth Admin User Management vào browser.

## Vận hành

1. Cấu hình `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` và `APP_URL`.
2. Chỉ server action khôi phục và script bootstrap cần `SUPABASE_SERVICE_ROLE_KEY`. Script bootstrap còn cần `BOOTSTRAP_ADMIN_1_PASSWORD` và `BOOTSTRAP_ADMIN_2_PASSWORD` khi tạo account mới.
3. Cấu hình Supabase Auth Site URL và redirect allow list cho `${APP_URL}/auth/callback`.
4. Chạy migrations và kiểm tra RLS trước khi mở đăng ký.
5. Kiểm tra negative cases: USER không sửa role/MSSV, không gọi admin action, không sửa dữ liệu người khác; ADMIN không quản trị identity người dùng.
6. Nếu key bị lộ, rotate key trong Supabase rồi cập nhật runtime secrets. Không commit hoặc gửi key qua log/ticket.

## Kiểm chứng SQL và RLS

Sau mỗi migration thay đổi quyền, kiểm tra catalog bằng tài khoản vận hành trong SQL Editor hoặc một kết nối PostgreSQL chỉ đọc. Hai truy vấn này không sửa dữ liệu:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles', 'restaurants', 'categories', 'restaurant_categories',
    'dishes', 'check_ins', 'reviews', 'blog_posts', 'notifications',
    'notification_reads', 'contact_messages', 'site_settings', 'admin_audit_logs'
  )
order by tablename;

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

`rowsecurity` phải là `true` cho cả 13 bảng. Kiểm tra thêm grants và các hàm `SECURITY DEFINER` khi review diff migration; không chỉ dựa vào giao diện ẩn nút. Hàm definer phải có `search_path` cố định, không dùng dynamic SQL từ input và kiểm tra quyền ngay trong hàm nếu đọc dữ liệu vượt RLS, như `admin_analytics()`.

Chạy bộ xác minh chỉ đọc với publishable key sau khi apply schema và seed:

```powershell
node --experimental-strip-types scripts/verify-database.ts
node --experimental-strip-types scripts/verify-database.ts --expect-seed
```

Script xác nhận anon đọc được bảng công khai và search RPC, bị từ chối ở `profiles`, `check_ins`, `notifications`, `contact_messages`, audit log và admin RPC. `--expect-seed` so số lượng quán/món/danh mục, khóa nguồn, giá chưa chuẩn hóa và dữ liệu thiếu. Để kiểm tra RLS của session thật bằng cùng script, đặt tạm `HANU_VERIFY_USER_ACCESS_TOKEN` và `HANU_VERIFY_ADMIN_ACCESS_TOKEN` trong environment của tiến trình; không commit hoặc in token. Token phải thuộc hai account thử nghiệm riêng, không dùng account thật của sinh viên.

Smoke test có ghi chỉ chạy sau khi xác nhận môi trường đích và các dữ liệu cần thiết; script tạo một USER tạm, thử RLS trực tiếp qua Data API, rồi xóa account trong `finally`:

```powershell
npm run test:security -- --remote
```

Lệnh yêu cầu `SUPABASE_SERVICE_ROLE_KEY` và `BOOTSTRAP_ADMIN_1_PASSWORD` ở runtime, một quán active và ít nhất ba notification Blog. Không gộp lệnh này vào `npm test` vì nó thay đổi remote. Nếu cleanup báo lỗi, kiểm tra account thử có prefix `hanu-rls-qa-` trong Supabase Auth trước khi chạy lại.

Các test ghi sau nên chạy trong môi trường local/test với dữ liệu giả và hai session USER khác nhau cùng một ADMIN. Mỗi case phải kiểm tra cả Data API trực tiếp lẫn Server Action liên quan; rollback hoặc xóa dữ liệu thử bằng tài khoản vận hành sau khi test:

| Actor và thao tác | Kết quả cần có |
| --- | --- |
| anon đọc quán/món/review active, category, Blog published; thử đọc inactive/draft | Chỉ bản ghi công khai được trả; search RPC cũng chỉ trả quán active. |
| anon đọc `profiles`, `check_ins`, `notification_reads`, `admin_audit_logs` hoặc gọi `admin_analytics()` | Bị từ chối. |
| USER đọc/sửa profile của mình (`display_name`, `avatar_url`) | Thành công; không đọc profile của người khác. |
| USER update `role`, `student_code`, `id` hoặc gọi hành động admin / ghi `restaurants`, `dishes`, `categories`, `blog_posts` | Bị từ chối, cả khi gửi request thủ công ngoài UI. |
| USER đọc/sửa/xóa check-in hoặc review của USER khác | Không trả hoặc không thay đổi bản ghi nào. |
| USER tạo check-in với dish thuộc quán khác hoặc dish đã inactive | Trigger từ chối. Check-in cũ vẫn giữ nguyên nếu dish sau đó bị ẩn; mở detail không tự tạo check-in. |
| USER tạo review thứ hai cho cùng quán | Unique constraint từ chối; update review của chính mình vẫn được. |
| ADMIN quản lý nội dung và gọi `admin_analytics()` | Thành công và có audit log, nhưng analytics chỉ trả aggregate. |
| ADMIN đọc profile/history riêng của USER khác, sửa review của USER khác, đổi role/password/email USER hoặc gọi user-management route | Bị từ chối hoặc không có route/capability. |
| ADMIN publish Blog draft, sau đó sửa title/excerpt/slug | Có một notification `ALL_USERS`, không phát sinh duplicate; `notification_reads` chỉ ghi trạng thái đọc của chính user. |
| USER đánh dấu cùng notification đã đọc nhiều lần | Có một `notification_reads` row duy nhất; thao tác lặp lại thành công qua upsert bỏ qua duplicate, không cần cấp quyền UPDATE. |
| Search với `max_price_vnd` và món chỉ có `price_text` | Món giá không chắc chắn không lọt bộ lọc numeric; giá gốc vẫn hiển thị hợp lý. |

Nếu dùng SQL Editor để mô phỏng JWT, đặt role/claim trong một transaction thử nghiệm và luôn `ROLLBACK`. Test qua Supabase client với access token thật vẫn cần thiết vì nó còn kiểm tra quyền Data API, grants và luồng cookie. Không chạy test ghi trên dữ liệu production của sinh viên.
