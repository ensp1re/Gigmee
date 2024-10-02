import { FC, ReactElement, useState } from "react";
import TopGigsView from "src/shared/gigs/TopGigsView";
import {
  categories,
  replaceSpacesWithDash,
} from "src/shared/utils/utils.service";
import { v4 as uuidv4 } from "uuid";

const GigTabs: FC = (): ReactElement => {
  const [activeTabs, setActiveTabs] = useState(categories()[0]);
  const categoryGigs = [];

  return (
    <div className="relative m-auto mt-8 w-screen px-6 xl:container md:px-12 lg:px-6">
      <div className="mx-auto flex flex-col px-4 py-8 lg:px-6 lg:py-18">
        <div className="flex flex-col text-left">
          <h2 className="mb-3 text-3xl font-bold text-black">
            A brand selection of services
          </h2>
          <h4>
            Choose from a broad selection of services from expert freelancer for
            your next project.
          </h4>
        </div>
        <div className="mt-6">
          <ul className="lg:flex lg:justify-between gap-5 overflow-x-auto scroll-smooth whitespace-nowrap relative inline-block">
            {categories().map((category: string) => {
              return (
                <li
                  onClick={() => {
                    setActiveTabs(category);
                  }}
                  className={`cursor-pointer font-bold py-2 lg:py-0 ${activeTabs === category ? "text-black" : "text-gray-400"}`}
                  key={uuidv4()}
                >
                  {category}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-4 h-full overflow-hidden border px-6 py-6">
          {categoryGigs.length > 0 ? (
            <>
              <a
                href={`/search/categories/${replaceSpacesWithDash(activeTabs)}`}
                className="mt-10 w-[10%] rounded border border-black px-6 py-3 cursor-pointer text-sm font-bold text-black hover:bg-gray-100 focus:outline-none md:px-4 md:py-2 md:text-base text-center"
              >
                Explore
              </a>
              <TopGigsView
                gigs={[]}
                width="w-72"
                type="index"
                title={"Top Gigs"}
              />
            </>
          ) : (
            <div className="flex h-96 items-center justify-center text-lg">
              Information is not available for now. Check in later!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigTabs;
