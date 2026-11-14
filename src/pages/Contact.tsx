import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { api } from '../services/api';
import { validateContactForm } from '../utils/travelLogic';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const validation = validateContactForm({ name, email, subject, message });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await api.submitContact({ name, email, subject, message });
      setSuccessMsg(res.message);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setErrorMsg((err as Error).message || 'Could not send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-2xl mb-10">
        <p className="text-xs font-semibold text-[#0F4C5C] mb-2">Contact Us</p>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4">
          Questions About Planning Your India Journey?
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Send suggestions, destination updates, or custom itinerary questions to our travel desk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <h2 className="font-display text-2xl font-bold text-slate-900">Travel Desk Details</h2>

          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#0F4C5C] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900">Plan My Trip India Studio</p>
                <p className="text-slate-600">Connaught Place, New Delhi 110001, India</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#0F4C5C] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900">Email</p>
                <p className="text-slate-600">hello@planmytripindia.in</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#0F4C5C] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900">Support Hours</p>
                <p className="text-slate-600">Monday – Saturday, 9:30 AM – 6:30 PM IST</p>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5"
        >
          <h2 className="font-display text-2xl font-bold text-slate-900">Send a Message</h2>

          {successMsg && (
            <div
              role="status"
              data-testid="contact-success"
              className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-800"
            >
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
              />
              {errors.name && (
                <p className="text-xs text-rose-600 mt-1" data-testid="err-contact-name">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
              />
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1" data-testid="err-contact-email">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subject
            </label>
            <input
              id="contact-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Custom Northeast India itinerary question"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
            />
            {errors.subject && (
              <p className="text-xs text-rose-600 mt-1" data-testid="err-contact-subject">
                {errors.subject}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Message
            </label>
            <textarea
              id="contact-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your travel dates, preferred states, or questions..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F4C5C]"
            />
            {errors.message && (
              <p className="text-xs text-rose-600 mt-1" data-testid="err-contact-message">
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 text-sm font-semibold text-white bg-[#0F4C5C] rounded-lg hover:bg-[#0B3B47] disabled:opacity-60 transition-colors cursor-pointer"
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
