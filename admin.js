let products = [];
let currentUser = null;

// DOM Elements
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const adminEmailDisplay = document.getElementById('adminEmailDisplay');

const tableBody = document.getElementById('productsTableBody');
const tableLoading = document.getElementById('tableLoading');
const tableEmpty = document.getElementById('tableEmpty');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');

const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');
const saveBtn = document.getElementById('saveBtn');

const toast = document.getElementById('adminToast');
const toastMsg = document.getElementById('toastMsg');
const toastIcon = document.getElementById('toastIcon');

// Initialize Auth
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    currentUser = session.user;
    adminEmailDisplay.textContent = currentUser.email;
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    loadProducts();
  } else {
    currentUser = null;
    loginView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
  }
});

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.add('hidden');
  loginBtn.textContent = 'Kirilmoqda...';
  loginBtn.disabled = true;

  const { error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  });

  if (error) {
    loginError.textContent = 'Xatolik: ' + error.message;
    loginError.classList.remove('hidden');
  }

  loginBtn.textContent = 'Tizimga kirish';
  loginBtn.disabled = false;
});

// Logout
async function logoutAdmin() {
  await supabase.auth.signOut();
}

// Load Products
async function loadProducts() {
  tableLoading.classList.remove('hidden');
  tableEmpty.classList.add('hidden');
  tableBody.innerHTML = '';

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  tableLoading.classList.add('hidden');

  if (error) {
    showToast('Xatolik: ' + error.message, true);
    return;
  }

  products = data;
  renderTable();
  updateStats();
}

// Render Table
function renderTable() {
  const query = searchInput.value.toLowerCase();
  const category = filterCategory.value;

  const filtered = products.filter(p => {
    const matchesSearch = p.number.toLowerCase().includes(query) || p.raw.toLowerCase().includes(query);
    const matchesCategory = category === 'all' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  tableBody.innerHTML = filtered.map(p => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="px-6 py-4">
        <div class="font-bold text-slate-800 text-base">${p.number}</div>
        <div class="text-xs text-slate-500 font-mono mt-0.5">ID: ${p.id.length > 8 ? p.id.substring(0,8)+'...' : p.id}</div>
      </td>
      <td class="px-6 py-4">
        <div class="font-bold text-blue-600">${parseFloat(p.price).toLocaleString('uz-UZ')} so'm</div>
        <div class="text-xs text-slate-400">≈ $${p.price_usd}</div>
      </td>
      <td class="px-6 py-4">
        <span class="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600">${p.category}</span>
        <div class="text-xs text-slate-500 mt-1">${p.operator}</div>
      </td>
      <td class="px-6 py-4">
        ${p.is_active
          ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Faol</span>'
          : '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Yashirin</span>'}
      </td>
      <td class="px-6 py-4 text-right">
        <button onclick="editProduct('${p.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><span class="material-symbols-outlined text-[20px]">edit</span></button>
        <button onclick="deleteProduct('${p.id}')" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"><span class="material-symbols-outlined text-[20px]">delete</span></button>
      </td>
    </tr>
  `).join('');

  if (filtered.length === 0) {
    tableEmpty.classList.remove('hidden');
  } else {
    tableEmpty.classList.add('hidden');
  }
}

// Update Stats
function updateStats() {
  document.getElementById('statTotal').textContent = products.length;
  document.getElementById('statActive').textContent = products.filter(p => p.is_active).length;
  document.getElementById('statHidden').textContent = products.filter(p => !p.is_active).length;
}

// Search and Filter Listeners
searchInput.addEventListener('input', renderTable);
filterCategory.addEventListener('change', renderTable);

// Modal Functions
function openProductModal() {
  productForm.reset();
  document.getElementById('productId').value = '';
  document.getElementById('pImageUrl').value = '';
  document.getElementById('uploadStatus').textContent = '';
  modalTitle.textContent = 'Yangi mahsulot';
  productModal.classList.remove('hidden');
}

function closeProductModal() {
  productModal.classList.add('hidden');
}

function editProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  document.getElementById('productId').value = p.id;
  document.getElementById('pNumber').value = p.number;
  document.getElementById('pRaw').value = p.raw;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pPriceUsd').value = p.price_usd;
  document.getElementById('pOperator').value = p.operator;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pSeries').value = p.series;
  document.getElementById('pTier').value = p.tier;
  document.getElementById('pDescUz').value = p.desc_uz;
  document.getElementById('pDescRu').value = p.desc_ru;
  document.getElementById('pIsActive').checked = p.is_active;
  document.getElementById('pIsFeatured').checked = p.is_featured;
  document.getElementById('pImageUrl').value = p.image_url || '';

  document.getElementById('uploadStatus').textContent = p.image_url ? "Rasm mavjud (agar o'zgartirmasangiz qoladi)" : '';

  modalTitle.textContent = 'Mahsulotni tahrirlash';
  productModal.classList.remove('hidden');
}

// Save Product
async function saveProduct() {
  if (!productForm.checkValidity()) {
    productForm.reportValidity();
    return;
  }

  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Saqlanmoqda...';

  const id = document.getElementById('productId').value;
  const pData = {
    number: document.getElementById('pNumber').value,
    raw: document.getElementById('pRaw').value,
    price: document.getElementById('pPrice').value,
    price_usd: document.getElementById('pPriceUsd').value,
    operator: document.getElementById('pOperator').value,
    category: document.getElementById('pCategory').value,
    series: document.getElementById('pSeries').value,
    tier: document.getElementById('pTier').value,
    desc_uz: document.getElementById('pDescUz').value,
    desc_ru: document.getElementById('pDescRu').value,
    is_active: document.getElementById('pIsActive').checked,
    is_featured: document.getElementById('pIsFeatured').checked,
    image_url: document.getElementById('pImageUrl').value
  };

  try {
    // Check if new image selected
    const fileInput = document.getElementById('pImage');
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = Math.random().toString(36).substring(2) + '_' + Date.now() + '.' + fileExt;
      const filePath = 'products/' + fileName;

      document.getElementById('uploadStatus').textContent = 'Rasm yuklanmoqda...';
      const { data: uploadData, error: uploadError } = await supabase.storage.from('product_images').upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('product_images').getPublicUrl(filePath);
      pData.image_url = publicUrlData.publicUrl;
    }

    if (id) {
      // Update
      const { error } = await supabase.from('products').update(pData).eq('id', id);
      if (error) throw error;
      showToast('Muvaffaqiyatli yangilandi!');
    } else {
      // Insert
      const { error } = await supabase.from('products').insert([pData]);
      if (error) throw error;
      showToast("Yangi mahsulot qo'shildi!");
    }

    closeProductModal();
    loadProducts();

  } catch (err) {
    showToast('Xatolik: ' + err.message, true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Saqlash';
  }
}

// Delete Product
async function deleteProduct(id) {
  if (!confirm("Bu mahsulotni haqiqatdan ham o'chirmoqchimisiz?")) return;

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    showToast('Xatolik: ' + error.message, true);
  } else {
    showToast("Mahsulot o'chirildi!");
    loadProducts();
  }
}

// Toast
let toastTimeout;
function showToast(msg, isError = false) {
  toastMsg.textContent = msg;
  toastIcon.textContent = isError ? 'error' : 'check_circle';
  toastIcon.className = isError ? 'material-symbols-outlined text-red-400' : 'material-symbols-outlined text-emerald-400';

  toast.classList.remove('translate-y-20', 'opacity-0');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}
