# ☕ CozyBean Café — เว็บไซต์ร้านคาเฟ่ออนไลน์เชื่อมต่อฐานข้อมูล MongoDB
โครงงานประจำรายวิชา **1322208 ระบบฐานข้อมูลและข้อมูลขนาดใหญ่ (Database Systems and Big Data)**

## วิธีติดตั้งและรันโปรเจกต์
1. เปิดไฟล์ `.env` แล้วนำ Connection String จาก **MongoDB Atlas** มาใส่หลัง `MONGODB_URI=`
   ตัวอย่าง:
   `MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cozybean_cafe?retryWrites=true&w=majority`
2. เปิด Terminal ในโฟลเดอร์นี้ แล้วติดตั้งแพ็กเกจ:
   ```bash
   npm install
   ```
3. นำเข้าข้อมูล Admin และเมนูคาเฟ่ 30 รายการลง MongoDB:
   ```bash
   npm run seed
   ```
4. เริ่มรันเซิร์ฟเวอร์:
   ```bash
   npm start
   ```
5. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`
   - **หน้าเข้าสู่ระบบ Admin:** `http://localhost:3000/admin/login`
   - **อีเมล Admin:** `admin@example.com`
   - **รหัสผ่าน:** `1234`
