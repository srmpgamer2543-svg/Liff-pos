export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

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

    // ===============================
    // 1. ดึงข้อมูลจาก Loyverse
    // ===============================
    const loyverseRes = await fetch(
      "https://api.loyverse.com/v1.0/items",
      {
        headers: {
          Authorization: `Bearer ${LOYVERSE_API_KEY}`
        }
      }
    )

    if (!loyverseRes.ok) {
      return res.status(500).json({
        error: "Failed to fetch Loyverse",
        status: loyverseRes.status
      })
    }

    const loyverseData = await loyverseRes.json()

    const items = loyverseData.items || []

    if (items.length === 0) {
      return res.json({
        status: "no items from loyverse"
      })
    }

    // ===============================
    // DEBUG: ดูโครงสร้าง item
    // ===============================
    const debugItem = items[0]

    const debugVariant =
      debugItem.variants && debugItem.variants.length
        ? debugItem.variants[0]
        : null

    // ===============================
    // 2. แปลงข้อมูล menu
    // ===============================
    const menu = []

    items.forEach(item => {

      if (!item.variants) return

      item.variants.forEach(variant => {

        let price = 0

        if (variant.price_money?.amount) {
          price = variant.price_money.amount / 100
        }
        else if (variant.price) {
          price = variant.price / 100
        }

        menu.push({
          id: variant.variant_id || item.id,
          name: item.item_name,
          price: price,
          category: item.category_name || null,
          image: item.image_url || null,
          sku: variant.sku || null
        })

      })

    })

    // ===============================
    // 3. ส่งเข้า Supabase
    // ===============================
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

    const supabaseText = await supabaseRes.text()

    // ===============================
    // 4. ส่ง debug กลับ
    // ===============================
    return res.json({

      status: "menu synced",

      total_items_from_loyverse: items.length,

      total_variants_synced: menu.length,

      example_menu_row: menu[0],

      debug_item_structure: debugItem,

      debug_variant_structure: debugVariant,

      supabase_response: supabaseText

    })

  } catch (err) {

    return res.status(500).json({
      error: err.message
    })

  }

}
