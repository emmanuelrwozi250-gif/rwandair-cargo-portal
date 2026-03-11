import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShipments } from '../context/ShipmentContext';
import { AIRPORTS, CARGO_TYPES, calculateRate } from '../utils/helpers';

const STEPS = ['Route & Cargo', 'Sender & Recipient', 'Review & Confirm'];

const BookShipment = () => {
  const { currentUser } = useAuth();
  const { addShipment } = useShipments();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    originCode: 'KGL',
    destinationCode: '',
    cargoType: 'general',
    weight: '',
    pieces: '1',
    length: '',
    width: '',
    height: '',
    description: '',
    senderName: currentUser.name,
    senderPhone: '',
    senderEmail: currentUser.email,
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    recipientAddress: '',
  });

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validateStep0 = () => {
    const errs = {};
    if (!form.originCode) errs.originCode = 'Select origin airport.';
    if (!form.destinationCode) errs.destinationCode = 'Select destination airport.';
    if (form.originCode === form.destinationCode && form.destinationCode)
      errs.destinationCode = 'Origin and destination must differ.';
    if (!form.weight || parseFloat(form.weight) <= 0) errs.weight = 'Enter a valid weight.';
    if (!form.pieces || parseInt(form.pieces) < 1) errs.pieces = 'Minimum 1 piece.';
    return errs;
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.senderName.trim()) errs.senderName = 'Required.';
    if (!form.senderPhone.trim()) errs.senderPhone = 'Required.';
    if (!form.senderEmail.trim()) errs.senderEmail = 'Required.';
    if (!form.recipientName.trim()) errs.recipientName = 'Required.';
    if (!form.recipientPhone.trim()) errs.recipientPhone = 'Required.';
    if (!form.recipientEmail.trim()) errs.recipientEmail = 'Required.';
    return errs;
  };

  const handleNext = () => {
    const errs = step === 0 ? validateStep0() : step === 1 ? validateStep1() : {};
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep((s) => s + 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = () => {
    const origin = AIRPORTS.find((a) => a.code === form.originCode);
    const destination = AIRPORTS.find((a) => a.code === form.destinationCode);
    const shipment = addShipment(
      {
        ...form,
        originCity: origin.city,
        originCountry: origin.country,
        destinationCity: destination.city,
        destinationCountry: destination.country,
      },
      currentUser.id
    );
    navigate(`/shipments/${shipment.awb}`);
  };

  const estimatedRate = form.originCode && form.destinationCode && form.weight
    ? calculateRate(form.originCode, form.destinationCode, form.weight, form.cargoType)
    : null;

  const origin = AIRPORTS.find((a) => a.code === form.originCode);
  const destination = AIRPORTS.find((a) => a.code === form.destinationCode);
  const cargoTypeFull = CARGO_TYPES.find((c) => c.value === form.cargoType);

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Book a Shipment</h1>
          <p className="page-subtitle">
            Submit your cargo booking. Minimum booking: 96h before flight.
          </p>
        </div>
      </div>

      {/* Step Indicators */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
        {STEPS.map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? '1' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i < step ? 'var(--success)' : i === step ? 'var(--primary)' : 'var(--border)',
                color: i <= step ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 13, fontWeight: i === step ? 700 : 500,
                color: i === step ? 'var(--primary)' : i < step ? 'var(--success)' : 'var(--text-muted)',
              }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < step ? 'var(--success)' : 'var(--border)', margin: '0 12px' }} />
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          {/* ---- Step 0: Route & Cargo ---- */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-section">
                <div className="form-section-title">✈ Route</div>
                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label className="label-required">Origin Airport</label>
                    <select value={form.originCode} onChange={(e) => set('originCode', e.target.value)}>
                      <option value="">— Select origin —</option>
                      {AIRPORTS.map((a) => (
                        <option key={a.code} value={a.code}>
                          {a.code} – {a.city}, {a.country}
                        </option>
                      ))}
                    </select>
                    {errors.originCode && <span className="form-error">{errors.originCode}</span>}
                  </div>
                  <div className="form-group">
                    <label className="label-required">Destination Airport</label>
                    <select value={form.destinationCode} onChange={(e) => set('destinationCode', e.target.value)}>
                      <option value="">— Select destination —</option>
                      {AIRPORTS.map((a) => (
                        <option key={a.code} value={a.code}>
                          {a.code} – {a.city}, {a.country}
                        </option>
                      ))}
                    </select>
                    {errors.destinationCode && <span className="form-error">{errors.destinationCode}</span>}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">📦 Cargo Details</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="label-required">Cargo Type</label>
                    <select value={form.cargoType} onChange={(e) => set('cargoType', e.target.value)}>
                      {CARGO_TYPES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <label className="label-required">Total Weight (kg)</label>
                      <input
                        type="number"
                        value={form.weight}
                        onChange={(e) => set('weight', e.target.value)}
                        placeholder="e.g. 50"
                        min="0.1"
                        step="0.1"
                      />
                      {errors.weight && <span className="form-error">{errors.weight}</span>}
                    </div>
                    <div className="form-group">
                      <label className="label-required">Number of Pieces</label>
                      <input
                        type="number"
                        value={form.pieces}
                        onChange={(e) => set('pieces', e.target.value)}
                        placeholder="e.g. 3"
                        min="1"
                      />
                      {errors.pieces && <span className="form-error">{errors.pieces}</span>}
                    </div>
                  </div>

                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label>Length (cm)</label>
                      <input type="number" value={form.length} onChange={(e) => set('length', e.target.value)} placeholder="cm" min="0" />
                    </div>
                    <div className="form-group">
                      <label>Width (cm)</label>
                      <input type="number" value={form.width} onChange={(e) => set('width', e.target.value)} placeholder="cm" min="0" />
                    </div>
                    <div className="form-group">
                      <label>Height (cm)</label>
                      <input type="number" value={form.height} onChange={(e) => set('height', e.target.value)} placeholder="cm" min="0" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      placeholder="Brief description of cargo contents…"
                    />
                  </div>
                </div>
              </div>

              {estimatedRate !== null && (
                <div className="alert alert-info">
                  <strong>Estimated rate:</strong> USD {estimatedRate.toFixed(2)} — includes fuel surcharge & security. Final price confirmed at booking.
                </div>
              )}
            </div>
          )}

          {/* ---- Step 1: Sender & Recipient ---- */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-section">
                <div className="form-section-title">👤 Sender Details</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="label-required">Full Name</label>
                    <input type="text" value={form.senderName} onChange={(e) => set('senderName', e.target.value)} />
                    {errors.senderName && <span className="form-error">{errors.senderName}</span>}
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <label className="label-required">Phone</label>
                      <input type="tel" value={form.senderPhone} onChange={(e) => set('senderPhone', e.target.value)} placeholder="+250 700 000 000" />
                      {errors.senderPhone && <span className="form-error">{errors.senderPhone}</span>}
                    </div>
                    <div className="form-group">
                      <label className="label-required">Email</label>
                      <input type="email" value={form.senderEmail} onChange={(e) => set('senderEmail', e.target.value)} />
                      {errors.senderEmail && <span className="form-error">{errors.senderEmail}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">📬 Recipient Details</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="label-required">Full Name</label>
                    <input type="text" value={form.recipientName} onChange={(e) => set('recipientName', e.target.value)} />
                    {errors.recipientName && <span className="form-error">{errors.recipientName}</span>}
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <label className="label-required">Phone</label>
                      <input type="tel" value={form.recipientPhone} onChange={(e) => set('recipientPhone', e.target.value)} placeholder="+44 7000 000000" />
                      {errors.recipientPhone && <span className="form-error">{errors.recipientPhone}</span>}
                    </div>
                    <div className="form-group">
                      <label className="label-required">Email</label>
                      <input type="email" value={form.recipientEmail} onChange={(e) => set('recipientEmail', e.target.value)} />
                      {errors.recipientEmail && <span className="form-error">{errors.recipientEmail}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Delivery Address</label>
                    <textarea value={form.recipientAddress} onChange={(e) => set('recipientAddress', e.target.value)} placeholder="Street, City, Country (optional)" style={{ minHeight: 60 }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---- Step 2: Review ---- */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="alert alert-warning">
                Please review all details carefully before confirming. Booking cannot be modified after submission.
              </div>

              <div className="form-section">
                <div className="form-section-title">✈ Route</div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Origin</span>
                    <span className="detail-value">{origin?.code} — {origin?.city}, {origin?.country}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Destination</span>
                    <span className="detail-value">{destination?.code} — {destination?.city}, {destination?.country}</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">📦 Cargo</div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Type</span>
                    <span className="detail-value">{cargoTypeFull?.label}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Weight</span>
                    <span className="detail-value">{form.weight} kg</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pieces</span>
                    <span className="detail-value">{form.pieces}</span>
                  </div>
                  {form.length && (
                    <div className="detail-item">
                      <span className="detail-label">Dimensions (L×W×H)</span>
                      <span className="detail-value">{form.length} × {form.width} × {form.height} cm</span>
                    </div>
                  )}
                  {form.description && (
                    <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="detail-label">Description</span>
                      <span className="detail-value">{form.description}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">👤 Sender → Recipient</div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Sender</span>
                    <span className="detail-value">{form.senderName}</span>
                    <span className="detail-value text-muted text-sm">{form.senderPhone} · {form.senderEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Recipient</span>
                    <span className="detail-value">{form.recipientName}</span>
                    <span className="detail-value text-muted text-sm">{form.recipientPhone} · {form.recipientEmail}</span>
                  </div>
                </div>
              </div>

              {estimatedRate !== null && (
                <div style={{ background: '#EBF0F9', padding: '16px 20px', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Estimated Total</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)' }}>USD {estimatedRate.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 0 }}>
          {step > 0 ? (
            <button className="btn btn-outline-dark" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </button>
          ) : (
            <div />
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn btn-secondary" onClick={handleNext}>
              Continue →
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
              Confirm Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookShipment;
