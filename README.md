# Hệ Thống Quản Lý Kho Linh Kiện Máy Tính

Hệ thống quản lý kho toàn diện cho linh kiện máy tính với các giao diện riêng biệt dành cho quản trị viên, nhân viên và khách hàng.

## Tính Năng

### Giao Diện Quản Trị Viên (Admin)

- Bảng điều khiển với các chỉ số và biểu đồ quan trọng
- Quản lý sản phẩm (thêm, sửa, xóa)
- Quản lý kho (nhập kho, xuất kho, điều chỉnh)
- Kiểm kê và đối chiếu kho
- Quản lý đơn hàng
- Quản lý người dùng
- Báo cáo và phân tích

### Giao Diện Nhân Viên (Staff)

- Bảng điều khiển với công việc và thông báo
- Xem và quản lý kho
- Xử lý đơn hàng
- Thực hiện kiểm kê kho

### Giao Diện Khách Hàng (Customer)

- Duyệt sản phẩm theo danh mục
- Tìm kiếm sản phẩm
- Xem chi tiết sản phẩm
- Thêm vào giỏ hàng
- Thanh toán và đặt hàng
- Theo dõi trạng thái đơn hàng
- Quản lý thông tin cá nhân

## Công Nghệ Sử Dụng

- **Frontend**: React.js, Bootstrap, Chart.js
- **Backend**: Node.js, Express.js
- **Cơ sở dữ liệu**: MySQL
- **Xác thực**: JWT (JSON Web Tokens)

## Yêu Cầu Hệ Thống

- Node.js (v14 trở lên)
- MySQL (v5.7 trở lên)

## Hướng Dẫn Cài Đặt

### 1. Cài đặt các gói phụ thuộc

```bash
npm run install:all
```

Lệnh này sẽ cài đặt tất cả các gói phụ thuộc cần thiết cho cả frontend và backend.

### 2. Thiết lập cơ sở dữ liệu

Tạo file `.env` trong thư mục backend với nội dung sau:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=quanlykho
JWT_SECRET=quanlykho_secret_key
NODE_ENV=development
```

Tạo cơ sở dữ liệu MySQL tên `quanlykho`:

```sql
CREATE DATABASE quanlykho;
```

Khởi tạo cơ sở dữ liệu với dữ liệu mẫu:

```bash
npm run init-db
```

### 3. Chạy ứng dụng

Để chạy cả frontend và backend cùng lúc:

```bash
npm start
```

Hoặc chạy riêng biệt:

- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`

Sau khi khởi động, bạn có thể truy cập:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Tài Khoản Mặc Định

Sau khi khởi tạo cơ sở dữ liệu, bạn có thể đăng nhập với các tài khoản sau:

- **Quản trị viên (Admin)**:

  - Email: admin@example.com
  - Mật khẩu: admin123

- **Nhân viên (Staff)**:

  - Email: staff@example.com
  - Mật khẩu: staff123

- **Khách hàng (Customer)**:
  - Email: customer@example.com
  - Mật khẩu: customer123

## Cấu Trúc Dự Án

```
quanlykho/
├── backend/
│   ├── config/         # Cấu hình cơ sở dữ liệu và khởi tạo
│   ├── controllers/    # Bộ điều khiển API
│   ├── middleware/     # Middleware xác thực và phân quyền
│   ├── models/         # Mô hình dữ liệu
│   ├── routes/         # Định tuyến API
│   ├── uploads/        # Thư mục lưu trữ file tải lên
│   ├── .env            # Biến môi trường
│   ├── index.js        # Điểm khởi đầu
│   └── package.json    # Phụ thuộc backend
│
├── frontend/
│   ├── public/         # File tĩnh
│   ├── src/
│   │   ├── components/ # Các component React
│   │   │   ├── admin/  # Giao diện quản trị viên
│   │   │   ├── staff/  # Giao diện nhân viên
│   │   │   ├── customer/ # Giao diện khách hàng
│   │   │   └── auth/   # Xác thực
│   │   ├── context/    # Context React
│   │   ├── services/   # Dịch vụ API
│   │   ├── utils/      # Tiện ích
│   │   ├── App.jsx     # Component chính
│   │   └── main.jsx    # Điểm khởi đầu
│   ├── index.html      # Template HTML
│   └── package.json    # Phụ thuộc frontend
│
├── package.json        # Script chạy toàn bộ dự án
└── README.md           # Tài liệu dự án
```

## Quy Trình Chính

### 1. Quy trình nhập kho

1. Nhân viên tạo phiếu nhập kho mới
2. Chọn nhà cung cấp, ngày nhập
3. Thêm sản phẩm, số lượng, giá nhập
4. Lưu phiếu nhập (trạng thái chờ phê duyệt)
5. Admin xem xét và phê duyệt phiếu nhập
6. Khi được phê duyệt, hệ thống tự động cập nhật số lượng tồn kho
7. Hệ thống lưu lại lịch sử nhập kho

### 2. Quy trình xử lý đơn hàng

1. Khách hàng đặt hàng
2. Hệ thống tạo đơn hàng mới
3. Admin/nhân viên xem và xác nhận đơn hàng
4. Nhân viên kiểm tra tồn kho và chuẩn bị hàng
5. Nhân viên tạo phiếu xuất kho (cần Admin phê duyệt)
6. Admin phê duyệt phiếu xuất kho
7. Hệ thống cập nhật trạng thái đơn hàng và số lượng tồn kho

### 3. Quy trình kiểm kê kho

1. Admin tạo đợt kiểm kê mới
2. Chọn sản phẩm cần kiểm kê
3. Nhân viên nhập số lượng thực tế
4. Hệ thống tính toán chênh lệch
5. Admin xác nhận và điều chỉnh số lượng trong hệ thống
6. Hệ thống lưu lại lịch sử kiểm kê

## Giấy Phép

Dự án này được cấp phép theo Giấy phép MIT - xem file LICENSE để biết chi tiết.

## Công Nghệ Sử Dụng

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Chart.js](https://www.chartjs.org/)
