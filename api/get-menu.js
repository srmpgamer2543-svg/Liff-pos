export default async function handler(req, res) {

 try {

  const headers = {
   Authorization: `Bearer ${process.env.LOYVERSE_API_KEY}`
  }

  // =========================
  // FETCH FUNCTION (cursor pagination)
  // =========================
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


  // =========================
  // ดึงข้อมูลทั้งหมด
  // =========================
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


  // =========================
  // รวม modifiers เข้า group
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
      price_text: Number(m.price || 0) > 0
       ? "+" + Number(m.price)
       : ""
     }
    })

   return {
    id: g.id,
    name: g.name,

    // รองรับทั้ง 2 แบบของ Loyverse
    min_select: g.min_select ?? g.min_selected ?? 0,
    max_select: g.max_select ?? g.max_selected ?? 0,

    modifiers: mods
   }

  })


  // =========================
  // สร้าง MENU พร้อม modifier
  // =========================
  const menu = allItems.map(function (item) {

   const variant =
    item.variants && item.variants.length
     ? item.variants[0]
     : {}

   let price = variant.default_price || 0

   if (variant.stores && variant.stores.length > 0) {
    price = variant.stores[0].price
   }

   // รองรับทั้ง modifier_groups_ids และ modifier_ids
   const groupIds =
    item.modifier_groups_ids ||
    item.modifier_ids ||
    []

   const itemGroups = groupIds
    .map(function (id) {
     return groupsWithMods.find(function (g) {
      return g.id === id
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
