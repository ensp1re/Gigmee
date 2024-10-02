import { FC, ReactElement } from "react";

const Footer: FC = (): ReactElement => {
  const now = new Date();
  return (
    <footer className="w-full flex justify-center items-center m-auto px-6 md:px-12 lg:px-6 dark:bg-gray-800">
      <p className="font-semibold text-gray-400 p-5">
        &copy; {now.getUTCFullYear()} Gigmee. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
