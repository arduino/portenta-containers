import * as React from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

export const SvgMinus = (props: SvgIconProps) => (
  <SvgIcon
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 13 14"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12.75 7a.627.627 0 0 1-.625.625H.875a.625.625 0 0 1 0-1.25h11.25A.627.627 0 0 1 12.75 7Z"
    />
  </SvgIcon>
);
