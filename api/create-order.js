export default async function handler(req,res){

 console.log("=== START create-order ===")

 if(req.method!=="POST"){
  console.log("❌ METHOD:", req.method)
  return res.status(405).end()
 }

 try{

  const body = req.body

  console.log("📦 BODY:", JSON.stringify(body))

  if(!body.total){
   console.log("❌ total missing")
   return res.status(400).json({error:"total is required"})
  }

  const response = await fetch(
   process.env.SUPABASE_URL + "/rest/v1/orders",
   {
    method:"POST",
    headers:{
     apikey:process.env.SUPABASE_KEY,
     Authorization:`Bearer ${process.env.SUPABASE_KEY}`,
     "Content-Type":"application/json",
     Prefer:"return=representation"
    },
    body:JSON.stringify({
     table_id: body.table_id || 1,
     total: body.total,
     status:"pending"
    })
   }
  )

  console.log("📡 STATUS:", response.status)

  const text = await response.text()
  console.log("📡 RESPONSE:", text)

  if(!response.ok){
   return res.status(500).json({error:text})
  }

  const data = JSON.parse(text)

  if(!data || !data[0]){
   console.log("❌ NO DATA RETURNED")
   return res.status(500).json({error:"No order returned"})
  }

  res.json(data[0])

 }catch(err){

  console.log("🔥 ERROR:", err)
  res.status(500).json({error:err.message})

 }

}
