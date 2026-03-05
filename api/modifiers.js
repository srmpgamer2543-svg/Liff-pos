export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.loyverse.com/v1.0/modifiers", {
      headers: {
        Authorization: `Bearer ${process.env.LOYVERSE_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    const modifiers = data.modifiers.map(group => ({
      id: group.id,
      name: group.name,
      options: group.modifier_options.map(opt => ({
        id: opt.id,
        name: opt.name,
        price: opt.price
      }))
    }));

    res.status(200).json(modifiers);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
