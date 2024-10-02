import parse from "html-react-parser";
import { FC, ReactElement } from "react";

import { IHtmlParserProps } from "src/shared/shared.interface";

const HtmlParser: FC<IHtmlParserProps> = ({ input }): ReactElement => {
  return <>{parse(input)}</>;
};

export default HtmlParser;
