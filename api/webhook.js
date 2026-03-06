export default async function handler(req, res) {

  const event = req.body.events?.[0]

  if (!event) {
    return res.status(200).json({ ok: true })
  }

  const source = event.source

  console.log("SOURCE =", source)

  res.status(200).json({
    groupId: source.groupId,
    userId: source.userId,
    type: source.type
  })

}
