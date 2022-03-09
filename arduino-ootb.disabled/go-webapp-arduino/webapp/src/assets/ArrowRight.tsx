import * as React from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

export const SvgArrowRight = (props: SvgIconProps) => (
  <SvgIcon
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fill="currentColor"
      d="m14.819 8.443-5.625 5.625a.624.624 0 0 1-.888 0 .625.625 0 0 1 0-.887l4.563-4.557H.625a.625.625 0 0 1 0-1.25h12.244L8.306 2.818a.628.628 0 1 1 .888-.887l5.625 5.625a.626.626 0 0 1 0 .887z"
    />
  </SvgIcon>
);
