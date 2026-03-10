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

  const modifiers = await fetchAll(
   "https://api.loyverse.com/v1.0/modifiers",
   "modifiers"
  )

  // สร้าง group จาก modifiers
  const groupById = {}

  modifiers.forEach(m => {

   groupById[m.id] = {
    id: m.id,
    name: m.name,
    min_select: 0,
    max_select: 1,
    modifiers: [
     {
      id: m.id,
      name: m.name,
      price: Number(m.price || 0)
     }
    ]
   }

  })

  const menu = allItems.map(item => {

   const variant = item.variants?.[0] || {}

   const price =
    variant.stores?.[0]?.price ??
    variant.default_price ??
    0

   const itemGroups = []

   const groupIds = item.modifier_ids || []

   groupIds.forEach(groupId => {

    const group = groupById[groupId]

    if (group) {
     itemGroups.push(group)
    }

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
