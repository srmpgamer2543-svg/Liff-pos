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

  const items = (await itemsRes.json()).items || []
  const modifiers = (await modifiersRes.json()).modifiers || []
  const categories = (await categoriesRes.json()).categories || []

  // group modifiers by modifier_list_id
  const modifierGroupMap = {}

  modifiers.forEach(m => {

   if(!modifierGroupMap[m.modifier_list_id]){
    modifierGroupMap[m.modifier_list_id] = []
   }

   modifierGroupMap[m.modifier_list_id].push({
    id: m.id,
    name: m.name,
    price: m.price || 0
   })

  })

  // map category
  const categoryMap = {}
  categories.forEach(c=>{
   categoryMap[c.id] = c.name
  })

  const menu = items.map(item => {

   const variant = item.variants?.[0] || {}

   const price =
    variant?.stores?.[0]?.price ||
    variant?.default_price ||
    0

   const modifierGroups = (item.modifier_ids || []).map(id => {

    return {
     id,
     name: "",
     modifiers: modifierGroupMap[id] || []
    }

   })

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
   error: err.message
  })

 }

}
