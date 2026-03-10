export default async function handler(req, res){

 try{

  const headers={
   Authorization:`Bearer ${process.env.LOYVERSE_API_KEY}`
  }

  async function fetchAll(url,key){

   let all=[]
   let cursor=null

   while(true){

    let fullUrl=url+"?limit=250"

    if(cursor) fullUrl+="&cursor="+cursor

    const r=await fetch(fullUrl,{headers})
    const data=await r.json()

    if(data[key]) all=all.concat(data[key])

    if(!data.cursor) break

    cursor=data.cursor
   }

   return all

  }

  const items=await fetchAll(
   "https://api.loyverse.com/v1.0/items",
   "items"
  )

  const groups=await fetchAll(
   "https://api.loyverse.com/v1.0/modifier_groups",
   "modifier_groups"
  )

  const modifiers=await fetchAll(
   "https://api.loyverse.com/v1.0/modifiers",
   "modifiers"
  )

  const result={

   totals:{
    items:items.length,
    groups:groups.length,
    modifiers:modifiers.length
   },

   groups:groups.map(g=>({

    id:g.id,
    name:g.name,
    min_select:g.min_select,
    max_select:g.max_select

   })),

   modifiers:modifiers.map(m=>({

    id:m.id,
    name:m.name,
    group_id:m.modifier_group_id,
    group_ids:m.modifier_group_ids,
    price:m.price

   })),

   items:items.slice(0,20).map(i=>({

    id:i.id,
    name:i.item_name,
    modifier_ids:i.modifier_ids

   }))

  }

  res.status(200).json(result)

 }catch(err){

  res.status(500).json({
   error:err.message
  })

 }

}
