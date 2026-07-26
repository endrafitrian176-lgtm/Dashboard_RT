// Access Control Checks
function checkAccess() {
    const role = localStorage.getItem('rt_user_role');
    const isLoginPage = window.location.pathname.endsWith('login.html');

    if (!role && !isLoginPage) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function isPengurus() {
    return localStorage.getItem('rt_user_role') === 'pengurus';
}

function logoutRole() {
    localStorage.removeItem('rt_user_role');
    window.location.href = 'login.html';
}

// Execute access check immediately to prevent page flashing
checkAccess();

// Universal RT Configuration Defaults
const DEFAULT_SETTINGS = {
    rt: "010",
    rw: "02",
    kelurahan: "Padurenan",
    kecamatan: "Mustika Jaya",
    kota: "Bekasi",
    slogan: "RT 10 Perumahan Permata Legenda",
    sekretariat: "Blok D1 No.9",
    kodepos: "17156",
    pin: "12345"
};

function getSettings() {
    const localSettings = localStorage.getItem('rt_settings');
    if (localSettings) {
        return JSON.parse(localSettings);
    }
    return DEFAULT_SETTINGS;
}

function saveSettings(settings) {
    localStorage.setItem('rt_settings', JSON.stringify(settings));
}

function replaceTextInNode(node, s) {
    if (node.nodeType === Node.TEXT_NODE) {
        let text = node.nodeValue;
        
        // Replace RT / RW
        text = text.replace(/RT 05/g, `RT ${s.rt}`);
        text = text.replace(/RT05/g, `RT${s.rt}`);
        text = text.replace(/RW 02/g, `RW ${s.rw}`);
        text = text.replace(/RW02/g, `RW${s.rw}`);
        
        // Replace Kelurahan
        text = text.replace(/Kelurahan Cempaka/g, `Kelurahan ${s.kelurahan}`);
        text = text.replace(/Cempaka/g, s.kelurahan);
        
        // Replace Regional
        text = text.replace(/Bekasi Barat/g, s.kecamatan);
        text = text.replace(/Bekasi/g, s.kota);
        text = text.replace(/Blok A5 No\. 10/g, s.sekretariat);
        text = text.replace(/17135/g, s.kodepos);

        node.nodeValue = text;
    } else {
        if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
            for (let child of node.childNodes) {
                replaceTextInNode(child, s);
            }
        }
    }
}

// Dynamic Branding Injector
function applyBranding() {
    const s = getSettings();
    
    // Run dynamic text replacement across the whole body text nodes
    replaceTextInNode(document.body, s);

    // 4. Sidebar Link Access controls for Pengaturan RT
    const isUserAdmin = isPengurus();
    document.querySelectorAll('.sidebar ul.nav, .offcanvas-body ul.nav').forEach(ul => {
        let settingsLink = ul.querySelector('a[href="pengaturan.html"]');
        if (isUserAdmin) {
            if (!settingsLink) {
                const li = document.createElement('li');
                li.innerHTML = `<a href="pengaturan.html" class="nav-link"><i class="fas fa-cogs"></i> Pengaturan RT</a>`;
                ul.appendChild(li);
            }
        } else {
            if (settingsLink) {
                settingsLink.parentElement.remove();
            }
        }
    });
}

