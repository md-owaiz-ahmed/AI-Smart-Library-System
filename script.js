let books = [];
let members = [];
let transactions = [];
let settings = {};
let editingBookId = null;
let editingMemberId = null;
let categoryChart = null;
let statusChart = null;
let trendsChart = null;
let usageComparisonChart = null;
let borrowingTrendsChart = null;
let bookActivity = [];
let readingSessions = [];
let activeSession = null;
let timerInterval = null;
let qrCodeInstance = null;
let currentQrBook = null;

document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    loadBooks();
    loadMembers();
    loadTransactions();
    loadActivityData();
    loadReadingSessions();
    initEventListeners();
    updateDashboard();
});

function initEventListeners() {
    const loginForm = document.getElementById('loginForm');
    const themeToggle = document.getElementById('themeToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const navItems = document.querySelectorAll('.nav-item');
    const addBookBtn = document.getElementById('addBookBtn');
    const bookModal = document.getElementById('bookModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const bookForm = document.getElementById('bookForm');
    const searchBooks = document.getElementById('searchBooks');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const closeQrModal = document.getElementById('closeQrModal');
    const qrModal = document.getElementById('qrModal');
    const simulateScanBtn = document.getElementById('simulateScanBtn');
    const startSessionBtn = document.getElementById('startSessionBtn');
    const endSessionBtn = document.getElementById('endSessionBtn');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const memberModal = document.getElementById('memberModal');
    const closeMemberModal = document.getElementById('closeMemberModal');
    const cancelMemberBtn = document.getElementById('cancelMemberBtn');
    const memberForm = document.getElementById('memberForm');
    const searchMembers = document.getElementById('searchMembers');
    const issueBookForm = document.getElementById('issueBookForm');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('dashboardContainer').style.display = 'flex';
        updateDashboard();
    });

    themeToggle.addEventListener('click', function() {
        document.documentElement.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
        if (categoryChart) updateCharts();
    });

    sidebarToggle.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('active');
        } else {
            sidebar.classList.toggle('collapsed');
        }
    });

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            const page = this.dataset.page;
            switchPage(page);
            
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

    addBookBtn.addEventListener('click', openAddBookModal);
    closeModal.addEventListener('click', closeBookModal);
    cancelBtn.addEventListener('click', closeBookModal);
    bookModal.addEventListener('click', function(e) {
        if (e.target === bookModal) {
            closeBookModal();
        }
    });
    bookForm.addEventListener('submit', handleBookSubmit);
    
    searchBooks.addEventListener('input', filterBooks);
    categoryFilter.addEventListener('change', filterBooks);
    statusFilter.addEventListener('change', filterBooks);

    closeQrModal.addEventListener('click', closeQrModalFn);
    qrModal.addEventListener('click', function(e) {
        if (e.target === qrModal) {
            closeQrModalFn();
        }
    });
    simulateScanBtn.addEventListener('click', simulateQrScan);
    
    startSessionBtn.addEventListener('click', startReadingSession);
    endSessionBtn.addEventListener('click', endReadingSession);

    addMemberBtn.addEventListener('click', openAddMemberModal);
    closeMemberModal.addEventListener('click', closeMemberModalFn);
    cancelMemberBtn.addEventListener('click', closeMemberModalFn);
    memberModal.addEventListener('click', function(e) {
        if (e.target === memberModal) {
            closeMemberModalFn();
        }
    });
    memberForm.addEventListener('submit', handleMemberSubmit);
    
    searchMembers.addEventListener('input', filterMembers);
    
    issueBookForm.addEventListener('submit', handleIssueBook);

    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    });
}

function switchPage(page) {
    const dashboardPage = document.getElementById('dashboardPage');
    const booksPage = document.getElementById('booksPage');
    const membersPage = document.getElementById('membersPage');
    const transactionsPage = document.getElementById('transactionsPage');
    const readingPage = document.getElementById('readingPage');
    const reportsPage = document.getElementById('reportsPage');
    const settingsPage = document.getElementById('settingsPage');
    
    dashboardPage.style.display = 'none';
    booksPage.style.display = 'none';
    membersPage.style.display = 'none';
    transactionsPage.style.display = 'none';
    readingPage.style.display = 'none';
    reportsPage.style.display = 'none';
    settingsPage.style.display = 'none';
    
    if (page === 'dashboard') {
        dashboardPage.style.display = 'block';
        updateDashboard();
    } else if (page === 'books') {
        booksPage.style.display = 'block';
        renderBooks();
    } else if (page === 'members') {
        membersPage.style.display = 'block';
        renderMembers();
    } else if (page === 'transactions') {
        transactionsPage.style.display = 'block';
        updateTransactionsPage();
    } else if (page === 'reading') {
        readingPage.style.display = 'block';
        updateReadingPage();
    } else if (page === 'reports') {
        reportsPage.style.display = 'block';
        updateReportsPage();
    } else if (page === 'settings') {
        settingsPage.style.display = 'block';
        loadSettingsForm();
    }
}

function loadSettings() {
    const storedSettings = localStorage.getItem('librarySettings');
    if (storedSettings) {
        settings = JSON.parse(storedSettings);
    } else {
        settings = {
            libraryName: 'AI Smart Library',
            loanPeriod: 14,
            lowStockThreshold: 2
        };
        saveSettings();
    }
}

function saveSettings() {
    localStorage.setItem('librarySettings', JSON.stringify(settings));
}

function loadSettingsForm() {
    document.getElementById('libraryName').value = settings.libraryName;
    document.getElementById('loanPeriod').value = settings.loanPeriod;
    document.getElementById('lowStockThreshold').value = settings.lowStockThreshold;
}

function saveSettings() {
    settings.libraryName = document.getElementById('libraryName').value;
    settings.loanPeriod = parseInt(document.getElementById('loanPeriod').value);
    settings.lowStockThreshold = parseInt(document.getElementById('lowStockThreshold').value);
    localStorage.setItem('librarySettings', JSON.stringify(settings));
    showToast('Settings saved successfully!', 'success');
    updateDashboard();
}

