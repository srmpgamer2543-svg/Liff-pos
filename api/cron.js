export default async function handler(req, res) {

  const response = await fetch(
    `${process.env.VERCEL_URL}/api/sync-menu`
  )

  const data = await response.json()

  res.json({
    success: true,
    result: data
  })

}
