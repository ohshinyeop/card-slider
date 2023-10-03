import React from "react";
import "./App.css";
import Card from "../src/components/Card";

function App() {
  return (
    <div className="App">
      <div className="root">
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          Task
        </div>

        <Card
          width={384}
          height={60}
          colorArr={["red", "orange", "green", "blue"]}
        ></Card>
        <Card width={240} height={120} colorArr={["indigo", "purple"]}></Card>
      </div>
    </div>
  );
}

export default App;
