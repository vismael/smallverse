import { Physics } from '@react-three/cannon';
import { Ground } from './components/Ground';
import { Player } from './components/Player';
import { Players } from './components/Players';
import { useSphere } from '@react-three/cannon';
import { io } from 'socket.io-client';
import { useState, useEffect, useLayoutEffect } from 'react';
import { EnvironmentWrapper } from './components/EnvironmentWrapper';

import { SphereTest } from './components/items/SphereTest';

const ObjectsWrapper = ({ children }) => {
  const [playerPosition, setPlayerPosition] = useState([10, 0.5, 0]);
  const [lastPosition, setLastPosition] = useState([0, 0, 0]);
  const [clients, setClients] = useState({});

  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    args: [1],
    position: playerPosition,
  }));

  const [socketClient, setSocketClient] = useState(null);

  // connect socket
  useEffect(() => {
    const socket = io('http://localhost:4000');
    setSocketClient(socket);

    socket.on('move', (clients) => {
        setClients(clients);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  
  // emit position
  useEffect(() => {

    if (socketClient) {
      socketClient.emit('move', { id: socketClient.id, position: playerPosition });
      setLastPosition(playerPosition);
    }
  }, [playerPosition]);

  return (
    <>
      <SphereTest />
      <Player innerRef={ref} api={api} setPlayerPosition={setPlayerPosition} />
      <Players socketClient={socketClient} clients={clients} />
      {children}
    </>
  );
};

function App() {
  return (
    <>
      <EnvironmentWrapper>
        <Physics>
          <ObjectsWrapper></ObjectsWrapper>
          <Ground />
        </Physics>
      </EnvironmentWrapper>
      <div className="pointer">+</div>
    </>
  );
}

export default App;
