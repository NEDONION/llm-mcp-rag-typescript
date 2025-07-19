import './index.css';
import { useState, useEffect } from 'react';
import GuestMenu from './GuestMenu';

interface GuestProps {
  content: string;
}
const Guest = (prop: GuestProps) => {
  const { content } = prop;
  const [fadeIn, setFadeIn] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div
      className={`chat-guest ${fadeIn ? 'fade-in' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="chat-guest-text">{content}</div>
      <div style={{ float: 'right', textAlign: 'center', padding: '10px' }}>
        {hover && <GuestMenu content={content}></GuestMenu>}
      </div>
    </div>
  );
};
export default Guest;
