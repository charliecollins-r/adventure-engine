import { useEffect, useRef, type CSSProperties } from 'react';

interface MessagePanelProps {
  messages: string[];
  ambientText?: string;
  onDismiss: () => void;
}

const styles: Record<string, CSSProperties> = {
  panel: {
    minHeight: '60px',
    maxHeight: '120px',
    overflowY: 'auto',
    padding: '10px 16px',
    backgroundColor: '#0d0d0a',
    borderTop: '1px solid #2a2018',
    cursor: 'pointer',
  },
  ambient: {
    fontSize: '14px',
    fontFamily: '"Georgia", serif',
    color: '#5a4a30',
    fontStyle: 'italic',
    lineHeight: '1.5',
  },
  message: {
    fontSize: '14px',
    fontFamily: '"Georgia", serif',
    color: '#e0d0a0',
    lineHeight: '1.6',
    marginBottom: '6px',
  },
  hint: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#3a3020',
    textAlign: 'right',
    marginTop: '4px',
  },
};

export function MessagePanel({ messages, ambientText, onDismiss }: MessagePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current && messages.length > 0) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <div
      ref={panelRef}
      style={styles.panel}
      onClick={hasMessages ? onDismiss : undefined}
      title={hasMessages ? 'Click to dismiss' : undefined}
    >
      {hasMessages ? (
        <>
          {messages.map((msg, i) => (
            <p key={i} style={styles.message}>
              {msg}
            </p>
          ))}
          <div style={styles.hint}>click to dismiss</div>
        </>
      ) : (
        ambientText && <p style={styles.ambient}>{ambientText}</p>
      )}
    </div>
  );
}
