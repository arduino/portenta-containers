import * as React from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

const SvgEthernet = (props: SvgIconProps) => (
  <SvgIcon
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M28.71 1.29a.999.999 0 0 0-1.42 0l-6.36 6.36a5.26 5.26 0 0 0-6.64.64L12 10.58l-.29-.29a1.004 1.004 0 0 0-1.42 1.42l.29.29-2.29 2.29a5.26 5.26 0 0 0-.64 6.64l-6.36 6.36a1 1 0 0 0 0 1.42.998.998 0 0 0 1.42 0l6.36-6.36a5.27 5.27 0 0 0 6.64-.64L18 19.42l.29.29a.998.998 0 0 0 1.42 0 .997.997 0 0 0 .219-1.095.998.998 0 0 0-.22-.325l-.29-.29 2.29-2.29a5.26 5.26 0 0 0 .64-6.64l6.36-6.36a.998.998 0 0 0 0-1.42Zm-14.42 19a3.24 3.24 0 0 1-4.58-4.58L12 13.42 16.58 18l-2.29 2.29Zm6-6L18 16.58 13.41 12l2.29-2.29a3.24 3.24 0 0 1 4.58 4.58h.01Z"
      fill="#fff"
    />
  </SvgIcon>
);

export default SvgEthernet;
