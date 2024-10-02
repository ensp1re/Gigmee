import { FC, ReactElement, useEffect } from "react";

import Button from "../button/Button";
import {
  IApprovalModalContent,
  IModalProps,
} from "./interfaces/modal.interface";
import ModalBg from "./ModalBg";

const ApprovalModal: FC<IModalProps> = ({
  approvalModalContent,
  hideCancel = false,
  onClick,
  onClose,
}): ReactElement => {
  const { header, body, btnText, btnColor } =
    approvalModalContent as IApprovalModalContent;
  useEffect(() => {
    // Disable scrolling when the modal is open
    document.body.style.overflow = "hidden";

    // Re-enable scrolling when the modal is closed
    return () => {
      document.body.style.overflow = "";
    };
  }, []); // Empty array means this runs only when the modal is mounted/unmounted

  return (
    <ModalBg>
      <div className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center">
        <div className="relative flex flex-col  items-center justify-center bottom-auto left-auto right-auto top-auto max-h-[90vh] max-w-[400px] bg-white p-4 text-[#404145]">
          <div className="border-grey mb-[10px] text-center w-full border-b">
            <h4 className="text-[17px] font-bold">{header}</h4>
          </div>
          <div className="mb-5 text-base">{body}</div>
          <div className="flex justify-end gap-3">
            {!hideCancel && (
              <Button
                className="rounded bg-gray-200 px-6 py-3 text-center text-sm font-bold text-black focus:outline-none md:px-4 md:py-2 md:text-base"
                label="Cancel"
                onClick={onClose}
              />
            )}
            <Button
              className={`${btnColor} rounded px-6 py-3 text-center text-sm font-bold text-white focus:outline-none md:px-4 md:py-2 md:text-base`}
              label={`${btnText}`}
              onClick={onClick}
            />
          </div>
        </div>
      </div>
    </ModalBg>
  );
};

export default ApprovalModal;
