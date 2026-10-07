# Bàn giao nối tiếp AR — Củ Chi Stories

Yêu cầu: giữ nguyên hướng thiết kế, logo, bảng màu olive và nền giấy nhám. Typography: NVN Marseille Vintage cho title/subtitle (`--serif`, `--sub`), 1FTV VIP Longevity cho text (`--sans`); cả hai đủ dấu tiếng Việt. Giữ nguyên luồng app. Bổ sung khả năng AR thực vào các màn đã có. Không biến trạng thái mô phỏng thành thông báo nhận diện giả.

## Điểm nối

Frontend vanilla JS, hash router. `arPage(id)` dựng lớp ảnh/camera + hotspot; `startCamera()` quản lý camera, bộ đọc QR (`createQrReader()`: BarcodeDetector, nếu không có thì jsQR) và vòng bám mã trên màn AR (`markerPose()`, `placeHotspots()`); `stopCamera()` dọn stream và vòng lặp khi đổi màn hình. `scanPage()` có nhập mã dự phòng. Asset loader `asset(name)` dùng URL tệp hoặc data URI của bản HTML.

Station mapping:
- CC-01 → nap-ham
- CC-02 → lo-thong-hoi
- CC-03 → bep-hoang-cam
- CC-04 → long-dia-dao
- CC-05 → dau-tich
- CC-06 → loi-rung

QR nhận mã CC-01 … CC-06, kể cả khi nội dung QR là đường dẫn có chứa mã; chỉ đối chiếu với danh sách trạm, không tự mở URL không tin cậy. BarcodeDetector được kiểm tra hỗ trợ trước khi dùng; nếu không có thì dùng jsQR 1.4.0 (Apache-2.0, `assets/jsQR.js`, nhúng vào bản HTML).

## Phần cần phát triển

1. Chọn tracking marker/image hoặc WebXR phù hợp thiết bị đích và dữ liệu thực; xác nhận yêu cầu vận hành trên iOS/Android.
2. Cần marker/image targets, ảnh target được duyệt, mô hình GLB/glTF có phép sử dụng, vị trí/tỷ lệ đặt model và nội dung thuyết minh chính xác. Bộ hiện tại chưa có dữ liệu hiệu chuẩn này.
3. ✅ Đã tách trạng thái: chưa bật → đang chờ quyền → đang tìm mã → đang bám mã / mã của trạm khác → mất dấu → lỗi (không quyền, không camera, camera bận, cần HTTPS). Chỉ báo “Đang bám”/“Đã đọc mã” khi bộ đọc QR trả kết quả.
4. ✅ Một phần: hotspot được neo theo 4 góc của mã trạm trong khung hình (vị trí, tỷ lệ, xoay; affine 2D, có làm mượt), toạ độ video được quy đổi theo object-fit: cover. Mất mã quá 800 ms thì trở về vị trí cố định. Đây là bám marker 2D trên màn hình, chưa phải world/object transform 3D; muốn neo 3D cần WebXR hoặc image tracking với target đã hiệu chuẩn (mục 1–2).
5. Không cộng điểm do camera được mở. Tiến trình hiện chỉ nhận khi trả lời đúng; nếu thêm nhiệm vụ thực địa, cần xác định bằng chứng và chống cộng trùng.
6. ✅ Một phần: camera dừng khi đổi màn hình, ẩn tab (visibilitychange), pagehide và khi track bị ngắt; ràng buộc camera sau quá thử lại với video:true; có thông báo lỗi riêng cho từng trường hợp. Còn cần thử trên thiết bị thật: xoay máy, iOS/Android, mã in thật.
7. Nếu thêm trước–sau lịch sử cần cặp tư liệu thật tương ứng và nguồn. Màn compare hiện chỉ là sepia / ảnh gốc, nhãn phải giữ đúng.
8. Nếu thêm VR 360° cần panorama equirectangular hoặc video VR thực; ảnh phẳng không được gọi là 360°. ✅ Đã có cảnh VR **dựng 3D** (không phải 360° chụp thật) cho 6 trạm, ghi nhãn “Mô hình minh họa”.
9. ✅ Bản đồ 3D, VR và vật thể AR nằm trong `assets/cuchi3d.js` (`CuChi3D.createMap`, `createVR`, `createARObject`; dữ liệu trạm `CuChi3D.stations`). app.js gắn chúng qua `mount3D()` / `unmount3D()` mỗi lần render; màn AR gọi `setLive(true)` sau khi có bộ đọc QR, `setPose(pose)` khi đang bám, `setPose(null)` khi mất mã. Muốn thay bằng mô hình GLB/glTF thật: giữ API này, đổi hàm `build*` của trạm thành loader (cần GLTFLoader và mô hình có phép sử dụng). Kích thước mô hình quy ước ~1 đơn vị trên mặt mã.

## Backend hiện có

Python standard library, SQLite, chỉ localhost. GET /api/content trả app, stories, csrf; PUT cùng endpoint cần X-CSRF-Token, xác thực schema, giữ id/code/image/category cố định. Không có đăng nhập/phân quyền production. Không đưa lên public nguyên trạng. Hộ chiếu nằm trong localStorage `cuchi-stories-v3`, nội dung sửa khi chạy file nằm ở `cuchi-stories-v3-content`.

## Giữ nguyên trải nghiệm

Trang chủ → hành trình → story/:id → quiz/reward → passport. AR là nhánh khám phá có đường về câu chuyện. 6 dấu, 50 điểm/trạm, không cộng trùng; không mất trạng thái khi đổi hành trình. Mobile bottom bar, khoảng chạm đủ lớn, nhãn lỗi rõ ràng. Tài liệu nguồn ảnh đi cùng sản phẩm.
