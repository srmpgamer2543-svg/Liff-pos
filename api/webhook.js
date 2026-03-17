export default async function handler(req, res) {

 console.log("=== WEBHOOK START ===")

 if (req.method !== "POST") {
  return res.status(405).end()
 }

 try {

  const body = req.body

  console.log("📩 BODY:", JSON.stringify(body))

  const events = body.events || []

  for (const event of events) {

   // =========================
   // ✅ กรณีกดปุ่ม (postback)
   // =========================
   if (event.type === "postback") {

    const data = event.postback.data
    const userId = event.source.userId

    console.log("👉 POSTBACK:", data)

    // parse data
    const params = new URLSearchParams(data)
    const action = params.get("action")
    const orderId = params.get("order_id")

    console.log("👉 action:", action)
    console.log("👉 orderId:", orderId)

    // =========================
    // ✅ อัปเดตสถานะใน Supabase
    // =========================

    let newStatus = "pending"

    if (action === "accept") newStatus = "accepted"
    if (action === "done") newStatus = "done"

    await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`,
      {
        method: "PATCH",
        headers: {
          apikey: process.env.SUPABASE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus
        })
      }
    )

    console.log("✅ UPDATED STATUS:", newStatus)

    // =========================
    // ✅ ดึง line_user_id ของลูกค้า
    // =========================

    const orderRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=line_user_id`,
      {
        headers: {
          apikey: process.env.SUPABASE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_KEY}`
        }
      }
    )

    const orderData = await orderRes.json()

    const customerId = orderData?.[0]?.line_user_id

    console.log("👤 customerId:", customerId)

    // =========================
    // ✅ ยิงกลับลูกค้า
    // =========================

    if (customerId) {

      let msg = "📦 อัปเดตออเดอร์"

      if (action === "accept") {
        msg = "✅ ร้านรับออเดอร์แล้ว กำลังทำให้ครับ"
      }

      if (action === "done") {
        msg = "🎉 ออเดอร์เสร็จแล้ว มารับได้เลยครับ"
      }

      await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.LINE_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          to: customerId,
          messages: [
            {
              type: "text",
              text: msg
            }
          ]
        })
      })

      console.log("📤 SENT TO CUSTOMER")
    }

    // =========================
    // ✅ ตอบกลับร้าน (reply)
    // =========================

    await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LINE_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        replyToken: event.replyToken,
        messages: [
          {
            type: "text",
            text: `อัปเดตสถานะเป็น ${newStatus} แล้ว`
          }
        ]
      })
    })

  }

 }

 res.status(200).end()

 } catch (err) {

  console.log("🔥 ERROR:", err)
  res.status(500).end()

 }

}
