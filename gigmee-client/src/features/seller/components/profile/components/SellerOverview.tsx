import { FC } from "react";
import { SellerContext } from "src/features/seller/context/SellerContext";
import {
  IProfileHeaderProps,
  ISellerDocument,
} from "src/features/seller/interfaces/seller.interface";
import Language from "./overview/language/Language";
import AboutMe from "./overview/aboutme/AboutMe";
import SocialLinks from "./overview/sociallinks/SocialLinks";
import Certifications from "./overview/certifications/Cerifications";
import Description from "./overview/description/Description";
import Experience from "./overview/experience/Experience";
import Education from "./overview/education/Education";
import Skills from "./overview/skills/Skills";

const SellerOverview: FC<IProfileHeaderProps> = ({
  sellerProfile,
  setSellerProfile,
  showEditIcons,
}) => {

 
  return (
    <SellerContext.Provider
      value={{
        showEditIcons,
        setSellerProfile,
        sellerProfile: sellerProfile as ISellerDocument,
      }}
    >
      <div className="w-full py-4 lg:w-1/3">
        <Language />
        <AboutMe />
        <SocialLinks />
        <Certifications />
      </div>

      <div className="w-full pl-4 py-4 lg:w-2/3">
        <Description />
        <Experience />
        <Education />
        <Skills />
      </div>
    </SellerContext.Provider>
  );
};

export default SellerOverview;
