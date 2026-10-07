# Củ Chi Stories: chuyện kể dưới lòng đất

**Củ Chi Stories** là app trải nghiệm di sản theo lối kể chuyện, dành cho khách tham quan trẻ (Gen Z) tại Địa đạo Củ Chi. Người dùng không chỉ *đi xem* di tích mà khám phá từng địa điểm như đang bước vào một câu chuyện. Đi cùng câu chuyện là AR trên di tích thật, mô hình 3D, câu chuyện con người, lựa chọn tình huống và Hộ chiếu Ký ức.

> *Do not just visit history — uncover it.*

App được viết bằng **Expo (React Native, TypeScript, Expo Router)**. Một mã nguồn chạy trên iPhone, Android, iPad và trình duyệt web.

## Chạy thử

Yêu cầu: Node.js 20 trở lên.

```bash
npm install
npx expo start        # quét QR bằng app Expo Go trên điện thoại (cùng mạng Wi-Fi)
npx expo start --web  # mở bản web trên laptop để demo
```

- **Điện thoại:** cài **Expo Go** (App Store / Google Play), rồi quét mã QR hiện trong terminal. Mọi thư viện trong dự án đều có sẵn trong Expo Go nên không cần build riêng.
- **iPad:** mở bằng Expo Go như trên. Màn *Mô hình 3D địa đạo* tự chuyển sang bố cục 3 cột cho máy tính bảng.
- **Web:** `npm run export:web` xuất bản tĩnh vào thư mục `dist/`, có thể đưa lên GitHub Pages, Netlify hoặc Vercel. Bản web vẫn dùng được webcam cho AR.

### Xuất ra một file HTML duy nhất

```bash
npm run export:html   # → dist-html/cu-chi-stories.html (~6 MB)
```

Đây là bản web đóng gói thành **một file `.html`**, gồm JS và toàn bộ ảnh nhúng sẵn. **Bấm đúp là mở**, không cần mạng hay server, và có thể gửi qua email, Zalo hay USB để trình chiếu. Bên trong, app điều hướng bằng `#/đường-dẫn` vì trình duyệt không cho đổi đường dẫn trên trang `file://`. Camera AR trên bản này tuỳ trình duyệt có cho phép hay không; nếu không, app tự dùng ảnh minh hoạ.

Kiểm tra mã: `npm run typecheck` · `npm run lint` · `npm run format`

## Hành trình người dùng

```
PLAN → EXPLORE → DISCOVER → SCAN → UNDERSTAND → LISTEN → INTERACT → COLLECT → REFLECT → SHARE
```

1. **Màn hình chào:** *“Củ Chi — Chuyện kể dưới lòng đất”*, có nút chuyển **VI | EN**.
2. **Chọn hành trình:** Cơ bản, Chuyên sâu, Gia đình hoặc Thử thách. Mỗi hành trình có thời lượng và tuyến điểm riêng.
3. **Chọn người đồng hành:** người nấu ăn, chiến sĩ liên lạc, bác sĩ quân y hoặc người dân địa phương. Đây là *góc nhìn kể chuyện* dựng từ tư liệu, không phải cá nhân lịch sử cụ thể.
4. **Bản đồ nhiệm vụ:** mỗi địa điểm là một *chương*, có 3 trạng thái: Đã khám phá, Đang mở, Chưa mở. Thẻ địa điểm ghi khoảng cách, thời gian đi bộ, thời lượng trải nghiệm và thông tin tiếp cận. Có bộ lọc *Dưới lòng đất / Trên mặt đất / Có Xưa ⟷ Nay*.
   **Chỉ đường** tới từng điểm theo từng bước, dùng được khi không có sóng. Hết một chương, app dẫn sang phần chỉ đường tới chương kế tiếp.
5. **Một chương** đi theo cấu trúc *micro-story*:
   **Hook → Discover (AR) → Understand (3D / Xưa ⟷ Nay) → Human story → Interact → Reflect → Unlock**
