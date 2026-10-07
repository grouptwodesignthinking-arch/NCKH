# Kiểm tra bàn giao — 07/10/2026

- Kiểm tra cú pháp JavaScript: đạt.
- Mở bản frontend kèm máy chủ và bản HTML nhúng độc lập: đạt.
- UI: chọn hành trình, mở chương đầu, chọn đáp án, nhận dấu +50 điểm: đạt.
- Tiến trình dấu vẫn hiện sau tải lại: đạt.
- Nhập CC-99 hiện lỗi; dùng CC-01 mở đúng chương: đạt.
- AR: đổi hotspot thay đổi nội dung chú thích: đạt.
- Bàn biên tập lưu nội dung vào backend: đạt, trạng thái thành công được xác minh trong UI.
- Backend: đọc 6 câu chuyện, ghi có token hợp lệ, đọc lại nội dung; từ chối thiếu token, Origin ngoài, đáp án sai schema; không phục vụ DB; chặn đường dẫn thoát thư mục assets: đạt.
- Bản cuối ở chiều rộng CSS 360px: trang chủ, hành trình, bản đồ, thư viện, đọc chuyện, hộ chiếu, quét, AR, quản lý, biên tập và explorer đều không tràn trang ngang, không có ảnh lỗi.
- Xem trực quan trang chủ, AR, hộ chiếu, quản lý tại chiều rộng điện thoại; trang chủ ở 863px: đạt.
- (Bộ chữ cũ, đã thay ở bản cập nhật bên dưới.) Kiểm tra logo, nền giấy và màu trên bản HTML cuối.

Chưa kiểm thử bằng camera vật lý, mã QR thật trên iOS/Android, giọng đọc tiếng Việt trên từng thiết bị, hoặc offline trên mọi trình xem file. AR hiện là lớp chú thích mô phỏng, không có tracking; không có VR 360° thực. Nội dung lịch sử chưa được thẩm định chuyên môn.

## Cập nhật — font & AR/quét

Kiểm thử tự động bằng Chromium với camera giả: video có mã QR CC-03 in trên ảnh, di chuyển và xoay. Chạy trên cả bản HTML độc lập (file://) và `server.py`, mỗi bản 18/18 mục đạt:

- Font: tiêu đề NVN Marseille Vintage, nội dung 1FTV VIP Longevity, cả hai đã tải; trên trang chỉ còn hai họ font này.
- Nhập mã: CC-99 báo lỗi; “cc01” mở chương CC-01.
- Quét QR bằng camera (Chromium Linux không có BarcodeDetector, nên chạy bằng jsQR) mở đúng chương CC-03, camera tắt sau đó.
- AR trên chương CC-03: trạng thái chuyển sang “Đang bám mã CC-03”; hotspot di chuyển theo mã; chạm hotspot vẫn đổi chú thích; rời màn AR thì camera dừng.
- AR trên chương CC-01 khi camera thấy mã CC-03: báo “mã của trạm khác”, hotspot giữ vị trí cố định.
- Ẩn tab thì camera được giải phóng.
- Luồng chính không đổi: trả lời đúng mở hộp nhận dấu, hộ chiếu có dấu. Không có lỗi JavaScript.

Chưa kiểm thử trên iPhone/Android thật với mã QR in thật, và với BarcodeDetector gốc (Chrome Android/macOS).

## Cập nhật — bản đồ 3D, VR, vật thể AR

Kiểm thử tự động bằng Chromium (WebGL SwiftShader, camera giả có mã QR CC-03 di chuyển/xoay). Chạy trên bản HTML độc lập (file://), `server.py` và đường dẫn con `/NCKH/` như GitHub Pages: mỗi bản 21/21 mục 3D đạt, và bộ 18 mục cũ vẫn đạt:

- Bản đồ 3D vẽ ra nội dung; 6 nhãn trạm; chạm nhãn mở thông tin trạm; kéo để xoay; tắt lớp Mặt đất ẩn nhãn trên mặt đất; chọn trạm từ danh sách.
- AR bản đồ: bật camera, mô hình bám mã CC-03.
- Màn AR: xem trước vật thể 3D khi chưa bật camera; khi bám mã, vật thể hiện trên mã.
- VR: cả 6 cảnh vẽ ra với đủ số điểm; chạm điểm hiện chú thích; kéo để nhìn quanh; chế độ kính VR; đường hầm giữ nút để đi tới.
- Quét mã: vật thể bật ra rồi mở đúng chương. Không có lỗi JavaScript.

Chưa thử trên iPhone/Android thật: hiệu năng WebGL, con quay (iOS cần cho phép Motion & Orientation khi bấm nút), toàn màn hình/xoay ngang ở chế độ kính VR (Safari iOS không hỗ trợ Fullscreen API cho trang thường, vẫn chia đôi màn hình được).
