export default async function handler(req, res) {

  try {

    const response = await fetch("https://api.loyverse.com/v1.0/modifier_lists", {
      headers: {
        Authorization: "Bearer " + process.env.LOYVERSE_TOKEN
      }
    });

    const data = await response.json();

    const modifiers = (data.modifier_lists || []).map(list => ({
      id: list.id,
      name: list.name,
      modifiers: (list.modifiers || []).map(m => ({
        id: m.id,
        name: m.name,
        price: Number(m.price || 0)
      }))
    }));

    res.status(200).json(modifiers);

  } catch (error) {

    res.status(500).json({
      error: "modifier api error",
      detail: error.message
    });

  }

}
