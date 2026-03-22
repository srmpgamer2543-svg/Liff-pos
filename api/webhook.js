export default async function handler(req, res) {

  console.log("=== WEBHOOK START ===")

  if (req.method !== "POST") {
    return res.status(405).end()
  }

  // ======================
  // 📅 PARSE THAI DATE
  // ======================
  function parseThaiDate(text){

    const months = {
      "มกราคม":0,"กุมภาพันธ์":1,"มีนาคม":2,"เมษายน":3,
      "พฤษภาคม":4,"มิถุนายน":5,"กรกฎาคม":6,"สิงหาคม":7,
      "กันยายน":8,"ตุลาคม":9,"พฤศจิกายน":10,"ธันวาคม":11
    }

    // format: 20 มีนาคม 69
    const thaiMatch = text.match(/(\d{1,2})\s*(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s*(\d{2,4})/)

    if(thaiMatch){
      let day = Number(thaiMatch[1])
      let month = months[thaiMatch[2]]
      let year = Number(thaiMatch[3])

      if(year < 100) year += 2500 // พ.ศ.
      year -= 543 // convert to ค.ศ.

      const d = new Date(year, month, day)
      d.setHours(0,0,0,0)

      return d.toISOString()
    }

    // format: 20/03/69
    const slashMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)

    if(slashMatch){
      let day = Number(slashMatch[1])
      let month = Number(slashMatch[2]) - 1
      let year = Number(slashMatch[3])

      if(year < 100) year += 2500
      year -= 543

      const d = new Date(year, month, day)
      d.setHours(0,0,0,0)

      return d.toISOString()
    }

    return null
  }

  // ======================
  // 📆 RANGE AUTO
  // ======================
  function getStartDate(keyword){

    const now = new Date()

    if(keyword.includes("รายวัน")){
      now.setHours(0,0,0,0)
      return now.toISOString()
    }

    if(keyword.includes("รายสัปดาห์")){
      const day = now.getDay() || 7
      if(day !== 1){
        now.setHours(-24 * (day - 1))
      }
      now.setHours(0,0,0,0)
      return now.toISOString()
    }

    if(keyword.includes("รายเดือน")){
      now.setDate(1)
      now.setHours(0,0,0,0)
      return now.toISOString()
    }

    if(keyword.includes("รายปี")){
      now.setMonth(0,1)
      now.setHours(0,0,0,0)
      return now.toISOString()
    }

    return null
  }

  // ======================
  // 💰 GET SALES
  // ======================
  async function getSalesSummary(startDate, endDate=null){

    let url = `${process.env.SUPABASE_URL}/rest/v1/orders?status=eq.completed&created_at=gte.${startDate}`

    if(endDate){
      url += `&created_at=lt.${endDate}`
    }

    const r = await fetch(url,{
      headers:{
        apikey:process.env.SUPABASE_KEY,
        Authorization:`Bearer ${process.env.SUPABASE_KEY}`
      }
    })

    const data = await r.json()

    let total = 0

    data.forEach(o=>{
      total += Number(o.total || 0)
    })

    return {
      total,
      count: data.length
    }
  }

  // ======================
  // FORMAT MODIFIER (เดิม)
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

    return { type, sweet, toppings: toppingMap }
  }

  // ======================
  // BUILD FLEX (เดิม)
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

    let totalQty = 0
    const itemBlocks = []

    items.slice(0,10).forEach(item=>{

      totalQty += item.qty

      const f = formatModifiers(item.modifiers)

      let line = `${item.name} x${item.qty}`

      if(f.type) line += `\n${f.type}`
      if(f.sweet) line += `\n${f.sweet}`

      itemBlocks.push({
        type:"box",
        layout:"vertical",
        contents:[
          { type:"text", text: line, wrap:true, size:"sm" },
          { type:"text", text:`${item.price * item.qty} บาท`, align:"end", weight:"bold", size:"sm" }
        ]
      })
    })

    return {
      type:"flex",
      altText:`สถานะออเดอร์ #${orderId}`,
      contents:{
        type:"bubble",
        body:{
          type:"box",
          layout:"vertical",
          contents:[
            { type:"text", text:`#${orderId}` },
            ...itemBlocks,
            { type:"text", text:`รวม ${total} บาท`, weight:"bold" }
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
    try { body = JSON.parse(raw || "{}") } catch {}

    const events = body.events || []

    for (const event of events) {

      if (event.type === "message" && event.message.type === "text") {

        const text = event.message.text || ""

        // ======================
        // 🔥 CHECK SALES (NEW)
        // ======================
        if(text.includes("ยอด")){

          let startDate = parseThaiDate(text)
          let endDate = null
          let label = ""

          if(startDate){
            const d = new Date(startDate)
            const next = new Date(d)
            next.setDate(d.getDate()+1)
            endDate = next.toISOString()
            label = "📅 ตามวันที่ที่เลือก"
          }else{
            startDate = getStartDate(text)
            if(text.includes("รายวัน")) label="📅 รายวัน"
            if(text.includes("รายสัปดาห์")) label="📆 รายสัปดาห์"
            if(text.includes("รายเดือน")) label="🗓 รายเดือน"
            if(text.includes("รายปี")) label="📊 รายปี"
          }

          if(startDate){

            const summary = await getSalesSummary(startDate,endDate)

            const msg =
`📊 สรุปยอดขาย ${label}
💰 ${summary.total} บาท
🧾 ${summary.count} ออเดอร์`

            await fetch("https://api.line.me/v2/bot/message/reply",{
              method:"POST",
              headers:{
                "Content-Type":"application/json",
                Authorization:`Bearer ${process.env.LINE_ACCESS_TOKEN}`
              },
              body:JSON.stringify({
                replyToken:event.replyToken,
                messages:[{type:"text",text:msg}]
              })
            })

            await fetch("https://api.line.me/v2/bot/message/push",{
              method:"POST",
              headers:{
                "Content-Type":"application/json",
                Authorization:`Bearer ${process.env.LINE_ACCESS_TOKEN}`
              },
              body:JSON.stringify({
                to:process.env.SHOP_LINE_GROUP_ID,
                messages:[{type:"text",text:msg}]
              })
            })

            continue
          }
        }

        // ======================
        // ของเดิม
        // ======================
        if (text.includes("ตรวจสอบสถานะออเดอร์")) {

          const orderRes = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/orders?order=created_at.desc&limit=1`,
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

          const itemsRes = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/order_items?order_id=eq.${order.id}`,
            {
              headers:{
                apikey:process.env.SUPABASE_KEY,
                Authorization:`Bearer ${process.env.SUPABASE_KEY}`
              }
            }
          )

          const itemsData = await itemsRes.json()

          const flex = buildOrderFlex(order.id,"","",itemsData,order.total)

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
    }

    res.status(200).end()

  } catch (err) {
    console.log("🔥 ERROR:", err)
    res.status(500).end()
  }
}
