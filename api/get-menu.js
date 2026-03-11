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
  const modifiers = (await modifiersRes.json()).modifiers || []
  const categories = (await categoriesRes.json()).categories || []

  // map category
  const categoryMap = {}
  categories.forEach(c=>{
   categoryMap[c.id] = c.name
  })

  // group modifiers by modifier_list_id
  const modifierGroupMap = {}

  modifiers.forEach(m => {

   const groupId = m.modifier_list_id

   if(!modifierGroupMap[groupId]){
    modifierGroupMap[groupId] = []
   }

   modifierGroupMap[groupId].push({
    id: m.id,
    name: m.name,
    price: m.price || 0
   })

  })

  const menu = items.map(item => {

   const variant = item.variants?.[0] || {}

   const price =
    variant?.stores?.[0]?.price ||
    variant?.default_price ||
    0

   const groups = (item.modifier_ids || []).map(id => ({
    id,
    modifiers: modifierGroupMap[id] || []
   }))

   return {
    id: item.id,
    name: item.item_name,
    category: categoryMap[item.category_id] || "",
    price: Number(price),
    image: item.image_url || null,
    modifier_groups: groups
   }

  })

  res.status(200).json(menu)

 } catch(err) {

  res.status(500).json({
   error: err.message
  })

 }

}
