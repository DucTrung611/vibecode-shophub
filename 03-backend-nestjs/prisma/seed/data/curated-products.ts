/** Real, recognizable product names per category — used to supplement the external
 * API sources so total volume reaches the target without falling back to
 * faker.commerce.productName()-style generated gibberish. Multiple shops legitimately
 * list the same real product name (e.g. many sellers carry "iPhone 15"), so reuse
 * across sellers is realistic, not a bug. */

/** The genuine book titles within `sach-van-phong-pham` (as opposed to the
 * stationery items in that same category) — used to look up real cover art via
 * Open Library, see lib/external-products.ts#fetchBookCovers. Most of these are
 * Vietnamese translations of internationally published books; Open Library's
 * catalog is overwhelmingly English/Western, so searching by the *original*
 * title+author (`BOOK_COVER_SEARCH_QUERY`) finds a real cover far more reliably
 * than searching the Vietnamese title directly. The two Vietnamese-original
 * bestsellers ("Tuổi Trẻ Đáng Giá Bao Nhiêu", "Cà Phê Cùng Tony") have no reliable
 * English-market equivalent and are seeded without a cover rather than a guess. */
export const BOOK_TITLES = [
  'Đắc Nhân Tâm - Dale Carnegie',
  'Nhà Giả Kim - Paulo Coelho',
  'Tuổi Trẻ Đáng Giá Bao Nhiêu',
  'Cà Phê Cùng Tony',
  'Muôn Kiếp Nhân Sinh',
  'Sapiens Lược Sử Loài Người',
  'Atomic Habits - Thay Đổi Tí Hon Hiệu Quả Bất Ngờ',
  'Nghĩ Giàu Làm Giàu',
];

export const BOOK_COVER_SEARCH_QUERY: Record<string, string> = {
  'Đắc Nhân Tâm - Dale Carnegie': 'How to Win Friends and Influence People Dale Carnegie',
  'Nhà Giả Kim - Paulo Coelho': 'The Alchemist Paulo Coelho',
  'Sapiens Lược Sử Loài Người': 'Sapiens Yuval Noah Harari',
  'Atomic Habits - Thay Đổi Tí Hon Hiệu Quả Bất Ngờ': 'Atomic Habits James Clear',
  'Nghĩ Giàu Làm Giàu': 'Think and Grow Rich Napoleon Hill',
  // 'Muôn Kiếp Nhân Sinh' deliberately has no mapping — it's presented as based on
  // real events via Nguyên Phong, not a confirmed direct translation of a specific
  // English title, so guessing a query risks attaching the wrong book's cover.
};

