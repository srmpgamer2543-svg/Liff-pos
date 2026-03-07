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

    if (!SUPABASE_URL || !SUPABASE_KEY || !LOYVERSE_API_KEY) {
      return res.status(500).json({ error: "ENV missing" })
    }

    const headers = {
      Authorization: `Bearer ${LOYVERSE_API_KEY}`
    }

    // ==================================
    // 1. ดึง ITEMS (รองรับ pagination)
    // ==================================

    let items = []
    let cursor = null

    do {

      const url = cursor
        ? `https://api.loyverse.com/v1.0/items?cursor=${cursor}`
        : `https://api.loyverse.com/v1.0/items`

      const response = await fetch(url, { headers })

      const data = await response.json()

      console.log("ITEM PAGE:", data)

      items = items.concat(data.items || [])

      cursor = data.cursor

    } while (cursor)

    // ==================================
    // 2. categories
    // ==================================

    const catRes = await fetch(
      "https://api.loyverse.com/v1.0/categories",
      { headers }
    )

    const catData = await catRes.json()

    console.log("CATEGORIES:", catData)

    const categories = catData.categories || []

    const categoryMap = {}

    categories.forEach(c => {
      categoryMap[c.id] = c.name
    })

    // ==================================
    // 3. modifiers
    // ==================================

    const modRes = await fetch(
      "https://api.loyverse.com/v1.0/modifier_lists",
      { headers }
    )

    const modData = await modRes.json()

    console.log("MODIFIERS:", modData)

    const modifiers = modData.modifier_lists || []

    // ==================================
    // 4. build menu
    // ==================================

    const menu = []

    items.forEach(item => {

      const categoryName = categoryMap[item.category_id] || null

      if (!item.variants) return

      item.variants.forEach(variant => {

        let price = 0

        if (variant.price_money?.amount) {
          price = variant.price_money.amount / 100
        }
        else if (variant.price) {
          price = variant.price / 100
        }

        const row = {
          id: variant.variant_id || item.id,
          name: item.item_name,
          price: price,
          category: categoryName,
          image: item.image_url || null,
          sku: variant.sku || null,
          modifier_ids: item.modifier_list_ids || []
        }

        console.log("MENU ROW:", row)

        menu.push(row)

      })

    })

    console.log("TOTAL ITEMS:", items.length)
    console.log("TOTAL MENU ROWS:", menu.length)

    // ==================================
    // 5. save to Supabase
    // ==================================

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

    console.log("SUPABASE RESPONSE:", supabaseText)

    return res.json({
      status: "sync success",
      loyverse_items: items.length,
      menu_rows: menu.length,
      categories: categories.length,
      modifiers: modifiers.length,
      example: menu[0],
      supabase_response: supabaseText
    })

  } catch (err) {

    console.error("ERROR:", err)

    return res.status(500).json({
      error: err.message
    })

  }

}
