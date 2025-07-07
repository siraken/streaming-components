import { useState } from 'react';
import { useParams } from 'react-router';
import { RootLayout } from '../ui/layouts/root';

const FONT = import.meta.env.VITE_CLOCK_FONT;
const WEIGHT = import.meta.env.VITE_CLOCK_WEIGHT;

export const Clock = () => {
  const [time, setTime] = useState<string | null>('Loading...');

  const { unit, delay } = useParams();

  const zeroFill = (num: number) => {
    return `00${num}`.slice(-2);
  };

  const countClock = () => {
    const now = new Date();
    let hour: number = now.getHours();
    let minute: number = now.getMinutes();
    let second: number = now.getSeconds();

    if (unit && delay) {
      // convert to number
      const d = Number(delay);

      // return error if given args are:
      // hour < 24 | minute < 60 | second < 60
      if (
        (unit === 'hour' && 24 < d) ||
        (unit === 'min' && 60 < d) ||
        (unit === 'sec' && 60 < d)
      ) {
        setTime('Error');
        return false;
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
          break;
      }
    }

    setTime(zeroFill(hour) + ':' + zeroFill(minute) + ':' + zeroFill(second));
  };

  setInterval(countClock, 1000);

  return (
    <RootLayout>
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
    </RootLayout>
  );
};
