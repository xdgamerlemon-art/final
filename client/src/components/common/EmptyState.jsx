export default function EmptyState({ title, text, action }) { return <div className="empty-state"><span>✳</span><h3>{title}</h3><p>{text}</p>{action}</div>; }
