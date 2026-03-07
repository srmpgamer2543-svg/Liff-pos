export default async function handler(req, res) {

  try {

    const headers = {
      Authorization: "Bearer " + process.env.LOYVERSE_TOKEN
    };

    // ดึง modifier_lists และ modifiers
    const [listsRes, modifiersRes] = await Promise.all([
      fetch("https://api.loyverse.com/v1.0/modifier_lists", { headers }),
      fetch("https://api.loyverse.com/v1.0/modifiers", { headers })
    ]);

    const listsData = await listsRes.json();
    const modifiersData = await modifiersRes.json();

    const modifiers = modifiersData.modifiers || [];
    const lists = listsData.modifier_lists || [];

    // map modifier ตาม list
    const modifierMap = {};

    modifiers.forEach(mod => {

      if (!modifierMap[mod.modifier_list_id]) {
        modifierMap[mod.modifier_list_id] = [];
      }

      modifierMap[mod.modifier_list_id].push({
        id: mod.id,
        name: mod.name,
        price: Number(mod.price || 0)
      });

    });

    const result = lists.map(list => ({

      id: list.id,
      name: list.name,
      modifiers: modifierMap[list.id] || []

    }));

    res.status(200).json(result);

  } catch (error) {

    res.status(500).json({
      error: "modifier api error",
      detail: error.message
    });

  }

}
