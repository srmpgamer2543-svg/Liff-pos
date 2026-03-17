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
// ✅ BUILD FLEX MESSAGE
// =========================

const orderId = body[0]?.order_id || ""

// รวมรายการ
let itemsText = ""
let total = 0

body.forEach(item=>{

 const price = Number(item.price || 0)
 total += price

 itemsText += `• ${item.name} (฿${price})\n`

 if(item.modifiers){

  Object.values(item.modifiers).forEach(arr=>{
   arr.forEach(m=>{
    const name = typeof m === "object" ? m.name : m
    itemsText += `   - ${name}\n`
   })
  })

 }

})

// FLEX
const flex = {
 type: "flex",
 altText: "มีออเดอร์ใหม่",
 contents: {
  type: "bubble",
  size: "mega",
  body: {
   type: "box",
   layout: "vertical",
   contents: [

    {
     type: "text",
     text: "🧾 ออเดอร์ใหม่",
     weight: "bold",
     size: "xl"
    },

    {
     type: "text",
     text: `Order ID: ${orderId}`,
     size: "sm",
     color: "#888888"
    },

    {
     type: "separator",
     margin: "md"
    },

    {
     type: "text",
     text: itemsText,
     wrap: true,
     size: "sm",
     margin: "md"
    },

    {
     type: "separator",
     margin: "md"
    },

    {
     type: "text",
     text: `รวม ${total} บาท`,
     weight: "bold",
     size: "lg",
     margin: "md"
    }

   ]
  },

  footer: {
   type: "box",
   layout: "vertical",
   spacing: "sm",
   contents: [

    {
     type: "button",
     style: "primary",
     color: "#16a34a",
     action: {
      type: "postback",
      label: "รับออเดอร์",
      data: `action=accept&order_id=${orderId}`
     }
    },

    {
     type: "button",
     style: "secondary",
     action: {
      type: "postback",
      label: "ทำเสร็จแล้ว",
      data: `action=done&order_id=${orderId}`
     }
    }

   ]
  }

 }
}
