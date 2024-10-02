import { FC, lazy, LazyExoticComponent, ReactElement, Suspense } from "react";
import { IHeader } from "src/shared/header/interfaces/header.interface";

const Header: LazyExoticComponent<FC<IHeader>> = lazy(
  () => import("src/shared/header/component/Header"),
);

const Hero: LazyExoticComponent<FC> = lazy(
  () => import("src/features/index/Hero")
);

const GigTabs: LazyExoticComponent<FC> = lazy(
  () => import("src/features/index/gig-tabs/GigTabs")
);
const HowItWorks: LazyExoticComponent<FC> = lazy(
  () => import("src/features/index/HowItWorks")
);
const Categories: LazyExoticComponent<FC> = lazy(
  () => import("src/features/index/Categories")
);

const Footer: LazyExoticComponent<FC> = lazy(
  () => import("src/features/index/Footer")
);

export const Index: FC = (): ReactElement => {
  return (
    <div className="flex flex-col">
      <Suspense>
        <Header navClass="navbar peer-checked:navbar-active fixed z-20 w-full border-b border-gray-100 bg-white/90 shadow-2xl shadow-gray-600/5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 dark:shadow-none" />
        <Hero />
        <GigTabs />
        <HowItWorks />
        <Categories />
        <Footer />
      </Suspense>
    </div>
  );
};
