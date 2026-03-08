import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {

  try {

    const { data, error } = await supabase
      .from("menu")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }

    // ปรับข้อมูลให้ตรงกับหน้า POS
    const menu = data.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price || 0,
      image: item.image || "",
      category_name: item.category_name || item.category || "00_อื่นๆ"
    }))

    return res.status(200).json(menu)

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    })

  }

}
