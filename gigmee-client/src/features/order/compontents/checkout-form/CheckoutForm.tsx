import { FC, FormEvent, ReactElement, useEffect, useState } from "react";
import { ICheckoutProps } from "../../interfaces/order.interface";
import CheckoutFormSkeleton from "./CheckoutFormSkeleton";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import Button from "src/shared/button/Button";
import { FaSpinner } from "react-icons/fa";
import {
  Stripe,
  StripeElements,
  StripePaymentElement,
} from "@stripe/stripe-js";
import { createSearchParams } from "react-router-dom";
import "./CheckoutForm.scss";

const CLIENT_ENDPOINT = import.meta.env.VITE_CLIENT_ENDPOINT as string;

const CheckoutForm: FC<ICheckoutProps> = ({ gigId, offer }): ReactElement => {
  const [isStripeLoading, setIsStripeLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const stripe: Stripe | null = useStripe();
  const elements: StripeElements | null = useElements();

  useEffect(() => {
    if (elements) {
      const element = elements.getElement(
        PaymentElement,
      ) as StripePaymentElement;
      if (element) {
        setIsStripeLoading(false);
      }
    }
  }, [elements]);

  useEffect(() => {
    if (!stripe) return;
    const clientSecret: string = new URLSearchParams(
      window.location.search,
    ).get("payment_intent_client_secret") as string;
    if (!clientSecret) return;
    stripe.retrievePaymentIntent(clientSecret).then((result) => {
      switch (result.paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded");
          break;
        case "processing":
          setMessage("Payment processing");
          break;
        case "requires_payment_method":
          setMessage("Payment failed");
          break;
        default:
          setMessage("Payment failed");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${CLIENT_ENDPOINT}/gig/order/requirement/${gigId}?${createSearchParams(
          {
            offer: JSON.stringify(offer),
            order_date: `${new Date()}`,
          },
        ).toString()}`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message as string);
      setIsLoading(false);
    } else {
      setMessage("Something went wrong. Please try again later.");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} id="payment-form">
      {isStripeLoading && <CheckoutFormSkeleton />}
      <PaymentElement
        id="payment-element"
        onReady={() => setIsStripeLoading(false)}
      />
      <Button
        id="submit"
        className={`
                ${isLoading || !stripe || !elements ? "bg-green-200 mt-2 text-white font-semibold cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}
                w-full rounded px-6 py-3 text-center text-sm font-bold test-white focus:outline-none md:px-4 md:py-2 md:text-base`}
        label={
          <>
            <span className="flex justify-center text-white font-semibold text-center">
              {isLoading ? (
                <FaSpinner className="animate-spin text-2xl" />
              ) : (
                `Pay $${offer?.price}`
              )}
            </span>
          </>
        }
      />
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
};

export default CheckoutForm;