export const CURATED_PRODUCTS: Record<string, string[]> = {
  'dien-thoai-phu-kien': [
    'iPhone 15 Pro Max 256GB', 'iPhone 15 128GB', 'iPhone 14 128GB', 'iPhone 13 128GB',
    'Samsung Galaxy S24 Ultra', 'Samsung Galaxy S23 FE', 'Samsung Galaxy A55 5G',
    'Samsung Galaxy A35', 'Xiaomi 14', 'Xiaomi Redmi Note 13 Pro', 'Xiaomi Redmi 13C',
    'OPPO Reno11 F', 'OPPO A79', 'OPPO Find X7', 'Vivo V30', 'Vivo Y36',
    'Realme 12 Pro+', 'Ốp lưng iPhone 15 Pro Max chống sốc', 'Cường lực Samsung S24',
    'Tai nghe Bluetooth AirPods Pro 2', 'Tai nghe không dây JBL Tune 720BT',
    'Sạc dự phòng Anker 20000mAh', 'Cáp sạc nhanh USB-C 100W', 'Củ sạc nhanh 20W Apple',
    'Giá đỡ điện thoại để bàn', 'Gậy chụp ảnh tripod Bluetooth', 'Loa Bluetooth JBL Flip 6',
    'Đồng hồ thông minh Apple Watch Series 9', 'Đồng hồ thông minh Xiaomi Smart Band 8',
  ],
  'laptop-may-tinh': [
    'MacBook Air M2 13 inch', 'MacBook Pro 14 M3', 'Dell Inspiron 15 3520',
    'Dell XPS 13', 'Asus Vivobook 15 X1504', 'Asus ROG Strix G16', 'Lenovo IdeaPad Slim 3',
    'Lenovo ThinkPad E14', 'HP Pavilion 15', 'HP Envy x360', 'Acer Aspire 5',
    'Acer Nitro 5 Gaming', 'MSI Modern 14', 'iPad Gen 10 64GB', 'iPad Air M2',
    'Samsung Galaxy Tab S9 FE', 'Chuột không dây Logitech M331', 'Bàn phím cơ Akko 3068',
    'Màn hình LG 24 inch FullHD', 'Ổ cứng SSD Samsung 970 EVO 1TB', 'RAM Kingston 16GB DDR4',
    'Balo laptop chống nước Mikkor', 'Webcam Logitech C920', 'Tai nghe chụp tai Logitech G435',
  ],
  'thoi-trang-nam': [
    'Áo thun nam cotton basic', 'Áo sơ mi nam công sở dài tay', 'Áo polo nam form regular',
    'Quần jean nam slim fit', 'Quần kaki nam ống suông', 'Quần short nam kaki',
    'Áo khoác bomber nam', 'Áo khoác gió nam 2 lớp', 'Áo len nam cổ tròn',
    'Quần tây nam công sở', 'Áo vest nam slim fit', 'Đồ bộ nam mặc nhà cotton',
    'Áo hoodie nam nỉ bông', 'Quần jogger nam thể thao', 'Thắt lưng da nam',
    'Ví da nam cầm tay', 'Cà vạt nam họa tiết', 'Mũ lưỡi trai nam basic',
  ],
  'thoi-trang-nu': [
    'Váy đầm nữ công sở', 'Váy hoa nữ dáng xòe', 'Chân váy nữ xếp ly',
    'Áo kiểu nữ tay phồng', 'Áo croptop nữ basic', 'Quần jean nữ ống loe',
    'Set đồ nữ mặc nhà', 'Áo khoác cardigan nữ', 'Áo len nữ cổ lọ',
    'Đầm maxi nữ đi biển', 'Áo sơ mi nữ tay dài', 'Quần culottes nữ ống rộng',
    'Túi xách nữ da PU', 'Túi đeo chéo nữ mini', 'Vòng cổ nữ thời trang',
    'Khuyên tai nữ đính đá', 'Kính mát nữ thời trang', 'Khăn lụa nữ họa tiết',
  ],
  'giay-dep': [
    'Giày sneaker nam trắng basic', 'Giày thể thao nam chạy bộ', 'Giày lười nam da',
    'Dép quai ngang nam', 'Giày sandal nam', 'Giày cao gót nữ 7cm',
    'Giày búp bê nữ đế bằng', 'Giày sneaker nữ trắng', 'Dép xỏ ngón nữ',
    'Giày boot nữ cổ cao', 'Giày thể thao nữ chạy bộ', 'Giày da nam công sở',
    'Nike Air Force 1', 'Adidas Superstar', 'Converse Chuck Taylor All Star',
    'Vans Old Skool', 'Giày tây nam mũi nhọn',
  ],
  'my-pham-lam-dep': [
    'Sữa rửa mặt Cetaphil Gentle Skin Cleanser', 'Kem chống nắng Anessa 60ml',
    'Serum Vitamin C The Ordinary', 'Nước tẩy trang Bioderma Sensibio H2O',
    'Kem dưỡng ẩm Cerave Moisturizing Cream', 'Mặt nạ giấy Innisfree',
    'Son kem lì 3CE Velvet Lip Tint', 'Phấn nước Laneige Neo Cushion',
    'Chì kẻ mày Etude House', 'Mascara Maybelline Lash Sensational',
    'Nước hoa Chanel Chance mini', 'Nước hoa hồng Klairs Toner',
    'Dầu gội Head & Shoulders', 'Dầu xả Tresemme phục hồi',
    'Sữa tắm dưỡng ẩm Dove', 'Kem đánh răng Sensodyne', 'Bàn chải điện Oral-B',
    'Máy rửa mặt Foreo Luna', 'Bộ cọ trang điểm 12 cây',
  ],
  'do-gia-dung': [
    'Nồi cơm điện Sharp 1.8L', 'Nồi chiên không dầu Philips 4L', 'Máy xay sinh tố Panasonic',
    'Bếp từ đôi Sunhouse', 'Lò vi sóng Electrolux 20L', 'Máy lọc nước Kangaroo',
    'Bình đun siêu tốc Kangaroo 1.7L', 'Máy hút bụi cầm tay Xiaomi', 'Quạt điều hòa Sunhouse',
    'Máy ép trái cây chậm', 'Bộ nồi inox 5 món', 'Chảo chống dính Elmich 28cm',
    'Bàn ủi hơi nước Philips', 'Máy giặt mini Toshiba', 'Tủ lạnh mini Aqua 90L',
    'Đèn LED để bàn học', 'Máy lọc không khí Xiaomi', 'Ga trải giường cotton 4 món',
    'Gối cao su non', 'Rèm cửa sổ chống nắng', 'Kệ gia vị inox để bàn bếp',
  ],
  'the-thao-du-lich': [
    'Vali kéo du lịch 20 inch', 'Balo du lịch 40L chống nước', 'Túi đeo chéo du lịch mini',
    'Thảm tập yoga chống trượt', 'Dây kháng lực tập gym', 'Tạ tay 5kg bọc cao su',
    'Xe đạp thể thao địa hình', 'Vợt cầu lông Yonex', 'Bóng đá Động Lực size 5',
    'Giày đá bóng sân cỏ nhân tạo', 'Bình giữ nhiệt thể thao 1L', 'Băng đô thể thao chống mồ hôi',
    'Kính bơi chống nước Speedo', 'Áo phao bơi trẻ em', 'Lều cắm trại 2 người',
    'Túi ngủ du lịch siêu nhẹ', 'Đèn pin đội đầu leo núi', 'Gậy leo núi trekking',
  ],
  'me-be': [
    'Bỉm tã Bobby size M', 'Sữa bột Nan Nga số 2', 'Bình sữa Comotomo 250ml',
    'Máy hâm sữa Fatzbaby', 'Xe đẩy em bé gấp gọn', 'Địu em bé đa năng',
    'Ghế ăn dặm cho bé', 'Nôi cũi gỗ cho bé', 'Đồ chơi xếp hình gỗ cho bé',
    'Quần áo sơ sinh cotton set 5 món', 'Khăn xô sơ sinh 100% cotton', 'Máy hút sữa điện đôi Spectra',
    'Dầu massage cho bé Johnson', 'Kem chống hăm cho bé Bepanthen', 'Ba lô đi học cho bé',
    'Bàn học thông minh cho bé', 'Xe tập đi cho bé',
  ],
  'sach-van-phong-pham': [
    'Đắc Nhân Tâm - Dale Carnegie', 'Nhà Giả Kim - Paulo Coelho', 'Tuổi Trẻ Đáng Giá Bao Nhiêu',
    'Cà Phê Cùng Tony', 'Muôn Kiếp Nhân Sinh', 'Sapiens Lược Sử Loài Người',
    'Atomic Habits - Thay Đổi Tí Hon Hiệu Quả Bất Ngờ', 'Nghĩ Giàu Làm Giàu',
    'Sổ tay bìa da A5', 'Bút bi Thiên Long TL-027', 'Bút gel Deli 0.5mm',
    'Vở kẻ ngang Campus 200 trang', 'Bộ bút màu sáp 24 màu', 'Balo học sinh chống gù',
    'Máy tính Casio FX-580VN', 'Kẹp giấy bướm nhiều màu', 'File tài liệu A4 nhựa',
    'Bảng trắng mini để bàn',
  ],
};
