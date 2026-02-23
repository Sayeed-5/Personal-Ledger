/**
 * Data Service Interface
 * Defines the contract for data operations to ensure easy Firebase migration later.
 */
class DataService {
    async getPeople() { throw new Error("Method not implemented."); }
    async addPerson(name) { throw new Error("Method not implemented."); }
    async getTransactions(personId) { throw new Error("Method not implemented."); }
    async addTransaction(transaction) { throw new Error("Method not implemented."); }
    async deleteTransaction(id) { throw new Error("Method not implemented."); }
    async deletePerson(id) { throw new Error("Method not implemented."); }
    async updatePerson(id, name) { throw new Error("Method not implemented."); }
}

/**
 * LocalStorage Implementation
 * Temporary data layer using browser local storage.
 */
class LocalStorageService extends DataService {
    constructor() {
        super();
        this.STORAGE_KEY_PEOPLE = 'personal_ledger_people';
        this.STORAGE_KEY_TRANSACTIONS = 'personal_ledger_transactions';
    }

    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    _getStoredPeople() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY_PEOPLE) || '[]');
    }

    _getStoredTransactions() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY_TRANSACTIONS) || '[]');
    }

    async getPeople() {
        const people = this._getStoredPeople();
        const transactions = this._getStoredTransactions();

        // Calculate balances dynamically
        return people.map(person => {
            const personTransactions = transactions.filter(t => t.personId === person.id);
            const balance = personTransactions.reduce((acc, t) => {
                // GIVEN: You gave money -> Positive balance (They owe you)
                // RECEIVED: You received money -> Negative balance (You owe them / They paid back)
                // Adjust logic based on user preference "You will receive"
                if (t.type === 'GIVEN') return acc + parseFloat(t.amount);
                if (t.type === 'RECEIVED') return acc - parseFloat(t.amount);
                return acc;
            }, 0);
            return { ...person, balance };
        });
    }

    async addPerson(name) {
        const people = this._getStoredPeople();
        const newPerson = { id: this._generateId(), name, createdAt: new Date().toISOString() };
        people.push(newPerson);
        localStorage.setItem(this.STORAGE_KEY_PEOPLE, JSON.stringify(people));
        return { ...newPerson, balance: 0 };
    }

    async updatePerson(id, name) {
        const people = this._getStoredPeople();
        const personIndex = people.findIndex(p => p.id === id);
        if (personIndex !== -1) {
            people[personIndex].name = name;
            localStorage.setItem(this.STORAGE_KEY_PEOPLE, JSON.stringify(people));
        }
    }

    async deletePerson(id) {
        let people = this._getStoredPeople();
        people = people.filter(p => p.id !== id);
        localStorage.setItem(this.STORAGE_KEY_PEOPLE, JSON.stringify(people));

        // Also cleanup transactions? Optional but good practice
        let transactions = this._getStoredTransactions();
        transactions = transactions.filter(t => t.personId !== id);
        localStorage.setItem(this.STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    }

    async getTransactions(personId) {
        const transactions = this._getStoredTransactions();
        return transactions
            .filter(t => t.personId === personId)
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
    }

    async addTransaction(transaction) {
        const transactions = this._getStoredTransactions();
        const newTransaction = { ...transaction, id: this._generateId() };
        transactions.push(newTransaction);
        localStorage.setItem(this.STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
        return newTransaction;
    }

    async deleteTransaction(id) {
        let transactions = this._getStoredTransactions();
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem(this.STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    }
}

/**
 * Firebase (Firestore) Implementation
 * Data syncs across devices (phone, laptop) via cloud.
 */
class FirebaseDataService extends DataService {
    constructor() {
        super();
        this.db = firebase.firestore();
        this.peopleCol = this.db.collection('people');
        this.transactionsCol = this.db.collection('transactions');
    }

    async getPeople() {
        const snapshot = await this.peopleCol.get();
        const people = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const personId = doc.id;
            const transactionsSnap = await this.transactionsCol.where('personId', '==', personId).get();
            let balance = 0;
            transactionsSnap.docs.forEach(d => {
                const t = d.data();
                if (t.type === 'GIVEN') balance += parseFloat(t.amount);
                if (t.type === 'RECEIVED') balance -= parseFloat(t.amount);
            });
            people.push({
                id: personId,
                name: data.name || '',
                createdAt: data.createdAt?.toDate?.()?.toISOString?.() || '',
                balance
            });
        }
        return people;
    }

    async addPerson(name) {
        const ref = await this.peopleCol.add({
            name,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: ref.id, name, balance: 0 };
    }

    async updatePerson(id, name) {
        await this.peopleCol.doc(id).update({ name });
    }

    async deletePerson(id) {
        await this.peopleCol.doc(id).delete();
        const transactionsSnap = await this.transactionsCol.where('personId', '==', id).get();
        const batch = this.db.batch();
        transactionsSnap.docs.forEach(doc => batch.delete(doc.ref));
        if (!transactionsSnap.empty) await batch.commit();
    }

    async getTransactions(personId) {
        const snapshot = await this.transactionsCol.where('personId', '==', personId).get();
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        return list;
    }

    async addTransaction(transaction) {
        const { personId, amount, date, type, note } = transaction;
        const ref = await this.transactionsCol.add({
            personId,
            amount,
            date,
            type,
            note: note || ''
        });
        return { id: ref.id, personId, amount, date, type, note: note || '' };
    }

    async deleteTransaction(id) {
        await this.transactionsCol.doc(id).delete();
    }
}

/**
 * App Controller
 * Manages UI and state.
 */
class App {
    constructor(dataService) {
        this.dataService = dataService;
        this.state = {
            people: [],
            activePersonId: null,
            transactions: []
        };

        // DOM Elements
        this.el = {
            peopleList: document.getElementById('people-list'),
            addPersonInput: document.getElementById('new-person-name'),
            btnAddPerson: document.getElementById('btn-add-person'),
            emptyState: document.getElementById('empty-state'),
            personDetails: document.getElementById('person-details'),
            summaryName: document.getElementById('summary-name'),
            summaryBalance: document.getElementById('summary-balance'),
            summaryStatus: document.getElementById('summary-status'),
            transactionsList: document.getElementById('transactions-list'),
            transactionForm: document.getElementById('transaction-form'),
            // Form inputs
            inpAmount: document.getElementById('amount'),
            inpDate: document.getElementById('date'),
            inpNote: document.getElementById('note'),
        };

        this.init();
    }

    async init() {
        this.bindEvents();
        await this.refreshPeopleList();
        
        // Set default date to today
        this.el.inpDate.valueAsDate = new Date();
    }

    bindEvents() {
        // Add Person
        this.el.btnAddPerson.addEventListener('click', () => this.handleAddPerson());
        this.el.addPersonInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAddPerson();
        });

        // Add Transaction
        this.el.transactionForm.addEventListener('submit', (e) => this.handleAddTransaction(e));
    }

    async refreshPeopleList() {
        this.state.people = await this.dataService.getPeople();
        this.renderPeopleList();
    }

    renderPeopleList() {
        this.el.peopleList.innerHTML = '';
        
        this.state.people.forEach(person => {
            const div = document.createElement('div');
            div.className = `person-item ${this.state.activePersonId === person.id ? 'active' : ''}`;
            
            // Format balance
            const balance = person.balance.toFixed(2);
            let balanceClass = 'balance-neutral';
            if (person.balance > 0) balanceClass = 'balance-positive';
            if (person.balance < 0) balanceClass = 'balance-negative';

            div.innerHTML = `
                <div class="person-info">
                    <span class="person-name">${person.name}</span>
                    <span class="person-balance ${balanceClass}">${balance}</span>
                </div>
                <div class="person-actions">
                    <button type="button" class="icon-btn edit-person-btn" title="Edit Name" aria-label="Edit name">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button type="button" class="icon-btn delete-person-btn" title="Delete Person" aria-label="Delete person">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;

            div.addEventListener('click', (e) => {
                // Prevent triggering selection when clicking actions
                if (e.target.closest('.person-actions')) return;
                this.setActivePerson(person.id);
            });

            // Edit Person
            const editBtn = div.querySelector('.edit-person-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleEditPerson(person);
            });

            // Delete Person
            const deleteBtn = div.querySelector('.delete-person-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDeletePerson(person.id);
            });

            this.el.peopleList.appendChild(div);
        });
        
        if (window.lucide) lucide.createIcons();
    }

    async handleEditPerson(person) {
        const newName = prompt("Enter new name for " + person.name, person.name);
        if (newName && newName.trim() !== "" && newName !== person.name) {
            await this.dataService.updatePerson(person.id, newName.trim());
            await this.refreshPeopleList();
            if (this.state.activePersonId === person.id) {
                this.el.summaryName.textContent = newName.trim();
            }
        }
    }

    async handleDeletePerson(id) {
        if (confirm("Are you sure you want to delete this person? All their transactions will be lost.")) {
            await this.dataService.deletePerson(id);
            if (this.state.activePersonId === id) {
                this.setActivePerson(null);
            }
            await this.refreshPeopleList();
        }
    }

    async setActivePerson(id) {
        this.state.activePersonId = id;
        this.renderPeopleList(); // Re-render to update active state styling

        if (!id) {
            this.el.emptyState.classList.remove('hidden');
            this.el.personDetails.classList.add('hidden');
            return;
        }

        this.el.emptyState.classList.add('hidden');
        this.el.personDetails.classList.remove('hidden');

        // Fetch details
        const person = this.state.people.find(p => p.id === id);
        this.state.transactions = await this.dataService.getTransactions(id);

        this.renderPersonDetails(person);
    }

    renderPersonDetails(person) {
        // Summary
        this.el.summaryName.textContent = person.name;
        
        const balance = person.balance;
        this.el.summaryBalance.textContent = Math.abs(balance).toFixed(2);
        
        if (balance > 0) {
            this.el.summaryBalance.className = 'balance-amount text-success'; // Need to add text-success util if not present, or inline style
            this.el.summaryStatus.textContent = "You will receive";
            this.el.summaryBalance.style.color = "var(--color-success)";
        } else if (balance < 0) {
            this.el.summaryBalance.className = 'balance-amount text-danger';
            this.el.summaryStatus.textContent = "You owe";
            this.el.summaryBalance.style.color = "var(--color-danger)";
        } else {
            this.el.summaryBalance.className = 'balance-amount';
            this.el.summaryStatus.textContent = "Settled up";
            this.el.summaryBalance.style.color = "var(--color-text)";
        }

        // Transactions Table
        this.el.transactionsList.innerHTML = '';
        this.state.transactions.forEach(t => {
            const row = document.createElement('tr');
            
            // Style helpers
            const isGiven = t.type === 'GIVEN';
            const typeBadgeClass = isGiven ? 'type-given' : 'type-received badge-type'; 
            // "GIVEN → green text" (type-given has no bg)
            // "RECEIVED → red pill badge" (type-received has bg)
            
            const amountClass = isGiven ? 'amount-given' : 'amount-received';
            const displayType = isGiven ? 'GIVEN' : 'RECEIVED';

            row.innerHTML = `
                <td>${t.date}</td>
                <td><span class="${typeBadgeClass}">${displayType}</span></td>
                <td class="${amountClass}">${parseFloat(t.amount).toFixed(2)}</td>
                <td>${t.note || '-'}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${t.id}">
                        <i data-lucide="pencil" style="width:16px; height:16px;"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${t.id}">
                        <i data-lucide="trash-2" style="width:16px; height:16px;"></i>
                    </button>
                </td>
            `;
            
            // Add Events
            row.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDeleteTransaction(t.id);
            });
            
            row.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                alert("Edit functionality to be implemented (or populates form)");
            });

            this.el.transactionsList.appendChild(row);
        });

        // Initialize Icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    async handleAddPerson() {
        const name = this.el.addPersonInput.value.trim();
        if (!name) {
            alert("Please enter a name.");
            return;
        }

        await this.dataService.addPerson(name);
        this.el.addPersonInput.value = '';
        await this.refreshPeopleList();
    }

    async handleAddTransaction(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const rawAmount = formData.get('amount');
        const amount = parseFloat(rawAmount);

        if (!amount || amount <= 0) {
            alert("Please enter a valid amount greater than 0.");
            return;
        }

        const transaction = {
            personId: this.state.activePersonId,
            amount: rawAmount, // Store as string or number, ensure consistency. JSON handles number fine. 
            date: formData.get('date'),
            type: formData.get('type'),
            note: formData.get('note')
        };

        await this.dataService.addTransaction(transaction);
        
        // Reset form
        e.target.reset();
        this.el.inpDate.valueAsDate = new Date(); // Reset date to today
        
        // Refresh UI
        await this.refreshPeopleList(); // Update Sidebar balance
        await this.setActivePerson(this.state.activePersonId); // Refresh details
    }

    async handleDeleteTransaction(id) {
        if(confirm('Are you sure you want to delete this transaction?')) {
            await this.dataService.deleteTransaction(id);
            await this.refreshPeopleList();
            await this.setActivePerson(this.state.activePersonId);
        }
    }
}

// Initialize App – using Firebase so data syncs across phone & laptop
document.addEventListener('DOMContentLoaded', () => {
    // const dataService = new LocalStorageService(); // commented: using Firebase only
    const dataService = new FirebaseDataService();
    const app = new App(dataService);
});