function loadBooks() {
    const storedBooks = localStorage.getItem('libraryBooks');
    if (storedBooks) {
        books = JSON.parse(storedBooks);
    } else {
        books = [
            { id: '1', title: 'JavaScript Mastery', author: 'John Doe', isbn: '978-3-16-148410-0', category: 'Technology', status: 'Available', description: 'Complete guide to JavaScript programming', borrowCount: 45, readCount: 12, totalCopies: 5, availableCopies: 5, issuedCopies: 0, addedDate: Date.now() - 86400000 * 30 },
            { id: '2', title: 'Data Science 101', author: 'Jane Smith', isbn: '978-3-16-148410-1', category: 'Science', status: 'Issued', description: 'Introduction to data science and analytics', borrowCount: 38, readCount: 8, totalCopies: 3, availableCopies: 2, issuedCopies: 1, addedDate: Date.now() - 86400000 * 25 },
            { id: '3', title: 'AI & Machine Learning', author: 'Alex Johnson', isbn: '978-3-16-148410-2', category: 'Technology', status: 'Available', description: 'Learn artificial intelligence and machine learning', borrowCount: 52, readCount: 20, totalCopies: 4, availableCopies: 4, issuedCopies: 0, addedDate: Date.now() - 86400000 * 20 },
            { id: '4', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-3-16-148410-3', category: 'Fiction', status: 'Available', description: 'Classic American literature', borrowCount: 28, readCount: 0, totalCopies: 2, availableCopies: 2, issuedCopies: 0, addedDate: Date.now() - 86400000 * 15 },
            { id: '5', title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-3-16-148410-4', category: 'Science', status: 'Available', description: 'From the Big Bang to Black Holes', borrowCount: 35, readCount: 15, totalCopies: 3, availableCopies: 3, issuedCopies: 0, addedDate: Date.now() - 86400000 * 10 },
            { id: '6', title: 'The Art of War', author: 'Sun Tzu', isbn: '978-3-16-148410-5', category: 'History', status: 'Issued', description: 'Ancient Chinese military treatise', borrowCount: 22, readCount: 5, totalCopies: 2, availableCopies: 1, issuedCopies: 1, addedDate: Date.now() - 86400000 * 5 }
        ];
        saveBooks();
    }
}

function saveBooks() {
    localStorage.setItem('libraryBooks', JSON.stringify(books));
}

function loadMembers() {
    const storedMembers = localStorage.getItem('libraryMembers');
    if (storedMembers) {
        members = JSON.parse(storedMembers);
    } else {
        members = [
            { id: '1', name: 'John Smith', usn: 'CS2024001', email: 'john@example.com', phone: '9876543210', booksIssued: 1, joinDate: Date.now() - 86400000 * 60 },
            { id: '2', name: 'Sarah Johnson', usn: 'CS2024002', email: 'sarah@example.com', phone: '9876543211', booksIssued: 0, joinDate: Date.now() - 86400000 * 45 },
            { id: '3', name: 'Mike Williams', usn: 'CS2024003', email: 'mike@example.com', phone: '9876543212', booksIssued: 0, joinDate: Date.now() - 86400000 * 30 }
        ];
        saveMembers();
    }
}

function saveMembers() {
    localStorage.setItem('libraryMembers', JSON.stringify(members));
}

function loadTransactions() {
    const storedTransactions = localStorage.getItem('libraryTransactions');
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    } else {
        const today = new Date();
        const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        transactions = [
            { id: '1', memberId: '1', memberName: 'John Smith', bookId: '2', bookTitle: 'Data Science 101', issueDate: twoWeeksAgo.toISOString().split('T')[0], dueDate: nextWeek.toISOString().split('T')[0], returnDate: null, status: 'Issued' },
            { id: '2', memberId: '1', memberName: 'John Smith', bookId: '6', bookTitle: 'The Art of War', issueDate: lastWeek.toISOString().split('T')[0], dueDate: nextWeek.toISOString().split('T')[0], returnDate: null, status: 'Issued' }
        ];
        saveTransactions();
    }
}

function saveTransactions() {
    localStorage.setItem('libraryTransactions', JSON.stringify(transactions));
}

function loadActivityData() {
    const storedActivity = localStorage.getItem('libraryActivity');
    if (storedActivity) {
        bookActivity = JSON.parse(storedActivity);
    } else {
        bookActivity = generateMockActivity();
        saveActivityData();
    }
}

function generateMockActivity() {
    const activity = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 6; i >= 0; i--) {
        activity.push({
            day: days[6 - i],
            issues: Math.floor(Math.random() * 20) + 5,
            returns: Math.floor(Math.random() * 15) + 3
        });
    }
    return activity;
}

function saveActivityData() {
    localStorage.setItem('libraryActivity', JSON.stringify(bookActivity));
}

