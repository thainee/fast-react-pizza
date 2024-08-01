import { Form, redirect, useActionData, useNavigation } from "react-router-dom";
import { createOrder } from "../../services/apiRestaurant";
import Button from "../../ui/Button";
import EmptyCart from "../cart/EmptyCart";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, getCart, getTotalCartPrice } from "../cart/cartSlice";
import store from "../../store";
import { useState } from "react";
import { formatCurrency } from "../../utils/helpers";
import { fetchAddress } from "../user/userSlice";

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str,
  );

function CreateOrder() {
  const [withPriority, setWithPriority] = useState(false);
  const cart = useSelector(getCart);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isSubmitting = navigation.state === "submitting";
  const formErrors = useActionData();
  const {
    username,
    position,
    address,
    status: addressStatus,
    error: addressError,
  } = useSelector((state) => state.user);
  const isAddressLoading = addressStatus === "loading";
  const totalCartPrice = useSelector(getTotalCartPrice);
  const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
  const totalPrice = Math.round(totalCartPrice + priorityPrice);

  if (!cart.length) return <EmptyCart />;

  return (
    <div className="px-4 py-6">
      <h2 className="mb-6 text-xl font-semibold">Ready to order? Let's go!</h2>

      <Form method="POST">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <div className="grow">
            <input
              type="text"
              name="customer"
              required
              className="input"
              defaultValue={username}
            />
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:mt-[7px] sm:min-w-40 sm:self-start">
            Phone number
          </label>
          <div className="grow">
            <input type="tel" name="phone" required className="input" />
            {formErrors?.phone && (
              <p className="ms-1 mt-3 rounded-lg bg-red-100 p-2 text-sm text-red-700">
                {formErrors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:mt-[7px] sm:min-w-40 sm:self-start">
            Address
          </label>
          <div className="relative grow">
            <input
              type="text"
              name="address"
              required
              className="input"
              defaultValue={address}
              disabled={isAddressLoading}
            />
            {!position.latitude && !position.longitude ? (
              <span className="absolute right-[1.5px] top-[1px] md:right-[5px] md:top-[4.5px]">
                <Button
                  type="small"
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(fetchAddress());
                  }}
                  disabled={isAddressLoading}
                >
                  Get address
                </Button>
              </span>
            ) : null}

            {addressStatus === "failed" && (
              <p className="ms-1 mt-3 rounded-lg bg-red-100 p-2 text-sm text-red-700">
                {addressError}
              </p>
            )}
          </div>
        </div>

        <div className="mb-10 flex items-center gap-4">
          <input
            type="checkbox"
            name="priority"
            id="priority"
            className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-1"
            value={withPriority}
            onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label htmlFor="priority" className="font-medium">
            Want to yo give your order priority?
          </label>
        </div>

        <div>
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />
          {position.latitude && position.longitude ? (
            <input
              type="hidden"
              name="position"
              value={JSON.stringify(position)}
            />
          ) : null}
          <Button disabled={isSubmitting} type="primary">
            {isSubmitting
              ? "Placing order..."
              : `Order now from ${formatCurrency(totalPrice)}`}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const order = {
    ...data,
    priority: data.priority === "true",
    cart: JSON.parse(data.cart),
  };

  if (data.position) {
    order.position = JSON.parse(data.position);
  }

  const errors = {};

  if (!isValidPhone(order.phone)) {
    errors.phone =
      "Please give us your correct phone number. We might need it to contact you.";
  }

  if (Object.keys(errors).length > 0) return errors;

  // If everything is okay, create a new order and redirect
  const newOrder = await createOrder(order);

  // Do NOT overuse
  store.dispatch(clearCart());

  return redirect(`/order/${newOrder.id}`);
}

export default CreateOrder;
