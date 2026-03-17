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

    // fallback user id
    if (!customerId) {
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
    }

    // =========================
    // 🧾 TEXT รายการสินค้า
    // =========================
    const itemsText = body
      .map(i => `• ${i.name} - ${i.price}฿`)
      .join("\n")

    const total = body.reduce((sum, i) => sum + Number(i.price || 0), 0)

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
              color: "#007AFF",
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

    // =========================
    // 🍏 FLEX ลูกค้า (ใหม่)
    // =========================
    const customerFlex = {
      type: "flex",
      altText: `ออเดอร์ของคุณ #${orderId}`,
      contents: {
        type: "bubble",
        size: "mega",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [
            {
              type: "text",
              text: "📦 รับออเดอร์แล้ว",
              weight: "bold",
              size: "xl",
              color: "#007AFF"
            },
            {
              type: "text",
              text: `เลขออเดอร์ #${orderId}`,
              size: "sm",
              color: "#999"
            },
            {
              type: "separator"
            },
            {
              type: "text",
              text: itemsText,
              wrap: true
            },
            {
              type: "separator"
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "รวม",
                  size: "md"
                },
                {
                  type: "text",
                  text: `${total} บาท`,
                  size: "md",
                  align: "end",
                  weight: "bold"
                }
              ]
            },
            {
              type: "text",
              text: "สถานะ: รอร้านรับออเดอร์",
              size: "sm",
              color: "#ff9500"
            }
          ]
        }
      }
    }

    // 👉 ส่งร้าน
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

    // 👉 ส่งลูกค้า (ใช้ flex ใหม่)
    if (customerId) {
      await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          to: customerId,
          messages: [customerFlex]
        })
      })
    }

    res.status(200).json({ ok: true })

  } catch (err) {
    console.log("❌ ERROR:", err)
    res.status(500).json({ error: err.message })
  }
}
