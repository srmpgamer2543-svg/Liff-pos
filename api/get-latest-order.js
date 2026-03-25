export default async function handler(req,res){

 const r = await fetch(
  `${process.env.SUPABASE_URL}/rest/v1/orders?status=eq.preparing&order=created_at.desc&limit=5`,
  {
    headers:{
      apikey:process.env.SUPABASE_KEY,
      Authorization:`Bearer ${process.env.SUPABASE_KEY}`
    }
  }
 )

 const orders = await r.json()

 for(const o of orders){

  const itemsRes = await fetch(
   `${process.env.SUPABASE_URL}/rest/v1/order_items?order_id=eq.${o.id}`,
   {
     headers:{
       apikey:process.env.SUPABASE_KEY,
       Authorization:`Bearer ${process.env.SUPABASE_KEY}`
     }
   }
  )

  o.items = await itemsRes.json()
 }

 res.json(orders)

}
