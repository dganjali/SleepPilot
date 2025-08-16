import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../src/components/ui/dialog";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Textarea } from "../../src/components/ui/textarea";
import { Label } from "../../src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../src/components/ui/select";

export default function AddRecommendationDialog({ open, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    target_value: "",
    priority: "medium"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.title || !formData.description) return;
    
    onAdd(formData);
    setFormData({
      category: "",
      title: "",
      description: "",
      target_value: "",
      priority: "medium"
    });
  };

  const categories = [
    { value: "temperature", label: "Temperature Control" },
    { value: "lighting", label: "Lighting Management" },
    { value: "sound", label: "Sound Environment" },
    { value: "humidity", label: "Humidity Control" },
    { value: "routine", label: "Sleep Routine" }
  ];

  const priorities = [
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Add Custom Recommendation</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-200">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-200">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter recommendation title"
              className="bg-slate-700 border-slate-600"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-200">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the recommendation in detail"
              className="bg-slate-700 border-slate-600 h-20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_value" className="text-slate-200">Target Value (Optional)</Label>
            <Input
              id="target_value"
              value={formData.target_value}
              onChange={(e) => setFormData({...formData, target_value: e.target.value})}
              placeholder="e.g., 20°C, 30 dB, 10:30 PM"
              className="bg-slate-700 border-slate-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-slate-200">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
              Add Recommendation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}