6. **AR tại điểm:** camera thật hiển thị di tích, app phủ từng lớp số lên trên: đường viền, cấu trúc bên dưới, cách mở, đường nối vào địa đạo. Chế độ **Nhìn xuyên lòng đất (X-ray)** cho thấy sơ đồ các tầng hầm ngay bên dưới chỗ đứng. Nút **Xưa** phủ dần bản tái hiện lên ngay trên hình camera, có thanh trượt Nay ⟷ Xưa. Nếu không có camera, app dùng ảnh minh hoạ của điểm đó.
7. **Xưa ⟷ Nay:** kéo thanh trượt để so sánh hiện trạng với bản tái hiện. Bản tái hiện luôn gắn nhãn *“Tái hiện lịch sử dựa trên tư liệu hiện có”*.
8. **Câu chuyện con người:** đọc hoặc nghe kể. Bản prototype dùng giọng đọc tổng hợp của máy (TTS) cho tới khi có bản thu thật.
9. **Lựa chọn tình huống:** ví dụ *“Bạn đang sống tại khu căn cứ năm 1967…”*. Sau khi chọn, app không chỉ báo Đúng/Sai mà giải thích người xưa đã làm thế nào.
10. **Suy ngẫm:** viết một câu hoặc chọn nhanh một câu có sẵn. Các câu này được đưa vào thẻ kỷ niệm cuối hành trình.
11. **Hộ chiếu Ký ức:** gồm *Mảnh ký ức*, *Dấu mộc* (tên điểm, giờ, ngày, chương), *Nhật ký* (tự ghi lại thời gian, lựa chọn và câu suy ngẫm ở mỗi chương) và *Thành tựu*: Người tìm dấu khói, Nhà khám phá địa đạo, Người giải mã, Người lắng nghe, Củ Chi Explorer.
12. **Câu chuyện mở khoá:** *“Một ngày dưới lòng đất”* mở sau 3 khu vực dưới lòng đất, *“Tiếng nói Củ Chi”* mở khi hoàn thành cả tuyến.
13. **Thẻ “Hành trình Củ Chi của tôi”:** số địa điểm, câu chuyện, trải nghiệm AR, mảnh ký ức, câu chuyện đọng lại nhất và câu suy ngẫm của chính người dùng. Thẻ chia sẻ được dưới dạng ảnh trên điện thoại.
14. **Mô hình 3D (chế độ iPad):** xoay mô hình địa đạo, bật/tắt Mặt đất và Tầng 1, 2, 3, chạm từng khu vực để xem thông tin.
15. **VR / 360°:** *“Một ngày dưới lòng đất”*. Kéo hoặc nghiêng máy (con quay) để nhìn quanh, chạm điểm sáng để nghe thuyết minh.
16. **Tiện ích:** giờ mở cửa, vé, tiện nghi, lưu ý; **lịch trình theo giờ bắt đầu** (tự tính giờ đến từng điểm, có điểm nghỉ chân); *Khám phá xung quanh*. *Gói hành trình ngoại tuyến*: mọi nội dung đã nằm sẵn trong app nên vẫn chạy khi không có sóng.

17. **Trang chủ web cho máy tính:** mở bản web trên màn hình rộng (từ 1024px) sẽ thấy trang giới thiệu để lên kế hoạch trước chuyến đi, dẫn vào bản đồ, câu chuyện, mô hình 3D và lịch trình.

## Tính xác thực của nội dung

Nguyên tắc cốt lõi: **REAL SITE → DIGITAL LAYER → STORY**, không bao giờ để nội dung số thay thế di tích thật.

Mọi hình ảnh đều khai báo trong [`src/data/media.ts`](src/data/media.ts) với một trong ba loại, và luôn hiện nhãn trên ảnh:

| Loại | Nhãn trong app | Dùng cho |
| --- | --- | --- |
| `real` | Ảnh thật | Ảnh/video đã xác minh, chụp tại Củ Chi |
| `archival` | Tư liệu | Tư liệu lịch sử, ghi rõ nguồn và thời điểm |
| `reconstruction` | Minh hoạ / tái hiện | AR, 3D, ảnh AI hoặc ảnh tái hiện |

> ⚠️ **Toàn bộ ảnh hiện có trong app được cắt từ 5 ảnh concept/mockup do AI tạo** (`assets/concept/`), nên đều gắn nhãn *Minh hoạ / tái hiện*. Không dùng các ảnh này như bằng chứng lịch sử.

**Thay bằng ảnh thật:**

1. Chép ảnh vào `assets/images/` (JPG, cạnh dài khoảng 800–1600px).
2. Sửa mục tương ứng trong `src/data/media.ts`: đổi `source`, đặt `kind: 'real'` hoặc `'archival'` và điền `credit` (nguồn, năm).
3. Nếu muốn cắt lại ảnh từ concept: `python3 scripts/crop_concept_images.py` (cần Pillow).

Nội dung lịch sử trong các chương (`src/data/checkpoints.ts`) được viết ở mức khái quát. **Nhóm cần đối chiếu với tư liệu của Ban quản lý Khu di tích Địa đạo Củ Chi** trước khi dùng chính thức. Giờ mở cửa, giá vé, chỉ dẫn đường đi (`src/data/wayfinding.ts`) và gợi ý *Khám phá xung quanh* chỉ là dữ liệu mẫu.

## Cấu trúc mã nguồn

```
src/
  app/                       # màn hình (Expo Router — mỗi file là một route)
    index.tsx                # màn hình chào
    journey.tsx, companion.tsx
    (tabs)/                  # Bản đồ · Câu chuyện · AR quét · Hộ chiếu · Tiện ích
    chapter/[id].tsx         # một chương: Hook → … → Unlock
    ar/[id].tsx              # camera AR + lớp phủ + X-ray
    past-present/[id].tsx    # thanh trượt Xưa ⟷ Nay
    explorer.tsx             # mô hình 3D địa đạo (iPad)
    vr.tsx                   # trải nghiệm 360°
    story/[id].tsx           # đọc / nghe câu chuyện
    souvenir.tsx             # thẻ "Hành trình Củ Chi của tôi"
    directions/[id].tsx      # chỉ đường ngoại tuyến tới một điểm
  data/                      # nội dung song ngữ: checkpoints, journeys, companions, achievements, media
  store/progress.ts          # tiến độ (zustand + AsyncStorage, lưu trên máy)
  i18n/                      # chuỗi giao diện VI/EN
  components/                # UI, bản đồ, lớp AR, sơ đồ X-ray, mô hình 3D (three.js)
assets/concept/              # 5 ảnh concept gốc
assets/images/               # ảnh dùng trong app (cắt từ concept)
scripts/crop_concept_images.py
```

**Thêm một địa điểm:** thêm một mục vào `checkpoints` trong `src/data/checkpoints.ts` (nội dung `vi`/`en`, vị trí trên bản đồ, các lớp AR, câu hỏi, mảnh ký ức), rồi thêm `id` đó vào `route` của hành trình mong muốn trong `src/data/journeys.ts`.

## Giới hạn của prototype

- AR là **AR mô phỏng**: camera thật cộng lớp phủ 2D, chưa neo vật thể 3D vào không gian. Bước tiếp theo có thể dùng ARKit/ARCore (development build) với marker hình ảnh tại từng điểm.
- Việc nhận biết “đã đến nơi” đang dùng nút *Tôi đã đến nơi*. Bản thật dùng GPS hoặc mã nhận diện tại điểm.
- Thuyết minh dùng giọng đọc tổng hợp của thiết bị. Chất lượng giọng tiếng Việt tuỳ máy.
- Tab *Tiện ích* có **Chế độ demo** để mở mọi địa điểm khi trình bày.
