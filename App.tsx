import React, { useRef } from 'react';
import { View, StyleSheet, Text, PanResponder } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import * as THREE from 'three';

const globalState = {
  moveX: 0,
  moveZ: 0,
};

function GameScene() {
  const playerRef = useRef<THREE.Mesh>(null!);
  const zoneRef = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();
  const speed = 6;

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    if (globalState.moveX !== 0 || globalState.moveZ !== 0) {
      playerRef.current.position.x += globalState.moveX * speed * delta;
      playerRef.current.position.z += globalState.moveZ * speed * delta;

      const angle = Math.atan2(globalState.moveX, globalState.moveZ);
      playerRef.current.rotation.y = angle;
    }

    const camOffset = new THREE.Vector3(0, 6, 10);
    const targetCamPos = playerRef.current.position.clone().add(camOffset);
    
    camera.position.lerp(targetCamPos, 0.1);
    camera.lookAt(playerRef.current.position);

    if (zoneRef.current && zoneRef.current.scale.x > 0.05) {
      zoneRef.current.scale.x -= delta * 0.02;
      zoneRef.current.scale.z -= delta * 0.02;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#5c8a3c" />
      </mesh>

      <mesh ref={zoneRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[48, 50, 64]} />
        <meshBasicMaterial color="red" side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>

      <mesh ref={playerRef} position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#007bff" />
      </mesh>
    </>
  );
}

export default function App() {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const x = gestureState.dx / 50;
        const y = gestureState.dy / 50;
        
        globalState.moveX = Math.max(-1, Math.min(1, x));
        globalState.moveZ = Math.max(-1, Math.min(1, y));
      },
      onPanResponderRelease: () => {
        globalState.moveX = 0;
        globalState.moveZ = 0;
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Canvas shadows camera={{ position: [0, 6, 10], fov: 60 }}>
        <GameScene />
      </Canvas>

      <View style={styles.uiTop}>
        <Text style={styles.uiText}>المتبقي: 100 لاعب</Text>
        <Text style={styles.uiText}>الزون ينكمش!</Text>
      </View>

      <View 
        style={styles.joystickArea} 
        {...panResponder.panHandlers}
      >
        <View style={styles.joystickBase}>
          <Text style={styles.joystickText}>اسحب هنا للحركة</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  uiTop: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
  },
  uiText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 5,
  },
  joystickArea: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  joystickBase: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickText: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  }
});