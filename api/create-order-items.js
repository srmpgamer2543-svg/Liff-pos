export default async function handler(req, res) {
  console.log("=== START create-order-items ===")

  try {
    const body = req.body

    console.log("📦 BODY:", JSON.stringify(body, null, 2))

    if (!Array.isArray(body) || body.length === 0) {
      return res.status(400).json({ error: "No items" })
    }

    const orderId = body[0].order_id

    console.log("🧾 ORDER ID:", orderId)

    const insertData = body.map(i => ({
      order_id: i.order_id,
      name: i.name,
      price: i.price,
      modifiers: i.modifiers
    }))

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

    // =========================
    // 🧾 TEXT รายการสินค้า
    // =========================
    const itemsText = body
      .map(i => `• ${i.name} - ${i.price}฿`)
      .join("\n")

    // =========================
    // 🍏 FLEX ร้าน (มีปุ่ม)
    // =========================
    const shopFlex = {
      type: "flex",
      altText: `ออเดอร์ #${orderId}`,
      contents: {
        type: "bubble",
        size: "mega",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [
            { type: "text", text: "🧾 ออเดอร์ใหม่", weight: "bold", size: "xl" },
            { type: "text", text: `#${orderId}`, size: "sm", color: "#999" },
            { type: "separator" },
            { type: "text", text: itemsText, wrap: true }
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
              action: {
                type: "postback",
                label: "✅ รับออเดอร์",
                data: `action=accept&order_id=${orderId}`
              }
            },
            {
              type: "button",
              style: "secondary",
              action: {
                type: "postback",
                label: "🎉 เสร็จแล้ว",
                data: `action=done&order_id=${orderId}`
              }
            }
          ]
        }
      }
    }

    const shopId = process.env.SHOP_LINE_USER_ID

    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: shopId,
        messages: [shopFlex]
      })
    })

    res.status(200).json({ ok: true })

  } catch (err) {
    console.log("❌ ERROR:", err)
    res.status(500).json({ error: err.message })
  }
}
