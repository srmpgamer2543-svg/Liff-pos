export default async function handler(req, res) {

  if (req.method === "POST") {

    const events = req.body.events;

    for (const event of events) {

      if (event.type === "message" && event.message.type === "text") {

        const replyToken = event.replyToken;

        await fetch("https://api.line.me/v2/bot/message/reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.LINE_ACCESS_TOKEN}`
          },
          body: JSON.stringify({
            replyToken: replyToken,
            messages: [
              {
                type: "text",
                text: "ระบบเชื่อมต่อสำเร็จ ✅"
              }
            ]
          })
        });

      }

    }

  }

  res.status(200).json({ status: "ok" });

}
