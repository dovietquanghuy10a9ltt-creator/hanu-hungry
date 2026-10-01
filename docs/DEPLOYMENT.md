# Triển khai HANU Hungry

Project Vercel `hanu-hungry` liên kết với repository GitHub hiện tại. Branch production là `main`; branch `codex/full-stack-implementation` và pull request của nó dùng để tạo Preview. Không merge khi các cổng kiểm thử bên dưới chưa đạt.

## Preview

1. Đặt `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ở scope **Preview** trong Vercel. Đây là hai giá trị public; RLS vẫn là lớp kiểm soát quyền dữ liệu.
2. Push branch PR để Git integration tạo Preview. Kiểm tra deployment có `target=preview` trước khi dùng URL. Không dùng CLI direct deploy cho lần triển khai đầu của project: phiên bản CLI hiện tại có thể gắn nhầm `target=production` kể cả khi truyền `--target=preview`.
3. Thêm URL callback chính xác của deployment vào Supabase Auth redirect allow list: `https://<preview-host>/auth/callback`. Giữ `http://localhost:3000/auth/callback` cho local. Chỉ đặt Supabase Site URL thành domain production khi domain đó đã được chốt.
4. Kiểm tra trang chủ, tìm kiếm, quán, món, Blog, Gacha, các route bảo vệ, đăng nhập ADMIN và quyền thao tác trên Preview; xem logs Vercel nếu có lỗi runtime.

`SUPABASE_SERVICE_ROLE_KEY` cần ở runtime server để đăng nhập bằng MSSV và đối chiếu email–MSSV khi khôi phục mật khẩu. Thêm key ở scope Preview khi kiểm thử; không thêm tiền tố `NEXT_PUBLIC_` và không đưa key vào client bundle. Không thêm hai `BOOTSTRAP_ADMIN_*_PASSWORD` vào Vercel; các biến đó chỉ dùng cho script bootstrap ngoài deployment.

## Trước production

- Cấu hình custom SMTP cho Supabase Auth, xác nhận domain người gửi và kiểm thử đăng ký, xác nhận email, quên/đặt lại mật khẩu từ Preview.
- Xác minh USER/ADMIN, RLS, notification, responsive và Vercel logs trên Preview; chạy `npm test`, `npm run lint`, `npm run build` với commit sẽ merge.
- Đặt `APP_URL` HTTPS chính xác và hai public Supabase env cho Production; cấu hình Supabase Site URL và callback allow list theo domain production.
- Chỉ merge PR và đưa Production phục vụ người dùng sau khi các kiểm tra trên đạt.

Không đưa service-role key, password, access token hoặc nội dung `.env.local` vào Git, log hay tài liệu.
