import { FC, ReactElement, useEffect } from "react";
import { IModalBgProps } from "src/shared/modals/interfaces/modal.interface";

const ModalBg: FC<IModalBgProps> = ({ children }): ReactElement => {
  useEffect(() => {
    // Disable scrolling when the modal is open
    document.body.style.overflow = "hidden";

    // Re-enable scrolling when the modal is closed
    return () => {
      document.body.style.overflow = "";
    };
  }, []); // Empty array means this runs only when the modal is mounted/unmounted

  return (
    <div className="fixed left-0 top-0 right-0 bottom-0 h-screen w-screen z-[1000] overflow-hidden">
      <div className="py-2 z-10 absolute top-0 right-0 left-0 bottom-0 bg-black/[0.65] overflow-auto max-h-full max-w-full">
        {children}
      </div>
    </div>
  );
};

export default ModalBg;
