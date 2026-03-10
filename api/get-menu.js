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

  // map categories
  const categoryMap = {}
  categories.forEach(c => {
   categoryMap[c.id] = c.name
  })

  // map modifiers by group
  const modifiersByGroup = {}

  modifiers.forEach(m => {

   const gid = m.modifier_group_id
   if (!gid) return

   if (!modifiersByGroup[gid]) {
    modifiersByGroup[gid] = []
   }

   modifiersByGroup[gid].push({
    id: m.id,
    name: m.name,
    price: Number(m.price || 0)
   })

  })

  // build menu
  const menu = items.map(item => {

   const price =
    item.variants?.[0]?.stores?.[0]?.price ||
    item.variants?.[0]?.default_price ||
    0

   const modifier_groups = (item.modifier_ids || []).map(gid => ({
    id: gid,
    name: gid,
    min_select: 0,
    max_select: 1,
    modifiers: modifiersByGroup[gid] || []
   }))

   return {
    id: item.id,
    name: item.item_name,
    category_id: item.category_id,
    category: categoryMap[item.category_id] || "",
    image: item.image_url,
    price: Number(price),
    modifier_groups
   }

  })

  res.status(200).json(menu)

 } catch (err) {

  res.status(500).json({
   error: err.message
  })

 }

}
