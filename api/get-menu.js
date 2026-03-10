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

  // map modifier by id
  const modifierMap = {}
  modifiers.forEach(m => {
   modifierMap[m.id] = m
  })

  // map category
  const categoryMap = {}
  categories.forEach(c => {
   categoryMap[c.id] = c
  })

  const menu = items.map(item => {

   const options = (item.modifier_ids || [])
    .map(id => modifierMap[id])
    .filter(Boolean)

   return {

    ...item,

    category: categoryMap[item.category_id] || null,

    options: options.map(o => ({
     id: o.id,
     name: o.name,
     price: Number(o.price || 0)
    }))

   }

  })

  res.status(200).json({
   source: "loyverse",
   items: menu
  })

 } catch (err) {

  res.status(500).json({
   error: err.message
  })

 }

}
