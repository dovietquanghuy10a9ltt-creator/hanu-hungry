# HANU Hungry 🍜

> **Bản đồ ẩm thực và cẩm nang ăn uống dành cho sinh viên Đại học Hà Nội (HANU).**

---

## 🌟 Giới thiệu

**HANU Hungry** là ứng dụng web giúp sinh viên Đại học Hà Nội và giới trẻ xung quanh khu vực Thanh Xuân dễ dàng khám phá quán ăn, món ngon, quán nước và đồ ăn vặt. Mọi dữ liệu về quán và thực đơn đều được thu thập và đóng góp từ khảo sát thực tế của sinh viên HANU.

---

## 🚀 Tính năng nổi bật

- 🔍 **Khám phá & Tìm kiếm thông minh**: Tìm quán theo tên, món ăn, danh mục hoặc khoảng giá phù hợp với túi tiền sinh viên.
- 🎲 **Vòng quay Gacha**: Tính năng chọn quán ngẫu nhiên giúp giải quyết câu hỏi muôn thuở *"Hôm nay ăn gì?"*.
- 🔥 **Chuỗi ngày ăn uống (Streak)**: Duy trì ngọn lửa chuỗi ngày ăn uống và check-in ẩm thực đều đặn.
- 🗺️ **Chỉ đường Google Maps**: Mở định vị chỉ đường trực tiếp tới quán ăn một cách nhanh chóng.
- ⭐ **Đánh giá cộng đồng**: Đánh giá số sao và chia sẻ cảm nhận chân thật về món ăn, không gian và chất lượng phục vụ.
- 📰 **Blog & Bản tin**: Tổng hợp các bài viết review quán mới, mẹo ăn ngon - bổ - rẻ quanh khu vực trường.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Supabase](https://supabase.com/) (Auth, PostgreSQL Database, Storage)
- **Deployment**: [Vercel](https://vercel.com/) & Vercel Web Analytics

---

## 💻 Cài đặt & Chạy ứng dụng

### Yêu cầu môi trường
- [Node.js](https://nodejs.org/) (phiên bản 20 trở lên)
- Trình quản lý gói `npm`

### Các bước cài đặt

1. **Clone mã nguồn:**
   ```bash
   git clone https://github.com/dovietquanghuy10a9ltt-creator/hanu-hungry.git
   cd hanu-hungry
   ```

2. **Cài đặt các thư viện phụ thuộc:**
   ```bash
   npm install
   ```

3. **Thiết lập biến môi trường:**
   Tạo file `.env.local` dựa trên file mẫu `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   *Điền các thông tin kết nối Supabase của bạn vào `.env.local`.*

4. **Khởi chạy máy chủ phát triển (Development):**
   ```bash
   npm run dev
   ```
   Truy cập vào [http://localhost:3000](http://localhost:3000) trên trình duyệt để trải nghiệm ứng dụng.

5. **Xây dựng bản chạy chính thức (Production Build):**
   ```bash
   npm run build
   npm start
   ```

---

## 👥 Đội ngũ phát triển

Dự án được xây dựng và phát triển bởi **Macaron Team** – Sinh viên Đại học Hà Nội.  
Mọi góp ý và phản hồi xin vui lòng liên hệ qua trang **Liên hệ** trên website.
