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
 status:"pending",
 line_user_id: body.line_user_id || null // 🔥 เพิ่ม
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

  const order = data[0]

  // ✅ ส่ง LINE แจ้งเตือน
  try{
   await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
     "Authorization": `Bearer ${process.env.LINE_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
     to: "Cc6a14d049cf48d283d33bb8ee1b3873c",
     messages: [
      {
       type: "text",
       text: `🧾 ออเดอร์ใหม่\nโต๊ะ: ${order.table_id}\nยอด: ${order.total} บาท`
      }
     ]
    })
   })
   console.log("✅ LINE SENT")
  }catch(lineErr){
   console.log("⚠️ LINE ERROR:", lineErr.message)
  }

  res.json(order)

 }catch(err){

  console.log("🔥 ERROR:", err)
  res.status(500).json({error:err.message})

 }

}
