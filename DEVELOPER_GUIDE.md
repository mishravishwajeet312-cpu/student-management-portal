# Developer Guide

## 👨‍💻 For Developers: Code Walkthrough

### Quick Navigation

1. [File Structure](#file-structure)
2. [Component Breakdown](#component-breakdown)
3. [How Each Feature Works](#how-each-feature-works)
4. [Common Tasks](#common-tasks)
5. [Debugging](#debugging)

---

## 📂 File Structure

### Entry Point Flow
```
index.html
  ↓
src/main.jsx (React entry)
  ↓
src/App.jsx (Main component)
  ↓
src/components/ (Sub-components)
  ↓
src/index.css (Styling)
```

---

## 🔧 Component Breakdown

### App.jsx - The Brain

**Lines 1-10:** Imports
```javascript
import React, { useState, useEffect } from 'react';
```

**Lines 12-42:** State variables
```javascript
const [students, setStudents] = useState([]);        // Student list
const [editingStudent, setEditingStudent] = useState(null);  // Edit mode
const [isLoading, setIsLoading] = useState(true);    // Loading indicator
```

**Lines 45-54:** Loading simulation
```javascript
useEffect(() => {
  setTimeout(() => {
    setStudents(initialStudents);  // Load initial data
    setIsLoading(false);            // Stop showing spinner
  }, 1500);                         // Wait 1.5 seconds
}, []);                            // Run only on mount
```

**Lines 58-67:** Add or update student
```javascript
const handleAddOrUpdateStudent = (formData) => {
  if (editingStudent) {
    // Update existing: find and replace
    setStudents(students.map(s => 
      s.id === editingStudent.id ? {...s, ...formData} : s
    ));
  } else {
    // Add new: create ID and append
    const newStudent = {
      id: Math.max(...students.map(s => s.id), 0) + 1,
      ...formData
    };
    setStudents([...students, newStudent]);
  }
};
```

**Lines 70-72:** Edit handler
```javascript
const handleEditStudent = (student) => {
  setEditingStudent(student);  // Set student to edit mode
  window.scrollTo({ top: 0 }); // Scroll to form
};
```

**Lines 75-81:** Delete handler
```javascript
const handleDeleteStudent = (id) => {
  // Filter out the deleted student
  setStudents(students.filter(student => student.id !== id));
};
```

---

### StudentForm.jsx - Input Processing

**Key validation function:**
```javascript
// Email validation using regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check each field
const validateForm = () => {
  const newErrors = {};
  
  if (!formData.name.trim()) newErrors.name = 'Required';
  if (!formData.email.trim()) newErrors.email = 'Required';
  else if (!isValidEmail(formData.email)) newErrors.email = 'Invalid format';
  if (!formData.age) newErrors.age = 'Required';
  else if (isNaN(formData.age) || formData.age <= 0) newErrors.age = 'Must be > 0';
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**Form submission:**
```javascript
const handleSubmit = (e) => {
  e.preventDefault();  // Prevent page reload
  
  if (validateForm()) {
    onSubmit({         // Send to parent (App.jsx)
      name: formData.name.trim(),
      email: formData.email.trim(),
      age: parseInt(formData.age)
    });
    
    // Reset form
    setFormData({ name: '', email: '', age: '' });
    setErrors({});
  }
};
```

---

### StudentTable.jsx - Display & Export

**Delete confirmation modal:**
```javascript
const handleDeleteClick = (student) => {
  setConfirmDelete(student);  // Show modal
};

const confirmDeleteAction = () => {
  onDelete(confirmDelete.id); // Call parent delete
  setConfirmDelete(null);     // Hide modal
};

// In JSX: {confirmDelete && <modal />} render conditionally
```

**Excel export function:**
```javascript
const handleDownloadExcel = () => {
  // Transform data
  const excelData = students.map(student => ({
    Name: student.name,
    Email: student.email,
    Age: student.age
  }));
  
  // Create worksheet from JSON
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 },  // Name width
    { wch: 25 },  // Email width
    { wch: 10 }   // Age width
  ];
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  
  // Download file
  const fileName = `Students_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
```

---

## 🎯 How Each Feature Works

### Feature: Loading Spinner

**Question:** How does the spinner show for 1.5 seconds?

**Answer:**
```javascript
// In App.jsx useEffect:
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => {
    setStudents(initialStudents);
    setIsLoading(false);  // Hide spinner
  }, 1500);  // 1500ms = 1.5 seconds
  
  return () => clearTimeout(timer);  // Clean up
}, []);  // Run only once on mount
```

**In JSX:**
```javascript
if (isLoading) {
  return <div className="loading">Loading...</div>;
}
return <div>Content after loading</div>;
```

---

### Feature: Form Validation

**Question:** How does validation prevent invalid data?

**Answer:**
1. User types → `handleChange` called
2. Error for that field clears
3. User clicks submit → `handleSubmit` called
4. `validateForm()` checks all fields
5. If errors exist, show them and don't call `onSubmit`
6. If valid, call parent's `onSubmit` with clean data

**Error display:**
```javascript
<input className={errors.name ? 'error' : ''} />
{errors.name && <span className="error-message">{errors.name}</span>}
```

---

### Feature: Edit Mode

**Question:** How does pre-filling work when editing?

**Answer:**
```javascript
// In StudentForm.jsx
useEffect(() => {
  if (editingStudent) {
    // Pre-fill form with selected student
    setFormData({
      name: editingStudent.name,
      email: editingStudent.email,
      age: editingStudent.age
    });
  }
}, [editingStudent]);  // Run when editingStudent changes
```

---

### Feature: Delete Confirmation

**Question:** Why show a confirmation dialog?

**Answer:** Prevent accidental deletions. User flow:
1. Click Delete button
2. `handleDeleteClick(student)` shows modal
3. Modal blocks interaction with page
4. User confirms or cancels
5. If confirmed, `onDelete()` is called

**Modal implementation:**
```javascript
{confirmDelete && (  // Conditional render
  <div className="modal-overlay" onClick={cancelDelete}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      {/* Modal content */}
    </div>
  </div>
)}
```

---

### Feature: Excel Download

**Question:** How does Excel export work?

**Answer:**
1. Click "Download Excel"
2. Transform student data to export format
3. Create Excel worksheet from data
4. Create workbook and add worksheet
5. Use SheetJS to write file to disk
6. Browser downloads file automatically

---

## 🛠️ Common Tasks

### Task 1: Add a New Column to Student Table

**Step 1:** Add field to initial data
```javascript
// src/data/students.js
{ id: 1, name: "Rahul", email: "rahul@gmail.com", age: 21, phone: "9876543210" }
```

**Step 2:** Update form
```javascript
// src/components/StudentForm.jsx
const [formData, setFormData] = useState({
  name: '', email: '', age: '', phone: ''
});

// Add input field
<input name="phone" value={formData.phone} onChange={handleChange} />

// Add validation
if (!formData.phone) newErrors.phone = 'Required';
```

**Step 3:** Update table
```javascript
// src/components/StudentTable.jsx
<th>Phone</th>  // Add to table header
<td>{student.phone}</td>  // Add to table body
```

**Step 4:** Update Excel export
```javascript
const excelData = students.map(student => ({
  Name: student.name,
  Email: student.email,
  Age: student.age,
  Phone: student.phone  // Add this
}));
```

---

### Task 2: Change Primary Color

**In src/index.css:**
```css
/* Find these and change */
.button-primary {
  background-color: #667eea;  /* Change this hex color */
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Change both colors */
}
```

---

### Task 3: Add Search Feature

**Step 1:** Add state to App.jsx
```javascript
const [searchTerm, setSearchTerm] = useState('');
```

**Step 2:** Filter students before passing to table
```javascript
const filteredStudents = students.filter(student =>
  student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  student.email.toLowerCase().includes(searchTerm.toLowerCase())
);

<StudentTable students={filteredStudents} ... />
```

**Step 3:** Add search input
```javascript
<input 
  type="text" 
  placeholder="Search by name or email"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

---

### Task 4: Add Dark Mode

**Step 1:** Add state
```javascript
const [isDarkMode, setIsDarkMode] = useState(false);
```

**Step 2:** Add CSS for dark mode
```css
.app.dark-mode {
  background: #1a1a1a;
}
.app.dark-mode .app-container {
  background: #2a2a2a;
  color: #fff;
}
```

**Step 3:** Toggle button
```javascript
<button onClick={() => setIsDarkMode(!isDarkMode)}>
  {isDarkMode ? '☀️' : '🌙'}
</button>
```

**Step 4:** Apply class
```javascript
<div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
```

---

### Task 5: Add Pagination

**Step 1:** Add state
```javascript
const [currentPage, setCurrentPage] = useState(1);
const studentsPerPage = 5;
```

**Step 2:** Calculate pagination
```javascript
const indexOfLastStudent = currentPage * studentsPerPage;
const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
const totalPages = Math.ceil(students.length / studentsPerPage);
```

**Step 3:** Add navigation
```javascript
<button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
  Previous
</button>
<span>Page {currentPage} of {totalPages}</span>
<button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
  Next
</button>
```

**Step 4:** Pass filtered data
```javascript
<StudentTable students={currentStudents} ... />
```

---

## 🐛 Debugging

### Debug Tip 1: View State in Console

Add to any component:
```javascript
useEffect(() => {
  console.log('Students:', students);
  console.log('Editing:', editingStudent);
  console.log('Loading:', isLoading);
}, [students, editingStudent, isLoading]);
```

---

### Debug Tip 2: Check Form Values

Add to StudentForm.jsx:
```javascript
useEffect(() => {
  console.log('Form Data:', formData);
  console.log('Errors:', errors);
}, [formData, errors]);
```

---

### Debug Tip 3: Use Browser DevTools

```javascript
// In browser console:
// Check React components
$r.state  // See current state

// Check props passed
$r.props

// Trigger re-render
$r.forceUpdate()
```

---

### Common Issues & Solutions

**Issue: Spinner won't disappear**
```javascript
// Check: Is loading state being set to false?
console.log(isLoading);  // Should be false after 1.5s
```

**Issue: Form validation not triggering**
```javascript
// Check: Is validateForm() returning true/false?
console.log('Valid:', validateForm());
```

**Issue: Edit form not pre-filling**
```javascript
// Check: Is useEffect running?
useEffect(() => {
  console.log('Edit effect running');
  if (editingStudent) console.log('Student:', editingStudent);
}, [editingStudent]);
```

**Issue: Delete not working**
```javascript
// Check: Is modal showing?
console.log('Confirm Delete:', confirmDelete);
```

**Issue: Excel not downloading**
```javascript
// Check: Is SheetJS loaded?
console.log('XLSX:', XLSX);

// Check: Data format
console.log('Export Data:', excelData);
```

---

## 📚 Best Practices Used

1. **Separation of Concerns**
   - App.jsx: State management
   - StudentForm.jsx: Input handling
   - StudentTable.jsx: Display and export

2. **Reusable Components**
   - Form used for both add and edit
   - Same validation rules

3. **Clear Naming**
   - `handleAddOrUpdateStudent` clearly shows purpose
   - `validateForm` self-explanatory
   - `isValidEmail` specific function

4. **Comments**
   - Complex logic has comments
   - JSDoc-style comments for functions
   - Inline comments for clarity

5. **Performance**
   - Minimal re-renders
   - Proper cleanup in useEffect
   - Efficient array operations

---

## 🎓 Learning Resources

### React Hooks
- `useState`: State management
- `useEffect`: Side effects and lifecycle

### JavaScript
- Array methods: `map()`, `filter()`, `find()`
- Spread operator: `...`
- Ternary operator: `condition ? true : false`

### CSS
- Flexbox for layouts
- CSS Grid for form layout
- Media queries for responsiveness
- CSS animations

---

**Happy Coding! 🚀**
