export default async function handler(req, res) {

  try {

    const SUPABASE_URL = process.env.SUPABASE_URL
    const SUPABASE_KEY = process.env.SUPABASE_KEY
    const LOYVERSE_API_KEY = process.env.LOYVERSE_API_KEY

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ error: "Supabase ENV missing" })
    }

    if (!LOYVERSE_API_KEY) {
      return res.status(500).json({ error: "Loyverse API KEY missing" })
    }

    // ดึงสินค้า
    const itemsRes = await fetch("https://api.loyverse.com/v1.0/items", {
      headers: {
        Authorization: `Bearer ${LOYVERSE_API_KEY}`
      }
    })

    const itemsData = await itemsRes.json()
    const items = itemsData.items || []

    // ดึงหมวดหมู่
    const catRes = await fetch("https://api.loyverse.com/v1.0/categories", {
      headers: {
        Authorization: `Bearer ${LOYVERSE_API_KEY}`
      }
    })

    const catData = await catRes.json()
    const categories = catData.categories || []

    const categoryMap = {}
    categories.forEach(c => {
      categoryMap[c.id] = c.name
    })

    if (items.length === 0) {
      return res.json({
        status: "no items from loyverse"
      })
    }

    // แปลงข้อมูล
    const menu = items.map(item => {

      const variant = item.variants?.[0] || {}

      return {
        id: item.id,
        name: item.item_name,
        description: item.description || "",
        category_id: item.category_id || null,
        category_name: categoryMap[item.category_id] || null,
        price: variant.price || 0,
        sku: variant.sku || "",
        barcode: variant.barcode || "",
        image: item.image_url || "",
        option1: item.option1_name || null,
        option2: item.option2_name || null,
        option3: item.option3_name || null,
        variants: item.variants || []
      }

    })

    // ส่งเข้า Supabase
    const supabaseRes = await fetch(
      `${SUPABASE_URL}/rest/v1/menu`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates"
        },
        body: JSON.stringify(menu)
      }
    )

    const result = await supabaseRes.text()

    return res.json({
      status: "menu synced",
      items_synced: menu.length,
      supabase: result
    })

  } catch (err) {

    return res.status(500).json({
      error: err.message
    })

  }

}
