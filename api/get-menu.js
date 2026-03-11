export default async function handler(req, res) {

 const headers = {
  Authorization: `Bearer ${process.env.LOYVERSE_API_KEY}`
 }

 try {

  const [itemsRes, modifiersRes, categoriesRes] = await Promise.all([
   fetch("https://api.loyverse.com/v1.0/items", { headers }),
   fetch("https://api.loyverse.com/v1.0/modifiers", { headers }),
   fetch("https://api.loyverse.com/v1.0/categories", { headers })
  ])

  const items = (await itemsRes.json()).items || []
  const modifierLists = (await modifiersRes.json()).modifiers || []
  const categories = (await categoriesRes.json()).categories || []

  // category map
  const categoryMap = {}
  categories.forEach(c=>{
   categoryMap[c.id] = c.name
  })

  // modifier group map
  const modifierMap = {}

  modifierLists.forEach(group=>{

   modifierMap[group.id] = {
    id: group.id,
    name: group.name,
    modifiers: (group.modifier_options || []).map(o=>({
     id: o.id,
     name: o.name,
     price: o.price || 0
    }))
   }

  })

  const menu = items.map(item=>{

   const variant = item.variants?.[0] || {}

   const price =
    variant?.stores?.[0]?.price ||
    variant?.default_price ||
    0

   const modifierGroups = (item.modifier_ids || [])
    .map(id=>modifierMap[id])
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

  res.status(500).json({ error: err.message })

 }

}
