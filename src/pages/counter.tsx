import { Link } from 'react-router';
import { useState } from 'react';
import { RootLayout } from '../ui/layouts/root';
import { Button, Container, Icon } from 'semantic-ui-react';

const FONT = import.meta.env.VITE_COUNTER_FONT;
const WEIGHT = import.meta.env.VITE_COUNTER_WEIGHT;

const Counter = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <RootLayout>
      <Container>
        <div className="tw-p-10">
          <p
            style={{
              fontSize: '5rem',
              fontWeight:
                WEIGHT !== '' && WEIGHT !== undefined ? WEIGHT : 'bold',
              fontFamily:
                FONT !== '' && FONT !== undefined
                  ? FONT
                  : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
            }}
          >
            {count}
            <span>回</span>
          </p>
        </div>
        <div>
          <Button
            primary
            icon
            labelPosition="left"
            onClick={() => setCount((prev) => prev + 1)}
          >
            <Icon name="plus" /> Count Up
          </Button>
          <Button
            primary
            icon
            labelPosition="left"
            onClick={() => setCount((prev) => (prev !== 0 ? prev - 1 : prev))}
          >
            <Icon name="minus" /> Count Down
          </Button>
          <Button
            icon
            labelPosition="left"
            variant="contained"
            as={Link}
            to="/"
          >
            <Icon name="home" /> Home
          </Button>
        </div>
      </Container>
    </RootLayout>
  );
};

export { Counter };
