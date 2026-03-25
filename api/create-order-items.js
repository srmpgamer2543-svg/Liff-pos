module.exports = async function handler(req, res) {

  console.log("=== START create-order-items ===")

  try {

    const body = req.body

    if (!Array.isArray(body) || body.length === 0) {
      return res.status(400).json({ error: "No items" })
    }

    const orderId = body[0].order_id
    const customerId = body[0].line_user_id

    // ======================
    // INSERT DB
    // ======================
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

    if (r.status >= 400) {
      const txt = await r.text()
      return res.status(500).json({ error: txt })
    }

    // ======================
    // 🔥 BUILD FLEX UNIVERSAL
    // ======================
    function buildOrderFlexUniversal(orderId, items, total){

      const merged = {}

      items.forEach(i=>{
        const key = i.name + JSON.stringify(i.modifiers || {})
        if(!merged[key]){
          merged[key] = { ...i, qty:1 }
        }else{
          merged[key].qty++
        }
      })

      const mergedItems = Object.values(merged)

      function formatMods(modifiers){

        if(!modifiers) return []

        const map = {}

        Object.values(modifiers).forEach(arr=>{
          arr.forEach(m=>{
            const name = typeof m==="object"?m.name:m
            const price = typeof m==="object"?(m.price||0):0

            if(!map[name]){
              map[name] = { count:0, price }
            }

            map[name].count++
          })
        })

        return Object.entries(map).map(([name,data])=>{
          return {
            name: name,
            qty: data.count,
            price: data.price * data.count
          }
        })
      }

      const contents = []

      mergedItems.forEach((item, index)=>{

        const mods = formatMods(item.modifiers)
        const itemTotal = item.price * item.qty

        contents.push({
          type:"box",
          layout:"horizontal",
          contents:[
            {
              type:"text",
              text:`${item.name} x${item.qty}`,
              weight:"bold",
              size:"md",
              flex:3,
              wrap:true
            },
            {
              type:"text",
              text:`${itemTotal}฿`,
              weight:"bold",
              size:"md",
              align:"end",
              flex:1
            }
          ]
        })

        mods.forEach(m=>{
          contents.push({
            type:"box",
            layout:"horizontal",
            margin:"sm",
            contents:[
              {
                type:"text",
                text:`• ${m.name}${m.qty>1?` x${m.qty}`:"-"}`,
                size:"sm",
                color:"#666666",
                flex:3,
                wrap:true
              },
              {
                type:"text",
                text: m.price > 0 ? `${m.price}.-` : "-"
                size:"sm",
                color:"#666666",
                align:"end",
                flex:1
              }
            ]
          })
        })

        if(index < mergedItems.length - 1){
          contents.push({
            type:"separator",
            margin:"md"
          })
        }

      })

      return {
        type:"flex",
        altText:`ออเดอร์ #${orderId}`,
        contents:{
          type:"bubble",
          size:"mega",
          body:{
            type:"box",
            layout:"vertical",
            spacing:"md",
            contents:[
              {
                type:"text",
                text:"🧾 ออเดอร์ใหม่",
                weight:"bold",
                size:"xl"
              },
              {
                type:"text",
                text:`#${orderId}`,
                size:"sm",
                color:"#999999"
              },
              { type:"separator" },
              ...contents,
              { type:"separator", margin:"lg" },
              {
                type:"text",
                text:`💰 รวม ${total} บาท`,
                weight:"bold",
                size:"lg",
                align:"end"
              }
            ]
          },
          footer:{
            type:"box",
            layout:"vertical",
            spacing:"sm",
            contents:[
              {
                type:"button",
                style:"primary",
                color:"#34C759",
                action:{
                  type:"postback",
                  label:"รับออเดอร์",
                  data:`action=accept&order_id=${orderId}`
                }
              },
              {
                type:"button",
                style:"secondary",
                action:{
                  type:"postback",
                  label:"ทำเสร็จแล้ว",
                  data:`action=done&order_id=${orderId}`
                }
              },
              {
                type:"button",
                style:"primary",
                color:"#007AFF",
                action:{
                  type:"uri",
                  label:"🖨️ พิมพ์ใบเสร็จ",
                  uri:`${process.env.LIFF_PRINT_URL}?order_id=${orderId}&external=1`
                }
              }
            ]
          }
        }
      }
    }

    // ======================
    // PUSH ลูกค้า
    // ======================
    if (customerId) {
      await fetch("https://api.line.me/v2/bot/message/push",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${process.env.LINE_ACCESS_TOKEN}`
        },
        body:JSON.stringify({
          to:customerId,
          messages:[
            {
              type:"text",
              text:`🧾 รับออเดอร์แล้ว #${orderId}\n⏳ รอร้านยืนยัน`
            }
          ]
        })
      })
    }

    // ======================
    // PUSH พนักงาน (FLEX)
    // ======================
    const total = body.reduce((sum,i)=>sum + i.price,0)
    const flex = buildOrderFlexUniversal(orderId, body, total)

    const pushRes = await fetch("https://api.line.me/v2/bot/message/push",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${process.env.LINE_ACCESS_TOKEN}`
      },
      body:JSON.stringify({
        to:process.env.SHOP_LINE_GROUP_ID,
        messages:[flex]
      })
    })

    const pushText = await pushRes.text()
    console.log("📤 PUSH GROUP:", pushRes.status, pushText)

    res.status(200).json({ ok: true })

  } catch (err) {

    console.log("❌ ERROR:", err)
    res.status(500).json({ error: err.message })

  }

}