// Database Import & Export functions
function exportDatabase() {
    const db = {
        warga: localStorage.getItem('rt_warga'),
        iuran: localStorage.getItem('rt_iuran'),
        kas: localStorage.getItem('rt_kas'),
        agenda: localStorage.getItem('rt_agenda'),
        pengumuman: localStorage.getItem('rt_pengumuman'),
        settings: localStorage.getItem('rt_settings'),
        kontak: localStorage.getItem('rt_kontak')
    };
    
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const s = getSettings();
    link.setAttribute("href", url);
    link.setAttribute("download", `database_rt_${s.rt}_rw_${s.rw}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Database Import
function importDatabase(jsonString) {
    try {
        const db = JSON.parse(jsonString);
        if (db.warga) localStorage.setItem('rt_warga', db.warga);
        if (db.iuran) localStorage.setItem('rt_iuran', db.iuran);
        if (db.kas) localStorage.setItem('rt_kas', db.kas);
        if (db.agenda) localStorage.setItem('rt_agenda', db.agenda);
        if (db.pengumuman) localStorage.setItem('rt_pengumuman', db.pengumuman);
        if (db.settings) localStorage.setItem('rt_settings', db.settings);
        if (db.kontak) localStorage.setItem('rt_kontak', db.kontak);
        return true;
    } catch (e) {
        alert('Format file database tidak valid!');
        return false;
    }
}

// Dual-source Data Adapter
const DATA_PATHS = {
    warga: 'assets/data/warga.json',
    iuran: 'assets/data/iuran.json',
    kas: 'assets/data/kasrt.json',
    agenda: 'assets/data/agenda.json',
    pengumuman: 'assets/data/pengumuman.json',
    kontak: 'assets/data/kontak.json'
};

// Seeding Names for Client-side Fallback Generator
const INDO_NAMES = [
    "Budi Santoso", "Siti Aminah", "Agus Wijaya", "Eko Prasetyo", "Joko Susilo",
    "Dewi Lestari", "Rudi Hermawan", "Iwan Setiawan", "Sri Wahyuni", "Bambang Utomo",
    "Andi Wijaya", "Rina Susanti", "Hendra Wijaya", "Ani Suryani", "Dedi Hermawan",
    "Yanto Prabowo", "Lilis Karlina", "Asep Sunandar", "Ujang Suherman", "Cecep Rahman",
    "Taufik Hidayat", "Ade Suryana", "Dian Sastrowardoyo", "Wawan Setiawan", "Dadang Subur",
    "Maman Suherman", "Toto Hartono", "Indra Wijaya", "Yudi Pratama", "Rian Hidayat",
    "Denny Cagur", "Sule Priakit", "Andre Taulany", "Raffi Ahmad", "Nagita Slavina",
    "Atta Halilintar", "Aurel Hermansyah", "Anang Hermansyah", "Ashanty Siddik", "Krisdayanti",
    "Raul Lemos", "Sandiaga Uno", "Prabowo Subianto", "Joko Widodo", "Megawati Soekarnoputri",
    "Susilo Bambang Yudhoyono", "Abdurrahman Wahid", "Habibie", "Soeharto", "Soekarno",
    "Luhut Binsar Pandjaitan", "Erick Thohir", "Sri Mulyani", "Retno Marsudi", "Mahfud MD",
    "Ganjar Pranowo", "Anies Baswedan", "Ridwan Kamil", "Basuki Tjahaja Purnama", "Djarot Saiful Hidayat",
    "Gibran Rakabuming", "Kaesang Pangarep", "Bobby Nasution", "Kahiyang Ayu", "Selvi Ananda",
    "Bobby Kertanegara", "Fadli Zon", "Fahri Hamzah", "Rocky Gerung", "Refly Harun",
    "Najwa Shihab", "Deddy Corbuzier", "Gus Miftah", "Ustadz Abdul Somad", "Ustadz Adi Hidayat",
    "Aa Gym", "Yusuf Mansur", "Arifin Ilham", "Mama Dedeh", "Quraish Shihab",
    "Hotman Paris Hutapea", "Otto Hasibuan", "Elza Syarief", "Farhat Abbas", "Razman Nasution",
    "Sunan Kalijaga", "Gus Samsudin", "Pesulap Merah", "Denny Sumargo", "Ria Ricis",
    "Teuku Ryan", "Harris Vriza", "Rizky Billar", "Lesti Kejora", "Rizky Febian"
];

// Fallback Generators
const fallbacks = {
    warga: () => {
        let members = Array(95).fill(3);
        let sum = 285;
        let target = 350;
        let r = 0;
        while (sum < target) {
            let idx = Math.floor(Math.random() * 95);
            if (members[idx] < 6) {
                members[idx]++;
                sum++;
            }
        }
        let warga = [];
        for (let i = 0; i < 95; i++) {
            let name = INDO_NAMES[i] || `Warga Ke-${i + 1}`;
            let blok = `Blok A${Math.floor(i / 10) + 1}`;
            let no = `No. ${(i % 10) + 1}`;
            warga.push({
                nokk: `327501${1000000000 + i}`,
                kepalakeluarga: name,
                alamat: `${blok} ${no}`,
                anggota: members[i],
                tipe_iuran: i % 3 === 0 ? "KL" : "Full"
            });
        }
        return warga;
    },
    iuran: () => {
        let warga = fallbacks.warga();
        let iurans = [];
        warga.forEach((kk, idx) => {
            const rate = kk.tipe_iuran === 'KL' ? 75000 : 120000;
            iurans.push({
                nokk: kk.nokk,
                nama: kk.kepalakeluarga,
                bulan: "Januari",
                tahun: "2026",
                nominal: rate,
                status: "Lunas"
            });
            iurans.push({
                nokk: kk.nokk,
                nama: kk.kepalakeluarga,
                bulan: "Februari",
                tahun: "2026",
                nominal: rate,
                status: idx < 80 ? "Lunas" : "Belum Lunas"
            });
            iurans.push({
                nokk: kk.nokk,
                nama: kk.kepalakeluarga,
                bulan: "Maret",
                tahun: "2026",
                nominal: rate,
                status: idx < 75 ? "Lunas" : "Belum Lunas"
            });
            iurans.push({
                nokk: kk.nokk,
                nama: kk.kepalakeluarga,
                bulan: "April",
                tahun: "2026",
                nominal: rate,
                status: idx < 70 ? "Lunas" : "Belum Lunas"
            });
            iurans.push({
                nokk: kk.nokk,
                nama: kk.kepalakeluarga,
                bulan: "Mei",
                tahun: "2026",
                nominal: rate,
                status: idx < 65 ? "Lunas" : "Belum Lunas"
            });
            iurans.push({
                nokk: kk.nokk,
                nama: kk.kepalakeluarga,
                bulan: "Juni",
                tahun: "2026",
                nominal: rate,
                status: idx < 60 ? "Lunas" : "Belum Lunas"
            });
            iurans.push({
                nokk: kk.nokk,
                nama: kk.kepalakeluarga,
                bulan: "Juli",
                tahun: "2026",
                nominal: rate,
                status: idx < 50 ? "Lunas" : "Belum Lunas"
            });
        });
        return iurans;
    },
    kas: () => {
        let kas = [
            { tanggal: "2026-05-01", kategori: "Iuran Bulanan", jenis: "Pemasukan", keterangan: "Saldo Awal & Kas Iuran Bulan April", nominal: 5000000 }
        ];
        let txs = [
            ["2026-05-05", "Keamanan", "Pengeluaran", "Gaji Petugas Keamanan Bulan Mei", 1500000],
            ["2026-05-07", "Kebersihan", "Pengeluaran", "Gaji Petugas Kebersihan Bulan Mei", 1000000],
            ["2026-05-10", "Iuran Bulanan", "Pemasukan", "Penerimaan Iuran Warga Blok A & B", 1200000],
            ["2026-05-12", "Perbaikan Lingkungan", "Pengeluaran", "Pembelian Lampu Jalan Gang 3", 350000],
            ["2026-05-15", "Donasi", "Pemasukan", "Sumbangan Hamba Allah untuk Masjid/Mushola RT", 500000],
            ["2026-05-20", "Kegiatan Warga", "Pengeluaran", "Konsumsi Rapat Warga RT", 250000],
            ["2026-05-25", "Iuran Bulanan", "Pemasukan", "Penerimaan Iuran Warga Blok C & D", 1400000],
            
            ["2026-06-01", "Iuran Bulanan", "Pemasukan", "Kas Iuran Warga Blok E & F", 1100000],
            ["2026-06-05", "Keamanan", "Pengeluaran", "Gaji Petugas Keamanan Bulan Juni", 1500000],
            ["2026-06-07", "Kebersihan", "Pengeluaran", "Gaji Petugas Kebersihan Bulan Juni", 1000000],
            ["2026-06-12", "Perbaikan Lingkungan", "Pengeluaran", "Semen untuk Perbaikan Got Blok B", 450000],
            ["2026-06-15", "Sumbangan", "Pemasukan", "Sumbangan Warga Hajatan Bapak Budi", 300000],
            ["2026-06-18", "Kegiatan Warga", "Pengeluaran", "Peralatan Posyandu Bulanan", 200000],
            ["2026-06-25", "Iuran Bulanan", "Pemasukan", "Penerimaan Iuran Warga Blok G & H", 1300000],
            ["2026-06-28", "Donasi", "Pemasukan", "Donasi Pembangunan Gapura Utama", 2000000],
            
            ["2026-07-02", "Perbaikan Lingkungan", "Pengeluaran", "Bahan Bangunan Gapura RT", 2500000],
            ["2026-07-05", "Keamanan", "Pengeluaran", "Gaji Petugas Keamanan Bulan Juli", 1500000],
            ["2026-07-07", "Kebersihan", "Pengeluaran", "Gaji Petugas Kebersihan Bulan Juli", 1000000],
            ["2026-07-10", "Iuran Bulanan", "Pemasukan", "Penerimaan Iuran Warga Blok A & C", 1550000],
            ["2026-07-12", "Kegiatan Warga", "Pengeluaran", "Uang Duka Warga Meninggal Blok D", 500000],
            ["2026-07-15", "Sumbangan", "Pemasukan", "Sponsorship Lomba 17 Agustus", 1500000],
            ["2026-07-18", "Kegiatan Warga", "Pengeluaran", "Uang Muka Pembelian Tenda RT", 1200000],
            ["2026-07-20", "Iuran Bulanan", "Pemasukan", "Penerimaan Iuran Warga Blok D & E", 1150000],
            ["2026-07-22", "Perbaikan Lingkungan", "Pengeluaran", "Pembelian Cat untuk Pagar Pembatas RT", 600000],
            ["2026-07-24", "Donasi", "Pemasukan", "Sumbangan Sosial untuk Korban Banjir", 800000],
            ["2026-07-25", "Kegiatan Warga", "Pengeluaran", "Penyaluran Sumbangan Sosial Korban Banjir", 800000],
            ["2026-07-26", "Iuran Bulanan", "Pemasukan", "Penerimaan Iuran Warga Blok F", 900000],
            ["2026-07-27", "Keamanan", "Pengeluaran", "Service CCTV Pos Ronda Utama", 400000],
            ["2026-07-28", "Iuran Bulanan", "Pemasukan", "Penerimaan Iuran Warga Blok G", 950000]
        ];
        txs.forEach(t => {
            kas.push({
                tanggal: t[0],
                kategori: t[1],
                jenis: t[2],
                keterangan: t[3],
                nominal: t[4]
            });
        });
        return kas;
    },
    agenda: () => [
        { tanggal: "2026-08-02", jam: "07:30", lokasi: "Lapangan Utama RT 05", judul: "Kerja Bakti Massal & Fogging", deskripsi: "Kegiatan kerja bakti membersihkan saluran air dan fogging mencegah demam berdarah menjelang musim hujan." },
        { tanggal: "2026-08-08", jam: "19:30", lokasi: "Balai Warga RT", judul: "Rapat Koordinasi 17 Agustus", deskripsi: "Rapat pembentukan panitia Hari Ulang Tahun RI ke-81 dan pembahasan anggaran kegiatan lomba warga." },
        { tanggal: "2026-08-12", jam: "08:00", lokasi: "Posyandu Cempaka RT 05", judul: "Posyandu Balita & Lansia", deskripsi: "Pemeriksaan kesehatan rutin bulanan, imunisasi, penimbangan balita, dan pembagian makanan tambahan." },
        { tanggal: "2026-08-15", jam: "20:00", lokasi: "Mushola Al-Ikhlas RT 05", judul: "Pengajian Rutin Bulanan", deskripsi: "Pengajian warga bulanan sekaligus silaturahmi dengan penceramah Ustadz Ahmad Fauzi." },
        { tanggal: "2026-08-16", jam: "19:30", lokasi: "Panggung Utama RT 05", judul: "Malam Tirakatan HUT RI", deskripsi: "Acara syukuran, doa bersama, dan pembagian hadiah lomba anak-anak menyambut 17 Agustus." },
        { tanggal: "2026-08-17", jam: "07:00", lokasi: "Lapangan Utama RT 05", judul: "Upacara & Lomba Kemerdekaan", deskripsi: "Upacara bendera tingkat RT dilanjutkan dengan berbagai perlombaan tradisional untuk anak-anak dan dewasa." },
        { tanggal: "2026-09-05", jam: "19:30", lokasi: "Balai Warga RT", judul: "Rapat Evaluasi Triwulan RT", deskripsi: "Evaluasi laporan keuangan kas RT, keamanan lingkungan, dan kebersihan untuk periode Juni-Agustus." },
        { tanggal: "2026-09-13", jam: "06:00", lokasi: "Start: Pos Ronda Utama", judul: "Jalan Sehat Warga RT", deskripsi: "Kegiatan olahraga jalan sehat bersama seluruh warga RT dilanjutkan dengan pembagian doorprize menarik." },
        { tanggal: "2026-09-20", jam: "09:00", lokasi: "Area Kebun RT", judul: "Urban Farming & Ketahanan Pangan", deskripsi: "Pelatihan dan penanaman sayuran hidroponik bersama kelompok tani wanita RT 05." },
        { tanggal: "2026-10-04", jam: "07:30", lokasi: "Seluruh Wilayah RT", judul: "Kerja Bakti Saluran Air", deskripsi: "Pembersihan lumpur dan sampah pada saluran air utama guna mencegah banjir bandang genangan air." },
        { tanggal: "2026-10-10", jam: "19:30", lokasi: "Balai Warga RT", judul: "Penyuluhan Bahaya Narkoba & Judi Online", deskripsi: "Seminar penyuluhan dari Kepolisian Sektor setempat untuk pemuda dan orang tua warga RT." },
        { tanggal: "2026-10-18", jam: "08:30", lokasi: "Balai Warga RT", judul: "Pemeriksaan Kesehatan Gratis", deskripsi: "Pemeriksaan gula darah, asam urat, kolesterol, dan konsultasi dokter umum bekerja sama dengan Puskesmas." }
    ],
    pengumuman: () => [
        { id: 1, judul: "Undangan Rapat Pembentukan Panitia HUT RI ke-81", tanggal: "2026-07-25", isi: "Mengharap kehadiran seluruh perwakilan pemuda dan tokoh masyarakat RT pada hari Sabtu, 8 Agustus 2026, pukul 19:30 WIB bertempat di Balai Warga RT untuk pembentukan panitia pelaksana peringatan hari kemerdekaan Republik Indonesia ke-81. Kehadiran bapak/ibu sangat kami harapkan demi kelancaran agenda warga kita bersama.", lampiran: "surat_undangan_hut_ri.pdf" },
        { id: 2, judul: "Himbauan Keamanan Lingkungan & Wajib Lapor Tamu 1x24 Jam", tanggal: "2026-07-20", isi: "Sehubungan dengan meningkatnya isu keamanan di lingkungan sekitar, pengurus RT menghimbau agar setiap warga meningkatkan kewaspadaan, memastikan rumah terkunci saat ditinggal, dan melaporkan tamu yang menginap lebih dari 1x24 jam kepada Koordinator Keamanan atau Ketua RT. Kerjasama warga sangat kami hargai.", lampiran: "surat_edaran_keamanan.pdf" },
        { id: 3, judul: "Jadwal Kerja Bakti Massal Dan Pemberantasan Sarang Nyamuk (PSN)", tanggal: "2026-07-15", isi: "Diberitahukan kepada seluruh warga RT 05 bahwa akan diselenggarakan kegiatan Kerja Bakti Massal pada hari Minggu, 2 Agustus 2026 mulai pukul 07:30 WIB. Fokus kegiatan adalah membersihkan saluran air (selokan) di depan rumah masing-masing dan menguras genangan air guna mencegah perkembangbiakan nyamuk demam berdarah (DBD). Alat kebersihan harap membawa masing-masing.", lampiran: "edaran_kerja_bakti.pdf" },
        { id: 4, judul: "Layanan Imunisasi Anak Posyandu Cempaka Bulan Agustus", tanggal: "2026-07-10", isi: "Kegiatan Posyandu Balita bulan Agustus akan dilaksanakan pada hari Rabu, 12 Agustus 2026 pukul 08:00 - 11:00 WIB bertempat di Posyandu Cempaka. Layanan meliputi penimbangan berat badan, pengukuran tinggi badan, imunisasi dasar, dan pembagian makanan tambahan (PMT) bergizi. Diharapkan ibu-ibu membawa balitanya ke posyandu.", lampiran: "jadwal_posyandu_agustus.pdf" },
        { id: 5, judul: "Penerimaan Donasi & Sponsor Kegiatan Kemerdekaan", tanggal: "2026-07-05", isi: "Dalam rangka menyambut hari kemerdekaan RI ke-81, Panitia RT membuka kesempatan bagi warga yang ingin berpartisipasi memberikan donasi sukarela maupun sponsorship untuk menunjang kebutuhan hadiah lomba warga dan panggung gembira. Donasi dapat diserahkan langsung kepada Bendahara RT atau melalui transfer ke rekening kas RT.", lampiran: "proposal_kegiatan_17an.pdf" }
    ],
    kontak: () => [
        {
            name: "Hendra Wijaya",
            role: "Ketua RT",
            phone: "6281234567890",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
            desc: "Melayani koordinasi umum warga, pengesahan berkas resmi, dan perwakilan struktural RT."
        },
        {
            name: "Rina Susanti",
            role: "Sekretaris",
            phone: "6281234567891",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
            desc: "Mengurus pencatatan data warga, penerbitan surat pengantar, dan administrasi kependudukan."
        },
        {
            name: "Sri Wahyuni",
            role: "Bendahara",
            phone: "6281234567892",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&q=80",
            desc: "Mengelola penagihan iuran warga bulanan, laporan kas keuangan, donasi, dan transparansi anggaran."
        },
        {
            name: "Bambang Utomo",
            role: "Koordinator Keamanan",
            phone: "6281234567893",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
            desc: "Memimpin tim ronda malam pos ronda, mengawasi CCTV, serta menangani gangguan kamtibmas di lingkungan RT."
        },
        {
            name: "Agus Santoso",
            role: "Koordinator Kebersihan",
            phone: "6281234567894",
            avatar: "https://images.unsplash.com/photo-1539571696357-a69c17a67c6?w=200&h=200&fit=crop&q=80",
            desc: "Mengoordinasikan pengangkutan sampah warga rutin, jadwal kerja bakti kebersihan selokan, dan fogging."
        }
    ]
};

// Load data adapter
async function loadData(key) {
    const storageKey = `rt_${key}`;
    const localVal = localStorage.getItem(storageKey);
    
    // Check if browser is running under file:// (no CORS support for JSON fetch in most browsers)
    const isFileProtocol = window.location.protocol === 'file:';

    if (isFileProtocol) {
        if (localVal) {
            return JSON.parse(localVal);
        } else {
            const data = fallbacks[key]();
            localStorage.setItem(storageKey, JSON.stringify(data));
            return data;
        }
    }

    // Try fetching from server first
    try {
        const response = await fetch(DATA_PATHS[key]);
        if (!response.ok) throw new Error('Network error');
        const serverData = await response.json();
        // Sync with local storage
        localStorage.setItem(storageKey, JSON.stringify(serverData));
        return serverData;
    } catch (e) {
        // Fallback to localStorage if server fails or offline
        if (localVal) {
            return JSON.parse(localVal);
        } else {
            const data = fallbacks[key]();
            localStorage.setItem(storageKey, JSON.stringify(data));
            return data;
        }
    }
}

// Save Data (supports edit/delete dynamically in browser)
function saveToStorage(key, data) {
    localStorage.setItem(`rt_${key}`, JSON.stringify(data));
}

// Dark Mode Controller
function initDarkMode() {
    const toggleBtn = document.getElementById('darkModeToggle');
    if (!toggleBtn) return;
    
    const currentTheme = localStorage.getItem('rt_theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggleBtn.innerHTML = '☀️ Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        toggleBtn.innerHTML = '🌙 Dark Mode';
    }

    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('rt_theme', isDark ? 'dark' : 'light');
        toggleBtn.innerHTML = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        
        // Custom event so charts can update their styling automatically
        window.dispatchEvent(new Event('themeChanged'));
    });
}

// Toast Notifications Setup
async function initNotifications() {
    if (window.location.pathname.endsWith('login.html')) return;
    const agendaData = await loadData('agenda');
    const pengumumanData = await loadData('pengumuman');
    
    // Get next upcoming agenda
    const now = new Date();
    const upcoming = agendaData
        .map(a => ({ ...a, dateObj: new Date(a.tanggal) }))
        .filter(a => a.dateObj >= now)
        .sort((a, b) => a.dateObj - b.dateObj)[0];

    // Get newest announcement
    const newestAnn = pengumumanData
        .map(p => ({ ...p, dateObj: new Date(p.tanggal) }))
        .sort((a, b) => b.dateObj - a.dateObj)[0];

    const container = document.createElement('div');
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3 no-print';
    document.body.appendChild(container);

    let html = '';
    if (upcoming) {
        html += `
        <div id="toastAgenda" class="toast border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="10000">
            <div class="toast-header bg-primary text-white">
                <i class="fas fa-calendar-alt me-2"></i>
                <strong class="me-auto">Agenda Mendatang</strong>
                <small>Baru</small>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                <strong>${upcoming.judul}</strong><br>
                📅 ${formatDateString(upcoming.tanggal)} | ⏰ ${upcoming.jam} WIB<br>
                📍 ${upcoming.lokasi}
            </div>
        </div>`;
    }

    if (newestAnn) {
        html += `
        <div id="toastAnn" class="toast border-0 shadow mt-2" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="10000">
            <div class="toast-header bg-info text-white">
                <i class="fas fa-bullhorn me-2"></i>
                <strong class="me-auto">Pengumuman Baru</strong>
                <small>Baru</small>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                <strong>${newestAnn.judul}</strong><br>
                <p class="text-truncate mb-1">${newestAnn.isi}</p>
                <a href="pengumuman.html" class="btn btn-sm btn-outline-info py-0 px-2 mt-1">Selengkapnya</a>
            </div>
        </div>`;
    }

    container.innerHTML = html;

    // Show Toasts
    if (upcoming) {
        const toastA = new bootstrap.Toast(document.getElementById('toastAgenda'));
        toastA.show();
    }
    if (newestAnn) {
        const toastB = new bootstrap.Toast(document.getElementById('toastAnn'));
        setTimeout(() => toastB.show(), 1500);
    }
}

// Helpers
function formatRupiah(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

function formatDateString(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
}

function formatDateIndoShort(dateStr) {
    const date = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    return {
        day: date.getDate(),
        month: months[date.getMonth()],
        year: date.getFullYear()
    };
}

// Export CSV for Excel
function exportToCSV(filename, headers, rows) {
    let csvContent = "\uFEFF"; // BOM for Excel encoding UTF-8
    csvContent += headers.join(",") + "\r\n";
    rows.forEach(row => {
        let rowStr = row.map(val => {
            let s = String(val).replace(/"/g, '""');
            if (s.search(/("|,|\n)/g) >= 0) s = `"${s}"`;
            return s;
        }).join(",");
        csvContent += rowStr + "\r\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Print Handler
function triggerPrint() {
    window.print();
}

// Initialization on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAccess()) return;

    initDarkMode();
    initNotifications();
    
    // Inject Role Badge and Logout Button in Header Navbar
    const isLoginPage = window.location.pathname.endsWith('login.html');
    if (!isLoginPage) {
        const topNavRight = document.querySelector('.top-navbar .d-flex.align-items-center.gap-3');
        if (topNavRight) {
            const role = localStorage.getItem('rt_user_role');
            const roleBadge = document.createElement('span');
            if (role === 'pengurus') {
                roleBadge.className = 'badge bg-success px-3 py-2 rounded-pill me-2';
                roleBadge.innerHTML = '<i class="fas fa-user-shield me-1"></i> Pengurus RT';
            } else {
                roleBadge.className = 'badge bg-secondary px-3 py-2 rounded-pill me-2';
                roleBadge.innerHTML = '<i class="fas fa-user me-1"></i> Warga';
            }
            
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'btn btn-sm btn-outline-danger no-print';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Keluar';
            logoutBtn.onclick = logoutRole;
            
            topNavRight.prepend(logoutBtn);
            topNavRight.prepend(roleBadge);
        }
    }
    
    // Apply customizable branding titles
    applyBranding();

    // Auto-active current page in Sidebar
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
