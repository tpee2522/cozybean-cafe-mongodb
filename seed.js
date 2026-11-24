require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

const cafeProducts = [
  // 1. หมวด Coffee (6 รายการ)
  { name: 'Iced Americano (อเมริกาโน่เย็น)', description: 'กาแฟอาราบิก้าคั่วกลางสกัดสด รสชาติเข้มข้น สดชื่น ไม่หวาน', category: 'Coffee', price: 65, stock: 50, image: 'https://placehold.co/400x300/4a2c2a/ffffff?text=Iced+Americano' },
  { name: 'Iced Caramel Macchiato (คาราเมลมัคคิอาโต้เย็น)', description: 'เอสเพรสโซ่ผสมนมสดและซอสคาราเมลโฮมเมด หอมหวานละมุน', category: 'Coffee', price: 85, stock: 40, image: 'https://placehold.co/400x300/4a2c2a/ffffff?text=Caramel+Macchiato' },
  { name: 'Dirty Coffee (เดอร์ตี้คอฟฟี่)', description: 'นมเย็นจัดสูตรพิเศษท็อปด้วยช็อตเอสเพรสโซ่เข้มข้น แยกชั้นสวยงาม', category: 'Coffee', price: 95, stock: 30, image: 'https://placehold.co/400x300/4a2c2a/ffffff?text=Dirty+Coffee' },
  { name: 'Hot Cappuccino (คาปูชิโน่ร้อน)', description: 'กาแฟเอสเพรสโซ่ผสมนมร้อนและฟองนมนุ่มละเอียด โรยผงซินนามอน', category: 'Coffee', price: 65, stock: 45, image: 'https://placehold.co/400x300/4a2c2a/ffffff?text=Hot+Cappuccino' },
  { name: 'Iced Mocha (มอคค่าเย็น)', description: 'กาแฟเข้มข้นผสมดาร์กช็อกโกแลตแท้และนมสด', category: 'Coffee', price: 75, stock: 35, image: 'https://placehold.co/400x300/4a2c2a/ffffff?text=Iced+Mocha' },
  { name: 'Yuzu Cold Brew (ยูซุโคลด์บรูว์)', description: 'กาแฟสกัดเย็น 16 ชั่วโมง ผสมน้ำส้มยูซุแท้จากญี่ปุ่น เปรี้ยวอมหวานสดชื่น', category: 'Coffee', price: 95, stock: 25, image: 'https://placehold.co/400x300/4a2c2a/ffffff?text=Yuzu+Cold+Brew' },

  // 2. หมวด Tea & Matcha (6 รายการ)
  { name: 'Uji Matcha Latte (อูจิมัทฉะลาเต้เย็น)', description: 'ผงมัทฉะเกรดพิธีการจากเมืองอูจิ ชงกับนมสดแท้ หอมเข้มไม่ฝาด', category: 'Tea & Matcha', price: 90, stock: 35, image: 'https://placehold.co/400x300/3f6212/ffffff?text=Uji+Matcha+Latte' },
  { name: 'Thai Milk Tea (ชาไทยโบราณเย็น)', description: 'ใบชาไทยคัดพิเศษ ชงเข้มข้น หอมมัน กลมกล่อม', category: 'Tea & Matcha', price: 60, stock: 50, image: 'https://placehold.co/400x300/c2410c/ffffff?text=Thai+Milk+Tea' },
  { name: 'Peach Iced Tea (ชาพีชเย็น)', description: 'ชาดำอัสสัมหอมกลิ่นลูกพีช เสิร์ฟพร้อมเนื้อพีชชิ้นโต', category: 'Tea & Matcha', price: 65, stock: 40, image: 'https://placehold.co/400x300/c2410c/ffffff?text=Peach+Iced+Tea' },
  { name: 'Hojicha Roasted Latte (โฮจิฉะลาเต้)', description: 'ชาเขียวคั่วญี่ปุ่น กลิ่นหอมคั่วที่เป็นเอกลักษณ์ คาเฟอีนต่ำ', category: 'Tea & Matcha', price: 85, stock: 30, image: 'https://placehold.co/400x300/78350f/ffffff?text=Hojicha+Latte' },
  { name: 'Earl Grey Lemon Tea (ชามะนาวเอิร์ลเกรย์)', description: 'ชาเอิร์ลเกรย์กลิ่นเบอร์กาม็อต ผสมน้ำมะนาวคั้นสด', category: 'Tea & Matcha', price: 65, stock: 45, image: 'https://placehold.co/400x300/b45309/ffffff?text=Earl+Grey+Lemon' },
  { name: 'Rose Lychee Tea (ชากุหลาบลิ้นจี่)', description: 'ชาดอกกุหลาบออร์แกนิกผสมน้ำลิ้นจี่ หอมหวานสดชื่น', category: 'Tea & Matcha', price: 75, stock: 32, image: 'https://placehold.co/400x300/be185d/ffffff?text=Rose+Lychee+Tea' },

  // 3. หมวด Non-Coffee (6 รายการ)
  { name: 'Belgian Dark Cocoa (โกโก้เข้มข้นเบลเยียม)', description: 'ผงโกโก้แท้ 100% นำเข้าจากเบลเยียม ชงเข้มข้นหวานน้อย', category: 'Non-Coffee', price: 75, stock: 40, image: 'https://placehold.co/400x300/3e2723/ffffff?text=Belgian+Cocoa' },
  { name: 'Fresh Milk Brown Sugar (นมสดบราวน์ชูการ์)', description: 'นมสดพาสเจอร์ไรส์แท้ ราดซอสน้ำตาลทรายแดงเคี่ยวหอม', category: 'Non-Coffee', price: 70, stock: 35, image: 'https://placehold.co/400x300/854d0e/ffffff?text=Brown+Sugar+Milk' },
  { name: 'Strawberry Italian Soda (สตรอว์เบอร์รีโซดา)', description: 'ซอสสตรอว์เบอร์รีโฮมเมดผสมโซดาซ่า เติมความสดชื่นระหว่างวัน', category: 'Non-Coffee', price: 65, stock: 45, image: 'https://placehold.co/400x300/e11d48/ffffff?text=Strawberry+Soda' },
  { name: 'Blue Hawaii Soda (บลูฮาวายโซดา)', description: 'เครื่องดื่มโซดาสีฟ้าสดใส รสเปรี้ยวอมหวานกลิ่นส้มและสับปะรด', category: 'Non-Coffee', price: 65, stock: 40, image: 'https://placehold.co/400x300/0284c7/ffffff?text=Blue+Hawaii+Soda' },
  { name: 'Honey Lemon Soda (น้ำผึ้งมะนาวโซดา)', description: 'น้ำผึ้งดอกลำไยแท้ผสมมะนาวสดและโซดา ชุ่มคอ', category: 'Non-Coffee', price: 60, stock: 50, image: 'https://placehold.co/400x300/ca8a04/ffffff?text=Honey+Lemon+Soda' },
  { name: 'Mixed Berry Smoothie (มิกซ์เบอร์รีสมูทตี้)', description: 'สตรอว์เบอร์รี บลูเบอร์รี และราสป์เบอร์รีปั่นละเอียด วิตามินซีสูง', category: 'Non-Coffee', price: 85, stock: 25, image: 'https://placehold.co/400x300/7e22ce/ffffff?text=Berry+Smoothie' },

  // 4. หมวด Bakery (6 รายการ)
  { name: 'French Butter Croissant (ครัวซองต์เนยสด)', description: 'ครัวซองต์อบใหม่ทุกวัน กรอบนอกนุ่มใน หอมเนยแท้จากฝรั่งเศส', category: 'Bakery', price: 75, stock: 20, image: 'https://placehold.co/400x300/92400e/ffffff?text=Butter+Croissant' },
  { name: 'Basque Burnt Cheesecake (ชีสเค้กหน้าไหม้)', description: 'ครีมชีสนำเข้าเนื้อเนียนนุ่ม ละลายในปาก หวานกำลังดี', category: 'Bakery', price: 115, stock: 15, image: 'https://placehold.co/400x300/92400e/ffffff?text=Burnt+Cheesecake' },
  { name: 'Chocolate Fudge Brownie (บราวนี่ช็อกโกแลต)', description: 'บราวนี่เนื้อหนึบเข้มข้นด้วยดาร์กช็อกโกแลต 70%', category: 'Bakery', price: 65, stock: 25, image: 'https://placehold.co/400x300/451a03/ffffff?text=Fudge+Brownie' },
  { name: 'Blueberry Cheese Pie (บลูเบอร์รีชีสพาย)', description: 'ฐานแครกเกอร์กรุบกรอบ ครีมชีสเนื้อแน่น ราดซอสบลูเบอร์รีเต็มคำ', category: 'Bakery', price: 95, stock: 18, image: 'https://placehold.co/400x300/4338ca/ffffff?text=Blueberry+Cheese+Pie' },
  { name: 'Caramel Almond Croffle (ครอฟเฟิลคาราเมล)', description: 'ครัวซองต์อบในพิมพ์วาฟเฟิล เคลือบคาราเมลและอัลมอนด์สไลซ์อบกรอบ', category: 'Bakery', price: 85, stock: 22, image: 'https://placehold.co/400x300/92400e/ffffff?text=Almond+Croffle' },
  { name: 'Banoffee Pie (บานอฟฟี่พาย)', description: 'กล้วยหอมสุกกำลังดี ซอสคาราเมลโฮมเมด และวิปปิ้งครีมนุ่มเบา', category: 'Bakery', price: 90, stock: 16, image: 'https://placehold.co/400x300/713f12/ffffff?text=Banoffee+Pie' },

  // 5. หมวด Coffee Beans (6 รายการ)
  { name: 'House Blend Medium Roast 250g (เมล็ดกาแฟคั่วกลาง)', description: 'เมล็ดกาแฟเบลนด์สูตรประจำร้าน โทนถั่วและช็อกโกแลต', category: 'Coffee Beans', price: 290, stock: 20, image: 'https://placehold.co/400x300/292524/ffffff?text=House+Blend+250g' },
  { name: 'Chiang Rai Dark Roast 250g (อาราบิก้าคั่วเข้ม เชียงราย)', description: 'เมล็ดกาแฟดอยช้างคั่วเข้ม บอดี้แน่น เหมาะชงเมนูเย็นและใส่นม', category: 'Coffee Beans', price: 280, stock: 25, image: 'https://placehold.co/400x300/292524/ffffff?text=Dark+Roast+250g' },
  { name: 'Ethiopia Yirgacheffe 200g (เมล็ดกาแฟคั่วอ่อน)', description: 'เมล็ดกาแฟเอธิโอเปียคั่วอ่อน โทนดอกไม้และผลไม้รสเปรี้ยวสดชื่น', category: 'Coffee Beans', price: 420, stock: 12, image: 'https://placehold.co/400x300/292524/ffffff?text=Ethiopia+200g' },
  { name: 'Brazil Santos Nutty Roast 250g (เมล็ดกาแฟบราซิล)', description: 'เมล็ดกาแฟบราซิลแท้ คั่วกลางค่อนเข้ม หอมกลิ่นถั่วเฮเซลนัท', category: 'Coffee Beans', price: 320, stock: 15, image: 'https://placehold.co/400x300/292524/ffffff?text=Brazil+Santos+250g' },
  { name: 'Colombia Drip Bag Box (ชุดกาแฟดริปโคลอมเบีย 5 ซอง)', description: 'กาแฟดริปพร้อมชงพกพาสะดวก หอมนุ่มชุ่มคอ', category: 'Coffee Beans', price: 180, stock: 30, image: 'https://placehold.co/400x300/292524/ffffff?text=Drip+Coffee+Box' },
  { name: 'Decaf Arabica Beans 250g (เมล็ดกาแฟดีแคฟ)', description: 'เมล็ดกาแฟสกัดคาเฟอีนออก 99.9% ดื่มได้แม้ช่วงเย็น', category: 'Coffee Beans', price: 350, stock: 14, image: 'https://placehold.co/400x300/292524/ffffff?text=Decaf+Beans+250g' }
];

(async () => {
  if (!process.env.MONGODB_URI || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error('ตั้งค่า .env ก่อน');
  }
  await mongoose.connect(process.env.MONGODB_URI);

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await User.updateOne(
    { email: process.env.ADMIN_EMAIL.toLowerCase() },
    { $set: { passwordHash, role: 'admin' } },
    { upsert: true }
  );

  await Product.deleteMany({});
  await Product.insertMany(cafeProducts);

  console.log(`Seed complete: สร้าง Admin และเพิ่มเมนูคาเฟ่ ${cafeProducts.length} รายการเรียบร้อย`);
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
