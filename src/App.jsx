import React, { useState, useEffect } from "react";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega produtos e carrinho
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3001/products").then((res) => res.json()),
      fetch("http://localhost:3001/cart").then((res) => res.json()),
    ])
      .then(([productsData, cartData]) => {
        setProducts(productsData);
        const merged = cartData.map((item) => {
          const product = productsData.find(
            (p) => p.id === String(item.productId)
          );
          if (!product) {
            console.warn(`Produto com id ${item.productId} não encontrado`);
            return { ...item, name: "Produto não encontrado", price: 0 };
          }
          return {
            ...item,
            name: product.name,
            price: Number(product.price),
            qty: Number(item.qty),
            img: product.img,
          };
        });
        setCart(merged);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Atualiza quantidade no JSON Server
  const updateCartItem = (itemId, newQty) => {
    fetch(`http://localhost:3001/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty: newQty }),
    }).catch((err) => console.log("Erro ao atualizar item:", err));
  };

  const handleIncrease = (id) => {
    const updatedCart = cart.map((item) => {
      if (item.id === id) {
        const newQty = item.qty + 1;
        updateCartItem(id, newQty);
        return { ...item, qty: newQty };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const handleDecrease = (id) => {
    const updatedCart = cart.map((item) => {
      if (item.id === id && item.qty > 1) {
        const newQty = item.qty - 1;
        updateCartItem(id, newQty);
        return { ...item, qty: newQty };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const removeItem = (id) => {
    fetch(`http://localhost:3001/cart/${id}`, { method: "DELETE" })
      .then(() => setCart(cart.filter((item) => item.id !== id)))
      .catch((err) => console.log(err));
  };

  const total = cart.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.qty),
    0
  );

  if (loading)
    return <p className="text-center text-lg mt-10">Carregando...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">🛒 Meu Carrinho</h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          Seu carrinho está vazio.
        </p>
      ) : (
        <>
          <ul className="space-y-4 max-h-72 overflow-y-auto">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border"
              >
                <img
                  src={item.img || "https://via.placeholder.com/50"}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <span className="flex-1 ml-4">{item.name}</span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDecrease(item.id)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button
                    onClick={() => handleIncrease(item.id)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>

                <span className="ml-4 font-semibold">
                  R$ {item.price * item.qty}
                </span>

                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 text-right">
            <h2 className="text-xl font-bold mb-3">Total: R$ {total}</h2>
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Finalizar Compra
            </button>
          </div>
        </>
      )}
    </div>
  );
}
