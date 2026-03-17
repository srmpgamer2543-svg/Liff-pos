export default async function handler(req, res) {

 console.log("=== WEBHOOK START ===")

 if (req.method !== "POST") {
  return res.status(405).end()
 }

 try {

  const body = req.body
  const events = body.events || []

  for (const event of events) {

   if (event.type === "postback") {

    const data = event.postback.data
    const params = new URLSearchParams(data)

    const action = params.get("action")
    const orderId = params.get("order_id")

    console.log("👉 action:", action)

    let newStatus = "pending"
    let statusText = ""

    if (action === "accept") {
      newStatus = "preparing"
      statusText = "🧑‍🍳 กำลังเตรียมอาหาร"
    }

    if (action === "done") {
      newStatus = "completed"
      statusText = "🎉 ออเดอร์เสร็จแล้ว"
    }

    // update DB
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

    // get customer id
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

    // =========================
    // ✅ FLEX ลูกค้า (อัปเดตสถานะ)
    // =========================
    if (customerId) {

      const flex = {
        type: "flex",
        altText: `อัปเดตออเดอร์ #${orderId}`,
        contents: {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: statusText,
                weight: "bold",
                size: "xl"
              },
              {
                type: "text",
                text: `ออเดอร์ #${orderId}`,
                size: "sm",
                color: "#999"
              }
            ]
          }
        }
      }

      await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.LINE_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          to: customerId,
          messages: [flex]
        })
      })
    }

    // reply ร้าน
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
            text: `อัปเดตเป็น ${newStatus}`
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
