import { useEffect, useState } from 'react';
import Button from '../components/Button.jsx';
import {
  cloneDefaultContent,
  productIconMap,
  productImageOptions,
} from '../data/defaultContent.js';
import { loadInquiries, loginAdmin, saveContent } from '../lib/contentApi.js';

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function toOptions(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });
}

const collectionLabels = {
  posts: 'Posts',
  products: 'Products',
  services: 'Services',
  jobs: 'Jobs',
};

const collectionTemplates = {
  posts: {
    title: 'New Post',
    description: 'Write the post copy here.',
    price: 'Rs. 0',
    imageUrl: '',
  },
  products: {
    title: 'New Product',
    model: 'Model Name',
    price: 'Rs. 0',
    category: 'Accessories',
    description: 'Describe the product.',
    imageKey: 'cover',
    imageUrl: '',
  },
  services: {
    title: 'New Service',
    description: 'Describe the service.',
    imageUrl: '',
  },
  jobs: {
    title: 'New Job',
    description: 'Describe the role.',
    qualification: 'Qualification details',
    date: 'Apply by date',
    imageUrl: '',
  },
};

function ImagePicker({ label, value, onUrlChange, onFileChange, onClear, previewFallback, showUrlInput = true }) {
  return (
    <div className="image-picker">
      {showUrlInput ? (
        <label>
          <span>{label}</span>
          <input
            type="text"
            value={value}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="Paste image URL or use upload below"
          />
        </label>
      ) : (
        <span>{label}</span>
      )}
      <label>
        <span>Upload image</span>
        <input type="file" accept="image/*" onChange={onFileChange} />
      </label>
      <div className="image-picker-preview">
        {value ? <img src={value} alt="Preview" /> : previewFallback}
      </div>
      <Button variant="ghost" onClick={onClear}>
        Clear Image
      </Button>
    </div>
  );
}

