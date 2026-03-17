export default async function handler(req, res) {

 if (req.method !== "POST") {
  return res.status(405).end()
 }

 const body = req.body

 console.log("LINE EVENT:", JSON.stringify(body, null, 2))

 try{

  const events = body.events || []

  for(const ev of events){

   if(ev.type === "postback"){

    const data = ev.postback.data
    const params = new URLSearchParams(data)

    const action = params.get("action")
    const orderId = params.get("order_id")

    console.log("ACTION:", action, "ORDER:", orderId)

    if(!orderId) continue

    let status = "pending"

    if(action === "accept") status = "accepted"
    if(action === "done") status = "done"

    // ✅ update Supabase
    await fetch(
     process.env.SUPABASE_URL + "/rest/v1/orders?id=eq." + orderId,
     {
      method:"PATCH",
      headers:{
       apikey:process.env.SUPABASE_KEY,
       Authorization:`Bearer ${process.env.SUPABASE_KEY}`,
       "Content-Type":"application/json"
      },
      body: JSON.stringify({ status })
     }
    )

    console.log("✅ UPDATED STATUS:", status)

   }

  }

 }catch(err){
  console.log("🔥 ERROR:", err)
 }

 res.status(200).end()
}
