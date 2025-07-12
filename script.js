// Library Management System JavaScript

class LibraryManager {
    constructor() {
        this.books = [];
        this.nextId = 1;
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.renderBooks();
        this.updateStats();
    }

    // Local Storage Management
    loadFromStorage() {
        const savedBooks = localStorage.getItem('libraryBooks');
        const savedNextId = localStorage.getItem('libraryNextId');
        
        if (savedBooks) {
            this.books = JSON.parse(savedBooks);
        }
        
        if (savedNextId) {
            this.nextId = parseInt(savedNextId);
        }
    }

    saveToStorage() {
        localStorage.setItem('libraryBooks', JSON.stringify(this.books));
        localStorage.setItem('libraryNextId', this.nextId.toString());
    }

    // Event Listeners
    setupEventListeners() {
        // Add book form
        document.getElementById('addBookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBook(e);
        });

        // Search and filter
        document.getElementById('searchTerm').addEventListener('input', () => this.filterBooks());
        document.getElementById('searchFilter').addEventListener('change', () => this.filterBooks());
        document.getElementById('availabilityFilter').addEventListener('change', () => this.filterBooks());
    }

    // Book Management
    addBook(event) {
        const formData = new FormData(event.target);
        
        const title = formData.get('title').trim();
        const author = formData.get('author').trim();
        const genre = formData.get('genre').trim();
        const publicationYear = parseInt(formData.get('publicationYear')) || 0;

        if (!title || !author) {
            this.showMessage('Title and author are required!', 'error');
            return;
        }

        const book = {
            id: this.nextId++,
            title,
            author,
            genre,
            publicationYear,
            isAvailable: true,
            checkedOutBy: null,
            checkedOutDate: null,
            dueDate: null,
            addedDate: new Date().toISOString().split('T')[0]
        };

        this.books.push(book);
        this.saveToStorage();
        this.renderBooks();
        this.updateStats();
        
        event.target.reset();
        this.showMessage('Book added successfully!', 'success');
    }

    deleteBook(bookId) {
        if (!confirm('Are you sure you want to delete this book?')) {
            return;
        }

        this.books = this.books.filter(book => book.id !== bookId);
        this.saveToStorage();
        this.renderBooks();
        this.updateStats();
        this.showMessage('Book deleted successfully!', 'success');
    }

    checkoutBook(bookId) {
        const borrower = document.getElementById(`borrower-${bookId}`).value.trim();
        const dueDate = document.getElementById(`dueDate-${bookId}`).value;

        if (!borrower || !dueDate) {
            this.showMessage('Please fill in all checkout fields', 'error');
            return;
        }

        const book = this.books.find(b => b.id === bookId);
        if (book) {
            book.isAvailable = false;
            book.checkedOutBy = borrower;
            book.checkedOutDate = new Date().toISOString().split('T')[0];
            book.dueDate = dueDate;

            this.saveToStorage();
            this.renderBooks();
            this.updateStats();
            this.showMessage('Book checked out successfully!', 'success');
        }
    }

    returnBook(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (book) {
            book.isAvailable = true;
            book.checkedOutBy = null;
            book.checkedOutDate = null;
            book.dueDate = null;

            this.saveToStorage();
            this.renderBooks();
            this.updateStats();
            this.showMessage('Book returned successfully!', 'success');
        }
    }

    // Filtering and Search
    filterBooks() {
        const searchTerm = document.getElementById('searchTerm').value.toLowerCase();
        const searchFilter = document.getElementById('searchFilter').value;
        const availabilityFilter = document.getElementById('availabilityFilter').value;

        let filteredBooks = this.books.filter(book => {
            // Search filter
            let matchesSearch = true;
            if (searchTerm) {
                if (searchFilter === 'all') {
                    matchesSearch = 
                        book.title.toLowerCase().includes(searchTerm) ||
                        book.author.toLowerCase().includes(searchTerm) ||
                        book.id.toString().includes(searchTerm);
                } else if (searchFilter === 'title') {
                    matchesSearch = book.title.toLowerCase().includes(searchTerm);
                } else if (searchFilter === 'author') {
                    matchesSearch = book.author.toLowerCase().includes(searchTerm);
                } else if (searchFilter === 'id') {
                    matchesSearch = book.id.toString().includes(searchTerm);
                }
            }

            // Availability filter
            let matchesAvailability = true;
            if (availabilityFilter === 'available') {
                matchesAvailability = book.isAvailable;
            } else if (availabilityFilter === 'checked-out') {
                matchesAvailability = !book.isAvailable;
            }

            return matchesSearch && matchesAvailability;
        });

        this.renderBooks(filteredBooks);
    }

    // Utility Functions
    isOverdue(book) {
        if (book.isAvailable || !book.dueDate) return false;
        const today = new Date().toISOString().split('T')[0];
        return book.dueDate < today;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    // UI Rendering
    renderBooks(booksToRender = null) {
        const books = booksToRender || this.books;
        const container = document.getElementById('booksContainer');
        const bookCount = document.getElementById('bookCount');
        
        bookCount.textContent = books.length;

        if (books.length === 0) {
            container.innerHTML = `
                <div class="no-books">
                    <h3>No books found</h3>
                    <p>Try adjusting your search criteria or add some books to get started with your library.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = books.map(book => this.createBookCard(book)).join('');
    }

    createBookCard(book) {
        const isOverdue = this.isOverdue(book);
        const statusClass = book.isAvailable ? 'available' : (isOverdue ? 'overdue' : 'checked-out');
        const statusText = book.isAvailable ? 'Available' : (isOverdue ? 'Overdue' : 'Checked Out');
        const statusIcon = book.isAvailable ? 
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22,4 12,14.01 9,11.01"></polyline></svg>' :
            (isOverdue ? 
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>' :
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12,6 12,12 16,14"></polyline></svg>'
            );

        return `
            <div class="book-card ${statusClass}">
                <div class="book-header">
                    <div class="book-title">${this.escapeHtml(book.title)}</div>
                    <div class="book-author">by ${this.escapeHtml(book.author)}</div>
                    <div class="status-badge status-${statusClass}">
                        ${statusIcon}
                        ${statusText}
                    </div>
                </div>

                <div class="book-details">
                    <div class="book-detail">
                        <span class="book-detail-label">ID:</span>
                        <span class="book-detail-value">${book.id}</span>
                    </div>
                    ${book.genre ? `
                        <div class="book-detail">
                            <span class="book-detail-label">Genre:</span>
                            <span class="book-detail-value">${this.escapeHtml(book.genre)}</span>
                        </div>
                    ` : ''}
                    ${book.publicationYear ? `
                        <div class="book-detail">
                            <span class="book-detail-label">Published:</span>
                            <span class="book-detail-value">${book.publicationYear}</span>
                        </div>
                    ` : ''}
                    ${!book.isAvailable && book.checkedOutBy ? `
                        <div class="book-detail">
                            <span class="book-detail-label">Checked out by:</span>
                            <span class="book-detail-value">${this.escapeHtml(book.checkedOutBy)}</span>
                        </div>
                        <div class="book-detail">
                            <span class="book-detail-label">Due date:</span>
                            <span class="book-detail-value ${isOverdue ? 'text-red-600' : ''}">${this.formatDate(book.dueDate)}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="book-actions">
                    ${book.isAvailable ? `
                        <button class="btn btn-warning" onclick="library.showCheckoutForm(${book.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                            Check Out
                        </button>
                    ` : `
                        <button class="btn btn-success" onclick="library.returnBook(${book.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="1,4 1,10 7,10"></polyline>
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                            </svg>
                            Return Book
                        </button>
                    `}
                    <button class="btn btn-danger" onclick="library.deleteBook(${book.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                        </svg>
                        Delete
                    </button>
                </div>

                <div id="checkout-form-${book.id}" class="checkout-form" style="display: none;">
                    <h4>Check Out Book</h4>
                    <div class="form-group">
                        <label>Borrower Name:</label>
                        <input type="text" id="borrower-${book.id}" placeholder="Enter borrower name" required>
                    </div>
                    <div class="form-group">
                        <label>Due Date:</label>
                        <input type="date" id="dueDate-${book.id}" min="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="book-actions">
                        <button class="btn btn-primary" onclick="library.checkoutBook(${book.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22,4 12,14.01 9,11.01"></polyline>
                            </svg>
                            Confirm Checkout
                        </button>
                        <button class="btn btn-secondary" onclick="library.hideCheckoutForm(${book.id})">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showCheckoutForm(bookId) {
        document.getElementById(`checkout-form-${bookId}`).style.display = 'block';
    }

    hideCheckoutForm(bookId) {
        document.getElementById(`checkout-form-${bookId}`).style.display = 'none';
    }

    updateStats() {
        const totalBooks = this.books.length;
        const availableBooks = this.books.filter(book => book.isAvailable).length;
        const checkedOutBooks = this.books.filter(book => !book.isAvailable).length;
        const overdueBooks = this.books.filter(book => this.isOverdue(book)).length;

        document.getElementById('totalBooks').textContent = totalBooks;
        document.getElementById('availableBooks').textContent = availableBooks;
        document.getElementById('checkedOutBooks').textContent = checkedOutBooks;
        document.getElementById('overdueBooks').textContent = overdueBooks;
    }

    showMessage(message, type) {
        const messageContainer = document.getElementById('message');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        
        const icon = type === 'success' ? 
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22,4 12,14.01 9,11.01"></polyline></svg>' :
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
        
        messageElement.innerHTML = `${icon} ${message}`;
        messageContainer.appendChild(messageElement);

        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }
}

// Initialize the library system
const library = new LibraryManager();

// Add some sample data if no books exist
if (library.books.length === 0) {
    const sampleBooks = [
        {
            id: library.nextId++,
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            genre: "Classic Literature",
            publicationYear: 1925,
            isAvailable: true,
            checkedOutBy: null,
            checkedOutDate: null,
            dueDate: null,
            addedDate: new Date().toISOString().split('T')[0]
        },
        {
            id: library.nextId++,
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            genre: "Fiction",
            publicationYear: 1960,
            isAvailable: false,
            checkedOutBy: "John Smith",
            checkedOutDate: "2024-01-15",
            dueDate: "2024-02-15",
            addedDate: new Date().toISOString().split('T')[0]
        },
        {
            id: library.nextId++,
            title: "1984",
            author: "George Orwell",
            genre: "Dystopian Fiction",
            publicationYear: 1949,
            isAvailable: true,
            checkedOutBy: null,
            checkedOutDate: null,
            dueDate: null,
            addedDate: new Date().toISOString().split('T')[0]
        }
    ];

    library.books = sampleBooks;
    library.saveToStorage();
    library.renderBooks();
    library.updateStats();
}