// App.js
import React, { useState, useEffect } from 'react';
import './Style.css';

// Helper function to format amount in Indian Rupees
const formatToRupees = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const MoneyTrackerPreview  = () => {
  // Initialize state with data from localStorage or empty array
  const [spendings, setSpendings] = useState(() => {
    const savedSpendings = localStorage.getItem('spendings');
    return savedSpendings ? JSON.parse(savedSpendings) : [
      { id: 1, amount: 4550, category: 'Groceries', date: '2024-12-20' },
      { id: 2, amount: 8999, category: 'Shopping', date: '2024-12-19' },
      { id: 3, amount: 2500, category: 'Food', date: '2024-12-18' }
    ];
  });

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => {
    // Set today's date as default
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Save to localStorage whenever spendings change
  useEffect(() => {
    localStorage.setItem('spendings', JSON.stringify(spendings));
  }, [spendings]);

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category || !date) {
      showNotification('Please fill all fields', 'error');
      return;
    }

    try {
      if (editId !== null) {
        setSpendings(spendings.map(spending => 
          spending.id === editId ? 
          { ...spending, amount: parseFloat(amount), category, date } : 
          spending
        ));
        showNotification('Spending updated successfully!', 'success');
        setEditId(null);
      } else {
        setSpendings([
          ...spendings,
          {
            id: Date.now(),
            amount: parseFloat(amount),
            category,
            date
          }
        ]);
        showNotification('New spending added successfully!', 'success');
      }

      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      showNotification('Error processing spending', 'error');
    }
  };

  const handleEdit = (spending) => {
    setEditId(spending.id);
    setAmount(spending.amount);
    setCategory(spending.category);
    setDate(spending.date);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this spending?')) {
      setSpendings(spendings.filter(spending => spending.id !== id));
      showNotification('Spending deleted successfully!', 'success');
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all spending data? This cannot be undone.')) {
      setSpendings([]);
      localStorage.removeItem('spendings');
      showNotification('All data cleared successfully!', 'success');
    }
  };

  const groupByMonth = (spendings) => {
    return spendings.reduce((groups, spending) => {
      const month = new Date(spending.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(spending);
      return groups;
    }, {});
  };

  const filteredSpendings = spendings.filter(spending =>
    spending.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spending.date.includes(searchTerm)
  );

  const groupedSpendings = groupByMonth(filteredSpendings);

  // Sort spendings by date (most recent first)
  Object.keys(groupedSpendings).forEach(month => {
    groupedSpendings[month].sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  return (
    <div className="money-tracker-container">
      <div className="header">
        <h1>Monthly Money Tracker</h1>
      </div>

      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-wrapper">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="input-field rupee-input"
              />
            </div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
              className="input-field"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="submit-button">
              {editId !== null ? 'Update' : 'Add'} Spending
            </button>
          </div>
        </form>
      </div>

      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search spendings..."
          className="search-input"
        />
        {spendings.length > 0 && (
          <button onClick={clearAllData} className="clear-data-button">
            Clear All Data
          </button>
        )}
      </div>

      {Object.entries(groupedSpendings).length === 0 ? (
        <div className="empty-state">
          <p>No spendings recorded yet. Start by adding your first spending!</p>
        </div>
      ) : (
        Object.entries(groupedSpendings).map(([month, monthSpendings]) => (
          <div key={month} className="month-group">
            <div className="month-header">
              <span className="month-title">{month}</span>
              <span className="month-total">
                Total: {formatToRupees(monthSpendings
                  .reduce((sum, spending) => sum + spending.amount, 0))}
              </span>
            </div>
            
            <div className="spending-list">
              {monthSpendings.map(spending => (
                <div key={spending.id} className="spending-item">
                  <div className="spending-details">
                    <span className="amount">{formatToRupees(spending.amount)}</span>
                    <span className="category">{spending.category}</span>
                    <span className="date">{spending.date}</span>
                  </div>
                  <div className="spending-actions">
                    <button
                      onClick={() => handleEdit(spending)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(spending.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MoneyTrackerPreview ;