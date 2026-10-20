'use client';
import { useEffect, useState } from 'react';
export default function ScrollBar() {
  const [p, setP] = useState(0);
  useEffect(() => { const f = () => setP(scrollY / (document.body.scrollHeight - innerHeight || 1) * 100); f(); addEventListener('scroll', f); return () => removeEventListener('scroll', f); }, []);
  return <div className="sb" style={{ width: p + '%' }} />;
}