function renderBooks() {
    const tableBody = document.getElementById('booksTableBody');
    const emptyState = document.getElementById('emptyState');
    const filteredBooks = getFilteredBooks();
    
    if (filteredBooks.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tableBody.innerHTML = filteredBooks.map(book => {
        const isLowStock = book.availableCopies <= settings.lowStockThreshold;
        return `
        <tr>
            <td>
                <img src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(book.title)}%20book%20cover&image_size=square" alt="${book.title}" class="book-cover">
            </td>
            <td><strong>${book.title}</strong></td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td><span class="category-badge">${book.category}</span></td>
            <td>
                <span class="copies-info">
                    Total: <strong>${book.totalCopies}</strong> |&nbsp;
                    Avail: <strong class="copies-avail">${book.availableCopies}</strong> |&nbsp;
                    Issued: <strong class="copies-issued">${book.issuedCopies}</strong>
                </span>
            </td>

            <td>
                <span class="book-status ${isLowStock ? 'issued' : book.status.toLowerCase()}">
                    ${isLowStock ? 'Low Stock' : book.status}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="showQrCode('${book.id}')">
                    <i class="fas fa-qrcode"></i>
                </button>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editBook('${book.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBook('${book.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

function getFilteredBooks() {
    const searchTerm = document.getElementById('searchBooks').value.toLowerCase();
    const categoryValue = document.getElementById('categoryFilter').value;
    const statusValue = document.getElementById('statusFilter').value;
    
    return books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm) || 
                            book.author.toLowerCase().includes(searchTerm) || 
                            book.isbn.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryValue || book.category === categoryValue;
        let matchesStatus = true;
        if (statusValue === 'Low Stock') {
            matchesStatus = book.availableCopies <= settings.lowStockThreshold;
        } else if (statusValue) {
            matchesStatus = book.status === statusValue;
        }
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
}

function filterBooks() {
    renderBooks();
}

function openAddBookModal() {
    editingBookId = null;
    document.getElementById('modalTitle').textContent = 'Add New Book';
    document.getElementById('bookForm').reset();
    document.getElementById('bookQuantity').value = 1;
    document.getElementById('bookModal').classList.add('active');
}

function editBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    
    editingBookId = id;
    document.getElementById('modalTitle').textContent = 'Edit Book';
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookISBN').value = book.isbn;
    document.getElementById('bookCategory').value = book.category;
    document.getElementById('bookQuantity').value = book.totalCopies;
    document.getElementById('bookDescription').value = book.description || '';
    
    document.getElementById('bookModal').classList.add('active');
}

function closeBookModal() {
    document.getElementById('bookModal').classList.remove('active');
    editingBookId = null;
}

function handleBookSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const isbn = document.getElementById('bookISBN').value.trim();
    const category = document.getElementById('bookCategory').value;
    const totalCopies = parseInt(document.getElementById('bookQuantity').value);
    const description = document.getElementById('bookDescription').value.trim();
    
    if (!title || !author || !isbn || !category || !totalCopies) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (isDuplicateISBN(isbn, editingBookId)) {
        showToast('A book with this ISBN already exists', 'error');
        return;
    }
    
    if (editingBookId) {
        const bookIndex = books.findIndex(b => b.id === editingBookId);
        if (bookIndex !== -1) {
            const oldCopies = books[bookIndex].totalCopies;
            const issuedCopies = books[bookIndex].issuedCopies;
            const availableCopies = Math.max(0, totalCopies - issuedCopies);
            
            books[bookIndex] = {
                ...books[bookIndex],
                title,
                author,
                isbn,
                category,
                totalCopies,
                availableCopies,
                status: availableCopies > 0 ? 'Available' : 'Issued',
                description
            };
            addActivity('Book Updated', `${title} by ${author}`);
            showToast('Book updated successfully', 'success');
        }
    } else {
        const newBook = {
            id: Date.now().toString(),
            title,
            author,
            isbn,
            category,
            status: 'Available',
            description,
            borrowCount: 0,
            readCount: 0,
            totalCopies,
            availableCopies: totalCopies,
            issuedCopies: 0,
            addedDate: Date.now()
        };
        books.push(newBook);
        addActivity('New Book Added', `${title} by ${author}`);
        showToast('Book added successfully', 'success');
    }
    
    saveBooks();
    renderBooks();
    updateDashboard();
    closeBookModal();
}

function isDuplicateISBN(isbn, excludeId = null) {
    return books.some(book => book.isbn === isbn && book.id !== excludeId);
}

function deleteBook(id) {
    const book = books.find(b => b.id === id);
    if (confirm('Are you sure you want to delete this book?')) {
        books = books.filter(book => book.id !== id);
        if (book) {
            addActivity('Book Deleted', `${book.title} by ${book.author}`);
        }
        saveBooks();
        renderBooks();
        updateDashboard();
        showToast('Book deleted successfully', 'success');
    }
}

function renderMembers() {
    const tableBody = document.getElementById('membersTableBody');
    const emptyState = document.getElementById('membersEmptyState');
    const filteredMembers = getFilteredMembers();
    
    if (filteredMembers.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tableBody.innerHTML = filteredMembers.map(member => `
        <tr>
            <td><strong>#${member.id.slice(-4)}</strong></td>
            <td><strong>${member.name}</strong></td>
            <td>${member.usn}</td>
            <td>${member.email || '-'}</td>
            <td>${member.phone || '-'}</td>
            <td><span class="${member.booksIssued > 0 ? 'member-books-issued' : 'member-books-none'}">${member.booksIssued}</span></td>

            <td>${new Date(member.joinDate).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editMember('${member.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMember('${member.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getFilteredMembers() {
    const searchTerm = document.getElementById('searchMembers').value.toLowerCase();
    
    return members.filter(member => {
        return member.name.toLowerCase().includes(searchTerm) || 
               member.usn.toLowerCase().includes(searchTerm) ||
               (member.email && member.email.toLowerCase().includes(searchTerm));
    });
}

function filterMembers() {
    renderMembers();
}

function openAddMemberModal() {
    editingMemberId = null;
    document.getElementById('memberModalTitle').textContent = 'Add New Member';
    document.getElementById('memberForm').reset();
    document.getElementById('memberModal').classList.add('active');
}

function editMember(id) {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    editingMemberId = id;
    document.getElementById('memberModalTitle').textContent = 'Edit Member';
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberUsn').value = member.usn;
    document.getElementById('memberEmail').value = member.email || '';
    document.getElementById('memberPhone').value = member.phone || '';
    
    document.getElementById('memberModal').classList.add('active');
}

function closeMemberModalFn() {
    document.getElementById('memberModal').classList.remove('active');
    editingMemberId = null;
}

function handleMemberSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('memberName').value.trim();
    const usn = document.getElementById('memberUsn').value.trim();
    const email = document.getElementById('memberEmail').value.trim();
    const phone = document.getElementById('memberPhone').value.trim();
    
    if (!name || !usn) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (isDuplicateUsn(usn, editingMemberId)) {
        showToast('A member with this USN already exists', 'error');
        return;
    }
    
    if (editingMemberId) {
        const memberIndex = members.findIndex(m => m.id === editingMemberId);
        if (memberIndex !== -1) {
            members[memberIndex] = {
                ...members[memberIndex],
                name,
                usn,
                email,
                phone
            };
            showToast('Member updated successfully', 'success');
        }
    } else {
        const newMember = {
            id: Date.now().toString(),
            name,
            usn,
            email,
            phone,
            booksIssued: 0,
            joinDate: Date.now()
        };
        members.push(newMember);
        showToast('Member added successfully', 'success');
    }
    
    saveMembers();
    renderMembers();
    updateDashboard();
    closeMemberModalFn();
}

function isDuplicateUsn(usn, excludeId = null) {
    return members.some(member => member.usn === usn && member.id !== excludeId);
}

function deleteMember(id) {
    const member = members.find(m => m.id === id);
    if (member && member.booksIssued > 0) {
        showToast('Cannot delete member with issued books', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this member?')) {
        members = members.filter(member => member.id !== id);
        saveMembers();
        renderMembers();
        updateDashboard();
        showToast('Member deleted successfully', 'success');
    }
}

function updateTransactionsPage() {
    const memberSelect = document.getElementById('issueMember');
    const bookSelect = document.getElementById('issueBook');
    const issueDateInput = document.getElementById('issueDate');
    const dueDateInput = document.getElementById('dueDate');
    
    memberSelect.innerHTML = '<option value="">Select a member</option>';
    members.forEach(member => {
        memberSelect.innerHTML += `<option value="${member.id}">${member.name} (${member.usn})</option>`;
    });
    
    bookSelect.innerHTML = '<option value="">Select a book</option>';
    books.filter(b => b.availableCopies > 0).forEach(book => {
        bookSelect.innerHTML += `<option value="${book.id}">${book.title} - ${book.author} (${book.availableCopies} available)</option>`;
    });
    
    const today = new Date().toISOString().split('T')[0];
    issueDateInput.value = today;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + settings.loanPeriod);
    dueDateInput.value = dueDate.toISOString().split('T')[0];
    
    renderTransactions();
}

function renderTransactions() {
    const tableBody = document.getElementById('transactionsTableBody');
    
    tableBody.innerHTML = transactions.map(transaction => {
        const isOverdue = transaction.status === 'Issued' && new Date(transaction.dueDate) < new Date();
        return `
        <tr>
            <td><strong>#${transaction.id.slice(-6)}</strong></td>
            <td>${transaction.memberName}</td>
            <td>${transaction.bookTitle}</td>
            <td>${transaction.issueDate}</td>
            <td class="${isOverdue ? 'due-date-overdue' : ''}">${transaction.dueDate}</td>
            <td>${transaction.returnDate || '-'}</td>
            <td>
                <span class="book-status ${isOverdue ? 'issued' : transaction.status.toLowerCase()}">
                    ${isOverdue ? 'Overdue' : transaction.status}
                </span>
            </td>
            <td>
                ${transaction.status === 'Issued' ? `
                    <button class="btn btn-sm btn-primary" onclick="returnBook('${transaction.id}')">
                        <i class="fas fa-undo"></i> Return
                    </button>
                ` : '-'}
            </td>
        </tr>
    `;
    }).join('');
}

function handleIssueBook(e) {
    e.preventDefault();
    
    const memberId = document.getElementById('issueMember').value;
    const bookId = document.getElementById('issueBook').value;
    const issueDate = document.getElementById('issueDate').value;
    const dueDate = document.getElementById('dueDate').value;
    
    if (!memberId || !bookId || !dueDate) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    const member = members.find(m => m.id === memberId);
    const book = books.find(b => b.id === bookId);
    
    if (!member || !book) {
        showToast('Member or book not found', 'error');
        return;
    }
    
    if (book.availableCopies <= 0) {
        showToast('No copies available', 'error');
        return;
    }
    
    const transaction = {
        id: Date.now().toString(),
        memberId,
        memberName: member.name,
        bookId,
        bookTitle: book.title,
        issueDate: issueDate || new Date().toISOString().split('T')[0],
        dueDate,
        returnDate: null,
        status: 'Issued'
    };
    
    transactions.unshift(transaction);
    
    const bookIndex = books.findIndex(b => b.id === bookId);
    books[bookIndex].issuedCopies++;
    books[bookIndex].availableCopies--;
    books[bookIndex].borrowCount++;
    books[bookIndex].status = books[bookIndex].availableCopies > 0 ? 'Available' : 'Issued';
    
    const memberIndex = members.findIndex(m => m.id === memberId);
    members[memberIndex].booksIssued++;
    
    saveTransactions();
    saveBooks();
    saveMembers();
    
    addActivity('Book Issued', `${book.title} issued to ${member.name}`);
    showToast('Book issued successfully!', 'success');
    
    document.getElementById('issueBookForm').reset();
    updateTransactionsPage();
    updateDashboard();
}

function returnBook(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction || transaction.status !== 'Issued') return;
    
    if (!confirm('Are you sure you want to return this book?')) return;
    
    const today = new Date().toISOString().split('T')[0];
    transaction.returnDate = today;
    transaction.status = 'Returned';
    
    const bookIndex = books.findIndex(b => b.id === transaction.bookId);
    if (bookIndex !== -1) {
        books[bookIndex].issuedCopies--;
        books[bookIndex].availableCopies++;
        books[bookIndex].status = 'Available';
    }
    
    const memberIndex = members.findIndex(m => m.id === transaction.memberId);
    if (memberIndex !== -1) {
        members[memberIndex].booksIssued--;
    }
    
    saveTransactions();
    saveBooks();
    saveMembers();
    
    addActivity('Book Returned', `${transaction.bookTitle} returned by ${transaction.memberName}`);
    showToast('Book returned successfully!', 'success');
    
    renderTransactions();
    updateDashboard();
}

function addActivity(type, details) {
    const today = new Date();
    const time = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    if (!bookActivity.some(a => a.type === type && a.details === details && Date.now() - (a.timestamp || 0) < 60000)) {
        bookActivity.unshift({ type, details, time, timestamp: Date.now() });
        if (bookActivity.length > 20) bookActivity.pop();
        saveActivityData();
    }
}

function updateDashboard() {
    updateDashboardStats();
    updateMostBorrowed();
    updateLeastBorrowed();
    updateCategoryStats();
    updateLeastUsedCategories();
    updatePredictions();
    updateAlerts();
    updateSmartRecommendations();
    updateTimeline();
    updateCharts();
    updateNotificationBadge();
}

function updateDashboardStats() {
    const totalBooksCount = document.getElementById('totalBooksCount');
    const mostBorrowedCount = document.getElementById('mostBorrowedCount');
    const issuedBooksCount = document.getElementById('issuedBooksCount');
    const availableBooksCount = document.getElementById('availableBooksCount');
    const overdueBooksCount = document.getElementById('overdueBooksCount');
    const lowStockCount = document.getElementById('lowStockCount');
    const unusedBooksCount = document.getElementById('unusedBooksCount');
    const totalMembersCount = document.getElementById('totalMembersCount');
    
    if (totalBooksCount) totalBooksCount.textContent = books.length;
    
    const mostBorrowed = books.reduce((max, book) => (book.borrowCount > max ? book.borrowCount : max), 0);
    if (mostBorrowedCount) mostBorrowedCount.textContent = mostBorrowed;
    
    const totalIssued = books.reduce((sum, book) => sum + book.issuedCopies, 0);
    if (issuedBooksCount) issuedBooksCount.textContent = totalIssued;
    
    const totalAvailable = books.reduce((sum, book) => sum + book.availableCopies, 0);
    if (availableBooksCount) availableBooksCount.textContent = totalAvailable;
    
    const overdueCount = transactions.filter(t => t.status === 'Issued' && new Date(t.dueDate) < new Date()).length;
    if (overdueBooksCount) overdueBooksCount.textContent = overdueCount;
    
    const lowStockBooks = books.filter(b => b.availableCopies <= settings.lowStockThreshold).length;
    if (lowStockCount) lowStockCount.textContent = lowStockBooks;
    
    const unusedCount = books.filter(b => b.borrowCount === 0).length;
    if (unusedBooksCount) unusedBooksCount.textContent = unusedCount;
    
    if (totalMembersCount) totalMembersCount.textContent = members.length;
}

function updateMostBorrowed() {
    const list = document.getElementById('mostBorrowedList');
    if (!list) return;
    
    const sortedBooks = [...books].sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0)).slice(0, 5);
    
    list.innerHTML = sortedBooks.map((book, index) => `
        <div class="ranking-item">
            <div class="ranking-number">${index + 1}</div>
            <div class="ranking-info">
                <h4>${book.title}</h4>
                <p>${book.author}</p>
            </div>
            <span class="ranking-count">${book.borrowCount || 0}x</span>
        </div>
    `).join('');
}

function updateLeastBorrowed() {
    const list = document.getElementById('leastBorrowedList');
    if (!list) return;
    
    const sortedBooks = [...books].filter(b => b.borrowCount > 0).sort((a, b) => (a.borrowCount || 0) - (b.borrowCount || 0)).slice(0, 5);
    
    list.innerHTML = sortedBooks.map((book, index) => `
        <div class="ranking-item">
            <div class="ranking-number">${index + 1}</div>
            <div class="ranking-info">
                <h4>${book.title}</h4>
                <p>${book.author}</p>
            </div>
            <span class="ranking-count">${book.borrowCount || 0}x</span>
        </div>
    `).join('');
    
    if (sortedBooks.length === 0) {
        list.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">No data available</p>';
    }
}

function updateCategoryStats() {
    const container = document.getElementById('categoryStats');
    if (!container) return;
    
    const categoryCounts = {};
    books.forEach(book => {
        categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
    });
    
    const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    
    container.innerHTML = sortedCategories.map(([category, count]) => `
        <div class="category-stat-item">
            <span class="category-stat-name">${category}</span>
            <span class="category-stat-value">${count} books</span>
        </div>
    `).join('');
}

function updateLeastUsedCategories() {
    const container = document.getElementById('leastUsedCategories');
    if (!container) return;
    
    const categoryBorrows = {};
    books.forEach(book => {
        categoryBorrows[book.category] = (categoryBorrows[book.category] || 0) + (book.borrowCount || 0);
    });
    
    const sortedCategories = Object.entries(categoryBorrows).sort((a, b) => a[1] - b[1]);
    
    container.innerHTML = sortedCategories.map(([category, count]) => `
        <div class="category-stat-item">
            <span class="category-stat-name">${category}</span>
            <span class="category-stat-value">${count} borrows</span>
        </div>
    `).join('');
}

function updatePredictions() {
    const container = document.getElementById('predictionList');
    if (!container) return;
    
    const predictions = books
        .filter(b => b.availableCopies > 0)
        .sort((a, b) => {
            const scoreA = (a.borrowCount || 0) * 0.7 + (a.category === 'Technology' ? 10 : 0);
            const scoreB = (b.borrowCount || 0) * 0.7 + (b.category === 'Technology' ? 10 : 0);
            return scoreB - scoreA;
        })
        .slice(0, 3);
    
    container.innerHTML = predictions.map(book => {
        const score = Math.min(95, 70 + (book.borrowCount || 0));
        return `
            <div class="prediction-item">
                <div class="prediction-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="prediction-info">
                    <h4>${book.title}</h4>
                    <p>High demand predicted</p>
                </div>
                <span class="prediction-score">${score}%</span>
            </div>
        `;
    }).join('');
}

function updateAlerts() {
    const container = document.getElementById('alertList');
    if (!container) return;
    
    const lowStockBooks = books.filter(b => b.availableCopies <= settings.lowStockThreshold);
    const overdueBooks = transactions.filter(t => t.status === 'Issued' && new Date(t.dueDate) < new Date());
    
    const alerts = [
        ...lowStockBooks.slice(0, 2).map(book => ({
            type: 'low-stock',
            title: 'Low Stock Alert',
            message: `${book.title}: only ${book.availableCopies} left`
        })),
        ...overdueBooks.slice(0, 2).map(transaction => ({
            type: 'overdue',
            title: 'Overdue Book',
            message: `${transaction.bookTitle} - ${transaction.memberName}`
        }))
    ].slice(0, 4);
    
    container.innerHTML = alerts.map(alert => `
        <div class="alert-item">
            <div class="alert-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="alert-info">
                <h4>${alert.title}</h4>
                <p>${alert.message}</p>
            </div>
        </div>
    `).join('');
    
    if (alerts.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">No alerts</p>';
    }
}

function updateSmartRecommendations() {
    const container = document.getElementById('smartRecommendations');
    if (!container) return;
    
    const recommendations = [];
    
    const unusedBooks = books.filter(b => b.borrowCount === 0).slice(0, 1);
    if (unusedBooks.length > 0) {
        recommendations.push({
            icon: 'warning',
            iconClass: 'fa-lightbulb',
            title: 'Consider Removing',
            message: `"${unusedBooks[0].title}" has never been borrowed`
        });
    }
    
    const highDemandBooks = books
        .filter(b => b.borrowCount > 20 && b.availableCopies <= settings.lowStockThreshold)
        .slice(0, 1);
    if (highDemandBooks.length > 0) {
        recommendations.push({
            icon: 'info',
            iconClass: 'fa-plus-circle',
            title: 'Restock Recommended',
            message: `"${highDemandBooks[0].title}" is in high demand`
        });
    }
    
    const techBooks = books.filter(b => b.category === 'Technology');
    if (techBooks.length < 5) {
        recommendations.push({
            icon: 'success',
            iconClass: 'fa-info-circle',
            title: 'Add More Tech Books',
            message: 'Technology category needs more books'
        });
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            icon: 'success',
            iconClass: 'fa-check-circle',
            title: 'Library Optimized',
            message: 'Your library collection is well-balanced!'
        });
    }
    
    container.innerHTML = recommendations.map(recommendation => `
        <div class="smart-notification-item">
            <div class="smart-notification-icon ${recommendation.icon}">
                <i class="fas ${recommendation.iconClass}"></i>
            </div>
            <div class="smart-notification-content">
                <h4>${recommendation.title}</h4>
                <p>${recommendation.message}</p>
            </div>
        </div>
    `).join('');
}

function updateTimeline() {
    const container = document.getElementById('activityTimeline');
    if (!container) return;
    
    const timelineItems = bookActivity.slice(0, 5);
    
    container.innerHTML = timelineItems.map(item => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <h4>${item.type}</h4>
                <p>${item.details}</p>
                <span class="timeline-time">${item.time}</span>
            </div>
        </div>
    `).join('');
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    
    const lowStockCount = books.filter(b => b.availableCopies <= settings.lowStockThreshold).length;
    const overdueCount = transactions.filter(t => t.status === 'Issued' && new Date(t.dueDate) < new Date()).length;
    const total = lowStockCount + overdueCount;
    
    badge.textContent = total > 0 ? total : '';
    badge.style.display = total > 0 ? 'inline-block' : 'none';
}

function updateCharts() {
    const isDark = document.documentElement.classList.contains('dark-mode');
    const textColor = isDark ? '#e0e0f8' : '#1a1a2e';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26,26,46,0.08)';
    
    updateCategoryChart(textColor, gridColor);
    updateStatusChart(textColor, gridColor);
    updateTrendsChart(textColor, gridColor);
}

function updateCategoryChart(textColor, gridColor) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    if (categoryChart) categoryChart.destroy();
    
    const categoryCounts = {};
    books.forEach(book => {
        categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
    });
    
    const labels = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);
    const colors = [
        'rgba(102, 126, 234, 0.8)',
        'rgba(240, 147, 251, 0.8)',
        'rgba(79, 172, 254, 0.8)',
        'rgba(67, 233, 123, 0.8)',
        'rgba(245, 87, 108, 0.8)',
        'rgba(255, 217, 61, 0.8)'
    ];
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: colors.slice(0, labels.length).map(c => c.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

function updateStatusChart(textColor, gridColor) {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    if (statusChart) statusChart.destroy();
    
    const totalAvailable = books.reduce((sum, book) => sum + book.availableCopies, 0);
    const totalIssued = books.reduce((sum, book) => sum + book.issuedCopies, 0);
    
    statusChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Available', 'Issued'],
            datasets: [{
                label: 'Number of Books',
                data: [totalAvailable, totalIssued],
                backgroundColor: [
                    'rgba(67, 233, 123, 0.8)',
                    'rgba(245, 87, 108, 0.8)'
                ],
                borderColor: [
                    'rgba(67, 233, 123, 1)',
                    'rgba(245, 87, 108, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        }
    });
}

function updateTrendsChart(textColor, gridColor) {
    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;
    
    if (trendsChart) trendsChart.destroy();
    
    const days = bookActivity.slice(0, 7).map(a => a.day);
    const issues = bookActivity.slice(0, 7).map(a => a.issues);
    const returns = bookActivity.slice(0, 7).map(a => a.returns);
    
    trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Books Issued',
                    data: issues,
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Books Returned',
                    data: returns,
                    borderColor: 'rgba(67, 233, 123, 1)',
                    backgroundColor: 'rgba(67, 233, 123, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        }
    });
}

function updateReportsPage() {
    const isDark = document.documentElement.classList.contains('dark-mode');
    const textColor = isDark ? '#e0e0f8' : '#1a1a2e';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(26,26,46,0.08)';
    
    updateUsageComparisonChart(textColor, gridColor);
    updateBorrowingTrendsChart(textColor, gridColor);
    updateLibraryReadBooks();
    updateNeverBorrowedBooks();
    updateCategoryEngagement();
    updateLowEngagementBooks();
}

function updateUsageComparisonChart(textColor, gridColor) {
    const ctx = document.getElementById('usageComparisonChart');
    if (!ctx) return;
    
    if (usageComparisonChart) usageComparisonChart.destroy();
    
    const topBooks = [...books].sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0)).slice(0, 5);
    
    usageComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topBooks.map(b => b.title.slice(0, 15)),
            datasets: [
                {
                    label: 'Borrowed',
                    data: topBooks.map(b => b.borrowCount || 0),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                },
                {
                    label: 'Read in Library',
                    data: topBooks.map(b => b.readCount || 0),
                    backgroundColor: 'rgba(67, 233, 123, 0.8)',
                    borderColor: 'rgba(67, 233, 123, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        }
    });
}

function updateBorrowingTrendsChart(textColor, gridColor) {
    const ctx = document.getElementById('borrowingTrendsChart');
    if (!ctx) return;
    
    if (borrowingTrendsChart) borrowingTrendsChart.destroy();
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const borrowData = months.map(() => Math.floor(Math.random() * 50) + 20);
    
    borrowingTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Books Borrowed',
                data: borrowData,
                borderColor: 'rgba(240, 147, 251, 1)',
                backgroundColor: 'rgba(240, 147, 251, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 15,
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        }
    });
}

function updateLibraryReadBooks() {
    const container = document.getElementById('libraryReadBooks');
    if (!container) return;
    
    const sortedBooks = [...books].sort((a, b) => (b.readCount || 0) - (a.readCount || 0)).slice(0, 5);
    
    container.innerHTML = sortedBooks.map((book, index) => `
        <div class="ranking-item">
            <div class="ranking-number">${index + 1}</div>
            <div class="ranking-info">
                <h4>${book.title}</h4>
                <p>${book.author}</p>
            </div>
            <span class="ranking-count">${book.readCount || 0}x</span>
        </div>
    `).join('');
}

function updateNeverBorrowedBooks() {
    const container = document.getElementById('neverBorrowedList');
    if (!container) return;
    
    const neverBorrowed = books.filter(b => b.borrowCount === 0).slice(0, 5);
    
    container.innerHTML = neverBorrowed.map((book, index) => `
        <div class="ranking-item">
            <div class="ranking-number">${index + 1}</div>
            <div class="ranking-info">
                <h4>${book.title}</h4>
                <p>${book.author}</p>
            </div>
            <span class="ranking-count">Never</span>
        </div>
    `).join('');
    
    if (neverBorrowed.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">All books have been borrowed!</p>';
    }
}

function updateCategoryEngagement() {
    const container = document.getElementById('categoryEngagement');
    if (!container) return;
    
    const categoryEngagement = {};
    books.forEach(book => {
        const totalEngagement = (book.borrowCount || 0) + (book.readCount || 0);
        categoryEngagement[book.category] = (categoryEngagement[book.category] || 0) + totalEngagement;
    });
    
    const sortedCategories = Object.entries(categoryEngagement).sort((a, b) => b[1] - a[1]);
    
    container.innerHTML = sortedCategories.map(([category, count]) => `
        <div class="category-stat-item">
            <span class="category-stat-name">${category}</span>
            <span class="category-stat-value">${count} engagements</span>
        </div>
    `).join('');
}

function updateLowEngagementBooks() {
    const container = document.getElementById('lowEngagementBooks');
    if (!container) return;
    
    const lowEngagement = books
        .filter(b => (b.borrowCount || 0) + (b.readCount || 0) < 5)
        .slice(0, 4);
    
    container.innerHTML = lowEngagement.map(book => `
        <div class="alert-item">
            <div class="alert-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="alert-info">
                <h4>${book.title}</h4>
                <p>Low engagement: only ${(book.borrowCount || 0) + (book.readCount || 0)} times</p>
            </div>
        </div>
    `).join('');
    
    if (lowEngagement.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">No low engagement books!</p>';
    }
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <i class="fas ${iconClass} toast-icon"></i>
        <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s ease reverse';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function loadReadingSessions() {
    const stored = localStorage.getItem('readingSessions');
    if (stored) {
        readingSessions = JSON.parse(stored);
    }
}

function saveReadingSessions() {
    localStorage.setItem('readingSessions', JSON.stringify(readingSessions));
}

function showQrCode(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    currentQrBook = book;
    document.getElementById('qrBookTitle').textContent = book.title;
    document.getElementById('qrBookAuthor').textContent = book.author;
    document.getElementById('qrBookIsbn').textContent = 'ISBN: ' + book.isbn;
    
    const qrContainer = document.getElementById('qrCodeContainer');
    qrContainer.innerHTML = '';
    
    const qrData = JSON.stringify({
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category
    });
    
    qrCodeInstance = new QRCode(qrContainer, {
        text: qrData,
        width: 180,
        height: 180,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
    
    document.getElementById('qrModal').classList.add('active');
}

function closeQrModalFn() {
    document.getElementById('qrModal').classList.remove('active');
    currentQrBook = null;
    if (qrCodeInstance) {
        qrCodeInstance.clear();
        qrCodeInstance = null;
    }
}

function simulateQrScan() {
    if (!currentQrBook) return;
    
    closeQrModalFn();
    
    switchPage('reading');
    
    document.getElementById('sessionBook').value = currentQrBook.id;
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    document.getElementById('startTime').value = timeString;
    
    showToast('QR Code scanned successfully!', 'success');
}

function updateReadingPage() {
    const bookSelect = document.getElementById('sessionBook');
    bookSelect.innerHTML = '<option value="">Select a book</option>';
    books.forEach(book => {
        bookSelect.innerHTML += `<option value="${book.id}">${book.title} - ${book.author}</option>`;
    });
    
    updateMostReadBooks();
    updateReadingHours();
    updateActivityLogs();
}

function startReadingSession() {
    const studentName = document.getElementById('studentName').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const bookId = document.getElementById('sessionBook').value;
    
    if (!studentName || !studentId || !bookId) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    const startTime = document.getElementById('startTime').value || new Date().toTimeString().slice(0, 5);
    
    activeSession = {
        id: Date.now().toString(),
        studentName,
        studentId,
        bookId,
        bookTitle: book.title,
        startTime,
        startTimestamp: Date.now()
    };
    
    document.getElementById('activeStudentName').textContent = studentName;
    document.getElementById('activeBookTitle').textContent = book.title;
    document.getElementById('activeSession').style.display = 'block';
    document.getElementById('startSessionBtn').disabled = true;
    document.getElementById('endSessionBtn').disabled = false;
    
    startTimer();
    showToast('Reading session started!', 'success');
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    let seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        document.getElementById('readingTimer').textContent = `${hours}:${minutes}:${secs}`;
    }, 1000);
}

function endReadingSession() {
    if (!activeSession) return;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    const endTimestamp = Date.now();
    const duration = Math.floor((endTimestamp - activeSession.startTimestamp) / 1000);
    
    const completedSession = {
        ...activeSession,
        endTimestamp,
        duration,
        endTime: new Date().toTimeString().slice(0, 5)
    };
    
    readingSessions.unshift(completedSession);
    saveReadingSessions();
    
    const bookIndex = books.findIndex(b => b.id === activeSession.bookId);
    if (bookIndex !== -1) {
        books[bookIndex].readCount = (books[bookIndex].readCount || 0) + 1;
        saveBooks();
    }
    
    document.getElementById('activeSession').style.display = 'none';
    document.getElementById('startSessionBtn').disabled = false;
    document.getElementById('endSessionBtn').disabled = true;
    document.getElementById('readingSessionForm').reset();
    document.getElementById('readingTimer').textContent = '00:00:00';
    
    activeSession = null;
    updateReadingPage();
    updateDashboard();
    showToast('Reading session ended!', 'success');
}

function updateMostReadBooks() {
    const container = document.getElementById('mostReadBooks');
    if (!container) return;
    
    const bookReadCounts = {};
    readingSessions.forEach(session => {
        bookReadCounts[session.bookId] = (bookReadCounts[session.bookId] || 0) + 1;
    });
    
    books.forEach(book => {
        if (book.readCount) {
            bookReadCounts[book.id] = (bookReadCounts[book.id] || 0) + book.readCount;
        }
    });
    
    const sortedBooks = books
        .map(book => ({ ...book, readCount: bookReadCounts[book.id] || 0 }))
        .sort((a, b) => b.readCount - a.readCount)
        .slice(0, 5);
    
    container.innerHTML = sortedBooks.map((book, index) => `
        <div class="ranking-item">
            <div class="ranking-number">${index + 1}</div>
            <div class="ranking-info">
                <h4>${book.title}</h4>
                <p>${book.author}</p>
            </div>
            <span class="ranking-count">${book.readCount}x</span>
        </div>
    `).join('');
}

function updateReadingHours() {
    const container = document.getElementById('readingHours');
    if (!container) return;
    
    const hours = {};
    for (let i = 0; i < 24; i++) {
        hours[i] = 0;
    }
    
    readingSessions.forEach(session => {
        const hour = new Date(session.startTimestamp).getHours();
        hours[hour]++;
    });
    
    const sortedHours = Object.entries(hours)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    container.innerHTML = sortedHours.map(([hour, count]) => {
        const start = hour.toString().padStart(2, '0');
        const end = ((parseInt(hour) + 1) % 24).toString().padStart(2, '0');
        return `
            <div class="hour-item">
                <span class="hour-label">${start}:00 - ${end}:00</span>
                <span class="hour-value">${count} sessions</span>
            </div>
        `;
    }).join('');
}

function updateActivityLogs() {
    const container = document.getElementById('activityLogs');
    if (!container) return;
    
    const logs = readingSessions.slice(0, 10).map(session => {
        const date = new Date(session.startTimestamp).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        return {
            type: 'end',
            title: 'Reading Session Completed',
            message: `${session.studentName} read "${session.bookTitle}"`,
            duration: formatDuration(session.duration),
            time: date + ' ' + session.startTime
        };
    });
    
    if (activeSession) {
        logs.unshift({
            type: 'start',
            title: 'Active Reading Session',
            message: `${activeSession.studentName} is reading "${activeSession.bookTitle}"`,
            time: 'Now'
        });
    }
    
    container.innerHTML = logs.map(log => `
        <div class="log-item">
            <div class="log-icon ${log.type}">
                <i class="fas fa-${log.type === 'start' ? 'play' : 'check'}"></i>
            </div>
            <div class="log-content">
                <h4>${log.title}</h4>
                <p>${log.message}</p>
                ${log.duration ? `<p style="color: #43e97b; font-size: 11px;">Duration: ${log.duration}</p>` : ''}
                <span class="log-time">${log.time}</span>
            </div>
        </div>
    `).join('');
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

function exportData() {
    const data = {
        books,
        members,
        transactions,
        readingSessions,
        settings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!', 'success');
}

function clearAllData() {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone!')) return;
    if (!confirm('Really clear everything?')) return;
    
    localStorage.clear();
    location.reload();
}
