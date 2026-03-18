export default async function handler(req, res) {

  console.log("=== WEBHOOK START ===")

  if (req.method !== "POST") {
    return res.status(405).end()
  }

  // ======================
  // 🔥 NEW: FORMAT MODIFIER
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

      // ======================
      // 🔥 MESSAGE HANDLER
      // ======================
      if (event.type === "message" && event.message.type === "text") {

        const text = event.message.text || ""
        const userId = event.source.userId

        console.log("💬 TEXT:", text)

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

          console.log("📦 ORDER DATA:", orderData)

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
                    {
                      type: "text",
                      text: "ไม่พบออเดอร์"
                    }
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

          // 🔥 NEW FORMAT
          const itemsText = itemsData.map(i => {

            const f = formatModifiers(i.modifiers)

            return [
              `• ${i.name}`,
              `${f.type}`,
              `${f.sweet}`,
              `${f.toppings}`
            ].join("\n")

          }).join("\n\n")

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

        // 🔥 HEADER
        {
          type: "text",
          text: "🍹 สถานะออเดอร์",
          weight: "bold",
          size: "xl",
          color: "#FF6B00"
        },

        {
          type: "text",
          text: `#${orderId}`,
          size: "sm",
          color: "#999999"
        },

        {
          type: "separator"
        },

        // 🔥 STATUS
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

        // 🔥 รายการแบบ Apple + 2 column
        ...itemsData.map(i => {

          const f = formatModifiers(i.modifiers)

          return {
            type: "box",
            layout: "vertical",
            margin: "sm",
            contents: [

              // ชื่อเมนู
              {
                type: "text",
                text: i.name,
                weight: "bold",
                size: "md"
              },

              // type
              {
                type: "text",
                text: f.type,
                size: "sm",
                color: "#666666"
              },

              // sweet
              {
                type: "text",
                text: f.sweet,
                size: "sm",
                color: "#666666"
              },

              // topping
              {
                type: "text",
                text: f.toppings,
                size: "sm",
                color: "#666666",
                wrap: true
              }

            ]
          }

        }),

        {
          type: "separator",
          margin: "lg"
        },

        // 🔥 TOTAL (ถ้ามี total ใน DB)
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "ยอดรวม",
              weight: "bold",
              size: "md"
            },
            {
              type: "text",
              text: `${order.total || "-"} บาท`,
              align: "end",
              weight: "bold",
              size: "lg",
              color: "#FF6B00"
            }
          ]
        }

      ]
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
      // 🔥 POSTBACK (ไม่แตะ flow)
      // ======================
      if (event.type === "postback") {

        const data = event.postback.data

        const params = new URLSearchParams(data)

        const action = params.get("action")
        const orderIdRaw = params.get("order_id")

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

        // 🔥 NEW FORMAT (เหมือนด้านบน)
        const itemsText = itemsData.map(i => {

          const f = formatModifiers(i.modifiers)

          return [
            `• ${i.name}`,
            `${f.type}`,
            `${f.sweet}`,
            `${f.toppings}`
          ].join("\n")

        }).join("\n\n")

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

        }

      }

    }

    res.status(200).end()

  } catch (err) {

    console.log("🔥 ERROR:", err)
    res.status(500).end()

  }

}
