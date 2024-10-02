import { FC, ReactElement } from "react";
import { FaSpinner } from "react-icons/fa";

const PageLoader: FC = (): ReactElement => {
  return (
    <div className="bg-white/[0.8] flex justify-center items-center z-50 left-0 top-0 absolute h-full w-full">
      <FaSpinner className="animate-spin h-10 w-10 mr-3 text-green-400"size={40}/>
    </div>
  );
};

export default PageLoader;
