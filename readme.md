# Smart Student Finance Manager 💸
### Capstone Project Submission — Web Technologies SP26

---

## 👤 Student Information Header
- **Student Name:** [Zohaib Hassan]
- **Roll Number:** [F24BDOCS1M01069]
- **Project Domain:** Student Personal Finance Management & Budgeting

---

## 📌 Project Overview
The **Smart Student Finance Manager** is a lightweight, responsive single-page-inspired web application designed to help students track their income streams, monitor day-to-day expenditures, and understand their savings rate. By separating student-facing interactions (Dashboard) from advanced configuration management (Admin Portal), it provides a clear separation of concerns in a polished, zero-framework Flexbox-powered UI.

All financial transactions are stored, fetched, edited, and deleted using a local REST API powered by **JSON Server** to simulate a full-stack database application.

---

## ⚙️ How to Install & Run

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### Step 1: Clone or Open Project Folder
Open your terminal/command prompt and navigate into the project directory:
```bash
cd "d:\University\Zohaib Web Project"
```

### Step 2: Start the JSON Server
Launch the REST mock database by running the following command from the project root:
```bash
npx json-server --watch db.json --port 3000
```
*Note: Make sure JSON Server is running successfully at `http://localhost:3000/transactions`. If port 3000 is occupied, you can run on another port but update the `API_URL` variable in `app.js` and `admin.js` accordingly.*

### Step 3: Run the Application
Simply double-click or open **`index.html`** in any modern web browser (Chrome, Edge, Firefox, Safari) to view the application live!
- Access the User Panel at: `index.html`
- Access the Admin Panel at: `admin.html`

---

## 🌟 Core Features & Grading Criteria Addressed

### 1. User Dashboard (`index.html` / `app.js`)
- **GET (Fetch & Display)**: Fetches all transaction records from JSON Server and displays them as clean interactive logs.
- **Dynamic Filtering**: Instantly filters your log entries by **Transaction Type** (All, Income, Expense), **Category** (Education, Food, Salary, Housing, etc.), AND **Month** (January - December).
- **User Monthly Summary Cards**: Renders 3 live summary cards for the selected month: **Total Deposits** (Income), **Total Expenses**, and **Net Savings** (Balance). These recalculate instantly on filter change.
- **POST (Add Record Form)**: A fully responsive insertion form featuring **6 input fields**:
  1. Transaction Title (Text input)
  2. Amount (Number input)
  3. Transaction Type (Dropdown Select)
  4. Category (Dropdown Select)
  5. Date of Transaction (Date input picker)
  6. Description / Note (Text area note)
- **Inline Validation**: Checks that fields are valid before posting (Title has $\ge 3$ characters, Amount $> 0$, options selected). Displayed inline with red highlights **without annoying `alert()` boxes**.
- **Auto-Rendering**: List immediately updates itself once a transaction is successfully written via POST.
- **Connection States**: Shows a custom CSS loading spinner while loading, and a readable offline error card with a **🔄 Retry Connection** button if JSON Server goes offline.

### 2. Admin Portal (`admin.html` / `admin.js`)
- **Visual Distinction**: Styled using a premium dark-indigo gradient navbar and distinct **Admin** badges to differentiate it clearly from the user dashboard.
- **Summary Statistics (4 Cards)**:
  1. **Net Balance**: The exact remaining balance (Incomes minus Expenses). Turns crimson if in a deficit.
  2. **Total Income**: Sum of all logged student incomes.
  3. **Total Expenses**: Sum of all logged student expenses.
  4. **Savings Rate (%)**: Calculates savings rate `(Net / Income) * 100`. Features dynamic color shifts: Green for healthy saving ($\ge 30\%$), Orange for moderate ($10\% - 30\%$), and Red for low saving ($< 10\%$).
- **PUT (Edit Resource)**: Click "✏️ Edit" on any record row to load its details into a beautiful blur-backdrop modal form, and save changes using an HTTP `PUT` request.
- **DELETE (Delete Resource)**: Click "🗑️ Delete" to open a confirm validation dialog. Approving sends an HTTP `DELETE` call to clear the row and updates the dashboard immediately.

### 3. Unified Technical Quality
- **Flexbox Only**: CSS is structured using a responsive, modern Flexbox system (no heavy grids, boots, or external frameworks).
- **Theme Persistence**: Complete dark mode implementation persisted in the user browser's `localStorage`.
- **Modern JavaScript**: Standardized on pure `async/await` syntax with proper `try/catch` error block guards and checks for `response.ok` on every single request.
- **No Console Debug Pollutions**: Cleaned and validated JavaScript files free of dead code blocks or left-behind `console.log` statements.

---

## 📸 App Screenshots Mockups
Once your app is running, capture screenshot clips and save them here!

### 1. User Dashboard (Light & Dark Mode)
`[Insert index.html Screenshot Here]`

### 2. Admin Management Panel & Stats
`[Insert admin.html Screenshot Here]`

### 3. Modal Edit Dialog
`[Insert Edit Modal Dialog Screenshot Here]`

---

## 🎓 Viva & Concept Discussion Cheat Sheet
During your Capstone presentation, be prepared to answer:
1. **How does `async/await` differ from `.then()`?**
   - *Answer:* `async/await` makes asynchronous code look and behave like synchronous code. It avoids nested "callback hell" and relies on standard `try/catch` syntax for cleaner error handling.
2. **What are the REST HTTP Methods and status codes we used?**
   - `GET`: Read resources (Returns status code `200 OK`)
   - `POST`: Create new resource (Returns status code `201 Created`)
   - `PUT`: Update a resource entirely (Returns status code `200 OK`)
   - `DELETE`: Remove a resource (Returns status code `200 OK` or `204 No Content`)
3. **Why do we check `response.ok`?**
   - *Answer:* `fetch()` only rejects a promise on network failures (e.g. server offline). If the server returns a `404 Not Found` or `500 Server Error`, fetch still succeeds! Checking `response.ok` validates if the status is in the 2xx range before we try to parse it.
