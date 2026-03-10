export default async function handler(req, res) {

 try {

  const headers = {
   Authorization: `Bearer ${process.env.LOYVERSE_API_KEY}`
  }

  async function fetchAll(url, key) {

   let all = []
   let cursor = null

   while (true) {

    let fullUrl = url + "?limit=250"

    if (cursor) {
     fullUrl += "&cursor=" + cursor
    }

    const response = await fetch(fullUrl, { headers })
    const data = await response.json()

    if (data[key]) {
     all = all.concat(data[key])
    }

    if (!data.cursor) break
    cursor = data.cursor
   }

   return all
  }

  const allItems = await fetchAll(
   "https://api.loyverse.com/v1.0/items",
   "items"
  )

  const groups = await fetchAll(
   "https://api.loyverse.com/v1.0/modifier_groups",
   "modifier_groups"
  )

  const modifiers = await fetchAll(
   "https://api.loyverse.com/v1.0/modifiers",
   "modifiers"
  )


  // รวม modifiers เข้า group
  const groupsWithMods = groups.map(g => {

   const mods = modifiers
    .filter(m => m.modifier_group_id === g.id)
    .map(m => ({
     id: m.id,
     name: m.name,
     price: Number(m.price || 0)
    }))

   return {
    id: g.id,
    name: g.name,
    min_select: g.min_select ?? g.min_selected ?? 0,
    max_select: g.max_select ?? g.max_selected ?? 0,
    modifiers: mods
   }

  })


  const menu = allItems.map(item => {

   const variant = item.variants?.[0] || {}

   let price = variant.default_price || 0

   if (variant.stores?.length) {
    price = variant.stores[0].price
   }

   // 🔥 ใช้ modifier_ids
   const groupIds = item.modifier_ids || []

   const itemGroups = groupIds
    .map(id => groupsWithMods.find(g => g.id === id))
    .filter(Boolean)

   return {
    id: item.id,
    name: item.item_name,
    category_id: item.category_id || null,
    image: item.image_url || null,
    price: Number(price),
    modifier_groups: itemGroups
   }

  })

  res.status(200).json(menu)

 } catch (err) {

  res.status(500).json({
   error: err.message
  })

 }

}
