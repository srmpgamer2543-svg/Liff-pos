export default async function handler(req,res){

 console.log("=== START create-order-items ===")

 if(req.method!=="POST"){
  console.log("❌ METHOD NOT ALLOWED:", req.method)
  return res.status(405).end()
 }

 try{

  const body = req.body

  console.log("📦 BODY:", JSON.stringify(body))

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

  console.log("📡 STATUS:", response.status)

  const text = await response.text()
  console.log("📡 RESPONSE:", text)

  if(!response.ok){
   return res.status(500).json({error:text})
  }

  const data = JSON.parse(text)

  res.json(data)

 }catch(err){

  console.log("🔥 ERROR:", err)
  res.status(500).json({error:err.message})

 }

}
