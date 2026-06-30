import { useEffect, useState } from 'react';

const FONT = import.meta.env.PUBLIC_CLOCK_FONT;
const WEIGHT = import.meta.env.PUBLIC_CLOCK_WEIGHT;

const zeroFill = (num: number) => {
  return `00${num}`.slice(-2);
};

export const Clock = () => {
  const [time, setTime] = useState('Loading...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const unit = params.get('unit');
    const delay = params.get('delay');

    const countClock = () => {
      const now = new Date();
      let hour: number = now.getHours();
      let minute: number = now.getMinutes();
      let second: number = now.getSeconds();

      if (unit && delay) {
        const d = Number(delay);

        if (
          (unit === 'hour' && 24 < d) ||
          (unit === 'min' && 60 < d) ||
          (unit === 'sec' && 60 < d)
        ) {
          setTime('Error');
          return;
        }

        switch (unit) {
          case 'hour':
            hour =
              now.getHours() + d < 24
                ? now.getHours() + d
                : now.getHours() + d - 24;
            break;
          case 'min':
            minute =
              now.getMinutes() + d < 60
                ? now.getMinutes() + d
                : (() => {
                    if (Number(hour + 1) < 24) {
                      hour++;
                    } else {
                      hour = 0;
                    }
                    return now.getMinutes() + d - 60;
                  })();
            break;
          case 'sec':
            second =
              now.getSeconds() + d < 60
                ? now.getSeconds() + d
                : (() => {
                    if (minute + 1 < 60) {
                      minute++;
                    } else {
                      minute = 0;
                    }
                    return now.getSeconds() + d - 60;
                  })();
            break;
          default:
            setTime('Error');
            return;
        }
      }

      setTime(zeroFill(hour) + ':' + zeroFill(minute) + ':' + zeroFill(second));
    };

    countClock();
    const intervalId = setInterval(countClock, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="tw-p-10">
      <p
        style={{
          fontSize: '5rem',
          fontWeight: WEIGHT !== '' && WEIGHT !== undefined ? WEIGHT : 'bold',
          fontFamily:
            FONT !== '' && FONT !== undefined
              ? FONT
              : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        }}
      >
        {time}
      </p>
    </div>
  );
};
