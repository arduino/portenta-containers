import * as React from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

const SvgInfo = (props: SvgIconProps) => (
  <SvgIcon
    viewBox="0 0 14 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7 14.5a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm0-13a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"
      fill="#95A5A6"
    />
    <path
      d="M7.75 5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM6 11.5a.501.501 0 0 1-.472-.33.5.5 0 0 1-.018-.275l.73-3.285-.465.31a.5.5 0 0 1-.55-.83l1.5-1a.5.5 0 0 1 .56 0 .5.5 0 0 1 .215.52l-.775 3.5 1.06-.53a.5.5 0 1 1 .45.89l-2 1A.502.502 0 0 1 6 11.5Z"
      fill="#95A5A6"
    />
  </SvgIcon>
);

export default SvgInfo;
