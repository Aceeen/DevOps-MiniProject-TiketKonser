# 🎟️ DevOps Mini Project: Timed High-Availability Ticketing System

Sistem infrastruktur *High-Availability (HA)* untuk aplikasi pemesanan tiket konser, dirancang khusus untuk melewati parameter batasan sumber daya pada *Azure Student Subscription* dan diuji menggunakan metrik keandalan `k6`.

Arsitektur aplikasi menggunakan:
- **Frontend**: SPA Nginx, 2 Kontainer per Node
- **Backend**: FastAPI Python, 2 Kontainer per Node
- **Infrastructure**: Terraform (Azure)
- **Deployment**: Ansible (Docker, Load Balancing, UFW)

---

## 📋 Pra-Syarat (Prerequisites)

Sebelum Anda bisa mulai mendeploy infrastruktur ini, pastikan mesin / terminal WSL Anda memiliki *tools* berikut:
1. **Azure CLI** (Sudah `az login` menggunakan akun Azure Anda).
2. **Terraform** (`>= 1.5.0`).
3. **Ansible** (`>= 2.10`).
4. **Docker Engine** & **Docker Compose**.
5. Kunci SSH (`ssh-keygen -t rsa -b 2048 -f ~/.ssh/ticketing_key`).
6. **k6** (untuk keperluan *load testing*).

---

## 🚀 Panduan Deployment Terpadu

### Tahap 1: Persiapan Repository & Kontainer
1. **Clone Repository (Buka WSL)**
   ```bash
   git clone <URL_GITHUB_ANDA>
   cd MiniProject
   ```

2. **Build & Push Image Docker Anda**
   Secara *default*, sistem mengakses repositori Docker Publik. Anda harus mengganti variabel `DOCKERHUB_USERNAME` dalam skrip dengan akun Docker Hub milik Anda.
   ```bash
   # 1. Login Docker
   docker login

   # 2. Buka file skrip dan ubah variabel DOCKERHUB_USERNAME ke username Anda
   nano build_and_push.sh

   # 3. Eksekusi pengunggahan Image
   ./build_and_push.sh
   # (Note: Anda mungkin perlu mengubah "frontend_image" & "backend_image" di ansible/inventory/group_vars/all.yml agar selaras).
   ```

### Tahap 2: Provisioning Infrastruktur (Terraform)
Sistem ini dirancang untuk melakukan optimalisasi **3 VMs (1 Load Balancer, 1 Worker Frontend, 1 Worker Backend)** yang mana sangat cocok untuk menghindari error Quota Node Limit maksimum milik *Azure Student*. 

1. Konfigurasi kredensial Azure di `terraform/terraform.tfvars`:
   ```bash
   # Khusus Azure Student dianjurkan menggunakan region `southeastasia` dengan size `Standard_B2als_v2` atau `Standard_B2ats_v2`
   cd terraform/
   nano terraform.tfvars 
   ```
2. Inisiasi dan buat Infrastruktur:
   ```bash
   terraform init
   terraform apply -auto-approve
   ```
3. Catat **Public IP Load Balancer** yang muncul di terminal pada hasil akhir *Terraform Apply*.

### Tahap 3: Deployment Aplikasi (Ansible)
Untuk keamanan komprehensif, Ansible akan mengkonfigurasi Nginx, Firewall UFW, dan Container Docker via pola *Jump-Host* untuk mengakses backend yang tidak terekspos jaringan publik. 

1. **Konfigurasi IP Target:**
   Ubah file `hosts.ini` memasukkan *Public IP* terbaru, dan masukkan *Jump-Host Key* yang sesuai di dalam file yang sama (pada bagian bawah skrip).
   ```bash
   cd ../ansible/
   nano inventory/hosts.ini
   ```

2. **Jalankan Deployment (Bypass Limitasi Path Windows):**
   Karena *Directory Mounting* Windows sering menolak bacaan `ansible.cfg` untuk alasan keamanan (*World Writable Directory*), sistem ini memiliki peluncur khusus.
   ```bash
   chmod +x run_ansible.sh
   ./run_ansible.sh
   ```

---

## 🧪 Panduan Verifikasi & Pengujian

### 1. Tes Manual (User Experience)
Kunjungi Alamat *Load Balancer Public* di Browser Anda (`http://<IP_TERRAFORM_TADI>`). Jika Anda bisa melihat *user interface* pemesanan tiket berjalan dengan mulus dan dapat menarik API Konser dari tabel backend, maka pemasangan *Full-Stack* Anda sukses!

### 2. Tes Kinerja/Bottleneck (Stress Testing)
Sistem HA ini dirancang untuk menghadapi ledakan *traffic* (Contoh: "War Ticket/Konser"). Pengujian dilakukan dengan perangkat `k6` secara 4 Tahap *(Smoke, Load, Stress, Spike)*.

1. Buka skrip testing:
   ```bash
   cd load-tests/
   nano stress-test.js
   ```
2. Pastikan Baris **`BASE_URL`** menargetkan IP Public Load Balancer terbaru.
3. Jalankan Pengujian:
   ```bash
   k6 run stress-test.js
   ```
4. **Analisa Hasil:** Jika batas spesifikasi instance Azure *Student* tercapai (E.g Limit RAM 1GB / 4GB), `k6` akan mengeluarkan nilai error koneksi gagal putus `i/o timeout` saat di atas tekanan beban puncaknya *(Spike Phase)*. Ini adalah validasi bahwa Load Test telah mendeteksi batas teratas aplikasi.
