export default async function handler(req, res) {

  const API_KEY = process.env.LOYVERSE_API_KEY;

  const headers = {
    Authorization: `Bearer ${API_KEY}`
  };

  try {

    const [items, categories, modifierGroups, modifiers] = await Promise.all([
      fetch("https://api.loyverse.com/v1.0/items", { headers }),
      fetch("https://api.loyverse.com/v1.0/categories", { headers }),
      fetch("https://api.loyverse.com/v1.0/modifier_groups", { headers }),
      fetch("https://api.loyverse.com/v1.0/modifiers", { headers })
    ]);

    const itemsData = await items.json();
    const categoriesData = await categories.json();
    const modifierGroupsData = await modifierGroups.json();
    const modifiersData = await modifiers.json();

    res.status(200).json({
      items: itemsData,
      categories: categoriesData,
      modifier_groups: modifierGroupsData,
      modifiers: modifiersData
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

}
