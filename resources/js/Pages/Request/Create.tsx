import React, { useEffect, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { UIRequestForm, UIField, Request as RequestFields } from '@/Forms/UIRequestForm';
import XHRMessageDialog from '@/Components/Dialog/XHRAlertDialog';
import axios from 'axios';
import { OCDRequest } from '@/types';



type Mode = 'submit' | 'draft';

type ValidationRule = {
  field: string;
  message: string;
  condition?: () => boolean;
};

type RequestFormData = {
  request_data: OCDRequest
}

export default function RequestForm() {

  const ocdRequestFormData = usePage().props.request as OCDRequest;

  const form = useForm({
    id: '',
    is_partner: '',
    unique_id: '',
    first_name: '',
    last_name: '',
    email: '',
    capacity_development_title: '',
    has_significant_changes: '',
    changes_description: '',
    change_effect: '',
    request_link_type: '',
    project_stage: '',
    project_url: '',
    activity_name: '',
    related_activity: '',
    subthemes: [] as string[],
    subthemes_other: '',
    support_types: [] as string[],
    support_types_other: '',
    gap_description: '',
    has_partner: '',
    partner_name: '',
    partner_confirmed: '',
    needs_financial_support: '',
    budget_breakdown: '',
    support_months: '',
    completion_date: '',
    risks: '',
    personnel_expertise: '',
    direct_beneficiaries: '',
    direct_beneficiaries_number: '',
    expected_outcomes: '',
    success_metrics: '',
    long_term_impact: '',
  });


  type FormDataKeys = keyof typeof form.data;

  const [step, setStep] = useState(1);
  const steps = UIRequestForm.map((s) => s.label);
  const [errorSteps, setErrorSteps] = useState<number[]>([]);

  const [xhrdialogOpen, setXhrDialogOpen] = useState(false);
  const [xhrdialogResponseMessage, setXhrDialogResponseMessage] = useState('');
  const [xhrdialogResponseType, setXhrDialogResponseType] = useState<'success' | 'error' | 'info' | 'redirect'>('info');

  const isPartner = form.data.is_partner === 'Yes';

  const validationSchema: Record<number, ValidationRule[]> = {
    1: [
      { field: 'is_partner', message: 'This field is required.' },
      { field: 'first_name', message: 'This field is required.' },
      { field: 'last_name', message: 'This field is required.' },
      {
        field: 'email',
        message: 'This field is required.',
      },
      {
        field: 'email',
        message: 'Email format is invalid.',
        condition: () =>
          !!form.data.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.data.email),
      },
      ...(form.data.is_partner === 'Yes'
        ? [
          { field: 'unique_id', message: 'This field is required.' },
        ]
        : []),
    ],
    2: [
      ...(!isPartner
        ? [
          { field: 'request_link_type', message: 'This field is required.' },
          { field: 'project_stage', message: 'This field is required.' },
          { field: 'project_url', message: 'This field is required.' },
          { field: 'activity_name', message: 'This field is required.' },
        ]
        : []),
      ...(isPartner
        ? [
          { field: 'capacity_development_title', message: 'This field is required.' },
          { field: 'has_significant_changes', message: 'This field is required.' },
          { field: 'changes_description', message: 'This field is required.', condition: () => form.data.has_significant_changes === 'Yes' },
        ]
        : []),
    ],
    3: [
      { field: 'related_activity', message: 'This field is required.' },
      { field: 'subthemes', message: 'This field is required.', condition: () => form.data.subthemes.length === 0 },
      { field: 'support_types', message: 'This field is required.', condition: () => form.data.support_types.length === 0 },
      { field: 'gap_description', message: 'This field is required.' },
      ...(form.data.subthemes.includes('Other')
        ? [
          { field: 'subthemes_other', message: 'This field is required.' },
        ]
        : []),
      ...(form.data.support_types.includes('Other')
        ? [
          { field: 'support_types_other', message: 'This field is required.' },
        ]
        : []),
    ],
    4: [
      { field: 'has_partner', message: 'This field is required.' },
      ...(form.data.has_partner === 'Yes'
        ? [
          { field: 'partner_name', message: 'This field is required.' },
          { field: 'partner_confirmed', message: 'This field is required.' },
        ]
        : []),
      { field: 'needs_financial_support', message: 'This field is required.' },
      ...(form.data.needs_financial_support === 'Yes'
        ? [
          { field: 'budget_breakdown', message: 'This field is required.' },
          { field: 'support_months', message: 'This field is required.' },
          { field: 'completion_date', message: 'This field is required.' },
        ]
        : []),
    ],
    5: [
      { field: 'risks', message: 'This field is required.' },
      { field: 'personnel_expertise', message: 'This field is required.' },
      { field: 'direct_beneficiaries', message: 'This field is required.' },
      { field: 'direct_beneficiaries_number', message: 'This field is required.' },
      { field: 'expected_outcomes', message: 'This field is required.' },
      { field: 'success_metrics', message: 'This field is required.' },
      { field: 'long_term_impact', message: 'This field is required.' },
    ],
  };

  const isEmptyValue = (value: any): boolean => {
    return (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'boolean' && value === false)
    );
  };

  const validateAllSteps = (currentStep: unknown = null) => {
    const arrayErrorSteps: number[] = [];
    const stepsToValidate = currentStep ? [currentStep] : steps.map((_, idx) => idx + 1);
    let hasError = false;

    stepsToValidate.forEach((_, idx) => {
      const currentStep = idx + 1;
      const schema = validationSchema[currentStep];
      if (!schema) return;

      const fieldsWithError = new Set<string>();

      schema.forEach(({ field, message, condition }) => {
        const value = (form.data as Record<string, any>)[field];

        const shouldTrigger = condition
          ? condition() // ex: subthemes.length === 0
          : isEmptyValue(value); // required classique

        if (shouldTrigger) {
          form.setError(field as keyof typeof form.data, message);
          hasError = true;
          fieldsWithError.add(field);

          const errorStep = getErrorStepByField(field as keyof typeof form.data);
          if (!arrayErrorSteps.includes(errorStep)) {
            arrayErrorSteps.push(errorStep);
          }
        }
      });

      // Clear les erreurs pour les champs sans problème
      schema.forEach(({ field }) => {
        if (!fieldsWithError.has(field)) {
          form.clearErrors(field as keyof typeof form.data);
        }
      });
    });

    setErrorSteps(arrayErrorSteps);
    return !hasError;
  };


  const getErrorStepByField = (field: keyof typeof form.data): number => {
    for (const step in validationSchema) {
      const rules = validationSchema[step as unknown as number];
      if (rules.some(rule => rule.field === field)) {
        return parseInt(step, 10);
      }
    }
    return -1;
  };


  const validateForm = (currentMode: 'submit' | 'draft' = 'submit'): boolean => {
    form.clearErrors();

    const errors: Record<string, string> = {};

    if (currentMode === 'draft') return true;

    const schema = validationSchema[step as keyof typeof validationSchema];
    const allSchema = validationSchema as Record<number, ValidationRule[]>;
    if (!schema) return true;

    schema.forEach(({ field, message, condition }) => {
      // if (condition && !condition()) return;
      const value = (form.data as Record<string, any>)[field];
      if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0)
      ) {
        errors[field] = message;
      }
    });

    Object.entries(errors).forEach(([key, message]) => {
      form.setError(key as keyof typeof form.data, message);
    });

    return Object.keys(errors).length === 0;
  };

  const getInputClass = (fieldName: keyof typeof form.errors) => {
    return `mt-2 block w-full border rounded ${form.errors[fieldName] ? 'border-red-600' : 'border-gray-300'}`;
  };

  const handleNext = () => {
    setXhrDialogResponseMessage('');
    setXhrDialogResponseType('info');
    const isValid = validateAllSteps(step);
    if (isValid) {
      setStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setXhrDialogResponseMessage('');
    setXhrDialogResponseType('info');
    const isValid = validateAllSteps(step);
    if (isValid) {
      setStep(prev => Math.max(prev - 1, 1));
    }
  };


  const handleSubmitV2 = (mode: 'submit' | 'draft') => {
    const isValid = mode === 'submit' ? validateAllSteps() : true;
    // const isValid = validateForm(mode);
    if (isValid) {
      axios
        .post(
          route(`user.request.submit`, { mode }),
          { ...form.data },
          {
            headers: {
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
          }
        )
        .then(function (responseXhr) {
          form.setData('id', responseXhr.data.request_data.id);
          form.setData('unique_id', responseXhr.data.request_data.unique_id);
          setXhrDialogResponseMessage(responseXhr.data.request_data.message);

          if (mode === 'draft') {
            setXhrDialogResponseType('success');
            router.push({
              url: route(`user.request.edit`, { id: responseXhr.data.request_data.id }),
              clearHistory: false,
              encryptHistory: false,
              preserveScroll: true,
              preserveState: true,
            })
          } else {
            setXhrDialogResponseType('redirect');
          }
        })
        .catch(function (responseXhr) {
          setXhrDialogResponseType('error');
          setXhrDialogResponseMessage(responseXhr.response?.data?.error || 'Something went wrong');
        })
        .finally(() => {
          // window.history.replaceState(null, "Submit Request", "/request/create/" + form.data.id);
          setXhrDialogOpen(true);
        });
    }
  };

  const renderField = (name: FormDataKeys, field: UIField) => {
    if (field.show && !field.show(form.data as unknown as Request)) {
      return null;
    }
    const error = form.errors[name];
    const common = {
      id: field.id,
      required: field.required,
      className: getInputClass(name),
      value: (form.data as any)[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        form.setData(name, e.currentTarget.value),
    };

    switch (field.type) {
      case 'hidden':
        return (
          <input key={name} type="hidden" {...common} />
        );
      case 'text':
      case 'email':
      case 'url':
      case 'number':
      case 'date':
        return (
          <div key={name} className="mt-8">
            {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
            {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
            <input type={field.type} {...common} />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
        );
      case 'textarea':
        return (
          <div key={name} className="mt-8">
            {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
            {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
            <textarea {...common} />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
        );
      case 'select':
        return (
          <div key={name} className="mt-8">
            {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
            {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
            <select {...common}>
              <option value="">— Select —</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
        );
      case 'radio':
        return (
          <div key={name} className="mt-8">
            <label className="block font-medium">{field.label}</label>
            {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
            <div className="mt-2 space-x-6">
              {field.options?.map(opt => (
                <label key={opt.value} className="inline-flex items-center">
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={(form.data as any)[name] === opt.value}
                    onChange={e => form.setData(name, e.currentTarget.value)}
                    className={`form-radio ${error ? 'border-red-600' : 'border-gray-300'}`}
                  />
                  <span className={`ml-2 ${error ? 'text-red-600' : 'text-gray'}`}>{opt.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
        );
      case 'checkbox-group':
        return (
          <fieldset key={name} className="mt-8">
            <legend className="block font-medium mb-2">{field.label}</legend>
            {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {field.options?.map(opt => (
                <label key={opt.value} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className={`form-checkbox ${error ? 'border-red-600' : 'border-gray-300'}`}
                    checked={(form.data as any)[name].includes(opt.value)}
                    onChange={() => {
                      const arr = [...(form.data as any)[name]];
                      if (arr.includes(opt.value)) {
                        form.setData(name, arr.filter((i: string) => i !== opt.value));
                      } else {
                        form.setData(name, [...arr, opt.value]);
                      }
                    }}
                  />
                  <span className="ml-2">{opt.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </fieldset>
        );
      default:
        return null;
    }
  };



  useEffect(() => {
    if (ocdRequestFormData && ocdRequestFormData.id) {
      Object.entries(ocdRequestFormData.request_data).forEach(([key, value]) => {
        if (key in form.data) {
          form.setData(key as FormDataKeys, value || '');
        }
      });
    }
  }, []);

  return (
    <FrontendLayout>
      <Head title="Submit Request" />
      <XHRMessageDialog
        open={xhrdialogOpen}
        onOpenChange={setXhrDialogOpen}
        message={xhrdialogResponseMessage}
        type={xhrdialogResponseType}
        onConfirm={() => {
          setXhrDialogOpen(false);
          if (xhrdialogResponseType === 'redirect') {
            router.visit(route(`user.request.list`), { method: 'get' });
          }
        }}
      />
      <form className="mx-auto bg-white">
        {/* Stepper */}
        <div className="flex mb-6">
          {steps.map((label, idx) => (
            <div key={label} className="flex-1" onClick={() => { setStep(idx + 1) }}>
              <div
                className={`w-8 h-8 mx-auto rounded-full text-center leading-8 ${step === idx + 1 ? 'bg-firefly-600 text-white' : 'bg-firefly-200 text-gray-600'
                  } ${errorSteps.includes(idx + 1) && step !== idx + 1 ? 'bg-red-600 text-white' : ''}`}
              >
                {idx + 1}
              </div>
              <div className={`text-xl text-center mt-2 ${errorSteps.includes(idx + 1) && step !== idx + 1 ? 'text-red-600' : ''}`}>{label}</div>
            </div>
          ))}
        </div>
        {Object.entries(UIRequestForm[step - 1].fields).map(([key, field]) =>
          renderField(key as FormDataKeys, field)
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              handleSubmitV2('draft');
            }}
            disabled={form.processing}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          >
            {form.processing ? 'Saving...' : 'Save Draft'}
          </button>
          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700"
              disabled={form.processing}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                handleSubmitV2('submit');
              }}
              disabled={form.processing}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {form.processing ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </form>
    </FrontendLayout>
  );
}