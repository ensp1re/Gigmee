import { FC, ReactElement } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import {
  IGigPaginateProps,
  ISellerGig,
} from "src/features/gigs/interfaces/gig.interface";
import { v4 as uuidv4 } from "uuid";



const GigPaginate: FC<IGigPaginateProps> = ({
    gigs,
    totalGigs,
    showNumbers,
    itemsPerPage,
    setItemFrom,
    setPaginationType,
    itemOffset,
    setItemOffset,
  }): ReactElement => {
  const paginationCount: number[] = [
    ...Array(Math.ceil((totalGigs as number) / itemsPerPage)).keys(),
  ];

  const handlePageChange = (
    newOffset: number,
    direction: "forward" | "backward",
  ) => {
    setItemOffset(newOffset);
    setPaginationType(direction);

    const firstItem: ISellerGig = gigs[0];
    const lastItem: ISellerGig = gigs[gigs.length - 1];

    if (direction === "forward") {
      setItemFrom(`${lastItem.sortId}`);
    } else {
      setItemFrom(`${firstItem.sortId}`);
    }
  };

  return (
    <div className="flex w-full justify-center">
      <ul className="flex gap-8">
        <div
          className={`cursor-pointer p-3 ${itemOffset > 1 ? "rounded-full border border-green-400" : "cursor-not-allowed text-gray-400"}`}
          onClick={() => {
            if (itemOffset > 1) {
              handlePageChange(itemOffset - 1, "backward");
            }
          }}
        >
          <FaArrowLeft className="flex self-center" />
        </div>

        {showNumbers &&
          paginationCount.map((_, index: number) => (
            <li
              key={uuidv4()}
              className={`cursor-pointer px-3 py-2 ${itemOffset === index + 1 ? "border-b-2 pointer-events-none border-black font-bold text-black" : ""}`}
              onClick={() => {
                handlePageChange(
                  index + 1,
                  itemOffset < index + 1 ? "forward" : "backward",
                );
              }}
            >
              {index + 1}
            </li>
          ))}

        <div
          className={`cursor-pointer p-3 ${itemOffset < paginationCount.length ? "rounded-full border border-green-400" : "cursor-not-allowed text-gray-400"}`}
          onClick={() => {
            if (itemOffset < paginationCount.length) {
              handlePageChange(itemOffset + 1, "forward");
            }
          }}
        >
          <FaArrowRight className="flex self-center" />
        </div>
      </ul>
    </div>
  );
};

export default GigPaginate;
