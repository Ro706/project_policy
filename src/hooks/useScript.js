import { useState, useEffect } from 'react';

const useScript = (src) => {
  const [status, setStatus] = useState(src ? 'loading' : 'idle');

  useEffect(() => {
    if (!src) {
      setStatus('idle');
      return;
    }

    let script = document.querySelector(`script[src="${src}"]`);

    if (!script) {
      script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.setAttribute('data-status', 'loading');
      document.body.appendChild(script);

      const setStateFromEvent = (event) => {
        script.setAttribute('data-status', event.type === 'load' ? 'ready' : 'error');
        setStatus(event.type === 'load' ? 'ready' : 'error');
      };

      script.addEventListener('load', setStateFromEvent);
      script.addEventListener('error', setStateFromEvent);

      return () => {
        if (script) {
          script.removeEventListener('load', setStateFromEvent);
          script.removeEventListener('error', setStateFromEvent);
        }
      };
    } else {
      setStatus(script.getAttribute('data-status') || 'ready');
    }
  }, [src]);

  return status;
};

export default useScript;
