import { FC, ReactElement, useContext, useState } from "react";
import { FaArrowRight, FaRegClock } from "react-icons/fa";
import {
  createSearchParams,
  NavigateFunction,
  useNavigate,
} from "react-router-dom";
import { GigContextType } from "src/features/gigs/context/GigContext";
import { IOffer } from "src/features/order/interfaces/order.interface";
import Button from "src/shared/button/Button";
import ApprovalModal from "src/shared/modals/ApprovalModal";
import { IApprovalModalContent } from "src/shared/modals/interfaces/modal.interface";
import { useAppSelector } from "src/store/store";
import { IReduxState } from "src/store/store.interface";

const GigPackage: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const { gig } = useContext(GigContextType);
  const [approvalModalContent, setApprovalModalContent] =
    useState<IApprovalModalContent>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigate: NavigateFunction = useNavigate();

  const onContinueToCheckout = () => {
    const deliverInDays: number = parseInt(gig.expectedDelivery.split(" ")[0]);
    const newDate: Date = new Date();
    newDate.setDate(newDate.getDate() + deliverInDays);
    const params: IOffer = {
      gigTitle: gig.title,
      description: gig.basicDescription,
      price: gig.price,
      deliveryInDays: deliverInDays,
      oldDeliveryDate: `${newDate}`,
      newDeliveryDate: `${newDate}`,
      accepted: false,
      cancelled: false,
    };
    navigate(
      `/gig/checkout/${gig?.id}?${createSearchParams({ offer: JSON.stringify(params) })}`,
      {
        state: gig,
      },
    );
  };

  return (
    <>
      {showModal && (
        <ApprovalModal
          approvalModalContent={approvalModalContent}
          hideCancel={true}
          onClick={() => setShowModal(false)}
        />
      )}
      <div className="border-grey mb-8 border">
        <div className="flex border-b px-4 py-2">
          <h4 className="font-bold">${gig?.price}</h4>
        </div>
        <ul className="mb-0 list-none px-4 py-2">
          <li className="flex justify-between">
            <div className="ml-15 flex w-full pb-3">
              <div className="text-base font-bold">{gig?.basicTitle}</div>
            </div>
          </li>
          <li className="flex justify-between">
            <div className="ml-15 flex w-full pb-4">
              <div className="text-sm font-normal">{gig?.basicDescription}</div>
            </div>
          </li>
          <li className="flex justify-between">
            <div className="ml-15 flex w-full pb-3">
              <FaRegClock className="flex self-center" />{" "}
              <span className="ml-3 text-sm font-semibold">
                {gig?.expectedDelivery}
              </span>
            </div>
          </li>
          <li className="flex justify-between">
            <div className="ml-15 flex w-full py-1">
              <Button
                onClick={() => {
                  if (authUser && !authUser.emailVerified) {
                    setApprovalModalContent({
                      header: "Email not verified",
                      body: "Please verify your email to continue",
                      btnText: "Cancel",
                      btnColor: "bg-green-500 hover:bg-green-400",
                    });
                    setShowModal(true);
                  } else {
                    onContinueToCheckout();
                  }
                }}
                disabled={authUser?.username === gig?.username}
                className={`text-md flex w-full justify-between rounded bg-green-500 px-8 py-2 font-bold text-white focus:outline-none
                    ${authUser?.username === gig?.username ? "opacity-30 cursor-not-allowed" : "hover:bg-green-400 cursor-pointer"}
                    `}
                label={
                  <>
                    <span className="w-full">Continue</span>
                    <FaArrowRight className="flex self-center" />
                  </>
                }
              />
            </div>
          </li>
        </ul>
      </div>
    </>
  );
};

export default GigPackage;
