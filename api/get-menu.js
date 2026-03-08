import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {

  try {

    // ดึงสินค้า
    const { data: items, error: itemError } = await supabase
      .from("items")
      .select("*")

    if (itemError) {
      return res.status(500).json({ error: itemError.message })
    }

    // ดึงหมวดหมู่
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*")

    if (catError) {
      return res.status(500).json({ error: catError.message })
    }

    // map หมวดหมู่
    const catMap = {}
    categories.forEach(c => {
      catMap[c.id] = c.name
    })

    // แปลงข้อมูลให้หน้า POS ใช้ได้
    const menu = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image_url || "",
      category_name: catMap[item.category_id] || "00_อื่นๆ"
    }))

    res.status(200).json(menu)

  } catch (err) {

    res.status(500).json({
      error: err.message
    })

  }

}
