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

  // map modifier groups
  const modifierMap = {}
  modifiers.forEach(group=>{
   modifierMap[group.id] = {
    id: group.id,
    name: group.name,
    modifiers: group.modifiers || []
   }
  })

  // map categories
  const categoryMap = {}
  categories.forEach(cat=>{
   categoryMap[cat.id] = cat.name
  })

  const menu = items.map(item=>{

   // price
   const variant = item.variants?.[0] || {}

   const price =
    variant?.stores?.[0]?.price ||
    variant?.default_price ||
    item.price ||
    0

   // modifier groups
   const modifierGroups = (item.modifier_ids || [])
    .map(id => modifierMap[id])
    .filter(Boolean)

   return {
    id: item.id,
    name: item.item_name,
    category: categoryMap[item.category_id] || "",
    price: Number(price),
    image: item.image_url || null,
    modifier_groups: modifierGroups
   }

  })

  res.status(200).json(menu)

 } catch(err) {

  res.status(500).json({
   error: "Failed to fetch menu",
   message: err.message
  })

 }

}
