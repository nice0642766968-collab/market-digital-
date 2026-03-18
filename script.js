import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. Config ของคุณ
const firebaseConfig = {
  apiKey: "AIzaSyCG5BmQfLBsYlCVhFXXzcH8C6I23Jooono",
  authDomain: "market-digital2.firebaseapp.com",
  projectId: "market-digital2",
  storageBucket: "market-digital2.firebasestorage.app",
  messagingSenderId: "365477132008",
  appId: "1:365477132008:web:44fa5a6b3374ce34373b5d",
  measurementId: "G-9H1F6RLQ84"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// 2. ฟังก์ชันโหลดสินค้า
async function loadProducts(facultyName = 'ทั้งหมด') {
    const listContainer = document.getElementById('product-list');
    listContainer.innerHTML = ''; 

    let q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    if (facultyName !== 'ทั้งหมด') {
        q = query(collection(db, "products"), where("faculty", "==", facultyName));
    }

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const item = doc.data();
        listContainer.innerHTML += `
            <div class="product-card">
                <img src="${item.imageUrl}" class="w-full h-40 object-cover">
                <div class="p-3">
                    <p class="text-xs text-blue-500 font-bold">${item.faculty}</p>
                    <h3 class="font-medium text-gray-800 truncate">${item.title}</h3>
                    <p class="text-orange-600 font-bold">฿${item.price}</p>
                </div>
            </div>
        `;
    });
}

// 3. ฟังก์ชันอัปโหลดสินค้า
document.getElementById('btn-upload').addEventListener('click', async () => {
    const file = document.getElementById('p-image').files[0];
    const title = document.getElementById('p-title').value;
    const faculty = document.getElementById('p-faculty').value;

    if (!file || !title) return alert('กรุณากรอกข้อมูลให้ครบ');

    // อัปโหลดรูปไปที่ Storage
    const storageRef = ref(storage, 'products/' + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // บันทึกลง Firestore
    await addDoc(collection(db, "products"), {
        title: title,
        faculty: faculty,
        imageUrl: url,
        price: 0, // คุณสามารถเพิ่ม input รับราคาได้
        createdAt: new Date()
    });

    alert('ลงขายสำเร็จ!');
    location.reload();
});

// โหลดข้อมูลครั้งแรก
loadProducts();

// ทำให้ function เข้าถึงได้จาก HTML
window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModal = (id) => document.getElementById(id).classList.add('hidden');
window.filterByFaculty = (name) => loadProducts(name);
