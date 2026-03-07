import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {

  try {

    const response = await fetch(
      "https://api.loyverse.com/v1.0/items",
      {
        headers: {
          Authorization: `Bearer ${process.env.LOYVERSE_API_KEY}`
        }
      }
    )

    const data = await response.json()
    const items = data.items || []

    const menu = items.map(item => {

      const variant = item.variants?.[0] || {}

      let price = variant.default_price || 0

      if (variant.stores && variant.stores.length > 0) {
        price = variant.stores[0].price
      }

      return {
        id: item.id,
        name: item.item_name,
        category_id: item.category_id,
        image: item.image_url,
        price: price
      }

    })

    // INSERT / UPDATE เข้า Supabase
    const { error } = await supabase
      .from("menu")
      .upsert(menu)

    if (error) {
      throw error
    }

    res.status(200).json({
      success: true,
      total: menu.length
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    })

  }

}
