import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'web',
    budget: '1k-5k',
    message: '',
    newsletter: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [shakeForm, setShakeForm] = useState(false);

  // Dashboard States
  const [submissions, setSubmissions] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

  // Fetch submissions from backend
  const fetchSubmissions = async () => {
    setIsLoadingDashboard(true);
    try {
      const response = await fetch(`${API_BASE}/proposals`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des propositions:', err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Validation
  const validateField = (name, value) => {
    let error = '';
    if (name === 'name') {
      if (!value.trim()) error = 'Le nom est requis.';
      else if (value.trim().length < 2) error = 'Le nom doit contenir au moins 2 caractères.';
    } else if (name === 'email') {
      if (!value.trim()) error = "L'adresse email est requise.";
      else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = "L'adresse email n'est pas valide.";
      }
    } else if (name === 'message') {
      if (!value.trim()) error = 'Veuillez décrire votre projet.';
      else if (value.trim().length < 10) error = 'La description doit faire au moins 10 caractères.';
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));

    // Supprimer l'erreur en temps réel si l'input devient valide
    const error = validateField(name, val);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const selectBudget = (budgetVal) => {
    setFormData(prev => ({
      ...prev,
      budget: budgetVal
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Valider tous les champs avant soumission
    const formErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) formErrors[key] = error;
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 500);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
        // Réinitialiser le formulaire
        setFormData({
          name: '',
          email: '',
          projectType: 'web',
          budget: '1k-5k',
          message: '',
          newsletter: false
        });
        setErrors({});
        fetchSubmissions(); // Mettre à jour le dashboard
      } else {
        setSubmitError(result.error || "Une erreur est survenue lors de l'envoi.");
        setShakeForm(true);
        setTimeout(() => setShakeForm(false), 500);
      }
    } catch (err) {
      setSubmitError("Impossible de contacter le serveur backend. Vérifiez qu'il est bien démarré.");
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProjectTypeLabel = (type) => {
    switch (type) {
      case 'web': return 'Dév Web';
      case 'mobile': return 'Dév Mobile';
      case 'design': return 'Design UI/UX';
      case 'conseil': return 'Conseil';
      default: return type;
    }
  };

  const getProjectTypeBadgeClass = (type) => {
    switch (type) {
      case 'web': return 'badge-web';
      case 'mobile': return 'badge-mobile';
      case 'design': return 'badge-design';
      case 'conseil': return 'badge-conseil';
      default: return '';
    }
  };

  return (
    <div className="app-container">
      {/* HEADER SECTION & INFOS (LEFT COLUMN + RIGHT FORM GRID) */}
      <div className="grid-two-columns">
        
        {/* Info Column (Left) */}
        <div className="info-section">
          <div className="badge">Projet Full-Stack Avancé</div>
          <div>
            <h1 className="title-glow">Créons quelque chose d'exceptionnel.</h1>
            <p className="subtitle">
              Soumettez votre idée de projet ci-contre. Notre formulaire intelligent valide et transmet vos besoins directement à notre base de données sécurisée.
            </p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h3 className="feature-text-title">Validation en Temps Réel</h3>
                <p className="feature-text-desc">Chaque champ est vérifié instantanément pour offrir une saisie irréprochable.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                  <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
                </svg>
              </div>
              <div>
                <h3 className="feature-text-title">Base de Données Résiliente</h3>
                <p className="feature-text-desc">Stockage automatique sur MongoDB avec un fallback sécurisé sur fichier JSON local si Mongo est hors-ligne.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="3" rx="2"/>
                  <line x1="8" x2="16" y1="21" y2="21"/>
                  <line x1="12" x2="12" y1="17" y2="21"/>
                </svg>
              </div>
              <div>
                <h3 className="feature-text-title">Console Admin Live</h3>
                <p className="feature-text-desc">Consultez et suivez toutes les soumissions directement via notre tableau de bord intégré ci-dessous.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column (Right) */}
        <div className={`glass-card ${shakeForm ? 'shake' : ''}`}>
          {!isSuccess ? (
            <form onSubmit={handleSubmit} noValidate>
              <h2 style={{ marginBottom: '24px', fontSize: '1.6rem', fontWeight: 700 }}>Décrivez votre besoin</h2>
              
              {submitError && (
                <div className="error-message" style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '20px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
                  </svg>
                  <span>{submitError}</span>
                </div>
              )}

              {/* Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="name">Nom Complet *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Aymane Oua"
                  className={`form-control ${errors.name ? 'form-control-error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <span className="error-message">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">Adresse Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@exemple.com"
                  className={`form-control ${errors.email ? 'form-control-error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <span className="error-message">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Project Type */}
              <div className="form-group">
                <label className="form-label" htmlFor="projectType">Type de Projet *</label>
                <select
                  id="projectType"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={isSubmitting}
                >
                  <option value="web">Développement Web (React / Node)</option>
                  <option value="mobile">Développement Mobile (iOS / Android)</option>
                  <option value="design">Design UI/UX (Figma)</option>
                  <option value="conseil">Audit &amp; Conseil Technique</option>
                </select>
              </div>

              {/* Budget (Custom Cards) */}
              <div className="form-group">
                <label className="form-label">Budget Estimé *</label>
                <div className="budget-grid">
                  <div 
                    className={`budget-card ${formData.budget === 'under-1k' ? 'active' : ''}`}
                    onClick={() => !isSubmitting && selectBudget('under-1k')}
                  >
                    <span className="budget-card-title">&lt; 1 000 €</span>
                    <span className="budget-card-desc">Petit projet</span>
                  </div>
                  <div 
                    className={`budget-card ${formData.budget === '1k-5k' ? 'active' : ''}`}
                    onClick={() => !isSubmitting && selectBudget('1k-5k')}
                  >
                    <span className="budget-card-title">1k € - 5k €</span>
                    <span className="budget-card-desc">Standard</span>
                  </div>
                  <div 
                    className={`budget-card ${formData.budget === '5k-10k' ? 'active' : ''}`}
                    onClick={() => !isSubmitting && selectBudget('5k-10k')}
                  >
                    <span className="budget-card-title">5k € - 10k €</span>
                    <span className="budget-card-desc">Pro &amp; Complet</span>
                  </div>
                  <div 
                    className={`budget-card ${formData.budget === 'over-10k' ? 'active' : ''}`}
                    onClick={() => !isSubmitting && selectBudget('over-10k')}
                  >
                    <span className="budget-card-title">10k € +</span>
                    <span className="budget-card-desc">Sur mesure</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="form-group">
                <label className="form-label" htmlFor="message">Description du Projet *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre idée, les fonctionnalités clés, etc."
                  className={`form-control ${errors.message ? 'form-control-error' : ''}`}
                  disabled={isSubmitting}
                  style={{ resize: 'vertical' }}
                />
                {errors.message && (
                  <span className="error-message">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    {errors.message}
                  </span>
                )}
              </div>

              {/* Custom Styled Checkbox */}
              <div 
                className={`checkbox-container ${formData.newsletter ? 'checked' : ''}`}
                onClick={() => !isSubmitting && handleInputChange({ target: { name: 'newsletter', type: 'checkbox', checked: !formData.newsletter } })}
              >
                <div className="checkbox-custom">
                  {formData.newsletter && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  )}
                </div>
                <span>Je souhaite m'abonner à la newsletter pour recevoir des conseils techniques.</span>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isSubmitting}
                style={{ marginTop: '24px' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    <span>Envoyer la proposition</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            // Success State
            <div className="success-state">
              <div className="success-icon-wrapper">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Merci beaucoup !</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '350px' }}>
                Votre proposition de projet a été enregistrée avec succès dans notre base de données.
              </p>
              <button 
                onClick={() => setIsSuccess(false)} 
                className="btn-outline"
                style={{ marginTop: '10px' }}
              >
                Envoyer une autre demande
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DASHBOARD COMPONENT (BOTTOM VIEW) */}
      <div className="dashboard-section">
        <div 
          className="dashboard-toggle" 
          onClick={() => {
            setShowDashboard(!showDashboard);
            if(!showDashboard) fetchSubmissions();
          }}
        >
          <div className="dashboard-toggle-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-color)' }}>
              <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
            </svg>
            <span>Console Administrateur (Base de données en temps réel)</span>
            <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-secondary)' }}>
              {submissions.length} soumission(s)
            </span>
          </div>
          <svg 
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ 
              transition: 'transform 0.3s ease',
              transform: showDashboard ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>

        {showDashboard && (
          <div className="dashboard-content">
            <div className="table-wrapper">
              {isLoadingDashboard ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  <div className="spinner" style={{ margin: '0 auto 10px auto', borderTopColor: 'var(--accent-color)' }}></div>
                  Chargement de la base de données...
                </div>
              ) : submissions.length === 0 ? (
                <div className="empty-state">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '10px', opacity: 0.5 }}>
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <p>Aucune proposition de projet enregistrée pour le moment.</p>
                </div>
              ) : (
                <table className="submissions-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Projet</th>
                      <th>Budget</th>
                      <th>Description</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub, i) => (
                      <tr key={sub._id || sub.id || i}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sub.name}</td>
                        <td>{sub.email}</td>
                        <td>
                          <span className={`badge-project ${getProjectTypeBadgeClass(sub.projectType)}`}>
                            {getProjectTypeLabel(sub.projectType)}
                          </span>
                        </td>
                        <td>
                          <span className="badge-budget">
                            {sub.budget === 'under-1k' && '< 1 000 €'}
                            {sub.budget === '1k-5k' && '1k € - 5k €'}
                            {sub.budget === '5k-10k' && '5k € - 10k €'}
                            {sub.budget === 'over-10k' && '10k € +'}
                          </span>
                        </td>
                        <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={sub.message}>
                          {sub.message}
                        </td>
                        <td className="date-text">
                          {new Date(sub.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

