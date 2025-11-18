-- =========================================================
--  MSIM4206 - Tugas 2: Skema Klinik Sederhana
--  Nama              : IMAM MA'SUM
--  NIM               : 051146712
-- =========================================================
-- ==================================================
-- BAGIAN 1: MEMBUAT DATABASE DAN TABEL
-- ==================================================
-- 1. Membuat Database
CREATE DATABASE IF NOT EXISTS klinik_ut
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 2. Menggunakan Database
USE klinik_ut;

-- 3. Membuat Tabel Entitas (Induk)

-- Tabel 'administrator'
CREATE TABLE administrator (
    id_admin INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    nama_admin VARCHAR(100) COMMENT 'Atribut nama admin',
    waktu_jaga DATETIME COMMENT 'Atribut waktu jaga admin'
);

-- Tabel 'pasien'
CREATE TABLE pasien (
    id_pasien INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    nama_pasien VARCHAR(100) COMMENT 'Atribut nama pasien',
    alamat_pasien TEXT COMMENT 'Atribut alamat pasien',
    jenis_kelamin ENUM('L', 'P') COMMENT 'Atribut jenis kelamin pasien (L/P)',
    tanggal_lahir DATE COMMENT 'Atribut tanggal lahir pasien'
);

-- Tabel 'dokter'
CREATE TABLE dokter (
    id_dokter INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    nama_dokter VARCHAR(100) COMMENT 'Atribut nama dokter',
    alamat_dokter TEXT COMMENT 'Atribut alamat dokter',
    no_hp VARCHAR(15) COMMENT 'Atribut nomor HP dokter',
    spesialis VARCHAR(50) COMMENT 'Atribut spesialis dokter',
    waktu_kerja DATETIME COMMENT 'Atribut waktu kerja dokter'
);

-- 4. Membuat Tabel Relasi (Anak) DENGAN CASCADE

-- Tabel 'daftar' (DIUBAH DENGAN CASCADE)
CREATE TABLE daftar (
    id_daftar INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    id_admin INT COMMENT 'Foreign Key ke administrator.id_admin',
    id_pasien INT COMMENT 'Foreign Key ke pasien.id_pasien',
    tgl_daftar DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Atribut tambahan untuk tanggal daftar',
    
    FOREIGN KEY (id_admin) REFERENCES administrator(id_admin)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
    FOREIGN KEY (id_pasien) REFERENCES pasien(id_pasien)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Tabel 'dokter_admin' (DIUBAH DENGAN CASCADE)
CREATE TABLE dokter_admin (
    id_data INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    id_admin INT COMMENT 'Foreign Key ke administrator.id_admin',
    id_dokter INT COMMENT 'Foreign Key ke dokter.id_dokter',
    
    FOREIGN KEY (id_admin) REFERENCES administrator(id_admin)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
    FOREIGN KEY (id_dokter) REFERENCES dokter(id_dokter)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Tabel 'pasien_dokter' (DIUBAH DENGAN CASCADE)
CREATE TABLE pasien_dokter (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    id_dokter INT COMMENT 'Foreign Key ke dokter.id_dokter',
    id_pasien INT COMMENT 'Foreign Key ke pasien.id_pasien',
    waktu_periksa DATETIME COMMENT 'Atribut waktu periksa',
    resep TEXT COMMENT 'Atribut resep dari relasi Diperiksa',
    
    FOREIGN KEY (id_dokter) REFERENCES dokter(id_dokter)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
    FOREIGN KEY (id_pasien) REFERENCES pasien(id_pasien)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ==================================================
-- BAGIAN 2: MENAMBAHKAN DATA DUMMY
-- (Data INSERT tetap sama, tidak berubah)
-- ==================================================

-- 1. Menambahkan data ke tabel 'administrator'
INSERT INTO administrator (nama_admin, waktu_jaga) 
VALUES 
('Budi Santoso', '2025-11-03 08:00:00'),
('Ani Lestari', '2025-11-03 16:00:00'),
('Candra Wijaya', '2025-11-04 08:00:00');

-- 2. Menambahkan data ke tabel 'pasien'
INSERT INTO pasien (nama_pasien, alamat_pasien, jenis_kelamin, tanggal_lahir) 
VALUES 
('Dewi Anggraini', 'Jl. Merpati No. 15, Jakarta', 'P', '1995-03-10'),
('Eko Prasetyo', 'Jl. Elang Raya No. 2, Bekasi', 'L', '1988-11-20'),
('Fajar Nugroho', 'Jl. Cendrawasih Blok A1, Tangerang', 'L', '2001-07-05'),
('Gita Permata', 'Jl. Rajawali V No. 8, Jakarta', 'P', '1999-01-30');

-- 3. Menambahkan data ke tabel 'dokter'
INSERT INTO dokter (nama_dokter, alamat_dokter, no_hp, spesialis, waktu_kerja) 
VALUES 
('Dr. Hermawan', 'Jl. Kutilang No. 1, Jakarta', '081234567890', 'Umum', '2025-11-03 09:00:00'),
('Dr. Indah Cahyani', 'Jl. Garuda No. 22, Bogor', '081122334455', 'Gigi', '2025-11-03 10:00:00'),
('Dr. Jaya Kusuma', 'Jl. Merak III No. 5, Depok', '081987654321', 'Anak', '2025-11-04 08:00:00');

-- 4. Menambahkan data ke tabel 'daftar' (Relasi admin & pasien)
INSERT INTO daftar (id_admin, id_pasien) 
VALUES (1, 1), (2, 2), (1, 3), (3, 4);

-- 5. Menambahkan data ke tabel 'dokter_admin' (Relasi dokter & admin)
INSERT INTO dokter_admin (id_admin, id_dokter) 
VALUES (1, 1), (1, 2), (2, 3);

-- 6. Menambahkan data ke tabel 'pasien_dokter' (Relasi pasien & dokter)
INSERT INTO pasien_dokter (id_dokter, id_pasien, waktu_periksa, resep) 
VALUES 
(1, 1, '2025-11-03 09:30:00', 'Paracetamol 3x1, Amoxicillin 3x1'),
(2, 2, '2025-11-03 10:15:00', 'Obat kumur antiseptik, Asam Mefenamat 2x1'),
(1, 3, '2025-11-03 11:00:00', 'Vitamin C, Obat batuk sirup 3x1'),
(3, 4, '2025-11-04 08:30:00', 'Imunisasi DPT, Sirup penurun panas');