export default async function handler(req, res) {

  console.log("=== WEBHOOK START ===")

  if (req.method !== "POST") {
    return res.status(405).end()
  }

  try {

    const raw = await new Promise((resolve) => {
      let data = ""
      req.on("data", chunk => data += chunk)
      req.on("end", () => resolve(data))
    })

    console.log("RAW:", raw)

    let body = {}

    try {
      body = JSON.parse(raw || "{}")
    } catch (e) {
      console.log("❌ JSON PARSE ERROR:", e)
      body = {}
    }

    const events = body.events || []

    console.log("EVENTS:", events)

    for (const event of events) {

      if (event.type === "postback") {

        const data = event.postback.data
        const params = new URLSearchParams(data)

        const action = params.get("action")
        const orderIdRaw = params.get("order_id")

        // 🔥 FIX สำคัญ
        const orderId = Number(orderIdRaw)

        console.log("ACTION:", action)
        console.log("ORDER RAW:", orderIdRaw)
        console.log("ORDER NUMBER:", orderId)

        if (!orderId) {
          console.log("❌ orderId ไม่ถูกต้อง")
          continue
        }

        let newStatus = "pending"
        let statusText = ""

        if (action === "accept") {
          newStatus = "preparing"
          statusText = "🧑‍🍳 ร้านกำลังเตรียมเครื่องดื่มของคุณ"
        }

        if (action === "done") {
          newStatus = "completed"
          statusText = "🎉 เครื่องดื่มของคุณเสร็จแล้ว"
        }

        // ======================
        // 🔥 UPDATE STATUS (แก้แล้ว)
        // ======================

        const updateRes = await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`,
          {
            method: "PATCH",
            headers: {
              apikey: process.env.SUPABASE_KEY,
              Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=representation"
            },
            body: JSON.stringify({
              status: newStatus
            })
          }
        )

        const updateData = await updateRes.json()

        console.log("🛠 UPDATE STATUS:", updateRes.status)
        console.log("🛠 UPDATE DATA:", updateData)

        // ======================
        // get customer id
        // ======================

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

        console.log("📦 ORDER DATA:", orderData)

        const customerId = orderData?.[0]?.line_user_id

        console.log("👤 CUSTOMER ID:", customerId)

        // ======================
        // ดึงรายการสินค้า
        // ======================

        const itemsRes = await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/order_items?order_id=eq.${orderId}`,
          {
            headers: {
              apikey: process.env.SUPABASE_KEY,
              Authorization: `Bearer ${process.env.SUPABASE_KEY}`
            }
          }
        )

        const itemsData = await itemsRes.json()

        const itemsText = itemsData.map(i => {
          let mod = ""

          if (i.modifiers) {
            Object.values(i.modifiers).forEach(arr => {
              mod += arr.join(", ") + " "
            })
          }

          return `• ${i.name}\n${mod}`
        }).join("\n")

        // ======================
        // push ลูกค้า
        // ======================

        if (customerId && typeof customerId === "string") {

          const flex = {
            type: "flex",
            altText: `อัปเดตออเดอร์ #${orderId}`,
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
                    text: "🍹 สถานะออเดอร์",
                    weight: "bold",
                    size: "xl"
                  },

                  {
                    type: "text",
                    text: `#${orderId}`,
                    size: "sm",
                    color: "#aaaaaa"
                  },

                  {
                    type: "separator"
                  },

                  {
                    type: "text",
                    text: statusText,
                    weight: "bold",
                    size: "md",
                    color: action === "done" ? "#34C759" : "#FF9500"
                  },

                  {
                    type: "separator",
                    margin: "md"
                  },

                  {
                    type: "text",
                    text: "รายการ",
                    weight: "bold",
                    size: "md"
                  },

                  {
                    type: "text",
                    text: itemsText || "-",
                    wrap: true,
                    size: "sm",
                    color: "#555555"
                  }

                ]
              }
            }
          }

          console.log("📤 SENDING TO LINE USER:", customerId)

          const lineRes = await fetch(
            "https://api.line.me/v2/bot/message/push",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`
              },
              body: JSON.stringify({
                to: customerId,
                messages: [
                  flex,
                  {
                    type: "text",
                    text: `สถานะออเดอร์ #${orderId} → ${newStatus}`
                  }
                ]
              })
            }
          )

          const lineText = await lineRes.text()

          console.log("📨 LINE STATUS:", lineRes.status)
          console.log("📨 LINE RESPONSE:", lineText)

        } else {

          console.log("❌ ไม่พบ customerId → ไม่สามารถ push ได้")

        }

        // ======================
        // reply กลุ่ม
        // ======================

        await fetch(
          "https://api.line.me/v2/bot/message/reply",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
              replyToken: event.replyToken,
              messages: [
                {
                  type: "text",
                  text: `สถานะออเดอร์ ${orderId} → ${newStatus}`
                }
              ]
            })
          }
        )

      }

    }

    res.status(200).end()

  } catch (err) {

    console.log("🔥 ERROR:", err)

    res.status(500).end()

  }

}
