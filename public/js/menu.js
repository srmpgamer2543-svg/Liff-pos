async function loadMenu() {
  const res = await fetch("/api/get-menu");
  const data = await res.json();

  const menuContainer = document.getElementById("menu");
  const categoryContainer = document.getElementById("categories");

  menuContainer.innerHTML = "";
  categoryContainer.innerHTML = "";

  // จัดกลุ่มตามหมวด
  const categories = {};

  data.forEach(item => {
    const catName = item.categories?.name || "อื่นๆ";

    if (!categories[catName]) {
      categories[catName] = [];
    }

    categories[catName].push(item);
  });

  // เรียงหมวดตามเลขหน้า
  const sortedCategories = Object.keys(categories).sort();

  // ปุ่มหมวด
  const allBtn = document.createElement("button");
  allBtn.innerText = "ทั้งหมด";
  allBtn.onclick = () => renderMenu(data);
  categoryContainer.appendChild(allBtn);

  sortedCategories.forEach(cat => {
    const btn = document.createElement("button");

    // ลบเลขหน้า
    const cleanName = cat.replace(/^\d+_/, "");

    btn.innerText = cleanName;

    btn.onclick = () => {
      renderMenu(categories[cat]);
    };

    categoryContainer.appendChild(btn);
  });

  renderMenu(data);
}

function renderMenu(list) {
  const menuContainer = document.getElementById("menu");
  menuContainer.innerHTML = "";

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "menu-card";

    card.innerHTML = `
      <img src="${item.image_url || ""}" />
      <h3>${item.name}</h3>
      <p>${item.price}</p>
      <button onclick="addToCart('${item.id}')">เพิ่ม</button>
    `;

    menuContainer.appendChild(card);
  });
}

loadMenu();
