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

  const modifierMap = {}
  modifiers.forEach(m=>{
   modifierMap[m.id] = m
  })

  const categoryMap = {}
  categories.forEach(c=>{
   categoryMap[c.id] = c.name
  })

  const menu = items.map(item=>{

   const price =
    item.variants?.[0]?.stores?.[0]?.price ||
    item.variants?.[0]?.default_price ||
    0

   const modifierGroups = (item.modifier_ids || []).map(id=>{
    const group = modifierMap[id]
    if(!group) return null

    return {
     id: group.id,
     name: group.name,
     options: group.options || []
    }

   }).filter(Boolean)

   return {
    id:item.id,
    name:item.item_name,
    category:categoryMap[item.category_id] || "",
    price,
    image:item.image_url,
    modifier_groups:modifierGroups
   }

  })

  res.json(menu)

 } catch(err){
  res.status(500).json({error:err.message})
 }

}
