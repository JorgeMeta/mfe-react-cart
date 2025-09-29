import React, { useState, useEffect } from "react";
import styles from "./cart.module.css";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
          if (!product)
            return { ...item, name: "Produto não encontrado", price: 0 };
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

  const updateCartItem = (itemId, newQty) => {
    fetch(`http://localhost:3001/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty: newQty }),
    }).catch((err) => console.log(err));
  };

  const handleIncrease = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
    const item = cart.find((i) => i.id === id);
    if (item) updateCartItem(id, item.qty + 1);
  };

  const handleDecrease = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
      )
    );
    const item = cart.find((i) => i.id === id);
    if (item && item.qty > 1) updateCartItem(id, item.qty - 1);
  };

  const removeItem = (id) => {
    fetch(`http://localhost:3001/cart/${id}`, { method: "DELETE" }).then(() =>
      setCart((prev) => prev.filter((item) => item.id !== id))
    );
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  if (loading) return <p className={styles.emptyMessage}>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>🛒 Meu Carrinho</h1>

      {cart.length === 0 ? (
        <p className={styles.emptyMessage}>Seu carrinho está vazio.</p>
      ) : (
        <>
          <ul className={styles.cartList}>
            {cart.map((item) => (
              <li key={item.id} className={styles.cartItem}>
                <img
                  src={item.img || "https://via.placeholder.com/50"}
                  alt={item.name}
                  className={styles.productImage}
                />
                <span className={styles.productName}>{item.name}</span>

                <div className={styles.qtyControls}>
                  <button
                    onClick={() => handleDecrease(item.id)}
                    className={styles.qtyButton}
                  >
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button
                    onClick={() => handleIncrease(item.id)}
                    className={styles.qtyButton}
                  >
                    +
                  </button>
                </div>

                <span className={styles.price}>R$ {item.price * item.qty}</span>

                <button
                  onClick={() => removeItem(item.id)}
                  className={styles.removeButton}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.totalContainer}>
            <h2 className={styles.totalText}>Total: R$ {total}</h2>
            <button className={styles.checkoutButton}>Finalizar Compra</button>
          </div>
        </>
      )}
    </div>
  );
}
