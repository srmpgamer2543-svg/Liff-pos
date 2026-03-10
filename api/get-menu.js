export default async function handler(req, res) {

 const API = "https://api.loyverse.com/v1.0"

 const headers = {
  Authorization: `Bearer ${process.env.LOYVERSE_API_KEY}`
 }

 try {

  const [
   itemsRes,
   modifiersRes,
   groupsRes,
   categoriesRes
  ] = await Promise.all([
   fetch(`${API}/items`, { headers }),
   fetch(`${API}/modifiers`, { headers }),
   fetch(`${API}/modifier_groups`, { headers }),
   fetch(`${API}/categories`, { headers })
  ])

  const itemsData = await itemsRes.json()
  const modifiersData = await modifiersRes.json()
  const groupsData = await groupsRes.json()
  const categoriesData = await categoriesRes.json()

  const items = itemsData.items || []
  const modifiers = modifiersData.modifiers || []
  const groups = groupsData.modifier_groups || []
  const categories = categoriesData.categories || []

  // map category
  const categoryMap = {}
  categories.forEach(c => {
   categoryMap[c.id] = c
  })

  // map options by group
  const optionsByGroup = {}
  modifiers.forEach(m => {

   const gid = m.modifier_group_id
   if (!gid) return

   if (!optionsByGroup[gid]) {
    optionsByGroup[gid] = []
   }

   optionsByGroup[gid].push(m)

  })

  // attach options to modifier group
  const groupsWithOptions = {}
  groups.forEach(g => {

   groupsWithOptions[g.id] = {
    ...g,
    options: optionsByGroup[g.id] || []
   }

  })

  // build menu
  const menu = items.map(item => {

   const itemGroups = (item.modifier_ids || []).map(gid => {
    return groupsWithOptions[gid] || null
   }).filter(Boolean)

   return {

    ...item,                      // raw item จาก Loyverse
    category: categoryMap[item.category_id] || null,
    modifier_groups: itemGroups   // group + options

   }

  })

  res.status(200).json({

   source: "loyverse",

   totals: {
    items: items.length,
    modifiers: modifiers.length,
    modifier_groups: groups.length,
    categories: categories.length
   },

   menu

  })

 } catch (err) {

  res.status(500).json({
   error: err.message
  })

 }

}
