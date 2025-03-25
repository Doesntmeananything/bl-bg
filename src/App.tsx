import { Canvas } from "@react-three/fiber";
import { BalatroBackground } from "./balatro-background";

function App() {
    return (
        <Canvas style={{ height: "100vh" }}>
            <BalatroBackground />
        </Canvas>
    );
}

export default App;
