export default async function handler(req, res) {

 const API = "https://api.loyverse.com/v1.0"

 const headers = {
  Authorization: `Bearer ${process.env.LOYVERSE_API_KEY}`
 }

 try {

  const [itemsRes, modifiersRes, categoriesRes] = await Promise.all([
   fetch(`${API}/items`, { headers }),
   fetch(`${API}/modifiers`, { headers }),
   fetch(`${API}/categories`, { headers })
  ])

  const itemsData = await itemsRes.json()
  const modifiersData = await modifiersRes.json()
  const categoriesData = await categoriesRes.json()

  const items = itemsData.items || []
  const modifiers = modifiersData.modifiers || []
  const categories = categoriesData.categories || []

  // map category name
  const categoryMap = {}

  categories.forEach(c => {
   categoryMap[c.id] = c.name
  })

  // convert modifiers → options
  const modifierOptions = modifiers.map(m => ({
   id: m.id,
   name: m.name,
   price: Number(m.price || 0)
  }))

  // build menu
  const menu = items.map(item => {

   const price =
    item.variants?.[0]?.stores?.[0]?.price ||
    item.variants?.[0]?.default_price ||
    0

   return {
    id: item.id,
    name: item.item_name,
    category_id: item.category_id,
    category: categoryMap[item.category_id] || "",
    image: item.image_url || null,
    price: Number(price),

    modifier_groups: [
     {
      id: "default",
      name: "ตัวเลือกเพิ่มเติม",
      min_select: 0,
      max_select: 10,
      modifiers: modifierOptions
     }
    ]

   }

  })

  res.status(200).json(menu)

 } catch (err) {

  res.status(500).json({
   error: err.message
  })

 }

}
