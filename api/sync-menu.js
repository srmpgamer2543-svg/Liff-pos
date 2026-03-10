import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
 process.env.SUPABASE_URL,
 process.env.SUPABASE_KEY
)

export default async function handler(req, res) {

 try {

  let allItems=[]
  let cursor=null

  while(true){

   let url="https://api.loyverse.com/v1.0/items"

   if(cursor){
    url+=`?cursor=${cursor}`
   }

   const response = await fetch(url,{
    headers:{
     Authorization:`Bearer ${process.env.LOYVERSE_API_KEY}`
    }
   })

   const data=await response.json()

   if(data.items){
    allItems=[...allItems,...data.items]
   }

   if(!data.cursor){
    break
   }

   cursor=data.cursor

  }

  const menu=allItems.map(item=>{

   const variant=item.variants?.[0]||{}

   let price=variant.default_price||0

   if(variant.stores && variant.stores.length>0){
    price=variant.stores[0].price
   }

   return{
    id:item.id,
    name:item.item_name,
    category_id:item.category_id || null,
    image:item.image_url || null,
    price:Number(price)
   }

  })

  const loyverseIds = menu.map(i=>`"${i.id}"`).join(",")

  // UPSERT (insert or update)
  const {error:upsertError}=await supabase
  .from("items")
  .upsert(menu,{onConflict:"id"})

  if(upsertError) throw upsertError

  // DELETE items not in Loyverse
  const {error:deleteError}=await supabase
  .from("items")
  .delete()
  .not("id","in",`(${loyverseIds})`)

  if(deleteError) throw deleteError

  res.status(200).json({
   success:true,
   total:menu.length
  })

 } catch(error){

  res.status(500).json({
   success:false,
   error:error.message
  })

 }

}
