import React, { useEffect, useRef, useState } from 'react';

interface Props {
  text: string;
  maxWidth: number;
}

const ExpandableCell: React.FC<Props> = ({ text, maxWidth }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('click', handle);
    return () => document.removeEventListener('click', handle);
  }, [open]);

  const toggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.bottom, left: rect.left });
    }
    setOpen((o) => !o);
  };

  return (
    <>
      <span
        ref={ref}
        className="d-inline-block text-truncate"
        style={{ maxWidth: `${maxWidth}px`, cursor: 'pointer' }}
        onClick={toggle}
      >
        {text}
      </span>
      {open && pos && (
        <div
          className="bg-white border rounded p-2 shadow-sm position-fixed"
          style={{
            top: pos.top,
            left: pos.left,
            zIndex: 1000,
            whiteSpace: 'normal',
            minWidth: `${maxWidth}px`,
            maxWidth: '300px',
          }}
        >
          {text}
        </div>
      )}
    </>
  );
};

export default ExpandableCell;