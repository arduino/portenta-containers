import * as React from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

export const SvgLock = (props: SvgIconProps) => (
  <SvgIcon
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fill="#fff"
      d="M13.5 6.5h-1.25V4a3.75 3.75 0 0 0-7.5 0v2.5H3.5a.625.625 0 0 0-.625.625v8.75a.625.625 0 0 0 .625.625h10a.624.624 0 0 0 .625-.625v-8.75A.625.625 0 0 0 13.5 6.5ZM6 6.5V4a2.5 2.5 0 1 1 5 0v2.5z"
    />
  </SvgIcon>
);
