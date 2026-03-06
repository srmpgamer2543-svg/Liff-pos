export default async function handler(req, res) {

  const accessToken = process.env.LINE_ACCESS_TOKEN

  const events = req.body.events

  for (const event of events) {

    if (event.type === "message" && event.message.type === "text") {

      const replyToken = event.replyToken

      const message = {
        replyToken: replyToken,
        messages: [
          {
            type: "text",
            text: "ระบบ POS พร้อมใช้งานแล้ว"
          }
        ]
      }

      await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(message)
      })

    }

  }

  res.status(200).end()

}
