"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Edit2, Save, X, MoreVertical, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const FoodCalculator = () => {
  const formatIndianPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(price).replace('INR', '₹');
  };

  const [selectedItems, setSelectedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editingPrice, setEditingPrice] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Price Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-500 hover:bg-blue-600 w-full md:w-auto"
            >
              Add New Item
            </Button>
          </div>

          {showAddForm && (
            <div className="p-3 md:p-4 border rounded bg-gray-50">
              <div className="flex flex-col space-y-3">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    placeholder="Enter price"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full p-2 border rounded"
                    step="1"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="w-full md:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addNewItem}
                  className="bg-blue-500 hover:bg-blue-600 w-full md:w-auto"
                >
                  Add Item
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {selectedItems.map(item => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded hover:bg-gray-50 gap-4">
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">{formatIndianPrice(item.price)} each</p>
                </div>
                <div className="flex items-center gap-4 self-end md:self-auto">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => decrementQuantity(item.id)}
                      className="h-8 w-8"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e)}
                      onBlur={(e) => handleBlur(item.id, e)}
                      className="w-16 p-2 text-center border rounded"
                      placeholder="0"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => incrementQuantity(item.id)}
                      className="h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEditing(item)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Price
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => deleteItem(item.id)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Delete Item
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={resetQuantities}
              className="w-auto"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
            <div className="text-xl font-semibold">
              Total: {formatIndianPrice(total)}
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Price for {editingItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <input
              type="number"
              value={editingPrice}
              onChange={handlePriceEditChange}
              className="w-full p-2 border rounded"
              min="0"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveNewPrice} className="bg-green-500 hover:bg-green-600">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FoodCalculator;