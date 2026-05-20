import React, { useState } from "react";
import { LeadFormData, Lead, LeadStatus, LeadSource } from "../../types";
import { createLead, updateLead } from "../../services/leadService";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import toast from "react-hot-toast";

interface LeadFormProps {
  existingLead?: Lead;  // If provided, we're editing
  onSuccess: () => void;
  onCancel: () => void;
}

const statusOptions = [
  { value: "New", label: "New" },
  { value: "Contacted", label: "Contacted" },
  { value: "Qualified", label: "Qualified" },
  { value: "Lost", label: "Lost" },
];

const sourceOptions = [
  { value: "Website", label: "Website" },
  { value: "Instagram", label: "Instagram" },
  { value: "Referral", label: "Referral" },
];

const LeadForm: React.FC<LeadFormProps> = ({ existingLead, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<LeadFormData>({
    name: existingLead?.name || "",
    email: existingLead?.email || "",
    status: existingLead?.status || "New",
    source: existingLead?.source || "Website",
  });

  const [errors, setErrors] = useState<Partial<LeadFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Simple frontend validation
  const validate = (): boolean => {
    const newErrors: Partial<LeadFormData> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (existingLead) {
        await updateLead(existingLead._id, formData);
        toast.success("Lead updated successfully!");
      } else {
        await createLead(formData);
        toast.success("Lead created successfully!");
      }
      onSuccess();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || "Something went wrong.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="name"
        label="Full Name"
        placeholder="e.g. Rahul Sharma"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
      />
      <Input
        id="email"
        label="Email Address"
        type="email"
        placeholder="e.g. rahul@example.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
      />
      <Select
        id="source"
        label="Source"
        options={sourceOptions}
        value={formData.source}
        onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
      />
      <Select
        id="status"
        label="Status"
        options={statusOptions}
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {existingLead ? "Update Lead" : "Create Lead"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;
