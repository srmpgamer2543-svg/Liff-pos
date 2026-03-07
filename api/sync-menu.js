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

    // ดึง items จาก Loyverse
    const loyverseRes = await fetch(
      "https://api.loyverse.com/v1.0/items",
      {
        headers: {
          Authorization: `Bearer ${LOYVERSE_API_KEY}`
        }
      }
    )

    const loyverseData = await loyverseRes.json()

    const items = loyverseData.items || []

    if (items.length === 0) {
      return res.json({ status: "no items from loyverse" })
    }

    // แปลงข้อมูล
    const menu = []

    items.forEach(item => {

      if (!item.variants) return

      item.variants.forEach(variant => {

        let price = 0

        // แบบที่ 1 price_money
        if (variant.price_money && variant.price_money.amount) {
          price = variant.price_money.amount / 100
        }

        // แบบที่ 2 price
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
      total_items: menu.length,
      example: menu[0],
      supabase_response: result
    })

  } catch (err) {

    return res.status(500).json({
      error: err.message
    })

  }

}
