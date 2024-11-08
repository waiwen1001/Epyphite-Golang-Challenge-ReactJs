import React from 'react';

const AppContainer: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div className="container">
      {children}
    </div>
  );
};

export default AppContainer;