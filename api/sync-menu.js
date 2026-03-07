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

    // ดึงสินค้า Loyverse
    const loyverseRes = await fetch("https://api.loyverse.com/v1.0/items", {
      headers: {
        Authorization: `Bearer ${LOYVERSE_API_KEY}`
      }
    })

    const loyverseData = await loyverseRes.json()

    const items = loyverseData.items || []

    if (items.length === 0) {
      return res.json({
        status: "no items from loyverse"
      })
    }

    // เตรียมข้อมูลส่ง Supabase
    const menu = items.map(item => ({
      id: item.id,
      name: item.item_name,
      price: item.variants?.[0]?.price || 0
    }))

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
      count: menu.length,
      supabase: result
    })

  } catch (err) {

    return res.status(500).json({
      error: err.message
    })

  }

}
