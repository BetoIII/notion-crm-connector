"use client";

import { Building2, Home, Sparkles, TrendingUp } from "lucide-react";
import { SchemaType } from "@/hooks/use-schema";

interface SchemaTypeSelectorProps {
  selected: SchemaType;
  onChange: (type: SchemaType) => void;
}

export function SchemaTypeSelector({ selected, onChange }: SchemaTypeSelectorProps) {
  return (
    <div className="schema-selector-container">
      <div className="schema-selector-header">
        <div className="header-content">
          <Sparkles className="header-icon" size={18} strokeWidth={2} />
          <h2 className="header-title">Select Schema Type</h2>
        </div>
        <div className="header-subtitle">Choose the CRM structure that fits your business</div>
      </div>

      <div className="schema-cards">
        {/* Standard CRM Option */}
        <button
          onClick={() => onChange("standard")}
          className={`schema-card ${selected === "standard" ? "selected" : ""}`}
          aria-pressed={selected === "standard"}
        >
          <div className="card-glow" />

          <div className="card-header">
            <div className="card-icon-wrapper">
              <Building2 className="card-icon" size={32} strokeWidth={2} />
            </div>
            <div className="card-badge">
              <TrendingUp size={12} strokeWidth={2.5} />
              <span>Popular</span>
            </div>
          </div>

          <div className="card-content">
            <h3 className="card-title">Standard CRM</h3>
            <p className="card-description">
              Accounts, Contacts & Opportunities
            </p>
          </div>

          {selected === "standard" && (
            <div className="selected-checkmark">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" fill="#0F172A" stroke="#0F172A" strokeWidth="2"/>
                <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </button>

        {/* Real Estate CRM Option */}
        <button
          onClick={() => onChange("real-estate")}
          className={`schema-card real-estate ${selected === "real-estate" ? "selected" : ""}`}
          aria-pressed={selected === "real-estate"}
        >
          <div className="card-glow" />

          <div className="card-header">
            <div className="card-icon-wrapper">
              <Home className="card-icon" size={32} strokeWidth={2} />
            </div>
            <div className="card-badge specialized">
              <Sparkles size={12} strokeWidth={2.5} />
              <span>Specialized</span>
            </div>
          </div>

          <div className="card-content">
            <h3 className="card-title">Real Estate CRM</h3>
            <p className="card-description">
              Properties, Contacts & Opportunities
            </p>
          </div>

          {selected === "real-estate" && (
            <div className="selected-checkmark">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" fill="#0F172A" stroke="#0F172A" strokeWidth="2"/>
                <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </button>
      </div>

      <style jsx>{`
        .schema-selector-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 0.5rem;
        }

        .schema-selector-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .header-icon {
          color: #F59E0B;
          animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1) rotate(10deg);
          }
        }

        .header-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.02em;
        }

        .header-subtitle {
          font-size: 0.875rem;
          color: #64748B;
          padding-left: 1.875rem;
        }

        .schema-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }

        .schema-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 2rem;
          background: #FFFFFF;
          border: 2px solid #E2E8F0;
          border-radius: 1.25rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          text-align: left;
        }

        .card-glow {
          position: absolute;
          inset: -50%;
          background: radial-gradient(
            circle at center,
            rgba(59, 130, 246, 0.15) 0%,
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .schema-card.real-estate .card-glow {
          background: radial-gradient(
            circle at center,
            rgba(245, 158, 11, 0.15) 0%,
            transparent 70%
          );
        }

        .schema-card:hover {
          border-color: #CBD5E1;
          transform: translateY(-4px);
          box-shadow:
            0 12px 24px -8px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(0, 0, 0, 0.02);
        }

        .schema-card:hover .card-glow {
          opacity: 1;
        }

        .schema-card.selected {
          border-color: #0F172A;
          background: linear-gradient(
            135deg,
            #FFFFFF 0%,
            #F8FAFC 100%
          );
          box-shadow:
            0 0 0 3px #0F172A,
            0 16px 32px -8px rgba(15, 23, 42, 0.2);
          transform: translateY(-2px);
        }

        .schema-card.selected .card-glow {
          opacity: 0.6;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .card-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-icon {
          color: #3B82F6;
          transition: all 0.3s ease;
        }

        .schema-card.real-estate .card-icon {
          color: #F59E0B;
        }

        .schema-card:hover .card-icon {
          transform: scale(1.05);
        }

        .schema-card.selected .card-icon {
          color: #0F172A;
          transform: scale(1.1);
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.02em;
          transition: color 0.3s ease;
        }

        .card-description {
          font-size: 0.875rem;
          color: #64748B;
          line-height: 1.5;
          margin-top: 0.25rem;
        }

        .card-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          background: #EFF6FF;
          border: 1px solid #DBEAFE;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #3B82F6;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .card-badge.specialized {
          background: #FFFBEB;
          border-color: #FEF3C7;
          color: #F59E0B;
        }

        .selected-checkmark {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          animation: checkmarkAppear 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes checkmarkAppear {
          from {
            opacity: 0;
            transform: scale(0.5) rotate(-12deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .schema-cards {
            grid-template-columns: 1fr;
          }

          .schema-card {
            padding: 1.5rem;
          }
        }

        /* Focus states for accessibility */
        .schema-card:focus-visible {
          outline: 3px solid #0F172A;
          outline-offset: 3px;
        }
      `}</style>
    </div>
  );
}
