import { formatCurrency } from "../../utils/helpers";
import DeleteCartItem from "./DeleteCartItem";

function CartItem({ item }) {
  const { pizzaId, name, quantity, totalPrice } = item;

  return (
    <li className="items-center py-3 sm:flex sm:justify-between">
      <p>
        {quantity}&times; {name}
      </p>
      <div className="flex items-end justify-between sm:items-center sm:gap-6">
        <p className="text-sm font-bold">{formatCurrency(totalPrice)}</p>
        <DeleteCartItem pizzaId={pizzaId} />
      </div>
    </li>
  );
}

export default CartItem;
