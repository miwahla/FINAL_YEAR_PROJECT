// lib/db.ts
import type { SQLiteDatabase } from "expo-sqlite";
import * as SQLite from "expo-sqlite";

export type PlantRow = {
  id: string;
  name_en: string;
  name_ur: string;
  type: "crop" | "home";
};

export type PlantSectionRow = {
  id: number;
  plant_id: string;
  order_index: number;
  title_en: string;
  title_ur: string;
  body_en: string;
  body_ur: string;
};

let dbPromise: Promise<SQLiteDatabase> | null = null;
let initialized = false;

async function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    const dbName = "leafeye_v26.db"; // new DB → clean seed
    console.log("📦 getDb() → opening", dbName, "with expo-sqlite");
    dbPromise = SQLite.openDatabaseAsync(dbName);
  }
  return dbPromise;
}

// ---------------- INITIALIZATION & SEEDING ----------------

export async function initDb() {
  if (initialized) {
    console.log("✅ initDb() → already initialized, skipping");
    return;
  }
  initialized = true; // avoid double seeding if initDb is called twice

  console.log("📦 initDb() called – setting up tables");
  const db = await getDb();

  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS plants (
        id TEXT PRIMARY KEY NOT NULL,
        name_en TEXT NOT NULL,
        name_ur TEXT NOT NULL,
        type TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS plant_sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plant_id TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        title_en TEXT NOT NULL,
        title_ur TEXT NOT NULL,
        body_en TEXT NOT NULL,
        body_ur TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS my_plants (
      plant_id TEXT PRIMARY KEY NOT NULL,
      added_at TEXT NOT NULL,
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

    `);

    const row = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) AS count FROM plants;"
    );
    const count = row?.count ?? 0;
    console.log("🌿 Plant count in DB:", count);

    if (count === 0) {
      console.log("🌱 No plants found, seeding all plants…");
      await seedInitialData(db);
    } else {
      console.log("✔️ DB already seeded, skipping seedInitialData");
    }
  } catch (e) {
    console.log("❌ initDb() error:", e);
    throw e;
  }
}

async function seedInitialData(db: SQLiteDatabase) {
  console.log("🌼 Running seedInitialData() for all plants");

  // ---------------- LEMON (HOME) ----------------
  await db.runAsync(
    `INSERT INTO plants (id, name_en, name_ur, type)
     VALUES (?, ?, ?, ?);`,
    "lemon",
    "Lemon",
    "لیموں",
    "home"
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "lemon",
    1,
    "1. General Information",
    "1. عمومی معلومات",
    `Lemon is a widely grown citrus fruit valued for its juice, acidity, vitamin C content, and aromatic
properties. It is used in beverages, pickles, chutneys, medicinal preparations, and household
remedies. Lemon trees are evergreen, thorny, and small to medium-sized. The fruit matures
multiple times a year, making it suitable for home gardening and commercial orchards. Lemon
grows well in warm climates and is sensitive to frost, waterlogging, and high winds.`,
    `لیموں ایک عام اگایا جانے والا ترش پھل ہے جو اپنے رس، تیزابیت، وٹامن سی اور خوشبودار خصوصیات کی وجہ سے روہشم ۔ےہ ےسا تابورشم ،راچا ،ںاینٹچ ،تایودا روا ولیرھگ ںوخسن ںیم لامعتسا ایک اتاج ۔ےہ ںومیل اک تخرد ہشیمہ ہوتا ہے۔ اس کے پھل سال میں کئی بار پک سکتے ہیں، اس لیے یہ گھریلو ◌ेदार ہرا رہتا ہے، درمیانے قد کا اور کانٹباغ، گملوں اور کمرشل باغات دونوں کے لیے موزوں ہے۔ لیموں گرم آب و ہوا میں خوب بڑھتا ہے اور کہرے، پانی 
 کھڑے ہونے اور تیز ہوا سے متاثر ہوتا ہے۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "lemon",
    2,
    "2. Climate & Temperature",
    "2. آب و ہوا اور درجہ حرارت",
    `•	Lemon thrives in subtropical to tropical climates. 
•	Ideal temperature range: 25–30°C. 
•	New flush growth and flowering require warm, dry weather. 
•	Heavy frost causes severe damage to leaves, shoots, and fruit. 
•	High humidity encourages fungal diseases. 
•	Rainfall requirement is moderate; excess moisture is harmful. 
•	Flowering usually occurs three times a year depending on climate. 
•	Fruit takes 5–6 months to mature after flowering. 
`,
    `•	لیموں بس لکیپارٹ سے لکیپارٹ آب و ہوا میں بہترین پیداوار دیتا ہے۔
•	مثالی درجہ حرارت: 25–30°C
•	پھول اور نئی کونپلیں نکلنے کے لیے گرم اور خشک موسم ضروری ہے۔
•	تخس، یخ‌دَمی اور کہرے سے پتے، کونپلیں اور پھل کو نقصان پہنچتا ہے۔
•	زیادہ نمی فنگس کی بیماریوں کو بڑھاتی ہے۔
•	بارش کی ضرورت درمیانی ہے، زیادہ نمی نقصان دہ ہوتی ہے۔
•	عام طور پر سال میں تین بار پھول آتے ہیں۔
•	پھل کو پکنے میں 5–6 ماہ لگتے ہیں۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "lemon",
    3,
    "3. Soil",
    "3. مٹی",
    `•	Best soils: light loam to sandy loam with good drainage. 
•	Soil pH optimum: 5.5–7.5. 
•	Waterlogging severely affects root health and causes root rot. 
•	Deep, fertile soil promotes better canopy growth and fruit development. 
•	Saline and sodic soils reduce yield and fruit quality. 
`,
    `•	میرا سے ریتلی میرا زمین میں اگانا بہتر ہے۔
•	pH کی مثالی سطح: 5.5–7.5
•	پانی کھڑا رہنے سے جڑیں خراب ہوتی ہیں اور روٹ روٹ بڑھ جاتا ہے۔
•	گہری اور زرخیز مٹی شاخوں اور پھل کی بہتر نشوونما میں مدد دیتی ہے۔
•	میس زدہ اور روش زدہ مٹی پیداوار کم کرتی ہے۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "lemon",
    4,
    "4. Varieties",
    "4. اقسام",
    `Pakistan-Specific Lemon Varieties (NOT from ApniKheti) English 
The commonly grown lemon varieties in Pakistan include: 
•	Kagzi Lime (Local Pakistan type) — very thin peel, high juice content; dominant variety in homes and farms. 
•	Kagzi Lime (CRI Sargodha selections) — improved acid lime quality. 
•	Kaghzi Nimbo (Sargodha Local) — widely grown in Punjab. 
•	Meyer Lemon — popular for home gardening; sweet-acidic taste. 
•	Eureka Lemon — commercial variety; high yield, nearly thornless. 
•	Lisbon Lemon — heat tolerant; strong tree structure. 
•	Italian Lemon — common in Punjab & Sindh orchards. 
•	Chinese Lemon — used as home garden lemon; vigorous. 
•	Rough Lemon — mostly used as rootstock, sometimes for fruit. 
•	Sadabahar Lemon (Perennial lemon) — bears fruit multiple times a year. 
`,
    `•	کاغذی لیموں (پاکستانی مقامی) — پتلا چھلکا، زیادہ رس۔
•	کاغذی لیموں (سی آر آئی سرگودھا) — اعلیٰ معیاری ایسڈ لائم۔
•	کاغذی نمبو (سرگودھا لوکل) — پنجاب میں وسیع کاشت۔
•	Meyer لیموں — گملوں میں مقبول۔
•	Eureka لیموں — کم کانٹے، زیادہ پیداوار۔
•	Lisbon لیموں — گرمی برداشت۔
•	Italian لیموں — پنجاب و سندھ میں عام۔
•	چائنیز لیموں — گھریلو باغات میں موزوں۔
•	Rough Lemon — عموماً روٹ اسٹاک۔
•	سدابہار لیموں — سال میں کئی بار پھل۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "lemon",
    5,
    "5. Land Preparation",
    "5. زمین کی تیاری",
    `•	Land should be deeply ploughed to improve drainage and root penetration. 
•	Remove old roots, stones, and weeds before planting. 
•	Prepare pits of 1m × 1m × 1m at recommended spacing. 
•	Fill pits with topsoil + FYM/compost + sand for aeration. 
•	Keep field weed-free before planting. 
`,
    `•	زمین کو گہرا ہل چلائیں۔
•	پرانے پودے، جڑیں اور پتھر ہٹا دیں۔
•	1m × 1m × 1m کے گڑھے کھودیں۔
•	اوپری مٹی + کھاد + ریت ملا کر بھریں۔
•	بوائی سے پہلے کھیت صاف رکھیں۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "lemon",
    6,
    "6. Sowing / Planting",
    "6. بوائی / پودا لگانا",
    `•	Planting is done mainly during February–March and August–September. 
•	Spacing typically 4.5–6 meters depending on variety and canopy size. 
•	Pits should be filled with farmyard manure and loose topsoil for root establishment. 
•	Plant budded or grafted lemon plants at the center of the pit. 
•	Avoid planting in frost-prone or waterlogged areas. 
•	Provide temporary shade to young plants in very hot months. 
`,
    `•	پودے لگانے کا وقت: فروری–مارچ، اگست–ستمبر۔
•	درمیانی فاصلہ: 4.5–6 میٹر۔
•	نرم مٹی اور کھاد ڈالیں۔
•	پیوند شدہ پودا درمیان لگائیں۔
•	کہرے اور پانی کھڑا ہونے والی جگہوں سے پرہیز۔
•	چھوٹے پودوں کو سایہ دیں۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "lemon",
    7,
    "7. Seed / Propagation",
    "7. بیج / افزائش",
    `•	Lemon is propagated mainly through budding or grafting for true-to-type plants. 
•	Rootstocks commonly used: Rough lemon, Jatti Khatti, Cleopatra mandarin (Pakistan equivalents). 
•	Select disease-free mother plants for budwood. 
•	Budding is done when the rootstock stem is actively growing. 
•	Seeds are used only for raising rootstocks, not for fruiting plants. 
•	Transplant grafted plants when they reach 40–50 cm height. 
`,
    `•	افزائش قلم یا پیوندکاری سے۔
•	عام روٹ اسٹاک: فر لیموں، جھٹی کھٹّی۔
•	صحت مند مادری پودا منتخب کریں۔
•	قلم بندی بڑھوتری کے دوران کریں۔
•	بیج صرف روٹ اسٹاک کیلئے۔
•	پیوند شدہ پودا 40–50 سینٹی میٹر پر منتقل کریں۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "lemon",
    8,
    "8. Fertilizer",
    "8. کھاد",
    `•	Apply FYM/compost at planting and annually during early spring. 
•	Recommended yearly NPK: 
o 	Young plants: smaller, divided doses o 	Bearing trees: higher doses split across the year 
•	Apply nitrogen in 2–3 splits for better uptake. 
•	Micronutrients (especially zinc, magnesium, iron) improve fruit size and color. 
•	Avoid excessive nitrogen as it reduces fruit quality. 
•	Fertilizer should be applied in the tree’s drip line area for best absorption. 
`,
    `•	موسم بہار میں کھاد دیں۔
•	NPK قسطوں میں دیں۔
•	نائٹروجن 2–3 قسطوں میں۔
•	زنک، آئرن، میگنیشیم ضروری۔
•	زیادہ نائٹروجن نقصان دہ۔
•	کھاد ڈرپ لائن میں ڈالیں۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "lemon",
    9,
    "9. Weed Control",
    "9. جڑی بوٹیوں کا کنٹرول",
    `•	Keep basin area around the tree weed-free. 
•	Hand weeding or hoeing is recommended during early growth. 
•	Mulching with dry leaves/straw helps suppress weed growth and conserve moisture. 
•	Weed growth competes for nutrients and reduces fruiting. 
•	Chemical weed control may be used carefully around mature trees, avoiding contact with trunk or leaves. 
`,
    `•	پودے کے اردگرد صفائی رکھیں۔
•	گوڈی اور نکنی کریں۔
•	ملچنگ نمی برقرار رکھتی ہے۔
•	جڑی بوٹیاں پیداوار کم کرتی ہیں۔
•	کیمیائی ادویات احتیاط سے۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "lemon",
    10,
    "10. Irrigation",
    "10. آبپاشی",
    `•	Young plants need light irrigation at regular intervals. 
•	Mature trees require irrigation every 10–15 days in summer and 25–30 days in winter. 
•	Avoid over-irrigation as citrus is sensitive to waterlogging. 
•	Drip irrigation is ideal for lemons to maintain consistent soil moisture. 
•	Critical stages: flowering, fruit set, fruit enlargement. 
•	Reduce watering close to harvest to improve fruit quality. 
`,
    `•	کم عمر پودوں کو ہلکی آبپاشی دیں۔
•	بڑے پودوں کو گرمی میں 10–15 دن بعد۔
•	زیادہ پانی نقصان دہ ہے۔
•	ڈرپ آبپاشی بہترین ہے۔
•	اہم مراحل: پھول، پھل بننا۔
•	کٹائی کے قریب پانی کم کریں۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "lemon",
    11,
    "11. Pest & Disease Management",
    "11. بیماریوں اور کیڑوں کا کنٹرول",
    `Major pests 
•	Leaf miner: serpentine tunnels on young leaves. 
•	Aphids: curling, sticky honeydew, weak growth. 
•	Citrus psylla: curling leaves, shoot dieback; spreads citrus greening. 
•	Blackfly: sooty mold due to honeydew. 
•	Fruit fly: punctures fruit and causes rotting. 
•	Mealybug: cottony masses on branches. 
Pest management 
•	Prune affected shoots and remove infested leaves. 
•	Use yellow sticky traps for psylla and aphids. 
•	Maintain orchard sanitation. 
•	Apply recommended insecticides at early infestation stages. 
•	Control ant populations that protect sap-sucking insects. 
Major diseases 
•	Canker: raised brown lesions on leaves and fruit. 
•	Gummosis: gum exudation on trunk; bark decay. 
•	Greening (HLB): yellow mottling, small lopsided fruits. 
•	Root rot (Phytophthora): collar rot, wilting. 
•	Sooty mold: black fungal layer on leaves due to honeydew. 
Disease management 
•	Use disease-free planting material. 
•	Remove canker-infected leaves and fruits. 
•	Improve drainage to prevent root rot. 
•	Avoid wounds on trunk to reduce gummosis. 
•	Spray copper-based fungicides when needed. Urdu 
`,
    `تحفظِ نباتات — کیڑے 
•	لیف مائنر — نئی پتیوں میں سفید سرنگ نما لکیریں۔
•	زڈیفا (Aphids) — پتے مڑنا، چپچپا مادہ (ہنی ڈیو)، کمزور بڑھوتری۔
•	لائاس (Citrus psylla) — پتے مڑنا، شاخوں کا خشک ہونا؛ گریننگ بیماری پھیلاتا ہے۔
•	بلیک فلائی — ہنی ڈیو کی وجہ سے سیاہ پھپھوندی۔
•	فروٹ فلی — پھل میں سوراخ اور سڑن۔
•	میلی بگ — ٹہنیوں اور پتوں پر روئی جیسا مادہ۔
 کیڑوں کا کنٹرول 
•	متاثرہ شاخیں کاٹ کر ختم کریں۔
•	پسيلة اور زڈیفا کے لیے پیلے اسٹکی ٹریپس لگائیں۔
•	باغ کی صفائی اور سینی ٹیشن برقرار رکھیں۔
•	حملہ شروع ہوتے ہی تجویز کردہ ادویات کا اسپرے کریں۔
•	چیونٹیوں کا کنٹرول کریں کیونکہ وہ رس چوسنے والے کیڑوں کی حفاظت کرتی ہیں۔
 بیماریاں 
•	کینکر — پتوں اور پھل پر ابھرا ہوا بھورا دھبہ۔
•	گموزس — تنے پر گم نکلنا، چھال کا خراب ہونا۔
•	گریننگ (HLB) — پتوں پر پیلا دھبہ دار پن، چھوٹے ٹیڑھے پھل۔
•	روٹ روٹ (Phytophthora) — جڑیں گلنا، پودا مرجھانا۔
•	سُوٹی مولڈ — پتوں پر سیاہ تہہ (ہنی ڈیو کی وجہ سے)۔
 بیماریوں کا کنٹرول 
•	بیماری سے پاک اور صحتمند پودا استعمال کریں۔
•	کینکر سے متاثرہ پتے اور پھل فوراً ہٹا دیں۔
•	روٹ روٹ سے بچنے کے لیے نکاس بہتر رکھیں۔
•	تنوں پر زخم نہ بننے دیں تاکہ گموزس سے بچاؤ ہو۔
•	ضرورت پڑنے پر کاپر بیسڈ فنگسائڈ کا اسپرے کریں۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "lemon",
    12,
    "12. Deficiencies & Remedies",
    "12. غذائی کمی اور حل",
    `deficiency 
•	Light green leaves, poor canopy. 
•	Apply nitrogen in split doses. 
Phosphorus deficiency 
•	Slow growth, dull green leaves.
•	Add phosphorus at planting and in early growth. 
Potassium deficiency 
•	Leaf edge burn, small fruits. 
•	Apply potash for fruit size and quality. 
Zinc deficiency 
•	Small leaves, interveinal chlorosis. 
•	Apply zinc sulfate via soil or foliar spray. 
Iron deficiency 
•	Young leaves turn yellow with green veins. 
•	Use iron chelates or foliar sprays. 
`,
    `•	نائٹروجن کی کمی — پتے ہلکے سبز، کمزور پودا؛ نائٹروجن قسطوں میں دیں۔
•	فاسفورس کی کمی — نشوونما سست، بے جان پتے؛ فاسفورس شروع میں دیں۔
•	پوٹاش کی کمی — پتوں کے کنارے جلنا، چھوٹے پھل؛ پوٹاش ضروری ہے۔
•	زنک کی کمی — رگوں کے درمیان پیلاہٹ، چھوٹے پتے؛ زنک سلفیٹ استعمال کریں۔
•	آئرن کی کمی — نئی پتیاں پیلی، رگیں سبز؛ آئرن چیلیٹ یا سپرے کریں۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "lemon",
    13,
    "13. Harvesting",
    "13. کٹائی",
    `•	Harvest fruits when they are full-sized, firm, and have developed the characteristic lemon color. 
•	Do not allow fruits to overripen on the tree. 
•	Harvest with clippers to avoid stem or peel injury. 
•	Pick during the cool hours of the day. 
•	Handle fruits carefully to avoid bruising, which affects storage life. 
`,
    `•	پھل مکمل سائز، سخت اور مناسب رنگ ہونے پر توڑیں۔
•	پھل کو درخت پر زیادہ دیر نہ چھوڑیں۔
•	قینچی سے احتیاط سے کاٹیں تاکہ چھال خراب نہ ہو۔
•	ٹھنڈے وقت میں توڑائی کریں۔
•	پھل کو جھٹکوں سے بچائیں تاکہ ذخیرہ کرنے کی صلاحیت برقرار رہے۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "lemon",
    14,
    "14. Post-Harvest / Storage",
    "14. بعد از برداشت / ذخیرہ",
    `•	Sort and grade fruits for size and quality. 
•	Wash and dry fruits before storage. 
•	Store in a cool, dry, well-ventilated room. 
•	Avoid moisture, as it leads to mold. 
•	Properly stored lemons remain fresh for several weeks. 
`,
    `•	پھل کو سائز اور معیار کے مطابق الگ کریں۔
•	ذخیرہ کرنے سے پہلے دھو کر خشک کریں۔
•	ٹھنڈی، خشک اور ہوا دار جگہ میں رکھیں۔
•	نمی سے بچائیں کیونکہ پھپھوندی بڑھتی ہے۔
•	صحیح ذخیرہ پر لیموں کئی ہفتے تازہ رہتے ہیں۔
`
  );

  // ---------------- CHILLI (HOME) ----------------
  await db.runAsync(
    `INSERT INTO plants (id, name_en, name_ur, type)
     VALUES (?, ?, ?, ?);`,
    "chilli",
    "Chilli",
    "مرچ",
    "home"
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "chilli",
    1,
    "1. General Information",
    "1. عمومی معلومات",
    `Chilli is an important vegetable and spice crop grown
    in home gardens and commercial farms. It is used fresh, 
    dried, or as powder in daily cooking. Chilli is rich in 
    vitamins A and C and has medicinal and digestive properties.
     It is a warm-season crop sensitive to frost and waterlogging.
      It requires sunlight, good drainage, and balanced nutrition for higher fruit set. `,
    `مرچ ایک اہم سبزی اور مصالحہ فصل ہے جو گھریلو باغات اور کمرشل کاشت دونوں میں اگائی جاتی ہے۔ اسے تازه ،خشک اور پاؤڈر کی شکل میں روزمره کھانوں میں استعمال کیا جاتا ہے۔ مرچ وٹامن اے اور سی سے بھرپور ہے اور سا ںیم یبط و یتامضاہ دئاوف یھب ےئاپ ےتاج ۔ںیہ ہی مرگ مسوم یک لصف ےہ وج ےرہک روا یناپ اڑھک ےنوہ ےس ثاتمر 
 ہوتی ہے۔ زیاده پھل کے لیے دھوپ، اچھی نکاسی اور متوازن کھاد ضروری ہے۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "chilli",
    2,
    "2. Climate & Temperature",
    "2. آب و ہوا اور درجہ حرارت",
    `•	Chilli thrives in warm, dry climate with bright sunlight. 
•	Ideal temperature for growth: 18–32°C. 
•	Flower and fruit set require 20–25°C. 
•	Frost kills the crop. 
•	Excessive rain increases fungal diseases and reduces fruit quality. 
•	Chilli is harvested 80–100 days after transplanting, depending on variety. 
`,
    `•	گرم اور خشک موسم میں بہترین پرفارمنس دیتی ہے۔
•	پھول اور پھل بننے کے لیے 20–25°C درجہ حرارت مناسب ہے۔
•	18–32°C بڑھوتری کا مثالی درجہ حرارت ہے۔
•	کہرا فصل کو نقصان پہنچاتا ہے۔
•	زیادہ بارش سے بیماریاں بڑھتی ہیں اور کوالٹی خراب ہوتی ہے۔
•	ٹرانسپلانٹ کے 80–100 دن بعد چنائی شروع ہو جاتی ہے۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "chilli",
    3,
    "3. Soil",
    "3. مٹی",
    `•	Best soil: well-drained loamy soil rich in organic matter. 
•	Soil pH ideal range: 6.0–7.0. 
•	Sandy soil requires more manure and frequent watering. 
•	Heavy soils cause root diseases and poor fruiting. 
•	Proper leveling and drainage are essential. 
`,
    `
•	اچھی نکاسی والی، زرخیز، نامیاتی مادے سے بھرپور میرا مٹی موزوں ہے۔
•	pH کا لیول 6.0–7.0 مناسب ہے۔
•	ریتلی مٹی میں گوبر اور پانی زیادہ دینا پڑتا ہے۔
•	بھاری مٹی میں جڑوں کی بیماریاں بڑھتی ہیں اور پھل کم بنتے ہیں۔
•	کھیت کی نکاسی اور لیولنگ ضروری ہے۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "chilli",
    4,
    "4. Varieties",
    "4. اقسام",
    `Commonly recommended chilli varieties for Pakistan: 
Hybrid Varieties 
Hot Shot Hybrid 
Super Hot F1 
Raja Hybrid 
Sitara Hot 
•	HC-201 
•	Shahbaz F1 
•	Wonder Hot F1 
Open-Pollinated / Local Varieties 
•	Desi Long Chilli 
•	Neelum 
•	Sanam 
•	Talhari 
•	Ghotki Long 
Key traits 
•	Heat tolerance 
•	Resistance to leaf curl virus 
•	High fruit set 
•	Suitable for fresh & dry chilli production 
`,
    `
•	ہاٹ شاٹ ہائبرڈ، سپر ہاٹ F1، راجہ ہائبرڈ، ستارہ ہاٹ، HC-201، شہباز F1، ونڈر ہاٹ F1۔
•	دیسی لمبی مرچ، نیلم، صنم، تلہاری، گھوٹکی لونگ۔
•	گرمی برداشت، لیف کرل وائرس کے خلاف مزاحمت، زیادہ پھل بننے کی صلاحیت۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "chilli",
    5,
    "5. Land Preparation",
    "5. زمین کی تیاری",
    `•	Plough the land 2–3 times and prepare a fine tilth. 
•	Add well-decomposed FYM or compost before final ploughing. 
•	Prepare ridges or raised beds for good drainage. 
•	Ensure field is completely weed-free before planting. 
•	Install drip or furrow irrigation channels at this stage. 
`,
    `
•	زمین کو 2–3 مرتبہ ہل چلا کر نرم اور باریک کر لیں۔
•	آخری ہل سے پہلے گلی سڑی گوبر کی کھاد شامل کریں۔
•	بہتر نکاسی کے لیے رِج یا ریزڈ بیڈ بنائیں۔
•	جڑی بوٹیوں سے صاف رکھیں۔
•	آبپاشی کا نظام پہلے سے بنا لیں۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "chilli",
    6,
    "6. Sowing / Planting",
    "6. بوائی / پودا لگانا",
    `•	Chilli is commonly raised through nursery seedlings. 
•	Nursery sowing time: 
Spring crop: 
  January-February  
  Autumn crop: June–July 
•	Seedlings are ready for transplanting in 25–30 days. 
•	Transplant in the evening to reduce heat stress. 
•	Spacing: 
	Row spacing: 1.5–2 feet 
	Plant spacing: 1 foot 
•	Water the nursery before uprooting seedlings. 
Avoid transplanting during extreme heat or frost. 
`,
    `
•	مرچ عموماً نرسری کے ذریعے اگائی جاتی ہے۔
•	نرسری وقت: بہار (جنوری–فروری)، خریف (جون–جولائی)۔
•	نرسری 25–30 دن میں تیار ہوتی ہے۔
•	شام کے وقت ٹرانسپلانٹ کریں۔
•	قطار: 1.5–2 فٹ، پودا: 1 فٹ۔
•	نرسری سے پودے نکالنے سے پہلے پانی دیں۔
•	شدید گرمی یا کہرے میں ٹرانسپلانٹ نہ کریں۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "chilli",
    7,
    "7. Seed / Propagation",
    "7. بیج / افزائش",
    `Seed Rate 
•	100–120 grams of seed is required per acre for nursery raising. 
Seed Treatment 
•	Treat seed with fungicide to prevent damping-off. 
•	Use disease-free hybrid or good OP seed. 
•	Avoid storing seeds in humid or hot conditions. 
Nursery Preparation 
•	Prepare raised nursery beds 1 meter wide. 
•	Mix soil with FYM + sand for aeration. 
•	Cover seeds lightly with fine soil. 
•	Water with a rose-can to avoid seed displacement. 
•	Provide shade during hot weather
`,
    `
•	فی ایکڑ 100–120 گرام بیج کافی ہے۔
•	ڈیمپنگ آف سے بچاؤ کے لیے بیج پر فنجی سائیڈ لگائیں۔
•	نرسری بیڈ 1 میٹر چوڑے بنائیں۔
•	مٹی میں گوبر اور ریت شامل کریں۔
•	بیج کو ہلکی تہہ سے ڈھانپیں اور احتیاط سے پانی دیں۔
•	گرمی میں نرسری پر سایہ کریں۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "chilli",
    8,
    "8. Fertilizer",
    "8. کھاد",
    `•	Apply well-decomposed FYM during land preparation. 
•	Basal application: 
	Full dose of P (phosphorus) and K (potash) 
	¼ dose of N (nitrogen) 
•	Remaining nitrogen applied in two splits: 
	30 days after transplanting 
  During flowering and early fruit set 
•	Calcium improves fruit firmness. 
•	Avoid excessive nitrogen as it causes vegetative growth and fewer fruits. 
`,
    `
•	زمین کی تیاری کے وقت گلی سڑی گوبر کی کھاد استعمال کریں۔
•	بیسال میں فاسفورس اور پوٹاش کی مکمل خوراک دیں۔
•	نائٹروجن 1/4 شروع میں، باقی دو قسطوں میں دیں۔
•	کیلشیم پھل کو سخت اور معیاری بناتا ہے۔
•	نائٹروجن زیادہ نہ دیں، پتے بڑھیں گے اور پھل کم آئیں گے۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "chilli",
    9,
    "9. Weed Control",
    "9. جڑی بوٹیوں کا کنٹرول",
    `•	Keep field weed-free during the first 30–40 days. 
•	Manual hoeing or intercultivation is recommended. 
•	Mulching with straw or black plastic reduces weeds. 
•	Avoid deep hoeing near plant base. 
•	Herbicides can be used depending on weed type and field conditions. 
•	Maintain clean ridges and furrows. 
`,
    `
•	پہلے 30–40 دن جڑی بوٹیوں سے پاک رکھیں۔
•	گوڈی یا انٹرکلٹیویشن کریں۔
•	پلاسٹک شیٹ یا بھوسے سے ملچنگ کریں۔
•	پودے کے قریب گہری گوڈی نہ کریں۔
•	ضرورت کے مطابق ہربیسائیڈ استعمال کریں۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "chilli",
    10,
    "10. Irrigation",
    "10. آبپاشی",
    `•	First irrigation immediately after transplanting. 
•	In summer: irrigate every 5–6 days. 
•	In winter: irrigate every 10–12 days. 
•	Critical stages: o Flowering o Fruit set o Fruit development 
•	Avoid water stagnation; chilli is sensitive to root rot. 
•	Drip irrigation helps maintain uniform moisture. 
`,
    `
•	پہلی آبپاشی ٹرانسپلانٹ کے فوراً بعد کریں۔
•	گرمیوں میں ہر 5–6 دن بعد پانی دیں۔
•	سردیوں میں ہر 10–12 دن بعد پانی دیں۔
•	اہم مراحل: پھول، پھل بننا، پھل بڑھنا۔
•	پانی کھڑا نہ ہونے دیں؛ جڑیں سڑ سکتی ہیں۔
•	ڈرپ آبپاشی نمی یکساں رکھتی ہے۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "chilli",
    11,
    "11. Pest & Disease Management",
    "11. بیماریوں اور کیڑوں کا کنٹرول",
    `Major pests 
•	Fruit borer: holes in fruits, internal feeding. 
•	Thrips: silvering of leaves, leaf scarring. 
•	Aphids: sap sucking, leaf curl. 
•	Whitefly: transmits leaf curl virus. 
•	Mites: bronzing of leaves, stunted plants. 
•	Cutworms: cut young seedlings near soil surface. 
Pest management 
•	Remove and destroy infested fruits. 
•	Use pheromone traps for fruit borer. 
•	Install yellow sticky traps for whitefly, aphids & thrips. 
•	Maintain weed-free field. 
•	Avoid excess nitrogen which attracts sucking pests. 
•	Apply recommended insecticides at early stages of infestation. 
Major diseases 
•	Leaf curl virus: severe curling, stunted plants. 
•	Anthracnose: sunken black spots on fruits. 
•	Damping-off: nursery seedlings die. 
•	Powdery mildew: white powder on leaves. 
•	Die-back: drying of branches from tip. 
Disease management 
•	Use resistant varieties. 
•	Keep nursery soil sterilized and well-drained. 
•	Remove infected plants immediately. 
•	Apply copper fungicides for anthracnose & die-back. 
•	Avoid overhead irrigation during humid conditions. 
`,
    `
•	پھل میں سوراخ اور اندرونی نقصان (فروٹ بورر)
•	پتیوں کا چاندی ہونا اور خراشیں (تھرپس)
•	رس چوسنا، پتے مڑ جانا (افیڈز)
•	لیف کرل وائرس پھیلانا (وائٹ فلائی)
•	پتے کانسی جیسے، پودے بونے (مائیٹس)
•	نرسری پودے جڑ کے قریب سے کاٹ دینا (کٹ ورم)
کیڑوں کا کنٹرول
•	متاثرہ پھل توڑ کر تلف کریں۔
•	فروٹ بورر کے لیے فیرو مون ٹریپس لگائیں۔
•	وائٹ فلائی، افیڈز اور تھرپس کے لیے پیلے اسٹیکی ٹریپس استعمال کریں۔
•	کھیت کو جڑی بوٹیوں سے پاک رکھیں۔
•	نائٹروجن زیادہ استعمال نہ کریں۔
•	کیڑوں کے حملے کے آغاز پر مناسب سپرے کریں۔
اہم بیماریاں
•	پتے مڑ جانا، پودا بونا رہ جانا (لیف کرل وائرس)
•	پھل پر کالے دھنسے ہوئے دھبے (انتھراکنوز)
•	نرسری پودے مر جانا (ڈیمپنگ آف)
•	پتوں پر سفید سفوف (پاؤڈری میلڈیو)
•	شاخوں کا اوپر سے سوکھ جانا (ڈائی بیک)
بیماریوں کا کنٹرول
•	بیماری برداشت کرنے والی اقسام لگائیں۔
•	نرسری کی مٹی جراثیم سے پاک رکھیں۔
•	متاثرہ پودے فوراً نکال دیں۔
•	انتھراکنوز کے لیے کاپر فنجی سائیڈ استعمال کریں۔
•	نمی والے موسم میں اوپر سے پانی نہ دیں۔

`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "chilli",
    12,
    "12. Deficiencies & Remedies",
    "12. غذائی کمی اور حل",
    `Nitrogen deficiency 
•	Pale leaves, weak plants. 
•	Apply nitrogen in split doses. Phosphorus deficiency 
•	Purplish leaves, slow growth. 
•	Add phosphorus at early stages. 
Potassium deficiency 
•	Leaf edge burn, reduced fruit quality. 
•	Apply potash during fruit enlargement. 
Calcium deficiency 
•	Blossom end rot on fruits. 
•	Apply calcium nitrate or foliar sprays. 
Magnesium deficiency 
•	Yellowing between leaf veins. 
•	Apply magnesium sulfate. Urdu 
`,
    `نائٹروجن کی کمی
•	پتوں کا پیلا ہونا
•	پودوں کا کمزور رہ جانا
•	علاج: نائٹروجن قسطوں میں دیں
فاسفورس کی کمی
•	پتوں پر جامنی رنگ
•	بڑھوتری کا سست ہونا
•	علاج: فاسفورس آغاز میں دیں
پوٹاش کی کمی
•	پتوں کے کنارے جل جانا
•	پھل کا معیار کم ہونا
•	علاج: پھل کے بڑھنے کے دوران پوٹاش دیں
کیلشیم کی کمی
•	پھل کے نچلے حصے پر کالا دھبہ (Blossom End Rot)
•	علاج: کیلشیم نائٹریٹ یا سپرے کریں
میگنیشیم کی کمی
•	پتوں کی رگوں کے درمیان پیلاہٹ
•	علاج: میگنیشیم سلفیٹ استعمال کریں
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "chilli",
    13,
    "13. Harvesting",
    "13. کٹائی",
    `•	Harvest green chillies when they reach full size and color. 
•	For red/dry chillies, allow fruits to ripen fully on the plant. 
•	Pick fruits at regular intervals to maintain continuous production. 
•	Harvest during cool hours. 
•	Avoid pulling fruits; use gentle twisting or cutting. 
`,
    `
•	ہری مرچ اس وقت توڑیں جب وہ مکمل سائز تک پہنچ جائے۔
•	خشک / لال مرچ کے لیے پھل کو مکمل پکنے دیں۔
•	باقاعدہ وقفوں میں چنائی کریں تاکہ پیداوار جاری رہے۔
•	ٹھنڈے وقت میں کٹائی کریں۔
•	پھل کو زور سے نہ کھینچیں؛ موڑ کر یا کاٹ کر توڑیں۔
`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "chilli",
    14,
    "14. Post-Harvest / Storage",
    "14. بعد از برداشت / ذخیرہ",
    `•	Sort and grade fruits. 
•	Wash and dry before packing. 
•	Store at 8–10°C for longer shelf life of green chillies. 
•	For dry chillies: 
	Sun-dry until moisture is removed 
	Store in airtight containers 
  Keep away from humidity 
•	Avoid stacking too many layers to prevent bruising. 
`,
    `
•	پھل سائز اور معیار کے مطابق علیحدہ کریں۔
•	ذخیرہ کرنے سے پہلے دھو کر خشک کریں۔
•	ہری مرچ کو 8–10°C پر محفوظ کریں تاکہ شیلف لائف بڑھے۔
خشک مرچ کے لیے:
•	اچھی طرح دھوپ میں خشک کریں۔
•	ہوا دار جگہ میں رکھیں۔
•	نمی سے بچائیں۔
•	زیادہ تہوں میں نہ رکھیں تاکہ پھل دب نہ جائے۔
`
  );

  // ---------------- CORIANDER (HOME) ----------------
await db.runAsync(
  `INSERT INTO plants (id, name_en, name_ur, type)
   VALUES (?, ?, ?, ?);`,
  "coriander",
  "Coriander",
  "دھنیا",
  "home"
);

// 1. General Information
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "coriander",
  1,
  "1. General Information",
  "1. عمومی معلومات",
  `Coriander is a common spice and leafy herb grown in home gardens and small farms. The leaves (coriander greens) and seeds (dried coriander) are widely used for flavoring curries, pickles, chutneys, and snacks. The plant grows quickly, requires cool to mild temperatures, and is ideal for small spaces, pots, and kitchen gardens. Coriander is rich in vitamin C, antioxidants, and essential oils.`,
  `دھنیا ایک عام مصالحہ اور پتیدار سبزی ہے جو گھریلو باغات اور چھوٹے کھیتوں میں بڑے شوق سے اگائی جاتی ہے۔ اس کے پتے (ہرا دھنیا) اور بیج (خشک دھنیا) سالن، اچار، چٹنیاں اور مختلف کھانوں میں استعمال ہوتے ہیں۔ یہ پودا تیزی سے بڑھتا ہے، ہلکے ٹھنڈے سے معتدل موسم میں بہترین پیداوار دیتا ہے اور گملوں یا چھوٹی جگہوں میں بھی اگایا جا سکتا ہے۔ دھنیا وٹامن سی، اینٹی آکسیڈنٹس اور ضروری تیلوں سے بھرپور ہوتا ہے۔`
);

// 2. Climate & Temperature
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "coriander",
  2,
  "2. Climate & Temperature",
  "2. آب و ہوا اور درجہ حرارت",
  `• Coriander prefers cool, dry climate for good leaf growth.
• Ideal temperature: 15–25°C.
• Very high temperatures cause bolting (premature flowering).
• Heavy rainfall damages young plants and increases leaf diseases.
• Sowing can be done nearly year-round in mild climates, but best seasons:
o October–November
o February–March
• Harvesting for leaves begins 25–30 days after sowing.
• Seed crop matures in 90–110 days.`,
  `• دھنیا ہلکے ٹھنڈے اور خشک موسم میں بہتر اگتا ہے۔
• مثالی درجہ حرارت 15–25 ڈگری سینٹی گریڈ ہے۔
• زیادہ گرمی میں پودا جلد پھول نکال لیتا ہے۔
• زیادہ بارش سے ننھے پودے خراب ہو جاتے ہیں اور پتوں کی بیماریاں بڑھتی ہیں۔
• بہترین کاشت کے موسم:
o اکتوبر–نومبر
o فروری–مارچ
• پتوں کی کٹائی بوائی کے 25–30 دن بعد شروع ہو جاتی ہے۔
• بیج کی فصل 90–110 دن میں تیار ہو جاتی ہے۔`
);

// 3. Soil
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "coriander",
  3,
  "3. Soil",
  "3. مٹی",
  `• Best soil: well-drained loam rich in organic matter.
• Soil pH: 6.0–7.0.
• Heavy or waterlogged soils cause root rot and poor leaf quality.
• Sandy soils need more organic manure.
• Proper land leveling helps in uniform moisture distribution.`,
  `• اچھی نکاسی والی اور نامیاتی مادے سے بھرپور میرا مٹی موزوں ہوتی ہے۔
• مٹی کا پی ایچ 6.0 سے 7.0 ہونا چاہیے۔
• بھاری یا پانی کھڑا ہونے والی زمین میں جڑیں سڑ جاتی ہیں۔
• ریتیلی مٹی میں زیادہ گوبر کی کھاد درکار ہوتی ہے۔
• کھیت کو اچھی طرح ہموار کرنا ضروری ہے۔`
);

// 4. Varieties
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "coriander",
  4,
  "4. Varieties",
  "4. اقسام",
  `Recommended coriander varieties in Pakistan:

Leafy (Green) Coriander Types
• Pak Green
• Local Punjab Selection
• Super Green
• Green Pearl
• Hara Dhaniya (Desi Selection)
• Capital Green

Seed/Grain Coriander Types
• Hybrid Coriander 204
• Sindh-97
• Desi Grain Coriander
• SS-Coriander Selection

Key traits
• Early maturity
• Strong aroma
• Heat tolerance (important for March sowing)
• High leaf yield and longer shelf life`,
  `پاکستان میں کاشت کی جانے والی دھنیا کی اقسام:

پتیدار (ہرا دھنیا) کی اقسام
• پاک گرین
• لوکل پنجاب سلیکشن
• سپر گرین
• گرین پرل
• دیسی ہرا دھنیا
• کیپیٹل گرین

بیج / خشک دھنیا کی اقسام
• ہائبرڈ 204
• سندھ–97
• دیسی بیج دھنیا
• SS سلیکشن

اہم خصوصیات
• جلد تیار ہونے والی اقسام
• خوشبودار پتے
• گرمی برداشت کرنے کی صلاحیت
• زیادہ پتوں والی اور دیر تک تازہ رہنے والی`
);

// 5. Land Preparation
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "coriander",
  5,
  "5. Land Preparation",
  "5. زمین کی تیاری",
  `• Plough the land 2–3 times to obtain fine tilth.
• Add well-decomposed FYM or compost before the last ploughing.
• Remove weeds and residues from previous crops.
• Prepare raised beds or flat beds depending on irrigation.
• Ensure proper leveling to avoid standing water.
• For pots: use soil + compost + sand mixture.`,
  `• زمین کو 2–3 مرتبہ ہل چلا کر نرم کریں۔
• آخری ہل سے پہلے گلی سڑی گوبر کی کھاد یا کمپوسٹ شامل کریں۔
• پچھلی فصل کی باقیات اور جڑی بوٹیاں صاف کریں۔
• آبپاشی کے مطابق اونچی یا فلیٹ کیاریاں بنائیں۔
• زمین کو ہموار رکھیں تاکہ پانی کھڑا نہ ہو۔
• گملوں کے لیے مٹی، کمپوسٹ اور ریت کا آمیزہ استعمال کریں۔`
);

// 6. Sowing / Planting
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "coriander",
  6,
  "6. Sowing / Planting",
  "6. بوائی / پودا لگانا",
  `• Coriander is direct seeded, not transplanted.
• Lightly crush (split) the seeds before sowing for better germination.
• Best sowing months:
o October–November
o February–March
• Sowing methods:
o Broadcasting
o Line sowing (20–25 cm row spacing)
• Cover seeds lightly with fine soil.
• Irrigate immediately after sowing.
• Avoid sowing during heavy rain or high temperature to prevent poor germination.`,
  `• دھنیا براہِ راست بویا جاتا ہے، نرسری نہیں بنائی جاتی۔
• بہتر اگاؤ کے لیے بیجوں کو ہلکا سا کچل کر بوئیں۔
• بہترین بوائی کے مہینے:
o اکتوبر–نومبر
o فروری–مارچ
• بوائی کے طریقے:
o چھٹہ
o قطاروں میں بوائی (20–25 سینٹی میٹر فاصلہ)
• بیجوں کو ہلکی باریک مٹی سے ڈھانپیں۔
• بوائی کے فوراً بعد پانی دیں۔
• شدید گرمی یا زیادہ بارش میں بوائی سے پرہیز کریں۔`
);

// 7. Seed / Propagation
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "coriander",
  7,
  "7. Seed / Propagation",
  "7. بیج / افزائش",
  `Seed Rate
• 4–6 kg per acre for leafy coriander.
• 6–8 kg per acre for seed (grain) crop.

Seed Treatment
• Treat seed with fungicide to prevent damping-off.
• Lightly crush/split seeds before sowing for faster germination.
• Use disease-free, clean seed.`,
  `بیج کی مقدار
• پتوں والی فصل کے لیے 4–6 کلو بیج فی ایکڑ۔
• بیج والی فصل کے لیے 6–8 کلو بیج فی ایکڑ۔

بیج کا علاج
• ڈیمپنگ آف سے بچاؤ کے لیے بیج کو فنجی سائیڈ سے ٹریٹ کریں۔
• بہتر اگاؤ کے لیے بیج ہلکا سا کچلیں۔
• صاف اور بیماری سے پاک بیج استعمال کریں۔`
);

// 8. Fertilizer
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "coriander",
  8,
  "8. Fertilizer",
  "8. کھاد",
  `• Apply FYM/compost (8–10 tons/acre) during field preparation.
• Basal application:
o Full phosphorus
o Full potash
• Apply nitrogen in two split doses:
o First: 20–25 days after sowing
o Second: at early leaf cutting stage
• Avoid excess nitrogen in seed crop.
• Micronutrients like boron improve seed setting.`,
  `• زمین کی تیاری کے وقت 8–10 ٹن فی ایکڑ گوبر کی کھاد یا کمپوسٹ ڈالیں۔
• بیسَل خوراک:
o مکمل فاسفورس
o مکمل پوٹاش
• نائٹروجن دو اقساط میں دیں:
o پہلی: بوائی کے 20–25 دن بعد
o دوسری: پتوں کی کٹائی کے ابتدائی مرحلے پر
• بیج والی فصل میں زیادہ نائٹروجن نہ دیں۔
• بوران جیسے مائیکرو نیوٹرینٹس بیج بننے میں مدد دیتے ہیں۔`
);

// 9. Weed Control
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "coriander",
  9,
  "9. Weed Control",
  "9. جڑی بوٹیوں کا کنٹرول",
  `• First 30 days are most critical for weed competition.
• Use hand weeding or light hoeing.
• Mulching with straw or dry leaves helps control weeds.
• Avoid deep hoeing as coriander has shallow roots.
• Herbicides can be used judiciously if required.`,
  `• ابتدائی 30 دن جڑی بوٹیوں کے کنٹرول کے لیے بہت اہم ہوتے ہیں۔
• ہاتھ سے گوڈی یا ہلکی کھرپائی کریں۔
• بھوسہ یا خشک پتوں سے ملچنگ جڑی بوٹیوں کو کم کرتی ہے۔
• گہری گوڈی سے پرہیز کریں کیونکہ دھنیا کی جڑیں سطح کے قریب ہوتی ہیں۔
• ضرورت کے مطابق جڑی بوٹی مار ادویات استعمال کی جا سکتی ہیں۔`
);

// 10. Irrigation
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "coriander",
  10,
  "10. Irrigation",
  "10. آبپاشی",
  `• First irrigation immediately after sowing.
• Subsequent irrigation every 7–10 days depending on season.
• Avoid over-watering as coriander is sensitive to waterlogging.
• Maintain moisture during leaf harvesting.
• Reduce irrigation at maturity for seed crop.`,
  `• پہلی آبپاشی بوائی کے فوراً بعد کریں۔
• موسم کے مطابق ہر 7–10 دن بعد پانی دیں۔
• زیادہ پانی دینے سے گریز کریں کیونکہ دھنیا پانی کھڑا ہونے سے متاثر ہوتا ہے۔
• پتوں کی کٹائی کے دوران نمی برقرار رکھیں۔
• بیج والی فصل میں پکنے کے وقت پانی کم کریں۔`
);

// 11. Pest & Disease Management
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "coriander",
  11,
  "11. Pest & Disease Management",
  "11. بیماریوں اور کیڑوں کا کنٹرول",
  `Major pests
• Aphids: sap sucking, curling leaves, stunted growth.
• Leaf miner: serpentine mines in leaves.
• Cutworms: cut seedlings at ground level.
• Thrips: leaf silvering and tip drying.

Pest management
• Remove infested leaves.
• Use yellow sticky traps for aphids & thrips.
• Keep field weed-free.
• Apply recommended insecticides at early infestation.
• Avoid excessive nitrogen that promotes soft leaf growth.

Major diseases
• Damping-off: seedling collapse in nursery.
• Powdery mildew: white powder on leaves.
• Leaf spot: brown/black lesions.
• Stem rot: rotting at base in wet soils.

Disease management
• Treat seed before sowing.
• Use well-drained soil to prevent damping-off.
• Spray sulfur-based fungicide for powdery mildew.
• Avoid overcrowding to improve air flow.
• Remove heavily infected plants.`,
  `اہم کیڑے
• افیڈز: رس چوسنا، پتوں کا مُڑ جانا، بڑھوتری رک جانا۔
• لیف مائنر: پتوں میں سانپ جیسی لکیریں بننا۔
• کٹ ورم: ننھے پودوں کو زمین کی سطح سے کاٹ دینا۔
• تھرپس: پتوں پر چاندی جیسا رنگ اور سِروں کا سوکھ جانا۔

کیڑوں کا کنٹرول
• متاثرہ پتے ہٹا دیں۔
• افیڈز اور تھرپس کے لیے پیلے چپکنے والے ٹریپس لگائیں۔
• کھیت کو جڑی بوٹیوں سے صاف رکھیں۔
• حملہ شروع ہوتے ہی تجویز کردہ زرعی زہروں کا استعمال کریں۔
• زیادہ نائٹروجن سے پرہیز کریں۔

اہم بیماریاں
• ڈیمپنگ آف: پنیری/ننھے پودوں کا گر جانا۔
• پاؤڈری میلڈیو: پتوں پر سفید سفوف۔
• لیف اسپاٹ: پتوں پر بھورے یا کالے دھبے۔
• اسٹیم روٹ: گیلی مٹی میں تنے کے نچلے حصے میں سڑن۔

بیماریوں کا کنٹرول
• بوائی سے پہلے بیج ٹریٹ کریں۔
• اچھی نکاسی والی مٹی استعمال کریں۔
• پاؤڈری میلڈیو کے لیے سلفر والے فنجی سائیڈ کا سپرے کریں۔
• زیادہ گنجان کاشت سے پرہیز کریں۔
• زیادہ متاثرہ پودے تلف کر دیں۔`
);

// 12. Deficiencies & Remedies
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "coriander",
  12,
  "12. Deficiencies & Remedies",
  "12. غذائی کمی اور حل",
  `Nitrogen deficiency
Light green leaves, slow growth.
Apply nitrogen in split doses.

Phosphorus deficiency
Purplish leaves, weak root development.
Apply basal phosphorus.

Potassium deficiency
Leaf edge yellowing and tip burn.
Apply potash during growth stage.

Boron deficiency
Poor seed formation in seed crop.
Apply boron in small dose.`,
  `نائٹروجن کی کمی
پتے ہلکے سبز، بڑھوتری کم۔

نائٹروجن قسطوں میں دیں۔

فاسفورس کی کمی
پتوں پر جامنی جھلک، کمزور جڑیں۔

بیسال فاسفورس دیں۔

پوٹاش کی کمی
پتوں کے کنارے پیلے اور سِرے جل جانا۔
پوٹاش بڑھوتری کے دوران دیں۔

بوران کی کمی
بیج والی فصل میں بیج صحیح نہ بننا۔
بوران کم مقدار میں دیں۔`
);

// 13. Harvesting
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "coriander",
  13,
  "13. Harvesting",
  "13. کٹائی",
  `• For leaf coriander: harvest 25–30 days after sowing.
• Cut leaves 2–3 inches above ground to allow regrowth.
• For seed crop: harvest when plants turn brown.
• Harvest during cool hours.
• Dry seed umbels in shade before threshing.`,
  `• ہرا دھنیا بوائی کے 25–30 دن بعد کاٹا جاتا ہے۔
• دوبارہ بڑھوتری کے لیے پتے زمین سے 2–3 انچ اوپر سے کاٹیں۔
• بیج والی فصل اس وقت کاٹیں جب پودے بھورے ہو جائیں۔
• کٹائی ٹھنڈے وقت میں کریں۔
• بیج نکالنے سے پہلے انہیں سایہ میں خشک کریں۔`
);

// 14. Post-Harvest / Storage
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "coriander",
  14,
  "14. Post-Harvest / Storage",
  "14. بعد از برداشت / ذخیرہ",
  `• Wash leaves gently and bundle neatly.
• Keep harvested leaves in shade to retain freshness.
• Store in cool and humid conditions.
• Refrigeration extends shelf life.
• Store dried seeds in airtight containers.
• Keep away from moisture to prevent fungal growth.`,
  `• پتوں کو ہلکے ہاتھ سے دھو کر صاف گٹھیاں بنا لیں۔
• تازگی برقرار رکھنے کے لیے پتوں کو سایہ میں رکھیں۔
• ٹھنڈی اور قدرے نم جگہ پر ذخیرہ کریں۔
• فریج میں رکھنے سے تازگی زیادہ دیر برقرار رہتی ہے۔
• خشک بیج ہوا بند برتنوں میں رکھیں۔
• نمی سے دور رکھیں تاکہ پھپھوندی نہ لگے۔`
);


 // ---------------- WHEAT (CROP) ----------------
await db.runAsync(
  `INSERT INTO plants (id, name_en, name_ur, type)
   VALUES (?, ?, ?, ?);`,
  "wheat",
  "Wheat",
  "گندم",
  "crop"
);

// 1. General Information
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "wheat",
  1,
  "1. General Information",
  "1. عمومی معلومات",
  `Wheat (Triticum aestivum) is Pakistan’s most important staple food and major Rabi cereal crop. It plays a vital role in national food security, contributes to social stability, and is cultivated on the largest agricultural area in the country. Punjab is the main wheat-producing province. Increasing per-acre yield is essential due to rising population and global food price trends. High yield can be achieved by using certified improved varieties, balanced fertilizer, proper irrigation scheduling, and adopting modern production technologies.`,
  `گندم (Triticum aestivum) پاکستان کی سب سے اہم غذائی اور ربیع اناجی فصل ہے۔ یہ ملکی غذائی سلامتی اور معاشرتی استحکام میں اہم کردار ادا کرتی ہے اور سب سے زیادہ رقبہ پر کاشت کی جاتی ہے۔ پنجاب گندم پیدا کرنے والا سب سے بڑا صوبہ ہے۔ بڑھتی ہوئی آبادی اور عالمی خوراک کی قیمتوں میں اضافے کے باعث فی ایکڑ پیداوار میں اضافہ ناگزیر ہے۔ اعلیٰ پیداوار کے لیے تصدیق شدہ اقسام، متوازن کھاد، مناسب آبپاشی شیڈول اور جدید زرعی ٹیکنالوجی کا استعمال ضروری ہے۔`
);

// 2. Climate
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "wheat",
  2,
  "2. Climate",
  "2. آب و ہوا",
  `Wheat is a cool-season Rabi crop. Ideal sowing time in irrigated Punjab is 1–20 November, extendable to 30 November, and in emergency for certain varieties (Urooj, Akbar, Bhakkar Star) up to 10 December.
In rainfed areas, wheat is sown from 15 October to 15 November, depending on soil moisture from monsoon rains.

Late sowing reduces tillering, shortens grain-filling, reduces spike length and grains per spike due to higher temperatures during reproductive stages.

Climate change effects include:
Higher-than-normal December temperature harming October-sown wheat
High temperatures in March–April reducing tillering and grain weight`,
  `گندم ٹھنڈے موسم کی ربیع فصل ہے۔ پنجاب کے نہری علاقوں میں بہترین کاشت کا وقت 1 تا 20 نومبر ہے جبکہ کاشت 30 نومبر تک کی جاسکتی ہے۔ کچھ اقسام (عروج، اکبر، بھکر اسٹار) میں مجبوری کی صورت میں 10 دسمبر تک بھی کاشت ممکن ہے۔

بارانی علاقوں میں کاشت کا وقت 15 اکتوبر تا 15 نومبر ہے، جو مون سون کی نمی پر منحصر ہوتا ہے۔

دیر سے کاشت کے نقصانات:
کم شاخیں (Tillering)
دانہ بھرنے کا کم وقت
کم لمبی بالیاں
کم دانے فی بالی

موسمیاتی تبدیلیاں:
دسمبر میں زیادہ درجہ حرارت، اکتوبر میں کاشت شدہ گندم کو نقصان
مارچ–اپریل میں گرمی سے شاخیں اور دانے متاثر`
);

// 3. Soil Requirements
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "wheat",
  3,
  "3. Soil Requirements",
  "3. مٹی کی ضروریات",
  `Wheat performs best in well-drained loam to clay-loam soils with good structure and moderate organic matter.
Proper land leveling is essential for uniform irrigation, seed placement, fertilizer distribution, and improved germination.

Organic matter in Pakistani soils is typically low. Recommended practices:
Apply 8–10 tons per acre of well-decomposed FYM
Green manuring using Guara, Jantar, or Sesbania 2–3 years intervals
Avoid burning residues; incorporate them to improve fertility

In saline or poorly drained soils, use raised beds, zero tillage, and careful water management`,
  `گندم بہتر طور پر میرا سے بھاری میرا، اچھی نکاسی والی زرخیز مٹی میں اگتی ہے۔
زمین کا ہم وار ہونا یکساں آبپاشی، بیج کی گہرائی، کھاد کی مساوی تقسیم اور بہتر اگاؤ کے لیے ضروری ہے۔

پاکستانی زمینوں میں نامیاتی مادہ کم ہوتا ہے، اس لیے:
8–10 ٹن فی ایکڑ گلی سڑی گوبر کی کھاد استعمال کریں
گوارا، جنتر یا سیزبینا جیسی سبز کھاد ہر 2–3 سال بعد استعمال کریں
فصل کی باقیات بالکل نہ جلائیں، زمین میں ملائیں

نمکیات والی یا کم نکاسی والی زمین میں اونچی کیاریاں، زیرو ٹیلج اور مناسب آبپاشی ضروری ہے`
);

// 4. Varieties  ✅ MOVED HERE (as per your skeleton)
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "wheat",
  4,
  "4. Varieties",
  "4. اقسام",
  `1. Recommended Varieties for Irrigated Areas (Punjab)
These varieties perform best in canal-irrigated, fertile soils with good moisture:
Sawaira-24 (2025) – High yield, good grain size
Falak-24 (2025) – Strong tillering, stable under variable weather
Champion (2025) – Suited for southern irrigated zones
Urooj-22 (2022) – Heat tolerant, widely adaptable
Nishan-21 (2021) – Excellent grain weight, dual-zone approval
Dilkash-20 (2021) – Good spike size, suitable for Punjab plains
Subhani-21 (2021) – Strong disease tolerance
MH-21 (2021) – Suitable for timely sowing
Durum-21 (2021) – Industrial variety (pasta/noodles)
Sadiq-21 (2021) – Performs well in South Punjab
Nawab-21 (2021) – Zinc-rich variety
NARC Par (2021) – Good performance under high temperatures
Akbar-19 (2019) – Heat tolerant and zinc-enriched
Bhakkar Star-19 (2019) – Suitable for hot, irrigated zones
Ghazi-19 (2019) – Strong disease resistance
Fakhar Bhakkar-17 (2017) – Good yield stability
Anaaj-17 (2017) – Reliable for timely sowing
Ujala-16 (2016) – Drought durable
Zincol-16 (2016) – High zinc content
Borlaug-16 (2016) – Early maturity
Jauhar-16 (2016) – Good grain quality
Faisalabad-2008 – Widely grown but rust-susceptible

2. Recommended Varieties for Rainfed (Barani) Areas
Shiraz-23 (2025) – New high-yield barani variety
Urooj-22 (2022) – Performs well under variable rainfall
Nishan-21 (2021) – Suitable for low-moisture areas
MA-21 (2021) – Good drought tolerance
Pakistan-13 (2013) – Traditional barani variety
Barani-17 (2017) – Early maturing
Fateh Jang-16 (2016) – Suited to Potohar region
Unreleased NARC line (2019) – Specialized for dryland conditions

3. Important Notes About Varieties (AARI Guidance)
Dual-zone varieties:
Urooj-22 and Nishan-21 are approved for both irrigated and rainfed areas.

Heat-tolerant varieties:
Urooj-22
Akbar-19
Bhakkar Star-19

High Zinc (biofortified) varieties:
Akbar-19
Nawab-21
Zincol-16

Rust-susceptible varieties (should be grown on small area only):
Faisalabad-2008
Pakistan-13
Barani-17

Industrial-use variety:
Durum-21 is specifically used for pasta/noodle products.`,
  `1. نہری علاقوں (Irrigated) کے لئے اقسام
سوائرا–24 (2025) – زیادہ پیداوار، اچھا دانہ
فلک–24 (2025) – مضبوط ٹلرنگ، موسمی برداشت
چیمپئن (2025) – جنوبی پنجاب کے لئے موزوں
عروج–22 (2022) – گرمی برداشت، ہر علاقے میں موزوں
نشان–21 (2021) – بہترین دانہ وزن، دونوں زونز میں منظور شدہ
دلکش–20 (2021) – اچھی بالی، پنجاب کے میدانوں کے لئے موزوں
سبحانی–21 (2021) – بیماریوں کے خلاف بہتر
MH–21 (2021) – بروقت کاشت کے لئے اچھی
ڈُرَم–21 (2021) – صنعتی استعمال (پاستا/نوڈلز)
صادق–21 (2021) – جنوبی پنجاب میں بہتر
نواب–21 (2021) – زنک سے بھرپور قسم
نARC پار (2021) – زیادہ درجہ حرارت میں بہتر
اکبر–19 (2019) – حرارت برداشت + زنک زیادہ
بھکر اسٹار–19 (2019) – گرم علاقوں کے لئے موزوں
غازی–19 (2019) – بیماریوں کے خلاف مضبوط
فخر بھکر–17 (2017) – مستحکم پیداوار
انآج–17 (2017) – بروقت کاشت کے لئے مناسب
اجالا–16 (2016) – خشک سالی برداشت
زنکول–16 (2016) – زنک زیادہ
بورلاگ–16 (2016) – جلد تیار ہونے والی
جوہر–16 (2016) – اچھا دانہ کوالٹی
فیصل آباد–2008 – عام لیکن رسٹ کے لیے حساس

2. بارانی علاقوں (Rainfed/Barani) کے لئے اقسام
شیراز–23 (2025) – نئی زیادہ پیداواری بارانی قسم
عروج–22 (2022) – کم نمی میں بھی بہتر
نشان–21 (2021) – آب و ہوا کی کمی میں اچھی
MA–21 (2021) – بہترین خشکی برداشت
پاکستان–13 (2013) – روایتی بارانی قسم
بارانی–17 (2017) – جلد تیار ہونے والی
فتح جنگ–16 (2016) – پوٹھوہار کے لئے موزوں
نARC 2019 لائن – خشک علاقوں کے لئے خصوصی

3. اہم نکات (AARI کی رہنما ہدایات)
دونوں علاقوں (نہری + بارانی) میں منظور شدہ اقسام:
عروج–22
نشان–21

گرمی برداشت کرنے والی اقسام:
عروج–22
اکبر–19
بھکر اسٹار–19

زنک سے بھرپور اقسام:
اکبر–19
نواب–21
زنکول–16

رسٹ کے لئے حساس اقسام (کم رقبے پر کاشت):
فیصل آباد–2008
پاکستان–13
بارانی–17

صنعتی قسم:
ڈُرَم–21 — پاستا/نوڈلز کے لئے موزوں`
);

// 5. Land Preparation
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "wheat",
  5,
  "5. Land Preparation",
  "5. زمین کی تیاری",
  `Land preparation depends on previous crop and soil moisture:

After Rice:
Stop rice irrigation 15–25 days before harvest
Run rotavator once or disc harrow twice in moist soil
Do not burn rice stubble; incorporate residue
Use Zero Tillage Drill or Super Seeder where available

After Cotton/Maize/Sugarcane:
Rauni (pre-sowing irrigation) is applied 15–20 days before land prep
Plow twice, then use rotavator/disc harrow
Level field using Laser Leveler
Make small beds (Kiaray) in heavy soils

For dry soils:
Run plow twice + rotavator
Maintain seed depth ≤ 1 inch`,
  `زمین کی تیاری پچھلی فصل اور نمی پر منحصر ہے:

چاول کے بعد:
آبپاشی 15–25 دن پہلے روک دیں
رائس کی باقیات نہ جلائیں، زمین میں ملائیں
روٹا ویٹر ایک بار یا ڈسک ہیرو دو بار چلائیں
زیرو ٹیلج ڈرل / سپر سیڈر استعمال کیا جا سکتا ہے

کپاس/مکئی/گنا کے بعد:
راونی آبپاشی 15–20 دن پہلے کریں
دو بار ہل، ایک بار روٹا ویٹر
لیزر لیولر سے ہم وار کریں
بھاری زمین میں کیاریاں بنائیں

خشک زمین میں:
دو بار ہل + ایک بار روٹا ویٹر
بیج کی گہرائی 1 انچ سے زیادہ نہ ہو`
);

// 6. Sowing Method
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "wheat",
  6,
  "6. Sowing Method",
  "6. کاشت کے طریقے",
  `Sowing Windows:
Irrigated areas: 1–20 Nov (best), up to 30 Nov, extremely late 1–10 Dec
Rainfed: 15 Oct–15 Nov

Methods:
Drill Sowing (recommended)
Ensures uniform depth and plant population
Better fertilizer placement

Bed Planting
Suitable for heavy soils
Protects from waterlogging, improves drainage

Broadcast + Planking
Used in saline soils
Seeds may be partially soaked before broadcasting

Zero Tillage
Best after rice
Saves time and fuel`,
  `کاشت کا وقت:
نہری علاقے: 1–20 نومبر بہترین, 30 نومبر تک ممکن، انتہائی تاخیر پر 1–10 دسمبر
بارانی علاقے: 15 اکتوبر–15 نومبر

کاشت کے طریقے:
ڈرِل سے کاشت (بہترین)
یکساں گہرائی
کھاد کی بہتر تقسیم

بیڈ پلانٹنگ
بھاری زمین کے لیے موزوں
پانی کھڑا نہیں ہوتا

چوگہ + سہاگہ
شور زدہ زمین کے لیے مفید
بیج کو آدھا بھگو کر بھی لگا سکتے ہیں

زیرو ٹیلج
چاول کے بعد بہترین
وقت اور ڈیزل کی بچت`
);

// 7. Seed (Seed Rate + Seed Treatment)
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "wheat",
  7,
  "7. Seed (Seed Rate + Seed Treatment)",
  "7. بیج (مقدار اور ٹریٹمنٹ)",
  `Seed Rate (Irrigated Areas):
40 kg/acre — Sown on time (1–20 November)
45 kg/acre — Late sowing (21–30 November)
50 kg/acre — Very late sowing (1–10 December)

Seed Rate (Rainfed Areas):
50 kg/acre (due to lower germination moisture)

Seed Selection Guidelines:
Use certified, disease-free, high-vigor seed
Minimum 1000-grain weight should be ≥33g
Use approved varieties for irrigated or rainfed zones

Seed Treatment:
To prevent seed-borne diseases (Smut, Karnal Bunt, Wheat Blast, Foot Rot):
Thiophanate Methyl @ 2–2.5 g per kg seed
OR
Imidacloprid + Tebuconazole @ 2 mL per kg seed

How to Treat Seed:
Best: Use a rotating drum
Or: Place seed + chemical in a plastic bag
Shake well; bag should be half-filled only`,
  `بیج کی مقدار (نہری علاقے):
40 کلو فی ایکڑ — بروقت کاشت (1–20 نومبر)
45 کلو فی ایکڑ — تاخیر سے کاشت (21–30 نومبر)
50 کلو فی ایکڑ — بہت دیر سے کاشت (1–10 دسمبر)

بیج کی مقدار (بارانی علاقے):
50 کلو فی ایکڑ (کم نمی کے باعث)

اچھا بیج منتخب کرنے کے اصول:
تصدیق شدہ، بیماری سے پاک بیج
1000 دانوں کا وزن 33 گرام یا زیادہ ہونا چاہیے
علاقے کے مطابق منظور شدہ اقسام استعمال کریں

بیج پر زہر لگانا:
بیج کو ان بیماریوں سے بچانے کے لیے: سمیٹ، کرنا بَنٹ، وہیٹ بلاسٹ، فٹ روٹ:
تھیوفینیٹ میتھائل @ 2–2.5 گرام فی کلو بیج
یا
امیڈاکلوپرڈ + ٹیبوکونازول @ 2 ملی لیٹر فی کلو بیج

بیج پر زہر لگانے کا طریقہ:
بہترین: روٹیٹنگ ڈرم استعمال کریں
یا: بیج + زہر پلاسٹک بیگ میں ڈال کر اچھی طرح ہلائیں
تھیلی آدھی بھری ہو تاکہ مکسنگ اچھی ہو`
);

// 8. Fertilizer
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "wheat",
  8,
  "8. Fertilizer",
  "8. کھاد",
  `Standard Fertilizer Requirement:
(Based on soil fertility & crop variety)
Nitrogen (N): 55–69 kg/acre
Phosphorus (P): 36–41 kg/acre
Potassium (K): 25–32 kg/acre

Application Schedule:
Apply full phosphorus and half potassium at land preparation
Apply nitrogen in two splits:
1st split: 15–20 days after sowing
2nd split: 35–40 days after sowing

If previous crop was Berseem or Pulses:
Reduce nitrogen dose by 20%

Potassium:
Must be applied in tube well irrigated areas

Alternative Fertilizer Options:
Single Super Phosphate (SSP):
3–4 bags SSP + ½ bag Urea + 1 bag SOP (Sulphate of Potash)

Nitrophos (NP):
1 bag NP + 1 to 1.5 bags SSP + 1 bag SOP at land prep
1 bag NP + 1 bag Urea at first irrigation

Bio-Organic Phosphate (BOP):
Add 2 bags per acre along with DAP reduction
Helps solubilize phosphorus & adds organic matter

Zinc:
Apply:
6 kg/acre → Zinc sulfate 27%
OR
10 liters/acre → Zinc sulfate 10%
OR
2 kg/acre → Zinc EDTA (chelated)`,
  `کھاد کی ضرورت:
(مٹی کی طاقت اور قسم کے مطابق)
نائٹروجن (N): 55–69 کلو فی ایکڑ
فاسفورس (P): 36–41 کلو فی ایکڑ
پوٹاش (K): 25–32 کلو فی ایکڑ

کھاد ڈالنے کا شیڈول:
ساری فاسفورس + آدھی پوٹاش زمین کی تیاری پر
نائٹروجن دو قسطوں میں دیں:
پہلی قسط: کاشت کے 15–20 دن بعد
دوسری قسط: 35–40 دن بعد

اگر پچھلی فصل برسیم/دالیں ہوں:
نائٹروجن کی مقدار 20٪ کم دیں

پوٹاش:
ٹیوب ویل علاقوں میں اس کا استعمال لازمی ہے

متبادل کھادیں:
ایس ایس پی (SSP):
3–4 بوری SSP + آدھی بوری یوریا + 1 بوری SOP

نائٹروفاس (NP):
1 بوری NP + 1–1.5 بوری SSP + 1 بوری SOP زمین کی تیاری پر
1 بوری NP + 1 بوری یوریا پہلی آبپاشی پر

بائیو آرگینک فاسفیٹ (BOP):
2 بوری فی ایکڑ
فاسفورس کو قابلِ استعمال بناتا ہے، نامیاتی مادہ بڑھاتا ہے

زنک:
6 کلو/ایکڑ (27٪ زنک سلفیٹ)
یا
10 لیٹر/ایکڑ (10٪ زنک سلفیٹ)
یا
2 کلو/ایکڑ (EDTA زنک)`
);

// 9. Weed Control
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "wheat",
  9,
  "9. Weed Control",
  "9. جڑی بوٹیوں کا کنٹرول",
  `Types of Weeds in Wheat:
Broad-leaf weeds
Narrow-leaf (grassy) weeds

Cultural Control:
Crop rotation every 2–3 years
Double-bar harrow after 1st irrigation
Hand weeding (small fields)
“Daab Method” → Allow weeds to germinate then kill them during final land prep

Chemical Control (Herbicides):
Broad-leaf weeds:
Spray after first irrigation

Narrow-leaf weeds:
Spray after second irrigation

Herbicides controlling both:
Apply at 40–45 days after sowing

(Exact chemical tables in PDF — not reproduced here since you don’t want chemicals in DB.)`,
  `گندم میں جڑی بوٹیوں کی اقسام:
چوڑی پتی والی
باریک پتی والی (گھاس نما)

غیر کیمیائی کنٹرول:
فصلوں کی روٹیشن ہر 2–3 سال بعد
پہلی آبپاشی کے بعد دوہرا ہیرو
ہاتھ سے گوڈی (چھوٹے رقبے)
“ڈاب طریقہ” → جڑی بوٹیاں اگنے دیں، پھر زمین کی تیاری پر مار دیں

کیمیائی کنٹرول:
چوڑی پتی والی:
پہلی آبپاشی کے بعد اسپرے

باریک پتی والی:
دوسری آبپاشی کے بعد اسپرے

دونوں کو قابو کرنے والی ادویات:
40–45 دن بعد اسپرے کریں`
);

// 10. Irrigation
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "wheat",
  10,
  "10. Irrigation",
  "10. آبپاشی",
  `Irrigation Schedule (Irrigated Areas):
CRI Stage (Crown Root Initiation): 20–25 days after sowing
Tillering/Booting: 70–80 days
Milk Stage: 110–115 days

Irrigation After Cotton/Maize/Sugarcane:
Same 3 irrigations at the above stages
Add extra irrigation if weather is hot & dry

Irrigation After Rice:
Soil remains moist from rice
1st irrigation 35–45 days after sowing
2nd irrigation: 80–90 days

Thal/Hot Sandy Areas:
Wheat requires around 6 irrigations:
20–25 days
40–45 days
70–75 days
90–95 days
110–115 days
130–135 days

Irrigation Precautions:
Level field
Make small beds
Avoid waterlogging

Final irrigation:
15 March (South Punjab)
25 March (Central/North Punjab)`,
  `آبپاشی کا شیڈول (نہری علاقے):
شاخیں نکلنے کا وقت (CRI): کاشت کے 20–25 دن بعد
گو بھ/ٹیٹورا: 70–80 دن
دودھیا حالت (Milk Stage): 110–115 دن

کپاس/مکئی/گنے کے بعد:
یہی تین آبپاشیاں
گرم خشک موسم میں اضافی پانی دیں

چاول کے بعد:
زمین میں نمی زیادہ ہوتی ہے
پہلی آبپاشی: 35–45 دن بعد
دوسری آبپاشی: 80–90 دن بعد

تھل/ریتیلی زمین:
کل 6 آبپاشیاں:
20–25 دن
40–45 دن
70–75 دن
90–95 دن
110–115 دن
130–135 دن

احتیاطی تدابیر:
زمین ہم وار ہو
چھوٹی کیاریاں بنائیں
پانی کھڑا نہ ہونے دیں

آخری آبپاشی:
15 مارچ (جنوبی پنجاب)
25 مارچ (وسط/شمالی پنجاب)`
);

// 11. Pest & Disease Management (Plant Protection)
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "wheat",
  11,
  "11. Pest & Disease Management",
  "11. بیماریوں اور کیڑوں کا کنٹرول",
  `Common Wheat Diseases:
Rust (Kangi)
Yellow/orange pustules on leaves
Reduces grain weight and tillers

Smut & Loose Smut
Black powder replacing grain
Controlled by seed treatment

Karnal Bunt
Fishy odor, blackened grains

Foot Rot (Akheera)
Seedling death, weak roots

Wheat Blast (Emerging Threat)
Spike bleaching
Severely reduces grain formation

Termite Attack (Rainfed Areas)
Plant wilting, missing patches

Major Pests:
Aphids
Armyworms
Termites
Grasshoppers

General Control Measures:
Use certified, disease-free seed
Treat seed before sowing
Use resistant varieties
Remove volunteer plants
Avoid late sowing (higher disease pressure)
Follow proper irrigation & balanced fertilizer`,
  `گندم کی عام بیماریاں:
رسٹ (کانگی)
پتوں پر پیلے/نارنجی چھالے
دانے کا وزن اور شاخیں کم

سمٹ / لوز سمٹ
دانوں کی جگہ کالا پاؤڈر
بیج پر زہر لگانے سے کنٹرول

کرنل بنٹ
دانے کا سیاہ ہونا، بدبو آنا

فٹ روٹ (آخیرہ)
پودا مرجھا جاتا ہے، جڑیں کمزور

وہیٹ بلاسٹ
بالی سفید ہو جاتی ہے
دانہ نہیں بنتا

دیمک (بارانی علاقوں میں زیادہ)
پودا جھڑ جاتا ہے، جگہ جگہ خالی ایریا

اہم کیڑے:
چیچڑیاں (Aphids)
آرمی ورم
دیمک
ٹڈیاں

کنٹرول کے اقدامات:
تصدیق شدہ بیج استعمال کریں
بیج پر زہر لگائیں
مزاحم اقسام اگائیں
جنگلی گندم کے پودے ختم کریں
دیر سے کاشت سے بچیں
مناسب کھاد اور آبپاشی شیڈول اپنائیں`
);

// 12. Deficiency & Remedies
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "wheat",
  12,
  "12. Deficiencies & Remedies",
  "12. غذائی کمی اور حل",
  `1. Nitrogen Deficiency
Symptoms:
Pale green leaves
Reduced tillering
Slow growth
Weak stems

Remedy:
Apply recommended nitrogen dose in splits
Increase dose if crop is pale (based on soil analysis)

2. Phosphorus Deficiency
Symptoms:
Purplish leaves
Poor root development
Late maturity

Remedy:
Apply full P dose at sowing
If missed, apply at first irrigation

3. Potassium Deficiency
Symptoms:
Leaf margins turning brown (scorching)
Poor drought tolerance

Remedy:
Use SOP or MOP as per recommended K dose
Potassium is essential in tube well irrigated areas

4. Zinc Deficiency
Symptoms:
Brown lesions on leaves
Reduced tillering
Stunted plants

Remedy:
Apply:
6 kg/acre → Zinc sulfate 27%
OR 10 liters/acre → Zinc sulfate 10%
OR 2 kg/acre → Zinc EDTA (chelated)
Keep 15–20 days gap between Zinc and Phosphorus (except EDTA)

5. Boron Deficiency
Symptoms:
Rolled leaf tips
White streaks on emerging leaves

Remedy:
Apply Boron at booting stage:
125 g of 20% Boron powder
OR 500 mL of 5% Boron liquid`,
  `1. نائٹروجن کی کمی
علامات:
ہلکا سبز رنگ
کم شاخیں
کمزور بڑھوتری
ڈنٹھل کمزور

حل:
نائٹروجن دو قسطوں میں دیں
اگر فصل ہلکی سبز ہو تو مقدار بڑھائیں

2. فاسفورس کی کمی
علامات:
پتوں پر جامنی رنگ
کمزور جڑیں
دیر سے پکنا

حل:
پوری فاسفورس کاشت کے وقت
اگر رہ جائے تو پہلی آبپاشی میں دیں

3. پوٹاش کی کمی
علامات:
پتیوں کے کنارے جلنا
خشک سالی برداشت کم

حل:
SOP یا MOP کھاد استعمال کریں
ٹیوب ویل علاقوں میں پوٹاش بہت ضروری ہے

4. زنک کی کمی
علامات:
پتوں پر بھورے دھبے
کم شاخیں
پودا بونا رہ جانا

حل:
زنک سلفیٹ 27% → 6 کلو فی ایکڑ
یا زنک سلفیٹ 10% → 10 لیٹر فی ایکڑ
یا زنک ایڈی ٹی اے → 2 کلو فی ایکڑ
فاسفورس اور زنک کے استعمال میں 15–20 دن کا وقفہ رکھیں (ایڈی ٹی اے مستثنیٰ)

5. بوران کی کمی
علامات:
پتے رول ہونا
نئی پتیاں سفید نوک کے ساتھ نکلنا

حل:
بوٹنگ اسٹیج پر استعمال کریں:
20% بوران → 125 گرام
یا 5% مائع بوران → 500 ملی لیٹر`
);

// 13. Harvesting
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "wheat",
  13,
  "13. Harvesting",
  "13. کٹائی",
  `Harvest Time:
Wheat is ready to harvest when:
Grains are hard
Moisture is around 20–22%
Straw is golden yellow

Precautions:
Avoid late harvesting to prevent shattering & grain loss
Harvest uniformly to ensure clean threshing
Avoid harvesting during rain or high moisture conditions

Threshing:
Combine harvesters should be properly calibrated
Avoid too low or too high fan speed to reduce grain breakage
Burning residues should be avoided (nutrient loss, pollution, soil health damage)`,
  `کٹائی کا وقت:
گندم اُس وقت تیار ہوتی ہے جب:
دانہ سخت ہو جائے
نمی 20–22٪ ہو
پُھوگ سنہری رنگ کی ہو

احتیاطیں:
دیر سے کٹائی سے دانہ جھڑنے کا خطرہ
بارش یا زیادہ نمی میں کٹائی نہ کریں
یکساں کٹائی سے تھریشنگ بہتر ہوتی ہے

تھریشنگ:
کمبائن ہارویسٹر صحیح سیٹنگ کے ساتھ استعمال کریں
زیادہ یا کم ہوا کی رفتار سے دانہ ٹوٹ سکتا ہے
فصل کی باقیات نہ جلائیں — مٹی کی زرخیزی کم ہوتی ہے، آلودگی بڑھتی ہے`
);

// 14. Post-Harvest / Storage
await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "wheat",
  14,
  "14. Post-Harvest / Storage",
  "14. بعد از برداشت / ذخیرہ",
  `Drying:
Dry grains to 10–12% moisture before storage
Use sunlight or mechanical dryers

Cleaning:
Remove straw pieces, chaff, stones, shriveled grains

Storage Conditions:
Use clean, dry bags (preferably jute or airtight plastic)
Store in a cool, ventilated place
Keep storage area free from pests
Fumigate or treat storage containers if needed

Protection from Pests:
Maintain low humidity
Clean storage floor and walls
Use pallets to keep bags off the ground

Handling:
Avoid overfilling bags
Keep different variety lots separate`,
  `خشک کرنا:
ذخیرہ کرنے سے پہلے نمی 10–12٪ تک کم کریں
دھوپ یا مکینیکل ڈرائر استعمال کریں

صفائی:
تنکے، پھوگ، پتھر اور کمزور دانے نکال دیں

ذخیرہ:
صاف اور خشک بوریاں (گنا یا پلاسٹک کی) استعمال کریں
ٹھنڈی اور ہوا دار جگہ میں رکھیں
گودام صاف، خشک اور کیڑوں سے پاک ہونا چاہیے
ضرورت پڑنے پر اسٹور کی جراثیم کشی کریں

کیڑوں سے بچاؤ:
نمی کم رکھیں
فرش اور دیواریں صاف ہوں
بوریاں زمین سے اوپر رکھیں (پیلٹ پر)

ہینڈلنگ:
بوریاں زیادہ نہ بھری جائیں
مختلف اقسام کی گندم الگ رکھیں`
);




/// ---------------- MAIZE (CROP) ----------------

await db.runAsync(
  `INSERT INTO plants (id, name_en, name_ur, type)
   VALUES (?, ?, ?, ?);`,
  "maize",
  "Maize",
  "مکئی",
  "crop"
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "maize",
  1,
  "1. General Information",
  "1. عمومی معلومات",
  `Maize (corn) is an important cash crop of Punjab and Pakistan. Two maize crops are grown every year: a Spring (Baharia) crop and a Monsoon / Kharif crop. Most of the maize produced is used in poultry feed, while the rest is used for human food (starch, edible oil, glucose, custard, jelly, cornflakes, popcorn, etc.). Several factories in Punjab process maize into these products. The crop is also used as green fodder, silage, and concentrate (wanda) for livestock, and maize stalks are used as fuel, chipboard (gatta), and papermaking, which adds to farmer income. To make the maize crop more profitable, it is necessary to increase per-acre yield through modern hybrid varieties and improved production technology.`,
  `مکئی (Maize) ایک اہم نقد آور فصل ہے۔ پنجاب اور پاکستان میں سال میں دو بار مکئی کی فصل کاشت کی جاتی ہے: بہار (Spring/بہاریہ) اور مون سون / خریف فصل۔ مکئی کی زیادہ تر پیداوار پولٹری فیڈ میں استعمال ہوتی ہے، جبکہ باقی مختلف غذائی مصنوعات بنانے کے لیے استعمال ہوتی ہے جیسے سٹارچ، خوردنی تیل، گلوکوز، کسٹرڈ، جیلی، کارن فلیکس، اور پاپ کارن۔ پنجاب کے مختلف علاقوں میں ایسی فیکٹریاں موجود ہیں جو مکئی سے یہ مصنوعات تیار کرتی ہیں۔ مکئی کی فصل ہری چارہ، سائلج اور ونڈا کے طور پر بھی استعمال ہوتی ہے، جبکہ ڈنٹھل ایندھن، گتہ/چپ بورڈ اور کاغذ سازی میں کام آتے ہیں، جس سے کاشتکار کی آمدنی میں اضافہ ہوتا ہے۔ فصل کو زیادہ منافع بخش بنانے کے لیے ضروری ہے کہ فی ایکڑ پیداوار میں اضافہ جدید ہائبرڈ اقسام اور بہتر پیداواری ٹیکنالوجی اپنانے سے کیا جائے۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "maize",
  2,
  "2. Climate & Temperature",
  "2. آب و ہوا اور درجہ حرارت",
  `Crop seasons:
Maize is grown as Spring (Baharia) and Kharif/Monsoon crop in Punjab.
Sowing time (from production plan main recommendations):
Spring maize: End of January to end of February.
Kharif maize: 15 July to 15 August (adjusted for climatic changes; in South Punjab Kharif maize after ~25 July as per local conditions).
Temperature & climatic stress:
Spring crop initially faces relatively low temperatures, followed by long days and abundant sunlight, giving a longer growing period and about 25–30% higher yield than Kharif maize.
Severe heat during pollination (Zairagi stage) can badly affect Spring maize; farmers are advised to sow at recommended time, use heat-tolerant varieties, and irrigate to reduce heat-stress impact.
Rainfall / water:
Maize can be grown under irrigated as well as rainfed conditions. In rainfed areas (Attock, Jhelum, Rawalpindi, Chakwal, Gujrat), sowing should match the start of monsoon to use rainfall effectively.
Harvesting window (from later section – we’ll detail in Section 13, but core idea):
The plan emphasizes harvesting when the crop is fully ripe, avoiding delay to prevent losses due to lodging, birds, and fungal damage in fallen crop.`,
  `موسمِ کاشت:
پنجاب میں مکئی بہار (بہاریہ) اور خریف / مون سون فصل کے طور پر کاشت کی جاتی ہے۔
بوائی کا وقت (پیداوار پلان کے مطابق):
بہاریہ مکئی: جنوری کے آخر سے فروری کے آخر تک۔
خریف مکئی: عموماً 15 جولائی سے 15 اگست تک، جبکہ جنوبی پنجاب میں موسمی حالات کے مطابق 25 جولائی کے بعد کاشت کی سفارش ہے تاکہ موسمیاتی تبدیلیوں کے منفی اثرات کم ہوں۔
درجہ حرارت اور موسم کا اثر:
بہاریہ فصل کے ابتدائی مرحلے میں درجہ حرارت نسبتاً کم ہوتا ہے، بعد میں لمبے دن اور دھوپ ملتی ہے جس سے بڑھوتری کا دورانیہ بڑھ جاتا ہے اور خریف کے مقابلے میں فی ایکڑ پیداوار تقریباً 25–30٪ زیادہ ہوتی ہے۔
پولینیشن (زیرگی) کے دوران سخت گرمی بہاریہ مکئی کو شدید نقصان پہنچا سکتی ہے، اس لیے بروقت کاشت، گرمی برداشت کرنے والی اقسام اور گرم لہر کے دوران مناسب آبپاشی کی تاکید کی گئی ہے۔
بارش / بارانی علاقے:
بارانی علاقوں (اٹک، جہلم، راولپنڈی، چکوال، گجرات) میں مکئی کو مون سون کے آغاز کے مطابق کاشت کیا جائے تاکہ بارش سے زیادہ فائدہ اٹھایا جا سکے۔
کٹائی کا عمومی اصول:
فصل کو مکمل پکنے پر کاٹنے اور پکنے کے بعد کٹائی میں تاخیر نہ کرنے کی ہدایت کی گئی ہے، تاکہ گرجانے، پرندوں اور پھپھوندی سے نقصان نہ ہو (تفصیل سیکشن 13 میں آئے گی)۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "maize",
  3,
  "3. Soil",
  "3. مٹی",
  `According to the Maize Production Plan, loam, heavy loam and deep fertile soil with good organic matter and good water absorption capacity are suitable for maize. Sandy, saline and waterlogged soils are not suitable for maize cultivation.
For higher yield, the document also stresses:
Select heavy loam, deep fertile soil with good organic matter and water-holding capacity.
Maintain overall soil fertility with balanced fertilizer use and good structure.`,
  `مکئی کی کاشت کے لیے میرا، بھاری میرا اور گہری زرخیز مٹی جس میں نامیاتی مادہ مناسب ہو اور پانی جذب کرنے اور سنبھالنے کی اچھی صلاحیت ہو، زیادہ موزوں ہے۔ ریتلی، شور زدہ اور دلدلی/کھڑے پانی والی زمین مکئی کے لیے مناسب نہیں سمجھی جاتی۔
مزید یہ کہ بہتر پیداوار کے لیے سفارش کی گئی ہے کہ:
بھاری میرا اور گہری زرخیز زمین کا انتخاب کیا جائے جس میں نامیاتی مادہ اور پانی روکنے کی صلاحیت اچھی ہو۔
متوازن کھاد، اچھی زمین کی تیاری اور مناسب ساخت کے ذریعے مٹی کی مجموعی زرخیزی برقرار رکھی جائے۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "maize",
  4,
  "4. Varieties",
  "4. اقسام",
  `A. Synthetic varieties (AARI – Yusufwala, Sahiwal & others)
The Maize Production Plan lists synthetic varieties developed by the Maize, Sorghum and Millet Research Institute, Yusufwala, Sahiwal. Synthetic varieties are especially recommended for rainfed areas where proper irrigation is not available, and are also suitable for green fodder.
From the AARI “Important Factors” section, approved synthetic varieties include:
Malika 16
Gohar 19
Sahiwal Gold
Summit Pak
Sweet-1
Pop-1 (noted in GrowTech list)
GrowTech “Approved Varieties of Maize” further lists synthetic types:
Malka-2016, Gohar-2019, Sahiwal Gold, Summit Pak, Pearl, MMRI-Yellow, Pop-1, Sweet-1 as synthetic varieties.

B. Hybrid varieties (AARI + GrowTech)
The Production Plan explains that hybrid maize varieties:
Have high yield potential.
Are produced by crossing inbred lines.
Show uniform growth, more grains per cob, bold grains, and respond well to higher fertilizer.
Have medium height with strong roots, helping them resist lodging.
It also mentions that hybrid varieties developed by the Maize, Sorghum and Millet Research Institute, Yusufwala, Sahiwal include:
YH-1898, FH-1046, YH-5427, YH-5482, YH-5561, YH-5568, YH-5560 (seed availability in coming years).
GrowTech Advisory further adds a list of commercial hybrids for Spring vs Seasonal (Kharif) cultivation such as:
High corn-11 plus, DK-9108, YH-5427, HC-2090, DK-6724, DK-6103, DK-6317, High corn-339, High corn-555, FH-1036, DK-8148, P-4040, 30T60, 30Y87, etc.

C. English – Clean Varieties Text for App
Maize in Punjab is grown using two main groups of varieties:
(1) Synthetic / open-pollinated varieties, and
(2) Hybrid varieties.
Synthetic varieties like Malika-2016, Gohar-2019, Sahiwal Gold, Summit Pak, Pearl, MMRI-Yellow, Pop-1 and Sweet-1 are especially recommended for rainfed areas and for green fodder, because they are relatively stable under limited irrigation and can be re-used as farm-saved seed under guidance.
Hybrid varieties like YH-1898, FH-1046, YH-5427, YH-5482, YH-5561, YH-5568, YH-5560 (AARI hybrids) and commercial hybrids such as High corn-11 plus, DK-6724, DK-6103, DK-6317, FH-1036, P-4040, 30T60etc. have much higher yield potential. They produce uniform plants, large cobs with more grains, and respond well to higher fertilizer levels, but their seed must be purchased fresh each season from registered companies.`,
  `الف) سنتھیٹک اقسام (Synthetic / OPV)
پیداوار پلان کے مطابق مکئی، جو Maize, Sorghum & Millet Research Institute, یوسف والا، ساہیوال نے تیار کی ہے، کی سنتھیٹک اقسام خاص طور پر بارانی علاقوں کے لیے اور ہری چارہ / فیڈ کے لیے مفید ہیں، کیونکہ کم پانی میں بھی نسبتاً بہتر کارکردگی دکھاتی ہیں۔
AARI اور GrowTech میں درج سنتھیٹک اقسام میں شامل ہیں:
ملکہ 2016، گوہر 2019، ساہیوال گولڈ، سمٹ پاک، پرل، MMRI-Yellow، پاپ-1، سویٹ-1 وغیرہ۔
یہ اقسام بارانی اور چراگاہی مقصد کے لیے موزوں، نسبتاً سستی اور کسان کے لیے قابلِ برداشت بیج نظام فراہم کرتی ہیں (بعض حالات میں بیج بچا کر بھی استعمال ہو سکتا ہے، اگر کوالٹی برقرار ہو)۔

ب) ہائبرڈ اقسام (Hybrid)
پیداوار پلان میں بتایا گیا ہے کہ ہائبرڈ مکئی اقسام:
بہت زیادہ پیداوار کی صلاحیت رکھتی ہیں۔
دو خالص لائنوں (Inbred lines) کے ملاپ سے بنائی جاتی ہیں، اس لیے نشوونما یکساں رہتی ہے۔
فی مکا دانوں کی تعداد زیادہ، دانہ موٹا اور بھاری ہوتا ہے، اس سے فی ایکڑ پیداوار بڑھتی ہے۔
درمیانہ قد، مضبوط جڑوں کے ساتھ، اس لیے زیادہ کھاد پر بھی لیجنگ (گرنے) سے نسبتاً محفوظ رہتی ہیں۔
یوسف والا، ساہیوال ریسرچ انسٹیٹیوٹ کی تیار کردہ ہائبرڈ اقسام میں:
YH-1898، FH-1046، YH-5427، YH-5482، YH-5561، YH-5568، YH-5560 شامل ہیں (ان کا بیج مرحلہ وار دستیاب ہوگا)۔
GrowTech ایڈوائزری میں مزید کمرشل ہائبرڈز مثلاً:
High corn-11 plus، DK-9108، DK-6724، DK-6103، DK-6317، High corn-339، High corn-555، FH-1036، DK-8148، P-4040، 30T60، 30Y87 وغیرہ درج ہیں۔
عمومی طور پر ہائبرڈ اقسام نہری اور زیادہ ان پُٹ والے علاقوں میں بہت اچھی پرفارمنس دیتی ہیں، مگر بیج ہر سال Registered کمپنی سے نیا خریدنا ضروری ہے۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "maize",
  5,
  "5. Land Preparation",
  "5. زمین کی تیاری",
  `The Production Plan emphasizes that well-prepared fields are essential for good germination and growth. Maize seed needs adequate moisture, suitable temperature and loose (bhur-bhura) soil for proper germination.
Key recommendations:
Deep ploughing:
If there is a hard pan (Sakht Teh) in the soil, run a deep plow every 2–3 years.
Leveling:
Level the field carefully; using a Laser Land Leveler before land preparation is recommended for uniform moisture and better crop stand.
Number of tillage passes:
For better land preparation, run a plow and plank (Suhaga) 3–4 times.
Residue management:
If residues or big clods (dhelay) of the previous crop are present, use a rotavator first to crush them finely.
Soil selection (re-emphasized in “Important Factors”):
Again, select heavy loam, deep fertile soil with good organic matter and water absorption for higher yield.`,
  `پیداوار پلان کے مطابق اچھی زمین کی تیاری مکئی کے اچھے اگاؤ اور مضبوط پودوں کے لیے بہت ضروری ہے۔ مکئی کے بیج کو مناسب نمی، درجہ حرارت اور بھربھری (Bhur-Bhuri) مٹی درکار ہوتی ہے تاکہ اچھا اگاؤ ہو سکے۔
اہم نکات:
گہری ہل:
اگر مٹی میں سخت تہ (Hard pan / سخت تہہ) موجود ہو تو ہر 2–3 سال بعد گہرا ہل چلایا جائے تاکہ جڑیں نیچے تک پھیل سکیں۔
ہم وار کرنا:
کھیت کو اچھی طرح ہم وار کریں، بہتر ہے کہ لیزر لینڈ لیولر استعمال کیا جائے تاکہ نمی اور پانی ہر جگہ یکساں رہے اور کھڑی فصل ہموار بنے۔
ہل اور سہاگہ:
بہتر زمین کی تیاری کے لیے 3–4 بار ہل اور سہاگہ (پلانکر) چلایا جائے۔
فصل کی باقیات کا انتظام:
اگر پچھلی فصل کے ڈھیلوں یا باقیات (Dhelay/Residue) موجود ہوں تو پہلے روٹا ویٹر سے اچھی طرح باریک کر لیں، پھر باقی ہل چلا کر تیار کریں۔
موزوں زمین کا انتخاب:
“اہم عوامل برائے زیادہ پیداوار” میں دوبارہ زور دیا گیا ہے کہ بھاری میرا، گہری زرخیز اور نامیاتی مادہ سے بھرپور مٹی منتخب کریں جس میں پانی جذب اور برداشت کی صلاحیت اچھی ہو۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "maize",
  6,
  "6. Sowing / Planting",
  "6. بوائی / پودا لگانا",
  `Sowing methods
Drill sowing: Preferred method for uniform depth, spacing, and seed-to-soil contact.
Ridge sowing: Useful in heavy soils and areas with drainage issues; improves root aeration.
Bed planting: Allows easier irrigation and reduces waterlogging.
Broadcasting: Not recommended for hybrids due to poor germination uniformity.
Spring sowing window:
End of January to end of February.
Kharif sowing window:
15 July to 15 August.
In South Punjab, sowing after 25 July gives better results under current climate trends.
Barani/rainfed sowing:
Align sowing with the start of monsoon to utilize rainfall efficiently.
Plant spacing:
Hybrids: 20–22 inches row spacing, plant-to-plant 8–10 inches (variety dependent).
Synthetics: Slightly closer spacing may be used.`,
  `بوائی کے طریقے
ڈرِل سے کاشت: یکساں گہرائی اور فاصلہ برقرار رہتا ہے۔
ریج پر کاشت: بھاری زمین اور کم نکاسی والے علاقوں میں بہتر۔
بیڈ پر کاشت: آبپاشی آسان اور پانی کھڑا نہیں ہوتا۔
چوگہ: ہائبرڈ اقسام کے لئے موزوں نہیں۔
بہاریہ بوائی کا وقت:
جنوری کے آخر سے فروری کے آخر تک۔
خریف بوائی کا وقت:
15 جولائی تا 15 اگست۔
جنوبی پنجاب میں 25 جولائی کے بعد بہترین نتائج ملتے ہیں۔
بارانی علاقوں میں:
مون سون کے آغاز کے ساتھ ساتھ کاشت کریں تاکہ بارش کا زیادہ فائدہ ملے۔
پودوں کا درمیانی فاصلہ:
ہائبرڈ اقسام: قطار کا فاصلہ 20–22 انچ، پودے کا فاصلہ 8–10 انچ۔
سنتھیٹک اقسام: قدرے کم فاصلہ رکھا جا سکتا ہے۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "maize",
  7,
  "7. Seed / Propagation",
  "7. بیج / افزائش",
  `Seed rate
Hybrids: 8–10 kg per acre.
Synthetics: 10–12 kg per acre.
Fodder maize: 30–40 kg per acre depending on density.
Seed quality
Use certified, high-vigor seed with germination above 85%.
Hybrids must be purchased fresh each season.
Seed treatment
Treat seed before sowing to protect from soil and seed-borne diseases.
Use recommended fungicide treatment.
For best treatment:
Mix seed and chemical in a closed drum OR
Shake well in a half-filled plastic bag.
Treated seed should be sown immediately.`,
  `بیج کی مقدار
ہائبرڈ مکئی: 8–10 کلو فی ایکڑ۔
سنتھیٹک مکئی: 10–12 کلو فی ایکڑ۔
چارہ مکئی: 30–40 کلو فی ایکڑ۔
بیج کا انتخاب
تصدیق شدہ، زیادہ اگاؤ والا بیج استعمال کریں۔
ہائبرڈ اقسام کا بیج ہر سال نیا لیا جائے۔
بیج پر زہر لگانا
بیج کو بیماریوں سے بچانے کے لیے پہلے زہر لگائیں۔
بند ڈرم یا آدھی بھری پلاسٹک تھیلی میں بیج اور زہر اچھی طرح ہلائیں۔
زہر لگا ہوا بیج فوراً بویا جائے۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "maize",
  8,
  "8. Fertilizer",
  "8. کھاد",
  `Basal application
Apply full phosphorus and potassium at land preparation.
Apply one-third nitrogen at sowing or first irrigation.
Split nitrogen application
Second split at early vegetative/tillering stage.
Final split at tasseling or pre-tasseling depending on variety.
Micronutrients
Zinc deficiency is common; apply zinc sulfate as per requirement.
Organic matter improves nutrient availability and water retention.`,
  `بنیادی کھاد
پوری فاسفورس اور پوٹاش زمین کی تیاری پر ڈالیں۔
نائٹروجن کا ایک تہائی حصہ کاشتہ یا پہلی آبپاشی پر دیں۔
نائٹروجن کی قسطیں
دوسری قسط بڑھوتری کے ابتدائی مرحلے میں۔
آخری قسط ٹیسلنگ یا اس سے پہلے۔
مائیکرو نیوٹرینٹس
زنک کی کمی عام ہے؛ زنک سلفیٹ سفارش کے مطابق استعمال کریں۔
نامیاتی مادہ شامل کرنے سے غذائیت کی دستیابی بہتر ہوتی ہے۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "maize",
  9,
  "9. Weed Control",
  "9. جڑی بوٹیوں کا کنٹرول",
  `Cultural measures
Good land leveling and proper seed placement reduce early weeds.
Early hoeing or inter-row cultivation improves weed suppression.
Mechanical/manual control
First hoeing at 20–25 days after sowing.
Second hoeing at 35–40 days if needed.
Chemical control
Use recommended pre- or post-emergence herbicides depending on weed type (broadleaf, grassy, mixed).
Timely application within the first month ensures best control.`,
  `غیر کیمیائی طریقے
اچھی لیولنگ اور درست بیج ڈالنے سے جڑی بوٹیاں کم ہوتی ہیں۔
ابتدائی گوڈی جڑی بوٹیوں کو دباتی ہے۔
مکینیکل / دستی گوڈی
پہلی گوڈی: بوائی کے 20–25 دن بعد۔
دوسری گوڈی: 35–40 دن بعد، اگر ضرورت ہو۔
کیمیائی طریقے
پری یا پوسٹ ایمیرجنس جڑی بوٹی مار ادویات فصل کی نوعیت کے مطابق استعمال کریں۔
پہلے مہینے میں بروقت سپرے سب سے مؤثر رہتا ہے۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "maize",
  10,
  "10. Irrigation",
  "10. آبپاشی",
  `First irrigation at germination/early emergence depending on soil moisture.
Second irrigation at knee-height stage.
Critical irrigation at tasseling and silking stages.
Additional irrigation at grain-filling stage improves yield.
Avoid waterlogging; maize is sensitive to standing water.`,
  `پہلی آبپاشی اگاؤ یا ابتدائی ابھرنے کے مطابق۔
دوسری آبپاشی گھٹنے کے قد پر۔
ٹیسلنگ اور سلکنگ کے مراحل پر آبپاشی بہت اہم ہے۔
دانہ بھرائی کے دوران پانی دینا پیداوار بڑھاتا ہے۔
پانی کھڑا نہ ہونے دیں؛ مکئی پانی کھڑے ہونے سے متاثر ہوتی ہے۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "maize",
  11,
  "11. Pest & Disease Management",
  "11. بیماریوں اور کیڑوں کا کنٹرول",
  `Major pests
Stem borer: dead-heart in young stage, white-ear in mature stage.
Fall armyworm: leaf shredding, window-pane feeding, heavy defoliation.
Aphids & jassids: sap sucking, curling, stunted plants.
Shoot fly: dead central shoot in early stage.
Pest management
Use recommended hybrids and synthetics suited to the area.
Timely sowing to avoid pest peaks.
Remove and destroy borer-infected plants early.
Maintain recommended plant population and avoid dense crop.
Regular monitoring and timely application of approved pesticides when infestation crosses economic threshold.
Major diseases
Leaf blight: elongated brown lesions on leaves, reduced photosynthesis.
Charcoal rot: black fungal growth in stem; common under hot, dry conditions.
Downy mildew: yellow/white streaks; leaves become twisted.
Rust: orange/brown pustules on leaves.
Disease management
Use resistant varieties.
Balanced fertilizer, avoid excess nitrogen.
Proper crop rotation to reduce carry-over inoculum.
Destroy infected debris and maintain field hygiene.
Use fungicides only when disease reaches damaging level.`,
  `اہم کیڑے
سٹیم بورر: چھوٹی فصل میں ڈیڈ ہارٹ، بڑی فصل میں وائٹ ایئر۔
فال آرمی ورم: پتوں کا کٹ جانا، کھڑکی نما نقصان، شدید چرائی۔
افیڈز اور جَسِڈز: رس چوسنا، پتے مڑنا، پودے بونے رہ جانا۔
شوٹ فلائی: شروعاتی مرحلے میں مرکزی کونپل کا مر جانا۔
کیڑوں کا انتظام
علاقے کے مطابق منظور شدہ اقسام لگائیں۔
بروقت کاشت کریں تاکہ کیڑوں کے حملے سے بچت ہو۔
بورر سے متاثرہ پودے فوراً تلف کریں۔
مناسب پودوں کا فاصلہ رکھیں، بہت گھنی کاشت نہ کریں۔
باقاعدہ معائنہ کریں اور معاشی نقصان کی حد بڑھنے پر سپرے کریں۔
اہم بیماریاں
لیف بلائٹ: پتوں پر لمبے بھورے دھبے۔
چارکول روٹ: تنے میں سیاہ فنگس، شدید گرمی اور خشکی میں زیادہ۔
ڈاؤنی ملیو: پتوں پر سفید/پیلی لکیریں، پتے ٹیڑھے۔
رسٹ: پتوں پر نارنجی/بھورے چھالے۔
بیماریوں کا انتظام
بیماری برداشتی اقسام استعمال کریں۔
متوازن کھاد دیں، نائٹروجن ضرورت سے زیادہ نہ دیں۔
فصلوں کی روٹیشن کریں۔
بیمار پودوں کے باقیات ختم کریں۔
بیماری زیادہ ہونے پر فنجی سائیڈ کا سپرے کریں۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "maize",
  12,
  "12. Deficiencies & Remedies",
  "12. غذائی کمی اور حل",
  `Nitrogen deficiency
Pale leaves, poor vigor, reduced plant height.
Apply recommended N splits.
Phosphorus deficiency
Purplish leaves, slow growth, weak roots.
Apply basal phosphorus at land prep or early after sowing.
Potassium deficiency
Leaf-edge scorching, lodging tendency, weak stems.
Apply potassium as per soil need, especially in light soils.
Zinc deficiency
Short plants, brown spots, poor grain setting.
Apply zinc sulfate through soil or foliar spray.
Boron deficiency
Poor tassel development, grain formation affected.
Apply recommended boron dose at early reproductive stage.`,
  `نائٹروجن کی کمی
پتے ہلکے سبز، کم نشوونما، پودے کم قد۔
نائٹروجن قسطوں میں ڈالیں۔
فاسفورس کی کمی
جامنی رنگ، کمزور جڑیں، پودوں کی سست بڑھوتری۔
فاسفورس بیسال یا اوائل فصل میں دیں۔
پوٹاش کی کمی
پتوں کے کناروں کا جل جانا، ڈنٹھل کمزور، فصل گرنے کا خطرہ۔
پوٹاش ہلکی زمین میں خاص طور پر دیں۔
زنک کی کمی
پودے چھوٹے، پتوں پر بھورے دھبے، دانہ بننے میں کمی۔
زنک سلفیٹ مٹی یا سپرے کے ذریعے دیں۔
بوران کی کمی
ٹیسل کمزور بننا، دانہ بننے میں کمی۔
شروع کے تولیدی مرحلے میں بوران استعمال کریں۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "maize",
  13,
  "13. Harvesting",
  "13. کٹائی",
  `Harvest when plants are fully mature and cobs are hard with well-formed kernels.
Avoid delay after full maturity to prevent loss from lodging, birds, and fungal attack.
Fallen or lodged crop should be harvested immediately to avoid quality deterioration.
For mechanical harvesting, ensure proper drying and adjust harvester settings to minimize kernel breakage.`,
  `فصل اس وقت کاٹیں جب پودے مکمل طور پر پک جائیں اور بالیوں کے دانے سخت ہو جائیں۔
پکنے کے بعد کٹائی میں تاخیر نقصان کا سبب بنتی ہے (گرجانا، پرندے، پھپھوندی)۔
گرے ہوئے یا لیجنگ والی فصل فوراً کاٹیں۔
کمبائن سے کٹائی کے لیے فصل مناسب خشک ہو اور مشین کی سیٹنگ درست ہو۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "maize",
  14,
  "14. Post-Harvest / Storage",
  "14. بعد از برداشت / ذخیرہ",
  `Dry cobs or grains to safe moisture (~12–14%) before storage.
Remove husk and clean grains from debris.
Store in clean, dry bags placed on pallets.
Keep storage areas ventilated and protected from insects and rodents.
Use recommended fumigation or protective measures if pest pressure appears.`,
  `بالیوں یا دانوں کو ذخیرہ سے پہلے تقریباً 12–14٪ نمی تک خشک کریں۔
چھلکے اور دیگر کچرا الگ کریں۔
صاف اور خشک بوریوں میں بھر کر پیلیٹ پر رکھیں۔
اسٹور صاف، ہوا دار اور کیڑوں/چوہوں سے محفوظ رکھیں۔
ضرورت پڑنے پر مناسب فومیگیشن یا حفاظتی اقدامات کریں۔`
);



/// ---------------- COTTON (CROP) ----------------

await db.runAsync(
  `INSERT INTO plants (id, name_en, name_ur, type)
   VALUES (?, ?, ?, ?);`,
  "cotton",
  "Cotton",
  "روئی",
  "crop"
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "cotton",
  1,
  "1. General Information",
  "1. عمومی معلومات",
  `Cotton is the most important fibre crop of Pakistan and a major source of lint, seed, oil, and livestock feed. It plays a central role in Pakistan’s textile industry and is a key cash crop for farmers in South Punjab. Cotton requires warm climate, clear sunlight, good drainage, and balanced nutrition for optimum yield. Productivity depends on proper seed selection, timely sowing, clean picking, and strong pest management against bollworms, sucking pests, and whitefly.`,
  `روئی پاکستان کی اہم ترین فائبر فصل ہے اور لِنٹ، بیج، تیل اور لائیوسٹاک فیڈ کا بنیادی ذریعہ ہے۔ پاکستان کی ٹیکسٹائل صنعت کا زیادہ تر انحصار کپاس پر ہے، اور یہ جنوبی پنجاب کے کاشتکاروں کی بنیادی نقد آور فصل ہے۔ کپاس کو گرم آب و ہوا، دھوپ، اچھی نکاسی اور متوازن کھاد کی ضرورت ہوتی ہے۔ بہتر پیداوار کے لیے موزوں بیج کا انتخاب، بروقت کاشت، صاف ستھری چنائی اور بول ورمز، چوستے کیڑے اور وائٹ فلائی کے مؤثر کنٹرول کی ضرورت ہوتی ہے۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "cotton",
  2,
  "2. Climate & Temperature",
  "2. آب و ہوا اور درجہ حرارت",
  `Cotton requires warm climate with long sunshine hours.

Optimal germination temperature: 20–30°C

Ideal growth temperature: 30–40°C

Sensitive to low temperatures in early stages and high humidity during boll formation.

Sowing windows:

South Punjab: 15 April–31 May

Central Punjab: 1 May–31 May

Early sowing (April) improves boll set but requires strong pest vigilance.

Harvesting begins when bolls open fully, lint becomes fluffy, and lower leaves dry.`,
  `کپاس کو گرم آب و ہوا اور زیادہ دھوپ درکار ہوتی ہے۔

موزوں اگاؤ درجہ حرارت: 20–30°C

نشوونما کا بہترین درجہ حرارت: 30–40°C

ابتدائی مرحلے میں کم درجہ حرارت اور بالیوں کے بننے کے وقت زیادہ نمی نقصان دہ ہوتی ہے۔

کاشت کے اوقات:

جنوبی پنجاب: 15 اپریل – 31 مئی

وسطی پنجاب: 1 مئی – 31 مئی

اپریل میں جلد کاشت سے بالیاں زیادہ بنتی ہیں مگر کیڑوں کا خطرہ بڑھ جاتا ہے۔

کٹائی اس وقت شروع کریں جب بالیاں پوری طرح کھل جائیں اور روئی پھول کر باہر آئے۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "cotton",
  3,
  "3. Soil",
  "3. مٹی",
  `Best soils are well-drained sandy loam to loam soils.

Waterlogging severely reduces root activity and boll retention.

Cotton performs well in soil with moderate organic matter.

Hardpan layers should be broken by deep tillage every few years.

Avoid saline, sodic, and poorly drained soils.`,
  `کپاس کے لیے بہترین مٹی اچھی نکاسی والی میرا سے بھاری میرا ہوتی ہے۔

پانی کھڑا رہنے سے جڑیں متاثر ہوتی ہیں اور بالیاں جھڑ جاتی ہیں۔

درمیانی نامیاتی مادہ والی زمین بہتر نتائج دیتی ہے۔

سخت تہہ کو ہر چند سال بعد گہرا ہل کر کے توڑنا چاہیے۔

شور زدہ، سیم زدہ اور خراب نکاسی والی زمینوں میں کپاس متاثر ہوتی ہے۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "cotton",
  4,
  "4. Varieties",
  "4. اقسام",
  `Recommended cotton varieties include Bt and non-Bt types suitable for South and Central Punjab. Prominent varieties include:

CIM-632

CIM-602

CYTO-535

FH-142

FH-152

NIAB-878

NIAB-545

BS-52

IUB-2013

IUB-69

MNH-1026 (area-specific)

Key traits include heat tolerance, boll load capacity, staple length, and resistance to major pests and diseases.`,
  `پنجاب میں منظور شدہ اقسام میں بی ٹی اور نان بی ٹی دونوں شامل ہیں۔ اہم اقسام یہ ہیں:

CIM-632

CIM-602

CYTO-535

FH-142

FH-152

NIAB-878

NIAB-545

BS-52

IUB-2013

IUB-69

MNH-1026 (علاقہ مخصوص)

اہم خوبیوں میں گرمی کی برداشت، بالیاں زیادہ بننا، فائبر کی لمبائی، اور بیماریوں/کیڑوں کے خلاف بہتر مزاحمت شامل ہے۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "cotton",
  5,
  "5. Land Preparation",
  "5. زمین کی تیاری",
  `Apply Rauni irrigation and prepare land when soil reaches workable moisture.

Plough 2–3 times using cultivator or disc harrow.

Use laser leveling for even water distribution.

Rotavator once to crumble clods and smooth the seedbed.

Create ridges or beds depending on irrigation method.

Keep fields weed-free before sowing.`,
  `راونی آبپاشی کریں اور مناسب نمی آنے پر زمین تیار کریں۔

2–3 بار کلٹی ویٹر یا ڈسک ہیرو چلائیں۔

یکساں آبپاشی کے لیے لیزر لیولنگ ضروری ہے۔

روٹا ویٹر چلا کر ڈھیلے باریک کریں اور بیج کی نرم سطح تیار کریں۔

آبپاشی کے حساب سے کیاریاں یا بیڈ بنائیں۔

بوائی سے پہلے کھیت کو جڑی بوٹیوں سے صاف رکھیں۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "cotton",
  6,
  "6. Sowing / Planting",
  "6. بوائی / پودا لگانا",
  `Sowing time:

South Punjab: 15 April–31 May

Central Punjab: 1 May–31 May

Use recommended ridge or bed sowing for better root aeration and pest reduction.

Row spacing generally 2.5 feet; plant spacing 9–12 inches depending on variety.

Ensure proper soil moisture at sowing; avoid dry sowing.

Maintain uniform seed depth for balanced emergence.`,
  `کاشت کے اوقات:

جنوبی پنجاب: 15 اپریل – 31 مئی

وسطی پنجاب: 1 مئی – 31 مئی

بہتر جڑوں کی نشوونما اور کم کیڑوں کے لیے ریج یا بیڈ پر کاشت کریں۔

قطار کا فاصلہ عموماً 2.5 فٹ اور پودے کا فاصلہ 9–12 انچ رکھا جاتا ہے۔

بوائی کے وقت مٹی میں مناسب نمی موجود ہو؛ خشک زمین میں کاشت نہ کریں۔

یکساں گہرائی پر بیج ڈالیں تاکہ اگاؤ برابر ہو۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "cotton",
  7,
  "7. Seed / Propagation",
  "7. بیج / افزائش",
  `Seed rate

Bt and non-Bt cotton: 6–8 kg per acre depending on seed size and spacing.

Seed treatment

Treat seed with recommended fungicide before sowing.

Ensure acid-delinted seed where available for better germination.

Treated seed should be sown immediately after preparation.

Use certified seed of approved varieties for purity and vigor.`,
  `بیج کی مقدار

بی ٹی اور نان بی ٹی کپاس: 6–8 کلو فی ایکڑ (بیج کے سائز اور فاصلے کے مطابق)۔

بیج پر زہر لگانا

کاشت سے پہلے بیج کو مناسب فنجی سائیڈ سے ٹریٹ کریں۔

جہاں دستیاب ہو، ایسڈ ڈیلنٹڈ بیج استعمال کریں تاکہ اگاؤ بہتر ہو۔

زہر لگانے کے فوراً بعد بیج بو دیں۔

خالص اور معیاری بیج استعمال کریں۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "cotton",
  8,
  "8. Fertilizer",
  "8. کھاد",
  `Apply full phosphorus and potassium at land preparation or early growth.

Nitrogen applied in 2–3 splits depending on growth stage.

Avoid excessive nitrogen as it increases vegetative growth and pest attack.

Use organic matter or compost where available to improve soil structure.

Apply micronutrients (zinc/boron) where deficiency symptoms appear.`,
  `فاسفورس اور پوٹاش زمین کی تیاری یا فصل کے آغاز میں مکمل ڈالیں۔

نائٹروجن 2–3 قسطوں میں دیں۔

نائٹروجن زیادہ مقدار میں دینے سے پتے بڑھتے ہیں اور کیڑوں کا حملہ بڑھ جاتا ہے۔

جہاں ممکن ہو نامیاتی مادہ شامل کریں۔

زنک/بوران کی کمی ظاہر ہونے پر متعلقہ مائیکرو نیوٹرینٹس ضرور دیں۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "cotton",
  9,
  "9. Weed Control",
  "9. جڑی بوٹیوں کا کنٹرول",
  `First 40–50 days are critical for weed management.

Perform inter-cultivation or hoeing at 20–25 days and again at 40–45 days.

Keep ridges and furrows clean.

Use pre-emergence and post-emergence herbicides where recommended.

Avoid late weed removal as it reduces boll formation and plant vigor.`,
  `پہلے 40–50 دن جڑی بوٹیوں کے خلاف بہت اہم ہوتے ہیں۔

20–25 دن پر اور دوبارہ 40–45 دن پر گوڈی یا انٹرکلٹی ویٹر چلائیں۔

کیاریاں اور نالیاں صاف رکھیں۔

ضرورت کے مطابق پری اور پوسٹ ایمیرجنس ادویات استعمال کریں۔

دیر سے جڑی بوٹی نکالنے سے بالیاں کم بنتی ہیں۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "cotton",
  10,
  "10. Irrigation",
  "10. آبپاشی",
  `First irrigation at 20–25 days after sowing.

Critical irrigations:

Square formation

Flowering

Boll development

Avoid water stress during flowering and boll set.

Prevent waterlogging, especially in heavy soils.

Adjust irrigation interval based on temperature and soil type.`,
  `پہلی آبپاشی بوائی کے 20–25 دن بعد کریں۔

اہم آبپاشیاں:

چوکور بننے کا مرحلہ

پھول آنے کا مرحلہ

بالیاں بننے کا مرحلہ

پھول اور بالیاں بننے کے دوران پانی کی کمی نہ ہونے دیں۔

بھاری زمین میں پانی کھڑا نہ ہونے دیں۔

آبپاشی کا وقفہ موسم اور مٹی کے مطابق رکھیں۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "cotton",
  11,
  "11. Pest & Disease Management",
  "11. بیماریوں اور کیڑوں کا کنٹرول",
  `Major sucking pests

Whitefly: honeydew, sooty mold, leaf yellowing.

Jassid: leaf curling, tip burn.

Thrips: leaf silvering and scarring.

Aphids: sap sucking, stunted growth.

Major bollworms

American bollworm

Pink bollworm

Spotted bollworm

Other pests

Mealybug: cottony masses on stems and leaves.

Red cotton bug: stains lint.

Pest management

Use pest-tolerant varieties.

Maintain clean fields and remove alternate host weeds.

Avoid excessive nitrogen which increases pest pressure.

Monitor crop weekly for sucking pests and bollworms.

Apply recommended insecticides only when populations reach damaging levels.

Install pheromone traps for monitoring bollworms.

Encourage natural predators (ladybird beetles, spiders).

Major diseases

Leaf spot

Bacterial blight

Root rot

Cotton leaf curl disease (CLCuD)

Disease management

Use certified disease-free seed.

Remove infected plants early.

Avoid waterlogging.

Maintain crop rotation.

Balanced fertilization improves disease tolerance.`,
  `اہم چوستے کیڑے

وائٹ فلائی: چپچپا مادہ، سیاہ پھپھوندی، پتوں کا پیلا ہونا۔

جَسِڈ: پتے مڑ جانا، کناروں کا جلنا۔

تھرپس: پتوں کی چاندی جیسی شکل، خراشیں۔

افیڈز: رس چوسنا، پودوں کا بونا رہ جانا۔

اہم بال ورمز

امریکن بال ورم

پنک بال ورم

اسپاٹڈ بال ورم

دیگر کیڑے

میلی بگ: تنے اور پتوں پر روئی نما مادہ۔

ریڈ کاٹن بگ: روئی کو داغدار کرتا ہے۔

کیڑوں کا کنٹرول

مزاحم اقسام استعمال کریں۔

کھیت صاف رکھیں اور متبادل میزبان جڑی بوٹیاں ختم کریں۔

نائٹروجن زیادہ نہ دیں۔

ہفتہ وار معائنہ کریں۔

معاشی حد سے بڑھنے پر مناسب سپرے کریں۔

بال ورمز کی مانیٹرنگ کے لیے فیرو مون ٹریپس لگائیں۔

قدرتی دشمنوں کو فروغ دیں۔

اہم بیماریاں

لیف اسپاٹ

بیکٹیریل بلائٹ

روٹ روٹ

کاٹن لیف کرل وائرس (CLCuD)

بیماریوں کا کنٹرول

بیماری سے پاک تصدیق شدہ بیج استعمال کریں۔

متاثرہ پودے فوراً ختم کریں۔

پانی کھڑا نہ ہونے دیں۔

فصلوں کی روٹیشن کریں۔

متوازن کھاد بیماری برداشت بہتر کرتی ہے۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "cotton",
  12,
  "12. Deficiencies & Remedies",
  "12. غذائی کمی اور حل",
  `Nitrogen deficiency

Pale green leaves, slow growth, fewer squares and bolls.

Apply recommended nitrogen in splits.

Phosphorus deficiency

Purplish leaf tinge, poor root growth, delayed maturity.

Apply phosphorus at sowing or early growth.

Potassium deficiency

Leaf-edge scorching, weak stems, boll shedding.

Apply potassium especially in sandy soils.

Zinc deficiency

Interveinal chlorosis on young leaves, stunted plants.

Use zinc sulfate or zinc-based foliar spray.

Boron deficiency

Poor flower formation, distorted young leaves, boll deformities.

Apply boron in recommended small doses (excess is harmful).`,
  `نائٹروجن کی کمی

پتے ہلکے سبز، بڑھوتری سست، پھول اور بالیاں کم بنتی ہیں۔

نائٹروجن قسطوں میں دیں۔

فاسفورس کی کمی

پتوں پر جامنی جھلک، کمزور جڑیں، دیر سے پکنا۔

فاسفورس کا استعمال بوائی یا فصل کے آغاز میں کریں۔

پوٹاش کی کمی

پتوں کے کناروں کا جل جانا، کمزور ڈنٹھل، بالیاں جھڑ جانا۔

پوٹاش خصوصاً ریتلی زمین میں ضروری۔

زنک کی کمی

نئی پتیاں رگوں کے درمیان پیلی، پودے ٹھگنے۔

زنک سلفیٹ مٹی یا سپرے میں دیں۔

بوران کی کمی

پھول کم بننا، نئی پتیاں ٹیڑھی ہونا، بالیوں کا خراب ہونا۔

بوران کم مقدار میں احتیاط کے ساتھ استعمال کریں۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "cotton",
  13,
  "13. Harvesting",
  "13. کٹائی",
  `Harvest when bolls are fully open and lint is fluffy and dry.

Pick cotton in multiple pickings to maintain lint quality.

Avoid picking during dew or after rain.

Use clean cloth or bags to keep lint free from contamination.

Store picked cotton in dry, ventilated places.`,
  `کٹائی اس وقت کریں جب بالیاں پوری کھل جائیں اور روئی خشک اور پھولی ہوئی ہو۔

اچھی کوالٹی کے لیے متعدد چنائیاں کریں۔

اوسل یا بارش میں چنائی نہ کریں۔

صاف کپڑا/تھیلی استعمال کریں تاکہ روئی آلودہ نہ ہو۔

چنی ہوئی روئی کو خشک اور ہوا دار جگہ رکھیں۔`
);

await db.runAsync(
  `INSERT INTO plant_sections
    (plant_id, order_index, title_en, title_ur, body_en, body_ur)
   VALUES (?, ?, ?, ?, ?, ?);`,
  "cotton",
  14,
  "14. Post-Harvest / Storage",
  "14. بعد از برداشت / ذخیرہ",
  `Dry cotton properly before storage.

Keep lint in clean, dry, ventilated rooms.

Protect from moisture, dust, and insects.

Avoid mixing clean cotton with stained or trash-contaminated lint.

Use covered storage to prevent sunlight damage.`,
  `ذخیرہ سے پہلے روئی کو اچھی طرح خشک کریں۔

روئی کو صاف، خشک اور ہوا دار جگہ میں رکھیں۔

نمی، دھول اور کیڑوں سے بچائیں۔

صاف روئی کو گندی یا داغدار روئی کے ساتھ نہ ملائیں۔

دھوپ سے بچانے کے لیے ڈھکی ہوئی جگہ میں رکھیں۔`
);



  // ---------------- POTATO (CROP) ----------------

  await db.runAsync(
    `INSERT INTO plants (id, name_en, name_ur, type)
     VALUES (?, ?, ?, ?);`,
    "potato",
    "Potato",
    "آلو",
    "crop"
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "potato",
    1,
    "1. General Information",
    "1. عمومی معلومات",
    `Potato is a vital and high-value cash vegetable crop in Punjab. It is rich in vitamins, starch, minerals, and protein. Beyond being a staple food, it is used in various industries and exported to other countries. To make cultivation more profitable, it is essential to increase per-acre yield by adopting modern production technologies and high-yielding varieties. In the 2024–25 season, Punjab's average yield reached 266.19 Maunds (40 kg) per acre across 921,609 acres.`,
    `آلو ایک اہم اور نقد آور سبزی ہے جو انسانی غذا میں وٹامنز، نشاستہ، معدنی لونکیات اور پروٹین کی فراہمی کا بڑا ذریعہ ہے۔ مقامی ضروریات پوری کرنے کی ساتھ ساتھ اسے برآمد بھی کیا جاتا ہے۔ فصل کو منافع بخش بنانے کے لیے جدید پیداواری ٹیکنالوجی اور ترقی یافتہ اقسام کا استعمال ناگزیر ہے۔ سال 2024-25 کے دوران پنجاب میں آلو کی اوسط پیداوار 266.19 من فی ایکڑ رہی جبکہ کل زیر کاشت رقبہ 921,609 ایکڑ تھا۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "potato",
    2,
    "2. Climate & Temperature",
    "2. آب و ہوا اور درجہ حرارت",
    `Ideal Temperature: Germination is best at 20°C to 25°C. Temperatures higher than this can cause tubers to rot in the soil and increase the risk of mite attacks.

Autumn Crop: Sown in October; harvesting usually occurs in February.

Spring Crop: Sown from January 1st to mid-February; harvested in April/May. This crop faces high viral risks due to warmer weather.

Hilly Areas: Sowing occurs in April–May with harvesting in September–October.`,
    `درجہ حرارت: آلو کی اگاؤ کے لیے 20 تا 25 سیگریڈ بہترین ہے۔ اس سے زیادہ درجہ حرارت میں آلو گلنے اور جوؤں (Mites) کے حملے کا خطرہ ہوتا ہے۔

خزاں کی فصل: اکتوبر میں کاشت اور فروری میں برداشت کی جاتی ہے۔

بہاریہ کاشت: یکم جنوری سے نصف فروری تک کاشت اور اپریل مئی میں برداشت کی جاتی ہے۔ اس سیزن میں وائرسی امراض کا خدشہ زیادہ ہوتا ہے۔

پہاڑی علاقے: یہاں کاشت اپریل مئی میں اور برداشت ستمبر اکتوبر میں ہوتی ہے۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "potato",
    3,
    "3. Soil",
    "3. موزوں زمین",
    `Fertile loamy soil with excellent drainage and high organic matter is ideal. Such soil allows for proper tuber development, resulting in better shape and size.`,
    `آلو کی اچھی پیداوار کے لیے بہتر نکاس والی زرخیز میرا زمین جس میں نامیاتی مادہ وافر ہو، نہایت موزوں ہے۔ ایسی زمین میں آلو کی نشوونما بہترین ہوتی ہے اور سائز و شکل بھی معیاری بنتی ہے۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "potato",
    4,
    "4. Varieties",
    "4. منظور شدہ اقسام",
    `Red Varieties: Punjab, Ruby, PRI-Red, Ravi, Sialkot Red.

White/Cream Varieties: Ijaz, Sadaf, Sahiwal White, Cosmo.

Characteristics: Most varieties take 90–120 days to mature with yield potential of 80–110 bags (100 kg each) per acre.

Private Varieties: Lady Rosetta, Asterix, Mozart, Santee, etc.`,
    `سرخ اقسام: پنجاب، روبی، پی آر آئی ریڈ، راوی، سیالکوٹ ریڈ۔

سفید اقسام: اعجاز، صدف، ساہیوال وائٹ، کاسمو۔

خصوصیات: زیادہ تر اقسام 90 سے 120 دن میں پکتی ہیں اور ان کی پیداواری صلاحیت 80 سے 110 بوری (ہر بوری 100 کلو) فی ایکڑ ہے۔

نجی اقسام: لیڈی روزیٹا، آسٹرکس، موزیکا، سانتی وغیرہ۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "potato",
    5,
    "5. Land Preparation",
    "5. زمین کی تیاری",
    `Use a deep moldboard plow once to break hard pans.

Follow with 2–3 normal plowings and a rotavator to make the soil friable.

Use a Laser Land Leveler to ensure uniform water distribution.`,
    `پہلے ایک دفعہ مولڈ بورڈ والا گہرا ہل چلائیں، پھر دو سے تین مرتبہ عام ہل چلائیں۔

روٹا ویٹر چلا کر زمین کو نرم اور بھربھرا کر لیں۔

پانی کی یکساں تقسیم کے لیے لیزر لینڈ لیولر کا استعمال لازمی ہے۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "potato",
    6,
    "6. Sowing / Planting",
    "6. طریقہ کاشت",
    `Create ridges at 2 to 2.5 feet distance.

Maintain 8 inches distance between plants and 3–4 inches depth.

For seed-purpose crops, reduce plant distance to 6 inches to produce more small-sized tubers.`,
    `2 سے 2.5 فٹ کے فاصلے پر پٹڑیاں (Ridges) بنائیں اور ان پر کاشت کریں۔

پودوں کا باہمی فاصلہ 8 انچ اور بیج کی گہرائی 3 تا 4 انچ رکھیں۔

بیج والی فصل کے لیے پودوں کا فاصلہ 6 انچ رکھیں تاکہ چھوٹی سائز کے بیج زیادہ بنیں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "potato",
    7,
    "7. Seed / Propagation",
    "7. شرح بیج اور تیاری",
    `Seed Rate: 1200–1500 kg per acre for whole tubers. For cut seeds (Spring), 500–600 kg per acre.

Seed Size: 35–55 mm diameter and 40–50 grams weight are ideal.

Breaking Dormancy: Freshly harvested potatoes must rest for 8–10 weeks. Remove from cold storage 10–12 days before sowing and keep in shade to allow sprouting.`,
    `شرح بیج: 1200 تا 1500 کلوگرام فی ایکڑ۔ بہاریہ کاشت میں کاٹ کر لگانے کی صورت میں 500 تا 600 کلوگرام بیج کافی ہے۔

بیج کا سائز: 35 سے 55 ملی میٹر سائز اور 40 سے 50 گرام وزن بہترین ہے۔

خوابیدگی توڑنا: تازہ آلو 8 سے 10 ہفتے پڑا رہنے سے خوابیدگی ختم کرتا ہے۔ بوائی سے 10-12 دن پہلے بیج سٹور سے نکال کر سایہ دار جگہ پر رکھیں تاکہ شگونے پھوٹ آئیں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "potato",
    8,
    "8. Fertiliser",
    "8. کھادوں کا استعمال",
    `Base Dose: 2.25 bags DAP + 2 bags SOP (Sulphate of Potash) per acre.

Nitrogen: Split into 3 doses — at sowing, 30 days after emergence, and 60 days after emergence (total ~3 bags Urea or 5 bags CAN).

Organic: 8–10 tons of well-rotted farmyard manure one month before sowing.`,
    `بنیادی کھاد: سوا دو بوری ڈی اے پی اور دو بوری ایس او پی فی ایکڑ۔

نائٹروجن: تین مستوں میں دیں — بوائی کے وقت، اگاؤ کے 30 دن اور 60 دن بعد۔

نامیاتی کھاد: 8 سے 10 ٹن سڑی گوبر کی کھاد بوائی سے ایک ماہ قبل ڈالیں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "potato",
    9,
    "9. Weed Control",
    "9. جڑی بوٹیوں کا انسداد",
    `Pre-emergence: Spray Pendimethalin (1200 ml) + Paraquat (500 ml) in 100 liters of water 10–12 days after sowing (before emergence).

Post-emergence: Use Rimsulfuron + Metribuzin (500 ml) two weeks after full emergence.`,
    `اگاؤ سے پہلے: بوائی کے 10 سے 12 دن بعد (اگاؤ شروع ہونے سے قبل) پینڈی میتھالین 1200 ملی لیٹر اور پیرا کو آٹ 500 ملی لیٹر کا 100 لیٹر پانی میں سپرے کریں۔

اگاؤ کے بعد: مکمل اگاؤ کے دو ہفتے بعد رم سلفیورون + میٹری بیوزن کا سپرے کریں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "potato",
    10,
    "10. Irrigation",
    "10. آبپاشی",
    `First irrigation immediately after sowing. Water should only cover 1/3 of the ridge height to prevent soil hardening.

Subsequent irrigations every 7–10 days according to weather conditions.

Stop irrigation 15 days before harvesting.`,
    `پہلی آبپاشی بوائی کے فوراً بعد کریں۔ خیال رہے کہ پانی پٹڑیوں کے صرف ایک تہائی حصے تک پہنچے۔

موسمی حالات کے مطابق 7 سے 10 دن کے وقفے سے پانی دیتے رہیں۔

برداشت سے 15 دن قبل آبپاشی بند کر دیں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "potato",
    11,
    "11. Pest & Disease Management",
    "11. بیماریوں اور کیڑوں کا انسداد",
    `Diseases: Late Blight (Phytophthora) and Early Blight (Alternaria). Control with sprays like Metalaxyl + Mancozeb or Cymoxanil + Mancozeb.

Pests: Aphids, Whitefly, Armyworm, and Potato Tuber Moth. Use targeted insecticides like Acetamiprid or Spinetoram.

Viral Diseases: Potato Leaf Roll Virus (PLRV) and Potato Virus Y (PVY) spread by Aphids.`,
    `بیماریاں: اگیتا اور پچیتا جھلساؤ۔ ان کے انسداد کے لیے میٹا لیکسل + مینکوزیب یا سائموکسانل + مینکوزیب کا سپرے کریں۔

کیڑے: سست تیلہ، سفید مکھی، لشکری سنڈی اور ٹیوبر ماتھ۔ ان کے لیے اسیٹا میپرڈ یا سپینیٹوران جیسے زہر استعمال کریں۔

وائرسی امراض: پتا لپیٹ وائرس اور وائرس وائی جو سست تیلہ کے ذریعے پھیلتی ہیں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "potato",
    12,
    "12. Deficiencies & Remedies",
    "12. غذائی کمی اور تدارک",
    `Zinc: Apply 10 kg (21%) or 6 kg (33%) Zinc Sulphate at sowing.

Micro-nutrients: If manure is not used, apply Ferrous Sulphate (10 kg), Manganese Sulphate (4 kg), and Boric Acid (2 kg) per acre.`,
    `زنک: 10 کلو گرام (21 فیصد) یا 6 کلو گرام (33 فیصد) زنک سلفیٹ بوائی کے وقت ڈالیں۔

عناصر صغیرہ: گوبر نہ ڈالنے کی صورت میں فیرس سلفیٹ (10 کلو)، مینگانیز سلفیٹ (4 کلو) اور بورک ایسڈ (2 کلو) فی ایکڑ ڈالیں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "potato",
    13,
    "13. Harvesting",
    "13. برداشت",
    `Cut the vines 10–15 days before harvesting to allow the potato skin to harden. This reduces rot risk during cold storage. Harvest in the morning and keep tubers in shade for 3–4 days before packing.`,
    `برداشت سے 10 سے 15 دن پہلے بیلیں کاٹ دیں تاکہ آلو کا چھلکا سخت ہو جائے۔ اس سے سٹوریج کے دوران آلو گلنے کا خطرہ کم ہو جاتا ہے۔ فصل کی برداشت صبح کے وقت کریں اور 3 سے 4 دن سایہ دار جگہ پر رکھیں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "potato",
    14,
    "14. Post-Harvest / Storage",
    "14. بعد از برداشت اور ذخیرہ کاری",
    `Sorting: Separate wounded or diseased tubers.

Heaps: For farm storage, use 1-foot high raised beds with air ducts. Cover with straw to prevent greening from sunlight.

Cold Storage: Maintain airflow. Spray Delta-methrin or use Aluminum Phosphide tablets in the warehouse before storing.`,
    `چھانٹی: زخمی اور بیمار آلو علیحدہ کر لیں۔

ڈھیر: فارم پر ذخیرہ کرنے کے لیے ایک فٹ اونچی بیڈ بنائیں اور ہوا کے لیے نالیاں (ڈکٹس) رکھیں۔ اوپر پرالی ڈالیں تاکہ سورج کی روشنی سے آلو سبز نہ ہوں۔

کولڈ سٹوریج: گودام میں پہلے ڈیلٹا میتھرین کا سپرے یا ایلومینیم فاسفائڈ کی گولیاں رکھیں۔`
  );

  // ---------------- RICE (CROP) ----------------

  await db.runAsync(
    `INSERT INTO plants (id, name_en, name_ur, type)
     VALUES (?, ?, ?, ?);`,
    "rice", "Rice", "دھان", "crop"
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "rice", 1,
    "1. General Information", "1. عمومی معلومات",
    `Rice is a critical Kharif cash crop that fulfills local food requirements and plays a major role in earning foreign exchange. Punjab's traditional rice-growing areas produce varieties famous worldwide. Beyond human consumption, rice straw and husks are used as livestock fodder. In the 2024–25 season, rice was cultivated on 6,707 thousand acres with a total production of 6,030 thousand metric tons.`,
    `دھان خریف کی ایک نہایت اہم نقد آور فصل ہے جو مقامی ضروریات پوری کرنے کی ساتھ زر مبادلہ کمانے میں اہم کردار ادا کرتی ہے۔ پنجاب کے روایتی علاقوں کا چاول دنیا بھر میں پسند کیا جاتا ہے۔ چاول کے علاوہ اس کے پرالی اور پھک مویشیوں کے خوراک کے طور پر استعمال ہوتی ہے۔ سال 2024-25 کے دوران پنجاب میں 6,707 ہزار ایکڑ پر دھان کاشت کیا گیا جس کی کل پیداوار 6,030 ہزار میٹرک ٹن رہی۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "rice", 2,
    "2. Climate & Temperature", "2. آب و ہوا اور درجہ حرارت",
    `Nursery Sowing: Coarse varieties start from May 20 to June 7, while Basmati varieties are sown from June 7 to June 25.

Transplanting: Seedlings are moved to the field 25–30 days after sowing (June–July).

Climate Risks: Early sowing before May 20 is not recommended due to unfavorable weather impacts on yield. Water should be drained from nurseries during hot afternoons to prevent seeds from rotting.`,
    `نرسری کاشت: موٹی اقسام کی پنیری 20 مئی سے 7 جون، جبکہ باسمتی اقسام 7 جون سے 25 جون تک کاشت کی جاتی ہے۔

نرسری منتقلی: پنیری عموماً 25 سے 30 دن کی عمر میں (جون-جولائی) کھیت میں نرسری منتقل کی جاتی ہے۔

موسمی خطرات: 20 مئی سے پہلے اگیتی کاشت کی سفارش نہیں کی جاتی۔ شدید گرمی میں پنیری کا پانی شام کو نکال کر صبح تازہ پانی ڈالنا چاہیے تاکہ بیج گلے نہیں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "rice", 3,
    "3. Soil", "3. موزوں زمین",
    `Clayey or heavy soil is most suitable for rice as it retains water well. However, rice can be grown in all soil types except very sandy soil. With proper management, saline and "Kalar-athi" soils can also be utilized for rice cultivation.`,
    `دھان کی کاشت کے لیے چکنی زمین سب سے زیادہ موزوں ہے کیونکہ یہ پانی روکنے کی بہتر صلاحیت رکھتی ہے۔ البتہ ریتلی زمین کے سوا ہر قسم کی زمین میں دھان کاشت کیا جا سکتا ہے۔ کلر اٹھی اور شور زدہ زمینوں کو بھی مناسب دیکھ بھال سے استعمال کیا جا سکتا ہے۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "rice", 4,
    "4. Varieties", "4. اقسام",
    `Basmati/Fine: Super Basmati, Basmati 515, Chenab Basmati, Punjab Basmati, PK 1121 Aromatic, and Vital Super Basmati.

Coarse/Non-Basmati: IRRI-6, KS-282, KSK-133, NIAB IRRI-9, and KSK-434.

Hybrids: KSK-111-H (Basmati Hybrid) and various coarse hybrids.

Prohibited: Sowing unauthorized varieties like "Supra" or "1530" is strictly forbidden due to disease risks and poor grain quality.`,
    `باسمتی/فائن: سپر باسمتی، باسمتی 515، چناب باسمتی، پنجاب باسمتی، پی کے 1121 ایرومیٹک اور وائٹل سپر باسمتی۔

موٹی اقسام: اری-6، کے ایس-282، کے ایس کے-133، نیاب اری-9 اور کے ایس کے-434۔

ہائبرڈ: باسمتی ہائبرڈ کے ایس کے-111 ایچ اور دیگر موٹی ہائبرڈ اقسام۔

ممنوعہ اقسام: سپرا، 1530 اور دیگر غیر منظور شدہ اقسام کاشت نہ کریں کیونکہ ان پر بیماریوں کا حملہ زیادہ ہوتا ہے۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "rice", 5,
    "5. Land Preparation", "5. زمین کی تیاری",
    `Puddling (Kaddu): Apply 1–2 dry plowings, fill with water, then apply double plowing and planking (Suhaga).

DSR Preparation: For direct seeding, ensure land is perfectly leveled using a Laser Land Leveler to allow uniform germination.

Green Manure: Mix green manure crops like Jantar into the soil 15–20 days before transplanting to increase organic matter.`,
    `کدو کا طریقہ: ایک سے دو بار خشک ہل چلائیں، پانی بھریں، پھر دوبارہ ہل اور سہاگہ چلائیں۔

براہ راست کاشت: زمین کا لیزر لیولر سے ہموار ہونا ضروری ہے تاکہ اگاؤ یکساں ہو۔

سبز کھاد: نرسری منتقلی سے 15-20 دن پہلے جنتر جیسی فصلوں کو زمین میں دبا دیں تاکہ نامیاتی مادہ بڑھے۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "rice", 6,
    "6. Sowing / Planting", "6. طریقہ کاشت",
    `Transplanting Method: Maintain a distance of 9 inches between plants and rows. Use 2 plants per hole to achieve a population of 160,000 plants per acre.

Water Depth: Keep water level at 1–1.5 inches during transplanting.

Direct Seeding (DSR): Seeds are sown via drill in dry or moist soil at a depth of no more than 1.5 inches.`,
    `طریقہ نرسری منتقلی: پودوں اور قطاروں کا درمیانی فاصلہ 9 انچ رکھیں۔ ہر سوراخ میں 2 پودی لگائیں تاکہ فی ایکڑ 1 لاکھ 60 ہزار پودوں کی تعداد پوری ہو۔

پانی کی گہرائی: نرسری منتقلی کے وقت پانی کی سطح 1 سے ڈیڑھ انچ ہونی چاہیے۔

براہ راست کاشت: چرنا کے ذریعے خشک یا نم زمین میں ڈیڑھ انچ سے کم گہرائی پر بیج بوئیں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "rice", 7,
    "7. Seed / Propagation", "7. بیج اور انزائش",
    `Seed Rate: For coarse varieties, use 1–2 kg per marla; for Basmati, use 0.75–1.5 kg per marla depending on the sowing method.

Treatment: Dip seeds in a solution of recommended fungicide for 24 hours to prevent seed-borne diseases like "Bakanae".

Selection: Use a 2.5% salt solution (25g salt/liter) to separate light/unhealthy seeds, which will float to the top.`,
    `شرح بیج: موٹی اقسام کے لیے 1 سے 2 کلو جبکہ باسمتی کے لیے پونا سے ڈیڑھ کلو فی مرلہ (طریقہ کاشت کے مطابق) استعمال کریں۔

بیج کو زیر لگانا: بیج کو 24 گھنٹے فنجی سائڈ کے محلول میں بھگوئیں تاکہ بکائنی جیسی بیماریوں سے بچا جا سکے۔

صاف بیج: ناقص بیج الگ کرنے کے لیے 2.5 فیصد نمک کے محلول کا استعمال کریں، ہلکا بیج اوپر تیرتا لگے گا۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "rice", 8,
    "8. Fertiliser", "8. کھادوں کا استعمال",
    `Basmati: 1.5 bags DAP + 1 bag SOP at sowing; follow with 1.75 bags Urea in split doses.

Coarse: 1.75 bags DAP + 1 bag SOP at sowing; 2.5 bags Urea in split doses.

Zinc: Apply Zinc Sulphate (33%) at 6 kg per acre within 10–15 days after transplanting.`,
    `باسمتی: ڈیڑھ بوری ڈی اے پی + ایک بوری ایس او پی بوقت کاشت، بعد میں پونی دو بوری یوریا مستوں میں دیں۔

موٹی اقسام: پونی دو بوری ڈی اے پی + ایک بوری ایس او پی، بعد میں ڈھائی بوری یوریا مستوں میں دیں۔

زنک: نرسری منتقلی کے 10-15 دن بعد 6 کلو زنک سلفیٹ (33 فیصد) فی ایکڑ ڈالیں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "rice", 9,
    "9. Weed Control", "9. جڑی بوٹیوں کا انسداد",
    `Pre-emergence: Apply herbicides like Butachlor mixed in water via shaker bottle within 3–5 days of transplanting.

Post-emergence: Use sprays like Bispyribac-sodium within one month of transplanting in moist soil.

Cultural: Maintaining a 1–2 inch water level for the first 25 days suppresses many weeds.`,
    `اگاؤ سے پہلے: نرسری منتقلی کے 3 سے 5 دن کے اندر بیوٹا کلور جیسے زہریں شیکر بوتل سے پانی میں ڈالیں۔

اگاؤ کے بعد: نرسری منتقلی کے ایک ماہ کے اندر بسپائریبیک سوڈیم جیسے زہروں کا نم حالت میں سپرے کریں۔

غیر کیمیائی: پہلے 25 دن تک پانی کھڑا رکھنے سے جڑی بوٹیاں کو اگتی ہیں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "rice", 10,
    "10. Irrigation", "10. آبپاشی",
    `Keep water depth at 1–1.5 inches during the first week. Gradually increase to 2 inches but do not exceed 3 inches, or tillering will be reduced.

Stop irrigation two weeks before harvesting to allow the field to dry for machinery.

Never allow moisture stress during the grain-filling stage.`,
    `پہلی ہفتی پانی کی سطح ایک سے ڈیڑھ انچ رکھیں، بعد میں اسے 2 انچ تک کریں لیکن 3 انچ سے زیادہ نہ ہونے دیں۔

کٹائی سے دو ہفتے قبل پانی بند کر دیں۔

دانی بھرنے کے مرحلے پر فصل کو سوکا ہرگز نہ لگنے دیں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "rice", 11,
    "11. Pest & Disease Management", "11. بیماریوں اور کیڑوں کا انسداد",
    `Pests: Stem Borers (causes "Dead Heart" or "White Head"), Leaf Folder (folded leaves), and Plant Hoppers (Hopper burn). Use Cartap or Fipronil granules.

Diseases: Blast (eye-shaped spots), Brown Leaf Spot, and Bakanae (plants become tall and pale). Use fungicides like Difenoconazole or Hexaconazole.`,
    `کیڑے: تنے کی سنڈیاں (سفید سٹے کا سبب)، پتی لپیٹ سنڈی اور تیلہ (ہاپربھرن)۔ ان کے تدارک کے لیے کارٹاپ یا فپرونل دانے دار زہریں استعمال کریں۔

بیماریاں: دھان کا بھبھکا (Blast)، پتوں کی بھوری دھبی اور بکائنی۔ ان کے لیے ڈائی فینوکونازول یا ہیکسا کونازول کا استعمال کریں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "rice", 12,
    "12. Deficiencies & Remedies", "12. غذائی کمی اور تدارک",
    `Zinc Deficiency: Causes reddish-brown rust-like spots on leaves. Apply recommended Zinc Sulphate.

Boron Deficiency: New leaf tips become white and rolled. Apply 3 kg Boric Acid per acre during land preparation.`,
    `زنک کی کمی: پتوں پر زنگ آلود بھوری دھبی بنتی ہیں۔ تدارک کے لیے زنک سلفیٹ ڈالیں۔

بوران کی کمی: نئی پتوں کی نوکیں سفید ہو کر لپٹ جاتی ہیں۔ زمین کی تیاری کے وقت 3 کلو بورک ایسڈ فی ایکڑ ڈالیں۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "rice", 13,
    "13. Harvesting", "13. برداشت",
    `Manual harvesting is best when the upper grains are ripe and the bottom 2–3 grains are green but filled (20–22% moisture).

For mechanical harvesting (Combine Harvester), wait until the grains are 100% ripe.`,
    `ہاتھ سے کٹائی اس وقت کریں جب اوپر کے دانی پک جائیں اور نیچے کے 2-3 دانی ہری لیکن بھری ہوئی ہوں۔

کمبائن ہارویسٹر سے کٹائی تب کریں جب فصل 100 فیصد پک چکی ہو۔`
  );

  await db.runAsync(
    `INSERT INTO plant_sections
      (plant_id, order_index, title_en, title_ur, body_en, body_ur)
     VALUES (?, ?, ?, ?, ?, ?);`,
    "rice", 14,
    "14. Post-Harvest / Storage", "14. ذخیرہ کاری",
    `Dry the rice immediately after harvest to 12–13% moisture to prevent Aflatoxin (toxic mold) and fungal rot.

Do not use old jute or PP bags for storage without cleaning.

Fumigate warehouses using Aluminum Phosphide tablets under expert supervision.`,
    `افلاٹا ٹاکسن (زہریلی افلاں) سے بچنے کے لیے کٹائی کے بعد چاول کو فوراً سکھائیں تاکہ نمی 12-13 فیصد رہ جائے۔

پرانی بوری استعمال نہ کریں اور گوداموں میں ایلومینیم فاسفائڈ کی گولیوں سے فیومیگیشن کریں۔`
  );

  // ── GARLIC ──────────────────────────────────────────────────────────────
  await db.runAsync(`INSERT INTO plants (id, name_en, name_ur, type) VALUES (?, ?, ?, ?);`,
    "garlic", "Garlic", "لہسن", "crop");

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "garlic", 1, "1. General Information", "١. عمومی معلومات",
    `Garlic (Allium sativum) is one of the most important spice and medicinal crops grown in Pakistan. It is cultivated for its bulb, which is used as a flavouring agent in food and for its medicinal properties. Pakistan produces garlic mainly in Punjab, Sindh, and KPK. It is a cool-season crop that grows best in mild winters.`,
    `لہسن (Allium sativum) پاکستان میں اگائی جانے والی اہم مصالحہ اور دوائی فصلوں میں سے ایک ہے۔ اسے اس کے بلب کے لیے اگایا جاتا ہے جو کھانوں میں ذائقہ اور دواؤں میں استعمال ہوتا ہے۔ پاکستان میں لہسن بنیادی طور پر پنجاب، سندھ اور خیبر پختونخوا میں کاشت کی جاتی ہے۔ یہ ٹھنڈے موسم کی فصل ہے جو ہلکی سردیوں میں بہترین اگتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "garlic", 2, "2. Climate & Temperature", "٢. آب و ہوا اور درجہ حرارت",
    `Garlic grows best in cool, dry climates. Ideal temperature for growth is 12–24°C. High humidity and excessive rainfall promote fungal diseases. It requires a cold period (vernalization) for proper bulb formation. Hot weather during bulbing causes small, poor-quality bulbs.`,
    `لہسن ٹھنڈے اور خشک موسم میں بہترین اگتی ہے۔ نشوونما کے لیے مثالی درجہ حرارت 12 سے 24 ڈگری سینٹی گریڈ ہے۔ زیادہ نمی اور بارش پھپھوندی کی بیماریوں کو بڑھاوا دیتی ہے۔ بلب بننے کے لیے سردی کا ایک مرحلہ (ورنلائزیشن) ضروری ہے۔ بلب بناتے وقت گرم موسم چھوٹے اور کم معیاری بلب پیدا کرتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "garlic", 3, "3. Soil", "٣. موزوں زمین",
    `Well-drained, sandy loam or loam soil with pH 6.0–7.5 is ideal. Heavy clay soils cause waterlogging and bulb rot. Garlic cannot tolerate standing water. Soil should be rich in organic matter. Avoid fields where onion or garlic was grown in the previous season to reduce disease pressure.`,
    `اچھی نکاسی والی ریتلی دوہم یا دوہم مٹی جس کا pH 6.0 سے 7.5 ہو مثالی ہے۔ بھاری چکنی مٹی پانی جمع کرنے اور بلب سڑنے کا سبب بنتی ہے۔ لہسن کھڑے پانی کو برداشت نہیں کر سکتی۔ مٹی نامیاتی مادے سے بھرپور ہونی چاہیے۔ بیماری کے دباؤ کو کم کرنے کے لیے وہ کھیت استعمال نہ کریں جہاں پچھلے سیزن میں پیاز یا لہسن کاشت ہوئی ہو۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "garlic", 4, "4. Varieties", "٤. اقسام",
    `Popular varieties in Pakistan include Desi White (local variety, strong flavour), Chinese Garlic (larger bulbs, milder flavour), and Lehsan-e-Khas. Desi garlic is preferred for medicinal use and local markets. Chinese varieties give higher yield but are less pungent.`,
    `پاکستان میں مقبول اقسام میں دیسی وائٹ (مقامی قسم، تیز ذائقہ)، چینی لہسن (بڑے بلب، ہلکا ذائقہ) اور لہسن خاص شامل ہیں۔ دیسی لہسن دواؤں کے استعمال اور مقامی بازاروں میں زیادہ پسند کی جاتی ہے۔ چینی اقسام زیادہ پیداوار دیتی ہیں لیکن کم تیزی والی ہوتی ہیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "garlic", 5, "5. Land Preparation", "٥. زمین کی تیاری",
    `Deep plough (30–35 cm) 2–3 weeks before planting. Add 20–25 tonnes/acre of well-rotted farmyard manure (FYM) during land preparation. Make fine seedbed with 2–3 cultivations followed by planking. Raised beds or ridges help in drainage. Level the field properly to avoid waterlogging.`,
    `کاشت سے 2 سے 3 ہفتے پہلے 30 سے 35 سینٹی میٹر گہری جتائی کریں۔ زمین کی تیاری کے دوران 20 سے 25 ٹن فی ایکڑ اچھی طرح گلی سڑی گوبر کی کھاد ڈالیں۔ 2 سے 3 کاشت کاری کے بعد پٹوانی سے باریک بستر تیار کریں۔ اونچے بستر یا ڈولے نکاسی میں مدد دیتے ہیں۔ پانی جمع ہونے سے بچنے کے لیے کھیت کو برابر کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "garlic", 6, "6. Sowing / Planting", "٦. طریقہ کاشت",
    `Best sowing time: October–November in Punjab and Sindh. Plant individual cloves (not the whole bulb) 5–7 cm deep with the pointed end up. Row spacing: 20–25 cm; plant spacing: 10–15 cm. Cloves can be planted on flat beds or ridges. Avoid planting too deep as it delays emergence.`,
    `بہترین کاشت کا وقت: پنجاب اور سندھ میں اکتوبر تا نومبر۔ انفرادی کلیاں (پورا بلب نہیں) 5 سے 7 سینٹی میٹر گہری، نوکیلا سرا اوپر رکھ کر لگائیں۔ قطاروں کا فاصلہ: 20 سے 25 سینٹی میٹر؛ پودوں کا فاصلہ: 10 سے 15 سینٹی میٹر۔ کلیاں ہموار بستر یا ڈولوں پر لگائی جا سکتی ہیں۔ بہت گہرا لگانے سے اگاؤ دیر سے ہوتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "garlic", 7, "7. Seed / Propagation", "٧. شرح بیج",
    `Garlic is propagated vegetatively using cloves. Seed rate: 300–400 kg of cloves per acre. Use large, healthy, disease-free cloves for best stand and yield. Treat cloves with Thiram or Mancozeb (3 g/kg) before planting to prevent seed-borne diseases.`,
    `لہسن کو کلیوں کے ذریعے افزائش نسل دی جاتی ہے۔ شرح بیج: 300 سے 400 کلوگرام کلیاں فی ایکڑ۔ بہترین پودوں اور پیداوار کے لیے بڑی، صحت مند اور بیماری سے پاک کلیاں استعمال کریں۔ بیج سے پھیلنے والی بیماریوں سے بچنے کے لیے لگانے سے پہلے کلیوں کو تھائرم یا مینکوزیب (3 گرام فی کلوگرام) سے ٹریٹ کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "garlic", 8, "8. Fertiliser", "٨. کھادوں کا استعمال",
    `Apply at planting: DAP 50 kg/acre + Potash (SOP) 25 kg/acre. Top dress with Urea: 25 kg/acre at 30 days and again at 60 days after planting. Sulphur is important for garlic quality — apply Sulphur 5 kg/acre. Avoid excess nitrogen as it promotes lush leaf growth at the expense of bulb size.`,
    `لگاتے وقت ڈالیں: DAP 50 کلوگرام فی ایکڑ + پوٹاش (SOP) 25 کلوگرام فی ایکڑ۔ یوریا سے ٹاپ ڈریسنگ: 30 دن بعد 25 کلوگرام فی ایکڑ اور پھر لگانے کے 60 دن بعد۔ گندھک لہسن کے معیار کے لیے اہم ہے — 5 کلوگرام فی ایکڑ گندھک ڈالیں۔ زیادہ نائٹروجن سے گریز کریں کیونکہ یہ بلب کے سائز کی بجائے پتوں کی بہت زیادہ نشوونما کرتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "garlic", 9, "9. Weed Control", "٩. جڑی بوٹیوں کا انسداد",
    `Garlic is a poor competitor against weeds in early stages. Perform 2–3 hand weedings or hoeing. First weeding at 3–4 weeks after planting. Apply Pendimethalin (pre-emergence) at 1 L/acre before emergence as a chemical option. Keep field weed-free for the first 60 days for best bulb development.`,
    `لہسن ابتدائی مراحل میں جڑی بوٹیوں کے مقابلے میں کمزور ہوتی ہے۔ 2 سے 3 بار ہاتھ سے گوڈی کریں۔ پہلی گوڈی لگانے کے 3 سے 4 ہفتے بعد کریں۔ کیمیائی آپشن کے طور پر اگاؤ سے پہلے Pendimethalin (pre-emergence) 1 لیٹر فی ایکڑ ڈالیں۔ بہترین بلب نشوونما کے لیے پہلے 60 دن تک کھیت کو جڑی بوٹیوں سے پاک رکھیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "garlic", 10, "10. Irrigation", "١٠. آبپاشی",
    `First irrigation immediately after planting, then at 10–15 day intervals. Critical irrigation stages: after planting, at bulb initiation (60–75 days), and at bulb swelling. Reduce irrigation 2–3 weeks before harvest to improve bulb skin quality and shelf life. Avoid over-irrigation as it causes neck rot and reduces storability.`,
    `لگانے کے فوراً بعد پہلا پانی دیں، پھر 10 سے 15 دن کے وقفے سے آبپاشی کریں۔ اہم آبپاشی مراحل: لگانے کے بعد، بلب کی ابتداء (60 سے 75 دن)، اور بلب پھولتے وقت۔ کٹائی سے 2 سے 3 ہفتے پہلے آبپاشی کم کریں تاکہ بلب کی کھال کا معیار اور ذخیرہ کرنے کی صلاحیت بہتر ہو۔ زیادہ آبپاشی سے گریز کریں کیونکہ یہ گردن سڑنے اور ذخیرہ کرنے کی صلاحیت کم ہونے کا سبب بنتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "garlic", 11, "11. Pest & Disease Management", "١١. بیماریوں اور کیڑوں کا انسداد",
    `Common pests: Thrips (spray Imidacloprid 0.5 ml/L), Onion fly (Chlorpyrifos drench). Common diseases: Purple Blotch (Iprodione 1 g/L), Basal Rot / Fusarium (Thiram clove treatment), Rust (Mancozeb 2.5 g/L). Avoid overhead irrigation and ensure good drainage to reduce fungal disease pressure.`,
    `عام کیڑے: تھرپس (Imidacloprid 0.5 ملی لیٹر فی لیٹر اسپرے)، پیاز کی مکھی (Chlorpyrifos ڈرینچ)۔ عام بیماریاں: جامنی دھبہ (Iprodione 1 گرام فی لیٹر)، بنیادی سڑن / فیوزیریم (تھائرم سے کلی کا علاج)، زنگ (Mancozeb 2.5 گرام فی لیٹر)۔ پھپھوندی کی بیماریوں کو کم کرنے کے لیے اوپر سے آبپاشی سے گریز کریں اور اچھی نکاسی کو یقینی بنائیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "garlic", 12, "12. Deficiencies & Remedies", "١٢. تدارک",
    `Nitrogen deficiency: pale yellow leaves — apply Urea foliar spray (2%). Sulphur deficiency: young leaves turn yellow, reduced pungency — apply Gypsum 10 kg/acre. Zinc deficiency: stunted growth, white striping — spray Zinc Sulphate (0.5%). Iron deficiency: interveinal chlorosis — spray Ferrous Sulphate (0.3%).`,
    `نائٹروجن کی کمی: پیلے پتے — یوریا پتوں پر اسپرے (2 فیصد) کریں۔ گندھک کی کمی: نوجوان پتے پیلے ہوتے ہیں، تیزی کم ہوتی ہے — 10 کلوگرام فی ایکڑ جپسم ڈالیں۔ زنک کی کمی: نشوونما رک جاتی ہے، سفید دھاریاں — زنک سلفیٹ (0.5 فیصد) اسپرے کریں۔ آئرن کی کمی: پتوں کی رگوں کے درمیان پیلاپن — فیرس سلفیٹ (0.3 فیصد) اسپرے کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "garlic", 13, "13. Harvesting", "١٣. برداشت",
    `Harvest when 50–60% of leaves have turned yellow and tops begin to fall over (April–May). Avoid harvesting too early (immature bulbs) or too late (bulbs split). Lift bulbs carefully with a fork or spade to avoid bruising. Expected yield: 40–60 mounds/acre (desi) to 80–100 mounds/acre (improved varieties).`,
    `جب 50 سے 60 فیصد پتے پیلے ہو جائیں اور اوپری حصے گرنے لگیں (اپریل تا مئی) تو کٹائی کریں۔ بہت جلدی (کچے بلب) یا بہت دیر سے (بلب پھٹ جائیں) کٹائی سے گریز کریں۔ بلبوں کو کانٹے یا بیلچے سے احتیاط سے نکالیں تاکہ چوٹ نہ لگے۔ متوقع پیداوار: 40 سے 60 من فی ایکڑ (دیسی) سے 80 سے 100 من فی ایکڑ (بہتر اقسام)۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "garlic", 14, "14. Post Harvest / Storage", "١٤. ذخیرہ کاری",
    `Cure garlic by drying in the shade for 2–4 weeks before storage. Store in well-ventilated, cool, dry conditions (0–4°C, 60–70% RH for long storage). Traditional method: braid stems and hang in a dry airy place. Avoid storing in plastic bags as moisture buildup causes rot. Properly cured garlic can be stored for 6–8 months.`,
    `ذخیرہ کرنے سے پہلے لہسن کو 2 سے 4 ہفتے سایہ میں سکھائیں۔ اچھے ہوادار، ٹھنڈی اور خشک جگہ (0 سے 4 ڈگری سینٹی گریڈ، طویل ذخیرہ کے لیے 60 سے 70 فیصد نسبتی نمی) میں ذخیرہ کریں۔ روایتی طریقہ: تنوں کو گوندھ کر خشک ہوادار جگہ میں لٹکائیں۔ پلاسٹک تھیلوں میں ذخیرہ کرنے سے گریز کریں کیونکہ نمی سے سڑن آتی ہے۔ اچھی طرح کیورڈ لہسن 6 سے 8 ماہ تک محفوظ رہ سکتی ہے۔`
  );

  // ── ONION ───────────────────────────────────────────────────────────────
  await db.runAsync(`INSERT INTO plants (id, name_en, name_ur, type) VALUES (?, ?, ?, ?);`,
    "onion", "Onion", "پیاز", "crop");

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "onion", 1, "1. General Information", "١. عمومی معلومات",
    `Onion (Allium cepa) is a major vegetable and spice crop in Pakistan, cultivated across Punjab, Sindh, Balochistan, and KPK. It is used fresh, dried, and processed. Pakistan is among the top onion-producing countries. Two main crop seasons: Rabi (Oct–Nov sowing, harvest Mar–May) and Kharif (Jul–Aug sowing, harvest Nov–Dec).`,
    `پیاز (Allium cepa) پاکستان میں ایک اہم سبزی اور مصالحہ فصل ہے جو پنجاب، سندھ، بلوچستان اور خیبر پختونخوا میں کاشت ہوتی ہے۔ اسے تازہ، خشک اور پراسیسڈ شکل میں استعمال کیا جاتا ہے۔ پاکستان پیاز پیدا کرنے والے اہم ممالک میں شامل ہے۔ دو اہم فصلی موسم: ربیع (اکتوبر تا نومبر کاشت، مارچ تا مئی کٹائی) اور خریف (جولائی تا اگست کاشت، نومبر تا دسمبر کٹائی)۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "onion", 2, "2. Climate & Temperature", "٢. آب و ہوا اور درجہ حرارت",
    `Onion is a cool-season crop for vegetative growth but needs warm, dry weather for bulb maturation. Optimal temperature: 13–24°C for growth, 25–30°C for bulbing. High humidity during bulbing causes neck rot. Long days (13–14 hrs) trigger bulbing in most varieties. Hot and humid conditions promote disease.`,
    `پیاز نشوونما کے لیے ٹھنڈے موسم کی فصل ہے لیکن بلب پکنے کے لیے گرم اور خشک موسم کی ضرورت ہے۔ مثالی درجہ حرارت: نشوونما کے لیے 13 سے 24 ڈگری، بلبنگ کے لیے 25 سے 30 ڈگری سینٹی گریڈ۔ بلبنگ کے دوران زیادہ نمی گردن سڑنے کا سبب بنتی ہے۔ لمبے دن (13 سے 14 گھنٹے) زیادہ تر اقسام میں بلبنگ کو متحرک کرتے ہیں۔ گرم اور مرطوب حالات بیماریوں کو بڑھاوا دیتے ہیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "onion", 3, "3. Soil", "٣. موزوں زمین",
    `Sandy loam to loam soils with good drainage and pH 6.0–7.5 are best. Heavy clay causes bulb deformation and waterlogging. Onion is sensitive to salinity; avoid saline/waterlogged soils. High organic matter content improves bulb size. Avoid fields with a history of white rot disease.`,
    `ریتلی دوہم سے دوہم مٹی جس کی اچھی نکاسی اور pH 6.0 سے 7.5 ہو بہترین ہے۔ بھاری چکنی مٹی بلب کی بدشکلی اور پانی جمع ہونے کا سبب بنتی ہے۔ پیاز نمکیات کے لیے حساس ہے؛ نمکین یا پانی بھری مٹی سے گریز کریں۔ نامیاتی مادے کی زیادہ مقدار بلب کے سائز کو بہتر بناتی ہے۔ سفید سڑن کی تاریخ والے کھیتوں سے گریز کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "onion", 4, "4. Varieties", "٤. اقسام",
    `Popular Rabi varieties: Phulkara, Desi Red, NIFA Red, Swat-1. Kharif varieties: Gola, Chita Piyaz. Phulkara is the most widely grown Rabi variety in Punjab with good storage quality. NIFA Red has high pungency and disease tolerance. Hybrid varieties (from India/China) also available for higher yield.`,
    `مشہور ربیع اقسام: پھلکارہ، دیسی ریڈ، نیفا ریڈ، سوات-1۔ خریف اقسام: گولا، چتا پیاز۔ پھلکارہ پنجاب میں سب سے زیادہ کاشت ہونے والی ربیع قسم ہے جو اچھے ذخیرے کے معیار کی حامل ہے۔ نیفا ریڈ میں زیادہ تیزی اور بیماری برداشت کرنے کی صلاحیت ہے۔ زیادہ پیداوار کے لیے ہائبرڈ اقسام (ہندوستان/چین سے) بھی دستیاب ہیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "onion", 5, "5. Land Preparation", "٥. زمین کی تیاری",
    `Deep plough to 25–30 cm depth. Apply FYM 20–25 tonnes/acre during ploughing. Prepare a fine, firm seedbed. Make raised beds or flat beds 1.2 m wide with irrigation channels. Level the field well. In Kharif, prepare beds on elevated land to avoid flooding.`,
    `25 سے 30 سینٹی میٹر گہرائی تک گہری جتائی کریں۔ جتائی کے دوران 20 سے 25 ٹن فی ایکڑ گوبر کی کھاد ڈالیں۔ باریک اور مضبوط بستر تیار کریں۔ آبپاشی کی نالیوں کے ساتھ 1.2 میٹر چوڑے اونچے یا ہموار بستر بنائیں۔ کھیت کو اچھی طرح برابر کریں۔ خریف میں سیلاب سے بچنے کے لیے اونچی زمین پر بستر تیار کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "onion", 6, "6. Sowing / Planting", "٦. طریقہ کاشت",
    `Onion can be grown from seed (nursery transplant) or sets (small bulbs). Nursery method: Sow seeds in October (Rabi). Transplant 6–8 week old seedlings at 15×10 cm spacing. Direct seeding: 3–4 kg seed/acre. Transplanting gives more uniform crop and better weed control. Plant in rows on ridges for good drainage.`,
    `پیاز بیج (نرسری ٹرانسپلانٹ) یا سیٹس (چھوٹے بلب) سے اگائی جا سکتی ہے۔ نرسری طریقہ: ربیع میں اکتوبر میں بیج بوئیں۔ 6 سے 8 ہفتے کے پودے 15×10 سینٹی میٹر فاصلے سے منتقل کریں۔ براہ راست بوائی: 3 سے 4 کلوگرام بیج فی ایکڑ۔ ٹرانسپلانٹنگ سے زیادہ یکساں فصل اور بہتر جڑی بوٹی کنٹرول ملتا ہے۔ اچھی نکاسی کے لیے ڈولوں پر قطاروں میں لگائیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "onion", 7, "7. Seed / Propagation", "٧. شرح بیج",
    `Seed rate for nursery: 1.5–2 kg/acre. Seeds should be treated with Thiram (3 g/kg) before sowing. For sets: 200–250 kg/acre. Use certified seed from reliable sources. Germination rate should be above 70%. Seed viability declines rapidly after 1 year; always use fresh seed.`,
    `نرسری کے لیے شرح بیج: 1.5 سے 2 کلوگرام فی ایکڑ۔ بوائی سے پہلے بیج کو تھائرم (3 گرام فی کلوگرام) سے ٹریٹ کریں۔ سیٹس کے لیے: 200 سے 250 کلوگرام فی ایکڑ۔ قابل اعتماد ذرائع سے تصدیق شدہ بیج استعمال کریں۔ اگاؤ کی شرح 70 فیصد سے زیادہ ہونی چاہیے۔ 1 سال بعد بیج کی صلاحیت تیزی سے کم ہوتی ہے؛ ہمیشہ تازہ بیج استعمال کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "onion", 8, "8. Fertiliser", "٨. کھادوں کا استعمال",
    `Basal dose: DAP 50 kg/acre + SOP 25 kg/acre at transplanting. Top dressing: Urea 25 kg/acre at 30 days, repeat at 60 days. Avoid nitrogen after bulb initiation. Sulphur (gypsum 10 kg/acre) improves pungency and quality. Boron spray (0.1%) reduces hollow heart and improves bulb quality.`,
    `بنیادی خوراک: ٹرانسپلانٹ کے وقت DAP 50 کلوگرام فی ایکڑ + SOP 25 کلوگرام فی ایکڑ۔ ٹاپ ڈریسنگ: 30 دن میں یوریا 25 کلوگرام فی ایکڑ، 60 دن میں دہرائیں۔ بلب کی ابتداء کے بعد نائٹروجن سے گریز کریں۔ گندھک (جپسم 10 کلوگرام فی ایکڑ) تیزی اور معیار بہتر بناتا ہے۔ بوران اسپرے (0.1 فیصد) کھوکھلے دل کو کم کرتا ہے اور بلب کا معیار بہتر بناتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "onion", 9, "9. Weed Control", "٩. جڑی بوٹیوں کا انسداد",
    `Hand weed 2–3 times: at 3 weeks and 6 weeks after transplanting. Chemical: apply Oxyfluorfen (pre-transplant) or Pendimethalin (pre-emergence). Avoid deep cultivation as it damages shallow onion roots. Mulching with straw helps suppress weeds and conserve moisture. Keep field weed-free for first 60 days.`,
    `2 سے 3 بار ہاتھ سے گوڈی کریں: ٹرانسپلانٹ کے 3 اور 6 ہفتے بعد۔ کیمیائی: ٹرانسپلانٹ سے پہلے Oxyfluorfen یا اگاؤ سے پہلے Pendimethalin لگائیں۔ گہری کاشت کاری سے گریز کریں کیونکہ یہ اتھلی پیاز کی جڑوں کو نقصان پہنچاتی ہے۔ پھوس سے ملچنگ جڑی بوٹیوں کو دبانے اور نمی بچانے میں مدد دیتی ہے۔ پہلے 60 دن تک کھیت کو جڑی بوٹیوں سے پاک رکھیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "onion", 10, "10. Irrigation", "١٠. آبپاشی",
    `Irrigate at transplanting, then every 7–10 days. Critical stages: transplanting, active growth, bulb initiation (60–75 days). Reduce irrigation 3 weeks before harvest to harden bulbs and improve skin. Drip irrigation saves 40% water and reduces fungal diseases. Avoid furrow flooding which causes neck rot.`,
    `ٹرانسپلانٹ کے وقت پانی دیں، پھر ہر 7 سے 10 دن میں آبپاشی کریں۔ اہم مراحل: ٹرانسپلانٹ، فعال نشوونما، بلب کی ابتداء (60 سے 75 دن)۔ بلب سخت کرنے اور کھال بہتر بنانے کے لیے کٹائی سے 3 ہفتے پہلے آبپاشی کم کریں۔ ڈرپ آبپاشی 40 فیصد پانی بچاتی ہے اور پھپھوندی کی بیماریوں کو کم کرتی ہے۔ نالی سے سیلاب سے گریز کریں جو گردن سڑنے کا سبب بنتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "onion", 11, "11. Pest & Disease Management", "١١. بیماریوں اور کیڑوں کا انسداد",
    `Pests: Thrips (spray Spinosad 1 ml/L or Imidacloprid), Onion fly (Chlorpyrifos soil drench). Diseases: Purple blotch (Mancozeb 2.5 g/L), Downy mildew (Metalaxyl), Neck rot/Botrytis (Iprodione), White rot (soil treatment with Trichoderma). Crop rotation (3-year) is essential for white rot management.`,
    `کیڑے: تھرپس (Spinosad 1 ملی لیٹر فی لیٹر یا Imidacloprid اسپرے)، پیاز کی مکھی (Chlorpyrifos مٹی ڈرینچ)۔ بیماریاں: جامنی دھبہ (Mancozeb 2.5 گرام فی لیٹر)، ڈاؤنی ملڈیو (Metalaxyl)، گردن سڑن/بوٹریٹس (Iprodione)، سفید سڑن (Trichoderma سے مٹی کا علاج)۔ سفید سڑن کے انتظام کے لیے فصل کی ردوبدل (3 سال) ضروری ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "onion", 12, "12. Deficiencies & Remedies", "١٢. تدارک",
    `Nitrogen: yellowing of older leaves — apply Urea 25 kg/acre top dress. Sulphur: young leaves pale, reduced pungency — Gypsum 10 kg/acre. Zinc: stunted growth, white strip — Zinc Sulphate spray 0.5%. Boron: hollow heart, split bulbs — Borax spray 0.1%. Potassium: tip burn, poor storage — SOP 25 kg/acre.`,
    `نائٹروجن: پرانے پتوں کا پیلا پڑنا — یوریا 25 کلوگرام فی ایکڑ ٹاپ ڈریس۔ گندھک: نوجوان پتے پیلے، تیزی کم — جپسم 10 کلوگرام فی ایکڑ۔ زنک: نشوونما رکنا، سفید دھاری — زنک سلفیٹ اسپرے 0.5 فیصد۔ بوران: کھوکھلا دل، بلب پھٹنا — بورکس اسپرے 0.1 فیصد۔ پوٹاشیم: سرے جلنا، خراب ذخیرہ — SOP 25 کلوگرام فی ایکڑ۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "onion", 13, "13. Harvesting", "١٣. برداشت",
    `Harvest when tops fall naturally and 50–70% of necks have dried (March–May for Rabi). Lift bulbs carefully to avoid bruising. Cure in the field for 7–10 days or under shade. Expected yield: 80–120 mounds/acre (Rabi). Delayed harvesting causes bolting, splitting, and susceptibility to neck rot.`,
    `جب اوپری حصے قدرتی طور پر گریں اور 50 سے 70 فیصد گردنیں خشک ہو جائیں (ربیع کے لیے مارچ تا مئی) تو کٹائی کریں۔ بلبوں کو چوٹ سے بچاتے ہوئے احتیاط سے نکالیں۔ کھیت میں 7 سے 10 دن یا سایہ میں کیور کریں۔ متوقع پیداوار: 80 سے 120 من فی ایکڑ (ربیع)۔ دیر سے کٹائی سے پھولنا، پھٹنا اور گردن سڑن کا خطرہ ہوتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "onion", 14, "14. Post Harvest / Storage", "١٤. ذخیرہ کاری",
    `Cure bulbs for 2–3 weeks in a shaded, well-ventilated area before storage. Remove damaged, diseased, or sprouted bulbs before storage. Cold storage (0–2°C, 65–70% RH) extends shelf life to 6–8 months. Traditional mesh bags or slatted crates allow airflow. Avoid piling more than 1 m high to prevent bruising and heat buildup.`,
    `ذخیرہ کرنے سے پہلے بلبوں کو سایہ دار، ہوادار جگہ میں 2 سے 3 ہفتے کیور کریں۔ ذخیرہ سے پہلے خراب، بیمار یا اگے ہوئے بلب ہٹا دیں۔ کولڈ اسٹوریج (0 سے 2 ڈگری سینٹی گریڈ، 65 سے 70 فیصد نسبتی نمی) شیلف لائف کو 6 سے 8 ماہ تک بڑھاتا ہے۔ روایتی جالی کی بوریاں یا سلیٹڈ کریٹس ہوا کے بہاؤ کی اجازت دیتے ہیں۔ چوٹ اور گرمی جمع ہونے سے بچنے کے لیے 1 میٹر سے زیادہ اونچا ڈھیر نہ لگائیں۔`
  );

  // ── SUGARCANE ────────────────────────────────────────────────────────────
  await db.runAsync(`INSERT INTO plants (id, name_en, name_ur, type) VALUES (?, ?, ?, ?);`,
    "sugarcane", "Sugarcane", "گنا", "crop");

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sugarcane", 1, "1. General Information", "١. عمومی معلومات",
    `Sugarcane (Saccharum officinarum) is the most important cash crop of Pakistan and the primary source of sugar. Pakistan is among the world's top 10 sugarcane producing countries. It is mainly cultivated in Punjab and Sindh. The crop takes 12–14 months to mature and is also used for making gur (jaggery) and ethanol.`,
    `گنا (Saccharum officinarum) پاکستان کی سب سے اہم نقد فصل اور چینی کا بنیادی ذریعہ ہے۔ پاکستان دنیا کے گنا پیدا کرنے والے سرفہرست 10 ممالک میں شامل ہے۔ یہ بنیادی طور پر پنجاب اور سندھ میں کاشت ہوتی ہے۔ فصل پکنے میں 12 سے 14 ماہ لگتے ہیں اور اسے گڑ اور ایتھانول بنانے کے لیے بھی استعمال کیا جاتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sugarcane", 2, "2. Climate & Temperature", "٢. آب و ہوا اور درجہ حرارت",
    `Sugarcane is a tropical and subtropical crop. Optimal temperature: 27–38°C during growth; 12–14°C nights during ripening help sugar accumulation. It requires 1,200–1,500 mm of water (rainfall + irrigation) per crop cycle. Frost is damaging. Hot dry winds (loo) can cause excessive moisture loss and reduce sugar content.`,
    `گنا ایک اشنکٹبندیی اور نیم اشنکٹبندیی فصل ہے۔ مثالی درجہ حرارت: نشوونما کے دوران 27 سے 38 ڈگری؛ پکنے کے دوران 12 سے 14 ڈگری راتیں چینی جمع کرنے میں مدد دیتی ہیں۔ فصلی چکر میں 1200 سے 1500 ملی میٹر پانی (بارش + آبپاشی) درکار ہے۔ پالہ نقصاندہ ہے۔ گرم خشک ہوائیں (لو) بہت زیادہ نمی کی کمی اور چینی کی مقدار میں کمی کا سبب بن سکتی ہیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sugarcane", 3, "3. Soil", "٣. موزوں زمین",
    `Deep, well-drained loam or clay loam soil with pH 6.0–7.5 is ideal. Sandy soils have poor water retention and require more irrigation. Heavy clay soils cause waterlogging which reduces yield. Sugarcane can tolerate moderate salinity but not waterlogging. Avoid compacted soils; deep tillage helps root penetration.`,
    `گہری، اچھی نکاسی والی دوہم یا چکنی دوہم مٹی جس کا pH 6.0 سے 7.5 ہو مثالی ہے۔ ریتلی مٹی میں پانی برقرار رکھنے کی صلاحیت کم ہوتی ہے اور زیادہ آبپاشی کی ضرورت ہوتی ہے۔ بھاری چکنی مٹی پانی جمع ہونے کا سبب بنتی ہے جو پیداوار کم کرتی ہے۔ گنا معتدل نمکیات برداشت کر سکتی ہے لیکن پانی جمع نہیں۔ کمپیکٹ مٹی سے گریز کریں؛ گہری جتائی جڑوں کو گہرا جانے میں مدد دیتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sugarcane", 4, "4. Varieties", "٤. اقسام",
    `High-yielding varieties recommended in Pakistan: CP-77-400, HSF-240, SPF-234, BL-4, SPSG-26, and NSG-59. Early maturing varieties (11–12 months): HSF-240, BL-4. Late maturing (13–14 months): SPF-234. Disease-resistant varieties are preferred for red rot and smut-prone areas. Select variety based on local agro-climatic conditions.`,
    `پاکستان میں تجویز کردہ زیادہ پیداواری اقسام: CP-77-400، HSF-240، SPF-234، BL-4، SPSG-26 اور NSG-59۔ جلدی پکنے والی اقسام (11 سے 12 ماہ): HSF-240، BL-4۔ دیر سے پکنے والی (13 سے 14 ماہ): SPF-234۔ سرخ سڑن اور کھلی آتشک والے علاقوں میں بیماری مزاحم اقسام ترجیح دی جاتی ہیں۔ مقامی زرعی آب و ہوا کے حالات کے مطابق قسم منتخب کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sugarcane", 5, "5. Land Preparation", "٥. زمین کی تیاری",
    `Deep plough to 35–45 cm in autumn (after previous crop). Sub-soiling every 3–4 years helps break hardpan. Apply 20–30 tonnes/acre FYM during ploughing. Level the field for uniform irrigation. Make furrows 90–100 cm apart for planting. Pre-irrigation (palewa) before planting helps break clods and improve soil structure.`,
    `پچھلی فصل کے بعد خزاں میں 35 سے 45 سینٹی میٹر گہری جتائی کریں۔ ہر 3 سے 4 سال میں سب سوائلنگ سخت تہہ توڑنے میں مدد دیتی ہے۔ جتائی کے دوران 20 سے 30 ٹن فی ایکڑ گوبر کی کھاد ڈالیں۔ یکساں آبپاشی کے لیے کھیت کو برابر کریں۔ لگانے کے لیے 90 سے 100 سینٹی میٹر کے فاصلے پر نالیاں بنائیں۔ لگانے سے پہلے پری آبپاشی (پلیوہ) ڈھیلے توڑنے اور مٹی کی ساخت بہتر بنانے میں مدد دیتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sugarcane", 6, "6. Sowing / Planting", "٦. طریقہ کاشت",
    `Sugarcane is planted using stem cuttings (setts) with 2–3 buds. Best planting time: February–March (spring crop) or October (autumn crop). Spring planting gives higher yield. Place setts end-to-end in furrows and cover with 5–7 cm soil. Row spacing: 90–100 cm. Seed rate: 40,000–45,000 setts/acre (about 4–5 tonnes).`,
    `گنا تنے کی قلموں (سیٹس) سے لگائی جاتی ہے جن میں 2 سے 3 آنکھیں ہوتی ہیں۔ بہترین وقت: فروری تا مارچ (بہاری فصل) یا اکتوبر (خزانی فصل)۔ بہاری کاشت زیادہ پیداوار دیتی ہے۔ سیٹس کو سرے سے سرے ملا کر نالیوں میں رکھیں اور 5 سے 7 سینٹی میٹر مٹی سے ڈھانپیں۔ قطاروں کا فاصلہ: 90 سے 100 سینٹی میٹر۔ شرح بیج: 40,000 سے 45,000 سیٹس فی ایکڑ (تقریباً 4 سے 5 ٹن)۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sugarcane", 7, "7. Seed / Propagation", "٧. شرح بیج",
    `Use disease-free, healthy seed cane from certified nurseries or selected fields. Treat setts with hot water (50°C for 2 hours) or Carbendazim solution to control ratoon stunting disease (RSD) and smut. Do not use seed from fields with red rot. Setts should have healthy buds with no signs of drying or disease.`,
    `تصدیق شدہ نرسریوں یا منتخب کھیتوں سے بیماری سے پاک، صحت مند بیج گنا استعمال کریں۔ ریٹون اسٹنٹنگ بیماری (RSD) اور کھلی آتشک کو کنٹرول کرنے کے لیے سیٹس کو گرم پانی (50 ڈگری پر 2 گھنٹے) یا Carbendazim محلول سے ٹریٹ کریں۔ سرخ سڑن والے کھیتوں کا بیج استعمال نہ کریں۔ سیٹس میں صحت مند آنکھیں ہوں اور خشکی یا بیماری کا کوئی نشان نہ ہو۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sugarcane", 8, "8. Fertiliser", "٨. کھادوں کا استعمال",
    `Basal: DAP 100 kg/acre + SOP 50 kg/acre at planting. Nitrogen schedule: Urea 50 kg/acre at 30 days (sprouting), 50 kg/acre at 60 days (tillering), 50 kg/acre at 90 days (grand growth). Apply Zinc Sulphate 5 kg/acre if soil is deficient. Total N requirement: 120–150 kg N/acre. Avoid late nitrogen which delays ripening.`,
    `بنیادی: لگانے کے وقت DAP 100 کلوگرام فی ایکڑ + SOP 50 کلوگرام فی ایکڑ۔ نائٹروجن شیڈول: یوریا 50 کلوگرام فی ایکڑ 30 دن (اگاؤ)، 50 کلوگرام فی ایکڑ 60 دن (ٹلرنگ)، 50 کلوگرام فی ایکڑ 90 دن (بڑی نشوونما) پر۔ اگر مٹی میں کمی ہو تو زنک سلفیٹ 5 کلوگرام فی ایکڑ ڈالیں۔ کل نائٹروجن کی ضرورت: 120 سے 150 کلوگرام N فی ایکڑ۔ دیر سے نائٹروجن دینے سے گریز کریں جو پکنے میں تاخیر کرتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sugarcane", 9, "9. Weed Control", "٩. جڑی بوٹیوں کا انسداد",
    `Weed control is critical in the first 90 days. Two inter-row cultivations at 30 and 60 days are essential. Apply Atrazine (pre-emergence, 1 kg a.i./acre) or Metribuzin for broadleaf weeds. After canopy closure, weeds are naturally suppressed. Trash mulching (dry leaves) helps suppress weeds between ratoon crops.`,
    `پہلے 90 دنوں میں جڑی بوٹی کنٹرول بہت ضروری ہے۔ 30 اور 60 دن میں قطاروں کے درمیان دو بار کاشت کاری ضروری ہے۔ چوڑے پتوں والی جڑی بوٹیوں کے لیے Atrazine (اگاؤ سے پہلے، 1 کلوگرام a.i. فی ایکڑ) یا Metribuzin لگائیں۔ چھتری بند ہونے کے بعد جڑی بوٹیاں قدرتی طور پر دب جاتی ہیں۔ ٹریش ملچنگ (خشک پتے) ریٹون فصلوں کے درمیان جڑی بوٹیوں کو دبانے میں مدد دیتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sugarcane", 10, "10. Irrigation", "١٠. آبپاشی",
    `Water requirement: 40–50 irrigations per crop cycle. Critical stages: germination (immediately after planting), tillering (30–60 days), grand growth (60–120 days). Irrigation interval: 10–15 days in summer, 20–25 days in winter. Avoid waterlogging especially in heavy soils. Water stress during grand growth severely reduces cane yield.`,
    `پانی کی ضرورت: فصلی چکر میں 40 سے 50 آبپاشیاں۔ اہم مراحل: انکرنا (لگانے کے فوراً بعد)، ٹلرنگ (30 سے 60 دن)، بڑی نشوونما (60 سے 120 دن)۔ آبپاشی کا وقفہ: گرمیوں میں 10 سے 15 دن، سردیوں میں 20 سے 25 دن۔ خاص طور پر بھاری مٹی میں پانی جمع ہونے سے گریز کریں۔ بڑی نشوونما کے دوران پانی کی کمی گنے کی پیداوار کو شدید نقصان پہنچاتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sugarcane", 11, "11. Pest & Disease Management", "١١. بیماریوں اور کیڑوں کا انسداد",
    `Major pests: Sugarcane borer (Pyralid moth — spray Chlorpyrifos or release Trichogramma), Termites (Chlorpyrifos soil drench at planting), Pyrilla (Dimethoate spray). Diseases: Red rot (Colletotrichum — use disease-free seed, resistant varieties), Smut (hot water seed treatment), Ratoon stunting disease (hot water + Carbendazim treatment).`,
    `اہم کیڑے: گنے کا بور (Pyralid کیڑا — Chlorpyrifos اسپرے یا Trichogramma چھوڑیں)، دیمک (لگانے کے وقت Chlorpyrifos مٹی ڈرینچ)، پیریلا (Dimethoate اسپرے)۔ بیماریاں: سرخ سڑن (Colletotrichum — بیماری سے پاک بیج اور مزاحم اقسام استعمال کریں)، کھلی آتشک (گرم پانی سے بیج کا علاج)، ریٹون اسٹنٹنگ بیماری (گرم پانی + Carbendazim علاج)۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sugarcane", 12, "12. Deficiencies & Remedies", "١٢. تدارک",
    `Nitrogen: yellow-green leaves, stunted growth — apply Urea top dress. Iron: young leaves yellow with green veins — spray Ferrous Sulphate 0.3%. Zinc: broad white bands on leaves — Zinc Sulphate spray 0.5% or soil application 5 kg/acre. Potassium: marginal leaf scorch, lodging — apply SOP 25 kg/acre. Magnesium: interveinal chlorosis — spray MgSO4 1%.`,
    `نائٹروجن: پیلے سبز پتے، نشوونما رکنا — یوریا ٹاپ ڈریس۔ آئرن: نوجوان پتے پیلے لیکن رگیں سبز — فیرس سلفیٹ 0.3 فیصد اسپرے کریں۔ زنک: پتوں پر چوڑی سفید پٹیاں — زنک سلفیٹ 0.5 فیصد اسپرے یا مٹی میں 5 کلوگرام فی ایکڑ۔ پوٹاشیم: پتوں کے کناروں کا جلنا، لٹکنا — SOP 25 کلوگرام فی ایکڑ۔ میگنیشیم: رگوں کے درمیان پیلاپن — MgSO4 1 فیصد اسپرے کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sugarcane", 13, "13. Harvesting", "١٣. برداشت",
    `Harvest at 12–14 months (October–March for spring planted crop). Signs of maturity: yellowing of top leaves, reduced growth, sweet juice with high Brix reading (18–20°). Cut at or below ground level to protect ratoon buds. Strip dry leaves (trash) before or after cutting. Average yield: 800–1200 mounds/acre. Higher sugar recovery in cooler weather.`,
    `12 سے 14 ماہ میں کٹائی کریں (بہاری فصل کے لیے اکتوبر تا مارچ)۔ پکنے کی علامات: اوپری پتوں کا پیلا پڑنا، نشوونما کم ہونا، زیادہ Brix ریڈنگ (18 سے 20 ڈگری) کے ساتھ میٹھا رس۔ ریٹون آنکھوں کی حفاظت کے لیے زمین کی سطح پر یا نیچے کاٹیں۔ کاٹنے سے پہلے یا بعد خشک پتے (ٹریش) اتاریں۔ اوسط پیداوار: 800 سے 1200 من فی ایکڑ۔ ٹھنڈے موسم میں چینی کی زیادہ ریکوری ملتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sugarcane", 14, "14. Post Harvest / Storage", "١٤. ذخیرہ کاری",
    `Sugarcane must be crushed within 24–48 hours of cutting as sucrose rapidly degrades after harvest. Transport to mill quickly; avoid bruising which accelerates deterioration. For ratoon management: apply fertiliser and irrigation immediately after harvest. Ratoon crops give 70–80% of plant crop yield. Up to 3–4 ratoons are economically viable.`,
    `گنے کو کٹائی کے 24 سے 48 گھنٹوں کے اندر پیسنا چاہیے کیونکہ کٹائی کے بعد سوکروز تیزی سے ٹوٹتا ہے۔ جلدی سے مل پہنچائیں؛ چوٹ سے گریز کریں جو خرابی کو تیز کرتی ہے۔ ریٹون انتظام کے لیے: کٹائی کے فوراً بعد کھاد اور آبپاشی کریں۔ ریٹون فصلیں پودے کی فصل کی 70 سے 80 فیصد پیداوار دیتی ہیں۔ 3 سے 4 ریٹون تک اقتصادی طور پر قابل عمل ہیں۔`
  );

  // ── SUNFLOWER ────────────────────────────────────────────────────────────
  await db.runAsync(`INSERT INTO plants (id, name_en, name_ur, type) VALUES (?, ?, ?, ?);`,
    "sunflower", "Sunflower", "سورج مکھی", "crop");

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sunflower", 1, "1. General Information", "١. عمومی معلومات",
    `Sunflower (Helianthus annuus) is an important oilseed crop grown in Pakistan for its seeds, which contain 40–50% oil. It is cultivated in two seasons: spring (Feb–Mar) and autumn (Sep–Oct). Pakistan grows sunflower mainly in Punjab. It is a short-duration crop (90–100 days) and fits well in crop rotations, especially after wheat.`,
    `سورج مکھی (Helianthus annuus) پاکستان میں اس کے بیجوں کے لیے اگائی جانے والی اہم تیل دار فصل ہے جن میں 40 سے 50 فیصد تیل ہوتا ہے۔ یہ دو موسموں میں کاشت ہوتی ہے: بہاری (فروری تا مارچ) اور خزانی (ستمبر تا اکتوبر)۔ پاکستان میں سورج مکھی بنیادی طور پر پنجاب میں اگائی جاتی ہے۔ یہ مختصر مدت کی فصل ہے (90 سے 100 دن) اور فصل کی ردوبدل میں، خاص طور پر گندم کے بعد، خوب فٹ بیٹھتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sunflower", 2, "2. Climate & Temperature", "٢. آب و ہوا اور درجہ حرارت",
    `Sunflower is adaptable to a wide range of climates. Optimal temperature: 20–25°C. It can tolerate light frost at seedling stage. Very high temperatures (>35°C) during flowering reduce seed set. It is drought tolerant but requires adequate moisture at flowering and seed filling stages. Avoid excessive humidity to prevent disease.`,
    `سورج مکھی آب و ہوا کی وسیع رینج کے لیے قابل موافقت ہے۔ مثالی درجہ حرارت: 20 سے 25 ڈگری سینٹی گریڈ۔ یہ پودے کی ابتدائی حالت میں ہلکا پالہ برداشت کر سکتی ہے۔ پھول آنے کے دوران بہت زیادہ درجہ حرارت (35 ڈگری سے زیادہ) بیج پڑنے کو کم کرتا ہے۔ یہ خشک سالی برداشت کر سکتی ہے لیکن پھول اور بیج بھرنے کے مراحل میں مناسب نمی کی ضرورت ہے۔ بیماریوں سے بچنے کے لیے زیادہ نمی سے گریز کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sunflower", 3, "3. Soil", "٣. موزوں زمین",
    `Sunflower grows in a variety of soils but prefers well-drained, loam to clay loam soils with pH 6.0–7.5. It can tolerate mild salinity better than many crops. Avoid waterlogged soils as the plant is sensitive to standing water. Sandy soils need more irrigation. Its deep taproot can access subsoil moisture.`,
    `سورج مکھی مختلف قسم کی مٹیوں میں اگتی ہے لیکن pH 6.0 سے 7.5 والی اچھی نکاسی والی دوہم سے چکنی دوہم مٹی کو ترجیح دیتی ہے۔ یہ بہت سی فصلوں سے بہتر ہلکا نمکیاپن برداشت کر سکتی ہے۔ پانی بھری مٹی سے گریز کریں کیونکہ یہ کھڑے پانی کے لیے حساس ہے۔ ریتلی مٹی میں زیادہ آبپاشی درکار ہے۔ اس کی گہری مرکزی جڑ زیر زمین نمی تک پہنچ سکتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sunflower", 4, "4. Varieties", "٤. اقسام",
    `Recommended hybrids in Pakistan: Hysun-33, Hysun-38, SF-187, Parsun-1, Shams. Hysun-33 and Hysun-38 are most widely used — high oil content (45–48%), early maturity (90–95 days). Open-pollinated varieties are also available but have lower yield. Choose varieties with resistance to Sclerotinia stem rot and Alternaria leaf blight.`,
    `پاکستان میں تجویز کردہ ہائبرڈز: Hysun-33، Hysun-38، SF-187، Parsun-1، Shams۔ Hysun-33 اور Hysun-38 سب سے زیادہ استعمال ہوتے ہیں — زیادہ تیل کی مقدار (45 سے 48 فیصد)، جلدی پکنا (90 سے 95 دن)۔ کھلی پولینیشن اقسام بھی دستیاب ہیں لیکن پیداوار کم ہوتی ہے۔ Sclerotinia تنے کی سڑن اور Alternaria پتوں کی جھلسن کے خلاف مزاحمت والی اقسام منتخب کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sunflower", 5, "5. Land Preparation", "٥. زمین کی تیاری",
    `Plough deeply (25–30 cm), then cultivate twice to achieve a fine seedbed. Apply FYM 10–15 tonnes/acre during ploughing. Level the field for uniform germination and irrigation. Make ridges or raised beds in flood-prone areas. Pre-sowing irrigation (palewa) if soil is dry, followed by seeding when soil reaches field capacity.`,
    `گہری جتائی (25 سے 30 سینٹی میٹر) کریں، پھر باریک بستر کے لیے دو بار کاشت کاری کریں۔ جتائی کے دوران 10 سے 15 ٹن فی ایکڑ گوبر کی کھاد ڈالیں۔ یکساں انکرنے اور آبپاشی کے لیے کھیت کو برابر کریں۔ سیلاب زدہ علاقوں میں ڈولے یا اونچے بستر بنائیں۔ اگر مٹی خشک ہو تو بوائی سے پہلے آبپاشی (پلیوہ) کریں، پھر جب مٹی فیلڈ کپیسٹی پر آئے تو بوائی کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sunflower", 6, "6. Sowing / Planting", "٦. طریقہ کاشت",
    `Spring sowing: February–March. Autumn sowing: September–October. Row spacing: 60–75 cm; plant spacing: 20–25 cm. Sow 2–3 seeds per hill, thin to 1 plant after emergence. Sowing depth: 4–5 cm. Ridge planting is preferred for good drainage and earthing up. Seed rate: 1.5–2 kg/acre (for hybrids, use manufacturer recommendations).`,
    `بہاری بوائی: فروری تا مارچ۔ خزانی بوائی: ستمبر تا اکتوبر۔ قطاروں کا فاصلہ: 60 سے 75 سینٹی میٹر؛ پودوں کا فاصلہ: 20 سے 25 سینٹی میٹر۔ ہر جگہ 2 سے 3 بیج بوئیں، اگاؤ کے بعد 1 پودا رہنے دیں۔ بوائی کی گہرائی: 4 سے 5 سینٹی میٹر۔ اچھی نکاسی اور مٹی چڑھانے کے لیے ڈولے کی کاشت ترجیح دی جاتی ہے۔ شرح بیج: 1.5 سے 2 کلوگرام فی ایکڑ (ہائبرڈز کے لیے، مینوفیکچرر کی ہدایات دیکھیں)۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sunflower", 7, "7. Seed / Propagation", "٧. شرح بیج",
    `Use certified hybrid seed for maximum yield and uniformity. Treat seed with Thiram or Captan (3 g/kg) before sowing. For hybrids, seed rate is 1.5 kg/acre; for open-pollinated varieties, 2–3 kg/acre. Ensure good germination test (>85%) before purchasing. Store seed in cool, dry conditions; do not save seed from hybrids.`,
    `زیادہ سے زیادہ پیداوار اور یکسانیت کے لیے تصدیق شدہ ہائبرڈ بیج استعمال کریں۔ بوائی سے پہلے بیج کو تھائرم یا کیپٹن (3 گرام فی کلوگرام) سے ٹریٹ کریں۔ ہائبرڈز کے لیے شرح بیج 1.5 کلوگرام فی ایکڑ؛ کھلی پولینیشن اقسام کے لیے 2 سے 3 کلوگرام فی ایکڑ۔ خریداری سے پہلے اچھا اگاؤ ٹیسٹ (85 فیصد سے زیادہ) یقینی بنائیں۔ ٹھنڈی خشک جگہ میں بیج ذخیرہ کریں؛ ہائبرڈز سے بیج نہ بچائیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sunflower", 8, "8. Fertiliser", "٨. کھادوں کا استعمال",
    `Basal: DAP 75 kg/acre + SOP 25 kg/acre at sowing. Urea top dressing: 25 kg/acre at 30 days (vegetative), 25 kg/acre at 55 days (just before flowering). Boron is very important for sunflower — spray Borax 0.2% at bud initiation and again at full bloom to improve seed set. Zinc deficiency common — apply Zinc Sulphate 5 kg/acre if needed.`,
    `بنیادی: بوائی کے وقت DAP 75 کلوگرام فی ایکڑ + SOP 25 کلوگرام فی ایکڑ۔ یوریا ٹاپ ڈریسنگ: 30 دن میں 25 کلوگرام فی ایکڑ (نباتاتی)، 55 دن میں 25 کلوگرام فی ایکڑ (پھول آنے سے ٹھیک پہلے)۔ بوران سورج مکھی کے لیے بہت اہم ہے — بیج پڑنے کو بہتر بنانے کے لیے کلی نکلتے وقت اور پھر مکمل پھول پر Borax 0.2 فیصد اسپرے کریں۔ زنک کی کمی عام ہے — ضرورت ہو تو زنک سلفیٹ 5 کلوگرام فی ایکڑ ڈالیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sunflower", 9, "9. Weed Control", "٩. جڑی بوٹیوں کا انسداد",
    `Keep field weed-free for first 30–40 days. Perform 1–2 inter-row cultivations with hoe at 3 and 6 weeks. Chemical: apply Metolachlor or Pendimethalin (pre-emergence). After row closure the crop shades out most weeds. Orobanche (broomrape) is a parasitic weed problem in some areas — use resistant varieties and crop rotation.`,
    `پہلے 30 سے 40 دن تک کھیت کو جڑی بوٹیوں سے پاک رکھیں۔ 3 اور 6 ہفتوں میں کدال سے 1 سے 2 بار قطاروں کے درمیان کاشت کاری کریں۔ کیمیائی: اگاؤ سے پہلے Metolachlor یا Pendimethalin لگائیں۔ قطار بند ہونے کے بعد فصل زیادہ تر جڑی بوٹیوں کو سایہ سے دبا دیتی ہے۔ بعض علاقوں میں Orobanche (ڈھوڈی) ایک پرجیوی جڑی بوٹی کا مسئلہ ہے — مزاحم اقسام اور فصل ردوبدل استعمال کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sunflower", 10, "10. Irrigation", "١٠. آبپاشی",
    `Sunflower needs 5–7 irrigations. Critical stages: germination, vegetative growth (30 days), flower bud formation (45–50 days), flowering (60–65 days), and seed filling (75–85 days). Withhold irrigation 2 weeks before harvest. Deficit irrigation at flowering causes poor seed set. Drip or furrow irrigation preferred over flood to avoid stem rot.`,
    `سورج مکھی کو 5 سے 7 آبپاشیوں کی ضرورت ہے۔ اہم مراحل: انکرنا، نباتاتی نشوونما (30 دن)، پھول کی کلی بننا (45 سے 50 دن)، پھول آنا (60 سے 65 دن)، اور بیج بھرنا (75 سے 85 دن)۔ کٹائی سے 2 ہفتے پہلے آبپاشی روکیں۔ پھول کے وقت کم آبپاشی سے بیج پڑنا خراب ہوتا ہے۔ تنے کی سڑن سے بچنے کے لیے سیلابی آبپاشی کی بجائے ڈرپ یا نالی آبپاشی ترجیح دی جاتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sunflower", 11, "11. Pest & Disease Management", "١١. بیماریوں اور کیڑوں کا انسداد",
    `Pests: Sunflower beetle (Carbofuran granules), aphids (Imidacloprid spray), birds (netting or scare devices near maturity). Diseases: Alternaria leaf blight (Mancozeb 2.5 g/L), Sclerotinia stem rot (Carbendazim soil drench), Downy mildew (Metalaxyl seed treatment). Avoid dense planting and overhead irrigation to reduce fungal diseases.`,
    `کیڑے: سورج مکھی کا بیٹل (Carbofuran دانے)، تیلا (Imidacloprid اسپرے)، پرندے (پکنے کے قریب جالی یا ڈرانے کے آلات)۔ بیماریاں: Alternaria پتوں کی جھلسن (Mancozeb 2.5 گرام فی لیٹر)، Sclerotinia تنے کی سڑن (Carbendazim مٹی ڈرینچ)، ڈاؤنی ملڈیو (Metalaxyl بیج کا علاج)۔ پھپھوندی کی بیماریوں کو کم کرنے کے لیے گھنی کاشت اور اوپر سے آبپاشی سے گریز کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sunflower", 12, "12. Deficiencies & Remedies", "١٢. تدارک",
    `Boron: incomplete seed fill, hollow seeds, empty centre of head — spray Borax 0.2% at bud and bloom stages. Zinc: interveinal chlorosis on young leaves — spray Zinc Sulphate 0.5%. Nitrogen: pale yellowing of older leaves — top dress Urea. Potassium: leaf edge scorch, poor seed quality — apply SOP. Iron: young leaf yellowing — spray Ferrous Sulphate 0.3%.`,
    `بوران: بیج نامکمل بھرنا، کھوکھلے بیج، سر کا خالی مرکز — کلی اور پھول کے مراحل میں Borax 0.2 فیصد اسپرے کریں۔ زنک: نوجوان پتوں پر رگوں کے درمیان پیلاپن — زنک سلفیٹ 0.5 فیصد اسپرے کریں۔ نائٹروجن: پرانے پتوں کا ہلکا پیلا پڑنا — یوریا ٹاپ ڈریس کریں۔ پوٹاشیم: پتوں کے کناروں کا جلنا، بیج کا خراب معیار — SOP ڈالیں۔ آئرن: نوجوان پتوں کا پیلا پڑنا — فیرس سلفیٹ 0.3 فیصد اسپرے کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sunflower", 13, "13. Harvesting", "١٣. برداشت",
    `Harvest when back of the head turns yellow-brown and seed moisture is 15–20% (about 90–100 days). Cut heads with 30–50 cm stem attached. Dry heads in sun for 5–7 days before threshing. Avoid harvesting in rain. Machine threshing (combine) gives faster results. Yield: 12–18 mounds/acre (hybrids under good management).`,
    `کٹائی اس وقت کریں جب سر کا پچھلا حصہ پیلا بھورا ہو جائے اور بیج کی نمی 15 سے 20 فیصد ہو (تقریباً 90 سے 100 دن)۔ 30 سے 50 سینٹی میٹر تنا لگے ہوئے سر کاٹیں۔ گہائی سے پہلے سروں کو دھوپ میں 5 سے 7 دن خشک کریں۔ بارش میں کٹائی سے گریز کریں۔ مشین کی گہائی (کمبائن) سے تیز نتائج ملتے ہیں۔ پیداوار: 12 سے 18 من فی ایکڑ (اچھے انتظام میں ہائبرڈز)۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "sunflower", 14, "14. Post Harvest / Storage", "١٤. ذخیرہ کاری",
    `Dry seeds to 8–9% moisture before storage. Store in clean, dry gunny bags or hermetic bags in a cool, airy warehouse. Fumigate with Aluminium Phosphide (3 tablets per tonne) for long-term storage. Sunflower oil is extracted by pressing or solvent extraction. Seed can be stored 6–12 months at cool temperatures. Avoid moisture ingress which causes rancidity and fungal contamination.`,
    `ذخیرہ کرنے سے پہلے بیج کو 8 سے 9 فیصد نمی تک خشک کریں۔ ٹھنڈے، ہوادار گودام میں صاف، خشک بوریوں یا ہرمیٹک بیگز میں ذخیرہ کریں۔ طویل مدتی ذخیرہ کے لیے ایلومینیم فاسفائڈ (3 گولیاں فی ٹن) سے فیومیگیشن کریں۔ سورج مکھی کا تیل دبانے یا سالوینٹ نکالنے سے حاصل کیا جاتا ہے۔ ٹھنڈے درجہ حرارت پر بیج 6 سے 12 ماہ ذخیرہ کیا جا سکتا ہے۔ نمی داخل ہونے سے گریز کریں جو بدبو اور پھپھوندی آلودگی کا سبب بنتی ہے۔`
  );

  // ── TOMATO ───────────────────────────────────────────────────────────────
  await db.runAsync(`INSERT INTO plants (id, name_en, name_ur, type) VALUES (?, ?, ?, ?);`,
    "tomato", "Tomato", "ٹماٹر", "crop");

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "tomato", 1, "1. General Information", "١. عمومی معلومات",
    `Tomato (Solanum lycopersicum) is the most important vegetable crop in Pakistan, grown year-round in different regions. It is a high-value cash crop used fresh, canned, and processed (ketchup, paste). Major producing areas: Punjab (Attock, Chakwal, Rawalpindi), Sindh, KPK, and Balochistan (Mastung). Two main seasons: spring-summer and autumn-winter.`,
    `ٹماٹر (Solanum lycopersicum) پاکستان میں سب سے اہم سبزی فصل ہے جو مختلف علاقوں میں سال بھر اگائی جاتی ہے۔ یہ ایک اعلی قدری نقد فصل ہے جو تازہ، ڈبہ بند اور پراسیسڈ (کیچپ، پیسٹ) شکل میں استعمال ہوتی ہے۔ بڑے پیداواری علاقے: پنجاب (اٹک، چکوال، راولپنڈی)، سندھ، خیبر پختونخوا اور بلوچستان (مستونگ)۔ دو اہم موسم: بہاری-گرمائی اور خزانی-سرمائی۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "tomato", 2, "2. Climate & Temperature", "٢. آب و ہوا اور درجہ حرارت",
    `Tomato grows best in a warm, dry climate. Optimal temperature: 20–27°C for vegetative growth; 18–24°C for fruit set. Temperatures above 35°C cause blossom drop and reduce fruit set. Frost is lethal. High humidity promotes diseases like late blight. Night temperatures below 13°C reduce fruit set. Altitude (above 1000 m) allows summer cultivation in Pakistan.`,
    `ٹماٹر گرم اور خشک آب و ہوا میں بہترین اگتا ہے۔ مثالی درجہ حرارت: نباتاتی نشوونما کے لیے 20 سے 27 ڈگری؛ پھل پڑنے کے لیے 18 سے 24 ڈگری سینٹی گریڈ۔ 35 ڈگری سے زیادہ درجہ حرارت پھول جھڑنے اور پھل پڑنا کم ہونے کا سبب بنتا ہے۔ پالہ مہلک ہے۔ زیادہ نمی دیر سے آنے والی جھلسن جیسی بیماریوں کو بڑھاوا دیتی ہے۔ 13 ڈگری سے کم رات کا درجہ حرارت پھل پڑنا کم کرتا ہے۔ بلندی (1000 میٹر سے اوپر) پاکستان میں گرمیوں میں کاشت کی اجازت دیتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "tomato", 3, "3. Soil", "٣. موزوں زمین",
    `Well-drained, sandy loam to loam soil with pH 6.0–7.0 is ideal. Avoid heavy clay soils which cause waterlogging and root rot. Tomato is moderately sensitive to salinity. Good organic matter content improves water retention and yields. Avoid continuous cropping on the same land without rotation to prevent soil-borne diseases.`,
    `اچھی نکاسی والی ریتلی دوہم سے دوہم مٹی جس کا pH 6.0 سے 7.0 ہو مثالی ہے۔ بھاری چکنی مٹی سے گریز کریں جو پانی جمع ہونے اور جڑوں کی سڑن کا سبب بنتی ہے۔ ٹماٹر نمکیات کے لیے معتدل طور پر حساس ہے۔ نامیاتی مادے کی اچھی مقدار پانی برقرار رکھنے اور پیداوار کو بہتر بناتی ہے۔ مٹی سے پھیلنے والی بیماریوں سے بچنے کے لیے ردوبدل کے بغیر ایک ہی زمین پر مسلسل کاشت سے گریز کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "tomato", 4, "4. Varieties", "٤. اقسام",
    `Popular varieties in Pakistan: Roma VF (processing), Nagina, Rio Grande, Moneymaker, Naqeeb (determinate). Hybrid varieties: Sahil, Ravi, Gulabi (high yield, disease resistant). For hills: BS-1, Lal Badshah. Indeterminate varieties require staking. Choose based on intended use (fresh market vs. processing) and local climate.`,
    `پاکستان میں مشہور اقسام: Roma VF (پروسیسنگ)، نگینہ، Rio Grande، Moneymaker، نقیب (determinant)۔ ہائبرڈ اقسام: ساحل، راوی، گلابی (زیادہ پیداوار، بیماری مزاحم)۔ پہاڑوں کے لیے: BS-1، لال بادشاہ۔ Indeterminate اقسام کو سہارے کی ضرورت ہے۔ مقصد (تازہ بازار بمقابلہ پروسیسنگ) اور مقامی آب و ہوا کی بنیاد پر انتخاب کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "tomato", 5, "5. Land Preparation", "٥. زمین کی تیاری",
    `Plough to 25–30 cm depth and make a fine seedbed. Apply FYM 15–20 tonnes/acre during land preparation. Raised beds (15–20 cm high) are recommended for better drainage and reducing soil-borne diseases. Solarise soil with clear plastic film for 4–6 weeks in summer before planting to reduce nematode and pathogen load.`,
    `25 سے 30 سینٹی میٹر گہرائی تک جوتیں اور باریک بستر بنائیں۔ زمین کی تیاری کے دوران 15 سے 20 ٹن فی ایکڑ گوبر کی کھاد ڈالیں۔ بہتر نکاسی اور مٹی سے پھیلنے والی بیماریوں کو کم کرنے کے لیے اونچے بستر (15 سے 20 سینٹی میٹر اونچے) کی سفارش کی جاتی ہے۔ نیماٹوڈ اور پاتھوجن کا بوجھ کم کرنے کے لیے لگانے سے پہلے گرمیوں میں 4 سے 6 ہفتے شفاف پلاسٹک فلم سے مٹی کو سولرائز کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "tomato", 6, "6. Sowing / Planting", "٦. طریقہ کاشت",
    `Nursery method is standard. Sow seeds in nursery trays or beds. Transplant 4–5 week old seedlings (15–20 cm tall). Spring planting: January–February. Autumn planting: July–August. Transplant in evening to reduce heat stress. Row spacing: 60–75 cm; plant spacing: 45–60 cm. Water immediately after transplanting. Provide shade for first 3–4 days in hot weather.`,
    `نرسری طریقہ معیاری ہے۔ نرسری ٹریز یا بستروں میں بیج بوئیں۔ 4 سے 5 ہفتے کے پودے (15 سے 20 سینٹی میٹر لمبے) منتقل کریں۔ بہاری کاشت: جنوری تا فروری۔ خزانی کاشت: جولائی تا اگست۔ گرمی کے دباؤ کو کم کرنے کے لیے شام کو منتقل کریں۔ قطاروں کا فاصلہ: 60 سے 75 سینٹی میٹر؛ پودوں کا فاصلہ: 45 سے 60 سینٹی میٹر۔ منتقلی کے فوراً بعد پانی دیں۔ گرم موسم میں پہلے 3 سے 4 دن سایہ فراہم کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "tomato", 7, "7. Seed / Propagation", "٧. شرح بیج",
    `Seed rate: 80–100 g/acre for nursery. Use certified, virus-free seed. Treat seed with Thiram (3 g/kg) or hot water (50°C for 25 minutes) before sowing to reduce seed-borne pathogens. Hybrid seed is more expensive but gives higher yield and disease resistance. Do not save seed from hybrids. Store seed at cool (4°C), dry conditions.`,
    `شرح بیج: نرسری کے لیے 80 سے 100 گرام فی ایکڑ۔ تصدیق شدہ، وائرس سے پاک بیج استعمال کریں۔ بیج سے پھیلنے والے پاتھوجنز کو کم کرنے کے لیے بوائی سے پہلے تھائرم (3 گرام فی کلوگرام) یا گرم پانی (50 ڈگری پر 25 منٹ) سے بیج کا علاج کریں۔ ہائبرڈ بیج مہنگا ہوتا ہے لیکن زیادہ پیداوار اور بیماری مزاحمت دیتا ہے۔ ہائبرڈز سے بیج نہ بچائیں۔ ٹھنڈی (4 ڈگری)، خشک جگہ میں بیج ذخیرہ کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "tomato", 8, "8. Fertiliser", "٨. کھادوں کا استعمال",
    `Basal: DAP 75 kg/acre + SOP 25 kg/acre at transplanting. Urea: 25 kg/acre at 3 weeks, 25 kg/acre at 6 weeks (before flowering). Calcium is critical to prevent blossom end rot — apply Calcium Nitrate foliar spray (0.5%) every 2 weeks during fruiting. Avoid excess nitrogen during fruiting which causes excessive leaf growth. Potassium (SOP) during fruiting improves colour and quality.`,
    `بنیادی: ٹرانسپلانٹ کے وقت DAP 75 کلوگرام فی ایکڑ + SOP 25 کلوگرام فی ایکڑ۔ یوریا: 3 ہفتوں میں 25 کلوگرام فی ایکڑ، 6 ہفتوں میں 25 کلوگرام فی ایکڑ (پھول آنے سے پہلے)۔ پھول کے سرے کی سڑن کو روکنے کے لیے کیلشیم بہت ضروری ہے — پھل آنے کے دوران ہر 2 ہفتے میں Calcium Nitrate پتوں پر اسپرے (0.5 فیصد) کریں۔ پھل کے وقت زیادہ نائٹروجن سے گریز کریں جو بہت زیادہ پتوں کی نشوونما کرتا ہے۔ پھل کے دوران پوٹاشیم (SOP) رنگ اور معیار بہتر بناتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "tomato", 9, "9. Weed Control", "٩. جڑی بوٹیوں کا انسداد",
    `Hand weed 2–3 times in the first 6 weeks. Raised bed cultivation with plastic mulch (black polythene) significantly reduces weeds and conserves moisture. Chemical: apply Metolachlor or Pendimethalin pre-transplant. Avoid disturbing soil around plants to prevent root damage. Keep rows weed-free during the first 45 days for maximum yield.`,
    `پہلے 6 ہفتوں میں 2 سے 3 بار ہاتھ سے گوڈی کریں۔ کالی پولی تھین کے ملچ کے ساتھ اونچے بستر کی کاشت جڑی بوٹیوں کو نمایاں طور پر کم کرتی اور نمی بچاتی ہے۔ کیمیائی: ٹرانسپلانٹ سے پہلے Metolachlor یا Pendimethalin لگائیں۔ جڑوں کو نقصان سے بچانے کے لیے پودوں کے آس پاس مٹی کو ہلانے سے گریز کریں۔ زیادہ سے زیادہ پیداوار کے لیے پہلے 45 دنوں میں قطاروں کو جڑی بوٹیوں سے پاک رکھیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "tomato", 10, "10. Irrigation", "١٠. آبپاشی",
    `Irrigate immediately after transplanting, then every 5–7 days. Critical stages: transplanting, flowering, and fruit development. Drip irrigation reduces blossom end rot, leaf diseases, and water use by 40%. Avoid over-irrigation which promotes root rot and fungal diseases. Withhold water for 5–7 days before harvest to improve fruit quality and firmness.`,
    `ٹرانسپلانٹ کے فوراً بعد پانی دیں، پھر ہر 5 سے 7 دن میں آبپاشی کریں۔ اہم مراحل: ٹرانسپلانٹ، پھول آنا اور پھل کی نشوونما۔ ڈرپ آبپاشی پھول کے سرے کی سڑن، پتوں کی بیماریوں اور پانی کے استعمال کو 40 فیصد کم کرتی ہے۔ زیادہ آبپاشی سے گریز کریں جو جڑوں کی سڑن اور پھپھوندی کی بیماریوں کو بڑھاوا دیتی ہے۔ پھل کا معیار اور مضبوطی بہتر بنانے کے لیے کٹائی سے 5 سے 7 دن پہلے پانی روکیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "tomato", 11, "11. Pest & Disease Management", "١١. بیماریوں اور کیڑوں کا انسداد",
    `Pests: Whitefly (Imidacloprid spray — also vector of TYLCV virus), fruit borer (Spinosad 1 ml/L), aphids, mites (Abamectin). Diseases: Early blight (Mancozeb 2.5 g/L), Late blight (Metalaxyl+Mancozeb), Bacterial wilt (no cure — use resistant varieties, soil solarisation), Fusarium crown rot (Carbendazim drench), TYLCV virus (control whitefly vector). Scout regularly and act early.`,
    `کیڑے: سفید مکھی (Imidacloprid اسپرے — TYLCV وائرس کا ویکٹر بھی)، پھل چھیدنے والا (Spinosad 1 ملی لیٹر فی لیٹر)، تیلا، چیتا (Abamectin)۔ بیماریاں: جلدی جھلسن (Mancozeb 2.5 گرام فی لیٹر)، دیر سے جھلسن (Metalaxyl+Mancozeb)، بیکٹیریل مرجھاؤ (کوئی علاج نہیں — مزاحم اقسام اور مٹی سولرائزیشن استعمال کریں)، Fusarium کراؤن سڑن (Carbendazim ڈرینچ)، TYLCV وائرس (سفید مکھی ویکٹر کو کنٹرول کریں)۔ باقاعدگی سے معائنہ کریں اور جلدی اقدام کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "tomato", 12, "12. Deficiencies & Remedies", "١٢. تدارک",
    `Calcium: blossom end rot (brown leathery bottom of fruit) — spray Calcium Nitrate 0.5% every 10–14 days. Magnesium: interveinal yellowing of lower leaves — spray Epsom salt (MgSO4) 1%. Nitrogen: pale leaves, stunted growth — Urea foliar 2% or soil application. Potassium: tip burn, cracking of fruit — SOP 25 kg/acre. Boron: distorted growth, hollow stem — Borax spray 0.1%.`,
    `کیلشیم: پھول کے سرے کی سڑن (پھل کا بھورا چمڑے جیسا تلا) — ہر 10 سے 14 دن میں Calcium Nitrate 0.5 فیصد اسپرے کریں۔ میگنیشیم: نچلے پتوں کی رگوں کے درمیان پیلاپن — Epsom salt (MgSO4) 1 فیصد اسپرے کریں۔ نائٹروجن: ہلکے پتے، نشوونما رکنا — یوریا پتوں پر 2 فیصد یا مٹی میں۔ پوٹاشیم: سرے جلنا، پھل پھٹنا — SOP 25 کلوگرام فی ایکڑ۔ بوران: بگڑی نشوونما، کھوکھلا تنا — Borax اسپرے 0.1 فیصد۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "tomato", 13, "13. Harvesting", "١٣. برداشت",
    `Harvest at breaker stage (first colour break) for long-distance transport. Harvest fully red for local markets. Pick every 3–4 days for continuous harvest. Average yield: 150–200 mounds/acre (open-pollinated), 250–350 mounds/acre (hybrids). Handle gently to avoid bruising. Harvest in early morning when temperatures are cool.`,
    `لمبے فاصلے کی نقل و حمل کے لیے بریکر مرحلے (پہلے رنگ کی تبدیلی) پر کٹائی کریں۔ مقامی بازاروں کے لیے مکمل سرخ پر کاٹیں۔ مسلسل کٹائی کے لیے ہر 3 سے 4 دن میں توڑیں۔ اوسط پیداوار: 150 سے 200 من فی ایکڑ (کھلی پولینیشن)، 250 سے 350 من فی ایکڑ (ہائبرڈز)۔ چوٹ سے بچنے کے لیے نرمی سے سنبھالیں۔ صبح سویرے جب درجہ حرارت ٹھنڈا ہو کاٹیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "tomato", 14, "14. Post Harvest / Storage", "١٤. ذخیرہ کاری",
    `Store at 12–15°C, 85–90% RH for 2–4 weeks (mature green). Fully ripe tomatoes store only 5–7 days at room temperature. Do not refrigerate below 10°C as chilling injury causes flavour loss and texture breakdown. Ethylene gas (ripening rooms) accelerates ripening of green tomatoes. For processing: deliver to factory within 24 hours of harvest.`,
    `پختہ سبز کے لیے 12 سے 15 ڈگری سینٹی گریڈ، 85 سے 90 فیصد نسبتی نمی پر 2 سے 4 ہفتے ذخیرہ کریں۔ مکمل پکے ٹماٹر کمرے کے درجہ حرارت پر صرف 5 سے 7 دن رہتے ہیں۔ 10 ڈگری سے نیچے فریج میں نہ رکھیں کیونکہ ٹھنڈی چوٹ ذائقہ ختم کرتی اور بناوٹ خراب کرتی ہے۔ ایتھیلین گیس (رائپننگ کمرے) سبز ٹماٹروں کے پکنے کو تیز کرتی ہے۔ پروسیسنگ کے لیے: کٹائی کے 24 گھنٹوں کے اندر فیکٹری پہنچائیں۔`
  );

  // ── ALOE VERA ────────────────────────────────────────────────────────────
  await db.runAsync(`INSERT INTO plants (id, name_en, name_ur, type) VALUES (?, ?, ?, ?);`,
    "aloevera", "Aloe Vera", "ایلوویرا", "home");

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "aloevera", 1, "1. General Information", "١. عمومی معلومات",
    `Aloe vera (Aloe barbadensis miller) is a succulent plant widely cultivated for its medicinal, cosmetic, and culinary uses. The gel inside the thick leaves is used to treat burns, skin conditions, and digestive issues. It is easy to grow at home, requires little water, and thrives in pots or garden beds. Pakistan's warm climate is well-suited to aloe vera cultivation.`,
    `ایلو ویرا (Aloe barbadensis miller) ایک رسیلا پودا ہے جو دواؤں، کاسمیٹک اور کھانے کے استعمال کے لیے وسیع پیمانے پر کاشت کیا جاتا ہے۔ موٹے پتوں کے اندر موجود جیل جلنے، جلدی حالات اور ہاضمے کی شکایات کے علاج میں استعمال ہوتا ہے۔ یہ گھر میں اگانا آسان ہے، کم پانی درکار ہے اور گملوں یا باغیچے میں خوب پھلتا پھولتا ہے۔ پاکستان کا گرم موسم ایلو ویرا کی کاشت کے لیے بہت موزوں ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "aloevera", 2, "2. Climate & Temperature", "٢. آب و ہوا اور درجہ حرارت",
    `Aloe vera thrives in hot, dry climates. Optimal temperature: 13–27°C. It can tolerate heat above 40°C but is frost-sensitive. Prolonged cold below 5°C causes leaf damage and root rot. In Pakistan, it grows well outdoors year-round in Punjab and Sindh. In cooler areas, grow in pots and bring indoors during frost.`,
    `ایلو ویرا گرم اور خشک موسم میں بہترین اگتی ہے۔ مثالی درجہ حرارت: 13 سے 27 ڈگری سینٹی گریڈ۔ یہ 40 ڈگری سے زیادہ گرمی برداشت کر سکتی ہے لیکن پالے کے لیے حساس ہے۔ 5 ڈگری سے کم لمبے سردی سے پتوں کو نقصان اور جڑوں میں سڑن آتی ہے۔ پاکستان میں، یہ پنجاب اور سندھ میں سال بھر باہر خوب اگتی ہے۔ ٹھنڈے علاقوں میں، گملوں میں اگائیں اور پالے کے دوران گھر کے اندر لے آئیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "aloevera", 3, "3. Soil", "٣. موزوں زمین",
    `Aloe vera needs very well-drained, sandy or sandy loam soil. Heavy clay soil causes root rot because aloe cannot tolerate waterlogging. A cactus/succulent potting mix works well for container growing. Add 30–40% coarse sand or perlite to regular soil. Ideal pH: 7.0–8.5 (slightly alkaline). Avoid soil with poor drainage at all costs.`,
    `ایلو ویرا کو بہت اچھی نکاسی والی، ریتلی یا ریتلی دوہم مٹی چاہیے۔ بھاری چکنی مٹی جڑوں میں سڑن پیدا کرتی ہے کیونکہ ایلو ویرا پانی جمع ہونا برداشت نہیں کر سکتی۔ گملے میں اگانے کے لیے کیکٹس/سکیولنٹ مکسچر اچھا کام کرتا ہے۔ عام مٹی میں 30 سے 40 فیصد موٹی ریت یا پرلائٹ ملائیں۔ مثالی pH: 7.0 سے 8.5 (ہلکا الکلائن)۔ ہر صورت میں خراب نکاسی والی مٹی سے گریز کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "aloevera", 4, "4. Varieties", "٤. اقسام",
    `The most commonly grown species is Aloe barbadensis miller (true aloe vera), which has the highest medicinal gel content. Other ornamental species include Aloe arborescens, Aloe ferox, and Aloe saponaria. For home growing and medicinal use, stick to Aloe barbadensis miller. Commercial gel production uses certified high-gel cultivars bred for maximum inner leaf content.`,
    `سب سے زیادہ کاشت کی جانے والی قسم Aloe barbadensis miller (حقیقی ایلو ویرا) ہے جس میں سب سے زیادہ دواؤں کی جیل ہوتی ہے۔ دیگر آرائشی اقسام میں Aloe arborescens، Aloe ferox اور Aloe saponaria شامل ہیں۔ گھر میں اگانے اور دواؤں کے استعمال کے لیے Aloe barbadensis miller پر قائم رہیں۔ تجارتی جیل پیداوار زیادہ اندرونی پتی کی مقدار کے لیے تیار کردہ تصدیق شدہ ہائی جیل کاشتکاراں استعمال کرتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "aloevera", 5, "5. Land Preparation", "٥. زمین کی تیاری",
    `For garden beds: loosen soil to 30 cm, mix in 30–40% coarse sand and compost. Raised beds (15–20 cm high) are ideal to prevent waterlogging. For pots: use a well-draining succulent mix. Ensure pot has drainage holes — this is critical. For outdoor fields: make raised ridges and avoid depressions where water can collect.`,
    `باغیچے کے بستروں کے لیے: مٹی کو 30 سینٹی میٹر تک ڈھیلا کریں، 30 سے 40 فیصد موٹی ریت اور کمپوسٹ ملائیں۔ پانی جمع ہونے سے بچنے کے لیے اونچے بستر (15 سے 20 سینٹی میٹر اونچے) مثالی ہیں۔ گملوں کے لیے: اچھی نکاسی والا سکیولنٹ مکسچر استعمال کریں۔ یقینی بنائیں کہ گملے میں نکاسی کے سوراخ ہوں — یہ بہت ضروری ہے۔ باہری کھیتوں کے لیے: اونچے ڈولے بنائیں اور ایسی جگہوں سے گریز کریں جہاں پانی جمع ہو سکتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "aloevera", 6, "6. Sowing / Planting", "٦. طریقہ کاشت",
    `Aloe vera is propagated using offsets (pups) — small plants that sprout around the base. Separate pups when they are 8–10 cm tall. Let the cut end dry (callous) for 1–2 days before planting to prevent rot. Plant 3–5 cm deep. Space plants 30–45 cm apart. Best planting season: spring (March–April) or early monsoon. Direct sunlight preferred.`,
    `ایلو ویرا کو آفسیٹس (پپس) سے کاشت کیا جاتا ہے — چھوٹے پودے جو بنیاد کے گرد اگتے ہیں۔ جب پپس 8 سے 10 سینٹی میٹر لمبے ہوں تو انہیں الگ کریں۔ سڑن سے بچنے کے لیے لگانے سے پہلے کٹے ہوئے سرے کو 1 سے 2 دن خشک ہونے دیں (کیلس بنائیں)۔ 3 سے 5 سینٹی میٹر گہرا لگائیں۔ پودوں کے درمیان 30 سے 45 سینٹی میٹر فاصلہ رکھیں۔ بہترین کاشت کا موسم: بہار (مارچ تا اپریل) یا موسم برسات کا آغاز۔ براہ راست سورج کی روشنی ترجیح دی جاتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "aloevera", 7, "7. Seed / Propagation", "٧. شرح بیج",
    `Aloe vera is almost always propagated vegetatively using offsets (pups), not by seed. Seed propagation is slow and variable. Offsets root quickly in 2–4 weeks. A mature aloe plant produces many offsets over its life. For home growing, one healthy mother plant will provide unlimited propagation material. Keep offset divisions clean and dry before planting.`,
    `ایلو ویرا کو تقریباً ہمیشہ آفسیٹس (پپس) سے نشوونما دی جاتی ہے، بیج سے نہیں۔ بیج سے پودا لگانا سست اور متغیر ہوتا ہے۔ آفسیٹس 2 سے 4 ہفتوں میں جڑ پکڑ لیتے ہیں۔ ایک پختہ ایلو ویرا پودا اپنی زندگی میں بہت سے آفسیٹس پیدا کرتا ہے۔ گھر میں اگانے کے لیے، ایک صحت مند مدر پلانٹ لامحدود نشوونما مواد فراہم کرے گا۔ لگانے سے پہلے آفسیٹ کی تقسیم کو صاف اور خشک رکھیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "aloevera", 8, "8. Fertiliser", "٨. کھادوں کا استعمال",
    `Aloe vera is a low-nutrient plant and needs minimal fertilisation. Over-fertilising causes excessive leaf growth but reduced gel quality. Apply a balanced slow-release fertiliser (10:10:10) once in spring. A light compost top-dressing once a year is sufficient for home plants. Avoid high-nitrogen fertilisers. Do not fertilise during winter dormancy.`,
    `ایلو ویرا کم غذائی اجزاء والا پودا ہے اور کم سے کم کھاد کی ضرورت ہے۔ زیادہ کھاد دینے سے پتوں کی زیادہ نشوونما لیکن جیل کا معیار کم ہو جاتا ہے۔ بہار میں ایک بار متوازن آہستہ اخراج کھاد (10:10:10) دیں۔ گھر کے پودوں کے لیے سال میں ایک بار ہلکی کمپوسٹ ٹاپ ڈریسنگ کافی ہے۔ زیادہ نائٹروجن والی کھادوں سے گریز کریں۔ موسم سرما میں خاموشی کے دوران کھاد نہ دیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "aloevera", 9, "9. Weed Control", "٩. جڑی بوٹیوں کا انسداد",
    `Hand-pull weeds around aloe plants. Do not use chemical herbicides near aloe as they can be absorbed through the roots. A layer of gravel or coarse sand mulch around plants suppresses weeds and helps drainage. In garden beds, hoe shallowly between plants. Keep weeds away especially during establishment (first 60 days after planting).`,
    `ایلو ویرا کے پودوں کے آس پاس ہاتھ سے جڑی بوٹیاں اکھیڑیں۔ ایلو ویرا کے قریب کیمیائی جڑی بوٹی مار دوائیں استعمال نہ کریں کیونکہ وہ جڑوں کے ذریعے جذب ہو سکتی ہیں۔ پودوں کے آس پاس بجری یا موٹی ریت کی ملچ کی ایک تہہ جڑی بوٹیوں کو دباتی اور نکاسی میں مدد دیتی ہے۔ باغیچے کے بستروں میں پودوں کے درمیان اتھلی کاشت کاری کریں۔ خاص طور پر قیام کے دوران (لگانے کے بعد پہلے 60 دن) جڑی بوٹیوں کو دور رکھیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "aloevera", 10, "10. Irrigation", "١٠. آبپاشی",
    `Aloe vera is drought-tolerant and prefers to dry out between waterings. Water deeply but infrequently: every 2–3 weeks in summer, once a month in winter. Allow soil to dry completely before watering again. In pots: water only when the top 5 cm of soil is dry. Over-watering is the number one killer of aloe — symptoms include soft, mushy leaves and root rot.`,
    `ایلو ویرا خشکی برداشت کرنے والا پودا ہے اور پانی دینے کے درمیان خشک ہونا پسند کرتا ہے۔ گہرا لیکن کم پانی دیں: گرمیوں میں ہر 2 سے 3 ہفتے میں، سردیوں میں مہینے میں ایک بار۔ دوبارہ پانی دینے سے پہلے مٹی کو مکمل طور پر خشک ہونے دیں۔ گملوں میں: صرف اس وقت پانی دیں جب مٹی کی اوپری 5 سینٹی میٹر خشک ہو۔ زیادہ پانی دینا ایلو ویرا کا نمبر ایک قاتل ہے — علامات میں نرم، گیلے پتے اور جڑوں کی سڑن شامل ہیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "aloevera", 11, "11. Pest & Disease Management", "١١. بیماریوں اور کیڑوں کا انسداد",
    `Aloe vera is relatively pest-resistant. Common pests: Mealybugs (wipe with alcohol-soaked cotton), scale insects (neem oil spray), aphids (soap water spray). Diseases: Root rot (Pythium/Phytophthora — caused by overwatering; repot in dry mix), Aloe rust (orange-brown spots — reduce humidity, improve air circulation). Avoid overhead watering and waterlogged conditions.`,
    `ایلو ویرا نسبتاً کیڑوں کے خلاف مزاحم ہے۔ عام کیڑے: میلی بگ (الکوحل سے بھیگی روئی سے پونچھیں)، اسکیل کیڑے (نیم تیل اسپرے)، تیلا (صابن کے پانی کا اسپرے)۔ بیماریاں: جڑوں کی سڑن (Pythium/Phytophthora — زیادہ پانی سے ہوتی ہے؛ خشک مکسچر میں دوبارہ لگائیں)، ایلو ویرا زنگ (نارنجی بھورے دھبے — نمی کم کریں، ہوا کی گردش بہتر بنائیں)۔ اوپر سے پانی دینے اور پانی بھری حالت سے گریز کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "aloevera", 12, "12. Deficiencies & Remedies", "١٢. تدارک",
    `Nitrogen deficiency: pale, yellowish leaves — apply diluted balanced liquid fertiliser. Iron/Magnesium deficiency: yellowing between leaf veins — rare but treat with diluted micronutrient solution. Sunlight deficiency: etiolated (stretched, pale) growth — move to brighter location. Overwatering (not a deficiency but common): brown, mushy base — reduce watering, repot in dry mix if needed.`,
    `نائٹروجن کی کمی: پیلے، ہلکے پتے — پتلا متوازن مائع کھاد لگائیں۔ آئرن/میگنیشیم کی کمی: پتوں کی رگوں کے درمیان پیلاپن — نادر لیکن پتلے مائیکرو نیوٹرینٹ محلول سے علاج کریں۔ سورج کی روشنی کی کمی: پتلی اور لمبی (پھیلی ہوئی، پیلی) نشوونما — روشن جگہ پر لے جائیں۔ زیادہ پانی دینا (کمی نہیں لیکن عام): بھورا، گیلا بنیادی حصہ — پانی کم کریں، ضرورت پر خشک مکسچر میں دوبارہ لگائیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "aloevera", 13, "13. Harvesting", "١٣. برداشت",
    `Harvest outer leaves once the plant is at least 3 years old and leaves are thick (8–10 cm wide at base). Cut leaves close to the stem using a clean, sharp knife. Do not harvest more than one-third of leaves at once to keep the plant healthy. The cut leaf can be stored in the refrigerator for 2–3 weeks. Harvest in the morning for freshest gel.`,
    `پودا کم از کم 3 سال کا ہونے اور پتے موٹے ہونے (بنیاد پر 8 سے 10 سینٹی میٹر چوڑے) کے بعد باہری پتے کاٹیں۔ صاف، تیز چاقو سے تنے کے قریب سے پتے کاٹیں۔ پودے کو صحت مند رکھنے کے لیے ایک وقت میں ایک تہائی سے زیادہ پتے نہ کاٹیں۔ کٹا ہوا پتہ 2 سے 3 ہفتے تک فریج میں رکھا جا سکتا ہے۔ سب سے تازہ جیل کے لیے صبح کے وقت کاٹیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "aloevera", 14, "14. Post Harvest / Storage", "١٤. ذخیرہ کاری",
    `Whole leaves: wrap in plastic and refrigerate for up to 3 weeks. Extracted gel: store in an airtight container in the refrigerator for 1 week, or freeze in ice cube trays for up to 6 months. Add a little Vitamin C (ascorbic acid) or Vitamin E to preserve gel colour and quality. Do not store at room temperature as the gel degrades quickly. For cosmetic use, use pure gel within 24 hours of extraction.`,
    `پورے پتے: پلاسٹک میں لپیٹ کر 3 ہفتوں تک فریج میں رکھیں۔ نکالی گئی جیل: فریج میں ایئر ٹائٹ کنٹینر میں 1 ہفتے تک رکھیں، یا آئس کیوب ٹریز میں 6 ماہ تک منجمد کریں۔ جیل کا رنگ اور معیار برقرار رکھنے کے لیے تھوڑا وٹامن C (ایسکوربک ایسڈ) یا وٹامن E ملائیں۔ کمرے کے درجہ حرارت پر ذخیرہ نہ کریں کیونکہ جیل جلدی خراب ہوتی ہے۔ کاسمیٹک استعمال کے لیے نکالنے کے 24 گھنٹوں کے اندر خالص جیل استعمال کریں۔`
  );

  // ── CARROT ───────────────────────────────────────────────────────────────
  await db.runAsync(`INSERT INTO plants (id, name_en, name_ur, type) VALUES (?, ?, ?, ?);`,
    "carrot", "Carrot", "گاجر", "home");

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "carrot", 1, "1. General Information", "١. عمومی معلومات",
    `Carrot (Daucus carota) is a popular root vegetable rich in beta-carotene (Vitamin A), fibre, and antioxidants. It is a cool-season crop widely grown in home gardens and commercially across Punjab and Sindh. Carrots are eaten raw, cooked, juiced, and in traditional halwa. Easy to grow in raised beds or deep containers, they mature in 70–80 days.`,
    `گاجر (Daucus carota) ایک مشہور جڑ کی سبزی ہے جو بیٹا کیروٹین (وٹامن A)، فائبر اور اینٹی آکسیڈینٹس سے بھرپور ہے۔ یہ ٹھنڈے موسم کی فصل ہے جو گھریلو باغیچوں اور پنجاب و سندھ میں تجارتی طور پر وسیع پیمانے پر اگائی جاتی ہے۔ گاجریں کچی، پکی، جوس اور روایتی حلوے میں کھائی جاتی ہیں۔ اونچے بستروں یا گہرے گملوں میں اگانا آسان ہے، یہ 70 سے 80 دنوں میں پک جاتی ہیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "carrot", 2, "2. Climate & Temperature", "٢. آب و ہوا اور درجہ حرارت",
    `Carrots grow best in cool weather. Optimal temperature: 15–22°C. Seeds germinate at 7–30°C but best between 18–24°C. Roots develop best flavour and colour in cool soil (10–18°C). High temperatures cause bitter, woody roots and poor colour. In Pakistan, grow carrots from September to February. Summer cultivation in hills (Murree, Swat) is possible.`,
    `گاجریں ٹھنڈے موسم میں بہترین اگتی ہیں۔ مثالی درجہ حرارت: 15 سے 22 ڈگری سینٹی گریڈ۔ بیج 7 سے 30 ڈگری پر اگتے ہیں لیکن 18 سے 24 ڈگری کے درمیان بہترین۔ جڑیں ٹھنڈی مٹی (10 سے 18 ڈگری) میں بہترین ذائقہ اور رنگ بناتی ہیں۔ زیادہ درجہ حرارت کڑوی، لکڑی جیسی جڑیں اور خراب رنگ پیدا کرتا ہے۔ پاکستان میں ستمبر سے فروری تک گاجریں اگائیں۔ پہاڑوں (مری، سوات) میں گرمیوں میں کاشت ممکن ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "carrot", 3, "3. Soil", "٣. موزوں زمین",
    `Deep, loose, well-drained sandy loam soil is ideal. Avoid stony, compacted, or clay soils — they cause forked, deformed roots. Soil depth of at least 30–40 cm is needed for good root development. Ideal pH: 6.0–7.0. Remove stones and break up clods thoroughly. Add compost (not fresh manure, which causes hairy roots) to improve soil structure.`,
    `گہری، ڈھیلی، اچھی نکاسی والی ریتلی دوہم مٹی مثالی ہے۔ پتھریلی، سخت یا چکنی مٹی سے گریز کریں — یہ کانٹے دار، بے شکل جڑیں پیدا کرتی ہے۔ اچھی جڑوں کی نشوونما کے لیے کم از کم 30 سے 40 سینٹی میٹر مٹی کی گہرائی درکار ہے۔ مثالی pH: 6.0 سے 7.0۔ پتھر ہٹائیں اور ڈھیلے اچھی طرح توڑیں۔ مٹی کی ساخت بہتر بنانے کے لیے کمپوسٹ ملائیں (تازہ گوبر نہیں جو بالوں والی جڑیں پیدا کرتی ہے)۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "carrot", 4, "4. Varieties", "٤. اقسام",
    `Popular varieties in Pakistan: Nantes (cylindrical, sweet, smooth — most common), Chantenay (short, stocky, good for heavy soils), Desi Red (local red variety), Imperator (long, for deep soils). Hybrid varieties include Typhoon, Bangor, and Nairobi. Choose Nantes types for home gardens. For red desi gajar (used in halwa): select local red varieties (Lahori Gajar).`,
    `پاکستان میں مشہور اقسام: Nantes (بیلناکار، میٹھی، ہموار — سب سے عام)، Chantenay (چھوٹی، موٹی، بھاری مٹی کے لیے اچھی)، دیسی ریڈ (مقامی سرخ قسم)، Imperator (لمبی، گہری مٹی کے لیے)۔ ہائبرڈ اقسام میں Typhoon، Bangor اور Nairobi شامل ہیں۔ گھریلو باغیچوں کے لیے Nantes اقسام منتخب کریں۔ سرخ دیسی گاجر (حلوے میں استعمال) کے لیے: مقامی سرخ اقسام (لاہوری گاجر) منتخب کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "carrot", 5, "5. Land Preparation", "٥. زمین کی تیاری",
    `Dig to 35–40 cm depth and break up all clods — deep, loose soil is essential. Remove all stones. Add well-rotted compost (5–7 kg per sq metre) but avoid fresh manure. For containers: use at least 30 cm deep pots with drainage holes, filled with sandy potting mix. Raise beds 15–20 cm for better drainage. Rake to a fine, smooth surface before sowing.`,
    `35 سے 40 سینٹی میٹر گہرائی تک کھودیں اور تمام ڈھیلے توڑیں — گہری، ڈھیلی مٹی ضروری ہے۔ تمام پتھر ہٹائیں۔ اچھی طرح گلی سڑی کمپوسٹ (5 سے 7 کلوگرام فی مربع میٹر) ملائیں لیکن تازہ گوبر سے گریز کریں۔ گملوں کے لیے: کم از کم 30 سینٹی میٹر گہرے گملے استعمال کریں جن میں نکاسی کے سوراخ ہوں، ریتلے پوٹنگ مکسچر سے بھرے ہوں۔ بہتر نکاسی کے لیے بستر 15 سے 20 سینٹی میٹر اونچے کریں۔ بوائی سے پہلے باریک، ہموار سطح بنائیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "carrot", 6, "6. Sowing / Planting", "٦. طریقہ کاشت",
    `Sow seeds directly (carrots do not transplant well due to sensitive taproot). Sowing depth: 0.5–1 cm. Row spacing: 20–25 cm. Thin seedlings to 5–8 cm apart when 4–5 cm tall. Thin in stages to avoid disturbing remaining plants. Best sowing time in Pakistan: September–November. Keep soil moist until germination (10–14 days). Mixing seed with dry sand helps even distribution.`,
    `بیج براہ راست بوئیں (گاجریں حساس مرکزی جڑ کی وجہ سے اچھی طرح منتقل نہیں ہوتیں)۔ بوائی کی گہرائی: 0.5 سے 1 سینٹی میٹر۔ قطاروں کا فاصلہ: 20 سے 25 سینٹی میٹر۔ جب 4 سے 5 سینٹی میٹر لمبے ہوں تو پودوں کو 5 سے 8 سینٹی میٹر فاصلے پر پتلا کریں۔ بقیہ پودوں کو پریشان کرنے سے بچنے کے لیے مرحلہ وار پتلا کریں۔ پاکستان میں بہترین بوائی کا وقت: ستمبر تا نومبر۔ انکرنے تک (10 سے 14 دن) مٹی کو نم رکھیں۔ بیج کو خشک ریت کے ساتھ ملانا یکساں تقسیم میں مدد دیتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "carrot", 7, "7. Seed / Propagation", "٧. شرح بیج",
    `Seed rate: 1.5–2 kg/acre or 3–4 g per square metre for home gardens. Carrot seed is small and slow to germinate (10–14 days). Mix with dry sand (1:4 ratio) for even sowing. Keep seeds moist during germination — drying out causes uneven germination. Use fresh seed each season; carrot seed loses viability quickly (1–2 years).`,
    `شرح بیج: 1.5 سے 2 کلوگرام فی ایکڑ یا گھریلو باغیچوں کے لیے 3 سے 4 گرام فی مربع میٹر۔ گاجر کا بیج چھوٹا ہوتا ہے اور انکرنے میں دیر لگتی ہے (10 سے 14 دن)۔ یکساں بوائی کے لیے خشک ریت کے ساتھ ملائیں (1:4 تناسب)۔ انکرنے کے دوران بیج کو نم رکھیں — خشک ہونے سے غیر یکساں انکرنا ہوتا ہے۔ ہر موسم میں تازہ بیج استعمال کریں؛ گاجر کا بیج جلدی صلاحیت کھو دیتا ہے (1 سے 2 سال)۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "carrot", 8, "8. Fertiliser", "٨. کھادوں کا استعمال",
    `Apply well-rotted compost before sowing. Phosphorus and potassium are important for root development: apply DAP 30 kg/acre + SOP 15 kg/acre at sowing. Avoid excess nitrogen which causes excessive leaf growth and hairy, forked roots. A light Urea top dressing (10 kg/acre) at 4 weeks is sufficient. For home pots, use balanced liquid fertiliser monthly at half strength.`,
    `بوائی سے پہلے اچھی طرح گلی سڑی کمپوسٹ ڈالیں۔ جڑوں کی نشوونما کے لیے فاسفورس اور پوٹاشیم اہم ہیں: بوائی کے وقت DAP 30 کلوگرام فی ایکڑ + SOP 15 کلوگرام فی ایکڑ ڈالیں۔ زیادہ نائٹروجن سے گریز کریں جو بہت زیادہ پتوں کی نشوونما اور بالوں والی، کانٹے دار جڑیں پیدا کرتی ہے۔ 4 ہفتوں میں ہلکی یوریا ٹاپ ڈریسنگ (10 کلوگرام فی ایکڑ) کافی ہے۔ گھر کے گملوں کے لیے ماہانہ آدھی مقدار میں متوازن مائع کھاد استعمال کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "carrot", 9, "9. Weed Control", "٩. جڑی بوٹیوں کا انسداد",
    `Weed control is critical in the first 6 weeks as carrots are slow-growing and easily outcompeted. Hand-weed carefully to avoid disturbing young carrot seedlings. Shallow hoeing between rows. Mulching with straw or dry leaves helps suppress weeds and maintain soil moisture. Avoid deep cultivation near plants. Chemical weedkillers should be avoided in home gardens.`,
    `پہلے 6 ہفتوں میں جڑی بوٹی کنٹرول بہت ضروری ہے کیونکہ گاجریں آہستہ اگتی ہیں اور آسانی سے دب جاتی ہیں۔ نوجوان گاجر کے پودوں کو پریشان کرنے سے بچتے ہوئے احتیاط سے ہاتھ سے گوڈی کریں۔ قطاروں کے درمیان اتھلی کدال چلائیں۔ پھوس یا خشک پتوں سے ملچنگ جڑی بوٹیوں کو دبانے اور مٹی کی نمی برقرار رکھنے میں مدد دیتی ہے۔ پودوں کے قریب گہری کاشت کاری سے گریز کریں۔ گھریلو باغیچوں میں کیمیائی جڑی بوٹی مار دوائیں استعمال نہ کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "carrot", 10, "10. Irrigation", "١٠. آبپاشی",
    `Keep soil consistently moist but not waterlogged. Water every 3–5 days (more often in dry/hot conditions). Inconsistent watering causes cracking, splitting, and bitter taste. After thinning, water more deeply (7–10 cm) to encourage deep root growth. Reduce watering slightly 2 weeks before harvest. Drip or sprinkler irrigation preferred over flood to avoid washing out small seeds.`,
    `مٹی کو مسلسل نم لیکن پانی بھرا نہ رکھیں۔ ہر 3 سے 5 دن میں پانی دیں (خشک/گرم حالات میں زیادہ بار)۔ متضاد آبپاشی پھٹنے، چھلنے اور کڑوے ذائقے کا سبب بنتی ہے۔ پتلا کرنے کے بعد، گہری جڑوں کی نشوونما کی حوصلہ افزائی کے لیے زیادہ گہرا (7 سے 10 سینٹی میٹر) پانی دیں۔ کٹائی سے 2 ہفتے پہلے پانی کچھ کم کریں۔ چھوٹے بیج بہنے سے بچانے کے لیے سیلابی آبپاشی کی بجائے ڈرپ یا اسپرنکلر آبپاشی ترجیح دی جاتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "carrot", 11, "11. Pest & Disease Management", "١١. بیماریوں اور کیڑوں کا انسداد",
    `Pests: Carrot fly (larvae tunnel into roots — use fine mesh cover), aphids (soap water spray), wireworms. Diseases: Alternaria leaf blight (Mancozeb spray), Damping off (Thiram seed treatment), Cavity spot (calcium deficiency — apply Calcium Nitrate). Powdery mildew on leaves (Sulphur dust). Root-knot nematodes (use clean soil or solarise). Crop rotation helps prevent most soil-borne problems.`,
    `کیڑے: گاجر کی مکھی (لاروا جڑوں میں سوراخ کرتا ہے — باریک جالی ڈھانپ استعمال کریں)، تیلا (صابن کے پانی کا اسپرے)، تاریں کیڑے۔ بیماریاں: Alternaria پتوں کی جھلسن (Mancozeb اسپرے)، ڈیمپنگ آف (تھائرم سے بیج کا علاج)، گہا کا دھبہ (کیلشیم کی کمی — Calcium Nitrate ڈالیں)۔ پتوں پر پاؤڈری ملڈیو (گندھک کا سفوف)۔ جڑوں میں گرہیں بنانے والے نیماٹوڈ (صاف مٹی یا سولرائزیشن استعمال کریں)۔ فصل ردوبدل زیادہ تر مٹی سے پھیلنے والے مسائل کو روکنے میں مدد دیتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "carrot", 12, "12. Deficiencies & Remedies", "١٢. تدارک",
    `Potassium: poor root development, cracking — apply SOP. Calcium: cavity spot (hollow, dark spots in root) — apply Calcium Nitrate. Phosphorus: slow growth, thin roots, purple tinge — apply DAP. Boron: cracked, brittle roots, stunted tops — spray Borax 0.1%. Nitrogen: pale foliage, slow growth — apply diluted Urea. Magnesium: leaf yellowing — spray Epsom salt 1%.`,
    `پوٹاشیم: جڑوں کی کمزور نشوونما، پھٹنا — SOP ڈالیں۔ کیلشیم: گہا کا دھبہ (جڑ میں کھوکھلے، سیاہ دھبے) — Calcium Nitrate ڈالیں۔ فاسفورس: سست نشوونما، پتلی جڑیں، جامنی رنگ — DAP ڈالیں۔ بوران: پھٹی ہوئی، ٹوٹنے والی جڑیں، رکی ہوئی چوٹی — Borax 0.1 فیصد اسپرے کریں۔ نائٹروجن: پیلے پتے، سست نشوونما — پتلی یوریا ڈالیں۔ میگنیشیم: پتوں کا پیلا پڑنا — Epsom salt 1 فیصد اسپرے کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "carrot", 13, "13. Harvesting", "١٣. برداشت",
    `Harvest at 70–80 days when roots are 1.5–2 cm in diameter (Nantes) or as large as desired. Do not leave in ground too long as roots become woody and bitter. Harvest by loosening soil first with a fork, then pulling by the tops. Water the soil the day before to make harvesting easier. Expected yield: 100–120 mounds/acre. Home garden: 1–2 kg per sq metre.`,
    `جب جڑیں 1.5 سے 2 سینٹی میٹر قطر کی ہوں (Nantes) یا مطلوبہ سائز کی ہوں تو 70 سے 80 دنوں میں کاٹیں۔ زمین میں زیادہ دیر نہ چھوڑیں کیونکہ جڑیں لکڑی جیسی اور کڑوی ہو جاتی ہیں۔ پہلے کانٹے سے مٹی ڈھیلی کریں، پھر اوپری حصے سے کھینچ کر نکالیں۔ کٹائی آسان بنانے کے لیے ایک دن پہلے مٹی کو پانی دیں۔ متوقع پیداوار: 100 سے 120 من فی ایکڑ۔ گھریلو باغیچہ: 1 سے 2 کلوگرام فی مربع میٹر۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "carrot", 14, "14. Post Harvest / Storage", "١٤. ذخیرہ کاری",
    `Remove tops (leaves) immediately after harvest to prevent moisture loss from roots. Store unwashed carrots in a cool, humid place (0–4°C, 90–95% RH) for up to 4–6 months. In home fridges: store in perforated plastic bags in the vegetable crisper. Carrots can be blanched and frozen for 12 months. Do not store near apples or pears (ethylene gas causes bitterness).`,
    `جڑوں سے نمی کی کمی کو روکنے کے لیے کٹائی کے فوراً بعد اوپری حصے (پتے) ہٹا دیں۔ بغیر دھوئی ہوئی گاجریں ٹھنڈی، نم جگہ (0 سے 4 ڈگری، 90 سے 95 فیصد نسبتی نمی) میں 4 سے 6 ماہ تک ذخیرہ کریں۔ گھر کے فریج میں: سبزیوں کے خانے میں سوراخ دار پلاسٹک بیگ میں رکھیں۔ گاجریں بلانچ کرکے 12 ماہ تک منجمد کی جا سکتی ہیں۔ سیب یا ناشپاتی کے قریب ذخیرہ نہ کریں (ایتھیلین گیس کڑواہٹ پیدا کرتی ہے)۔`
  );

  // ── GINGER ───────────────────────────────────────────────────────────────
  await db.runAsync(`INSERT INTO plants (id, name_en, name_ur, type) VALUES (?, ?, ?, ?);`,
    "ginger", "Ginger", "ادرک", "home");

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "ginger", 1, "1. General Information", "١. عمومی معلومات",
    `Ginger (Zingiber officinale) is a tropical spice crop grown for its aromatic rhizome used in cooking, teas, and traditional medicine. It is widely used in Pakistani cuisine and as a remedy for colds, nausea, and digestive issues. In Pakistan, ginger is mainly grown in KPK (Swat, Malakand) and some parts of Punjab. It can also be grown at home in pots in warm, sheltered locations.`,
    `ادرک (Zingiber officinale) ایک اشنکٹبندیی مصالحہ فصل ہے جو اپنے خوشبودار ریزوم کے لیے اگائی جاتی ہے جو کھانا پکانے، چائے اور روایتی دواؤں میں استعمال ہوتا ہے۔ یہ پاکستانی کھانوں میں وسیع پیمانے پر اور سردی، متلی اور ہاضمے کی شکایات کے علاج کے طور پر استعمال ہوتی ہے۔ پاکستان میں ادرک بنیادی طور پر خیبر پختونخوا (سوات، ملاکنڈ) اور پنجاب کے بعض حصوں میں اگائی جاتی ہے۔ اسے گرم، محفوظ جگہوں میں گملوں میں گھر پر بھی اگایا جا سکتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "ginger", 2, "2. Climate & Temperature", "٢. آب و ہوا اور درجہ حرارت",
    `Ginger is a warm-season crop. Optimal temperature: 22–28°C. It needs a warm, humid growing period followed by a dry spell for rhizome curing. It does not tolerate frost or temperatures below 10°C. High rainfall (1500–2500 mm) or regular irrigation is needed. In Pakistan's plains, grow from February to November. In KPK hills, the cooler climate allows better quality ginger.`,
    `ادرک گرم موسم کی فصل ہے۔ مثالی درجہ حرارت: 22 سے 28 ڈگری سینٹی گریڈ۔ اسے گرم، مرطوب نشوونما کا دور اور پھر ریزوم کیورنگ کے لیے خشک موسم درکار ہے۔ یہ پالہ یا 10 ڈگری سے کم درجہ حرارت برداشت نہیں کرتی۔ زیادہ بارش (1500 سے 2500 ملی میٹر) یا باقاعدہ آبپاشی درکار ہے۔ پاکستان کے میدانوں میں فروری سے نومبر تک اگائیں۔ خیبر پختونخوا کے پہاڑوں میں ٹھنڈا موسم بہتر معیار کی ادرک کی اجازت دیتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "ginger", 3, "3. Soil", "٣. موزوں زمین",
    `Well-drained, loamy, slightly acidic soil rich in organic matter with pH 5.5–6.5 is ideal. Ginger cannot tolerate waterlogged conditions — rhizomes rot quickly in wet soil. Sandy loam with added compost works well. In pots: use a loose, well-draining mix (40% compost, 40% soil, 20% perlite). Avoid heavy clay. Soil should be rich in organic matter for best rhizome development.`,
    `اچھی نکاسی والی، دوہم، نامیاتی مادے سے بھرپور تھوڑی تیزابی مٹی جس کا pH 5.5 سے 6.5 ہو مثالی ہے۔ ادرک پانی بھری حالت برداشت نہیں کرتی — ریزوم گیلی مٹی میں جلدی سڑ جاتے ہیں۔ اضافی کمپوسٹ کے ساتھ ریتلی دوہم اچھا کام کرتی ہے۔ گملوں میں: ڈھیلا، اچھی نکاسی والا مکسچر استعمال کریں (40 فیصد کمپوسٹ، 40 فیصد مٹی، 20 فیصد پرلائٹ)۔ بھاری چکنی مٹی سے گریز کریں۔ بہترین ریزوم نشوونما کے لیے مٹی نامیاتی مادے سے بھرپور ہونی چاہیے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "ginger", 4, "4. Varieties", "٤. اقسام",
    `In Pakistan, local varieties (Desi Adrak) are most common. Improved varieties include Mahim, Varada, and Rio-de-Janeiro (commonly used in South Asia). For home growing, obtain fresh, plump, firm ginger rhizomes from a reliable source. Market-bought ginger can be used for planting if it has live buds (eyes). Chinese imported ginger is often treated to inhibit sprouting and may not grow well.`,
    `پاکستان میں مقامی اقسام (دیسی ادرک) سب سے عام ہیں۔ بہتر اقسام میں Mahim، Varada اور Rio-de-Janeiro (جنوبی ایشیا میں عام طور پر استعمال) شامل ہیں۔ گھر میں اگانے کے لیے قابل اعتماد ذریعے سے تازہ، بھرے، مضبوط ادرک کے ریزوم حاصل کریں۔ اگر اس میں زندہ آنکھیں (آنکھیں) ہوں تو بازار سے خریدی ہوئی ادرک لگانے کے لیے استعمال کی جا سکتی ہے۔ چینی درآمد شدہ ادرک اکثر اگنے سے روکنے کے لیے ٹریٹ کی جاتی ہے اور اچھی طرح نہیں اگ سکتی۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "ginger", 5, "5. Land Preparation", "٥. زمین کی تیاری",
    `Dig to 30 cm depth. Mix in generous amounts of compost or well-rotted FYM (10–15 tonnes/acre). Ginger thrives with high organic matter. Make raised beds or ridges (20–25 cm high) to ensure excellent drainage. For pots: use deep pots (30+ cm), fill with a rich, free-draining mix. Avoid compacted soil — roots need room to expand horizontally. Add mulch on top after planting.`,
    `30 سینٹی میٹر گہرائی تک کھودیں۔ وافر مقدار میں کمپوسٹ یا اچھی طرح گلی سڑی گوبر کھاد (10 سے 15 ٹن فی ایکڑ) ملائیں۔ ادرک زیادہ نامیاتی مادے سے خوب پھلتی پھولتی ہے۔ بہترین نکاسی کو یقینی بنانے کے لیے اونچے بستر یا ڈولے (20 سے 25 سینٹی میٹر اونچے) بنائیں۔ گملوں کے لیے: گہرے گملے (30+ سینٹی میٹر) استعمال کریں، بھرپور، آزادانہ نکاسی والے مکسچر سے بھریں۔ سخت مٹی سے گریز کریں — جڑوں کو افقی طور پر پھیلنے کی جگہ چاہیے۔ لگانے کے بعد اوپر ملچ ڈالیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "ginger", 6, "6. Sowing / Planting", "٦. طریقہ کاشت",
    `Plant rhizome pieces (seed pieces) with 1–2 live buds. Cut pieces 3–5 cm long, let dry for 1–2 days before planting. Plant 5–7 cm deep with buds facing up. Spacing: 20–25 cm between plants, 30–40 cm between rows. Best planting time: February–April (spring). Partial shade (30–40%) improves quality. Mulch immediately after planting to retain moisture and regulate soil temperature.`,
    `ریزوم کے ٹکڑے (بیج کے ٹکڑے) جن میں 1 سے 2 زندہ آنکھیں ہوں لگائیں۔ 3 سے 5 سینٹی میٹر لمبے ٹکڑے کاٹیں، لگانے سے پہلے 1 سے 2 دن خشک ہونے دیں۔ 5 سے 7 سینٹی میٹر گہرا، آنکھیں اوپر رکھ کر لگائیں۔ فاصلہ: پودوں کے درمیان 20 سے 25 سینٹی میٹر، قطاروں کے درمیان 30 سے 40 سینٹی میٹر۔ بہترین کاشت کا وقت: فروری تا اپریل (بہار)۔ جزوی سایہ (30 سے 40 فیصد) معیار بہتر بناتا ہے۔ نمی برقرار رکھنے اور مٹی کا درجہ حرارت منظم کرنے کے لیے لگانے کے فوراً بعد ملچ کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "ginger", 7, "7. Seed / Propagation", "٧. شرح بیج",
    `Seed rate: 500–700 kg of seed rhizomes per acre. For home pots, 2–3 rhizome pieces per large pot. Treat seed rhizomes with Mancozeb or Thiram solution (3 g/L) for 30 minutes before planting to prevent fungal diseases. Use certified, disease-free seed rhizomes from reputable suppliers. Store seed rhizomes in cool, dry, shaded conditions before planting.`,
    `شرح بیج: 500 سے 700 کلوگرام بیج ریزوم فی ایکڑ۔ گھر کے گملوں کے لیے بڑے گملے میں 2 سے 3 ریزوم ٹکڑے۔ پھپھوندی کی بیماریوں سے بچنے کے لیے لگانے سے پہلے 30 منٹ Mancozeb یا Thiram محلول (3 گرام فی لیٹر) میں بیج ریزوم ڈبوئیں۔ قابل اعتماد فراہم کنندگان سے تصدیق شدہ، بیماری سے پاک بیج ریزوم استعمال کریں۔ لگانے سے پہلے ٹھنڈی، خشک، سایہ دار جگہ میں بیج ریزوم ذخیرہ کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "ginger", 8, "8. Fertiliser", "٨. کھادوں کا استعمال",
    `Apply compost or FYM 10 tonnes/acre at planting. Chemical fertiliser: DAP 50 kg/acre + SOP 25 kg/acre basally. Urea top dressing: 25 kg/acre at 2 months, repeat at 4 months. Potassium is very important for rhizome filling. Boron spray (Borax 0.1%) at 60 and 120 days improves rhizome quality. For pots: use balanced liquid fertiliser (NPK 10-10-10) monthly during growing season.`,
    `کاشت کے وقت 10 ٹن فی ایکڑ کمپوسٹ یا گوبر کھاد ڈالیں۔ کیمیائی کھاد: DAP 50 کلوگرام فی ایکڑ + SOP 25 کلوگرام فی ایکڑ بنیادی طور پر۔ یوریا ٹاپ ڈریسنگ: 2 ماہ میں 25 کلوگرام فی ایکڑ، 4 ماہ میں دہرائیں۔ ریزوم بھرنے کے لیے پوٹاشیم بہت اہم ہے۔ 60 اور 120 دن پر بوران اسپرے (Borax 0.1 فیصد) ریزوم کا معیار بہتر بناتی ہے۔ گملوں کے لیے: اگنے کے موسم میں ماہانہ متوازن مائع کھاد (NPK 10-10-10) استعمال کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "ginger", 9, "9. Weed Control", "٩. جڑی بوٹیوں کا انسداد",
    `Mulching (with straw, dry leaves, or rice husk) is the best method — apply 5–8 cm thick layer immediately after planting. This suppresses weeds, retains moisture, and regulates soil temperature. Hand-weed in early stages before mulch is established. Avoid deep hoeing near plants as ginger rhizomes spread shallowly. Chemical herbicides are not recommended for home gardens.`,
    `ملچنگ (پھوس، خشک پتوں یا چاول کی بھوسی سے) بہترین طریقہ ہے — لگانے کے فوراً بعد 5 سے 8 سینٹی میٹر موٹی تہہ لگائیں۔ یہ جڑی بوٹیوں کو دباتی، نمی برقرار رکھتی اور مٹی کا درجہ حرارت منظم کرتی ہے۔ ملچ قائم ہونے سے پہلے ابتدائی مراحل میں ہاتھ سے گوڈی کریں۔ پودوں کے قریب گہری کدال سے گریز کریں کیونکہ ادرک کے ریزوم اتھلے پھیلتے ہیں۔ گھریلو باغیچوں کے لیے کیمیائی جڑی بوٹی مار دوائیں تجویز نہیں کی جاتیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "ginger", 10, "10. Irrigation", "١٠. آبپاشی",
    `Keep soil moist throughout the growing season but never waterlogged. Water every 3–5 days in summer, less in cooler months. Critical moisture periods: after planting (for sprouting), during peak growth (June–August). Reduce watering significantly as leaves yellow in October (maturity signal). Stop watering 3–4 weeks before harvest to allow rhizomes to firm up. Drip irrigation is ideal.`,
    `اگنے کے پورے موسم میں مٹی کو نم رکھیں لیکن کبھی پانی بھری نہ ہونے دیں۔ گرمیوں میں ہر 3 سے 5 دن میں پانی دیں، ٹھنڈے مہینوں میں کم۔ اہم نمی کے ادوار: لگانے کے بعد (اگنے کے لیے)، عروج کی نشوونما کے دوران (جون تا اگست)۔ اکتوبر میں پتے پیلے ہونے پر (پکنے کی علامت) پانی نمایاں طور پر کم کریں۔ ریزوم کو مضبوط کرنے کے لیے کٹائی سے 3 سے 4 ہفتے پہلے پانی بند کریں۔ ڈرپ آبپاشی مثالی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "ginger", 11, "11. Pest & Disease Management", "١١. بیماریوں اور کیڑوں کا انسداد",
    `Diseases: Soft rot / Pythium (rhizome rot from waterlogging — use raised beds, well-drained soil, Metalaxyl drench), Bacterial wilt (wilting, yellowing — no cure; remove and destroy affected plants, use clean seed), Fusarium yellows (yellowing, root rot — Carbendazim drench). Pests: Shoot borer (spray Chlorpyrifos), Rhizome scale (Quinalphos soil drench), Root-knot nematodes (soil solarisation).`,
    `بیماریاں: نرم سڑن / Pythium (پانی جمع ہونے سے ریزوم سڑنا — اونچے بستر، اچھی نکاسی والی مٹی، Metalaxyl ڈرینچ استعمال کریں)، بیکٹیریل مرجھاؤ (مرجھانا، پیلا پڑنا — کوئی علاج نہیں؛ متاثرہ پودے ہٹائیں اور تلف کریں، صاف بیج استعمال کریں)، Fusarium پیلاپن (پیلا پڑنا، جڑوں کی سڑن — Carbendazim ڈرینچ)۔ کیڑے: شوٹ بور (Chlorpyrifos اسپرے)، ریزوم اسکیل (Quinalphos مٹی ڈرینچ)، جڑوں میں گرہیں بنانے والے نیماٹوڈ (مٹی سولرائزیشن)۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "ginger", 12, "12. Deficiencies & Remedies", "١٢. تدارک",
    `Nitrogen: pale leaves, slow growth — apply Urea top dress or foliar spray 2%. Potassium: leaf edge browning, small rhizomes — apply SOP 25 kg/acre. Zinc: stunted growth, striped leaves — spray Zinc Sulphate 0.5%. Magnesium: interveinal chlorosis — spray Epsom salt 1%. Boron: distorted new growth, cracked rhizomes — spray Borax 0.1%. Iron: young leaves pale yellow — spray Ferrous Sulphate 0.3%.`,
    `نائٹروجن: پیلے پتے، سست نشوونما — یوریا ٹاپ ڈریس یا پتوں پر 2 فیصد اسپرے۔ پوٹاشیم: پتوں کے کنارے بھورے، چھوٹے ریزوم — SOP 25 کلوگرام فی ایکڑ۔ زنک: نشوونما رکنا، دھاری دار پتے — زنک سلفیٹ 0.5 فیصد اسپرے۔ میگنیشیم: رگوں کے درمیان پیلاپن — Epsom salt 1 فیصد اسپرے۔ بوران: بگڑی نئی نشوونما، پھٹے ریزوم — Borax 0.1 فیصد اسپرے۔ آئرن: نوجوان پتے ہلکے پیلے — فیرس سلفیٹ 0.3 فیصد اسپرے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "ginger", 13, "13. Harvesting", "١٣. برداشت",
    `For fresh (green) ginger: harvest at 5–6 months (July–August) when rhizomes are tender and mild. For mature (dry) ginger: harvest at 8–10 months (October–November) when leaves turn yellow and dry. Dig carefully with a fork to lift entire clumps. Shake off soil gently. Yield: 100–150 mounds/acre (fresh), 40–60 mounds/acre (dry). Home pots yield 200–400 g per large pot.`,
    `تازہ (سبز) ادرک کے لیے: 5 سے 6 ماہ (جولائی تا اگست) میں کاٹیں جب ریزوم نرم اور ہلکے ذائقے کے ہوں۔ پختہ (خشک) ادرک کے لیے: 8 سے 10 ماہ (اکتوبر تا نومبر) میں کاٹیں جب پتے پیلے اور خشک ہو جائیں۔ پورے گچھے اٹھانے کے لیے کانٹے سے احتیاط سے کھودیں۔ مٹی آہستہ سے جھاڑیں۔ پیداوار: 100 سے 150 من فی ایکڑ (تازہ)، 40 سے 60 من فی ایکڑ (خشک)۔ گھر کے گملے فی بڑے گملے 200 سے 400 گرام پیداوار دیتے ہیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "ginger", 14, "14. Post Harvest / Storage", "١٤. ذخیرہ کاری",
    `Fresh ginger: store at 12–14°C, 65% RH for up to 3 months. Do not refrigerate below 10°C. In the fridge: store unpeeled in a zip-lock bag for 3–5 weeks. Freezing: freeze whole pieces; grate directly from frozen. Dry ginger: wash, peel, slice, and dry in sun or oven (55°C) until bone dry. Dried ginger can be stored for 6–12 months in airtight containers. Ginger can also be pickled or made into paste for long-term storage.`,
    `تازہ ادرک: 3 ماہ تک 12 سے 14 ڈگری سینٹی گریڈ، 65 فیصد نسبتی نمی پر ذخیرہ کریں۔ 10 ڈگری سے نیچے فریج میں نہ رکھیں۔ فریج میں: 3 سے 5 ہفتوں کے لیے زپ لاک بیگ میں بغیر چھیلے رکھیں۔ منجمد کرنا: پورے ٹکڑے منجمد کریں؛ منجمد سے براہ راست کدوکش کریں۔ خشک ادرک: دھوئیں، چھیلیں، کاٹیں اور دھوپ یا اوون میں (55 ڈگری) خشک کریں جب تک بالکل خشک نہ ہو جائے۔ خشک ادرک ایئر ٹائٹ کنٹینرز میں 6 سے 12 ماہ تک ذخیرہ کی جا سکتی ہے۔ ادرک کو طویل مدتی ذخیرہ کے لیے اچار یا پیسٹ بھی بنایا جا سکتا ہے۔`
  );

  // ── LETTUCE ──────────────────────────────────────────────────────────────
  await db.runAsync(`INSERT INTO plants (id, name_en, name_ur, type) VALUES (?, ?, ?, ?);`,
    "lettuce", "Lettuce", "سلاد پتی", "home");

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "lettuce", 1, "1. General Information", "١. عمومی معلومات",
    `Lettuce (Lactuca sativa) is a cool-season leafy vegetable popular in salads and sandwiches. It is one of the easiest vegetables to grow at home — in pots, raised beds, or on windowsills. Lettuce matures quickly (40–60 days), making it ideal for home gardens and indoor growing. In Pakistan it is grown in winter (October–February) and is widely used in fast food, salads, and burgers.`,
    `سلاد پتی (Lactuca sativa) ایک ٹھنڈے موسم کی پتی دار سبزی ہے جو سلاد اور سینڈوچ میں مشہور ہے۔ یہ گھر پر اگانے کے لیے سب سے آسان سبزیوں میں سے ایک ہے — گملوں، اونچے بستروں یا کھڑکیوں میں۔ سلاد پتی جلدی پک جاتی ہے (40 سے 60 دن)، جو اسے گھریلو باغیچوں اور گھر کے اندر اگانے کے لیے مثالی بناتی ہے۔ پاکستان میں یہ سردیوں (اکتوبر تا فروری) میں اگائی جاتی ہے اور فاسٹ فوڈ، سلاد اور برگر میں وسیع پیمانے پر استعمال ہوتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "lettuce", 2, "2. Climate & Temperature", "٢. آب و ہوا اور درجہ حرارت",
    `Lettuce is a cool-season crop. Optimal temperature: 15–20°C. Germination occurs at 4–27°C. High temperatures above 25°C cause bolting (premature flowering and bitterness). Provide partial shade in warmer months to extend the growing season. In Pakistan's plains, grow from October to February. In hills, it can be grown year-round. Frost-tolerant varieties exist but most prefer mild cool weather.`,
    `سلاد پتی ٹھنڈے موسم کی فصل ہے۔ مثالی درجہ حرارت: 15 سے 20 ڈگری سینٹی گریڈ۔ انکرنا 4 سے 27 ڈگری پر ہوتا ہے۔ 25 ڈگری سے زیادہ زیادہ درجہ حرارت bolting (قبل از وقت پھول آنا اور کڑواہٹ) کا سبب بنتا ہے۔ اگنے کا موسم بڑھانے کے لیے گرم مہینوں میں جزوی سایہ فراہم کریں۔ پاکستان کے میدانوں میں اکتوبر سے فروری تک اگائیں۔ پہاڑوں میں سال بھر اگائی جا سکتی ہے۔ پالہ برداشت کرنے والی اقسام موجود ہیں لیکن زیادہ تر ہلکے ٹھنڈے موسم کو ترجیح دیتی ہیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "lettuce", 3, "3. Soil", "٣. موزوں زمین",
    `Lettuce prefers well-drained, moist, loamy soil rich in organic matter. pH 6.0–7.0 is ideal. Sandy loam works well with added compost. It has shallow roots so soil does not need to be very deep (15–20 cm is sufficient). In pots: a standard potting mix with added perlite works well. Avoid waterlogged or compacted soil. Good drainage is essential.`,
    `سلاد پتی نامیاتی مادے سے بھرپور اچھی نکاسی والی، نم، دوہم مٹی کو ترجیح دیتی ہے۔ pH 6.0 سے 7.0 مثالی ہے۔ اضافی کمپوسٹ کے ساتھ ریتلی دوہم اچھا کام کرتی ہے۔ اس کی اتھلی جڑیں ہیں اس لیے مٹی بہت گہری نہیں چاہیے (15 سے 20 سینٹی میٹر کافی ہے)۔ گملوں میں: اضافی پرلائٹ کے ساتھ معیاری پوٹنگ مکسچر اچھا کام کرتا ہے۔ پانی بھری یا سخت مٹی سے گریز کریں۔ اچھی نکاسی ضروری ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "lettuce", 4, "4. Varieties", "٤. اقسام",
    `Main types: Loose-leaf (easy, non-heading — Green Oak Leaf, Red Oak Leaf, Lollo Rosso), Butterhead/Boston (soft, buttery leaves — Buttercrunch), Cos/Romaine (upright, crunchy — excellent for Pakistani climate), Iceberg (crisp heading type). For home growing in Pakistan, Romaine and loose-leaf types are recommended as they tolerate heat better and do not require perfect heading conditions.`,
    `اہم اقسام: کھلی پتی (آسان، بغیر گول سر — گرین اوک لیف، ریڈ اوک لیف، لولو روسو)، بٹر ہیڈ/بوسٹن (نرم، مکھنی پتے — بٹرکرنچ)، Cos/Romaine (سیدھی، کرکری — پاکستانی آب و ہوا کے لیے بہترین)، آئس برگ (کرکری گول سر والی)۔ پاکستان میں گھر پر اگانے کے لیے Romaine اور کھلی پتی والی اقسام تجویز کی جاتی ہیں کیونکہ یہ گرمی بہتر برداشت کرتی ہیں اور بالکل صحیح گول سر کی حالت کی ضرورت نہیں ہوتی۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "lettuce", 5, "5. Land Preparation", "٥. زمین کی تیاری",
    `Shallow preparation is sufficient (15–20 cm). Loosen soil and add compost (3–5 kg per sq metre). Rake to a fine, smooth surface. Raised beds or containers 15–20 cm deep are ideal. For pots: use fresh potting mix each season. Level carefully as seeds are tiny and require a smooth, even surface for good germination. Pre-water bed before sowing to avoid washing tiny seeds.`,
    `اتھلی تیاری کافی ہے (15 سے 20 سینٹی میٹر)۔ مٹی ڈھیلی کریں اور کمپوسٹ ملائیں (3 سے 5 کلوگرام فی مربع میٹر)۔ باریک، ہموار سطح بنائیں۔ 15 سے 20 سینٹی میٹر گہرے اونچے بستر یا گملے مثالی ہیں۔ گملوں کے لیے: ہر موسم میں تازہ پوٹنگ مکسچر استعمال کریں۔ احتیاط سے برابر کریں کیونکہ بیج بہت چھوٹے ہوتے ہیں اور اچھے انکرنے کے لیے ہموار، برابر سطح چاہیے۔ چھوٹے بیج بہنے سے بچنے کے لیے بوائی سے پہلے بستر کو پانی دیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "lettuce", 6, "6. Sowing / Planting", "٦. طریقہ کاشت",
    `Direct sow or start in seedling trays and transplant at 3–4 weeks. Sow seeds on the soil surface or just 0.3–0.5 cm deep (light aids germination). Thin or transplant to 20–25 cm apart. Row spacing: 25–30 cm. Best sowing time in Pakistan: September–November. For succession planting, sow every 2–3 weeks for continuous harvest. For indoor growing, any time of year near a bright window.`,
    `براہ راست بوائی کریں یا پودے کی ٹرے میں شروع کریں اور 3 سے 4 ہفتوں میں منتقل کریں۔ بیج مٹی کی سطح پر یا صرف 0.3 سے 0.5 سینٹی میٹر گہرے بوئیں (روشنی انکرنے میں مدد دیتی ہے)۔ 20 سے 25 سینٹی میٹر فاصلے پر پتلا کریں یا منتقل کریں۔ قطاروں کا فاصلہ: 25 سے 30 سینٹی میٹر۔ پاکستان میں بہترین بوائی کا وقت: ستمبر تا نومبر۔ مسلسل کٹائی کے لیے ہر 2 سے 3 ہفتوں میں بوائی کریں۔ گھر کے اندر اگانے کے لیے سال کے کسی بھی وقت روشن کھڑکی کے پاس۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "lettuce", 7, "7. Seed / Propagation", "٧. شرح بیج",
    `Seed rate: 300–400 g/acre for commercial planting; 1–2 g per sq metre for home gardens. Seeds are very tiny; mix with sand for even distribution. Germination in 3–7 days at 18–20°C. Light helps germination — do not cover deeply. For home growing, 1 packet of seed (2 g) is more than enough for a small garden. Use fresh seed each season — viability drops after 2–3 years.`,
    `شرح بیج: تجارتی کاشت کے لیے 300 سے 400 گرام فی ایکڑ؛ گھریلو باغیچوں کے لیے 1 سے 2 گرام فی مربع میٹر۔ بیج بہت چھوٹے ہوتے ہیں؛ یکساں تقسیم کے لیے ریت کے ساتھ ملائیں۔ 18 سے 20 ڈگری پر 3 سے 7 دنوں میں انکرنا ہوتا ہے۔ روشنی انکرنے میں مدد دیتی ہے — گہرا نہ ڈھانپیں۔ گھر پر اگانے کے لیے بیج کی 1 پیکٹ (2 گرام) ایک چھوٹے باغیچے کے لیے کافی سے زیادہ ہے۔ ہر موسم میں تازہ بیج استعمال کریں — 2 سے 3 سال بعد صلاحیت کم ہوتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "lettuce", 8, "8. Fertiliser", "٨. کھادوں کا استعمال",
    `Lettuce is a light feeder. Add compost before planting. Apply a balanced fertiliser (NPK 10-10-10) at planting: 25 kg/acre or 20 g per sq metre. Nitrogen top dressing (Urea 10 kg/acre) at 3 weeks encourages rapid leaf growth. For pots: monthly liquid fertiliser at half strength. Excess fertiliser causes fast but soft, bitter leaves — less is more. Stop fertilising 2 weeks before harvest.`,
    `سلاد پتی کم خوراک والا پودا ہے۔ لگانے سے پہلے کمپوسٹ ملائیں۔ لگانے کے وقت متوازن کھاد (NPK 10-10-10) دیں: 25 کلوگرام فی ایکڑ یا 20 گرام فی مربع میٹر۔ 3 ہفتوں میں نائٹروجن ٹاپ ڈریسنگ (یوریا 10 کلوگرام فی ایکڑ) تیز پتوں کی نشوونما کی حوصلہ افزائی کرتی ہے۔ گملوں کے لیے: آدھی مقدار میں ماہانہ مائع کھاد۔ زیادہ کھاد تیز لیکن نرم، کڑوے پتے پیدا کرتی ہے — کم بہتر ہے۔ کٹائی سے 2 ہفتے پہلے کھاد بند کریں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "lettuce", 9, "9. Weed Control", "٩. جڑی بوٹیوں کا انسداد",
    `Lettuce grows quickly and shades out weeds once established. Hand-weed in early stages. Shallow hoeing is safe (roots are shallow). Mulching with straw or compost between rows suppresses weeds and retains moisture. Chemical herbicides are not appropriate for lettuce in home gardens. Dense planting also helps suppress weeds naturally. Keep rows weed-free for the first 3 weeks.`,
    `سلاد پتی ایک بار قائم ہونے کے بعد تیزی سے اگتی اور جڑی بوٹیوں کو سایہ سے دبا دیتی ہے۔ ابتدائی مراحل میں ہاتھ سے گوڈی کریں۔ اتھلی کدال محفوظ ہے (جڑیں اتھلی ہیں)۔ قطاروں کے درمیان پھوس یا کمپوسٹ سے ملچنگ جڑی بوٹیوں کو دباتی اور نمی برقرار رکھتی ہے۔ گھریلو باغیچوں میں سلاد پتی کے لیے کیمیائی جڑی بوٹی مار دوائیں مناسب نہیں۔ گھنی کاشت بھی قدرتی طور پر جڑی بوٹیوں کو دبانے میں مدد دیتی ہے۔ پہلے 3 ہفتوں تک قطاروں کو جڑی بوٹیوں سے پاک رکھیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "lettuce", 10, "10. Irrigation", "١٠. آبپاشی",
    `Keep soil consistently moist — lettuce wilts quickly and stress causes bitterness. Water every 2–3 days or when top 2–3 cm of soil feels dry. Avoid overhead watering which promotes fungal diseases — water at the base. Drip or seep hose irrigation is ideal. In pots: water when the top 2–3 cm is dry, allow excess to drain. Do not let pots sit in water. Consistent moisture = sweet, crisp leaves.`,
    `مٹی کو مسلسل نم رکھیں — سلاد پتی جلدی مرجھاتی ہے اور دباؤ کڑواہٹ کا سبب بنتا ہے۔ ہر 2 سے 3 دن میں یا جب مٹی کی اوپری 2 سے 3 سینٹی میٹر خشک ہو تو پانی دیں۔ اوپر سے پانی دینے سے گریز کریں جو پھپھوندی کی بیماریوں کو بڑھاوا دیتا ہے — بنیاد پر پانی دیں۔ ڈرپ یا رسنے والی نلی آبپاشی مثالی ہے۔ گملوں میں: جب اوپری 2 سے 3 سینٹی میٹر خشک ہو پانی دیں، اضافی پانی نکلنے دیں۔ گملوں کو پانی میں نہ رہنے دیں۔ مسلسل نمی = میٹھے، کرکرے پتے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "lettuce", 11, "11. Pest & Disease Management", "١١. بیماریوں اور کیڑوں کا انسداد",
    `Pests: Aphids (spray insecticidal soap or neem oil), slugs/snails (hand-pick, use copper tape barriers), caterpillars (Bt spray — Bacillus thuringiensis). Diseases: Downy mildew (avoid wet foliage, Mancozeb spray), Bottom rot (improve drainage), Tipburn (calcium deficiency or rapid transpiration — calcium spray, reduce heat). Bolting (heat stress — plant resistant varieties, provide shade). Good air circulation prevents most diseases.`,
    `کیڑے: تیلا (کیڑے مار صابن یا نیم تیل اسپرے)، سلگس/گھونگھے (ہاتھ سے اٹھائیں، تانبے کی ٹیپ رکاوٹ استعمال کریں)، کیڑے (Bt اسپرے — Bacillus thuringiensis)۔ بیماریاں: ڈاؤنی ملڈیو (گیلے پتوں سے گریز، Mancozeb اسپرے)، نچلی سڑن (نکاسی بہتر کریں)، سرے کا جلنا (کیلشیم کی کمی یا تیز بخارات — کیلشیم اسپرے، گرمی کم کریں)۔ Bolting (گرمی کا دباؤ — مزاحم اقسام لگائیں، سایہ فراہم کریں)۔ اچھی ہوا کی گردش زیادہ تر بیماریوں کو روکتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "lettuce", 12, "12. Deficiencies & Remedies", "١٢. تدارک",
    `Nitrogen: pale, slow-growing plants — apply diluted liquid fertiliser or Urea foliar spray. Calcium: Tipburn (brown leaf margins, especially inner leaves) — spray Calcium Nitrate 0.5%, ensure good air circulation. Magnesium: interveinal yellowing — Epsom salt spray 1%. Iron: young leaves pale yellow — spray Ferrous Sulphate 0.3%. Potassium: leaf edge browning — apply SOP at low rate.`,
    `نائٹروجن: پیلے، آہستہ بڑھنے والے پودے — پتلی مائع کھاد یا یوریا پتوں پر اسپرے۔ کیلشیم: سرے کا جلنا (بھورے پتوں کے کنارے، خاص طور پر اندرونی پتے) — Calcium Nitrate 0.5 فیصد اسپرے، اچھی ہوا کی گردش یقینی بنائیں۔ میگنیشیم: رگوں کے درمیان پیلاپن — Epsom salt اسپرے 1 فیصد۔ آئرن: نوجوان پتے ہلکے پیلے — فیرس سلفیٹ 0.3 فیصد اسپرے۔ پوٹاشیم: پتوں کے کنارے بھورے — کم مقدار میں SOP لگائیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "lettuce", 13, "13. Harvesting", "١٣. برداشت",
    `Harvest loose-leaf varieties at any size by picking outer leaves (cut-and-come-again method). Head types (Romaine, Iceberg): harvest when heads are firm, usually at 60–80 days. Cut the whole head at the base. Harvest in the morning when leaves are crisp and cool. Bolted (flowering) lettuce is bitter and should be composted. Expected yield: 80–100 mounds/acre; home pot: 200–400 g per plant.`,
    `کھلی پتی اقسام کو کسی بھی سائز پر باہری پتے توڑ کر کاٹیں (کاٹو اور دوبارہ اگاؤ طریقہ)۔ گول سر والی اقسام (Romaine، آئس برگ): جب سر مضبوط ہوں کاٹیں، عام طور پر 60 سے 80 دنوں میں۔ پوری گول سر بنیاد سے کاٹیں۔ صبح کے وقت کاٹیں جب پتے کرکرے اور ٹھنڈے ہوں۔ Bolted (پھولنے والی) سلاد پتی کڑوی ہوتی ہے اور کمپوسٹ کرنی چاہیے۔ متوقع پیداوار: 80 سے 100 من فی ایکڑ؛ گھر کا گملہ: فی پودا 200 سے 400 گرام۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "lettuce", 14, "14. Post Harvest / Storage", "١٤. ذخیرہ کاری",
    `Lettuce is highly perishable. Store in the refrigerator (0–4°C, 95% RH) for up to 1–2 weeks. Do not wash before storing — moisture speeds up decay. Store in loosely sealed plastic bags or containers. Do not store near ethylene-producing fruits (apples, bananas). For best flavour, consume within 1–3 days of harvest. Wilted lettuce can be revived by soaking in ice water for 15–30 minutes.`,
    `سلاد پتی انتہائی جلدی خراب ہوتی ہے۔ 1 سے 2 ہفتوں تک فریج (0 سے 4 ڈگری، 95 فیصد نسبتی نمی) میں رکھیں۔ ذخیرہ کرنے سے پہلے نہ دھوئیں — نمی خرابی کو تیز کرتی ہے۔ ڈھیلے بند پلاسٹک بیگ یا کنٹینرز میں رکھیں۔ ایتھیلین پیدا کرنے والے پھلوں (سیب، کیلا) کے قریب نہ رکھیں۔ بہترین ذائقے کے لیے کٹائی کے 1 سے 3 دن کے اندر کھائیں۔ مرجھائی ہوئی سلاد پتی کو 15 سے 30 منٹ برف کے پانی میں بھگو کر تروتازہ کیا جا سکتا ہے۔`
  );

  // ── MINT ─────────────────────────────────────────────────────────────────
  await db.runAsync(`INSERT INTO plants (id, name_en, name_ur, type) VALUES (?, ?, ?, ?);`,
    "mint", "Mint", "پودینہ", "home");

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "mint", 1, "1. General Information", "١. عمومی معلومات",
    `Mint (Mentha spp.) is an aromatic herb used extensively in Pakistani cooking, chutneys, raita, teas, and traditional medicine. It is extremely easy to grow and spreads aggressively via underground runners (stolons). Popular species include Spearmint (Mentha spicata) and Peppermint (Mentha × piperita). Mint grows well in pots, containers, and garden beds and can be harvested repeatedly throughout the season.`,
    `پودینہ (Mentha spp.) ایک خوشبودار جڑی بوٹی ہے جو پاکستانی کھانے پکانے، چٹنیوں، رائتے، چائے اور روایتی دواؤں میں بڑے پیمانے پر استعمال ہوتی ہے۔ یہ اگانا انتہائی آسان ہے اور زیر زمین دوڑنے والوں (stolons) کے ذریعے تیزی سے پھیلتی ہے۔ مشہور اقسام میں Spearmint (Mentha spicata) اور Peppermint (Mentha × piperita) شامل ہیں۔ پودینہ گملوں، کنٹینروں اور باغیچے میں خوب اگتا ہے اور موسم بھر بار بار کاٹا جا سکتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "mint", 2, "2. Climate & Temperature", "٢. آب و ہوا اور درجہ حرارت",
    `Mint grows in a wide range of climates. It prefers cool to moderate temperatures (15–25°C) but tolerates heat if given partial shade and adequate water. It is frost-hardy — dies back in frost but regrows from roots in spring. In Pakistan's plains, mint grows best from October to April. In summer, it needs partial shade and more frequent watering. Grows year-round in mild hill climates.`,
    `پودینہ آب و ہوا کی وسیع رینج میں اگتا ہے۔ یہ ٹھنڈے سے معتدل درجہ حرارت (15 سے 25 ڈگری) کو ترجیح دیتا ہے لیکن جزوی سایہ اور کافی پانی دینے سے گرمی برداشت کرتا ہے۔ یہ پالہ برداشت کر سکتا ہے — پالے میں مر جاتا ہے لیکن بہار میں جڑوں سے دوبارہ اگتا ہے۔ پاکستان کے میدانوں میں پودینہ اکتوبر سے اپریل تک بہترین اگتا ہے۔ گرمیوں میں اسے جزوی سایہ اور زیادہ بار پانی درکار ہے۔ ہلکے پہاڑی موسم میں سال بھر اگتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "mint", 3, "3. Soil", "٣. موزوں زمین",
    `Mint prefers moist, well-drained, fertile loamy soil. pH 6.0–7.0 is ideal. It tolerates a wide range of soil types and is forgiving of poor soils. Rich, moist soil with added compost produces the most flavourful leaves. In pots: use a standard potting mix with added compost. Good drainage is important to prevent root rot but keep moisture levels higher than for most plants.`,
    `پودینہ نم، اچھی نکاسی والی، زرخیز دوہم مٹی کو ترجیح دیتا ہے۔ pH 6.0 سے 7.0 مثالی ہے۔ یہ مٹی کی وسیع اقسام برداشت کرتا ہے اور غریب مٹی میں بھی اگ جاتا ہے۔ اضافی کمپوسٹ کے ساتھ بھرپور، نم مٹی سب سے زیادہ خوشبودار پتے پیدا کرتی ہے۔ گملوں میں: اضافی کمپوسٹ کے ساتھ معیاری پوٹنگ مکسچر استعمال کریں۔ جڑوں کی سڑن روکنے کے لیے اچھی نکاسی اہم ہے لیکن زیادہ تر پودوں سے زیادہ نمی کی سطح برقرار رکھیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "mint", 4, "4. Varieties", "٤. اقسام",
    `Common varieties in Pakistan: Spearmint (Mentha spicata — used in chutneys, most common desi pudina), Peppermint (Mentha piperita — stronger, used for tea and medicinal purposes), Corn Mint (Mentha arvensis — used for menthol extraction). For home growing, Spearmint (desi pudina) is most suitable as it is flavourful and easy to grow. All mint varieties spread aggressively — contain in pots to prevent garden takeover.`,
    `پاکستان میں عام اقسام: Spearmint (Mentha spicata — چٹنیوں میں استعمال، سب سے عام دیسی پودینہ)، Peppermint (Mentha piperita — زیادہ تیز، چائے اور دواؤں کے لیے)، Corn Mint (Mentha arvensis — مینتھول نکالنے کے لیے)۔ گھر پر اگانے کے لیے Spearmint (دیسی پودینہ) سب سے موزوں ہے کیونکہ یہ خوشبودار اور اگانا آسان ہے۔ پودینے کی تمام اقسام تیزی سے پھیلتی ہیں — باغیچے پر قبضے سے بچنے کے لیے گملوں میں رکھیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "mint", 5, "5. Land Preparation", "٥. زمین کی تیاری",
    `Minimal preparation needed. Loosen soil to 20 cm, add compost (3–5 kg per sq metre). For garden beds, use sunken containers or underground barriers (plastic edging 20 cm deep) to contain spreading roots. In pots: use medium to large pots (25–30 cm diameter), filled with compost-rich potting mix. Raised beds work well. Change potting mix every 2 years as mint exhausts soil quickly.`,
    `کم سے کم تیاری درکار ہے۔ مٹی کو 20 سینٹی میٹر تک ڈھیلا کریں، کمپوسٹ ملائیں (3 سے 5 کلوگرام فی مربع میٹر)۔ باغیچے کے بستروں کے لیے، پھیلتی جڑوں کو روکنے کے لیے دھنسے ہوئے کنٹینرز یا زیر زمین رکاوٹیں (20 سینٹی میٹر گہری پلاسٹک کنارے) استعمال کریں۔ گملوں میں: درمیانے سے بڑے گملے (25 سے 30 سینٹی میٹر قطر) استعمال کریں، کمپوسٹ سے بھرپور پوٹنگ مکسچر سے بھریں۔ اونچے بستر خوب کام کرتے ہیں۔ ہر 2 سال میں پوٹنگ مکسچر بدلیں کیونکہ پودینہ مٹی کو جلدی ختم کر دیتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "mint", 6, "6. Sowing / Planting", "٦. طریقہ کاشت",
    `Mint is best propagated from cuttings or divisions, not seeds (seeds are unreliable and slow). Take 10–15 cm stem cuttings, remove lower leaves, place in water until roots appear (1–2 weeks), then plant in soil. Alternatively, plant in moist soil directly. Spacing: 30–40 cm apart. Can also be grown from fresh market-bought stems placed in water. Best planting time: February–March or September–October.`,
    `پودینہ بیج سے نہیں بلکہ قلمیں یا تقسیم سے اگانا بہترین ہے (بیج غیر قابل اعتماد اور آہستہ ہوتے ہیں)۔ 10 سے 15 سینٹی میٹر تنے کی قلمیں کاٹیں، نچلے پتے ہٹائیں، پانی میں رکھیں جب تک جڑیں نہ آ جائیں (1 سے 2 ہفتے)، پھر مٹی میں لگائیں۔ متبادل طور پر، براہ راست نم مٹی میں لگائیں۔ فاصلہ: 30 سے 40 سینٹی میٹر۔ بازار سے خریدے تازہ تنوں کو پانی میں رکھ کر بھی اگایا جا سکتا ہے۔ بہترین کاشت کا وقت: فروری تا مارچ یا ستمبر تا اکتوبر۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "mint", 7, "7. Seed / Propagation", "٧. شرح بیج",
    `Propagation by cuttings is almost always preferred over seed. Cuttings root very easily in water or moist soil within 1–2 weeks. Division of established clumps (splitting the root ball) is another reliable method. For commercial cultivation, runners (stolons) are planted at 10 cm apart. Seed propagation: sow on surface, keep moist, germination in 10–15 days — but plants may not be true to type.`,
    `قلموں سے نشوونما بیج پر تقریباً ہمیشہ ترجیح دی جاتی ہے۔ قلمیں 1 سے 2 ہفتوں میں پانی یا نم مٹی میں بہت آسانی سے جڑ پکڑتی ہیں۔ قائم شدہ گچھوں کی تقسیم (جڑوں کی گیند کو تقسیم کرنا) ایک اور قابل اعتماد طریقہ ہے۔ تجارتی کاشت کے لیے دوڑنے والے (stolons) 10 سینٹی میٹر کے فاصلے پر لگائے جاتے ہیں۔ بیج سے نشوونما: سطح پر بوئیں، نم رکھیں، 10 سے 15 دنوں میں انکرنا — لیکن پودے اصل قسم کے نہ ہوں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "mint", 8, "8. Fertiliser", "٨. کھادوں کا استعمال",
    `Mint is not a heavy feeder. Add compost at planting. Apply a balanced liquid fertiliser (NPK 10-10-10) once a month during the growing season. For in-ground plants: light Urea top dress (5 kg/acre) after each major harvest encourages rapid regrowth. Avoid excessive nitrogen which produces lush but weak, less flavourful growth. Over-fertilised mint loses essential oil content and fragrance.`,
    `پودینہ زیادہ خوراک والا پودا نہیں۔ لگانے کے وقت کمپوسٹ ملائیں۔ اگنے کے موسم میں مہینے میں ایک بار متوازن مائع کھاد (NPK 10-10-10) دیں۔ زمین میں لگے پودوں کے لیے: ہر بڑی کٹائی کے بعد ہلکی یوریا ٹاپ ڈریس (5 کلوگرام فی ایکڑ) تیز دوبارہ اگنے کی حوصلہ افزائی کرتی ہے۔ زیادہ نائٹروجن سے گریز کریں جو بھرپور لیکن کمزور، کم خوشبودار نشوونما پیدا کرتی ہے۔ زیادہ کھادی ہوئی پودینہ ضروری تیل اور خوشبو کھو دیتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "mint", 9, "9. Weed Control", "٩. جڑی بوٹیوں کا انسداد",
    `Established mint is vigorous and competitive — it tends to outcompete most weeds. Hand-weed in early stages before mint fills in. Mulching (straw or compost) between plants helps. Once mature, mint itself becomes the weed in garden beds — use pot or barrier containment. No chemical herbicides needed or appropriate in home mint patches. Pull any invasive weeds before they seed.`,
    `قائم شدہ پودینہ تیز اور مقابلہ کرنے والا ہے — یہ زیادہ تر جڑی بوٹیوں کو دباتا ہے۔ پودینہ بھرنے سے پہلے ابتدائی مراحل میں ہاتھ سے گوڈی کریں۔ پودوں کے درمیان ملچنگ (پھوس یا کمپوسٹ) مدد کرتی ہے۔ پختہ ہونے کے بعد، باغیچے کے بستروں میں پودینہ خود ہی جڑی بوٹی بن جاتا ہے — گملا یا رکاوٹ کنٹینمنٹ استعمال کریں۔ گھر کے پودینے کے پیچوں میں کوئی کیمیائی جڑی بوٹی مار دوائیں درکار یا مناسب نہیں۔ حملہ آور جڑی بوٹیاں بیج بنانے سے پہلے اکھیڑیں۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "mint", 10, "10. Irrigation", "١٠. آبپاشی",
    `Mint likes consistently moist soil. Water every 2–3 days or when the top 2–3 cm of soil feels dry. In hot summer: may need daily watering with afternoon shade. Do not let soil dry out completely — wilting reduces fragrance. Do not overwater to the point of waterlogging. In pots: water when top soil is dry, ensure drainage. Mulching reduces water loss significantly in summer.`,
    `پودینہ مسلسل نم مٹی پسند کرتا ہے۔ ہر 2 سے 3 دن میں یا جب مٹی کی اوپری 2 سے 3 سینٹی میٹر خشک ہو تو پانی دیں۔ گرم گرمیوں میں: دوپہر کے سایہ کے ساتھ روزانہ پانی کی ضرورت ہو سکتی ہے۔ مٹی کو بالکل خشک نہ ہونے دیں — مرجھانے سے خوشبو کم ہوتی ہے۔ پانی بھرنے کے نقطے تک زیادہ پانی نہ دیں۔ گملوں میں: جب اوپری مٹی خشک ہو پانی دیں، نکاسی یقینی بنائیں۔ گرمیوں میں ملچنگ پانی کی کمی کو نمایاں طور پر کم کرتی ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "mint", 11, "11. Pest & Disease Management", "١١. بیماریوں اور کیڑوں کا انسداد",
    `Pests: Aphids (neem oil or insecticidal soap spray), Spider mites (in hot dry conditions — neem oil, increase humidity), mint beetles (hand-pick). Diseases: Mint rust (orange pustules on leaves — remove affected leaves, avoid overhead watering, spray Mancozeb), Powdery mildew (white coating — improve air circulation, spray diluted baking soda solution 1%), Verticillium wilt (no cure — replace plants and soil). Good air circulation and avoiding overhead watering prevent most problems.`,
    `کیڑے: تیلا (نیم تیل یا کیڑے مار صابن اسپرے)، مکڑی کے کیڑے (گرم خشک حالات میں — نیم تیل، نمی بڑھائیں)، پودینے کے بیٹل (ہاتھ سے اٹھائیں)۔ بیماریاں: پودینے کی زنگ (پتوں پر نارنجی پھنسیاں — متاثرہ پتے ہٹائیں، اوپر سے پانی دینے سے گریز، Mancozeb اسپرے)، پاؤڈری ملڈیو (سفید تہہ — ہوا کی گردش بہتر کریں، پتلا بیکنگ سوڈا محلول 1 فیصد اسپرے)، Verticillium مرجھاؤ (کوئی علاج نہیں — پودے اور مٹی تبدیل کریں)۔ اچھی ہوا کی گردش اور اوپر سے پانی دینے سے گریز زیادہ تر مسائل روکتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "mint", 12, "12. Deficiencies & Remedies", "١٢. تدارک",
    `Nitrogen: pale, small leaves, slow growth — apply balanced liquid fertiliser. Magnesium: interveinal yellowing (older leaves first) — spray Epsom salt 1%. Iron: young leaves pale yellow — spray Ferrous Sulphate 0.3%. Potassium: leaf edge browning — apply SOP at low rate. Mint is generally tough and deficiencies are rare with regular compost application. Reduced fragrance usually means insufficient sunlight rather than nutrient deficiency.`,
    `نائٹروجن: پیلے، چھوٹے پتے، سست نشوونما — متوازن مائع کھاد لگائیں۔ میگنیشیم: رگوں کے درمیان پیلاپن (پہلے پرانے پتوں پر) — Epsom salt 1 فیصد اسپرے۔ آئرن: نوجوان پتے ہلکے پیلے — فیرس سلفیٹ 0.3 فیصد اسپرے۔ پوٹاشیم: پتوں کے کنارے بھورے — کم مقدار میں SOP لگائیں۔ پودینہ عموماً مضبوط ہوتا ہے اور باقاعدہ کمپوسٹ ڈالنے سے کمیابیاں نادر ہوتی ہیں۔ کم خوشبو عام طور پر غذائی کمی کی بجائے ناکافی سورج کی روشنی کی علامت ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "mint", 13, "13. Harvesting", "١٣. برداشت",
    `Begin harvesting when plants are 15–20 cm tall (6–8 weeks after planting). Cut stems back by one-third to one-half — never remove more than half at once. Harvest just before flowering for maximum fragrance (pinch off flower buds to extend leaf production). Regular harvesting keeps the plant bushy and productive. Morning harvesting gives best fragrance. Mint can be cut 3–4 times per season.`,
    `جب پودے 15 سے 20 سینٹی میٹر لمبے ہوں (لگانے کے 6 سے 8 ہفتے بعد) کٹائی شروع کریں۔ تنوں کو ایک تہائی سے آدھا کاٹیں — ایک وقت میں آدھے سے زیادہ کبھی نہ کاٹیں۔ زیادہ سے زیادہ خوشبو کے لیے پھول آنے سے ٹھیک پہلے کاٹیں (پتوں کی پیداوار بڑھانے کے لیے پھول کی کلیاں چٹکی لیں)۔ باقاعدہ کٹائی پودے کو گھنا اور پیداواری رکھتی ہے۔ صبح کی کٹائی سب سے بہترین خوشبو دیتی ہے۔ پودینہ موسم میں 3 سے 4 بار کاٹا جا سکتا ہے۔`
  );

  await db.runAsync(`INSERT INTO plant_sections (plant_id, order_index, title_en, title_ur, body_en, body_ur) VALUES (?, ?, ?, ?, ?, ?);`,
    "mint", 14, "14. Post Harvest / Storage", "١٤. ذخیرہ کاری",
    `Fresh mint: store stems in a glass of water (like flowers) at room temperature for 1–2 weeks. Alternatively, wrap in a damp paper towel, place in a zip-lock bag, and refrigerate for up to 2 weeks. Dried mint: dry in shade (not direct sun) to preserve colour and aroma — takes 1–2 weeks. Store dried mint in airtight glass jars away from light and heat for up to 1 year. Mint can also be frozen — wash, dry, chop, and freeze in ice cube trays with water.`,
    `تازہ پودینہ: تنوں کو کمرے کے درجہ حرارت پر پانی کے گلاس میں (پھولوں کی طرح) 1 سے 2 ہفتوں کے لیے رکھیں۔ متبادل طور پر گیلے کاغذی تولیے میں لپیٹیں، زپ لاک بیگ میں رکھیں اور 2 ہفتوں تک فریج میں رکھیں۔ خشک پودینہ: رنگ اور خوشبو محفوظ رکھنے کے لیے سایہ میں خشک کریں (براہ راست دھوپ نہیں) — 1 سے 2 ہفتے لگتے ہیں۔ خشک پودینہ روشنی اور گرمی سے دور ایئر ٹائٹ شیشے کے برتنوں میں 1 سال تک ذخیرہ کریں۔ پودینہ منجمد بھی کیا جا سکتا ہے — دھوئیں، خشک کریں، کاٹیں اور پانی کے ساتھ آئس کیوب ٹریز میں منجمد کریں۔`
  );

  console.log("✅ seedInitialData() complete");
}

// ---------------- QUERY HELPERS ----------------

export async function getPlantsByType(
  type: "crop" | "home"
): Promise<PlantRow[]> {
  await initDb();
  const db = await getDb();
  return db.getAllAsync<PlantRow>(
    "SELECT * FROM plants WHERE type = ? ORDER BY name_en;",
    [type]
  );
}

export async function getPlantWithSections(plantId: string) {
  await initDb();
  const db = await getDb();

  const plant = await db.getFirstAsync<PlantRow>(
    "SELECT * FROM plants WHERE id = ? LIMIT 1;",
    [plantId]
  );
  if (!plant) return null;

  const sections = await db.getAllAsync<PlantSectionRow>(
    "SELECT * FROM plant_sections WHERE plant_id = ? ORDER BY order_index ASC;",
    [plantId]
  );

  return { plant, sections };
}
// ---------------- MY PLANTS HELPERS ----------------

export async function addToMyPlants(plantId: string) {
  await initDb();
  const db = await getDb();

  await db.runAsync(
    `INSERT OR IGNORE INTO my_plants (plant_id, added_at)
     VALUES (?, datetime('now'));`,
    [plantId]
  );
}

export async function removeFromMyPlants(plantId: string) {
  await initDb();
  const db = await getDb();

  await db.runAsync(
    "DELETE FROM my_plants WHERE plant_id = ?;",
    [plantId]
  );
}

export async function getMyPlants(): Promise<PlantRow[]> {
  await initDb();
  const db = await getDb();

  return db.getAllAsync<PlantRow>(
    `SELECT p.*
     FROM plants p
     INNER JOIN my_plants mp ON mp.plant_id = p.id
     ORDER BY mp.added_at DESC;`
  );
}

export async function isInMyPlants(plantId: string): Promise<boolean> {
  await initDb();
  const db = await getDb();

  const row = await db.getFirstAsync<{ exists: number }>(
    `SELECT EXISTS(
       SELECT 1 FROM my_plants WHERE plant_id = ?
     ) AS exists;`,
    [plantId]
  );

  return !!row?.exists;
}
