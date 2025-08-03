import React, { useRef, useState } from 'react';

interface Props {
  text: string;
  maxWidth: number;
}

const ExpandableCell: React.FC<Props> = ({ text, maxWidth }) => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  const handleEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.bottom, left: rect.left });
    }
  };

  const handleLeave = () => setPos(null);

  return (
    <>
      <span
        ref={ref}
        className="d-inline-block text-truncate"
        style={{ maxWidth: `${maxWidth}px` }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        title={text}
      >
        {text}
      </span>
      {pos && (
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