import * as React from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

const SvgOpenInNew = (props: SvgIconProps) => (
  <SvgIcon
    viewBox="0 0 23 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M17.969 6.25v9.344a.719.719 0 1 1-1.438 0V7.989L6.261 18.26a.729.729 0 0 1-1.021 0 .724.724 0 0 1 0-1.02L15.51 6.969H7.907a.719.719 0 0 1 0-1.438h9.344a.721.721 0 0 1 .719.719Z"
      fill="currentColor"
    />
  </SvgIcon>
);

export default SvgOpenInNew;
