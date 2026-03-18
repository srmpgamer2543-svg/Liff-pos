export default async function handler(req, res) {

  console.log("=== WEBHOOK START ===")

  if (req.method !== "POST") {
    return res.status(405).end()
  }

  // ======================
  // 🔥 NEW: FORMAT MODIFIER (Apple Receipt)
  // ======================
  function formatModifiers(modifiers){

    if(!modifiers) return { type:"-", sweet:"-", toppings:"-" }

    let type = ""
    let sweet = ""
    let toppingMap = {}

    Object.entries(modifiers).forEach(([group, arr])=>{

      arr.forEach(m=>{

        const name = typeof m === "object" ? m.name : m

        if(name.includes("เย็น") || name.includes("ปั่น")){
          type = name
        }

        else if(name.includes("หวาน")){
          sweet = name
        }

        else{
          toppingMap[name] = (toppingMap[name] || 0) + 1
        }

      })

    })

    const toppings = Object.entries(toppingMap)
      .map(([k,v])=> v > 1 ? `${k} x${v}` : k)
      .join(", ")

    return {
      type: type || "-",
      sweet: sweet || "-",
      toppings: toppings || "-"
    }
  }

  try {

    const raw = await new Promise((resolve) => {
      let data = ""
      req.on("data", chunk => data += chunk)
      req.on("end", () => resolve(data))
    })

    let body = {}

    try {
      body = JSON.parse(raw || "{}")
    } catch (e) {
      body = {}
    }

    const events = body.events || []

    for (const event of events) {

      // ======================
      // 🔥 MESSAGE HANDLER
      // ======================
      if (event.type === "message" && event.message.type === "text") {

        const text = event.message.text || ""
        const userId = event.source.userId

        if (text.includes("ตรวจสอบสถานะออเดอร์")) {

          const orderRes = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/orders?line_user_id=eq.${userId}&order=created_at.desc&limit=1`,
            {
              headers: {
                apikey: process.env.SUPABASE_KEY,
                Authorization: `Bearer ${process.env.SUPABASE_KEY}`
              }
            }
          )

          const orderData = await orderRes.json()
          const order = orderData?.[0]

          if (!order) {

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
                    { type: "text", text: "ไม่พบออเดอร์" }
                  ]
                })
              }
            )

            continue
          }

          const orderId = order.id

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

          // ======================
          // 🔥 NEW FLEX (Apple Receipt)
          // ======================

          const contents = itemsData.flatMap(i => {

            const f = formatModifiers(i.modifiers)

            return [

              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: i.name,
                    weight: "bold",
                    size: "sm",
                    flex: 4
                  },
                  {
                    type: "text",
                    text: `฿${i.price}`,
                    align: "end",
                    size: "sm",
                    flex: 2
                  }
                ]
              },

              {
                type: "text",
                text: f.type,
                size: "xs",
                color: "#888888",
                margin: "xs"
              },

              {
                type: "text",
                text: f.sweet,
                size: "xs",
                color: "#888888"
              },

              {
                type: "text",
                text: f.toppings,
                size: "xs",
                color: "#888888"
              },

              {
                type: "separator",
                margin: "md"
              }

            ]

          })

          const total = itemsData.reduce((sum,i)=> sum + Number(i.price),0)

          const flex = {
            type: "flex",
            altText: `สถานะออเดอร์ #${orderId}`,
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
                    text: `สถานะ: ${order.status}`,
                    weight: "bold"
                  },

                  {
                    type: "separator",
                    margin: "md"
                  },

                  ...contents,

                  {
                    type: "box",
                    layout: "horizontal",
                    margin: "lg",
                    contents: [
                      {
                        type: "text",
                        text: "รวมทั้งหมด",
                        weight: "bold",
                        size: "sm"
                      },
                      {
                        type: "text",
                        text: `฿${total}`,
                        weight: "bold",
                        size: "sm",
                        align: "end"
                      }
                    ]
                  }

                ]
              }
            }
          }

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
                messages: [flex]
              })
            }
          )

        }

      }

      // ======================
      // 🔥 POSTBACK (เดิม ไม่แตะ)
      // ======================
      if (event.type === "postback") {

        const data = event.postback.data
        const params = new URLSearchParams(data)

        const action = params.get("action")
        const orderId = Number(params.get("order_id"))

        if (!orderId) continue

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

        await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`,
          {
            method: "PATCH",
            headers: {
              apikey: process.env.SUPABASE_KEY,
              Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: newStatus })
          }
        )

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
