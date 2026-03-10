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

    if (cursor) fullUrl += "&cursor=" + cursor

    const response = await fetch(fullUrl, { headers })
    const data = await response.json()

    if (data[key]) all = all.concat(data[key])

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



  // =========================
  // lookup modifier by id
  // =========================

  const modifierById = {}

  modifiers.forEach(m => {

   modifierById[m.id] = {
    id: m.id,
    name: m.name,
    price: Number(m.price || 0),
    group_id: m.modifier_group_id
   }

  })


  // =========================
  // lookup group
  // =========================

  const groupMap = {}

  groups.forEach(g => {

   groupMap[g.id] = {
    id: g.id,
    name: g.name,
    min_select: g.min_select ?? g.min_selected ?? 0,
    max_select: g.max_select ?? g.max_selected ?? 0,
    modifiers: []
   }

  })



  // =========================
  // สร้าง MENU
  // =========================

  const menu = allItems.map(item => {

   const variant = item.variants?.[0] || {}

   const price =
    variant.stores?.[0]?.price ??
    variant.default_price ??
    0

   const itemGroups = {}

   ;(item.modifier_ids || []).forEach(modId => {

    const mod = modifierById[modId]

    if (!mod) return

    const groupId = mod.group_id

    if (!groupMap[groupId]) return

    if (!itemGroups[groupId]) {

     itemGroups[groupId] = {
      id: groupMap[groupId].id,
      name: groupMap[groupId].name,
      min_select: groupMap[groupId].min_select,
      max_select: groupMap[groupId].max_select,
      modifiers: []
     }

    }

    itemGroups[groupId].modifiers.push({
     id: mod.id,
     name: mod.name,
     price: mod.price
    })

   })

   return {
    id: item.id,
    name: item.item_name,
    category_id: item.category_id || null,
    image: item.image_url || null,
    price: Number(price),
    modifier_groups: Object.values(itemGroups)
   }

  })


  res.status(200).json(menu)

 } catch (err) {

  res.status(500).json({
   error: err.message
  })

 }

}
