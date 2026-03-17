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

        console.log("ACTION:", action)
        console.log("ORDER:", orderId)

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
        // update status
        // ======================

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
        const customerId = orderData?.[0]?.line_user_id

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

        console.log("👤 CUSTOMER:", customerId)

        // ======================
        // push ลูกค้า
        // ======================

        if (customerId) {

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

                  // progress bar
                  {
                    type: "box",
                    layout: "horizontal",
                    margin: "md",
                    contents: [
                      {
                        type: "box",
                        layout: "vertical",
                        flex: action === "done" ? 3 : 2,
                        contents: [],
                        backgroundColor: "#34C759",
                        height: "6px"
                      },
                      {
                        type: "box",
                        layout: "vertical",
                        flex: action === "done" ? 0 : 1,
                        contents: [],
                        backgroundColor: "#dddddd",
                        height: "6px"
                      }
                    ]
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
                messages: [flex]
              })
            }
          )

          const lineText = await lineRes.text()
          console.log("📨 LINE STATUS:", lineRes.status)
          console.log("📨 LINE RESPONSE:", lineText)

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