function Admin({ content, onContentSaved, onNavigate }) {
  const [draft, setDraft] = useState(cloneDefaultContent());
  const [token, setToken] = useState(() => localStorage.getItem('subi-admin-token') || '');
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [inquiries, setInquiries] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [quickSection, setQuickSection] = useState('posts');
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: 'Rs. 0',
  });

  useEffect(() => {
    setDraft(content ? structuredClone(content) : cloneDefaultContent());
  }, [content]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let alive = true;

    async function refreshInquiries() {
      try {
        const nextInquiries = await loadInquiries(token);
        if (alive) {
          setInquiries(nextInquiries);
        }
      } catch (fetchError) {
        if (alive) {
          setError(fetchError.message || 'Unable to load inquiries.');
        }
      }
    }

    refreshInquiries();

    return () => {
      alive = false;
    };
  }, [token]);

  const isAuthed = Boolean(token);

  const updateCollectionItem = (section, index, field, value) => {
    setDraft((current) => ({
      ...current,
      [section]: current[section].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const updateCollectionImage = async (section, index, file) => {
    if (!file) {
      return;
    }

    const imageUrl = await fileToDataUrl(file);
    updateCollectionItem(section, index, 'imageUrl', imageUrl);
  };

  const updateFormMeta = (field, value) => {
    setDraft((current) => ({
      ...current,
      serviceForm: {
        ...current.serviceForm,
        [field]: value,
      },
    }));
  };

  const updateFormField = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      serviceForm: {
        ...current.serviceForm,
        fields: current.serviceForm.fields.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item,
        ),
      },
    }));
  };

  const updateFormFieldOptions = (index, value) => {
    updateFormField(index, 'options', toOptions(value));
  };

  const addItem = (section, template) => {
    setDraft((current) => ({
      ...current,
      [section]: [...current[section], { ...template, id: makeId(section) }],
    }));
  };

  const addFormField = () => {
    setDraft((current) => ({
      ...current,
      serviceForm: {
        ...current.serviceForm,
        fields: [
          ...current.serviceForm.fields,
          {
            id: makeId('field'),
            name: 'new_field',
            label: 'New Field',
            type: 'text',
            placeholder: '',
            required: true,
            options: [],
          },
        ],
      },
    }));
  };

  const removeItem = (section, index) => {
    setDraft((current) => ({
      ...current,
      [section]: current[section].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const removeFormField = (index) => {
    setDraft((current) => ({
      ...current,
      serviceForm: {
        ...current.serviceForm,
        fields: current.serviceForm.fields.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setStatus('Signing in...');
    setError('');

    try {
      const result = await loginAdmin(loginForm.username, loginForm.password);
      localStorage.setItem('subi-admin-token', result.token);
      setToken(result.token);
      setStatus(`Welcome back, ${result.username}.`);
    } catch (loginError) {
      setError(loginError.message || 'Login failed.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatus('Saving content...');
    setError('');

    try {
      const nextContent = await saveContent(draft);
      onContentSaved(nextContent);
      setStatus('Content saved locally.');
      const nextInquiries = await loadInquiries(token);
      setInquiries(nextInquiries);
    } catch (saveError) {
      setError(saveError.message || 'Unable to save content.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setDraft(cloneDefaultContent());
    setStatus('Draft reset to defaults.');
    setError('');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'subi-content.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setStatus('Exported content JSON.');
    setError('');
  };

  const handleQuickAdd = () => {
    addItem(quickSection, collectionTemplates[quickSection]);
    setStatus(`Added a new ${collectionLabels[quickSection].slice(0, -1).toLowerCase()}.`);
    setError('');
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();

    if (!newPost.title.trim() || !newPost.description.trim()) {
      setError('Please enter both a post name and description.');
      return;
    }

    const post = {
      id: makeId('post'),
      title: newPost.title.trim(),
      description: newPost.description.trim(),
      price: newPost.price.trim() || 'Rs. 0',
      imageUrl: newPost.imageUrl.trim(),
    };

    const nextContent = {
      ...draft,
      posts: [post, ...(draft.posts || [])],
    };

    setDraft(nextContent);
    setNewPost({
      title: '',
      description: '',
      imageUrl: '',
      price: 'Rs. 0',
    });
    setStatus('Creating post...');
    setError('');

    try {
      await saveContent(nextContent);
      onContentSaved(nextContent);
      setStatus('Post created and shown on the frontend.');
    } catch (saveError) {
      setError(saveError.message || 'Unable to create the post.');
    }
  };

  const loginPanel = (
    <section className="admin-panel">
      <div className="section-hero">
        <div>
          <span className="eyebrow">Admin Access</span>
          <h2>Sign in to manage site content</h2>
          <p>Use the admin credentials to edit posts, products, services, jobs and form inputs.</p>
        </div>
      </div>

      <form className="admin-login" onSubmit={handleLogin}>
        <label>
          <span>Username</span>
          <input
            type="text"
            value={loginForm.username}
            onChange={(event) => setLoginForm((current) => ({ ...current, username: event.target.value }))}
            placeholder="admin"
          />
        </label>
        <label>
          <span>Password</span>
          <input
            type="password"
            value={loginForm.password}
            onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="admin123"
          />
        </label>
        <Button variant="solid" type="submit">
          Login
        </Button>
      </form>
      <p className="admin-note">
        Default local credentials: <strong>admin / admin123</strong>. In frontend-only mode, changes are saved in this
        browser and can be exported as JSON for GitHub.
      </p>
      {error ? <p className="form-status error">{error}</p> : null}
    </section>
  );

  if (!isAuthed) {
    return loginPanel;
  }

  return (
    <section className="page-content admin-page">
      <div className="section-hero admin-header">
        <div>
          <span className="eyebrow">Admin Dashboard</span>
          <h2>Control the site content from one place</h2>
          <p>Edit the collections, export the JSON, and keep the front-end synced without a database.</p>
        </div>
        <div className="admin-actions">
          <Button variant="outline" onClick={() => onNavigate('home')}>
            Back to site
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem('subi-admin-token');
              setToken('');
              setStatus('Logged out.');
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="admin-toolbar">
        <Button variant="solid" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
        <Button variant="outline" onClick={handleExport}>
          Export JSON
        </Button>
        <Button variant="ghost" onClick={handleReset}>
          Reset Draft
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const nextInquiries = await loadInquiries(token);
            setInquiries(nextInquiries);
          }}
        >
          Refresh Inquiries
        </Button>
      </div>

      {status ? <p className="form-status">{status}</p> : null}
      {error ? <p className="form-status error">{error}</p> : null}

      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Create Post</p>
            <h3>Add a new feed post</h3>
          </div>
        </div>

        <form className="admin-card admin-create-post" onSubmit={handleCreatePost}>
          <label>
            <span>Post name</span>
            <input
              type="text"
              value={newPost.title}
              onChange={(event) => setNewPost((current) => ({ ...current, title: event.target.value }))}
              placeholder="New product launch"
            />
          </label>
          <label>
            <span>Description</span>
            <textarea
              rows="4"
              value={newPost.description}
              onChange={(event) => setNewPost((current) => ({ ...current, description: event.target.value }))}
              placeholder="Write the post description"
            />
          </label>
          <label>
            <span>Price</span>
            <input
              type="text"
              value={newPost.price}
              onChange={(event) => setNewPost((current) => ({ ...current, price: event.target.value }))}
              placeholder="Rs. 0"
            />
          </label>
          <ImagePicker
            label="Image upload"
            value={newPost.imageUrl}
            onUrlChange={(value) => setNewPost((current) => ({ ...current, imageUrl: value }))}
            onFileChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }
              const imageUrl = await fileToDataUrl(file);
              setNewPost((current) => ({ ...current, imageUrl }));
              event.target.value = '';
            }}
            onClear={() => setNewPost((current) => ({ ...current, imageUrl: '' }))}
            previewFallback={<div className="post-placeholder">Image preview</div>}
            showUrlInput={false}
          />
          <Button variant="solid" type="submit">
            Create Post
          </Button>
        </form>
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Quick Add</p>
            <h3>Create content fast</h3>
          </div>
        </div>
        <div className="admin-toolbar">
          <label className="admin-inline-field">
            <span>Collection</span>
            <select value={quickSection} onChange={(event) => setQuickSection(event.target.value)}>
              {Object.entries(collectionLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Button variant="solid" onClick={handleQuickAdd}>
            Add New Item
          </Button>
        </div>
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Posts</p>
            <h3>Instagram feed content</h3>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              addItem('posts', {
                title: 'New Post',
                description: 'Write the post copy here.',
                price: 'Rs. 0',
                imageUrl: '',
              })
            }
          >
            Add Post
          </Button>
        </div>

        <div className="admin-list">
          {draft.posts.map((post, index) => (
            <article className="admin-card" key={post.id}>
              <label>
                <span>Title</span>
                <input
                  type="text"
                  value={post.title}
                  onChange={(event) => updateCollectionItem('posts', index, 'title', event.target.value)}
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  rows="3"
                  value={post.description}
                  onChange={(event) => updateCollectionItem('posts', index, 'description', event.target.value)}
                />
              </label>
              <label>
                <span>Price</span>
                <input
                  type="text"
                  value={post.price}
                  onChange={(event) => updateCollectionItem('posts', index, 'price', event.target.value)}
                />
              </label>
              <ImagePicker
                label="Image upload"
                value={post.imageUrl || ''}
                onUrlChange={(value) => updateCollectionItem('posts', index, 'imageUrl', value)}
                onFileChange={async (event) => {
                  const file = event.target.files?.[0];
                  await updateCollectionImage('posts', index, file);
                  event.target.value = '';
                }}
                onClear={() => updateCollectionItem('posts', index, 'imageUrl', '')}
                previewFallback={<div className="post-placeholder">Image preview</div>}
                showUrlInput={false}
              />
              <Button variant="outline" onClick={() => removeItem('posts', index)}>
                Remove
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Products</p>
            <h3>Accessory catalog</h3>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              addItem('products', {
                title: 'New Product',
                model: 'Model Name',
                price: 'Rs. 0',
                category: 'Accessories',
                description: 'Describe the product.',
                imageKey: 'cover',
                imageUrl: '',
              })
            }
          >
            Add Product
          </Button>
        </div>

        <div className="admin-list">
          {draft.products.map((product, index) => (
            <article className="admin-card" key={product.id}>
              <label>
                <span>Title</span>
                <input
                  type="text"
                  value={product.title}
                  onChange={(event) => updateCollectionItem('products', index, 'title', event.target.value)}
                />
              </label>
              <label>
                <span>Model</span>
                <input
                  type="text"
                  value={product.model}
                  onChange={(event) => updateCollectionItem('products', index, 'model', event.target.value)}
                />
              </label>
              <label>
                <span>Category</span>
                <input
                  type="text"
                  value={product.category}
                  onChange={(event) => updateCollectionItem('products', index, 'category', event.target.value)}
                />
              </label>
              <label>
                <span>Price</span>
                <input
                  type="text"
                  value={product.price}
                  onChange={(event) => updateCollectionItem('products', index, 'price', event.target.value)}
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  rows="3"
                  value={product.description}
                  onChange={(event) => updateCollectionItem('products', index, 'description', event.target.value)}
                />
              </label>
              <label>
                <span>Icon</span>
                <select
                  value={product.imageKey}
                  onChange={(event) => updateCollectionItem('products', index, 'imageKey', event.target.value)}
                >
                  {productImageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <ImagePicker
                label="Image URL"
                value={product.imageUrl || ''}
                onUrlChange={(value) => updateCollectionItem('products', index, 'imageUrl', value)}
                onFileChange={async (event) => {
                  const file = event.target.files?.[0];
                  await updateCollectionImage('products', index, file);
                  event.target.value = '';
                }}
                onClear={() => updateCollectionItem('products', index, 'imageUrl', '')}
                previewFallback={<div className="product-icon">{productIconMap[product.imageKey] || '🛍️'}</div>}
              />
              <Button variant="outline" onClick={() => removeItem('products', index)}>
                Remove
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Services</p>
            <h3>Service catalog</h3>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              addItem('services', {
                title: 'New Service',
                description: 'Describe the service.',
                imageUrl: '',
              })
            }
          >
            Add Service
          </Button>
        </div>

        <div className="admin-list">
          {draft.services.map((service, index) => (
            <article className="admin-card" key={service.id}>
              <label>
                <span>Title</span>
                <input
                  type="text"
                  value={service.title}
                  onChange={(event) => updateCollectionItem('services', index, 'title', event.target.value)}
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  rows="4"
                  value={service.description}
                  onChange={(event) => updateCollectionItem('services', index, 'description', event.target.value)}
                />
              </label>
              <ImagePicker
                label="Image URL"
                value={service.imageUrl || ''}
                onUrlChange={(value) => updateCollectionItem('services', index, 'imageUrl', value)}
                onFileChange={async (event) => {
                  const file = event.target.files?.[0];
                  await updateCollectionImage('services', index, file);
                  event.target.value = '';
                }}
                onClear={() => updateCollectionItem('services', index, 'imageUrl', '')}
                previewFallback={<div className="product-icon">🛠️</div>}
              />
              <Button variant="outline" onClick={() => removeItem('services', index)}>
                Remove
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Jobs</p>
            <h3>Career listings</h3>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              addItem('jobs', {
                title: 'New Job',
                description: 'Describe the role.',
                qualification: 'Qualification details',
                date: 'Apply by date',
                imageUrl: '',
              })
            }
          >
            Add Job
          </Button>
        </div>

        <div className="admin-list">
          {draft.jobs.map((job, index) => (
            <article className="admin-card" key={job.id}>
              <label>
                <span>Title</span>
                <input
                  type="text"
                  value={job.title}
                  onChange={(event) => updateCollectionItem('jobs', index, 'title', event.target.value)}
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  rows="4"
                  value={job.description}
                  onChange={(event) => updateCollectionItem('jobs', index, 'description', event.target.value)}
                />
              </label>
              <label>
                <span>Qualification</span>
                <input
                  type="text"
                  value={job.qualification}
                  onChange={(event) => updateCollectionItem('jobs', index, 'qualification', event.target.value)}
                />
              </label>
              <label>
                <span>Date</span>
                <input
                  type="text"
                  value={job.date}
                  onChange={(event) => updateCollectionItem('jobs', index, 'date', event.target.value)}
                />
              </label>
              <ImagePicker
                label="Image URL"
                value={job.imageUrl || ''}
                onUrlChange={(value) => updateCollectionItem('jobs', index, 'imageUrl', value)}
                onFileChange={async (event) => {
                  const file = event.target.files?.[0];
                  await updateCollectionImage('jobs', index, file);
                  event.target.value = '';
                }}
                onClear={() => updateCollectionItem('jobs', index, 'imageUrl', '')}
                previewFallback={<div className="product-icon">💼</div>}
              />
              <Button variant="outline" onClick={() => removeItem('jobs', index)}>
                Remove
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Service Form</p>
            <h3>Input fields shown to customers</h3>
          </div>
        </div>

        <div className="admin-card admin-form-meta">
          <label>
            <span>Title</span>
            <input
              type="text"
              value={draft.serviceForm.title}
              onChange={(event) => updateFormMeta('title', event.target.value)}
            />
          </label>
          <label>
            <span>Heading</span>
            <input
              type="text"
              value={draft.serviceForm.heading}
              onChange={(event) => updateFormMeta('heading', event.target.value)}
            />
          </label>
          <label>
            <span>Description</span>
            <textarea
              rows="3"
              value={draft.serviceForm.description}
              onChange={(event) => updateFormMeta('description', event.target.value)}
            />
          </label>
          <label>
            <span>Submit label</span>
            <input
              type="text"
              value={draft.serviceForm.submitLabel}
              onChange={(event) => updateFormMeta('submitLabel', event.target.value)}
            />
          </label>
        </div>

        <div className="section-heading">
          <div>
            <h4>Fields</h4>
          </div>
          <Button variant="outline" onClick={addFormField}>
            Add Field
          </Button>
        </div>

        <div className="admin-list">
          {draft.serviceForm.fields.map((field, index) => (
            <article className="admin-card" key={field.id}>
              <label>
                <span>Field name</span>
                <input
                  type="text"
                  value={field.name}
                  onChange={(event) => updateFormField(index, 'name', event.target.value)}
                />
              </label>
              <label>
                <span>Label</span>
                <input
                  type="text"
                  value={field.label}
                  onChange={(event) => updateFormField(index, 'label', event.target.value)}
                />
              </label>
              <label>
                <span>Type</span>
                <select value={field.type} onChange={(event) => updateFormField(index, 'type', event.target.value)}>
                  <option value="text">Text</option>
                  <option value="tel">Phone</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Select</option>
                </select>
              </label>
              <label>
                <span>Placeholder</span>
                <input
                  type="text"
                  value={field.placeholder}
                  onChange={(event) => updateFormField(index, 'placeholder', event.target.value)}
                />
              </label>
              <label>
                <span>Options</span>
                <textarea
                  rows="3"
                  value={(field.options || []).join(', ')}
                  onChange={(event) => updateFormFieldOptions(index, event.target.value)}
                  placeholder="Only for select fields, comma separated"
                />
              </label>
              <label className="inline-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(field.required)}
                  onChange={(event) => updateFormField(index, 'required', event.target.checked)}
                />
                <span>Required</span>
              </label>
              <Button variant="outline" onClick={() => removeFormField(index)}>
                Remove
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Submissions</p>
            <h3>Latest form requests</h3>
          </div>
          <span className="admin-count">{inquiries.length} request(s)</span>
        </div>

        <div className="admin-inquiries">
          {inquiries.length ? (
            inquiries.map((inquiry) => (
              <article className="inquiry-card" key={inquiry.id}>
                <strong>{new Date(inquiry.submittedAt).toLocaleString()}</strong>
                <pre>{JSON.stringify(inquiry.fields, null, 2)}</pre>
              </article>
            ))
          ) : (
            <p className="admin-note">No submissions yet.</p>
          )}
        </div>
      </section>
    </section>
  );
}

export default Admin;
