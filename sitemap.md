# MÔ TẢ SITE MAP HỆ THỐNG WEB THƯ VIỆN (LMS)

## 1. Tổng quan hệ thống

Hệ thống là một **Web-based Library Management System (LMS)**, được thiết kế theo mô hình **phân quyền theo vai trò (Role-Based Access Control)**. Hệ thống phục vụ ba nhóm người dùng chính:

* **Admin** – Quản trị hệ thống
* **Librarian (Thủ thư)** – Nhân viên vận hành nghiệp vụ thư viện
* **Member (Độc giả)** – Người dùng cuối sử dụng dịch vụ thư viện

Trang **HOME** là điểm truy cập trung tâm của hệ thống. Sau khi đăng nhập, người dùng sẽ được điều hướng đến dashboard tương ứng với vai trò của mình.

---

## 2. HOME (Trang chủ)

* Trang landing page của hệ thống LMS
* Hiển thị thông tin giới thiệu ngắn gọn về thư viện
* Cung cấp lối truy cập đến:

  * Login / Registration
  * Dashboard theo từng vai trò (sau khi đăng nhập)

---

## 3. Login / Registration Module

### 3.1 Chức năng chung

* Xác thực người dùng (Authentication)
* Phân quyền truy cập (Authorization)
* Điều hướng người dùng đến dashboard phù hợp sau khi đăng nhập thành công

### 3.2 Các loại đăng nhập

#### Admin Login

* Dành cho quản trị hệ thống
* Có toàn quyền quản lý và cấu hình hệ thống

#### Librarian Login

* Dành cho nhân viên thư viện
* Thực hiện các nghiệp vụ mượn – trả – đặt trước sách

#### Member Login

* Dành cho độc giả
* Sử dụng các dịch vụ tìm kiếm, mượn, đặt trước và thanh toán

---

## 4. Admin Dashboard

### 4.1 Mục đích

Dashboard dành cho **quản trị viên**, tập trung vào quản lý hệ thống, nhân sự và giám sát hoạt động tổng thể.

### 4.2 Các phân hệ chức năng

#### 4.2.1 Manage Staff

* Thêm, sửa, khóa tài khoản nhân viên
* Phân quyền vai trò (Admin / Librarian)
* Theo dõi trạng thái hoạt động

#### 4.2.2 Manage Books

* Quản lý thông tin sách
* Thêm, cập nhật, xóa sách
* Quản lý các bản sao sách (Book Copies)

#### 4.2.3 Manage Orders

* Quản lý đơn nhập sách
* Theo dõi trạng thái đơn hàng
* Liên kết với nhà cung cấp

#### 4.2.4 Manage Supplier

* Quản lý thông tin nhà cung cấp
* Theo dõi hiệu suất cung ứng
* Phục vụ báo cáo đánh giá

#### 4.2.5 View Reports

* Xem các báo cáo tổng hợp:

  * Sách được mượn nhiều
  * Hoạt động thành viên
  * Hiệu suất nhà cung cấp

#### 4.2.6 Audit & Monitor

* Theo dõi nhật ký hệ thống (Audit Log)
* Ghi nhận các thao tác cập nhật dữ liệu
* Phục vụ kiểm tra và đảm bảo an toàn hệ thống

#### 4.2.7 System Configuration

* Cấu hình tham số hệ thống:

  * Thời hạn mượn sách
  * Mức phạt quá hạn
  * Quy định mượn – trả

---

## 5. Librarian Dashboard

### 5.1 Mục đích

Dashboard dành cho **thủ thư**, tập trung vào các nghiệp vụ vận hành thư viện hằng ngày.

### 5.2 Các phân hệ chức năng

#### 5.2.1 Manage Books

* Cập nhật thông tin sách
* Quản lý trạng thái bản sao
* Theo dõi tồn kho

#### 5.2.2 Manage Circulation

* Xử lý mượn sách
* Xử lý trả sách (Transaction)
* Gia hạn thời gian mượn

#### 5.2.3 Manage Reservations

* Quản lý danh sách đặt trước
* Hoàn tất đặt trước (Reservation Fulfillment)
* Điều chỉnh hàng đợi đặt sách

#### 5.2.4 Manage Members

* Xem thông tin thành viên
* Theo dõi lịch sử mượn sách
* Hỗ trợ xử lý vi phạm

#### 5.2.5 Manage Fines

* Quản lý tiền phạt
* Ghi nhận thanh toán
* Theo dõi công nợ

#### 5.2.6 View Reports

* Xem báo cáo nghiệp vụ thư viện

---

## 6. Member Dashboard

### 6.1 Mục đích

Dashboard dành cho **độc giả**, tập trung vào trải nghiệm và các chức năng tự phục vụ.

### 6.2 Các phân hệ chức năng

#### 6.2.1 View Profile

* Xem và cập nhật thông tin cá nhân
* Kiểm tra trạng thái tài khoản

#### 6.2.2 Search Books

* Tìm kiếm sách theo nhiều tiêu chí
* Xem tình trạng sẵn có của sách

#### 6.2.3 Borrow Books

* Thực hiện mượn sách khi có sẵn
* Xem hạn trả sách

#### 6.2.4 Reserve Books

* Đặt trước sách khi hết bản sao
* Tham gia hàng đợi đặt trước

#### 6.2.5 Renew Loans

* Gia hạn thời gian mượn sách (nếu đủ điều kiện)

#### 6.2.6 View Loan History

* Xem lịch sử mượn – trả sách
* Theo dõi trạng thái các lượt mượn

#### 6.2.7 Pay Fines

* Thanh toán tiền phạt
* Xem lịch sử thanh toán

#### 6.2.8 View Notifications

* Nhận thông báo từ hệ thống:

  * Sắp đến hạn trả
  * Sách đặt trước đã sẵn sàng
  * Xác nhận giao dịch

---

## 7. Nguyên tắc thiết kế hệ thống

* Chức năng hiển thị theo đúng vai trò người dùng
* Các thao tác cập nhật dữ liệu quan trọng được thực hiện trong **transaction**
* Mọi thay đổi dữ liệu đều được ghi nhận trong **audit log**
* Giao diện web chỉ đóng vai trò lớp trình bày, logic nghiệp vụ xử lý tại backend và database

---

## 8. Mục tiêu sử dụng tài liệu

Tài liệu này dùng để:

* Định hướng xây dựng giao diện web LMS
* Hỗ trợ AI hoặc lập trình viên hiểu rõ cấu trúc và chức năng hệ thống
* Làm phần mô tả thiết kế hệ thống trong báo cáo đồ án CSDL / MIS / SE
