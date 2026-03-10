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

  const modifiersByGroup = {}

  modifiers.forEach(m => {

   const gid = m.modifier_group_id

   if (!modifiersByGroup[gid]) {
    modifiersByGroup[gid] = []
   }

   modifiersByGroup[gid].push({
    id: m.id,
    name: m.name,
    price: Number(m.price || 0)
   })

  })

  const groupById = {}

  groups.forEach(g => {

   groupById[g.id] = {
    id: g.id,
    name: g.name,
    min_select: g.min_select ?? g.min_selected ?? 0,
    max_select: g.max_select ?? g.max_selected ?? 0
   }

  })

  const menu = allItems.map(item => {

   const variant = item.variants?.[0] || {}

   const price =
    variant.stores?.[0]?.price ??
    variant.default_price ??
    0

   const itemGroups = []

   // ใช้ modifier_ids เป็น group id โดยตรง
   const groupIds = item.modifier_ids || []

   groupIds.forEach(groupId => {

    const group = groupById[groupId]

    if (!group) return

    const mods = modifiersByGroup[groupId] || []

    itemGroups.push({
     id: group.id,
     name: group.name,
     min_select: group.min_select,
     max_select: group.max_select,
     modifiers: mods
    })

   })

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
