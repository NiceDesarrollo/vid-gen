import { useState } from 'react';



export default function useForm(initialData = {}) {
  const [formData, setFormData] = useState(initialData);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleReset = () => {
    setFormData(initialData);
  };

  const updateField = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const isFormValid = () => {
    // Basic validation - can be customized per form
    return Object.values(formData).every(value => 
      value !== '' && value !== null && value !== undefined
    );
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    handleReset,
    updateField,
    isFormValid
  };
}
