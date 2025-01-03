"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Edit2, Save, X, MoreVertical, RotateCcw, Calculator, ShoppingCart, Package, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// ... (keep the formatIndianPrice and CalculatorDialog components from previous update)
const formatIndianPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(price).replace('INR', '₹');
};

const CalculatorDialog = ({ isOpen, onClose, currentTotal }) => {
  const [display, setDisplay] = useState('0');
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleNumber = (num) => {
    if (hasCalculated || display === '0') {
      setDisplay(num);
      setHasCalculated(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op) => {
    if (display !== 'Error') {
      const lastChar = display.slice(-1);
      if (!['+', '-', '*', '/'].includes(lastChar)) {
        setDisplay(display + op);
        setHasCalculated(false);
      }
    }
  };

  const calculate = () => {
    try {
      let expression = display;
      if (display.includes('total')) {
        expression = display.replace(/total/g, currentTotal.toString());
      }
      if (/^[0-9+\-*/.\s()total]+$/.test(expression)) {
        const result = eval(expression);
        if (isFinite(result)) {
          setDisplay(Number(result.toFixed(8)).toString());
        } else {
          setDisplay('Error');
        }
      } else {
        setDisplay('Error');
      }
      setHasCalculated(true);
    } catch (error) {
      setDisplay('Error');
      setHasCalculated(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setHasCalculated(false);
  };

  const handleBackspace = () => {
    if (display !== '0' && display !== 'Error') {
      if (display.length === 1 || hasCalculated) {
        setDisplay('0');
      } else {
        setDisplay(display.slice(0, -1));
      }
      setHasCalculated(false);
    }
  };

  const addTotal = () => {
    if (display === '0' || hasCalculated) {
      setDisplay('total');
    } else {
      const lastChar = display.slice(-1);
      if (!['+', '-', '*', '/'].includes(lastChar)) {
        setDisplay(display + '*total');
      } else {
        setDisplay(display + 'total');
      }
    }
    setHasCalculated(false);
  };

  const buttonConfig = [
    { label: 'C', onClick: clear, className: 'bg-red-500 hover:bg-red-600 text-white' },
    { label: '←', onClick: handleBackspace, className: 'bg-gray-500 hover:bg-gray-600 text-white' },
    { label: 'Total', onClick: addTotal, className: 'bg-blue-500 hover:bg-blue-600 text-white col-span-2' },
    { label: '7', onClick: () => handleNumber('7') },
    { label: '8', onClick: () => handleNumber('8') },
    { label: '9', onClick: () => handleNumber('9') },
    { label: '÷', onClick: () => handleOperator('/'), className: 'bg-violet-500 hover:bg-violet-600 text-white' },
    { label: '4', onClick: () => handleNumber('4') },
    { label: '5', onClick: () => handleNumber('5') },
    { label: '6', onClick: () => handleNumber('6') },
    { label: '×', onClick: () => handleOperator('*'), className: 'bg-violet-500 hover:bg-violet-600 text-white' },
    { label: '1', onClick: () => handleNumber('1') },
    { label: '2', onClick: () => handleNumber('2') },
    { label: '3', onClick: () => handleNumber('3') },
    { label: '-', onClick: () => handleOperator('-'), className: 'bg-violet-500 hover:bg-violet-600 text-white' },
    { label: '0', onClick: () => handleNumber('0') },
    { label: '.', onClick: () => handleNumber('.') },
    { label: '=', onClick: calculate, className: 'bg-green-500 hover:bg-green-600 text-white' },
    { label: '+', onClick: () => handleOperator('+'), className: 'bg-violet-500 hover:bg-violet-600 text-white' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-4 bg-gray-100">
          <DialogTitle>Calculator</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <div className="bg-gray-900 p-4 rounded-lg mb-4 text-right text-2xl font-mono break-all min-h-[80px] flex items-center justify-end text-white">
            {display}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {buttonConfig.map((btn, index) => (
              <Button
                key={index}
                onClick={btn.onClick}
                className={`
                  h-14 text-lg font-semibold rounded-lg transition-all duration-200
                  ${btn.className || 'bg-gray-200 hover:bg-gray-300 text-gray-800'}
                  ${btn.label === 'Total' ? 'col-span-2' : ''}
                  active:scale-95
                `}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FoodCalculator = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editingPrice, setEditingPrice] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // ... (keep all the existing state management functions)
  useEffect(() => {
    const savedItems = localStorage.getItem('foodItems');
    if (savedItems) {
      setSelectedItems(JSON.parse(savedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('foodItems', JSON.stringify(selectedItems));
  }, [selectedItems]);

  const updateQuantity = (id, value) => {
    setSelectedItems(items => items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, Number(value));
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const resetQuantities = () => {
    setSelectedItems(items => items.map(item => ({ ...item, quantity: 0 })));
  };

  const handleQuantityChange = (id, e) => {
    const value = e.target.value;
    if (value === '') {
      setSelectedItems(items => items.map(item =>
        item.id === id ? { ...item, quantity: value } : item
      ));
      return;
    }
    if (!isNaN(value)) {
      updateQuantity(id, value);
    }
  };

  const handleBlur = (id, e) => {
    const value = e.target.value;
    if (value === '' || isNaN(value)) {
      updateQuantity(id, 0);
    }
  };

  const incrementQuantity = (id) => {
    setSelectedItems(items => items.map(item =>
      item.id === id ? { ...item, quantity: Number(item.quantity || 0) + 1 } : item
    ));
  };

  const decrementQuantity = (id) => {
    setSelectedItems(items => items.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, Number(item.quantity || 0) - 1) } : item
    ));
  };

  const startEditing = (item) => {
    setEditingItem(item);
    setEditingPrice(item.price.toString());
    setShowEditDialog(true);
  };

  const handlePriceEditChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
      setEditingPrice(value);
    }
  };

  const saveNewPrice = () => {
    if (editingPrice !== '' && !isNaN(editingPrice) && Number(editingPrice) >= 0) {
      setSelectedItems(items => items.map(item =>
        item.id === editingItem.id
          ? { ...item, price: Number(parseFloat(editingPrice).toFixed(2)) }
          : item
      ));
    }
    setShowEditDialog(false);
    setEditingItem(null);
    setEditingPrice('');
  };

  const deleteItem = (id) => {
    setSelectedItems(items => items.filter(item => item.id !== id));
  };

  const addNewItem = () => {
    if (newItem.name && newItem.price && !isNaN(newItem.price) && Number(newItem.price) >= 0) {
      setSelectedItems(items => [...items, {
        ...newItem,
        id: Date.now() + Math.random(),
        quantity: 0,
        price: Number(parseFloat(newItem.price).toFixed(2))
      }]);
      setNewItem({ name: '', price: '' });
      setShowAddForm(false);
    }
  };

  const total = selectedItems.reduce((sum, item) =>
    sum + (item.price * (Number(item.quantity) || 0)), 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader className="bg-white rounded-t-lg border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-indigo-600" />
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Calculator
              </CardTitle>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all duration-200 hover:shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Item
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {showAddForm && (
            <div className="mb-6 bg-white p-6 rounded-lg shadow-md border border-indigo-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Item</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    placeholder="Enter price"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    min="0"
                    step="1"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addNewItem}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Add Item
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {selectedItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No items added yet</h3>
                <p className="text-gray-500">Click the "Add Item" button to get started</p>
              </div>
            ) : (
              selectedItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 hover:border-indigo-200 transition-all duration-200 hover:shadow-md"
                >
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-indigo-600 font-medium">
                        {formatIndianPrice(item.price)} each
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => decrementQuantity(item.id)}
                          className="h-8 w-8 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e)}
                          onBlur={(e) => handleBlur(item.id, e)}
                          className="w-16 p-2 text-center border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="0"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => incrementQuantity(item.id)}
                          className="h-8 w-8 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => startEditing(item)} className="text-blue-600">
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Price
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={resetQuantities}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCalculator(true)}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculator
                  </Button>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Total: {formatIndianPrice(total)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Edit Price for {editingItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <input
              type="number"
              value={editingPrice}
              onChange={handlePriceEditChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveNewPrice} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CalculatorDialog 
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        currentTotal={total}
      />
    </div>
  );
};

export default FoodCalculator;