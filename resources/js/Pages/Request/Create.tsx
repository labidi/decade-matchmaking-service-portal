import React, { useEffect, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { UIRequestForm, UIField, Request as RequestFields } from '@/Forms/UIRequestForm';
import XHRMessageDialog from '@/Components/Dialog/XHRAlertDialog';
import axios from 'axios';
import { OCDRequest } from '@/types';

type Mode = 'submit' | 'draft';

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

  const getInputClass = (fieldName: keyof typeof form.errors) => {
    return `mt-2 block w-full border rounded ${form.errors[fieldName] ? 'border-red-600' : 'border-gray-300'}`;
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };


  const handleSubmitV2 = (mode: 'submit' | 'draft') => {
    form.clearErrors();
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
        if (responseXhr.response?.status === 422) {
          form.setError(responseXhr.response.data.errors);
          const stepsWithError: number[] = [];
          Object.keys(responseXhr.response.data.errors).forEach(field => {
            const idx = UIRequestForm.findIndex(step => step.fields[field]);
            if (idx !== -1 && !stepsWithError.includes(idx + 1)) {
              stepsWithError.push(idx + 1);
            }
          });
          setErrorSteps(stepsWithError);
          setXhrDialogResponseType('error');
          setXhrDialogResponseMessage('Please correct the highlighted errors.');
        } else {
          setXhrDialogResponseType('error');
          setXhrDialogResponseMessage(responseXhr.response?.data?.error || 'Something went wrong');
        }
      })
      .finally(() => {
        // window.history.replaceState(null, "Submit Request", "/request/create/" + form.data.id);
        setXhrDialogOpen(true);
      });

  };

  const renderField = (name: FormDataKeys, field: UIField) => {
    if (field.show && !field.show(form.data as unknown as RequestFields)) {
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
            router.visit(route(`user.request.myrequests`), { method: 'get' });
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