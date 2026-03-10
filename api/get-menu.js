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

  // map modifiers
  const modifierMap = {}
  modifiers.forEach(m => {
   modifierMap[m.id] = m
  })

  // map category
  const categoryMap = {}
  categories.forEach(c => {
   categoryMap[c.id] = c.name
  })

  const menu = items.map(item => {

   // price จาก variant
   const price =
    item.variants?.[0]?.stores?.[0]?.price ||
    item.variants?.[0]?.default_price ||
    0

   // ดึง option จริงจาก modifier_ids
   const options = (item.modifier_ids || [])
    .map(id => modifierMap[id])
    .filter(Boolean)
    .map(o => ({
     id: o.id,
     name: o.name,
     price: Number(o.price || 0)
    }))

   return {

    id: item.id,
    name: item.item_name,
    category_id: item.category_id,
    category: categoryMap[item.category_id] || "",
    image: item.image_url || null,

    price: Number(price),

    options,

    // เก็บ raw data ไว้ debug
    loyverse_raw: item

   }

  })

  res.status(200).json({
   success: true,
   total: menu.length,
   data: menu
  })

 } catch (err) {

  res.status(500).json({
   success: false,
   error: err.message
  })

 }

}
