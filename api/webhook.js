export default async function handler(req, res) {

  if (req.method === "POST") {
    const body = req.body;

    console.log("LINE EVENT:", JSON.stringify(body, null, 2));

    if (body.events && body.events.length > 0) {
      const event = body.events[0];

      if (event.source && event.source.groupId) {
        console.log("GROUP ID:", event.source.groupId);
      }
    }

    return res.status(200).json({ status: "ok" });
  }

  res.status(200).json({ message: "Webhook Ready" });
}
