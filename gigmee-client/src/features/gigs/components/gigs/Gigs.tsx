import { find } from "lodash";
import { FC, useEffect, useRef, useState } from "react";
import {
  Location,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import GigCardDisplayItem from "src/shared/gigs/GigCardDisplayItem";
import GigPaginate from "src/shared/gigs/GigPaginate";
import PageMessage from "src/shared/page-message/PageMessage";
import {
  categories,
  getDataFromLocalStorage,
  lowerCase,
  replaceAmpersandAndDashWithSpace,
  replaceDashWithSpaces,
  replaceSpacesWithDash,
  saveToLocalStorage,
} from "src/shared/utils/utils.service";
import { v4 as uuidv4 } from "uuid";
import { IGigsProps, ISellerGig } from "../../interfaces/gig.interface";
import { useSearchGigsQuery } from "../../service/search.service";
import PageLoader from "src/shared/pageloader/PageLoader";
import BudgetDropdown from "./components/BudgetDropdown";
import DeliveryDropdown from "./components/DeliveryDropdown";

const ITEMS_PER_PAGE = 10;

const Gigs: FC<IGigsProps> = ({ type }) => {
  const [itemFrom, setItemFrom] = useState<string>("0");
  const [paginationType, setPaginationType] = useState<string>("forward");
  const [searchParams] = useSearchParams();
  const { category } = useParams<string>();
  const location: Location = useLocation();
  const updatedSearchParams: URLSearchParams = new URLSearchParams(
    searchParams.toString(),
  );
  const queryType: string =
    type === "search"
      ? replaceDashWithSpaces(`${updatedSearchParams}`)
      : `query=${replaceAmpersandAndDashWithSpace(`${lowerCase(`${category}`)}`)}&${lowerCase(updatedSearchParams.toString())}`;
  const { data, isSuccess, isLoading, isError } = useSearchGigsQuery({
    query: `${queryType}`,
    from: itemFrom,
    size: `${ITEMS_PER_PAGE}`,
    type: paginationType,
  });
  const gigs = useRef<ISellerGig[]>([]);
  let totalGigs = 0;
  const filterApplied = getDataFromLocalStorage(
    "filterApplied",
  ) as unknown as boolean;
  const categoryName = find(categories(), (item: string) =>
    location.pathname.includes(
      replaceSpacesWithDash(`${lowerCase(`${item}`)}`),
    ),
  );
  const gigCategories = categoryName ?? searchParams.get("query");
  const [itemOffset, setItemOffset] = useState<number>(1);

  useEffect(() => {
    setItemFrom("0");
    setPaginationType("forward");
    setItemOffset(1);

    return () => {
      setItemFrom("0");
      setPaginationType("forward");
      setItemOffset(1);
    };
  }, [category, searchParams]);

  if (isSuccess) {
    gigs.current = data.gigs as ISellerGig[];
    totalGigs = data.total ?? 0;
    saveToLocalStorage("filterApplied", JSON.stringify(false));
  }

  return (
    <>
      {isLoading && !isSuccess ? (
        <PageLoader />
      ) : (
        <div className="container mx-auto items-center p-5">
          {!isLoading && data && data.gigs && data?.gigs.length > 0 ? (
            <>
              <h3 className="mb-5 flex gap-3 text-4xl">
                {type === "search" && (
                  <span className="text-black">Results for</span>
                )}
                <strong className="text-black">{gigCategories}</strong>
              </h3>
              <div className="mb-4 flex gap-4">
                <BudgetDropdown />
                <DeliveryDropdown />
              </div>
              <div className="my-5">
                <div className="">
                  <span className="font-medium text-[#74767e]">
                    {data.total} services available
                  </span>
                </div>
                {filterApplied ? (
                  <PageLoader />
                ) : (
                  <div className="grid gap-x-6 pt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {data &&
                      data.gigs &&
                      data?.gigs.map((gig: ISellerGig) => (
                        <GigCardDisplayItem
                          key={uuidv4()}
                          gig={gig}
                          linkTarget={true}
                          showEditIcon={false}
                        />
                      ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <PageMessage
              header="No services found"
              body="Please, try again with a different search term!"
            />
          )}
          {isError && (
            <PageMessage
              header="An error occurred"
              body="Please, try again later!"
            />
          )}
          {isSuccess &&
            !filterApplied &&
            data &&
            data.gigs &&
            data.gigs.length > 0 && (
              <GigPaginate
                gigs={gigs.current}
                totalGigs={totalGigs}
                showNumbers={true}
                itemsPerPage={ITEMS_PER_PAGE}
                setItemFrom={setItemFrom}
                setPaginationType={setPaginationType}
                itemOffset={itemOffset}
                setItemOffset={setItemOffset}
              />
            )}
        </div>
      )}
    </>
  );
};

export default Gigs;
