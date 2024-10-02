import { FC, ReactElement } from "react";
import { IProfileTabsProps } from "src/features/seller/interfaces/seller.interface";
import Dropdown from "src/shared/dropdown/DropDown";

const ProfileTabs: FC<IProfileTabsProps> = ({
  type,
  setType,
}): ReactElement => {
  return (
    <>
      <div className="sm:hidden bg-white border-grey">
        <Dropdown
          text={type}
          setValue={setType}
          maxHeight="300"
          values={["Overview", "Active Gigs", "Ratings & Reviews"]}
        />
      </div>
      <ul className="hidden divide-x divide-gray-200 text-center text-sm font-medium text-gray-500 shadow dark:text-gray-400 sm:flex">
        <li className="w-full">
          <div
            onClick={() => {
              if (setType) setType("Overview");
            }}
            className={`${type === "Overview" ? "bg-green-200 hover:bg-green-300" : "bg-white hover:bg-slate-300"} transition duration-150 inline-block w-full p-4 text-gray-600 hover:text-gray-700 focus:outline-none`}
          >
            Overview
          </div>
        </li>
        <li className="w-full">
          <div
            onClick={() => {
              if (setType) setType("Active Gigs");
            }}
            className={`${type === "Active Gigs" ? "bg-green-200 hover:bg-green-300" : "bg-white hover:bg-slate-50"} transition duration-150 inline-block w-full p-4 text-gray-600 hover:text-gray-700 focus:outline-none`}
          >
            Active Gigs
          </div>
        </li>
        <li className="w-full">
        <div
            onClick={() => {
              if (setType) setType("Ratings & Reviews");
            }}
            className={`${type === "Ratings & Reviews" ? "bg-green-200 hover:bg-green-300" : "bg-white hover:bg-slate-50"} transition duration-150 inline-block w-full p-4 text-gray-600 hover:text-gray-700 focus:outline-none`}
          >
            Ratings & Reviews
          </div>
        </li>
      </ul>
    </>
  );
};

export default ProfileTabs;
