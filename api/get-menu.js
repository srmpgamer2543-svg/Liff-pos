export default async function handler(req, res) {

 try {

  const headers = {
   Authorization: `Bearer ${process.env.LOYVERSE_API_KEY}`
  }

  // =========================
  // ดึง ITEMS
  // =========================
  let allItems = []
  let cursor = null

  while (true) {

   let url = "https://api.loyverse.com/v1.0/items?limit=250"

   if (cursor) {
    url += "&cursor=" + cursor
   }

   const response = await fetch(url, { headers })
   const data = await response.json()

   if (data.items) {
    allItems = allItems.concat(data.items)
   }

   if (!data.cursor) break
   cursor = data.cursor
  }


  // =========================
  // ดึง MODIFIER GROUPS
  // =========================
  let allGroups = []
  let groupCursor = null

  while (true) {

   let url = "https://api.loyverse.com/v1.0/modifier_groups?limit=250"

   if (groupCursor) {
    url += "&cursor=" + groupCursor
   }

   const response = await fetch(url, { headers })
   const data = await response.json()

   if (data.modifier_groups) {
    allGroups = allGroups.concat(data.modifier_groups)
   }

   if (!data.cursor) break
   groupCursor = data.cursor
  }

  const groups = allGroups


  // =========================
  // ดึง MODIFIERS
  // =========================
  let allModifiers = []
  let modCursor = null

  while (true) {

   let url = "https://api.loyverse.com/v1.0/modifiers?limit=250"

   if (modCursor) {
    url += "&cursor=" + modCursor
   }

   const response = await fetch(url, { headers })
   const data = await response.json()

   if (data.modifiers) {
    allModifiers = allModifiers.concat(data.modifiers)
   }

   if (!data.cursor) break
   modCursor = data.cursor
  }

  const modifiers = allModifiers


  // =========================
  // รวม modifier เข้า group
  // =========================
  const groupsWithMods = groups.map(function (g) {

   const mods = modifiers
    .filter(function (m) {
     return m.modifier_group_id === g.id
    })
    .map(function (m) {
     return {
      id: m.id,
      name: m.name,
      price: Number(m.price || 0),
      price_text: Number(m.price || 0) > 0 ? "+" + Number(m.price) : ""
     }
    })

   return {
    id: g.id,
    name: g.name,
    min_select: g.min_select,
    max_select: g.max_select,
    modifiers: mods
   }

  })


  // =========================
  // สร้าง MENU
  // =========================
  const menu = allItems.map(function (item) {

   const variant = item.variants && item.variants[0] ? item.variants[0] : {}

   let price = variant.default_price || 0

   if (variant.stores && variant.stores.length > 0) {
    price = variant.stores[0].price
   }

   const itemGroups = (item.modifier_groups_ids || [])
    .map(function (id) {
     return groupsWithMods.find(function (x) {
      return x.id === id
     })
    })
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
