export default async function handler(req,res){

 if(req.method!=="POST"){
  return res.status(405).end()
 }

 try{

  let body = req.body

  // 🔥 FIX: แปลง modifiers ให้เป็น JSON string
  body = body.map(item=>({
   ...item,
   modifiers: JSON.stringify(item.modifiers || {})
  }))

  const response = await fetch(
   process.env.SUPABASE_URL + "/rest/v1/order_items",
   {
    method:"POST",
    headers:{
     apikey:process.env.SUPABASE_KEY,
     Authorization:`Bearer ${process.env.SUPABASE_KEY}`,
     "Content-Type":"application/json",
     Prefer:"return=representation"
    },
    body:JSON.stringify(body)
   }
  )

  if(!response.ok){
   const text = await response.text()
   return res.status(500).json({error:text})
  }

  const data = await response.json()

  res.json(data)

 }catch(err){

  res.status(500).json({error:err.message})

 }

}
