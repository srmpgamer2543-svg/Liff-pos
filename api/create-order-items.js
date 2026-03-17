export default async function handler(req, res) {
  console.log("=== START create-order-items ===")

  try {
    const body = req.body

    console.log("📦 BODY:", JSON.stringify(body, null, 2))

    if (!Array.isArray(body) || body.length === 0) {
      return res.status(400).json({ error: "No items" })
    }

    const orderId = body[0].order_id
    let customerId = body[0].line_user_id || ""

    console.log("🧾 ORDER ID:", orderId)
    console.log("👤 CUSTOMER ID:", customerId)

    // ✅ FIX: ตัด line_user_id ออกจาก insert
    const insertData = body.map(i => ({
      order_id: i.order_id,
      name: i.name,
      price: i.price,
      modifiers: i.modifiers
    }))

    // 👉 INSERT order_items
    const r = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/order_items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_KEY}`
        },
        body: JSON.stringify(insertData)
      }
    )

    const txt = await r.text()
    console.log("📥 INSERT STATUS:", r.status)
    console.log("📥 INSERT RESPONSE:", txt)

    if (r.status >= 400) {
      return res.status(500).json({ error: txt })
    }

    // ✅ fallback ไปดึง user จาก orders
    if (!customerId) {
      console.log("⚠️ NO USER ID → FETCH FROM ORDER")

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
      customerId = orderData?.[0]?.line_user_id || ""

      console.log("🔁 FETCHED USER ID:", customerId)
    }

    // 🧾 สร้างข้อความ
    const itemsText = body
      .map(i => `• ${i.name} - ${i.price}฿`)
      .join("\n")

    const flex = {
      type: "flex",
      altText: `ออเดอร์ #${orderId}`,
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: `ออเดอร์ #${orderId}`, weight: "bold", size: "lg" },
            { type: "text", text: itemsText, wrap: true }
          ]
        }
      }
    }

    // 👉 ส่งร้าน
    const shopId = process.env.SHOP_LINE_USER_ID

    const r1 = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: shopId,
        messages: [flex]
      })
    })

    console.log("📨 SHOP STATUS:", r1.status)
    console.log("📨 SHOP RESP:", await r1.text())

    // 👉 ส่งลูกค้า
    if (customerId) {
      const r2 = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          to: customerId,
          messages: [{ type: "text", text: `รับออเดอร์ #${orderId} แล้ว` }]
        })
      })

      console.log("📨 CUSTOMER STATUS:", r2.status)
      console.log("📨 CUSTOMER RESP:", await r2.text())
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    console.log("❌ ERROR:", err)
    res.status(500).json({ error: err.message })
  }
}
