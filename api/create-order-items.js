export default async function handler(req, res) {

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
    // 🔥 FORMAT MODIFIER
    // ======================
function formatModifiers(modifiers){

  if(!modifiers) return []

  const result = []

  Object.entries(modifiers).forEach(([group, arr])=>{

    const map = {}

    arr.forEach(m=>{
      const name = typeof m === "object" ? m.name : m
      const price = typeof m === "object" ? (m.price || 0) : 0

      if(!map[name]){
        map[name] = { count:0, price }
      }

      map[name].count++
    })

    Object.entries(map).forEach(([name,data])=>{
      const qty = data.count > 1 ? ` x${data.count}` : ""
      const price = data.price ? ` (+${data.price * data.count})` : ""

      result.push(`${name}${qty}${price}`)
    })

  })

  return result
}

    // ======================
    // 🔥 MERGE ITEM
    // ======================
    function mergeItems(items){
      const merged={}
      items.forEach(i=>{
        const key=i.name+JSON.stringify(i.modifiers||{})
        if(!merged[key]){
          merged[key]={...i,qty:1}
        }else{
          merged[key].qty++
        }
      })
      return Object.values(merged)
    }

    // ======================
    // 🔥 BUILD FLEX (ใหม่)
    // ======================
    function buildStaffFlex(orderId, items){

      const LIFF_URL = process.env.LIFF_PRINT_URL

      const merged = mergeItems(items)

      const itemBlocks = merged.map(item=>{

  const mods = formatModifiers(item.modifiers)

  const totalPrice = item.price * item.qty

  let text = `${item.name} x${item.qty}`

  if(mods.length){
    text += `\n- ${mods.join("\n- ")}`
  }

  text += `\n💰 ${totalPrice} บาท`

  return {
    type:"box",
    layout:"vertical",
    contents:[
      {
        type:"text",
        text:text,
        wrap:true,
        size:"sm"
      }
    ]
  }

})

        const mods = formatModifiers(item.modifiers)

        let text = `${item.name} x${item.qty}`

        if(mods.length){
          text += `\n- ${mods.join("\n- ")}`
        }

        return {
          type:"box",
          layout:"vertical",
          contents:[
            {
              type:"text",
              text:text,
              wrap:true,
              size:"sm"
            }
          ]
        }

      })

      return {
        type:"flex",
        altText:`ออเดอร์ใหม่ #${orderId}`,
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
                color:"#888888"
              },
              { type:"separator" },
              ...itemBlocks
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
                  uri:`${LIFF_URL}?order_id=${orderId}&external=1`
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
    // PUSH พนักงาน
    // ======================
    const flex = buildStaffFlex(orderId, body)

    await fetch("https://api.line.me/v2/bot/message/push",{
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

    res.status(200).json({ ok: true })

  } catch (err) {

    console.log("❌ ERROR:", err)
    res.status(500).json({ error: err.message })

  }

}
