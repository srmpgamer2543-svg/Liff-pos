export default async function handler(req, res) {

  console.log("=== WEBHOOK START ===")

  if (req.method !== "POST") {
    return res.status(405).end()
  }

  // ======================
  // FORMAT MODIFIER
  // ======================
  function formatModifiers(modifiers){

    if(!modifiers) return { type:"", sweet:"", toppings:{} }

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

    return {
      type,
      sweet,
      toppings: toppingMap
    }
  }

  // ======================
  // BUILD FLEX
  // ======================
  function buildOrderFlex(orderId, statusText, statusColor, itemsData, total){

    const merged = {}

    itemsData.forEach(i=>{
      const key = i.name + JSON.stringify(i.modifiers || {})
      if(!merged[key]){
        merged[key] = { ...i, qty:1 }
      }else{
        merged[key].qty++
      }
    })

    const items = Object.values(merged)

    const MAX_ITEMS = 10
    const displayItems = items.slice(0, MAX_ITEMS)

    let totalQty = 0
    const itemBlocks = []

    displayItems.forEach(item=>{

      totalQty += item.qty

      const f = formatModifiers(item.modifiers)

      const toppingsText = Object.entries(f.toppings)
        .map(([k,v])=> v>1 ? `${k} x${v}` : k)
        .join(", ")

      let line = `${item.name} x${item.qty}`

      if(f.type) line += `\n${f.type}`
      if(f.sweet) line += `\n${f.sweet}`
      if(toppingsText) line += `\n+ ${toppingsText}`

      itemBlocks.push({
        type:"box",
        layout:"vertical",
        contents:[
          {
            type:"text",
            text: line,
            wrap:true,
            size:"sm"
          },
          {
            type:"text",
            text:`${item.price * item.qty} บาท`,
            align:"end",
            weight:"bold",
            size:"sm"
          }
        ]
      })
    })

    if(items.length > MAX_ITEMS){
      itemBlocks.push({
        type:"text",
        text:`... และอีก ${items.length - MAX_ITEMS} รายการ`,
        size:"sm",
        color:"#888888"
      })
    }

    return {
      type:"flex",
      altText:`สถานะออเดอร์ #${orderId}`,
      contents:{
        type:"bubble",
        size:"mega",
        body:{
          type:"box",
          layout:"vertical",
          spacing:"md",
          contents:[

            { type:"text", text:"📋 สถานะออเดอร์", weight:"bold", size:"xl" },
            { type:"text", text:`หมายเลขออเดอร์ #${orderId}`, size:"sm", color:"#888888" },

            { type:"separator" },

            { type:"text", text:"สถานะตอนนี้", size:"sm", color:"#888888" },
            { type:"text", text:statusText, weight:"bold", color:statusColor, wrap:true },

            { type:"separator" },

            { type:"text", text:"🧋 รายการ", weight:"bold" },

            ...itemBlocks,

            {
              type:"text",
              text:`ยอดรวม ${totalQty} รายการ  ${total} บาท`,
              weight:"bold",
              size:"lg",
              align:"end"
            }
          ]
        }
      }
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
    } catch {
      body = {}
    }

    const events = body.events || []

    for (const event of events) {

      // ======================
      // MESSAGE
      // ======================
      if (event.type === "message" && event.message.type === "text") {

        const text = event.message.text || ""
        const userId = event.source.userId

        if (text.includes("ตรวจสอบสถานะออเดอร์")) {

          const orderRes = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/orders?line_user_id=eq.${userId}&order=created_at.desc&limit=1`,
            {
              headers:{
                apikey:process.env.SUPABASE_KEY,
                Authorization:`Bearer ${process.env.SUPABASE_KEY}`
              }
            }
          )

          const orderData = await orderRes.json()
          const order = orderData?.[0]
          if (!order) continue

          const orderId = order.id

          const itemsRes = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/order_items?order_id=eq.${orderId}`,
            {
              headers:{
                apikey:process.env.SUPABASE_KEY,
                Authorization:`Bearer ${process.env.SUPABASE_KEY}`
              }
            }
          )

          const itemsData = await itemsRes.json()

          let statusText = "⏳ รอร้านยืนยัน"
          let color = "#aaaaaa"

          if(order.status==="preparing"){
            statusText = "🟠 ร้านกำลังเตรียมออเดอร์ของคุณ"
            color = "#FF9500"
          }

          if(order.status==="completed"){
            statusText = "🟢 ออเดอร์ของคุณเสร็จแล้ว"
            color = "#34C759"
          }

          const flex = buildOrderFlex(orderId, statusText, color, itemsData, order.total)

          await fetch("https://api.line.me/v2/bot/message/reply",{
            method:"POST",
            headers:{
              "Content-Type":"application/json",
              Authorization:`Bearer ${process.env.LINE_ACCESS_TOKEN}`
            },
            body:JSON.stringify({
              replyToken:event.replyToken,
              messages:[flex]
            })
          })
        }
      }

      // ======================
      // POSTBACK (🔥 แก้ครบ)
      // ======================
      if (event.type === "postback") {

        const params = new URLSearchParams(event.postback.data)
        const action = params.get("action")
        const orderId = Number(params.get("order_id"))

        if (!orderId) continue

        let newStatus = "pending"
        let statusText = ""
        let color = "#FF9500"
        let replyText = ""

        if (action === "accept") {
          newStatus = "preparing"
          statusText = "🟠 ร้านกำลังเตรียมออเดอร์ของคุณ"
          color = "#FF9500"
          replyText = `✅ รับออเดอร์ #${orderId} แล้ว`
        }

        if (action === "done") {
          newStatus = "completed"
          statusText = "🟢 ออเดอร์ของคุณเสร็จแล้ว"
          color = "#34C759"
          replyText = `🎉 ออเดอร์ #${orderId} ทำเสร็จแล้ว`
        }

        // อัปเดต DB
        await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`,
          {
            method:"PATCH",
            headers:{
              apikey:process.env.SUPABASE_KEY,
              Authorization:`Bearer ${process.env.SUPABASE_KEY}`,
              "Content-Type":"application/json"
            },
            body:JSON.stringify({status:newStatus})
          }
        )

        // 🔥 reply พนักงาน
        if(replyText){
          await fetch("https://api.line.me/v2/bot/message/reply",{
            method:"POST",
            headers:{
              "Content-Type":"application/json",
              Authorization:`Bearer ${process.env.LINE_ACCESS_TOKEN}`
            },
            body:JSON.stringify({
              replyToken:event.replyToken,
              messages:[{ type:"text", text:replyText }]
            })
          })
        }

        // 🔥 push ลูกค้า
        const orderRes = await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`,
          {
            headers:{
              apikey:process.env.SUPABASE_KEY,
              Authorization:`Bearer ${process.env.SUPABASE_KEY}`
            }
          }
        )

        const orderData = await orderRes.json()
        const order = orderData?.[0]
        const customerId = order?.line_user_id

        if (customerId) {

          const itemsRes = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/order_items?order_id=eq.${orderId}`,
            {
              headers:{
                apikey:process.env.SUPABASE_KEY,
                Authorization:`Bearer ${process.env.SUPABASE_KEY}`
              }
            }
          )

          const itemsData = await itemsRes.json()

          const flex = buildOrderFlex(orderId, statusText, color, itemsData, order.total)

          await fetch("https://api.line.me/v2/bot/message/push",{
            method:"POST",
            headers:{
              "Content-Type":"application/json",
              Authorization:`Bearer ${process.env.LINE_ACCESS_TOKEN}`
            },
            body:JSON.stringify({
              to:customerId,
              messages:[flex]
            })
          })
        }
      }
    }

    res.status(200).end()

  } catch (err) {
    console.log("🔥 ERROR:", err)
    res.status(500).end()
  }
}
