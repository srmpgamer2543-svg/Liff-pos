export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.loyverse.com/v1.0/items", {
      headers: {
        Authorization: `Bearer ${process.env.LOYVERSE_API_KEY}`
      }
    })

    const data = await response.json()

    res.status(200).json({
      success: true,
      total: data.items ? data.items.length : 0,
      data: data.items ? data.items.slice(0,5) : []
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
