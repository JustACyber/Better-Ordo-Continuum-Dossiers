import React from 'react';

// Input styled like a handwritten imperial record
export const ImperialInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`bg-transparent border-0 border-b border-dashed border-ordo-gold-dim text-right text-gray-200 font-header font-bold text-base px-2 py-0.5 w-full focus:ring-0 focus:border-ordo-gold focus:bg-[rgba(212,175,55,0.05)] transition-all outline-none ${props.className || ''}`}
  />
);

export const ImperialTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`bg-[rgba(0,0,0,0.2)] border border-ordo-gold-dim text-gray-200 font-body text-lg w-full p-2 resize-y min-h-[80px] focus:border-ordo-gold outline-none ${props.className || ''}`}
  />
);

export const StatBox: React.FC<{ label: string; value: number | string; modifier?: string; children?: React.ReactNode }> = ({ label, value, modifier, children }) => (
  <div className="text-center border border-[rgba(212,175,55,0.1)] p-4 transition-colors hover:bg-[rgba(212,175,55,0.05)] hover:border-ordo-gold group">
    <h3 className="text-ordo-gold-dim text-sm uppercase m-0">{label}</h3>
    {children ? children : (
      <>
        <span className="font-header text-3xl text-gray-200 block my-1">{value}</span>
        {modifier && <div className="text-ordo-crimson font-bold">{modifier}</div>}
      </>
    )}
  </div>
);

export const SectionHeader: React.FC<{ title: string; onAdd?: () => void }> = ({ title, onAdd }) => (
  <h2 className="font-header text-gray-200 text-lg mb-4 uppercase tracking-wider border-b-2 border-ordo-crimson inline-block pr-5">
    {title}
    {onAdd && (
      <button 
        onClick={(e) => { e.stopPropagation(); onAdd(); }} 
        className="ml-3 text-sm bg-transparent border border-ordo-gold-dim text-ordo-gold px-2 py-0.5 hover:bg-ordo-gold hover:text-black transition-colors"
      >
        [+]
      </button>
    )}
  </h2>
);

export const DataBlock: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-[rgba(20,16,16,0.6)] border border-ordo-gold-dim p-6 relative shadow-lg hover:-translate-y-0.5 hover:shadow-[0_5px_25px_rgba(212,175,55,0.1)] hover:border-ordo-gold transition-all duration-300 ${className || ''}`}>
    {children}
  </div>
);

export const DeleteBtn: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="bg-transparent border-0 text-ordo-gold-dim font-bold font-header ml-2 hover:text-ordo-crimson transition-colors"
  >
    [x]
  </button>
);
