import { ChangeEvent, FC, ReactElement, useRef, useState } from "react";
import {
  NavigateFunction,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ISellerGig } from "src/features/gigs/interfaces/gig.interface";
import Button from "src/shared/button/Button";
import TextAreaInput from "src/shared/inputs/TextAreaInput";
import { useAppSelector } from "src/store/store";
import { IReduxState } from "src/store/store.interface";
import {
  IOffer,
  IOrderDocument,
  IOrderInvoice,
} from "../../interfaces/order.interface";
import {
  deleteFromLocalStorage,
  generateRandomNumber,
  getDataFromLocalStorage,
  showErrorToast,
  showSuccessToast,
} from "src/shared/utils/utils.service";
import { useGetGigByIdQuery } from "src/features/gigs/service/gigs.service";
import { useCreateOrderMutation } from "../../services/order.service";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { OrderContext } from "../../context/OrderContext";
import Invoice from "../invoice/Invoice";
import { TimeAgo } from "src/shared/utils/timeago.utils";
import { IResponse } from "src/shared/shared.interface";
import { FaSpinner } from "react-icons/fa";

const Requirement: FC = (): ReactElement => {
  const buyer = useAppSelector((state: IReduxState) => state.buyer);
  const [requirement, setRequirement] = useState<string>("");
  const { gigId } = useParams<string>();
  const [searchParams] = useSearchParams({});
  const gigRef = useRef<ISellerGig>();
  const placeholder = "https://placehold.co/330x220?text=Placeholder";
  const offer: IOffer = JSON.parse(searchParams.get("offer") as string);
  const order_date = `${searchParams.get("order_date")}`;
  const serviceFee: number =
    offer.price < 50
      ? (5.5 / 100) * offer.price + 2
      : (5.5 / 100) * offer.price;
  const navigate: NavigateFunction = useNavigate();
  const orderId = `JO${generateRandomNumber(11)}`;
  const invoiceId = `JI${generateRandomNumber(11)}`;
  const { data, isSuccess } = useGetGigByIdQuery(gigId as string);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  if (isSuccess) {
    gigRef.current = data?.gig;
  }

  const orderInvoice: IOrderInvoice = {
    invoiceId,
    orderId,
    date: `${new Date()}`,
    buyerUsername: buyer?.username as string,
    orderService: [
      {
        service: `${gigRef.current?.title}`,
        quantity: 1,
        price: offer.price,
      },
      {
        service: `Service Fee`,
        quantity: 1,
        price: serviceFee,
      },
    ],
  };

  const onSubmitOrder = async (): Promise<void> => {
    try {
      const paymentIntentId = getDataFromLocalStorage("paymentIntentId");
      const order: IOrderDocument = {
        offer: {
          gigTitle: offer.gigTitle,
          price: offer.price,
          description: offer.description,
          deliveryInDays: offer.deliveryInDays,
          oldDeliveryDate: offer.oldDeliveryDate,
          newDeliveryDate: offer.newDeliveryDate,
          accepted: true,
          cancelled: offer.cancelled,
        },
        gigId: `${gigId}`,
        sellerId: `${gigRef?.current?.sellerId}`,
        sellerImage: `${gigRef?.current?.profilePicture}`,
        sellerUsername: `${gigRef?.current?.username}`,
        sellerEmail: `${gigRef?.current?.email}`,
        gigCoverImage: `${gigRef?.current?.coverImage}`,
        gigMainTitle: `${gigRef?.current?.title}`,
        gigBasicTitle: `${gigRef?.current?.basicTitle}`,
        gigBasicDescription: `${gigRef?.current?.basicDescription}`,
        buyerId: `${buyer._id}`,
        buyerUsername: `${buyer.username}`,
        buyerImage: `${buyer.profilePicture}`,
        buyerEmail: `${buyer.email}`,
        status: "in progress",
        orderId,
        invoiceId,
        quantity: 1,
        dateOrdered: `${new Date()}`,
        price: offer.price,
        requirements: requirement,
        paymentIntent: `${paymentIntentId}`,
        events: {
          placeOrder: order_date, // this should be the date after successful payment
          requirements: `${new Date()}`,
          orderStarted: `${new Date()}`,
        },
      };
      const response: IResponse = await createOrder(order).unwrap();
      navigate(`/orders/${orderId}/activities`, { state: response?.order });
      showSuccessToast("Order created successfully");
      deleteFromLocalStorage("paymentIntent");
    } catch (error) {
      console.log(error);
      showErrorToast("Error creating order");
    }
  };

  return (
    <div className="container mx-auto lg:h-screen">
      <div className="flex flex-wrap">
        <div className="order-last w-full p-4 lg:order-first lg:w-2/3">
          <div className="mb-4 flex w-full flex-col flex-wrap bg-[#d4edda] p-4">
            <span className="text-base font-bold text-black lg:text-xl">
              Thank you for your purchase
            </span>
            <div className="flex gap-1">
              You can{" "}
              <PDFDownloadLink
                document={
                  <OrderContext.Provider value={{ orderInvoice }}>
                    <Invoice />
                  </OrderContext.Provider>
                }
              >
                <div className="cursor-pointer text-green-400 underline">
                  download your invoice
                </div>
              </PDFDownloadLink>
            </div>
          </div>
          <div className="border-grey border">
            <div className="mb-3 px-4 pb-2 pt-3">
              <span className="mb-3 text-base font-medium text-black md:text-lg lg:text-xl">
                Any information you would like the seller to know?
              </span>
              <p className="text-sm">Click the button to start the order.</p>
            </div>
            <div className="flex flex-col px-4 pb-4">
              <TextAreaInput
                rows={5}
                name="requirement"
                value={requirement}
                onChange={(e: ChangeEvent) =>
                  setRequirement((e.target as HTMLTextAreaElement).value)
                }
                placeholder="Write a brief description..."
                className="border-grey mb-1 w-full rounded border p-3.5 text-sm font-normal text-gray-600 focus:outline-none"
              />
              <Button
                onClick={onSubmitOrder}
                className="mt-3 rounded bg-green-500 px-6 py-3 text-center text-sm font-bold text-white hover:bg-green-400 focus:outline-none md:px-4 md:py-2 md:text-base"
                label={
                  isLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Create Order"
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="w-full p-4 lg:w-1/3">
          <div className="border-grey mb-8 border">
            <div className="mb-2 flex flex-col border-b md:flex-row">
              <img
                className="w-full object-cover"
                src={gigRef.current?.coverImage || placeholder}
                alt="Gig Cover Image"
              />
            </div>
            <ul className="mb-0 list-none">
              <li className="border-grey flex border-b px-4 pb-3 pt-1">
                <div className="text-sm font-normal">
                  {gigRef.current?.description}
                </div>
              </li>
              <li className="flex justify-between px-4 pb-2 pt-4">
                <div className="flex gap-2 text-sm font-normal">
                  {offer?.title}
                </div>
                <span className="rounded bg-orange-300 px-[5px] py-[2px] text-xs font-bold uppercase text-white">
                  incomplete
                </span>
              </li>
              <li className="flex justify-between px-4 pb-2 pt-2">
                <div className="flex gap-2 text-sm font-normal">Order</div>
                <span className="text-sm">#{orderId}</span>
              </li>
              <li className="flex justify-between px-4 pb-2 pt-2">
                <div className="flex gap-2 text-sm font-normal">Order Date</div>
                <span className="text-sm">
                  {TimeAgo.dayMonthYear(`${new Date()}`)}
                </span>
              </li>
              <li className="flex justify-between px-4 pb-2 pt-2">
                <div className="flex gap-2 text-sm font-normal">Quantity</div>
                <span className="text-sm">X 1</span>
              </li>
              <li className="flex justify-between px-4 pb-4 pt-2">
                <div className="flex gap-2 text-sm font-normal">Price</div>
                <span className="text-sm">${offer.price}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requirement;
