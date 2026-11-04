
const STORAGE_KEY = "bloodledger_students_v1";

const demoStudents = [
    { id: 1, name: "Andi Saputra", fee: 10000, paid: true },
    { id: 2, name: "Budi Pratama", fee: 10000, paid: false },
    { id: 3, name: "Citra Amelia", fee: 10000, paid: true },
    { id: 4, name: "Dimas Ramadhan", fee: 10000, paid: false },
    { id: 5, name: "Siti Aulia", fee: 10000, paid: true }
];

let students = loadStudents();

const form = document.getElementById("studentForm");
const nameInput = document.getElementById("studentName");
const feeInput = document.getElementById("studentFee");
const table = document.getElementById("studentTable");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const emptyState = document.getElementById("emptyState");

// Membaca data yang tersimpan
function loadStudents() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        return saved
            ? JSON.parse(saved)
            : demoStudents.map(student => ({ ...student }));
    } catch (error) {
        return demoStudents.map(student => ({ ...student }));
    }
}

// Menyimpan data ke browser
function saveStudents() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(students)
    );
}

// Mengubah angka menjadi format Rupiah
function rupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);
}

// Menghitung ringkasan kas
function updateSummary() {
    const paidStudents = students.filter(
        student => student.paid
    );

    const total = paidStudents.reduce(
        (sum, student) => sum + Number(student.fee),
        0
    );

    document.getElementById("totalCollected").textContent =
        rupiah(total);

    document.getElementById("paidCount").textContent =
        `${paidStudents.length} siswa`;

    document.getElementById("unpaidCount").textContent =
        `${students.length - paidStudents.length} siswa`;

    const fee = students.length
        ? students[0].fee
        : Number(feeInput.value || 10000);

    document.getElementById("feeLabel").textContent =
        rupiah(fee);
}

// Menampilkan data siswa di tabel
function renderStudents() {
    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    const filter = statusFilter.value;

    const filteredStudents = students.filter(student => {
        const matchesName = student.name
            .toLowerCase()
            .includes(keyword);

        const matchesStatus =
            filter === "all" ||
            (filter === "paid" && student.paid) ||
            (filter === "unpaid" && !student.paid);

        return matchesName && matchesStatus;
    });

    table.replaceChildren();

    emptyState.hidden = filteredStudents.length > 0;

    if (students.length === 0) {
        emptyState.textContent =
            "Belum ada data. Tambahkan nama siswa.";
    } else if (filteredStudents.length === 0) {
        emptyState.textContent =
            "Data siswa tidak ditemukan.";
    }

    filteredStudents.forEach((student, index) => {
        const row = document.createElement("tr");

        const numberCell = document.createElement("td");
        numberCell.textContent = String(index + 1)
            .padStart(2, "0");

        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;

        const feeCell = document.createElement("td");
        feeCell.textContent = rupiah(Number(student.fee));

        const statusCell = document.createElement("td");
        const status = document.createElement("span");

        status.className = student.paid
            ? "status-pill paid"
            : "status-pill unpaid";

        status.textContent = student.paid
            ? "✓ LUNAS"
            : "BELUM BAYAR";

        statusCell.appendChild(status);

        const actionCell = document.createElement("td");
        const actionGroup = document.createElement("div");
        actionGroup.className = "action-group";

        // Tombol mengubah status pembayaran
        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = student.paid
            ? "small-button"
            : "small-button mark";

        toggleButton.textContent = student.paid
            ? "Batalkan"
            : "Tandai lunas";

        toggleButton.addEventListener("click", () => {
            student.paid = !student.paid;
            saveStudents();
            renderStudents();
        });

        // Tombol menghapus siswa
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "small-button";
        deleteButton.textContent = "Hapus";

        deleteButton.addEventListener("click", () => {
            const yakin = confirm(
                `Hapus data ${student.name}?`
            );

            if (yakin) {
                students = students.filter(
                    item => item.id !== student.id
                );

                saveStudents();
                renderStudents();
            }
        });

        actionGroup.append(toggleButton, deleteButton);
        actionCell.appendChild(actionGroup);

        row.append(
            numberCell,
            nameCell,
            feeCell,
            statusCell,
            actionCell
        );

        table.appendChild(row);
    });

    updateSummary();
}

// Menambahkan siswa baru
form.addEventListener("submit", event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const fee = Number(feeInput.value);

    if (!name) {
        alert("Nama siswa harus diisi!");
        return;
    }

    if (!Number.isFinite(fee) || fee < 1000) {
        alert("Nominal kas minimal Rp1.000!");
        return;
    }

    const alreadyExists = students.some(
        student =>
            student.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
        alert("Nama siswa sudah terdaftar!");
        return;
    }

    students.push({
        id: Date.now(),
        name: name,
        fee: fee,
        paid: false
    });

    saveStudents();

    form.reset();
    feeInput.value = 10000;
    searchInput.value = "";
    statusFilter.value = "all";

    renderStudents();
    nameInput.focus();
});

// Fitur pencarian dan filter
searchInput.addEventListener("input", renderStudents);
statusFilter.addEventListener("change", renderStudents);

// Mengembalikan data demo
document.getElementById("resetButton")
    .addEventListener("click", () => {
        const yakin = confirm(
            "Kembalikan data ke daftar demo awal?"
        );

        if (yakin) {
            students = demoStudents.map(
                student => ({ ...student })
            );

            saveStudents();

            searchInput.value = "";
            statusFilter.value = "all";

            renderStudents();
        }
    });

// Menampilkan data saat halaman dibuka
renderStudents();
