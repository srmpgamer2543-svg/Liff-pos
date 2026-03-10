export default async function handler(req, res) {

 try{

  const headers={
   Authorization:`Bearer ${process.env.LOYVERSE_API_KEY}`
  }

  /* ------------------- */
  /* LOAD ITEMS */
  /* ------------------- */

  let allItems=[]
  let cursor=null

  while(true){

   let url="https://api.loyverse.com/v1.0/items?limit=250"

   if(cursor){
    url+=`&cursor=${cursor}`
   }

   const response = await fetch(url,{headers})
   const data = await response.json()

   if(data.items){
    allItems=[...allItems,...data.items]
   }

   if(!data.cursor) break
   cursor=data.cursor

  }

  /* ------------------- */
  /* LOAD MODIFIER GROUPS */
  /* ------------------- */

  const groupRes = await fetch(
   "https://api.loyverse.com/v1.0/modifier_groups",
   {headers}
  )

  const groupData = await groupRes.json()

  const groups = groupData.modifier_groups || []

  /* ------------------- */
  /* LOAD MODIFIERS */
  /* ------------------- */

  const modRes = await fetch(
   "https://api.loyverse.com/v1.0/modifiers",
   {headers}
  )

  const modData = await modRes.json()

  const modifiers = modData.modifiers || []

  /* ------------------- */
  /* ATTACH MODIFIERS TO GROUP */
  /* ------------------- */

  const groupsWithMods = groups.map(g=>{

   const mods = modifiers
   .filter(m=>m.modifier_group_id === g.id)
   .map(m=>({

    id:m.id,

    /* modifier name */
    name:m.name,

    /* modifier price */
    price:Number(m.price || 0),

    /* price text เผื่อ UI */
    price_text: Number(m.price || 0) > 0 
      ? `+${Number(m.price)}`
      : ""

   }))

   return{

    id:g.id,
    name:g.name,
    min_select:g.min_select,
    max_select:g.max_select,

    modifiers:mods

   }

  })

  /* ------------------- */
  /* BUILD MENU */
  /* ------------------- */

  const menu = allItems.map(item=>{

   const variant = item.variants?.[0] || {}

   let price = variant.default_price || 0

   if(variant.stores && variant.stores.length>0){
    price = variant.stores[0].price
   }

   const itemGroups = (item.modifier_group_ids || [])
   .map(id => groupsWithMods.find(g=>g.id === id))
   .filter(Boolean)

   return{

    id:item.id,
    name:item.item_name,
    category_id:item.category_id || null,
    image:item.image_url || null,

    /* base price */
    price:Number(price),

    /* ส่ง modifier ไป frontend */
    modifier_groups:itemGroups

   }

  })

  res.status(200).json(menu)

 }catch(err){

  res.status(500).json({
   error:err.message
  })

 }

}
