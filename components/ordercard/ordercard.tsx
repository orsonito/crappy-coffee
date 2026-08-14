"use client";

import React from "react";
import "./ordercard.css";
import { OrderCardProps } from "./ordercard.types";
import { useOrderCard } from "./ordercard.hooks";

const OrderCard = ({ name, price }: OrderCardProps) => {
  const { selected, setSelected } = useOrderCard();

  return (
    <div className="ordercard">
      <button type="button" onClick={() => setSelected(!selected)}>
        {name} — {price.toFixed(2)} €
      </button>
    </div>
  );
};

export default OrderCard;
