export const App = () => {
  const actions: {
    name: string;
    url: string;
  }[] = [
    {
      name: 'Clock',
      url: 'clock',
    },
    {
      name: 'Counter',
      url: 'counter',
    },
  ];
  return (
    <div>
      <div className="tw-grid">
        <h1>Casting Components</h1>
        <div>
          {actions.map((action) => (
            <button type="button" key={action.name}>
              {action.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
