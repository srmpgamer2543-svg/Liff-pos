export default async function handler(req,res){

  const { order_id } = req.query

  if(!order_id){
    return res.status(400).json({error:"missing order_id"})
  }

  // order
  const orderRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${order_id}`,
    {
      headers:{
        apikey:process.env.SUPABASE_KEY,
        Authorization:`Bearer ${process.env.SUPABASE_KEY}`
      }
    }
  )

  const orderData = await orderRes.json()
  const order = orderData[0]

  if(!order){
    return res.status(404).json({error:"not found"})
  }

  // items
  const itemsRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/order_items?order_id=eq.${order_id}`,
    {
      headers:{
        apikey:process.env.SUPABASE_KEY,
        Authorization:`Bearer ${process.env.SUPABASE_KEY}`
      }
    }
  )

  const items = await itemsRes.json()

  order.items = items

  res.json(order)
}
