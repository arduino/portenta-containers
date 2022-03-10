import * as React from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

export const SvgChevronRight = (props: SvgIconProps) => (
  <SvgIcon
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fill="currentColor"
      d="M4.5 14.502a1 1 0 0 1-.71-1.71l5.3-5.29-5.3-5.29A1.004 1.004 0 0 1 5.21.792l6 6a1 1 0 0 1 0 1.42l-6 6a1 1 0 0 1-.71.29z"
    />
  </SvgIcon>
);
