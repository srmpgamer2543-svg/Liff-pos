import axios from "axios"

export default async function handler(req, res) {

  try {

    const token = process.env.LOYVERSE_TOKEN

    const itemRes = await axios.get(
      "https://api.loyverse.com/v1.0/items",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const modifierRes = await axios.get(
      "https://liff-pos.vercel.app/api/modifiers"
    )

    const modifiers = modifierRes.data

    const items = itemRes.data.items

    const products = items.map(item => {

      return {
        id: item.item_id,
        variant_id: item.variants?.[0]?.variant_id,
        name: item.item_name,
        price: item.variants?.[0]?.price,
        image_url: item.image_url || "",
        category: item.category_name || "อื่นๆ",
        modifiers: modifiers
      }

    })

    res.status(200).json(products)

  } catch (err) {

    console.error(err)

    res.status(500).json({
      error: "Failed to load products"
    })

  }

}
