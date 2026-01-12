// const API_URL = "http://localhost:5000/api/products";

// const form = document.getElementById("productForm");
// const tableBody = document.getElementById("productsTableBody");
// const formTitle = document.getElementById("formTitle");

// loadProducts();

// // Fetch Products
// async function loadProducts() {
//   const res = await fetch(API_URL);
//   const data = await res.json();
//   const products = data.products; // IMPORTANT FIX

//   tableBody.innerHTML = "";

//   products.forEach(p => {
//     const row = document.createElement("tr");

//     row.innerHTML = `
//       <td class="border p-2">${p.id}</td>
//       <td class="border p-2">${p.title}</td>
//       <td class="border p-2">₹${p.price}</td>
//       <td class="border p-2">${p.stock}</td>
//       <td class="border p-2">
//         ${
//           p.images.length > 0
//             ? `<img src="http://localhost:5000${p.images[0]}" class="w-16 rounded" />`
//             : "No Image"
//         }
//       </td>
//       <td class="border p-2">
//         <button onclick="editProduct(${p.id})"
//           class="bg-green-600 text-white px-3 py-1 rounded">Edit</button>

//         <button onclick="deleteProduct(${p.id})"
//           class="bg-red-600 text-white px-3 py-1 rounded ml-2">Delete</button>
//       </td>
//     `;

//     tableBody.appendChild(row);
//   });
// }

// // Submit Form
// form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const id = document.getElementById("productId").value;

//   const data = new FormData();
//   data.append("title", title.value);
//   data.append("description", description.value);
//   data.append("categoryId", category.value);

//   data.append("price", price.value);
//   data.append("discount", discount.value);
//   data.append("stock", stock.value);
//   data.append("availableStock", availableStock.value);
//   data.append("brand", brand.value);
//   data.append("warrantyInfo", warrantyInfo.value);
//   data.append("tags", JSON.stringify(tags.value.split(",")));

//   if (image.files[0]) data.append("image", image.files[0]);

//   const url = id ? `${API_URL}/${id}` : API_URL;
//   const method = id ? "PUT" : "POST";

//   await fetch(url, { method, body: data });

//   alert("Product saved!");

//   form.reset();
//   document.getElementById("productId").value = "";
//   formTitle.textContent = "Add Product";

//   loadProducts();
// });

// // Edit Product
// async function editProduct(id) {
//   const res = await fetch(`${API_URL}/${id}`);
//   const data = await res.json();
//   const p = data.product; // IMPORTANT FIX

//   document.getElementById("productId").value = p.id;
//   title.value = p.title;
//   description.value = p.description;
//   category.value = p.category;
//   price.value = p.price;
//   discount.value = p.discount;
//   stock.value = p.stock;
//   availableStock.value = p.availableStock;
//   brand.value = p.brand;
//   warrantyInfo.value = p.warrantyInfo;
//   tags.value = p.tags.join(",");

//   formTitle.textContent = "Edit Product";
//   window.scrollTo({ top: 0, behavior: "smooth" });
// }

// // Delete Product
// async function deleteProduct(id) {
//   if (!confirm("Are you sure you want to delete?")) return;

//   await fetch(`${API_URL}/${id}`, { method: "DELETE" });

//   loadProducts();
// }
