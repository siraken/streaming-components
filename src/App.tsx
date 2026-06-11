export const App = () => {
  const actions: {
    name: string;
    url: string;
  }[] = [
    {
      name: 'Clock',
      url: '/clock/',
    },
    {
      name: 'Counter',
      url: '/counter/',
    },
    {
      name: 'Speech Recognition',
      url: '/speech-recognition/',
    },
  ];
  return (
    <div>
      <div className="container">
        <div className="grid">
          <h1 className="text-2xl font-bold">Casting Components</h1>
          <div className="flex gap-4">
            {actions.map((action) => (
              <a
                href={action.url}
                key={action.name}
                className="text-blue-500 hover:underline"
              >
                {action.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
