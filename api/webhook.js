module.exports = async function handler(req, res) {

  console.log("=== WEBHOOK START ===")

  if (req.method !== "POST") {
    return res.status(405).end()
  }

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

    return { type, sweet, toppings: toppingMap }
  }

  function parseThaiDate(text){

    const monthMap = {
      "มกราคม":1,"กุมภาพันธ์":2,"มีนาคม":3,"เมษายน":4,
      "พฤษภาคม":5,"มิถุนายน":6,"กรกฎาคม":7,"สิงหาคม":8,
      "กันยายน":9,"ตุลาคม":10,"พฤศจิกายน":11,"ธันวาคม":12
    }

    let match = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
    if(match){
      let day = match[1]
      let month = match[2]
      let year = match[3]

      if(year.length === 2) year = "25" + year

      return `${year}-${month.padStart(2,"0")}-${day.padStart(2,"0")}`
    }

    match = text.match(/(\d{1,2})\s*(\S+)\s*(\d{2,4})/)
    if(match){
      let day = match[1]
      let monthName = match[2]
      let year = match[3]

      const month = monthMap[monthName]
      if(!month) return null

      if(year.length === 2) year = "25" + year

      return `${year}-${String(month).padStart(2,"0")}-${day.padStart(2,"0")}`
    }

    return null
  }

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
          { type:"text", text: line, wrap:true, size:"sm" },
          { type:"text", text:`${item.price * item.qty} บาท`, align:"end", weight:"bold", size:"sm" }
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
    const processedEvents = new Set()

    for (const event of events) {

      if (processedEvents.has(event.replyToken)) continue
      processedEvents.add(event.replyToken)

      // ✅ FIX: define text safely
      const text = event?.message?.text || ""

      // ======================
      // MESSAGE
      // ======================
      if (event.type === "message" && event.message.type === "text") {

        const userId = event.source.userId

        // ======================
        // ตรวจสอบสถานะออเดอร์
        // ======================
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

        // ======================
        // สรุปยอด
        // ======================
        if (text.includes("สรุปยอด")) {

          let start = ""
          let end = ""
          let label = ""

          const now = new Date()

          function formatLocal(date){
            const y = date.getFullYear()
            const m = String(date.getMonth() + 1).padStart(2, "0")
            const d = String(date.getDate()).padStart(2, "0")
            const h = String(date.getHours()).padStart(2, "0")
            const mi = String(date.getMinutes()).padStart(2, "0")
            const s = String(date.getSeconds()).padStart(2, "0")
            return `${y}-${m}-${d}T${h}:${mi}:${s}`
          }

          if (text.includes("รายปี")) {

            const year = now.getFullYear()
            const first = new Date(year, 0, 1, 0, 0, 0)
            const last = new Date(year, 11, 31, 23, 59, 59)

            start = formatLocal(first)
            end = formatLocal(last)
            label = `ปี ${year}`
          }

          else if (text.includes("รายเดือน")) {

            const year = now.getFullYear()
            const month = now.getMonth()

            const first = new Date(year, month, 1, 0, 0, 0)
            const last = new Date(year, month + 1, 0, 23, 59, 59)

            start = formatLocal(first)
            end = formatLocal(last)

            const mDisplay = String(month + 1).padStart(2, "0")
            label = `เดือน ${mDisplay}/${year}`
          }

          else if (text.includes("รายสัปดาห์")) {

            const first = new Date()
            first.setHours(0,0,0,0)
            first.setDate(first.getDate() - first.getDay())

            const last = new Date(first)
            last.setDate(first.getDate() + 6)
            last.setHours(23,59,59,999)

            start = formatLocal(first)
            end = formatLocal(last)
            label = "สัปดาห์นี้"
          }

          else {

            const date = parseThaiDate(text)

            if (!date) {
              await fetch("https://api.line.me/v2/bot/message/reply",{
                method:"POST",
                headers:{
                  "Content-Type":"application/json",
                  Authorization:`Bearer ${process.env.LINE_ACCESS_TOKEN}`
                },
                body:JSON.stringify({
                  replyToken:event.replyToken,
                  messages:[{ type:"text", text:"❌ กรุณาระบุวันที่ เช่น 20/3/69 หรือ 20 มีนาคม 69" }]
                })
              })
              continue
            }

            start = `${date}T00:00:00`
            end = `${date}T23:59:59`
            label = date
          }

          const orderRes = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/orders?created_at=gte.${start}&created_at=lte.${end}`,
            {
              headers:{
                apikey:process.env.SUPABASE_KEY,
                Authorization:`Bearer ${process.env.SUPABASE_KEY}`
              }
            }
          )

          const orders = await orderRes.json()

          let total = 0
          let count = 0

          orders.forEach(o=>{
            total += Number(o.total || 0)
            count++
          })

          await fetch("https://api.line.me/v2/bot/message/reply",{
            method:"POST",
            headers:{
              "Content-Type":"application/json",
              Authorization:`Bearer ${process.env.LINE_ACCESS_TOKEN}`
            },
            body:JSON.stringify({
              replyToken:event.replyToken,
              messages:[{
                type:"text",
                text:`📊 สรุปยอด${label}\n💰 ${total} บาท\n🧾 ${count} ออเดอร์`
              }]
            })
          })
        }
      }

      // 🔥 แทนของเดิมทั้งหมดใน postback ส่วนนี้

// ======================
// POSTBACK HANDLER
// ======================
if (event.type === "postback") {

  const params = new URLSearchParams(event.postback.data)

  const action = params.get("action")
  const orderId = Number(params.get("order_id"))

  if (!orderId) continue

  let newStatus = "pending"
  let statusText = ""
  let statusColor = "#FF9500"

  if (action === "accept") {
    newStatus = "preparing"
    statusText = "ร้านกำลังเตรียมเครื่องดื่มของคุณ 🧑‍🍳"
    statusColor = "#FF9500"
  }

  if (action === "done") {
    newStatus = "completed"
    statusText = "ออเดอร์ของคุณลูกค้าเสร็จแล้ว 🎉"
    statusColor = "#34C759"
  }

  // ✅ UPDATE STATUS
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

  // ✅ ดึง ORDER เต็ม (แก้ตรงนี้)
  const orderRes = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`,
    {
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`
      }
    }
  )

  const orderData = await orderRes.json()
  const order = orderData?.[0]

  console.log("🧾 ORDER FULL:", order)

  if (!order || !order.line_user_id) {
    console.log("❌ ไม่มี customerId ส่งไม่ได้")
    continue
  }

  const customerId = order.line_user_id

  // ✅ ดึง items
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

  const flex = buildOrderFlex(orderId, statusText, statusColor, itemsData, order.total)

        await fetch(
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
      }
    }

  const pushText = await pushRes.text()
  console.log("📤 PUSH STATUS:", pushRes.status, pushText)
}
      }
    }

    res.status(200).end()

  } catch (err) {
    console.log("🔥 ERROR:", err)
    res.status(500).end()
  }
            }
