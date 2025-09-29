import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const mount = (el) => {
  const root = ReactDOM.createRoot(el);
  root.render(<App />);
};

// Montagem em dev mode (isolado)
const devRoot = document.getElementById("cart-dev-root");
if (devRoot) {
  mount(devRoot);
}

export { mount };
