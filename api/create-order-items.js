export default async function handler(req,res){

 console.log("=== START create-order-items ===")

 if(req.method!=="POST"){
  console.log("❌ METHOD NOT ALLOWED:", req.method)
  return res.status(405).end()
 }

 try{

  const body = req.body

  console.log("📦 BODY:", JSON.stringify(body))

  // ✅ insert items ลง supabase
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

  // =========================
  // ✅ BUILD LINE MESSAGE
  // =========================

  let message = "🧾 ออเดอร์ใหม่\n\n"

  let total = 0

  body.forEach((item,index)=>{

   const name = item.name
   const price = Number(item.price || 0)

   total += price

   message += `${index+1}. ${name}\n`

   // 👉 modifiers
   if(item.modifiers){

    Object.entries(item.modifiers).forEach(([group,arr])=>{

     const modCount = {}

     arr.forEach(m=>{
      const modName = typeof m === "object" ? m.name : m
      if(!modCount[modName]) modCount[modName] = 0
      modCount[modName]++
     })

     Object.entries(modCount).forEach(([modName,count])=>{
      const qty = count > 1 ? ` x${count}` : ""
      message += `   - ${modName}${qty}\n`
     })

    })

   }

   message += `   ฿${price}\n\n`

  })

  message += `💰 รวม ${total} บาท`

  // =========================
  // ✅ SEND LINE
  // =========================

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
       text: message
      }
     ]
    })
   })

   console.log("✅ LINE SENT")

  }catch(lineErr){

   console.log("⚠️ LINE ERROR:", lineErr.message)

  }

  res.json(data)

 }catch(err){

  console.log("🔥 ERROR:", err)
  res.status(500).json({error:err.message})

 }

}
