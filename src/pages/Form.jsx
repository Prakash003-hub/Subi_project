import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button.jsx';
import { defaultContent } from '../data/defaultContent.js';
import { submitInquiry } from '../lib/contentApi.js';

function buildInitialValues(fields) {
  return fields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {});
}

function Form({ content = defaultContent }) {
  const formConfig = content.serviceForm || defaultContent.serviceForm;
  const fields = formConfig.fields?.length ? formConfig.fields : defaultContent.serviceForm.fields;
  const initialValues = useMemo(() => buildInitialValues(fields), [fields]);
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setValues(buildInitialValues(fields));
  }, [fields]);

  const handleChange = (name, value) => {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending request...');

    try {
      await submitInquiry({ fields: values, source: 'service-form' });
      setStatus('Request sent successfully. We will contact you soon.');
      setValues(buildInitialValues(fields));
    } catch (error) {
      setStatus(error.message || 'Unable to send the request right now.');
    }
  };

  return (
    <section className="page-content form-page">
      <div className="form-shell">
        <div className="form-hero">
          <span className="eyebrow">{formConfig.title}</span>
          <h2>{formConfig.heading || 'Tell us what your device needs.'}</h2>
          <p>{formConfig.description || 'Quick, clean and easy request entry for repair or installation support.'}</p>
        </div>

        <form className="service-form" onSubmit={handleSubmit}>
          {fields.map((field) => {
            if (field.type === 'textarea') {
              return (
                <label key={field.id}>
                  <span>{field.label}</span>
                  <textarea
                    rows="5"
                    placeholder={field.placeholder}
                    required={field.required}
                    value={values[field.name] || ''}
                    onChange={(event) => handleChange(field.name, event.target.value)}
                  />
                </label>
              );
            }

            if (field.type === 'select') {
              return (
                <label key={field.id}>
                  <span>{field.label}</span>
                  <select
                    required={field.required}
                    value={values[field.name] || ''}
                    onChange={(event) => handleChange(field.name, event.target.value)}
                  >
                    <option value="" disabled>
                      Select one
                    </option>
                    {(field.options || []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            return (
              <label key={field.id}>
                <span>{field.label}</span>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={values[field.name] || ''}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                />
              </label>
            );
          })}

          <Button variant="solid" type="submit">
            {formConfig.submitLabel || 'Submit Request'}
          </Button>
          {status ? <p className="form-status">{status}</p> : null}
        </form>
      </div>
    </section>
  );
}

export default Form;
